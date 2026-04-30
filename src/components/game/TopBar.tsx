import { Pressable, StyleSheet, Text, View } from "react-native";

import { SpriteIcon } from "../ui/SpriteIcon";

export type TopBarStatKey = "gold" | "lives" | "turn" | "wins" | "tier";

interface TopBarProps {
  gold: number;
  lives: number;
  wins: number;
  turn: number;
  tier: number;
  compact?: boolean;
  onStatPress?: (stat: TopBarStatKey) => void;
}

export function TopBar({ gold, lives, wins, turn, tier, compact, onStatPress }: TopBarProps) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Stat icon="gold" value={gold} compact={compact} onPress={onStatPress} />
      <Stat icon="lives" value={lives} compact={compact} onPress={onStatPress} />
      <Stat icon="turn" value={turn} compact={compact} onPress={onStatPress} />
      <Stat icon="wins" value={`${wins}/10`} compact={compact} onPress={onStatPress} />
      <Stat icon="tier" value={tier} compact={compact} onPress={onStatPress} />
    </View>
  );
}

function Stat({
  icon,
  value,
  compact,
  onPress,
}: {
  icon: TopBarStatKey;
  value: string | number;
  compact?: boolean;
  onPress?: (stat: TopBarStatKey) => void;
}) {
  return (
    <Pressable style={[styles.card, compact && styles.cardCompact]} onPress={() => onPress?.(icon)}>
      <SpriteIcon icon={icon} size={compact ? 28 : 40} />
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    alignSelf: "flex-start",
  },
  rowCompact: {
    gap: 5,
  },
  card: {
    minWidth: 100,
    height: 56,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#fff9ef",
    borderWidth: 3,
    borderColor: "#111111",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardCompact: {
    minWidth: 72,
    height: 40,
    paddingHorizontal: 7,
    borderRadius: 9,
    borderWidth: 2,
  },
  value: {
    color: "#111111",
    fontSize: 18,
    fontWeight: "900",
  },
  valueCompact: {
    fontSize: 13,
  },
});
