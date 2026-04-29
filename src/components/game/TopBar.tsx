import { StyleSheet, Text, View } from "react-native";

import { palette } from "../../constants/theme";

interface TopBarProps {
  gold: number;
  lives: number;
  wins: number;
  turn: number;
  tier: number;
}

export function TopBar({ gold, lives, wins, turn, tier }: TopBarProps) {
  return (
    <View style={styles.row}>
      <Stat title="Золото" value={gold} />
      <Stat title="Жизни" value={lives} />
      <Stat title="Победы" value={`${wins}/10`} />
      <Stat title="Ход" value={turn} />
      <Stat title="Тир" value={tier} />
    </View>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 14,
  },
  label: {
    color: palette.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  value: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "700",
  },
});
