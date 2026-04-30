import { StyleSheet, Text, View } from "react-native";

interface TopBarProps {
  gold: number;
  lives: number;
  wins: number;
  turn: number;
  tier: number;
  compact?: boolean;
}

export function TopBar({ gold, lives, wins, turn, tier, compact }: TopBarProps) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Stat icon="🪙" value={gold} compact={compact} />
      <Stat icon="❤" value={lives} compact={compact} />
      <Stat icon="⌛" value={turn} compact={compact} />
      <Stat icon="🏆" value={`${wins}/10`} compact={compact} />
      <Stat icon="★" value={tier} compact={compact} />
    </View>
  );
}

function Stat({ icon, value, compact }: { icon: string; value: string | number; compact?: boolean }) {
  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <Text style={[styles.icon, compact && styles.iconCompact]}>{icon}</Text>
      <Text style={[styles.value, compact && styles.valueCompact]}>{value}</Text>
    </View>
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
    minWidth: 84,
    height: 42,
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
    minWidth: 60,
    height: 30,
    paddingHorizontal: 7,
    borderRadius: 9,
    borderWidth: 2,
  },
  icon: {
    fontSize: 18,
  },
  iconCompact: {
    fontSize: 13,
  },
  value: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "900",
  },
  valueCompact: {
    fontSize: 14,
  },
});
