import { useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

import { GameApp } from "./src/app/GameApp";

export default function App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  return <GameApp />;
}
