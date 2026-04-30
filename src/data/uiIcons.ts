export const UI_ICON_ATLAS = require("../../assets/images.png");

export const UI_ICON_ATLAS_SIZE = {
  width: 512,
  height: 4384,
  tile: 32,
} as const;

export type UiIconKey =
  | "gold"
  | "lives"
  | "turn"
  | "wins"
  | "tier"
  | "attack"
  | "health"
  | "sell"
  | "reroll"
  | "freeze"
  | "endTurn";

// Координаты даны в тайлах Aseprite (по сетке 32x32), а не в пикселях.
// То есть x=2, y=8 означает "третий столбец, девятая строка" на атласе.
export const UI_ICONS: Record<UiIconKey, { tileX: number; tileY: number }> = {
  gold: { tileX: 2, tileY: 8 },
  lives: { tileX: 8, tileY: 42 },
  turn: { tileX: 15, tileY: 54 },
  wins: { tileX: 14, tileY: 0 },
  tier: { tileX: 1, tileY: 132 },
  attack: { tileX: 0, tileY: 45 },
  health: { tileX: 2, tileY: 41 },
  sell: { tileX: 15, tileY: 9 },
  reroll: { tileX: 11, tileY: 7 },
  freeze: { tileX: 0, tileY: 68 },
  endTurn: { tileX: 10, tileY: 2 },
};
