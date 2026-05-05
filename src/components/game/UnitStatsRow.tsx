import { Animated, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { SpriteIcon } from "../ui/SpriteIcon";
import { useFlashOnChange } from "../ui/useFlashOnChange";

type StatIcon = "attack" | "health";
type StatSize = "normal" | "compact" | "battle";

interface UnitStatsRowProps {
  attack: number;
  health: number;
  attackHighlight?: boolean;
  healthHighlight?: boolean;
  gap?: number;
  marginTop?: number;
  size?: StatSize;
  style?: StyleProp<ViewStyle>;
}

export function UnitStatsRow({
  attack,
  health,
  attackHighlight,
  healthHighlight,
  gap = 4,
  marginTop = 0,
  size = "normal",
  style,
}: UnitStatsRowProps) {
  return (
    <View style={[styles.row, { gap, marginTop }, style]}>
      <StatBadge icon="attack" value={attack} size={size} highlightOnMount={attackHighlight} />
      <StatBadge icon="health" value={health} size={size} highlightOnMount={healthHighlight} />
    </View>
  );
}

function StatBadge({
  icon,
  value,
  size,
  highlightOnMount,
}: {
  icon: StatIcon;
  value: number;
  size: StatSize;
  highlightOnMount?: boolean;
}) {
  const { scale, glow } = useFlashOnChange(value, highlightOnMount);
  const metrics = STAT_METRICS[size];

  return (
    <View style={[styles.badge, { width: metrics.badgeWidth, height: metrics.badgeHeight }]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: metrics.glowSize,
            height: metrics.glowSize,
            borderRadius: metrics.glowSize / 2,
            opacity: glow,
            transform: [
              {
                scale: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1.35],
                }),
              },
            ],
          },
        ]}
      />
      <SpriteIcon icon={icon} size={metrics.iconSize} trim={1} />
      <Animated.Text
        style={[
          styles.value,
          {
            fontSize: metrics.fontSize,
            lineHeight: metrics.badgeHeight,
            transform: [{ scale }],
          },
        ]}
      >
        {value}
      </Animated.Text>
    </View>
  );
}

const STAT_METRICS: Record<
  StatSize,
  {
    badgeWidth: number;
    badgeHeight: number;
    iconSize: number;
    fontSize: number;
    glowSize: number;
  }
> = {
  normal: {
    badgeWidth: 42,
    badgeHeight: 38,
    iconSize: 40,
    fontSize: 14,
    glowSize: 36,
  },
  compact: {
    badgeWidth: 34,
    badgeHeight: 31,
    iconSize: 32,
    fontSize: 12,
    glowSize: 28,
  },
  battle: {
    badgeWidth: 38,
    badgeHeight: 32,
    iconSize: 28,
    fontSize: 12,
    glowSize: 30,
  },
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  glow: {
    position: "absolute",
    backgroundColor: "rgba(255, 215, 70, 0.85)",
  },
  value: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    color: "#ffffff",
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  },
});
