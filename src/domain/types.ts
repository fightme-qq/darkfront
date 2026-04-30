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
}

export interface UnitInstance {
  instanceId: string;
  blueprintId: string;
  name: string;
  tier: number;
  attack: number;
  health: number;
  level: number;
  experience: number;
  accent: string;
  spriteKey: CharacterSpriteKey;
  tags: UnitTag[];
  ability: string;
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
  spriteKey: CharacterSpriteKey;
  attack: number;
  health: number;
  tier: number;
}

export interface BattleClashStep {
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
