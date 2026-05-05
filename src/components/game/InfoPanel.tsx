import { Animated, Image, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { getUnitSprite } from "../../data/unitSprites";
import type { BattleViewUnit, ShopSlot, UnitInstance } from "../../domain/types";
import { SpriteIcon } from "../ui/SpriteIcon";
import { useFlashOnChange } from "../ui/useFlashOnChange";

interface InfoPanelProps {
  selected: UnitInstance | ShopSlot | BattleViewUnit | null;
  notes?: string[];
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function InfoPanel({ selected, notes = [], compact, style }: InfoPanelProps) {
  const unit = selected ? ("unit" in selected ? selected.unit : selected) : null;
  const tempAtk = unit ? (unit as Partial<UnitInstance>).temporaryAttack ?? 0 : 0;
  const tempHp = unit ? (unit as Partial<UnitInstance>).temporaryHealth ?? 0 : 0;
  const displayAttack = unit ? unit.attack + tempAtk : 0;
  const displayHealth = unit ? unit.health + tempHp : 0;

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
            <View style={styles.tierCoin}>
              <Text style={[styles.tierCoinText, compact && styles.tierCoinTextCompact]}>{unit.tier}</Text>
            </View>
          </View>
          <Text
            style={[styles.name, compact && styles.nameCompact]}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {unit.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={[styles.meta, compact && styles.metaCompact]}>T{unit.tier}</Text>
            <View style={styles.metaStat}>
              <SpriteIcon icon="attack" size={compact ? 20 : 26} />
              <FlashingMeta value={displayAttack} compact={compact} highlightOnMount={tempAtk > 0} />
            </View>
            <View style={styles.metaStat}>
              <SpriteIcon icon="health" size={compact ? 20 : 26} />
              <FlashingMeta value={displayHealth} compact={compact} highlightOnMount={tempHp > 0} />
            </View>
          </View>

          <Text style={[styles.ability, compact && styles.abilityCompact]}>{unit.ability}</Text>

        </>
      ) : (
        <>
          <Text style={[styles.name, compact && styles.nameCompact]}>Подсказка</Text>
          <Text style={[styles.ability, compact && styles.abilityCompact]}>
            Выбери героя из отряда или магазина. Здесь будет краткое описание выбранного юнита и его способности.
          </Text>
        </>
      )}

      <View style={styles.divider} />
      <View style={[styles.notesBox, compact && styles.notesBoxCompact]}>
        {notes.map((note) => (
          <Text key={note} style={[styles.footerText, compact && styles.footerTextCompact]}>
            {note}
          </Text>
        ))}
      </View>
    </View>
  );
}

function FlashingMeta({
  value,
  compact,
  highlightOnMount,
}: {
  value: number;
  compact?: boolean;
  highlightOnMount?: boolean;
}) {
  const { scale, glow } = useFlashOnChange(value, highlightOnMount);
  return (
    <View style={styles.flashWrap}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.metaGlow,
          compact && styles.metaGlowCompact,
          {
            opacity: glow,
            transform: [
              {
                scale: glow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1.3],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.Text style={[styles.meta, compact && styles.metaCompact, { transform: [{ scale }] }]}>
        {value}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: "absolute",
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
    width: 260,
    padding: 10,
    borderRadius: 14,
    borderWidth: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    gap: 10,
  },
  metaStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  flashWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  metaGlow: {
    position: "absolute",
    width: 28,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 215, 70, 0.7)",
  },
  metaGlowCompact: {
    width: 22,
    height: 18,
    borderRadius: 9,
  },
  portrait: {
    width: 87,
    height: 87,
  },
  portraitCompact: {
    width: 63,
    height: 63,
  },
  name: {
    marginTop: 3,
    color: "#da5d14",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  nameCompact: {
    fontSize: 18,
    lineHeight: 20,
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
    fontSize: 12,
    lineHeight: 16,
  },
  meta: {
    color: "#4b3119",
    fontSize: 12,
    fontWeight: "800",
  },
  metaCompact: {
    fontSize: 9,
  },
  divider: {
    height: 2,
    backgroundColor: "#1f1a13",
    opacity: 0.2,
    marginTop: 10,
    marginBottom: 8,
  },
  notesBox: {
    minHeight: 18,
  },
  notesBoxCompact: {
    minHeight: 13,
  },
  footerText: {
    color: "#1b1712",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },
  footerTextCompact: {
    fontSize: 11,
    lineHeight: 14,
  },
});
