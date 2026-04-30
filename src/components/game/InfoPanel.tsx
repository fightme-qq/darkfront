import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { getUnitSprite } from "../../data/unitSprites";
import type { ShopSlot, UnitInstance } from "../../domain/types";
import { SpriteIcon } from "../ui/SpriteIcon";

interface InfoPanelProps {
  selected: UnitInstance | ShopSlot | null;
  battleSummary: string;
  onSellSelected?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InfoPanel({ selected, battleSummary, onSellSelected, compact, style }: InfoPanelProps) {
  const unit = selected ? ("unit" in selected ? selected.unit : selected) : null;
  const canSell = Boolean(onSellSelected && selected && !("unit" in selected));

  return (
    <View style={[styles.panel, compact && styles.panelCompact, style]}>
      {unit ? (
        <>
          <View style={styles.headerRow}>
            <Image
              source={getUnitSprite(unit.spriteKey)}
              style={[styles.portrait, compact && styles.portraitCompact]}
              resizeMode="contain"
            />
            <View style={styles.headerTextCol}>
              <Text style={[styles.name, compact && styles.nameCompact]}>{unit.name}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.meta, compact && styles.metaCompact]}>T{unit.tier}</Text>
                <View style={styles.metaStat}>
                  <SpriteIcon icon="attack" size={compact ? 20 : 26} />
                  <Text style={[styles.meta, compact && styles.metaCompact]}>{unit.attack}</Text>
                </View>
                <View style={styles.metaStat}>
                  <SpriteIcon icon="health" size={compact ? 20 : 26} />
                  <Text style={[styles.meta, compact && styles.metaCompact]}>{unit.health}</Text>
                </View>
              </View>
            </View>
            <View style={styles.tierCoin}>
              <Text style={[styles.tierCoinText, compact && styles.tierCoinTextCompact]}>{unit.tier}</Text>
            </View>
          </View>
          <Text style={[styles.ability, compact && styles.abilityCompact]}>{unit.ability}</Text>
          {canSell ? (
            <Pressable style={[styles.sellButton, compact && styles.sellButtonCompact]} onPress={onSellSelected}>
              <View style={styles.sellInner}>
                <SpriteIcon icon="sell" size={compact ? 28 : 36} />
                <Text style={[styles.sellText, compact && styles.sellTextCompact]}>Продать</Text>
              </View>
            </Pressable>
          ) : null}
        </>
      ) : (
        <>
          <Text style={[styles.name, compact && styles.nameCompact]}>Подсказка</Text>
          <Text style={[styles.ability, compact && styles.abilityCompact]}>
            Выбери героя из отряда или магазина. Здесь будет краткое описание выбранного юнита и его
            способности.
          </Text>
        </>
      )}
      <View style={styles.divider} />
      <Text style={[styles.footerLabel, compact && styles.footerLabelCompact]}>Последний бой</Text>
      <Text style={[styles.footerText, compact && styles.footerTextCompact]}>{battleSummary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 0,
    right: 8,
    width: 320,
    padding: 16,
    borderRadius: 18,
    borderWidth: 4,
    borderColor: "#18140f",
    backgroundColor: "#fff9ef",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  panelCompact: {
    width: 240,
    top: -2,
    right: 0,
    padding: 10,
    borderRadius: 14,
    borderWidth: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metaStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  portrait: {
    width: 58,
    height: 58,
  },
  portraitCompact: {
    width: 42,
    height: 42,
  },
  name: {
    color: "#da5d14",
    fontSize: 22,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  nameCompact: {
    fontSize: 15,
  },
  tierCoin: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: "#6b3e0f",
    backgroundColor: "#f4b12b",
    alignItems: "center",
    justifyContent: "center",
  },
  tierCoinText: {
    color: "#6b2f04",
    fontSize: 20,
    fontWeight: "900",
  },
  tierCoinTextCompact: {
    fontSize: 14,
  },
  ability: {
    marginTop: 10,
    color: "#19120c",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },
  abilityCompact: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 15,
  },
  meta: {
    color: "#4b3119",
    fontSize: 12,
    fontWeight: "800",
  },
  metaCompact: {
    fontSize: 9,
  },
  sellButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#19120c",
    backgroundColor: "#ffd77d",
  },
  sellButtonCompact: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  sellInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sellText: {
    color: "#4d2b0c",
    fontSize: 12,
    fontWeight: "900",
  },
  sellTextCompact: {
    fontSize: 10,
  },
  divider: {
    height: 2,
    backgroundColor: "#1f1a13",
    opacity: 0.2,
    marginTop: 10,
    marginBottom: 8,
  },
  footerLabel: {
    color: "#7e623d",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  footerLabelCompact: {
    fontSize: 9,
  },
  footerText: {
    color: "#1b1712",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  footerTextCompact: {
    fontSize: 10,
    lineHeight: 13,
  },
});
