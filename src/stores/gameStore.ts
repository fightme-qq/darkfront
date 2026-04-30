import { create } from "zustand";

import { GAME_CONFIG } from "../constants/gameConfig";
import { UNIT_BLUEPRINTS } from "../data/units";
import { resolveMockBattle } from "../domain/battle";
import { createUnitInstanceId, getShopTier, rollShop } from "../domain/shop";
import type { BattleResult, ShopSlot, UnitInstance } from "../domain/types";

interface GameState {
  turn: number;
  gold: number;
  lives: number;
  wins: number;
  shopTier: number;
  seed: number;
  shop: ShopSlot[];
  team: Array<UnitInstance | null>;
  selectedId: string | null;
  battleResult: BattleResult | null;
  unitCounter: number;
  shopSlotCounter: number;
  rollShop: () => void;
  buyUnit: (shopIndex: number) => void;
  buyUnitToSlot: (shopIndex: number, teamIndex: number) => void;
  moveUnit: (fromIndex: number, toIndex: number) => void;
  toggleFreeze: (shopIndex: number) => void;
  sellUnit: (teamIndex: number) => void;
  selectEntity: (id: string | null) => void;
  startBattle: () => void;
}

function createInstance(unit: ShopSlot["unit"], counter: number): UnitInstance {
  return {
    instanceId: createUnitInstanceId(counter),
    blueprintId: unit.id,
    name: unit.name,
    tier: unit.tier,
    attack: unit.attack,
    health: unit.health,
    level: 1,
    experience: 0,
    accent: unit.accent,
    spriteKey: unit.spriteKey,
    tags: unit.tags,
    ability: unit.ability,
  };
}

const initialRoll = rollShop(424242, UNIT_BLUEPRINTS, 1, [], 1);

export const useGameStore = create<GameState>((set, get) => ({
  turn: 1,
  gold: GAME_CONFIG.startingGold,
  lives: GAME_CONFIG.startingLives,
  wins: 0,
  shopTier: 1,
  seed: initialRoll.seed,
  shop: initialRoll.slots,
  team: Array.from({ length: GAME_CONFIG.teamSize }, () => null),
  selectedId: null,
  battleResult: null,
  unitCounter: 1,
  shopSlotCounter: initialRoll.slotIdCounter,
  rollShop: () => {
    const state = get();
    if (state.gold < GAME_CONFIG.rollCost) {
      return;
    }

    const next = rollShop(state.seed, UNIT_BLUEPRINTS, state.turn, state.shop, state.shopSlotCounter);
    set({
      gold: state.gold - GAME_CONFIG.rollCost,
      seed: next.seed,
      shop: next.slots,
      shopSlotCounter: next.slotIdCounter,
      shopTier: next.tier,
    });
  },
  buyUnit: (shopIndex) => {
    const state = get();
    const slot = state.shop[shopIndex];
    const openIndex = state.team.findIndex((unit) => unit === null);
    if (!slot || state.gold < GAME_CONFIG.buyCost || openIndex === -1) {
      return;
    }

    const nextTeam = [...state.team];
    nextTeam[openIndex] = createInstance(slot.unit, state.unitCounter);
    const nextShop = [...state.shop];
    nextShop[shopIndex] = { ...slot, frozen: false };
    const rerolled = rollShop(state.seed, UNIT_BLUEPRINTS, state.turn, nextShop, state.shopSlotCounter);
    set({
      gold: state.gold - GAME_CONFIG.buyCost,
      team: nextTeam,
      shop: rerolled.slots,
      seed: rerolled.seed,
      unitCounter: state.unitCounter + 1,
      shopSlotCounter: rerolled.slotIdCounter,
      selectedId: nextTeam[openIndex]?.instanceId ?? null,
    });
  },
  buyUnitToSlot: (shopIndex, teamIndex) => {
    const state = get();
    const slot = state.shop[shopIndex];
    if (!slot || state.gold < GAME_CONFIG.buyCost || state.team[teamIndex]) {
      return;
    }

    const nextTeam = [...state.team];
    nextTeam[teamIndex] = createInstance(slot.unit, state.unitCounter);
    const nextShop = [...state.shop];
    nextShop[shopIndex] = { ...slot, frozen: false };
    const rerolled = rollShop(state.seed, UNIT_BLUEPRINTS, state.turn, nextShop, state.shopSlotCounter);
    set({
      gold: state.gold - GAME_CONFIG.buyCost,
      team: nextTeam,
      shop: rerolled.slots,
      seed: rerolled.seed,
      unitCounter: state.unitCounter + 1,
      shopSlotCounter: rerolled.slotIdCounter,
      selectedId: nextTeam[teamIndex]?.instanceId ?? null,
    });
  },
  moveUnit: (fromIndex, toIndex) => {
    const state = get();
    if (fromIndex === toIndex) {
      return;
    }

    const fromUnit = state.team[fromIndex];
    if (!fromUnit) {
      return;
    }

    const nextTeam = [...state.team];
    nextTeam[fromIndex] = state.team[toIndex];
    nextTeam[toIndex] = fromUnit;

    set({
      team: nextTeam,
      selectedId: nextTeam[toIndex]?.instanceId ?? null,
    });
  },
  toggleFreeze: (shopIndex) => {
    const state = get();
    const nextShop = state.shop.map((slot, index) =>
      index === shopIndex ? { ...slot, frozen: !slot.frozen } : slot
    );
    set({ shop: nextShop });
  },
  sellUnit: (teamIndex) => {
    const state = get();
    if (!state.team[teamIndex]) {
      return;
    }

    const nextTeam = [...state.team];
    nextTeam[teamIndex] = null;
    set({
      team: nextTeam,
      gold: Math.min(state.gold + 1, 99),
      selectedId: null,
    });
  },
  selectEntity: (id) => set({ selectedId: id }),
  startBattle: () => {
    const state = get();
    const outcome = resolveMockBattle(state.team, state.turn, state.wins, state.seed);
    const nextTurn = state.turn + 1;
    const nextWins = state.wins + (outcome.result.outcome === "win" ? 1 : 0);
    const nextLives = state.lives - (outcome.result.outcome === "loss" ? 1 : 0);
    const rerolled = rollShop(outcome.seed, UNIT_BLUEPRINTS, nextTurn, state.shop, state.shopSlotCounter);

    set({
      seed: rerolled.seed,
      turn: nextTurn,
      gold: GAME_CONFIG.startingGold,
      wins: nextWins,
      lives: nextLives,
      shopTier: getShopTier(nextTurn),
      shop: rerolled.slots.map((slot) => ({ ...slot, frozen: false })),
      battleResult: outcome.result,
      shopSlotCounter: rerolled.slotIdCounter,
    });
  },
}));
