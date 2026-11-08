import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { C, ND, R } from '../theme';
import { feel } from '../lib/voice';

/** A chunky, 3D-looking button that is easy for small hands to hit. */
export function BigButton({
  label,
  emoji,
  onPress,
  color = C.gold,
  shade = C.goldDark,
  textColor = C.ink,
  size = 'l',
  style,
  disabled,
}: {
  label: string;
  emoji?: string;
  onPress: () => void;
  color?: string;
  shade?: string;
  textColor?: string;
  size?: 'm' | 'l' | 'xl';
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const fs = size === 'xl' ? 28 : size === 'l' ? 22 : 17;
  const pad = size === 'xl' ? 22 : size === 'l' ? 16 : 11;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        feel.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: color,
          borderBottomColor: shade,
          paddingVertical: pad,
          opacity: disabled ? 0.4 : 1,
          transform: [{ translateY: pressed ? 4 : 0 }],
          borderBottomWidth: pressed ? 2 : 6,
        },
        style,
      ]}
    >
      <Text style={[styles.btnText, { fontSize: fs, color: textColor }]}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

export function Bubble({
  text,
  onReplay,
  pointer = 'up',
}: {
  text: string;
  onReplay?: () => void;
  pointer?: 'up' | 'down';
}) {
  return (
    <View style={styles.bubbleWrap}>
      {pointer === 'up' && <View style={styles.pointer} />}
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>{text}</Text>
        {onReplay && (
          <Pressable onPress={onReplay} hitSlop={12} accessibilityLabel="Hear it again" style={styles.replay}>
            <Text style={{ fontSize: 22 }}>🔊</Text>
          </Pressable>
        )}
      </View>
      {pointer === 'down' && <View style={[styles.pointer, { transform: [{ rotate: '180deg' }] }]} />}
    </View>
  );
}

export function IconButton({ emoji, onPress, label }: { emoji: string; onPress: () => void; label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={() => {
        feel.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.icon, pressed && { transform: [{ scale: 0.92 }] }]}
    >
      <Text style={{ fontSize: 24 }}>{emoji}</Text>
    </Pressable>
  );
}

/** A fixed, gently twinkling star background — Pip lives in space. */
export function Starfield() {
  const { width, height } = Dimensions.get('window');
  const stars = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        key: i,
        x: Math.random() * width,
        y: Math.random() * Math.max(height, 900),
        s: Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1.3,
        o: 0.25 + Math.random() * 0.6,
      })),
    [width, height],
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.nebula} />
      <View style={styles.nebula2} />
      {stars.map((s) => (
        <View
          key={s.key}
          style={{
            position: 'absolute',
            left: s.x,
            top: s.y,
            width: s.s,
            height: s.s,
            borderRadius: s.s,
            backgroundColor: '#fff',
            opacity: s.o,
          }}
        />
      ))}
    </View>
  );
}

/** Celebration: emoji raining down. */
export function Confetti({ count = 22 }: { count?: number }) {
  const { width, height } = Dimensions.get('window');
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        x: Math.random() * (width - 30),
        delay: Math.random() * 700,
        dur: 1800 + Math.random() * 1400,
        e: ['⭐', '✨', '🎉', '💫', '🌟', '🎈'][i % 6],
        v: new Animated.Value(0),
      })),
    [count, width],
  );
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    pieces.forEach((p) =>
      Animated.timing(p.v, {
        toValue: 1,
        duration: p.dur,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: ND,
      }).start(),
    );
  }, [pieces]);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p) => (
        <Animated.Text
          key={p.key}
          style={{
            position: 'absolute',
            left: p.x,
            top: -40,
            fontSize: 26,
            opacity: p.v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, height + 60] }) },
              { rotate: p.v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.key % 2 ? 300 : -300}deg`] }) },
            ],
          }}
        >
          {p.e}
        </Animated.Text>
      ))}
    </View>
  );
}

export function ProgressBar({ value, color = C.gold }: { value: number; color?: string }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

export const T = StyleSheet.create({
  h1: { color: C.text, fontSize: 30, fontWeight: '900', textAlign: 'center' },
  h2: { color: C.text, fontSize: 22, fontWeight: '800' },
  body: { color: C.sub, fontSize: 16, lineHeight: 22 },
  small: { color: C.dim, fontSize: 13 },
});

const styles = StyleSheet.create({
  btn: {
    borderRadius: R.l,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    minHeight: 56,
  },
  btnText: { fontWeight: '900', letterSpacing: 0.3, textAlign: 'center' },
  bubbleWrap: { alignItems: 'center', width: '100%' },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  bubble: {
    backgroundColor: '#fff',
    borderRadius: R.m,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 46,
    minHeight: 52,
    width: '100%',
    justifyContent: 'center',
  },
  bubbleText: { color: C.ink, fontSize: 18, fontWeight: '700', lineHeight: 24 },
  replay: { position: 'absolute', right: 10, top: 10 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.line,
  },
  nebula: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#3A1F7A',
    opacity: 0.35,
    top: -160,
    right: -170,
  },
  nebula2: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#0E4E6B',
    opacity: 0.3,
    bottom: -140,
    left: -150,
  },
  track: { height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden', width: '100%' },
  fill: { height: '100%', borderRadius: 7 },
});
