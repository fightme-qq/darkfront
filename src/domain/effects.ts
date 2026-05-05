import { nextInt } from "./rng";
import type {
  BattleViewUnit,
  EffectAction,
  TargetSelector,
  TriggerType,
  UnitEffect,
  UnitInstance,
} from "./types";

export interface ShopTriggerResult {
  team: Array<UnitInstance | null>;
  pendingGoldDelta: number;
}

export interface BattleSnapshot {
  player: BattleViewUnit[];
  enemy: BattleViewUnit[];
  seed: number;
}

type Side = "player" | "enemy";

function cloneInstance(unit: UnitInstance): UnitInstance {
  return { ...unit };
}

function cloneInstanceTeam(team: Array<UnitInstance | null>): Array<UnitInstance | null> {
  return team.map((unit) => (unit ? cloneInstance(unit) : null));
}

function applyShopAction(
  unit: UnitInstance,
  action: EffectAction,
): { unit: UnitInstance; goldDelta: number } {
  switch (action.kind) {
    case "buffStats": {
      const next = cloneInstance(unit);
      const atk = action.attack ?? 0;
      const hp = action.health ?? 0;
      if (action.temporary) {
        next.temporaryAttack += atk;
        next.temporaryHealth += hp;
      } else {
        next.attack += atk;
        next.health += hp;
      }
      return { unit: next, goldDelta: 0 };
    }
    case "addGoldNextTurn":
      return { unit, goldDelta: action.amount };
    case "dealDamage":
      return { unit, goldDelta: 0 };
    default:
      return { unit, goldDelta: 0 };
  }
}

function pickShopTargets(
  team: Array<UnitInstance | null>,
  sourceIndex: number,
  selector: TargetSelector,
): number[] {
  switch (selector) {
    case "self":
      return team[sourceIndex] ? [sourceIndex] : [];
    case "nearestBehind": {
      for (let i = sourceIndex + 1; i < team.length; i += 1) {
        if (team[i]) return [i];
      }
      return [];
    }
    case "frontAlly": {
      for (let i = 0; i < team.length; i += 1) {
        if (i !== sourceIndex && team[i]) return [i];
      }
      return [];
    }
    case "randomEnemy":
      return [];
    default:
      return [];
  }
}

function fireShopEffect(
  effect: UnitEffect,
  sourceIndex: number,
  team: Array<UnitInstance | null>,
): { team: Array<UnitInstance | null>; goldDelta: number } {
  const targets = pickShopTargets(team, sourceIndex, effect.target);
  if (targets.length === 0) {
    return { team, goldDelta: 0 };
  }

  const next = [...team];
  let goldDelta = 0;
  for (const idx of targets) {
    const target = next[idx];
    if (!target) continue;
    const result = applyShopAction(target, effect.action);
    next[idx] = result.unit;
    goldDelta += result.goldDelta;
  }
  return { team: next, goldDelta };
}

export function runShopTrigger(
  trigger: TriggerType,
  sourceIndex: number,
  team: Array<UnitInstance | null>,
): ShopTriggerResult {
  const source = team[sourceIndex];
  if (!source) {
    return { team, pendingGoldDelta: 0 };
  }

  let currentTeam = team;
  let totalGold = 0;
  for (const effect of source.effects) {
    if (effect.trigger !== trigger) continue;
    const result = fireShopEffect(effect, sourceIndex, currentTeam);
    currentTeam = result.team;
    totalGold += result.goldDelta;
  }

  return { team: currentTeam, pendingGoldDelta: totalGold };
}

export interface EndTurnStep {
  team: Array<UnitInstance | null>;
  goldDelta: number;
  sourceInstanceId: string;
}

export function runEndTurnTriggersSteps(team: Array<UnitInstance | null>): {
  steps: EndTurnStep[];
  finalTeam: Array<UnitInstance | null>;
  totalGold: number;
} {
  let current = cloneInstanceTeam(team);
  const steps: EndTurnStep[] = [];
  let totalGold = 0;

  const sourceIds: string[] = [];
  for (const unit of current) {
    if (unit) sourceIds.push(unit.instanceId);
  }

  for (const sourceId of sourceIds) {
    const sourceIndex = current.findIndex((u) => u && u.instanceId === sourceId);
    if (sourceIndex === -1) continue;
    const source = current[sourceIndex];
    if (!source) continue;

    for (const effect of source.effects) {
      if (effect.trigger !== "endTurn") continue;
      const result = fireShopEffect(effect, sourceIndex, current);
      const changed = result.team !== current || result.goldDelta !== 0;
      if (!changed) continue;
      current = result.team;
      totalGold += result.goldDelta;
      steps.push({
        team: cloneInstanceTeam(current),
        goldDelta: result.goldDelta,
        sourceInstanceId: sourceId,
      });
    }
  }

  return { steps, finalTeam: current, totalGold };
}

function pickBattleTargets(
  side: Side,
  sourceIndex: number,
  selector: TargetSelector,
  snapshot: BattleSnapshot,
): { side: Side; index: number }[] {
  const allies = side === "player" ? snapshot.player : snapshot.enemy;
  const opponents = side === "player" ? snapshot.enemy : snapshot.player;
  const opposingSide: Side = side === "player" ? "enemy" : "player";

  switch (selector) {
    case "self":
      return allies[sourceIndex] && allies[sourceIndex].health > 0
        ? [{ side, index: sourceIndex }]
        : [];
    case "nearestBehind": {
      for (let i = sourceIndex + 1; i < allies.length; i += 1) {
        if (allies[i] && allies[i].health > 0) {
          return [{ side, index: i }];
        }
      }
      return [];
    }
    case "frontAlly": {
      for (let i = 0; i < allies.length; i += 1) {
        if (i !== sourceIndex && allies[i] && allies[i].health > 0) {
          return [{ side, index: i }];
        }
      }
      return [];
    }
    case "randomEnemy": {
      const aliveIdx: number[] = [];
      for (let i = 0; i < opponents.length; i += 1) {
        if (opponents[i] && opponents[i].health > 0) aliveIdx.push(i);
      }
      if (aliveIdx.length === 0) return [];
      const roll = nextInt(snapshot.seed, aliveIdx.length);
      snapshot.seed = roll.seed;
      return [{ side: opposingSide, index: aliveIdx[roll.value] }];
    }
    default:
      return [];
  }
}

