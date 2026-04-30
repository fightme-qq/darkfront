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

function toPlayerViewUnits(team: Array<UnitInstance | null>) {
  return team
    .filter((unit): unit is UnitInstance => unit !== null)
    .map((unit) => ({
      instanceId: unit.instanceId,
      spriteKey: unit.spriteKey,
      attack: unit.attack,
      health: unit.health,
      tier: unit.tier,
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
      spriteKey: picked.spriteKey,
      attack: picked.attack + statBonus,
      health: picked.health + statBonus,
      tier: picked.tier,
    });
  }

  return { enemy, seed: currentSeed };
}

function resolveBattleSteps(playerTeam: BattleViewUnit[], enemyTeam: BattleViewUnit[]) {
  const player = cloneViewTeam(playerTeam);
  const enemy = cloneViewTeam(enemyTeam);
  const steps: BattlePlayback["steps"] = [];
  let rounds = 0;
  const maxRounds = 64;

  while (player.length > 0 && enemy.length > 0 && rounds < maxRounds) {
    rounds += 1;

    const playerBefore = cloneViewTeam(player);
    const enemyBefore = cloneViewTeam(enemy);

    const playerFrontDamage = enemy[0].attack;
    const enemyFrontDamage = player[0].attack;

    player[0].health -= playerFrontDamage;
    enemy[0].health -= enemyFrontDamage;

    if (player[0].health <= 0) {
      player.shift();
    }

    if (enemy[0].health <= 0) {
      enemy.shift();
    }

    steps.push({
      playerBefore,
      enemyBefore,
      playerAfter: cloneViewTeam(player),
      enemyAfter: cloneViewTeam(enemy),
      playerFrontDamage,
      enemyFrontDamage,
    });
  }

  return { steps, playerLeft: player.length, enemyLeft: enemy.length, rounds };
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
  const resolved = resolveBattleSteps(playerTeam, enemyTeam);
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
    seed: enemyBuild.seed,
    result: { outcome, enemyPower, teamPower, summary },
  };
}
