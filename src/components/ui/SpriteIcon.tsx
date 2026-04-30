import { Image, StyleSheet, View } from "react-native";

import { UI_ICON_ATLAS, UI_ICON_ATLAS_SIZE, UI_ICONS, type UiIconKey } from "../../data/uiIcons";

interface SpriteIconProps {
  icon: UiIconKey;
  size?: number;
  trim?: number;
}

export function SpriteIcon({ icon, size = 20, trim = 1 }: SpriteIconProps) {
  const coords = UI_ICONS[icon];
  const visibleTileSize = UI_ICON_ATLAS_SIZE.tile - trim * 2;
  const scale = size / visibleTileSize;
  const sourceX = coords.tileX * UI_ICON_ATLAS_SIZE.tile + trim;
  const sourceY = coords.tileY * UI_ICON_ATLAS_SIZE.tile + trim;

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <Image
        source={UI_ICON_ATLAS}
        style={{
          position: "absolute",
          width: UI_ICON_ATLAS_SIZE.width * scale,
          height: UI_ICON_ATLAS_SIZE.height * scale,
          left: -(sourceX * scale),
          top: -(sourceY * scale),
        }}
        resizeMode="stretch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});
