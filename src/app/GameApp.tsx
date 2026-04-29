import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";

import { GameScreen } from "../screens/GameScreen";
import { palette } from "../constants/theme";

export function GameApp() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <GameScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
});
