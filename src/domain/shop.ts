import { GAME_CONFIG } from "../constants/gameConfig";
import type { ShopSlot, UnitBlueprint } from "./types";
import { nextInt } from "./rng";

export function getShopTier(turn: number) {
  return Math.min(1 + Math.floor(turn / 2), 6);
}

export function createUnitInstanceId(counter: number) {
  return `unit-${counter}`;
}

export function createShopSlotId(counter: number) {
  return `shop-${counter}`;
}

export function rollShop(
  seed: number,
  blueprints: UnitBlueprint[],
  turn: number,
  currentShop: ShopSlot[],
  slotIdCounter: number
) {
  const tier = getShopTier(turn);
  const pool = blueprints.filter((unit) => unit.tier <= tier);
  let currentSeed = seed;
  let nextSlotIdCounter = slotIdCounter;

  const slots = Array.from({ length: GAME_CONFIG.shopSize }, (_, index) => {
    const current = currentShop[index];
    if (current?.frozen) {
      return current;
    }

    const roll = nextInt(currentSeed, pool.length);
    currentSeed = roll.seed;
    const unit = pool[roll.value];
    const slot: ShopSlot = {
      slotId: createShopSlotId(nextSlotIdCounter),
      unit,
      frozen: false,
    };

    nextSlotIdCounter += 1;
    return slot;
  });

  return { slots, seed: currentSeed, slotIdCounter: nextSlotIdCounter, tier };
}
