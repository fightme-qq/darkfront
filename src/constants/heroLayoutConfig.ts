import type { CharacterSpriteKey } from "../domain/types";

export type HeroViewportProfile = "mainPhone" | "smallPhone" | "largePhone";

// Этот экран сейчас в первую очередь тюним под обычный телефон в landscape.
// Для тебя основной профиль — mainPhone.
//
// Как пользоваться:
// 1. Сначала почти всегда меняй profile `mainPhone`
// 2. Если на более низких экранах все ломается — докручивай `smallPhone`
// 3. Если на более широких/высоких нужно отдельно поправить — докручивай `largePhone`
//
// Быстрая шпаргалка:
// - весь ряд поля выше/ниже -> profiles.mainPhone.lanes.team.top
// - весь ряд магазина выше/ниже -> profiles.mainPhone.lanes.shop.top
// - герои слишком далеко друг от друга на поле -> profiles.mainPhone.spacing.teamGap
// - герои слишком далеко друг от друга в магазине -> profiles.mainPhone.spacing.shopGap
// - герой слишком большой/маленький -> spriteTuning["имя"].scale
// - герой левее/правее -> spriteTuning["имя"].offsetX
// - герой выше/ниже внутри места -> spriteTuning["имя"].offsetY
// - кружок уровня далеко от головы -> spriteTuning["имя"].tierOffsetX / tierOffsetY
// - статы слишком далеко от героя -> profiles.mainPhone.stats.marginTop

type ProfileSettings = {
  lanes: {
    team: { top: string; left: string; right: string; height: string };
    shop: { top: string; left: string; right: string; height: string };
  };
  spacing: {
    teamGap: number;
    shopGap: number;
    shopSlotMaxWidth: number;
  };
  tokens: {
    team: {
      width: number;
      minHeight: number;
      marginTop: number;
      stageHeight: number;
      baselineBottom: number;
      imageSize: number;
    };
    shop: {
      width: number;
      minHeight: number;
      marginTop: number;
      stageHeight: number;
      baselineBottom: number;
      imageSize: number;
    };
  };
  tierBadge: {
    top: number;
    right: number;
  };
  stats: {
    marginTop: number;
    gap: number;
  };
};

