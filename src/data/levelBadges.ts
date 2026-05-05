import type { UnitInstance } from "../domain/types";

export const LEVEL_BADGE_IMAGES = {
  "level-1-xp-0": require("../../assets/icons/lvls/level-1-xp-0.png"),
  "level-1-xp-1": require("../../assets/icons/lvls/level-1-xp-1.png"),
  "level-2-xp-0": require("../../assets/icons/lvls/level-2-xp-0.png"),
  "level-2-xp-1": require("../../assets/icons/lvls/level-2-xp-1.png"),
  "level-2-xp-2": require("../../assets/icons/lvls/level-2-xp-2.png"),
  "level-3-max": require("../../assets/icons/lvls/level-3-max.png"),
} as const;

export function getLevelBadgeImage(unit: Pick<UnitInstance, "level" | "experience">) {
  if (unit.level >= 3) {
    return LEVEL_BADGE_IMAGES["level-3-max"];
  }

  if (unit.level === 2) {
    if (unit.experience <= 0) return LEVEL_BADGE_IMAGES["level-2-xp-0"];
    if (unit.experience === 1) return LEVEL_BADGE_IMAGES["level-2-xp-1"];
    return LEVEL_BADGE_IMAGES["level-2-xp-2"];
  }

  return unit.experience <= 0
    ? LEVEL_BADGE_IMAGES["level-1-xp-0"]
    : LEVEL_BADGE_IMAGES["level-1-xp-1"];
}
