import { Pressable, StyleSheet, Text, View } from "react-native";

import type { ShopSlot } from "../../domain/types";
import { palette } from "../../constants/theme";
import { UnitCard } from "./UnitCard";

interface ShopRowProps {
  shop: ShopSlot[];
  selectedId: string | null;
  onBuy: (index: number) => void;
  onFreeze: (index: number) => void;
  onSelect: (id: string) => void;
}

export function ShopRow({ shop, selectedId, onBuy, onFreeze, onSelect }: ShopRowProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Магазин</Text>
      <View style={styles.row}>
        {shop.map((slot, index) => (
          <View key={slot.slotId} style={styles.slot}>
            <UnitCard
              unit={slot.unit}
              selected={slot.slotId === selectedId}
              frozen={slot.frozen}
              onPress={() => onSelect(slot.slotId)}
            />
            <View style={styles.actions}>
              <ActionButton label="Купить" onPress={() => onBuy(index)} />
              <ActionButton
                label={slot.frozen ? "Разморозить" : "Заморозить"}
                onPress={() => onFreeze(index)}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  title: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  slot: {
    flex: 1,
    gap: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
  },
  buttonText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
  },
});
