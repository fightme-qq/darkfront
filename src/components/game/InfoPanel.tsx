import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "../../constants/theme";
import type { ShopSlot, UnitInstance } from "../../domain/types";

interface InfoPanelProps {
  selected: UnitInstance | ShopSlot | null;
  battleSummary: string;
  onSellSelected?: () => void;
}

export function InfoPanel({ selected, battleSummary, onSellSelected }: InfoPanelProps) {
  const unit = selected ? ("unit" in selected ? selected.unit : selected) : null;
  const canSell = Boolean(onSellSelected && selected && !("unit" in selected));

  return (
    <View style={styles.panel}>
      <Text style={styles.header}>Подсказка</Text>
      {unit ? (
        <>
          <Text style={styles.name}>{unit.name}</Text>
          <Text style={styles.meta}>Тир {unit.tier}</Text>
          <Text style={styles.ability}>{unit.ability}</Text>
          <Text style={styles.meta}>⚔ {unit.attack}   ❤ {unit.health}</Text>
          {canSell ? (
            <Pressable style={styles.sellButton} onPress={onSellSelected}>
              <Text style={styles.sellText}>Продать за 1 золото</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <Text style={styles.ability}>
          Выбери юнита из отряда или магазина. Здесь будет его краткое описание и действия.
        </Text>
      )}
      <View style={styles.divider} />
      <Text style={styles.header}>Последний бой</Text>
      <Text style={styles.ability}>{battleSummary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: 260,
    padding: 16,
    borderRadius: 18,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 8,
  },
  header: {
    color: palette.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  name: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
  },
  meta: {
    color: palette.accentAlt,
    fontSize: 13,
    fontWeight: "700",
  },
  ability: {
    color: palette.text,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 4,
  },
  sellButton: {
    marginTop: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: palette.accent,
    alignItems: "center",
  },
  sellText: {
    color: palette.text,
    fontWeight: "800",
  },
});
