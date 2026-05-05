import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { getUnitSprite, getUnitSpriteTuning } from "../../data/unitSprites";
import { getHeroViewportProfile, HERO_LAYOUT_CONFIG } from "../../constants/heroLayoutConfig";
import type { BattleEffectEvent, BattlePlayback, BattleViewUnit } from "../../domain/types";
import { InfoPanel } from "./InfoPanel";
import { UnitStatsRow } from "./UnitStatsRow";

const BATTLEFIELD_BACKGROUND = require("../../../assets/backgrounds/20260429_191654.jpeg");

function parsePercent(value: string) {
  return Number.parseFloat(value) / 100;
}

interface BattleViewProps {
  playback: BattlePlayback;
  onComplete: () => void;
}

type StepPhase = "idle" | "hit" | "resolve";

export function BattleView({ playback, onComplete }: BattleViewProps) {
  const { width, height } = useWindowDimensions();
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [stepState, setStepState] = useState<{ index: number; phase: StepPhase }>({
    index: 0,
    phase: "idle",
  });
  const { index: stepIndex, phase } = stepState;
  const setPhase = (next: StepPhase) =>
    setStepState((prev) => (prev.phase === next ? prev : { ...prev, phase: next }));

  const dash = useRef(new Animated.Value(0)).current;
  const playerDamageFloat = useRef(new Animated.Value(0)).current;
  const enemyDamageFloat = useRef(new Animated.Value(0)).current;
  const playerDamageOpacity = useRef(new Animated.Value(0)).current;
  const enemyDamageOpacity = useRef(new Animated.Value(0)).current;
  const playerDeathDrop = useRef(new Animated.Value(0)).current;
  const enemyDeathDrop = useRef(new Animated.Value(0)).current;
  const playerDeathOpacity = useRef(new Animated.Value(1)).current;
  const enemyDeathOpacity = useRef(new Animated.Value(1)).current;
  const playerReflow = useRef(new Animated.Value(0)).current;
  const enemyReflow = useRef(new Animated.Value(0)).current;

  const currentStep = playback.steps[Math.min(stepIndex, Math.max(playback.steps.length - 1, 0))];
  const isFinished = playback.steps.length > 0 && stepIndex >= playback.steps.length;

  const playerFrontDied = useMemo(() => {
    if (!currentStep?.playerBefore[0]) {
      return false;
    }

    const frontId = currentStep.playerBefore[0].instanceId;
    return !currentStep.playerAfter.some((unit) => unit.instanceId === frontId);
  }, [currentStep]);

  const enemyFrontDied = useMemo(() => {
    if (!currentStep?.enemyBefore[0]) {
      return false;
    }

    const frontId = currentStep.enemyBefore[0].instanceId;
    return !currentStep.enemyAfter.some((unit) => unit.instanceId === frontId);
  }, [currentStep]);

  const visibleTeams = useMemo(() => {
    if (!currentStep) {
      return { player: [] as BattleViewUnit[], enemy: [] as BattleViewUnit[] };
    }

    if (isFinished || phase === "resolve") {
      return { player: currentStep.playerAfter, enemy: currentStep.enemyAfter };
    }

    return { player: currentStep.playerBefore, enemy: currentStep.enemyBefore };
  }, [currentStep, phase, isFinished]);

  const isSob = currentStep?.kind === "sob";
  const speed = isSob ? 0.7 : 1.3;
  const profileKey = getHeroViewportProfile(width, height);
  const profile = HERO_LAYOUT_CONFIG.profiles[profileKey];
  const teamLaneTop = profile.lanes.team.top;
  const teamLaneHeight = profile.lanes.team.height;
  const teamLaneTopPx = height * parsePercent(teamLaneTop);
  const teamLaneHeightPx = height * parsePercent(teamLaneHeight);
  const baseTokenWidth = profile.tokens.team.width;
  const baseTokenHeight = profile.tokens.team.minHeight;
  const baseStageHeight = profile.tokens.team.stageHeight;
  const baseBaselineBottom = profile.tokens.team.baselineBottom;
  const baseImageSize = profile.tokens.team.imageSize;
  const baseMarginTop = profile.tokens.team.marginTop;
  const rowGap = profile.spacing.teamGap;
  const statsGap = profile.stats.gap;
  const statsMarginTop = profile.stats.marginTop;
  const slotGap = rowGap;
  const tokenWidth = baseTokenWidth;
  const tokenHeight = baseTokenHeight;
  const stageHeight = baseStageHeight;
  const baselineBottom = baseBaselineBottom;
  const spriteSize = baseImageSize;
  const tokenMarginTop = baseMarginTop;
  const dashDistance = isSob ? 0 : Math.max(12, Math.min(30, tokenWidth * 0.34));

  useEffect(() => {
    if (playback.steps.length === 0) {
      const timer = setTimeout(onComplete, Math.round(900 * speed));
      return () => clearTimeout(timer);
    }

    if (stepIndex >= playback.steps.length) {
      const timer = setTimeout(onComplete, Math.round(900 * speed));
      return () => clearTimeout(timer);
    }

    dash.setValue(0);
    playerDamageFloat.setValue(0);
    enemyDamageFloat.setValue(0);
    playerDamageOpacity.setValue(0);
    enemyDamageOpacity.setValue(0);
    playerDeathDrop.setValue(0);
    enemyDeathDrop.setValue(0);
    playerDeathOpacity.setValue(1);
    enemyDeathOpacity.setValue(1);
    playerReflow.setValue(0);
    enemyReflow.setValue(0);
    setPhase("idle");

    const engageTimer = setTimeout(() => {
      setPhase("hit");

      Animated.parallel([
        Animated.timing(dash, {
          toValue: 1,
          duration: Math.round(190 * speed),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(playerDamageOpacity, {
          toValue: 1,
          duration: Math.round(100 * speed),
          useNativeDriver: true,
        }),
        Animated.timing(enemyDamageOpacity, {
          toValue: 1,
          duration: Math.round(100 * speed),
          useNativeDriver: true,
        }),
      ]).start();

      Animated.parallel([
        Animated.timing(playerDamageFloat, {
          toValue: 1,
          duration: Math.round(360 * speed),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(enemyDamageFloat, {
          toValue: 1,
          duration: Math.round(360 * speed),
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      if (playerFrontDied) {
        Animated.parallel([
          Animated.timing(playerDeathDrop, {
            toValue: 1,
            duration: Math.round(320 * speed),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(playerDeathOpacity, {
            toValue: 0,
            duration: Math.round(300 * speed),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }

      if (enemyFrontDied) {
        Animated.parallel([
          Animated.timing(enemyDeathDrop, {
            toValue: 1,
            duration: Math.round(320 * speed),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(enemyDeathOpacity, {
            toValue: 0,
            duration: Math.round(300 * speed),
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, Math.round(160 * speed));

    const resolveTimer = setTimeout(() => {
      setPhase("resolve");
      if (playerFrontDied) {
        playerReflow.setValue(1);
        requestAnimationFrame(() => {
          Animated.timing(playerReflow, {
            toValue: 0,
            duration: Math.round(220 * speed),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      }
      if (enemyFrontDied) {
        enemyReflow.setValue(1);
        requestAnimationFrame(() => {
          Animated.timing(enemyReflow, {
            toValue: 0,
            duration: Math.round(220 * speed),
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }).start();
        });
      }
      Animated.timing(playerDamageOpacity, {
        toValue: 0,
        duration: Math.round(100 * speed),
        useNativeDriver: true,
      }).start();
      Animated.timing(enemyDamageOpacity, {
        toValue: 0,
        duration: Math.round(100 * speed),
        useNativeDriver: true,
      }).start();
    }, Math.round(560 * speed));

    const advanceDelay = isSob ? 1260 : Math.round(840 * speed);
    const advanceTimer = setTimeout(() => {
      setStepState((prev) => ({ index: prev.index + 1, phase: "idle" }));
    }, advanceDelay);

    return () => {
      clearTimeout(engageTimer);
      clearTimeout(resolveTimer);
      clearTimeout(advanceTimer);
    };
  }, [
    dash,
    enemyDamageFloat,
    enemyDamageOpacity,
    enemyFrontDied,
    enemyDeathDrop,
    enemyDeathOpacity,
    enemyReflow,
    onComplete,
    playback.steps.length,
    playerDamageFloat,
    playerDamageOpacity,
    playerFrontDied,
    playerDeathDrop,
    playerDeathOpacity,
    playerReflow,
    stepIndex,
  ]);

  const playerDashX = dash.interpolate({ inputRange: [0, 1], outputRange: [0, dashDistance] });
  const enemyDashX = dash.interpolate({ inputRange: [0, 1], outputRange: [0, -dashDistance] });
  const playerDamageY = playerDamageFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -32] });
  const enemyDamageY = enemyDamageFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -32] });
  const playerDeathY = playerDeathDrop.interpolate({ inputRange: [0, 1], outputRange: [0, 42] });
  const enemyDeathY = enemyDeathDrop.interpolate({ inputRange: [0, 1], outputRange: [0, 42] });

  const playerFront = visibleTeams.player[0] ?? null;
  const enemyFront = visibleTeams.enemy[0] ?? null;
  const selectedUnit =
    [...visibleTeams.player, ...visibleTeams.enemy].find((unit) => unit.instanceId === selectedUnitId) ?? null;
  const effectEventsByUnitId = useMemo(() => {
    const events = currentStep?.kind === "sob" ? currentStep.events : [];
    return groupBattleEffectEvents(events);
  }, [currentStep, phase]);

  return (
    <ImageBackground source={BATTLEFIELD_BACKGROUND} resizeMode="cover" style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />

      <View style={styles.topRow}>
        <Text style={styles.title}>Бой</Text>
      </View>

      <View
        style={[
          styles.arena,
          {
            top: teamLaneTopPx,
            height: teamLaneHeightPx,
          },
        ]}
      >
        <TeamLine
          units={visibleTeams.player}
          side="left"
          frontDashX={playerDashX}
          frontDeathY={playerDeathY}
          frontDeathOpacity={playerDeathOpacity}
          applyFrontDash={phase === "hit"}
          applyFrontDying={phase === "hit" && playerFrontDied}
          tokenWidth={tokenWidth}
          spriteSize={spriteSize}
          tokenHeight={tokenHeight}
          stageHeight={stageHeight}
          baselineBottom={baselineBottom}
          tokenMarginTop={tokenMarginTop}
          slotGap={slotGap}
          statsGap={statsGap}
          statsMarginTop={statsMarginTop}
          reflow={playerReflow}
          onUnitPress={setSelectedUnitId}
          effectEventsByUnitId={effectEventsByUnitId}
        />

        <TeamLine
          units={visibleTeams.enemy}
          side="right"
          mirrored
          frontDashX={enemyDashX}
          frontDeathY={enemyDeathY}
          frontDeathOpacity={enemyDeathOpacity}
          applyFrontDash={phase === "hit"}
          applyFrontDying={phase === "hit" && enemyFrontDied}
          tokenWidth={tokenWidth}
          spriteSize={spriteSize}
          tokenHeight={tokenHeight}
          stageHeight={stageHeight}
          baselineBottom={baselineBottom}
          tokenMarginTop={tokenMarginTop}
          slotGap={slotGap}
          statsGap={statsGap}
          statsMarginTop={statsMarginTop}
          reflow={enemyReflow}
          onUnitPress={setSelectedUnitId}
          effectEventsByUnitId={effectEventsByUnitId}
        />

        <View pointerEvents="none" style={styles.clashCenter}>
          {phase === "hit" && !isSob ? <View style={styles.impactFlash} /> : null}
          <Text style={styles.stepText}>
            {Math.min(stepIndex + 1, Math.max(playback.steps.length, 1))}/{Math.max(playback.steps.length, 1)}
          </Text>

          {currentStep && playerFront && !isSob ? (
            <Animated.Text
              style={[
                styles.damageText,
                styles.damageTextLeft,
                { opacity: playerDamageOpacity, transform: [{ translateY: playerDamageY }] },
              ]}
            >
              -{currentStep.playerFrontDamage}
            </Animated.Text>
          ) : null}

          {currentStep && enemyFront && !isSob ? (
            <Animated.Text
              style={[
                styles.damageText,
                styles.damageTextRight,
                { opacity: enemyDamageOpacity, transform: [{ translateY: enemyDamageY }] },
              ]}
            >
              -{currentStep.enemyFrontDamage}
            </Animated.Text>
          ) : null}
        </View>
      </View>

      {selectedUnit ? (
        <InfoPanel
          selected={selectedUnit}
          notes={[]}
          compact={profileKey !== "largePhone"}
          style={[
            styles.battleInfoPanel,
            profileKey !== "largePhone" && styles.battleInfoPanelCompact,
            profileKey === "smallPhone" && styles.battleInfoPanelUltraCompact,
          ]}
        />
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.summary}>{playback.result.summary}</Text>
      </View>
    </ImageBackground>
  );
}

function TeamLine({
  units,
  side,
  mirrored,
  frontDashX,
  frontDeathY,
  frontDeathOpacity,
  applyFrontDash,
  applyFrontDying,
  tokenWidth,
  spriteSize,
  tokenHeight,
  stageHeight,
  baselineBottom,
  tokenMarginTop,
  slotGap,
  statsGap,
  statsMarginTop,
  reflow,
  onUnitPress,
  effectEventsByUnitId,
}: {
  units: BattleViewUnit[];
  side: "left" | "right";
  mirrored?: boolean;
  frontDashX: Animated.AnimatedInterpolation<number>;
  frontDeathY: Animated.AnimatedInterpolation<number>;
  frontDeathOpacity: Animated.Value;
  applyFrontDash: boolean;
  applyFrontDying: boolean;
  tokenWidth: number;
  spriteSize: number;
  tokenHeight: number;
  stageHeight: number;
  baselineBottom: number;
  tokenMarginTop: number;
  slotGap: number;
  statsGap: number;
  statsMarginTop: number;
  reflow: Animated.Value;
  onUnitPress: (unitId: string) => void;
  effectEventsByUnitId: Record<string, BattleEffectEvent[]>;
}) {
  const reflowDistance = tokenWidth + slotGap;
  const reflowX =
    side === "left"
      ? reflow.interpolate({ inputRange: [0, 1], outputRange: [0, -reflowDistance] })
      : reflow.interpolate({ inputRange: [0, 1], outputRange: [0, reflowDistance] });

  return (
    <Animated.View
      style={[
        styles.teamCol,
        side === "left" ? styles.teamColLeft : styles.teamColRight,
        { transform: [{ translateX: reflowX }] },
      ]}
    >
      <View
        style={[
          styles.teamRow,
          { gap: slotGap },
          side === "left" ? styles.teamRowFromCenterLeft : styles.teamRowFromCenterRight,
        ]}
      >
        {units.map((unit, index) => {
          const isFront = index === 0;
          const tuning = getUnitSpriteTuning(unit.spriteKey);
          const effectLabel = formatBattleEffectLabel(effectEventsByUnitId[unit.instanceId] ?? []);

          let frontStyle: object | null = null;
          if (isFront) {
            if (applyFrontDying) {
              frontStyle = {
                transform: [{ translateX: frontDashX }, { translateY: frontDeathY }],
                opacity: frontDeathOpacity,
              };
            } else if (applyFrontDash) {
              frontStyle = { transform: [{ translateX: frontDashX }] };
            }
          }

          return (
            <Animated.View
              key={unit.instanceId}
              style={[
                styles.tokenWrap,
                { width: tokenWidth, minHeight: tokenHeight, marginTop: tokenMarginTop },
                frontStyle,
              ]}
            >
              <Pressable style={styles.unitPressable} onPress={() => onUnitPress(unit.instanceId)}>
                <View style={[styles.spriteBody, { height: stageHeight }]}>
                  <View
                    style={[
                      styles.spriteAnchor,
                      {
                        width: spriteSize,
                        height: spriteSize,
                        marginLeft: -(spriteSize / 2),
                        bottom: baselineBottom,
                        transform: [
                          { translateX: mirrored ? -tuning.offsetX : tuning.offsetX },
                          { translateY: tuning.offsetY },
                          { scaleX: mirrored ? -tuning.scale : tuning.scale },
                          { scaleY: tuning.scale },
                        ],
                      },
                    ]}
                  >
                    <Image source={getUnitSprite(unit.spriteKey)} style={{ width: spriteSize, height: spriteSize }} resizeMode="contain" />
                  </View>
                  {effectLabel ? <EffectFloatText label={`Старт боя: ${effectLabel}`} /> : null}
                </View>
                <UnitStatsRow
                  attack={unit.attack}
                  health={Math.max(0, unit.health)}
                  marginTop={statsMarginTop}
                  gap={statsGap}
                  size="battle"
                />
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function groupBattleEffectEvents(events: BattleEffectEvent[] | undefined) {
  const grouped: Record<string, BattleEffectEvent[]> = {};

  for (const event of events ?? []) {
    grouped[event.targetInstanceId] = [...(grouped[event.targetInstanceId] ?? []), event];
  }

  return grouped;
}

function formatBattleEffectLabel(events: BattleEffectEvent[]) {
  const attack = events.reduce((total, event) => total + event.attackDelta, 0);
  const health = events.reduce((total, event) => total + event.healthDelta, 0);
  const parts: string[] = [];

  if (attack !== 0) {
    parts.push(`${attack > 0 ? "+" : ""}${attack} атака`);
  }
  if (health !== 0) {
    parts.push(`${health > 0 ? "+" : ""}${health} здоровье`);
  }

  return parts.join("  ");
}

function EffectFloatText({ label }: { label: string }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    lift.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(770),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(lift, {
        toValue: 1,
        duration: 1190,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [label, lift, opacity]);

  const translateY = lift.interpolate({ inputRange: [0, 1], outputRange: [10, -10] });

  return (
    <Animated.Text
      pointerEvents="none"
      style={[styles.effectFloatText, { opacity, transform: [{ translateY }] }]}
    >
      {label}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#1a2331",
  },
  bgImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 16, 24, 0.08)",
  },
  topRow: {
    position: "absolute",
    top: "3%",
    left: "2%",
    right: "2%",
    zIndex: 3,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  title: {
    color: "#fff6dd",
    fontSize: 30,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  arena: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "flex-end",
    overflow: "visible",
  },
  teamCol: {
    flex: 1,
    justifyContent: "flex-end",
    overflow: "visible",
  },
  teamColLeft: {
    alignItems: "flex-end",
  },
  teamColRight: {
    alignItems: "flex-start",
  },
  teamRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  teamRowFromCenterLeft: {
    flexDirection: "row-reverse",
  },
  teamRowFromCenterRight: {
    flexDirection: "row",
  },
  tokenWrap: {
    alignItems: "center",
    gap: 1,
    overflow: "visible",
  },
  unitPressable: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  spriteBody: {
    width: "100%",
    position: "relative",
    overflow: "visible",
  },
  spriteAnchor: {
    position: "absolute",
    left: "50%",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 4,
  },
  effectFloatText: {
    position: "absolute",
    left: -42,
    right: -42,
    bottom: "45%",
    color: "#fff6dd",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.9)",
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
    zIndex: 9,
  },
  clashCenter: {
    position: "absolute",
    left: "50%",
    bottom: 0,
    width: 56,
    marginLeft: -28,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 8,
  },
  impactFlash: {
    position: "absolute",
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: "rgba(255, 245, 166, 0.7)",
    borderWidth: 3,
    borderColor: "#fff7cd",
  },
  stepText: {
    color: "#ffd57d",
    fontWeight: "900",
    fontSize: 14,
    marginTop: 64,
  },
  damageText: {
    position: "absolute",
    top: 10,
    color: "#ff2e2e",
    fontSize: 36,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 2 },
  },
  damageTextLeft: {
    left: -30,
  },
  damageTextRight: {
    right: -30,
  },
  footer: {
    position: "absolute",
    left: "2%",
    right: "2%",
    bottom: "2.5%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1b1209",
    backgroundColor: "rgba(255, 245, 222, 0.95)",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  battleInfoPanel: {
    left: "2%",
    bottom: "9.5%",
    width: 320,
    zIndex: 12,
  },
  battleInfoPanelCompact: {
    bottom: "9%",
    width: 250,
  },
  battleInfoPanelUltraCompact: {
    bottom: "8.5%",
    width: 220,
  },
  summary: {
    color: "#23160c",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
});
