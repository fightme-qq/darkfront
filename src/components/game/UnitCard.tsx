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

import { getHeroViewportProfile, HERO_LAYOUT_CONFIG } from "../../constants/heroLayoutConfig";
import { getUnitSprite, getUnitSpriteTuning } from "../../data/unitSprites";
import type { ShopSlot, UnitInstance } from "../../domain/types";
import { SpriteIcon } from "../ui/SpriteIcon";

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
  const profileKey = getHeroViewportProfile(compact ? 820 : 1000, compact ? 430 : 500);
  const profile = HERO_LAYOUT_CONFIG.profiles[profileKey];
  const teamTokenConfig = profile.tokens.team;
  const shopTokenConfig = profile.tokens.shop;
  const tierConfig = profile.tierBadge;
  const statsConfig = profile.stats;

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
          {
            width: teamTokenConfig.width,
            minHeight: teamTokenConfig.minHeight,
            marginTop: teamTokenConfig.marginTop,
          },
          compact && styles.heroTokenCompact,
        ]}
      >
        {selected ? <SelectionCorners compact={compact} /> : null}
        <HeroSprite
          spriteKey={unit.spriteKey}
          compact={compact}
          mode="team"
          offsetX={tuning?.offsetX ?? 0}
          offsetY={tuning?.offsetY ?? 0}
          scale={tuning?.scale ?? 1}
        />
        <StatsRow attack={unit.attack} health={unit.health} compact={compact} config={statsConfig} />
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
        {
          width: shopTokenConfig.width,
          minHeight: shopTokenConfig.minHeight,
          marginTop: shopTokenConfig.marginTop,
        },
        compact && styles.heroTokenCompact,
        frozen && styles.heroTokenFrozen,
        webInteractiveStyle,
      ]}
    >
      {selected ? <SelectionCorners compact={compact} /> : null}
      <View
        style={[
          styles.tierChip,
          compact && styles.tierChipCompact,
          {
            backgroundColor: unit.accent,
            top: tierConfig.top,
            right: tierConfig.right,
            transform: [
              { translateX: tuning?.tierOffsetX ?? 0 },
              { translateY: tuning?.tierOffsetY ?? 0 },
            ],
          },
        ]}
      >
        <Text style={[styles.tierChipText, compact && styles.tierChipTextCompact]}>{unit.tier}</Text>
      </View>
      <HeroSprite
        spriteKey={unit.spriteKey}
        compact={compact}
        mode="shop"
        offsetX={tuning?.offsetX ?? 0}
        offsetY={tuning?.offsetY ?? 0}
        scale={tuning?.scale ?? 1}
      />
      <StatsRow attack={unit.attack} health={unit.health} compact={compact} config={statsConfig} />
      {footer}
    </Pressable>
  );
}

function HeroSprite({
  spriteKey,
  compact,
  mode,
  offsetX,
  offsetY,
  scale,
}: {
  spriteKey: UnitInstance["spriteKey"];
  compact?: boolean;
  mode: "team" | "shop";
  offsetX: number;
  offsetY: number;
  scale: number;
}) {
  const profileKey = getHeroViewportProfile(compact ? 820 : 1000, compact ? 430 : 500);
  const tokenConfig =
    mode === "team"
      ? HERO_LAYOUT_CONFIG.profiles[profileKey].tokens.team
      : HERO_LAYOUT_CONFIG.profiles[profileKey].tokens.shop;

  return (
    <View style={[styles.spriteStage, { height: tokenConfig.stageHeight }]}>
      <View
        style={[
          styles.spriteAnchor,
          {
            width: tokenConfig.imageSize,
            height: tokenConfig.imageSize,
            marginLeft: -(tokenConfig.imageSize / 2),
            bottom: tokenConfig.baselineBottom,
          },
        ]}
      >
        <Image
          source={getUnitSprite(spriteKey)}
          style={{
            width: tokenConfig.imageSize,
            height: tokenConfig.imageSize,
            transform: [{ translateX: offsetX }, { translateY: offsetY }, { scale }],
          }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

function StatsRow({
  attack,
  health,
  compact,
  config,
}: {
  attack: number;
  health: number;
  compact?: boolean;
  config: { marginTop: number; gap: number };
}) {
  return (
    <View style={[styles.statsRow, { marginTop: config.marginTop, gap: config.gap }]}>
      <StatBadge icon="attack" value={attack} compact={compact} />
      <StatBadge icon="health" value={health} compact={compact} />
    </View>
  );
}

function StatBadge({
  icon,
  value,
  compact,
}: {
  icon: "attack" | "health";
  value: number;
  compact?: boolean;
}) {
  return (
    <View style={[styles.statBadge, compact && styles.statBadgeCompact]}>
      <SpriteIcon icon={icon} size={compact ? 26 : 34} trim={1} />
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

function SelectionCorners({ compact }: { compact?: boolean }) {
  const pulse = useRef(new Animated.Value(0.72)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.72,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View pointerEvents="none" style={styles.selectionOverlay}>
      <Animated.View
        style={[styles.selectionCorner, styles.cornerTopLeft, compact && styles.selectionCornerCompact, { opacity: pulse }]}
      />
      <Animated.View
        style={[styles.selectionCorner, styles.cornerTopRight, compact && styles.selectionCornerCompact, { opacity: pulse }]}
      />
      <Animated.View
        style={[styles.selectionCorner, styles.cornerBottomLeft, compact && styles.selectionCornerCompact, { opacity: pulse }]}
      />
      <Animated.View
        style={[styles.selectionCorner, styles.cornerBottomRight, compact && styles.selectionCornerCompact, { opacity: pulse }]}
      />
    </View>
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
  heroTokenFrozen: {
    opacity: 0.76,
  },
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  selectionCorner: {
    position: "absolute",
    width: 16,
    height: 16,
    borderColor: "#ffd34d",
  },
  selectionCornerCompact: {
    width: 12,
    height: 12,
  },
  cornerTopLeft: {
    top: 6,
    left: 6,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTopRight: {
    top: 6,
    right: 6,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBottomLeft: {
    bottom: 20,
    left: 6,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBottomRight: {
    bottom: 20,
    right: 6,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  spriteStage: {
    width: "100%",
    position: "relative",
    overflow: "visible",
  },
  spriteAnchor: {
    position: "absolute",
    left: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  tierChip: {
    position: "absolute",
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1f150e",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  tierChipCompact: {
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
    alignItems: "center",
  },
  statBadge: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  statBadgeCompact: {
    width: 26,
    height: 26,
  },
  statValue: {
    position: "absolute",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
  statValueCompact: {
    fontSize: 10,
  },
});
