import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";

export function useFlashOnChange(
  value: number | string,
  animateOnMountIfNonZero?: boolean,
) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const prev = useRef<number | string | null>(null);

  useEffect(() => {
    const isInitial = prev.current === null;
    const shouldAnimate = isInitial
      ? Boolean(animateOnMountIfNonZero)
      : prev.current !== value;

    if (shouldAnimate) {
      scale.stopAnimation();
      glow.stopAnimation();
      scale.setValue(1);
      glow.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.45,
            duration: 160,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 380,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    prev.current = value;
  }, [value, animateOnMountIfNonZero, scale, glow]);

  return { scale, glow };
}
