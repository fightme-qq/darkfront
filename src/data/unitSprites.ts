import type { CharacterSpriteKey } from "../domain/types";
import { HERO_LAYOUT_CONFIG } from "../constants/heroLayoutConfig";

export const UNIT_SPRITES: Record<CharacterSpriteKey, any> = {
  "grave-acolyte": require("../../assets/characters/grave-acolyte.png"),
  "bone-wanderer": require("../../assets/characters/bone-wanderer.png"),
  "dusk-swordsman": require("../../assets/characters/dusk-swordsman.png"),
  "runic-hound": require("../../assets/characters/runic-hound.png"),
  "skull-shieldbearer": require("../../assets/characters/skull-shieldbearer.png"),
  "weary-squire": require("../../assets/characters/weary-squire.png"),
  "winged-drakeling": require("../../assets/characters/winged-drakeling.png"),
};

export function getUnitSprite(spriteKey: CharacterSpriteKey) {
  return UNIT_SPRITES[spriteKey];
}

export function getUnitSpriteTuning(spriteKey: CharacterSpriteKey) {
  return HERO_LAYOUT_CONFIG.spriteTuning[spriteKey];
}
