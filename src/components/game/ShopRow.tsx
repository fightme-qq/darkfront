import { useMemo, useRef } from "react";
import { Image, PanResponder, Platform, StyleSheet, View, useWindowDimensions } from "react-native";

import { getHeroViewportProfile, HERO_LAYOUT_CONFIG } from "../../constants/heroLayoutConfig";
import type { ShopSlot } from "../../domain/types";
import { UnitCard } from "./UnitCard";

const LEFT_SHOP_DECOR = require("../../../assets/f76bb0f8-d20d-4414-87f8-702c77d2b428.png");

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
  const slotWidth = Math.max(
    62,
    Math.min(
      profile.spacing.shopSlotMaxWidth,
      Math.floor((width * 0.55 - rowGap * (visibleShop.length - 1)) / visibleShop.length),
    ),
  );
  const slotHeight = Math.max(
    72,
    Math.floor((slotWidth / Math.max(1, profile.tokens.shop.width)) * profile.tokens.shop.minHeight),
  );
  const rowWidth = visibleShop.length * slotWidth + rowGap * (visibleShop.length - 1);
  const decorSize = Math.round(slotWidth * 2.5);
  const decorLeftOffset = Math.round(decorSize * 0.78);

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <View style={styles.rowCenter}>
        <View style={[styles.row, { gap: rowGap, width: rowWidth }]}>
          <Image
            source={LEFT_SHOP_DECOR}
            resizeMode="contain"
            style={[
              styles.shopDecor,
              {
                width: decorSize,
                height: decorSize,
                left: -decorLeftOffset,
              },
            ]}
          />
          {visibleShop.map((slot, index) => (
            <DraggableShopSlot
              key={slot.slotId}
              slot={slot}
              index={index}
              selected={slot.slotId === selectedId}
              onSelect={onSelect}
              compact={compact}
              slotWidth={slotWidth}
              slotHeight={slotHeight}
              onTouchDragStart={onTouchDragStart}
              onTouchDragMove={onTouchDragMove}
              onTouchDragEnd={onTouchDragEnd}
            />
          ))}
        </View>
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
  slotWidth: number;
  slotHeight: number;
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
  slotWidth,
  slotHeight,
  onTouchDragStart,
  onTouchDragMove,
  onTouchDragEnd,
}: DraggableShopSlotProps) {
  if (!slot.unit) {
    return <View style={[styles.slot, { width: slotWidth, minHeight: slotHeight }]} />;
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
    <View style={[styles.slot, { width: slotWidth, minHeight: slotHeight }]} {...panResponder.panHandlers}>
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
    overflow: "visible",
  },
  wrapperCompact: {
    gap: 4,
  },
  rowCenter: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  row: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    overflow: "visible",
  },
  shopDecor: {
    position: "absolute",
    bottom: -50,
    zIndex: 1,
    pointerEvents: "none",
  },
  slot: {
    zIndex: 2,
  },
});
