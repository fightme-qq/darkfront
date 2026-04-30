import type { CharacterSpriteKey } from "../domain/types";

export const UNIT_SPRITES: Record<CharacterSpriteKey, any> = {
  "grave-acolyte": require("../../assets/characters/grave-acolyte.png"),
  "bone-wanderer": require("../../assets/characters/bone-wanderer.png"),
  "dusk-swordsman": require("../../assets/characters/dusk-swordsman.png"),
  "runic-hound": require("../../assets/characters/runic-hound.png"),
  "skull-shieldbearer": require("../../assets/characters/skull-shieldbearer.png"),
  "weary-squire": require("../../assets/characters/weary-squire.png"),
  "winged-drakeling": require("../../assets/characters/winged-drakeling.png"),
};

export const UNIT_SPRITE_TUNING: Record<
  CharacterSpriteKey,
  { scale: number; offsetY: number; tierOffsetX: number; tierOffsetY: number }
> = {
  "grave-acolyte": { scale: 1.42, offsetY: 8, tierOffsetX: -16, tierOffsetY: 2 },
  "bone-wanderer": { scale: 1.18, offsetY: 4, tierOffsetX: -8, tierOffsetY: 2 },
  "dusk-swordsman": { scale: 1.04, offsetY: 4, tierOffsetX: 0, tierOffsetY: 0 },
  "runic-hound": { scale: 1.15, offsetY: 6, tierOffsetX: -6, tierOffsetY: 1 },
  "skull-shieldbearer": { scale: 0.9, offsetY: 0, tierOffsetX: 4, tierOffsetY: 0 },
  "weary-squire": { scale: 1.34, offsetY: 10, tierOffsetX: -12, tierOffsetY: 2 },
  "winged-drakeling": { scale: 1.02, offsetY: 2, tierOffsetX: 2, tierOffsetY: 0 },
};

export function getUnitSprite(spriteKey: CharacterSpriteKey) {
  return UNIT_SPRITES[spriteKey];
}

export function getUnitSpriteTuning(spriteKey: CharacterSpriteKey) {
  return UNIT_SPRITE_TUNING[spriteKey];
}
