export type UnitTag =
  | "frontline"
  | "support"
  | "faint"
  | "summon"
  | "economy"
  | "scaling";

export type CharacterSpriteKey =
  | "grave-acolyte"
  | "bone-wanderer"
  | "dusk-swordsman"
  | "runic-hound"
  | "skull-shieldbearer"
  | "weary-squire"
  | "winged-drakeling";

export type TriggerType =
  | "buy"
  | "sell"
  | "endTurn"
  | "startOfBattle"
  | "faint"
  | "knockOut"
  | "hurt";

export type TargetSelector =
  | "self"
  | "nearestBehind"
  | "frontAlly"
  | "randomEnemy";

export type EffectAction =
  | { kind: "buffStats"; attack?: number; health?: number; temporary?: boolean }
  | { kind: "dealDamage"; amount: number }
  | { kind: "addGoldNextTurn"; amount: number };

export interface UnitEffect {
  trigger: TriggerType;
  target: TargetSelector;
  action: EffectAction;
}

export interface UnitBlueprint {
  id: string;
  name: string;
  tier: number;
  attack: number;
  health: number;
  accent: string;
  spriteKey: CharacterSpriteKey;
  tags: UnitTag[];
  ability: string;
  effects: UnitEffect[];
}

export interface UnitInstance {
  instanceId: string;
  blueprintId: string;
  name: string;
  tier: number;
  attack: number;
  health: number;
  temporaryAttack: number;
  temporaryHealth: number;
  level: number;
  experience: number;
  accent: string;
  spriteKey: CharacterSpriteKey;
  tags: UnitTag[];
  ability: string;
  effects: UnitEffect[];
}

export interface ShopSlot {
  slotId: string;
  unit: UnitBlueprint | null;
  frozen: boolean;
}

export interface BattleResult {
  outcome: "win" | "loss" | "draw";
  enemyPower: number;
  teamPower: number;
  summary: string;
}

export interface BattleViewUnit {
  instanceId: string;
  blueprintId: string;
  spriteKey: CharacterSpriteKey;
  attack: number;
  health: number;
  tier: number;
  effects: UnitEffect[];
}

export interface BattleClashStep {
  kind: "sob" | "clash";
  playerBefore: BattleViewUnit[];
  enemyBefore: BattleViewUnit[];
  playerAfter: BattleViewUnit[];
  enemyAfter: BattleViewUnit[];
  playerFrontDamage: number;
  enemyFrontDamage: number;
}

export interface BattlePlayback {
  enemyTeam: BattleViewUnit[];
  steps: BattleClashStep[];
  result: BattleResult;
  seed: number;
}
