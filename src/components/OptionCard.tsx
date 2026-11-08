import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Option } from '../types';
import { C, ND, R } from '../theme';
import { VisualView } from './VisualView';

export type CardState = 'idle' | 'disabled' | 'pip' | 'pipWrong' | 'correct' | 'faded';

export function OptionCard({
  option,
  state,
  onPress,
  width,
}: {
  option: Option;
  state: CardState;
  onPress?: () => void;
  width: number;
}) {
  const wiggle = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'disabled' || state === 'pipWrong') {
      wiggle.setValue(0);
      Animated.sequence(
        [1, -1, 1, -1, 0].map((v) => Animated.timing(wiggle, { toValue: v, duration: 60, useNativeDriver: ND })),
      ).start();
    }
    if (state === 'pip' || state === 'correct') {
      const a = Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1.06, duration: 450, useNativeDriver: ND }),
          Animated.timing(glow, { toValue: 1, duration: 450, useNativeDriver: ND }),
        ]),
      );
      a.start();
      return () => {
        a.stop();
        glow.setValue(1);
      };
    }
  }, [state, wiggle, glow]);

  const border =
    state === 'correct' ? C.yes : state === 'pip' ? C.gold : state === 'pipWrong' ? C.no : 'rgba(255,255,255,0.18)';
  const faded = state === 'disabled' || state === 'faded';
  const textOnly = !option.visual;

  return (
    <Animated.View
      style={{
        width,
        opacity: faded ? 0.35 : 1,
        transform: [
          { translateX: wiggle.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) },
          { scale: glow },
        ],
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={option.speak ?? option.label}
        disabled={!onPress || faded}
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          { borderColor: border, transform: [{ scale: pressed ? 0.95 : 1 }] },
          (state === 'pip' || state === 'correct') && styles.lit,
        ]}
      >
        {option.visual && <VisualView v={option.visual} compact />}
        {!option.hideLabel && (
          <Text
            style={[styles.label, textOnly && styles.labelBig, textOnly && option.label.length > 6 && styles.labelLong]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {option.label}
          </Text>
        )}
      </Pressable>
      {(state === 'pip' || state === 'pipWrong') && (
        <View style={[styles.badge, state === 'pipWrong' && { backgroundColor: C.no }]}>
          <Text style={styles.badgeText}>{state === 'pipWrong' ? '❌ Pip' : '👽 Pip'}</Text>
        </View>
      )}
      {state === 'correct' && (
        <View style={[styles.badge, { backgroundColor: C.yes }]}>
          <Text style={styles.badgeText}>✅</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 104,
    borderRadius: R.m,
    backgroundColor: C.card,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  lit: { backgroundColor: C.cardHi },
  label: { color: C.text, fontSize: 18, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' },
  labelBig: { fontSize: 40, marginTop: 0 },
  labelLong: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: C.ink, fontWeight: '900', fontSize: 13 },
});
