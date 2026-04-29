import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette } from "../../constants/theme";

interface ActionBarProps {
  onRoll: () => void;
  onBattle: () => void;
}

export function ActionBar({ onRoll, onBattle }: ActionBarProps) {
  return (
    <View style={styles.row}>
      <Pressable style={[styles.button, styles.secondary]} onPress={onRoll}>
        <Text style={styles.secondaryText}>Roll за 1</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.primary]} onPress={onBattle}>
        <Text style={styles.primaryText}>Начать бой</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondary: {
    backgroundColor: palette.panel,
    borderWidth: 1,
    borderColor: palette.border,
  },
  primary: {
    backgroundColor: palette.accent,
  },
  secondaryText: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
  primaryText: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },
});