function applyBattleAction(unit: BattleViewUnit, action: EffectAction): BattleViewUnit {
  switch (action.kind) {
    case "buffStats": {
      const atk = action.attack ?? 0;
      const hp = action.health ?? 0;
      return { ...unit, attack: unit.attack + atk, health: unit.health + hp };
    }
    case "dealDamage":
      return { ...unit, health: unit.health - action.amount };
    case "addGoldNextTurn":
      return unit;
    default:
      return unit;
  }
}

function applyBattleEffectAt(
  snapshot: BattleSnapshot,
  target: { side: Side; index: number },
  action: EffectAction,
): BattleSnapshot {
  const arr = target.side === "player" ? [...snapshot.player] : [...snapshot.enemy];
  const t = arr[target.index];
  if (!t) return snapshot;
  arr[target.index] = applyBattleAction(t, action);
  return target.side === "player"
    ? { ...snapshot, player: arr }
    : { ...snapshot, enemy: arr };
}

function fireBattleEffect(
  side: Side,
  sourceIndex: number,
  effect: UnitEffect,
  snapshot: BattleSnapshot,
): BattleSnapshot {
  let next = snapshot;
  const targets = pickBattleTargets(side, sourceIndex, effect.target, next);
  for (const target of targets) {
    next = applyBattleEffectAt(next, target, effect.action);
  }
  return next;
}

function cleanupDead(snapshot: BattleSnapshot): BattleSnapshot {
  return {
    ...snapshot,
    player: snapshot.player.filter((u) => u.health > 0),
    enemy: snapshot.enemy.filter((u) => u.health > 0),
  };
}

export interface SobStep {
  before: BattleSnapshot;
  after: BattleSnapshot;
}

function snapshotsEqual(a: BattleSnapshot, b: BattleSnapshot): boolean {
  if (a === b) return true;
  if (a.player.length !== b.player.length || a.enemy.length !== b.enemy.length) return false;
  for (let i = 0; i < a.player.length; i += 1) {
    const x = a.player[i];
    const y = b.player[i];
    if (x.instanceId !== y.instanceId || x.attack !== y.attack || x.health !== y.health) return false;
  }
  for (let i = 0; i < a.enemy.length; i += 1) {
    const x = a.enemy[i];
    const y = b.enemy[i];
    if (x.instanceId !== y.instanceId || x.attack !== y.attack || x.health !== y.health) return false;
  }
  return true;
}

function cloneSnapshot(s: BattleSnapshot): BattleSnapshot {
  return {
    player: s.player.map((u) => ({ ...u })),
    enemy: s.enemy.map((u) => ({ ...u })),
    seed: s.seed,
  };
}

export function runStartOfBattleSteps(snapshot: BattleSnapshot): {
  steps: SobStep[];
  finalSnapshot: BattleSnapshot;
} {
  const steps: SobStep[] = [];
  let current: BattleSnapshot = cloneSnapshot(snapshot);

  const sources: { side: Side; instanceId: string }[] = [];
  for (const u of current.player) sources.push({ side: "player", instanceId: u.instanceId });
  for (const u of current.enemy) sources.push({ side: "enemy", instanceId: u.instanceId });

  for (const src of sources) {
    const team = src.side === "player" ? current.player : current.enemy;
    const sourceIndex = team.findIndex((u) => u.instanceId === src.instanceId);
    if (sourceIndex === -1) continue;
    const unit = team[sourceIndex];
    if (!unit || unit.health <= 0) continue;

    for (const effect of unit.effects) {
      if (effect.trigger !== "startOfBattle") continue;

      const before = cloneSnapshot(current);
      const sideTeam = src.side === "player" ? current.player : current.enemy;
      const idx = sideTeam.findIndex((u) => u.instanceId === src.instanceId);
      if (idx === -1) break;

      let next = fireBattleEffect(src.side, idx, effect, current);
      next = cleanupDead(next);

      if (snapshotsEqual(before, next)) continue;
      current = next;
      steps.push({ before, after: cloneSnapshot(current) });
    }
  }

  return { steps, finalSnapshot: current };
}

export function runKnockOutTrigger(
  side: Side,
  attackerIndex: number,
  snapshot: BattleSnapshot,
): BattleSnapshot {
  const team = side === "player" ? snapshot.player : snapshot.enemy;
  const attacker = team[attackerIndex];
  if (!attacker) return snapshot;
  let next = snapshot;
  for (const effect of attacker.effects) {
    if (effect.trigger !== "knockOut") continue;
    next = fireBattleEffect(side, attackerIndex, effect, next);
  }
  return next;
}

export function runFaintTrigger(
  side: Side,
  faintedUnit: BattleViewUnit,
  positionAtDeath: number,
  snapshot: BattleSnapshot,
): BattleSnapshot {
  let next = snapshot;
  for (const effect of faintedUnit.effects) {
    if (effect.trigger !== "faint") continue;
    const targets = pickBattleTargets(side, positionAtDeath, effect.target, next);
    for (const target of targets) {
      next = applyBattleEffectAt(next, target, effect.action);
    }
  }
  return next;
}
