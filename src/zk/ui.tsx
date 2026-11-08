import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { feel, say } from '../lib/voice';
import { Buddy, CAST, type BuddyId } from './characters';

/** ZoomikoKids palette: bright daytime Sprinkle Valley, the opposite of Pip's night sky. */
export const Z = {
  sky: '#BFE9FF',
  skyLow: '#E8F8FF',
  grass: '#9BE07A',
  grassDark: '#6CC24A',
  ink: '#2B2350',
  sub: '#5B5680',
  card: '#FFFFFF',
  line: '#D9E6F2',
  coral: '#FF7A6B',
  teal: '#2EC4B6',
  sun: '#FFD23F',
  sunDark: '#E0A800',
  calm: '#F3EDE2',
  calmInk: '#5C5246',
};

/** The daytime world behind most ZoomikoKids screens. */
export function Sky({ children, grass = true }: { children: React.ReactNode; grass?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: Z.sky }}>
      <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        <View style={[styles.sun]} />
        <View style={[styles.cloud, { top: 60, left: -30 }]} />
        <View style={[styles.cloud, { top: 130, right: -40, transform: [{ scale: 0.8 }] }]} />
        {grass && <View style={styles.hill} />}
        {grass && <View style={styles.hill2} />}
      </View>
      {children}
    </View>
  );
}

export function ZHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={10}
        onPress={() => {
          feel.tap();
          onBack();
        }}
        style={styles.back}
      >
        <Text style={{ fontSize: 22 }}>⬅️</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={{ width: 48, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/**
 * A character who talks: says a line out loud and opens its mouth while it does.
 * Returns [talking, speak].
 */
export function useTalk(): [boolean, (line: string) => void] {
  const [talking, setTalking] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (t.current) clearTimeout(t.current);
  }, []);
  const speak = useCallback((line: string) => {
    say(line);
    setTalking(true);
    if (t.current) clearTimeout(t.current);
    t.current = setTimeout(() => setTalking(false), Math.min(4000, 500 + line.length * 55));
  }, []);
  return [talking, speak];
}

/** A host character with a speech bubble beside it. */
export function Host({
  id,
  line,
  talking,
  size = 96,
  onPress,
}: {
  id: BuddyId;
  line: string;
  talking: boolean;
  size?: number;
  onPress?: () => void;
}) {
  return (
    <View style={styles.hostRow}>
      <Buddy id={id} size={size} talking={talking} onPress={onPress} />
      <View style={styles.bubble}>
        <Text style={styles.bubbleName}>{CAST[id].name}</Text>
        <Text style={styles.bubbleText}>{line}</Text>
      </View>
    </View>
  );
}

export function Chip({
  label,
  on,
  onPress,
  color = Z.teal,
  style,
}: {
  label: string;
  on?: boolean;
  onPress: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        feel.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.chip,
        on && { backgroundColor: color, borderColor: color },
        pressed && { transform: [{ scale: 0.95 }] },
        style,
      ]}
    >
      <Text style={[styles.chipText, on && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export const zt = StyleSheet.create({
  h1: { color: Z.ink, fontSize: 28, fontWeight: '900', textAlign: 'center' },
  h2: { color: Z.ink, fontSize: 20, fontWeight: '900' },
  body: { color: Z.sub, fontSize: 16, lineHeight: 22 },
  card: { backgroundColor: Z.card, borderRadius: 24, padding: 16, borderWidth: 2, borderColor: Z.line },
});

const styles = StyleSheet.create({
  sun: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: '#FFE16B', opacity: 0.9 },
  cloud: { position: 'absolute', width: 140, height: 46, borderRadius: 23, backgroundColor: '#fff', opacity: 0.85 },
  hill: { position: 'absolute', bottom: -160, left: -120, width: 520, height: 260, borderRadius: 260, backgroundColor: Z.grass },
  hill2: { position: 'absolute', bottom: -190, right: -160, width: 520, height: 280, borderRadius: 280, backgroundColor: Z.grassDark, opacity: 0.85 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4 },
  back: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Z.line },
  title: { color: Z.ink, fontSize: 21, fontWeight: '900', flex: 1, textAlign: 'center' },
  hostRow: { flexDirection: 'row', alignItems: 'center', width: '100%', gap: 4 },
  bubble: { flex: 1, backgroundColor: '#fff', borderRadius: 20, padding: 12, borderWidth: 2, borderColor: Z.line },
  bubbleName: { color: Z.teal, fontWeight: '900', fontSize: 13, marginBottom: 2 },
  bubbleText: { color: Z.ink, fontWeight: '700', fontSize: 17, lineHeight: 23 },
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18, backgroundColor: '#fff', borderWidth: 2, borderColor: Z.line },
  chipText: { color: Z.ink, fontWeight: '800', fontSize: 15 },
});

export { CAST };
export type { BuddyId };
