import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getUnitSprite, getUnitSpriteTuning } from "../../data/unitSprites";
import type { ShopSlot, UnitInstance } from "../../domain/types";

const webInteractiveStyle =
  Platform.OS === "web"
    ? ({
        userSelect: "none",
        WebkitUserSelect: "none",
        cursor: "pointer",
      } as any)
    : null;

interface UnitCardProps {
  unit: UnitInstance | ShopSlot["unit"] | null;
  selected?: boolean;
  frozen?: boolean;
  onPress?: () => void;
  footer?: ReactNode;
  compact?: boolean;
  mode?: "team" | "shop";
  showPlacementHint?: boolean;
  dropActive?: boolean;
  webDragProps?: Record<string, unknown>;
}

export function UnitCard({
  unit,
  selected,
  frozen,
  onPress,
  footer,
  compact,
  mode = "shop",
  showPlacementHint,
  dropActive,
  webDragProps,
}: UnitCardProps) {
  const tuning = unit ? getUnitSpriteTuning(unit.spriteKey) : null;

  if (mode === "team") {
    if (!unit) {
      return (
        <Pressable onPress={onPress} style={styles.emptySlotWrap}>
          {showPlacementHint ? <PlacementArrow compact={compact} /> : null}
          <View
            style={[
              styles.stoneSlot,
              compact && styles.stoneSlotCompact,
              showPlacementHint && styles.stoneSlotHint,
              dropActive && styles.stoneSlotDropActive,
            ]}
          />
        </Pressable>
      );
    }

    return (
      <Pressable
        onPress={onPress}
        style={[
          styles.heroToken,
          styles.teamToken,
          compact && styles.heroTokenCompact,
          compact && styles.teamTokenCompact,
          selected && styles.heroTokenSelected,
        ]}
      >
        <Image
          source={getUnitSprite(unit.spriteKey)}
          style={[
            compact ? styles.teamHeroImageCompact : styles.teamHeroImage,
            {
              transform: [{ scale: tuning?.scale ?? 1 }],
              marginTop: tuning?.offsetY ?? 0,
            },
          ]}
          resizeMode="contain"
        />
        <StatsRow attack={unit.attack} health={unit.health} compact={compact} />
      </Pressable>
    );
  }

  if (!unit) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      {...(webDragProps as any)}
      style={[
        styles.heroToken,
        styles.shopToken,
        compact && styles.heroTokenCompact,
        compact && styles.shopTokenCompact,
        selected && styles.heroTokenSelected,
        frozen && styles.heroTokenFrozen,
        webInteractiveStyle,
      ]}
    >
      <View
        style={[
          styles.tierChip,
          compact && styles.tierChipCompact,
          {
            backgroundColor: unit.accent,
            transform: [
              { translateX: tuning?.tierOffsetX ?? 0 },
              { translateY: tuning?.tierOffsetY ?? 0 },
            ],
          },
        ]}
      >
        <Text style={[styles.tierChipText, compact && styles.tierChipTextCompact]}>{unit.tier}</Text>
      </View>
      <Image
        source={getUnitSprite(unit.spriteKey)}
        style={[
          compact ? styles.shopHeroImageCompact : styles.shopHeroImage,
          {
            transform: [{ scale: tuning?.scale ?? 1 }],
            marginTop: tuning?.offsetY ?? 0,
          },
        ]}
        resizeMode="contain"
      />
      <StatsRow attack={unit.attack} health={unit.health} compact={compact} />
      {footer}
    </Pressable>
  );
}

function StatsRow({ attack, health, compact }: { attack: number; health: number; compact?: boolean }) {
  return (
    <View style={[styles.statsRow, compact && styles.statsRowCompact]}>
      <StatBadge label="ATK" value={attack} color="#17120f" compact={compact} />
      <StatBadge label="HP" value={health} color="#a82f29" compact={compact} />
    </View>
  );
}

function StatBadge({
  label,
  value,
  color,
  compact,
}: {
  label: string;
  value: number;
  color: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.statBadge, compact && styles.statBadgeCompact]}>
      <View style={[styles.statPill, compact && styles.statPillCompact, { backgroundColor: color }]}>
        <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, compact && styles.statValueCompact]}>{value}</Text>
    </View>
  );
}

function PlacementArrow({ compact }: { compact?: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 5,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -2,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [translateY]);

  return (
    <Animated.Text
      style={[
        styles.placementArrow,
        compact && styles.placementArrowCompact,
        { transform: [{ translateY }] },
      ]}
    >
      ↓
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  emptySlotWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: 88,
    height: 42,
  },
  placementArrow: {
    position: "absolute",
    top: -34,
    color: "#ffffff",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 40,
    zIndex: 3,
    textShadowColor: "rgba(0, 0, 0, 0.35)",
    textShadowRadius: 5,
    textShadowOffset: { width: 0, height: 2 },
  },
  placementArrowCompact: {
    top: -24,
    fontSize: 28,
    lineHeight: 28,
  },
  stoneSlot: {
    width: 88,
    height: 42,
    borderRadius: 20,
    backgroundColor: "#9d9a89",
    borderWidth: 3,
    borderColor: "#746f60",
  },
  stoneSlotHint: {
    backgroundColor: "#cbc5a4",
    borderColor: "#f6f0cc",
  },
  stoneSlotDropActive: {
    backgroundColor: "#fff4ba",
    borderColor: "#ff9f1a",
    transform: [{ scale: 1.04 }],
  },
  stoneSlotCompact: {
    width: 64,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
  },
  heroToken: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 2,
    paddingVertical: 0,
  },
  heroTokenCompact: {
    paddingHorizontal: 1,
  },
  teamToken: {
    width: 156,
    minHeight: 156,
    marginTop: -30,
  },
  teamTokenCompact: {
    width: 118,
    minHeight: 118,
    marginTop: -18,
  },
  shopToken: {
    width: 156,
    minHeight: 156,
    paddingTop: 4,
    marginTop: -30,
  },
  shopTokenCompact: {
    width: 118,
    minHeight: 118,
    marginTop: -18,
    paddingTop: 3,
  },
  heroTokenSelected: {
    transform: [{ scale: 1.03 }],
  },
  heroTokenFrozen: {
    opacity: 0.76,
  },
  shopHeroImage: {
    width: 156,
    height: 156,
    marginBottom: -18,
  },
  shopHeroImageCompact: {
    width: 112,
    height: 112,
    marginBottom: -10,
  },
  teamHeroImage: {
    width: 156,
    height: 156,
    marginBottom: -18,
  },
  teamHeroImageCompact: {
    width: 112,
    height: 112,
    marginBottom: -10,
  },
  tierChip: {
    position: "absolute",
    top: 14,
    left: 94,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1f150e",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  tierChipCompact: {
    top: 10,
    left: 68,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
  },
  tierChipText: {
    color: "#17120f",
    fontSize: 13,
    fontWeight: "900",
  },
  tierChipTextCompact: {
    fontSize: 10,
  },
  statsRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: -10,
  },
  statsRowCompact: {
    marginTop: -6,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#17120f",
    backgroundColor: "#fff7df",
    overflow: "hidden",
  },
  statBadgeCompact: {
    borderRadius: 10,
  },
  statPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statPillCompact: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  statLabel: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
  },
  statLabelCompact: {
    fontSize: 7,
  },
  statValue: {
    minWidth: 18,
    paddingHorizontal: 5,
    color: "#17120f",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
  },
  statValueCompact: {
    minWidth: 14,
    paddingHorizontal: 3,
    fontSize: 9,
  },
});
