import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useStore } from '../store';
import { C, pick, SIDE } from '../theme';

const IDEAS = [
  'a house for a snail', 'a monster who loves soup', 'the tallest ice cream ever', 'a bus full of animals', 'a garden on the moon',
  'a cat wearing shoes', 'a rainbow fish', 'a robot having a birthday', 'a tree with funny fruit', 'a dragon who is sleepy',
  'our family as animals', 'a castle made of cake', 'a very long dog', 'a boat in the bathtub', 'a hat for a giraffe',
];

interface Stroke {
  color: string;
  d: string;
}

/**
 * Draw Together: one shared page, two artists at once. Lines started on the child's half are
 * coral and lines started on the grown-up's half are teal, so you can see who drew what.
 */
export function Draw({ onExit }: { onExit: () => void }) {
  const { bump } = useStore();
  const [idea, setIdea] = useState(() => pick(IDEAS));
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const live = useRef(new Map<string, number>()); // finger id -> index in strokes
  const box = useRef<React.ComponentRef<typeof View>>(null);
  const frame = useRef({ x: 0, y: 0, h: 1 });
  const counted = useRef(false);

  const touch = (e: GestureResponderEvent) => {
    const ts = e.nativeEvent.touches ?? [];
    const f = frame.current;
    setStrokes((prev) => {
      let out = prev;
      const seen = new Set<string>();
      for (const t of ts) {
        const id = String(t.identifier);
        seen.add(id);
        const x = (t.pageX - f.x).toFixed(1);
        const y = (t.pageY - f.y).toFixed(1);
        const idx = live.current.get(id);
        if (idx === undefined) {
          const color = t.pageY - f.y < f.h / 2 ? SIDE.grown.color : SIDE.kid.color;
          live.current.set(id, out.length);
          out = [...out, { color, d: `M${x} ${y} l0.1 0.1` }];
        } else if (out[idx]) {
          out = out.map((s, i) => (i === idx ? { ...s, d: `${s.d} L${x} ${y}` } : s));
        }
      }
      for (const id of [...live.current.keys()]) if (!seen.has(id)) live.current.delete(id);
      return out;
    });
    if (!counted.current) {
      counted.current = true;
      bump('drawings');
    }
  };
  const lift = () => live.current.clear();

  const fresh = (newIdea: boolean) => {
    setStrokes([]);
    live.current.clear();
    counted.current = false;
    if (newIdea) setIdea(pick(IDEAS.filter((i) => i !== idea)));
  };

  const label = (
    <View style={styles.label} pointerEvents="none">
      <Text style={styles.labelText}>Together, draw {idea}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFDF8' }}>
      <View
        ref={box}
        // touchAction stops browsers treating two fingers as a pinch-zoom (native ignores it).
        style={[{ flex: 1 }, { touchAction: 'none' } as object]}
        onLayout={() => box.current?.measureInWindow((x, y, _w, h) => (frame.current = { x, y, h }))}
        onStartShouldSetResponder={() => true}
        onResponderGrant={touch}
        onResponderStart={touch}
        onResponderMove={touch}
        onResponderEnd={touch}
        onResponderRelease={lift}
        onResponderTerminate={lift}
      >
        <Svg width="100%" height="100%">
          {strokes.map((s, i) => (
            <Path key={i} d={s.d} stroke={s.color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
        <View style={[styles.edge, { top: 8, transform: [{ rotate: '180deg' }] }]} pointerEvents="none">
          {label}
        </View>
        <View style={[styles.edge, { bottom: 8 }]} pointerEvents="none">
          {label}
        </View>
      </View>
      <View style={styles.pill}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to games" onPress={onExit} style={styles.btn}>
          <Text style={styles.btnText}>✕</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="New idea" onPress={() => fresh(true)} style={styles.btn}>
          <Text style={styles.btnText}>💡</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Clean page" onPress={() => fresh(false)} style={styles.btn}>
          <Text style={styles.btnText}>🧽</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  label: { backgroundColor: C.ink, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 },
  labelText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  pill: { position: 'absolute', left: 8, top: '50%', marginTop: -70, gap: 8, zIndex: 10, elevation: 10 },
  btn: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: 17 },
});
