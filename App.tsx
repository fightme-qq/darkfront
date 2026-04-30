import { useEffect } from "react";
import { Platform } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

import { GameApp } from "./src/app/GameApp";

export default function App() {
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");
    const styleEl = document.createElement("style");

    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyHeight = body.style.height;
    const previousBodyMargin = body.style.margin;
    const previousRootHeight = root?.style.height ?? "";
    const previousRootOverflow = root?.style.overflow ?? "";

    html.style.overflow = "hidden";
    html.style.height = "100%";
    body.style.overflow = "hidden";
    body.style.height = "100%";
    body.style.margin = "0";
    styleEl.setAttribute("data-darkfront-web-reset", "true");
    styleEl.textContent = `
      html, body, #root {
        overflow: hidden !important;
        height: 100% !important;
      }
      body::-webkit-scrollbar,
      html::-webkit-scrollbar,
      #root::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
      }
      * {
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    if (root) {
      root.style.height = "100%";
      root.style.overflow = "hidden";
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      body.style.margin = previousBodyMargin;
      styleEl.remove();

      if (root) {
        root.style.height = previousRootHeight;
        root.style.overflow = previousRootOverflow;
      }
    };
  }, []);

  return <GameApp />;
}
