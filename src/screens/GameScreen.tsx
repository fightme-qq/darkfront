import { StyleSheet, Text, View } from "react-native";

import { ActionBar } from "../components/game/ActionBar";
import { InfoPanel } from "../components/game/InfoPanel";
import { ShopRow } from "../components/game/ShopRow";
import { TeamBoard } from "../components/game/TeamBoard";
import { TopBar } from "../components/game/TopBar";
import { palette } from "../constants/theme";
import { useGameStore } from "../stores/gameStore";

export function GameScreen() {
  const state = useGameStore();
  const selectedTeam = state.team.find((unit) => unit?.instanceId === state.selectedId) ?? null;
  const selectedShop = state.shop.find((slot) => slot.slotId === state.selectedId) ?? null;
  const selected = selectedTeam ?? selectedShop;
  const selectedIndex = state.team.findIndex((unit) => unit?.instanceId === state.selectedId);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Darkfront: Last Stand</Text>
      <TopBar gold={state.gold} lives={state.lives} wins={state.wins} turn={state.turn} tier={state.shopTier} />
      <View style={styles.body}>
        <View style={styles.board}>
          <TeamBoard team={state.team} selectedId={state.selectedId} onSelect={state.selectEntity} />
          <ShopRow
            shop={state.shop}
            selectedId={state.selectedId}
            onBuy={state.buyUnit}
            onFreeze={state.toggleFreeze}
            onSelect={state.selectEntity}
          />
          <ActionBar onRoll={state.rollShop} onBattle={state.startBattle} />
        </View>
        <InfoPanel
          selected={selected}
          battleSummary={state.battleResult?.summary ?? "Боя еще не было. Собери стартовый отряд и проверь темп."}
          onSellSelected={selectedIndex >= 0 ? () => state.sellUnit(selectedIndex) : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 18,
    backgroundColor: palette.bg,
    gap: 14,
  },
  title: {
    color: palette.accent,
    fontSize: 30,
    fontWeight: "900",
  },
  body: {
    flex: 1,
    flexDirection: "row",
    gap: 14,
  },
  board: {
    flex: 1,
    gap: 18,
    padding: 16,
    borderRadius: 24,
    backgroundColor: palette.panelMuted,
    borderWidth: 1,
    borderColor: palette.border,
  },
});
