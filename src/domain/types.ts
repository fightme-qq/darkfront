export type UnitTag =
  | "frontline"
  | "support"
  | "faint"
  | "summon"
  | "economy"
  | "scaling";

export interface UnitBlueprint {
  id: string;
  name: string;
  tier: number;
  attack: number;
  health: number;
  accent: string;
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
  tags: UnitTag[];
  ability: string;
}

export interface ShopSlot {
  slotId: string;
  unit: UnitBlueprint;
  frozen: boolean;
}

export interface BattleResult {
  outcome: "win" | "loss" | "draw";
  enemyPower: number;
  teamPower: number;
  summary: string;
}
