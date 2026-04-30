import { useMemo, useRef } from "react";
import { PanResponder, Platform, StyleSheet, View, useWindowDimensions } from "react-native";

import { getHeroViewportProfile, HERO_LAYOUT_CONFIG } from "../../constants/heroLayoutConfig";
import type { ShopSlot } from "../../domain/types";
import { UnitCard } from "./UnitCard";

interface ShopRowProps {
  shop: ShopSlot[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  compact?: boolean;
  onTouchDragStart?: (shopIndex: number, x: number, y: number) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: (shopIndex: number, x: number, y: number) => void;
}

export function ShopRow({
  shop,
  selectedId,
  onSelect,
  compact,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: ShopRowProps) {
  const visibleShop = shop.slice(0, 3);
  const { width } = useWindowDimensions();
  const profileKey = getHeroViewportProfile(compact ? 820 : 1000, compact ? 430 : 500);
  const profile = HERO_LAYOUT_CONFIG.profiles[profileKey];
  const rowGap = profile.spacing.shopGap;
  const slotMaxWidth = Math.max(
    62,
    Math.min(
      profile.spacing.shopSlotMaxWidth,
      Math.floor((width * 0.55 - rowGap * (visibleShop.length - 1)) / visibleShop.length),
    ),
  );

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={[styles.row, { gap: rowGap }]}>
        {visibleShop.map((slot, index) => (
          <DraggableShopSlot
            key={slot.slotId}
            slot={slot}
            index={index}
            selected={slot.slotId === selectedId}
            onSelect={onSelect}
            compact={compact}
            slotMaxWidth={slotMaxWidth}
            onTouchDragStart={onTouchDragStart}
            onTouchDragMove={onTouchDragMove}
            onTouchDragEnd={onTouchDragEnd}
          />
        ))}
      </View>
    </View>
  );
}

interface DraggableShopSlotProps {
  slot: ShopSlot;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
  slotMaxWidth: number;
  onTouchDragStart?: (shopIndex: number, x: number, y: number) => void;
  onTouchDragMove?: (x: number, y: number) => void;
  onTouchDragEnd?: (shopIndex: number, x: number, y: number) => void;
}

function DraggableShopSlot({
  slot,
  index,
  selected,
  onSelect,
  compact,
  slotMaxWidth,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: DraggableShopSlotProps) {
  if (!slot.unit) {
    return <View style={[styles.slot, { maxWidth: slotMaxWidth }]} />;
  }

  const draggingRef = useRef(false);
  const grantPointRef = useRef({ x: 0, y: 0 });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4,
        onPanResponderGrant: (event) => {
          draggingRef.current = false;
          grantPointRef.current = {
            x: event.nativeEvent.pageX,
            y: event.nativeEvent.pageY,
          };
          onSelect(slot.slotId);
        },
        onPanResponderMove: (event, gestureState) => {
          if (!draggingRef.current && (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6)) {
            draggingRef.current = true;
            onSelect(slot.slotId);
            onTouchDragStart?.(index, grantPointRef.current.x, grantPointRef.current.y);
          }

          if (draggingRef.current) {
            onTouchDragMove?.(event.nativeEvent.pageX, event.nativeEvent.pageY);
          }
        },
        onPanResponderRelease: (event) => {
          if (draggingRef.current) {
            onTouchDragEnd?.(index, event.nativeEvent.pageX, event.nativeEvent.pageY);
          } else {
            onSelect(slot.slotId);
          }
          draggingRef.current = false;
        },
        onPanResponderTerminate: (event) => {
          if (draggingRef.current) {
            onTouchDragEnd?.(index, event.nativeEvent.pageX, event.nativeEvent.pageY);
          } else {
            onSelect(slot.slotId);
          }
          draggingRef.current = false;
        },
      }),
    [index, onSelect, onTouchDragEnd, onTouchDragMove, onTouchDragStart, slot.slotId],
  );

  return (
    <View style={[styles.slot, { maxWidth: slotMaxWidth }]} {...panResponder.panHandlers}>
      <UnitCard
        unit={slot.unit}
        selected={selected}
        frozen={slot.frozen}
        onPress={() => onSelect(slot.slotId)}
        compact={compact}
        mode="shop"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  wrapperCompact: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
  },
  slot: {
    flex: 1,
  },
});
