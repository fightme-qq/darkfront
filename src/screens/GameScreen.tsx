import { useMemo, useState } from "react";
import { ImageBackground, StyleSheet, useWindowDimensions, View } from "react-native";
import type { ViewStyle } from "react-native";

import { ActionBar } from "../components/game/ActionBar";
import { InfoPanel } from "../components/game/InfoPanel";
import { ShopRow } from "../components/game/ShopRow";
import { TeamBoard } from "../components/game/TeamBoard";
import { TopBar } from "../components/game/TopBar";
import { UnitCard } from "../components/game/UnitCard";
import { getHeroViewportProfile, HERO_LAYOUT_CONFIG } from "../constants/heroLayoutConfig";
import type { ShopSlot, UnitInstance } from "../domain/types";
import { useGameStore } from "../stores/gameStore";

const EMPTY_BATTLE_SUMMARY = "Боя еще не было. Собери стартовый отряд и проверь темп.";
const BATTLEFIELD_BACKGROUND = require("../../assets/backgrounds/20260429_191654.jpeg");

interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function GameScreen() {
  const { width, height } = useWindowDimensions();
  const state = useGameStore();
  const selectedTeam = state.team.find((unit) => unit?.instanceId === state.selectedId) ?? null;
  const selectedShop = state.shop.find((slot) => slot.slotId === state.selectedId) ?? null;
  const selected = selectedTeam ?? selectedShop;
  const selectedIndex = state.team.findIndex((unit) => unit?.instanceId === state.selectedId);
  const selectedShopIndex = state.shop.findIndex((slot) => slot.slotId === state.selectedId);
  const canFreeze = selectedShopIndex >= 0;
  const showPlacementHints = selectedShopIndex >= 0;
  const [slotRects, setSlotRects] = useState<Record<number, SlotRect>>({});
  const [dragState, setDragState] = useState<{
    kind: "shop" | "team";
    sourceIndex: number;
    unit: ShopSlot["unit"] | UnitInstance;
    x: number;
    y: number;
  } | null>(null);

  const profileKey = getHeroViewportProfile(width, height);
  const profile = HERO_LAYOUT_CONFIG.profiles[profileKey];
  const compact = profileKey !== "largePhone";
  const ultraCompact = profileKey === "smallPhone";

  const hoveredSlotIndex = useMemo(() => {
    if (!dragState) {
      return null;
    }

    for (let index = 0; index < state.team.length; index += 1) {
      const rect = slotRects[index];
      if (!rect) {
        continue;
      }

      const withinX = dragState.x >= rect.x && dragState.x <= rect.x + rect.width;
      const withinY = dragState.y >= rect.y && dragState.y <= rect.y + rect.height;
      if (withinX && withinY) {
        return index;
      }
    }

    return null;
  }, [dragState, slotRects, state.team]);

  const infoPanelStyle = ultraCompact
    ? styles.infoPanelUltraCompact
    : compact
      ? styles.infoPanelCompactResponsive
      : styles.infoPanelResponsive;
  const teamLaneStyle = profile.lanes.team as ViewStyle;
  const shopLaneStyle = profile.lanes.shop as ViewStyle;

  const handleSlotMeasure = (teamIndex: number, rect: SlotRect) => {
    setSlotRects((current) => {
      const previous = current[teamIndex];
      if (
        previous &&
        previous.x === rect.x &&
        previous.y === rect.y &&
        previous.width === rect.width &&
        previous.height === rect.height
      ) {
        return current;
      }

      return {
        ...current,
        [teamIndex]: rect,
      };
    });
  };

  const handleTouchDragStart = (shopIndex: number, x: number, y: number) => {
    const slot = state.shop[shopIndex];
    if (!slot) {
      return;
    }

    state.selectEntity(slot.slotId);
    setDragState({
      kind: "shop",
      sourceIndex: shopIndex,
      unit: slot.unit,
      x,
      y,
    });
  };

  const handleTouchDragMove = (x: number, y: number) => {
    setDragState((current) => (current ? { ...current, x, y } : current));
  };

  const handleTouchDragEnd = (shopIndex: number, x: number, y: number) => {
    const slot = state.shop[shopIndex];
    const targetIndex = findSlotIndexAtPoint(x, y, slotRects);

    if (slot && targetIndex !== null && !state.team[targetIndex]) {
      state.buyUnitToSlot(shopIndex, targetIndex);
    }

    setDragState(null);
  };

  const handleTeamDragStart = (teamIndex: number, x: number, y: number) => {
    const unit = state.team[teamIndex];
    if (!unit) {
      return;
    }

    state.selectEntity(unit.instanceId);
    setDragState({
      kind: "team",
      sourceIndex: teamIndex,
      unit,
      x,
      y,
    });
  };

  const handleTeamDragMove = (x: number, y: number) => {
    setDragState((current) => (current ? { ...current, x, y } : current));
  };

  const handleTeamDragEnd = (teamIndex: number, x: number, y: number) => {
    const targetIndex = findSlotIndexAtPoint(x, y, slotRects);
    if (targetIndex !== null && targetIndex !== teamIndex) {
      state.moveUnit(teamIndex, targetIndex);
    }
    setDragState(null);
  };

  return (
    <ImageBackground source={BATTLEFIELD_BACKGROUND} resizeMode="cover" style={styles.screen} imageStyle={styles.bgImage}>
      <View style={[styles.overlay, compact && styles.overlayCompact]} />

      <View style={[styles.topBarWrap, ultraCompact && styles.topBarWrapUltraCompact]}>
        <TopBar
          gold={state.gold}
          lives={state.lives}
          wins={state.wins}
          turn={state.turn}
          tier={state.shopTier}
          compact={compact}
        />
      </View>

      <InfoPanel
        selected={selected}
        battleSummary={state.battleResult?.summary ?? EMPTY_BATTLE_SUMMARY}
        onSellSelected={selectedIndex >= 0 ? () => state.sellUnit(selectedIndex) : undefined}
        compact={compact}
        style={infoPanelStyle}
      />

      <View
        style={[
          styles.teamLane,
          teamLaneStyle,
        ]}
      >
        <TeamBoard
          team={state.team}
          selectedId={state.selectedId}
          selectedTeamIndex={selectedIndex}
          onSelect={state.selectEntity}
          onDropShopToSlot={state.buyUnitToSlot}
          onMoveUnit={state.moveUnit}
          compact={compact}
          showPlacementHints={showPlacementHints}
          selectedShopIndex={selectedShopIndex}
          hoveredSlotIndex={hoveredSlotIndex}
          onSlotMeasure={handleSlotMeasure}
          onTeamDragStart={handleTeamDragStart}
          onTeamDragMove={handleTeamDragMove}
          onTeamDragEnd={handleTeamDragEnd}
        />
      </View>

      <View
        style={[
          styles.shopLane,
          shopLaneStyle,
        ]}
      >
        <ShopRow
          shop={state.shop}
          selectedId={state.selectedId}
          onSelect={state.selectEntity}
          compact={compact}
          onTouchDragStart={handleTouchDragStart}
          onTouchDragMove={handleTouchDragMove}
          onTouchDragEnd={handleTouchDragEnd}
        />
      </View>

      <View style={[styles.actionBarWrap, compact && styles.actionBarWrapCompact, ultraCompact && styles.actionBarWrapUltraCompact]}>
        <ActionBar
          onRoll={state.rollShop}
          onFreeze={canFreeze ? () => state.toggleFreeze(selectedShopIndex) : () => undefined}
          onBattle={state.startBattle}
          canFreeze={canFreeze}
          compact={compact}
        />
      </View>

      {dragState ? (
        <View
          pointerEvents="none"
          style={[
            styles.dragGhost,
            compact && styles.dragGhostCompact,
            {
              left: dragState.x - (compact ? 56 : 72),
              top: dragState.y - (compact ? 44 : 54),
            },
          ]}
        >
          <UnitCard unit={dragState.unit} compact={compact} mode={dragState.kind === "team" ? "team" : "shop"} />
        </View>
      ) : null}
    </ImageBackground>
  );
}

