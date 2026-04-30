import { Pressable, StyleSheet, Text, View } from "react-native";

interface ActionBarProps {
  onRoll: () => void;
  onFreeze: () => void;
  onBattle: () => void;
  canFreeze: boolean;
  compact?: boolean;
}

export function ActionBar({ onRoll, onFreeze, onBattle, canFreeze, compact }: ActionBarProps) {
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Pressable style={[styles.button, compact && styles.buttonCompact]} onPress={onRoll}>
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>Рулетка</Text>
      </Pressable>
      <Pressable
        style={[styles.button, compact && styles.buttonCompact, !canFreeze && styles.buttonDisabled]}
        onPress={onFreeze}
      >
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>Заморозить</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.centerButton, compact && styles.buttonCompact]} onPress={onBattle}>
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>Конец хода</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 22,
  },
  rowCompact: {
    gap: 10,
    paddingHorizontal: 6,
  },
  button: {
    flex: 1,
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: "#16110b",
    backgroundColor: "#ef7f1a",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  centerButton: {
    flex: 1.35,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonCompact: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 3,
  },
  buttonText: {
    color: "#5e2205",
    fontSize: 22,
    fontWeight: "900",
  },
  buttonTextCompact: {
    fontSize: 16,
  },
});
