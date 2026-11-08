import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShapeView } from '../../components/ShapeView';
import { NOTES, play } from '../../lib/sfx';
import type { ShapeName } from '../../types';
import { Draggable } from '../Draggable';
import { P } from './theme';

const SHAPES: ShapeName[] = ['circle', 'square', 'triangle', 'star', 'hexagon', 'oval'];
const TINTS = ['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'];
const HOLE = 70;

/**
 * Shape Sorter: wooden shapes to carry to their matching holes. A shape in the wrong hole just
 * stays where it was put; there are no points and no "wrong" sound.
 */
export function ShapeSorter() {
  const [size, setSize] = useState({ w: 340, h: 480 });
  const [placed, setPlaced] = useState<ShapeName[]>([]);
  const [round, setRound] = useState(0);

  const holes = useMemo(
    () =>
      SHAPES.map((s, i) => ({
        s,
        x: size.w * (0.2 + (i % 3) * 0.3) - HOLE / 2,
        y: 20 + Math.floor(i / 3) * (HOLE + 26),
      })),
    [size.w],
  );

  // Pieces start along the bottom, in a different order each round.
  const order = useMemo(() => [...SHAPES].sort(() => Math.random() - 0.5), [round]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (placed.length === SHAPES.length) {
      NOTES.forEach((n, i) => setTimeout(() => play(n, 0.4), i * 160));
    }
  }, [placed.length]);

  const drop = (shape: ShapeName, x: number, y: number) => {
    const cx = x + HOLE / 2;
    const cy = y + HOLE / 2;
    const h = holes.find((k) => k.s === shape)!;
    if (Math.hypot(cx - (h.x + HOLE / 2), cy - (h.y + HOLE / 2)) < 46 && !placed.includes(shape)) {
      setPlaced((p) => [...p, shape]);
      play(NOTES[SHAPES.indexOf(shape)], 0.55);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.board} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        {holes.map((h) => (
          <View key={h.s} style={[styles.hole, { left: h.x, top: h.y }]}>
            {placed.includes(h.s) ? <ShapeView shape={h.s} color={TINTS[SHAPES.indexOf(h.s)]} size={HOLE - 8} /> : <View style={{ opacity: 0.28 }}><ShapeView shape={h.s} color="#8E8576" size={HOLE - 14} /></View>}
          </View>
        ))}
        {order.map((s, i) =>
          placed.includes(s) ? null : (
            <Draggable
              key={`${round}-${s}`}
              x={size.w * (0.06 + (i % 3) * 0.3)}
              y={size.h * 0.55 + Math.floor(i / 3) * (HOLE + 24)}
              onDrop={(x, y) => drop(s, x, y)}
              onTap={() => play('tock', 0.3)}
            >
              <ShapeView shape={s} color={TINTS[SHAPES.indexOf(s)]} size={HOLE} />
            </Draggable>
          ),
        )}
        {placed.length === SHAPES.length && <Text style={styles.done}>All home. 🌿</Text>}
      </View>
      <View style={styles.tools}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setPlaced([]);
            setRound((r) => r + 1);
          }}
          style={styles.tool}
        >
          <Text style={styles.toolText}>Again</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, marginHorizontal: 14, backgroundColor: '#EADFCB', borderRadius: 20, overflow: 'hidden' },
  hole: { position: 'absolute', width: HOLE, height: HOLE, borderRadius: 18, backgroundColor: '#D5C7AE', alignItems: 'center', justifyContent: 'center' },
  done: { position: 'absolute', alignSelf: 'center', top: '42%', color: P.ink, opacity: 0.7, fontSize: 18, fontWeight: '700' },
  tools: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10 },
  tool: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolText: { color: P.ink, fontWeight: '700' },
});
