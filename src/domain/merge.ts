import type { UnitInstance } from "./types";

export const MAX_UNIT_LEVEL = 3;

export function getExperienceNeededForNextLevel(level: number) {
  if (level <= 1) {
    return 2;
  }
  if (level === 2) {
    return 3;
  }
  return 0;
}

export function addMergeExperience(unit: UnitInstance): UnitInstance {
  let nextLevel = unit.level;
  let nextExperience = unit.experience;

  if (nextLevel < MAX_UNIT_LEVEL) {
    nextExperience += 1;
    const needed = getExperienceNeededForNextLevel(nextLevel);
    if (needed > 0 && nextExperience >= needed) {
      nextLevel += 1;
      nextExperience = 0;
    }
  }

  return {
    ...unit,
    attack: unit.attack + 1,
    health: unit.health + 1,
    level: nextLevel,
    experience: nextExperience,
  };
}
