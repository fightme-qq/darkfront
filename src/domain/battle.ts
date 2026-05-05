import {
  runFaintTrigger,
  runKnockOutTrigger,
  runStartOfBattleSteps,
  type BattleSnapshot,
} from "./effects";
import { nextInt } from "./rng";
import { getShopTier } from "./shop";
import type {
  BattlePlayback,
  BattleResult,
  BattleViewUnit,
  UnitBlueprint,
  UnitInstance,
} from "./types";

export function getTeamPower(team: Array<UnitInstance | null>) {
  return team.reduce((total, unit) => {
    if (!unit) {
      return total;
    }

    return total + unit.attack + unit.health + unit.level * 2;
  }, 0);
}

function cloneViewTeam(team: BattleViewUnit[]) {
  return team.map((unit) => ({ ...unit }));
}

function toPlayerViewUnits(team: Array<UnitInstance | null>): BattleViewUnit[] {
  return team
    .filter((unit): unit is UnitInstance => unit !== null)
    .map((unit) => ({
      instanceId: unit.instanceId,
      blueprintId: unit.blueprintId,
      spriteKey: unit.spriteKey,
      attack: unit.attack + unit.temporaryAttack,
      health: unit.health + unit.temporaryHealth,
      tier: unit.tier,
      effects: unit.effects,
    }));
}

function buildEnemyTeam(
  seed: number,
  turn: number,
  blueprints: UnitBlueprint[],
  size: number,
) {
  const tier = getShopTier(turn);
  const pool = blueprints.filter((unit) => unit.tier <= tier);
  const enemy: BattleViewUnit[] = [];
  let currentSeed = seed;
  const statBonus = Math.max(0, Math.floor((turn - 1) / 2));

  for (let index = 0; index < size; index += 1) {
    const fillRoll = nextInt(currentSeed, 100);
    currentSeed = fillRoll.seed;

    const fillThreshold = turn >= 4 ? 100 : 60 + turn * 10;
    if (fillRoll.value >= fillThreshold) {
      continue;
    }

    const pickRoll = nextInt(currentSeed, pool.length);
    currentSeed = pickRoll.seed;
    const picked = pool[pickRoll.value];

    enemy.push({
      instanceId: `enemy-${index}-${pickRoll.value}-${currentSeed}`,
      blueprintId: picked.id,
      spriteKey: picked.spriteKey,
      attack: picked.attack + statBonus,
      health: picked.health + statBonus,
      tier: picked.tier,
      effects: picked.effects,
    });
  }

  return { enemy, seed: currentSeed };
}

function resolveBattleSteps(
  playerTeam: BattleViewUnit[],
  enemyTeam: BattleViewUnit[],
  initialSeed: number,
) {
  let snapshot: BattleSnapshot = {
    player: cloneViewTeam(playerTeam),
    enemy: cloneViewTeam(enemyTeam),
    seed: initialSeed,
  };

  const sobResult = runStartOfBattleSteps(snapshot);
  snapshot = sobResult.finalSnapshot;

  const steps: BattlePlayback["steps"] = [];

  for (const sobStep of sobResult.steps) {
    steps.push({
      kind: "sob",
      playerBefore: cloneViewTeam(sobStep.before.player),
      enemyBefore: cloneViewTeam(sobStep.before.enemy),
      playerAfter: cloneViewTeam(sobStep.after.player),
      enemyAfter: cloneViewTeam(sobStep.after.enemy),
      playerFrontDamage: 0,
      enemyFrontDamage: 0,
    });
  }

  let rounds = 0;
  const maxRounds = 64;

  while (snapshot.player.length > 0 && snapshot.enemy.length > 0 && rounds < maxRounds) {
    rounds += 1;

    const playerBefore = cloneViewTeam(snapshot.player);
    const enemyBefore = cloneViewTeam(snapshot.enemy);

    const playerFrontDamage = snapshot.enemy[0].attack;
    const enemyFrontDamage = snapshot.player[0].attack;

    const newPlayer = [...snapshot.player];
    const newEnemy = [...snapshot.enemy];
    newPlayer[0] = { ...newPlayer[0], health: newPlayer[0].health - playerFrontDamage };
    newEnemy[0] = { ...newEnemy[0], health: newEnemy[0].health - enemyFrontDamage };
    snapshot = { ...snapshot, player: newPlayer, enemy: newEnemy };

    const playerSurvived = snapshot.player[0].health > 0;
    const enemySurvived = snapshot.enemy[0].health > 0;

    if (playerSurvived && !enemySurvived) {
      snapshot = runKnockOutTrigger("player", 0, snapshot);
    }
    if (enemySurvived && !playerSurvived) {
      snapshot = runKnockOutTrigger("enemy", 0, snapshot);
    }

    if (!playerSurvived) {
      const fainted = snapshot.player[0];
      snapshot = { ...snapshot, player: snapshot.player.slice(1) };
      snapshot = runFaintTrigger("player", fainted, 0, snapshot);
    }
    if (!enemySurvived) {
      const fainted = snapshot.enemy[0];
      snapshot = { ...snapshot, enemy: snapshot.enemy.slice(1) };
      snapshot = runFaintTrigger("enemy", fainted, 0, snapshot);
    }

    snapshot = {
      ...snapshot,
      player: snapshot.player.filter((u) => u.health > 0),
      enemy: snapshot.enemy.filter((u) => u.health > 0),
    };

    steps.push({
      kind: "clash",
      playerBefore,
      enemyBefore,
      playerAfter: cloneViewTeam(snapshot.player),
      enemyAfter: cloneViewTeam(snapshot.enemy),
      playerFrontDamage,
      enemyFrontDamage,
    });
  }

  return {
    steps,
    playerLeft: snapshot.player.length,
    enemyLeft: snapshot.enemy.length,
    rounds,
    seed: snapshot.seed,
  };
}

export function resolveBattlePlayback(
  team: Array<UnitInstance | null>,
  turn: number,
  seed: number,
  blueprints: UnitBlueprint[],
): BattlePlayback {
  const playerTeam = toPlayerViewUnits(team);
  const enemyBuild = buildEnemyTeam(seed, turn, blueprints, team.length);
  const enemyTeam = enemyBuild.enemy;
  const resolved = resolveBattleSteps(playerTeam, enemyTeam, enemyBuild.seed);
  const teamPower = playerTeam.reduce((total, unit) => total + unit.attack + unit.health, 0);
  const enemyPower = enemyTeam.reduce((total, unit) => total + unit.attack + unit.health, 0);

  let outcome: BattleResult["outcome"] = "draw";
  if (resolved.enemyLeft === 0 && resolved.playerLeft > 0) {
    outcome = "win";
  } else if (resolved.playerLeft === 0 && resolved.enemyLeft > 0) {
    outcome = "loss";
  }

  const summary =
    outcome === "win"
      ? `Победа за ${resolved.rounds} разменов: линия бота сломалась первой.`
      : outcome === "loss"
        ? `Поражение за ${resolved.rounds} разменов: бот пережил фронт.`
        : `Ничья после ${resolved.rounds} разменов: обе линии закончились.`;

  return {
    enemyTeam,
    steps: resolved.steps,
    seed: resolved.seed,
    result: { outcome, enemyPower, teamPower, summary },
  };
}