function findSlotIndexAtPoint(x: number, y: number, slotRects: Record<number, SlotRect>) {
  const found = Object.entries(slotRects).find(([, rect]) => {
    const withinX = x >= rect.x && x <= rect.x + rect.width;
    const withinY = y >= rect.y && y <= rect.y + rect.height;
    return withinX && withinY;
  });

  return found ? Number(found[0]) : null;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#151925",
    overflow: "hidden",
    ...(typeof document !== "undefined"
      ? ({
          userSelect: "none",
          WebkitUserSelect: "none",
          touchAction: "none",
        } as object)
      : {}),
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(7, 10, 16, 0.08)",
  },
  overlayCompact: {
    backgroundColor: "rgba(7, 10, 16, 0.05)",
  },
  topBarWrap: {
    position: "absolute",
    top: "2.3%",
    left: "1.7%",
    zIndex: 4,
  },
  topBarWrapUltraCompact: {
    top: "1.8%",
    left: "1.3%",
  },
  infoPanelResponsive: {
    top: "3.1%",
    right: "1.8%",
    width: 282,
    zIndex: 4,
  },
  infoPanelCompactResponsive: {
    top: "3%",
    right: "1.4%",
    width: 230,
    zIndex: 4,
  },
  infoPanelUltraCompact: {
    top: "2.5%",
    right: "1.2%",
    width: 210,
    zIndex: 4,
  },
  teamLane: {
    position: "absolute",
    justifyContent: "center",
    zIndex: 3,
  },
  shopLane: {
    position: "absolute",
    justifyContent: "center",
    zIndex: 3,
  },
  actionBarWrap: {
    position: "absolute",
    left: "1.9%",
    right: "1.9%",
    bottom: "2.9%",
    zIndex: 4,
  },
  actionBarWrapCompact: {
    left: "1.3%",
    right: "1.3%",
    bottom: "2.3%",
  },
  actionBarWrapUltraCompact: {
    left: "0.9%",
    right: "0.9%",
    bottom: "1.8%",
  },
  dragGhost: {
    position: "absolute",
    width: 144,
    opacity: 0.92,
    zIndex: 20,
  },
  dragGhostCompact: {
    width: 112,
  },
});
