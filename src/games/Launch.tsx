import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { useStore } from '../store';
import { C, ND, pick, SIDE } from '../theme';

const PLACES = ['🌙 the Moon', '🪐 Saturn', '⭐ a star', '☄️ a comet', '🌈 the rainbow', '🧀 the cheese planet'];
const HOLD_MS = 3000;

/**
 * Launch Together: the rocket only charges while BOTH people hold their half of the screen.
 * If either lets go, it cools down. Patience and teamwork, with a countdown to say out loud.
 */
export function Launch({ onExit }: { onExit: () => void }) {
  const { bump } = useStore();
  const [held, setHeld] = useState({ kid: false, grown: false });
  const [charge, setCharge] = useState(0);
  const [flown, setFlown] = useState<string | null>(null);
  const heldRef = useRef(held);
  heldRef.current = held;
  const box = useRef<React.ComponentRef<typeof View>>(null);
  const frame = useRef({ y: 0, h: 1 });
  const fly = useRef(new Animated.Value(0)).current;

  // Every finger on the top half counts for the grown-up, every finger on the bottom half for the kid.
  const read = (e: GestureResponderEvent) => {
    const mid = frame.current.y + frame.current.h / 2;
    const t = e.nativeEvent.touches ?? [];
    setHeld({ grown: t.some((p) => p.pageY < mid), kid: t.some((p) => p.pageY >= mid) });
  };

  useEffect(() => {
    if (flown) return;
    const t = setInterval(() => {
      setCharge((c) => {
        const both = heldRef.current.kid && heldRef.current.grown;
        return Math.max(0, Math.min(1, c + (both ? 60 / HOLD_MS : -0.04)));
      });
    }, 60);
    return () => clearInterval(t);
  }, [flown]);

  useEffect(() => {
    if (charge >= 1 && !flown) {
      setFlown(pick(PLACES));
      bump('launches');
      fly.setValue(0);
      Animated.timing(fly, { toValue: 1, duration: 1600, easing: Easing.in(Easing.quad), useNativeDriver: ND }).start();
    }
  }, [charge, flown, bump, fly]);

  const again = () => {
    setFlown(null);
    setCharge(0);
    setHeld({ kid: false, grown: false });
    fly.setValue(0);
  };

  const count = charge <= 0 ? '' : charge < 0.34 ? '3' : charge < 0.67 ? '2' : charge < 1 ? '1' : '';
  const half = (side: 'kid' | 'grown') => {
    const s = SIDE[side];
    const me = held[side];
    const other = held[side === 'kid' ? 'grown' : 'kid'];
    return (
      <View style={[styles.half, { backgroundColor: me ? s.color : s.soft }, side === 'grown' && { transform: [{ rotate: '180deg' }] }]}>
        {flown ? (
          <>
            <Text style={styles.big}>🎉</Text>
            <Text style={[styles.h, { color: C.ink }]}>Blast off to {flown}!</Text>
          </>
        ) : (
          <>
            <Text style={styles.big}>{me ? '🖐️' : '👇'}</Text>
            <Text style={[styles.h, { color: me ? '#fff' : C.ink }]}>{me ? (other ? `Hold... ${count}` : 'Waiting for your partner!') : 'Press and hold here'}</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View
      ref={box}
      style={[{ flex: 1 }, { touchAction: 'none' } as object]}
      onLayout={() => box.current?.measureInWindow((_x, y, _w, h) => (frame.current = { y, h }))}
      onStartShouldSetResponder={() => !flown}
      onResponderGrant={read}
      onResponderStart={read}
      onResponderMove={read}
      onResponderEnd={read}
      onResponderRelease={() => setHeld({ kid: false, grown: false })}
      onResponderTerminate={() => setHeld({ kid: false, grown: false })}
    >
      {half('grown')}
      <View style={styles.pad}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to games" onPress={onExit} hitSlop={10} style={styles.exit}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>✕</Text>
        </Pressable>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(charge * 100)}%` }]} />
        </View>
        <Animated.Text
          style={[
            styles.rocket,
            { transform: [{ translateX: fly.interpolate({ inputRange: [0, 1], outputRange: [0, 420] }) }, { rotate: '45deg' }, { scale: 1 + charge * 0.35 }] },
          ]}
        >
          🚀
        </Animated.Text>
        {flown ? (
          <Pressable accessibilityRole="button" onPress={again} style={styles.again}>
            <Text style={styles.againText}>Again ▶</Text>
          </Pressable>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>
      {half('kid')}
    </View>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16 },
  big: { fontSize: 64 },
  h: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  pad: { height: 64, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 10 },
  exit: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  track: { flex: 1, height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: C.sun },
  rocket: { position: 'absolute', left: '42%', fontSize: 34 },
  again: { backgroundColor: C.sun, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, width: 90, alignItems: 'center' },
  againText: { color: C.ink, fontWeight: '900' },
});
