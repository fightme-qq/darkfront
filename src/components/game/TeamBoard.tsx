import { StyleSheet, Text, View } from "react-native";

import type { UnitInstance } from "../../domain/types";
import { palette } from "../../constants/theme";
import { UnitCard } from "./UnitCard";

interface TeamBoardProps {
  team: Array<UnitInstance | null>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function TeamBoard({ team, selectedId, onSelect }: TeamBoardProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Отряд</Text>
      <View style={styles.row}>
        {team.map((unit, index) => (
          <UnitCard
            key={unit?.instanceId ?? `empty-${index}`}
            unit={unit}
            title={unit ? `Слот ${index + 1}` : undefined}
            selected={unit?.instanceId === selectedId}
            onPress={() => onSelect(unit?.instanceId ?? null)}
          />
        ))}
      </View>
    </View>
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
});
