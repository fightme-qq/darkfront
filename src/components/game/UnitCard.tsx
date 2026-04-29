import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ShopSlot, UnitInstance } from "../../domain/types";
import { palette } from "../../constants/theme";

interface UnitCardProps {
  unit: UnitInstance | ShopSlot["unit"] | null;
  title?: string;
  selected?: boolean;
  frozen?: boolean;
  onPress?: () => void;
  footer?: React.ReactNode;
}

export function UnitCard({ unit, title, selected, frozen, onPress, footer }: UnitCardProps) {
  if (!unit) {
    return <View style={[styles.card, styles.empty]}><Text style={styles.emptyText}>Пусто</Text></View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: selected ? unit.accent : palette.border, backgroundColor: palette.panelAlt },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: unit.accent }]}>
        <Text style={styles.badgeText}>T{unit.tier}</Text>
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.name}>{unit.name}</Text>
      <Text numberOfLines={2} style={styles.ability}>
        {unit.ability}
      </Text>
      <View style={styles.stats}>
        <Text style={styles.stat}>⚔ {unit.attack}</Text>
        <Text style={styles.stat}>❤ {unit.health}</Text>
      </View>
      {frozen ? <Text style={styles.freeze}>Заморожен</Text> : null}
      {footer}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  empty: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: palette.slot,
    borderStyle: "dashed",
  },
  emptyText: {
    color: palette.textMuted,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: "#0b0f17",
    fontWeight: "800",
    fontSize: 11,
  },
  title: {
    color: palette.textMuted,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  name: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  ability: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 16,
    minHeight: 32,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
  stat: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
  },
  freeze: {
    color: palette.accentAlt,
    fontSize: 11,
    fontWeight: "700",
  },
});