export const HERO_LAYOUT_CONFIG = {
  profiles: {
    largePhone: {
      lanes: {
        team: {
          top: "33.2%", // Ряд купленных героев на более высоких landscape-экранах.
          left: "9.2%",
          right: "29.5%",
          height: "14.5%",
        },
        shop: {
          top: "63.4%", // Ряд героев в магазине на более высоких landscape-экранах.
          left: "7.7%",
          right: "34.2%",
          height: "18.2%",
        },
      },
      spacing: {
        teamGap: 8, // Расстояние между героями на поле.
        shopGap: 6, // Расстояние между героями в магазине.
        shopSlotMaxWidth: 196, // Ширина одного магазинного места.
      },
      tokens: {
        team: {
          width: 156, // Размер места героя на поле.
          minHeight: 156,
          marginTop: -35, // Поднимает/опускает весь token поля.
          stageHeight: 132, // Высота внутренней сцены спрайта.
          baselineBottom: 4, // Общая линия ног героев на поле.
          imageSize: 156, // Базовый размер героя на поле.
        },
        shop: {
          width: 156, // Размер места героя в магазине.
          minHeight: 156,
          marginTop: -30, // Поднимает/опускает весь token магазина.
          stageHeight: 132, // Высота внутренней сцены магазинного спрайта.
          baselineBottom: 4, // Общая линия ног героев в магазине.
          imageSize: 156, // Базовый размер героя в магазине.
        },
      },
      tierBadge: {
        top: 18, // Высота кружка уровня.
        right: 28, // Сдвиг кружка уровня от правого края.
      },
      stats: {
        marginTop: -10, // Насколько близко ATK/HP прижаты к герою.
        gap: 6, // Расстояние между ATK и HP.
      },
    } satisfies ProfileSettings,

    mainPhone: {
      lanes: {
        team: {
          top: "28.6%", // Главный профиль: обычный телефон landscape вроде 932x430.
          left: "8.2%",
          right: "28.4%",
          height: "15%",
        },
        shop: {
          top: "55.6%",
          left: "6.9%",
          right: "32.8%",
          height: "18.8%",
        },
      },
      spacing: {
        teamGap: 5, // Главный профиль: расстояние между героями на поле.
        shopGap: 4, // Главный профиль: расстояние между героями в магазине.
        shopSlotMaxWidth: 100, // Главный профиль: ширина магазинного места.
      },
      tokens: {
        team: {
          width: 118,
          minHeight: 118,
          marginTop: -18,
          stageHeight: 96,
          baselineBottom: 0,
          imageSize: 112,
        },
        shop: {
          width: 118,
          minHeight: 118,
          marginTop: -18,
          stageHeight: 96,
          baselineBottom: 0,
          imageSize: 112,
        },
      },
      tierBadge: {
        top: 12,
        right: 18,
      },
      stats: {
        marginTop: -6,
        gap: 6,
      },
    } satisfies ProfileSettings,

    smallPhone: {
      lanes: {
        team: {
          top: "33.2%", // Для особенно низких landscape-экранов.
          left: "7.4%",
          right: "27.8%",
          height: "15.5%",
        },
        shop: {
          top: "61.8%",
          left: "6.2%",
          right: "31.7%",
          height: "19.5%",
        },
      },
      spacing: {
        teamGap: 5,
        shopGap: 4,
        shopSlotMaxWidth: 146,
      },
      tokens: {
        team: {
          width: 118,
          minHeight: 118,
          marginTop: -18,
          stageHeight: 96,
          baselineBottom: 0,
          imageSize: 112,
        },
        shop: {
          width: 118,
          minHeight: 118,
          marginTop: -18,
          stageHeight: 96,
          baselineBottom: 0,
          imageSize: 112,
        },
      },
      tierBadge: {
        top: 12,
        right: 18,
      },
      stats: {
        marginTop: -6,
        gap: 6,
      },
    } satisfies ProfileSettings,
  },

  spriteTuning: {
    "grave-acolyte": {
      scale: 0.92,
      offsetX: 0,
      offsetY: 16,
      tierOffsetX: -20,
      tierOffsetY: 8,
    },
    "bone-wanderer": {
      scale: 0.8,
      offsetX: 0,
      offsetY: 8,
      tierOffsetX: -10,
      tierOffsetY: 4,
    },
    "dusk-swordsman": {
      scale: 1.4,
      offsetX: 0,
      offsetY: 6,
      tierOffsetX: -8,
      tierOffsetY: 4,
    },
    "runic-hound": {
      scale: 0.58,
      offsetX: 0,
      offsetY: 20,
      tierOffsetX: -18,
      tierOffsetY: 8,
    },
    "skull-shieldbearer": {
      scale: 0.86,
      offsetX: 0,
      offsetY: 2,
      tierOffsetX: -2,
      tierOffsetY: 4,
    },
    "weary-squire": {
      scale: 0.9,
      offsetX: 0,
      offsetY: 18,
      tierOffsetX: -18,
      tierOffsetY: 8,
    },
    "winged-drakeling": {
      scale: 0.9,
      offsetX: 0,
      offsetY: 4,
      tierOffsetX: -4,
      tierOffsetY: 2,
    },
  } satisfies Record<
    CharacterSpriteKey,
    {
      scale: number;
      offsetX: number;
      offsetY: number;
      tierOffsetX: number;
      tierOffsetY: number;
    }
  >,
} as const;

export function getHeroViewportProfile(width: number, height: number): HeroViewportProfile {
  if (height <= 380) {
    return "smallPhone";
  }

  if (height <= 430 || width <= 820) {
    return "mainPhone";
  }

  return "largePhone";
}
