import { Pressable, StyleSheet, Text, View } from "react-native";

interface AdminPanelProps {
  compact?: boolean;
  onGoldMax: () => void;
  onAddGold: () => void;
  onNextTurn: () => void;
  onTier3: () => void;
  onReroll: () => void;
}

export function AdminPanel({
  compact,
  onGoldMax,
  onAddGold,
  onNextTurn,
  onTier3,
  onReroll,
}: AdminPanelProps) {
  return (
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <Text style={[styles.title, compact && styles.titleCompact]}>ADMIN</Text>
      <View style={styles.row}>
        <AdminButton label="Gold 99" compact={compact} onPress={onGoldMax} />
        <AdminButton label="+10" compact={compact} onPress={onAddGold} />
        <AdminButton label="+Turn" compact={compact} onPress={onNextTurn} />
        <AdminButton label="Tier 3" compact={compact} onPress={onTier3} />
        <AdminButton label="Roll" compact={compact} onPress={onReroll} />
      </View>
    </View>
  );
}

function AdminButton({
  label,
  compact,
  onPress,
}: {
  label: string;
  compact?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.button, compact && styles.buttonCompact]} onPress={onPress}>
      <Text style={[styles.buttonText, compact && styles.buttonTextCompact]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#16110b",
    backgroundColor: "rgba(255, 249, 239, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 5,
  },
  panelCompact: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 3,
  },
  title: {
    color: "#da5d14",
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    minWidth: 54,
    minHeight: 28,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#201408",
    backgroundColor: "#ffae2d",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  buttonCompact: {
    minWidth: 43,
    minHeight: 23,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 4,
  },
  buttonText: {
    color: "#3a2109",
    fontSize: 10,
    fontWeight: "900",
  },
  buttonTextCompact: {
    fontSize: 8,
  },
});
