import { useEffect, useMemo, useRef } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

import type { UnitInstance } from "../../domain/types";
import { UnitCard } from "./UnitCard";

interface SlotRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TeamBoardProps {
  team: Array<UnitInstance | null>;
  selectedId: string | null;
  selectedTeamIndex?: number;
  onSelect: (id: string | null) => void;
  onDropShopToSlot?: (shopIndex: number, teamIndex: number) => void;
  onMoveUnit?: (fromIndex: number, toIndex: number) => void;
  compact?: boolean;
  showPlacementHints?: boolean;
  selectedShopIndex?: number;
  hoveredSlotIndex?: number | null;
  onSlotMeasure?: (teamIndex: number, rect: SlotRect) => void;
  onTeamDragStart?: (teamIndex: number, x: number, y: number) => void;
  onTeamDragMove?: (x: number, y: number) => void;
  onTeamDragEnd?: (teamIndex: number, x: number, y: number) => void;
}

export function TeamBoard({
  team,
  selectedId,
  selectedTeamIndex,
  onSelect,
  onDropShopToSlot,
  onMoveUnit,
  compact,
  showPlacementHints,
  selectedShopIndex,
  hoveredSlotIndex,
  onSlotMeasure,
  onTeamDragStart,
  onTeamDragMove,
  onTeamDragEnd,
}: TeamBoardProps) {
  const slotRefs = useRef<Array<View | null>>([]);

  const measureSlot = (index: number) => {
    const node = slotRefs.current[index];
    if (!node || !onSlotMeasure) {
      return;
    }

    node.measureInWindow((x, y, width, height) => {
      onSlotMeasure(index, { x, y, width, height });
    });
  };

  useEffect(() => {
    if (!onSlotMeasure) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      team.forEach((_, index) => measureSlot(index));
    });

    return () => cancelAnimationFrame(frame);
  }, [compact, onSlotMeasure, team]);

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {team.map((unit, index) => (
        <TeamSlot
          key={unit?.instanceId ?? `empty-${index}`}
          index={index}
          unit={unit}
          selected={unit?.instanceId === selectedId}
          compact={compact}
          selectedShopIndex={selectedShopIndex}
          showPlacementHint={!unit && Boolean(showPlacementHints)}
          dropActive={hoveredSlotIndex === index}
          onSelect={onSelect}
          onDropShopToSlot={onDropShopToSlot}
          onSlotMeasure={measureSlot}
          slotRef={(node) => {
            slotRefs.current[index] = node;
          }}
          onTeamDragStart={onTeamDragStart}
          onTeamDragMove={onTeamDragMove}
          onTeamDragEnd={onTeamDragEnd}
        />
      ))}
    </View>
  );
}

interface TeamSlotProps {
  index: number;
  unit: UnitInstance | null;
  selected: boolean;
  compact?: boolean;
  selectedShopIndex?: number;
  showPlacementHint?: boolean;
  dropActive?: boolean;
  onSelect: (id: string | null) => void;
  onDropShopToSlot?: (shopIndex: number, teamIndex: number) => void;
  onSlotMeasure: (index: number) => void;
  slotRef: (node: View | null) => void;
  onTeamDragStart?: (teamIndex: number, x: number, y: number) => void;
  onTeamDragMove?: (x: number, y: number) => void;
  onTeamDragEnd?: (teamIndex: number, x: number, y: number) => void;
}

function TeamSlot({
  index,
  unit,
  selected,
  compact,
  selectedShopIndex,
  showPlacementHint,
  dropActive,
  onSelect,
  onDropShopToSlot,
  onSlotMeasure,
  slotRef,
  onTeamDragStart,
  onTeamDragMove,
  onTeamDragEnd,
}: TeamSlotProps) {
  const draggingRef = useRef(false);
  const grantPointRef = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Boolean(unit),
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Boolean(unit) && (Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4),
        onPanResponderGrant: (event) => {
          draggingRef.current = false;
          grantPointRef.current = { x: event.nativeEvent.pageX, y: event.nativeEvent.pageY };
        },
        onPanResponderMove: (event, gestureState) => {
          if (!unit) {
            return;
          }

          if (!draggingRef.current && (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6)) {
            draggingRef.current = true;
            onSelect(unit.instanceId);
            onTeamDragStart?.(index, grantPointRef.current.x, grantPointRef.current.y);
          }

          if (draggingRef.current) {
            onTeamDragMove?.(event.nativeEvent.pageX, event.nativeEvent.pageY);
          }
        },
        onPanResponderRelease: (event) => {
          if (draggingRef.current) {
            onTeamDragEnd?.(index, event.nativeEvent.pageX, event.nativeEvent.pageY);
          } else if (!unit && selectedShopIndex !== undefined && selectedShopIndex >= 0) {
            onDropShopToSlot?.(selectedShopIndex, index);
          } else {
            onSelect(unit?.instanceId ?? null);
          }
          draggingRef.current = false;
        },
        onPanResponderTerminate: (event) => {
          if (draggingRef.current) {
            onTeamDragEnd?.(index, event.nativeEvent.pageX, event.nativeEvent.pageY);
          }
          draggingRef.current = false;
        },
      }),
    [index, onDropShopToSlot, onSelect, onTeamDragEnd, onTeamDragMove, onTeamDragStart, selectedShopIndex, unit],
  );

  return (
    <View
      ref={slotRef}
      onLayout={() => onSlotMeasure(index)}
      {...(unit ? panResponder.panHandlers : {})}
    >
      <UnitCard
        unit={unit}
        selected={selected}
        onPress={() => {
          if (!unit && selectedShopIndex !== undefined && selectedShopIndex >= 0) {
            onDropShopToSlot?.(selectedShopIndex, index);
            return;
          }

          onSelect(unit?.instanceId ?? null);
        }}
        compact={compact}
        mode="team"
        showPlacementHint={showPlacementHint}
        dropActive={!unit && dropActive}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  rowCompact: {
    gap: 5,
  },
});
