import React, { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { NOTES, play } from '../../lib/sfx';
import { ND } from '../../theme';
import { P } from './theme';

const COLORS = ['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'];
const SLOTS = 14;

/**
 * Bead Necklace: tap a colour to thread the next bead. Every colour is a note, so a pattern
 * of beads is also a little tune. Tap a bead to take it off.
 */
export function BeadNecklace() {
  const [size, setSize] = useState({ w: 340, h: 420 });
  const [beads, setBeads] = useState<number[]>([]);

  const add = (c: number) => {
    if (beads.length >= SLOTS) return;
    setBeads((b) => [...b, c]);
    play(NOTES[c], 0.5);
  };

  // Slots hang along a smooth curve like a real necklace.
  const spot = (i: number) => {
    const t = i / (SLOTS - 1);
    const x = size.w * (0.08 + 0.84 * t);
    const y = size.h * 0.18 + Math.sin(t * Math.PI) * size.h * 0.42;
    return { x, y };
  };
  const first = spot(0);
  const mid = spot(Math.floor(SLOTS / 2));
  const last = spot(SLOTS - 1);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.board} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
          <Path d={`M${first.x} ${first.y} Q${mid.x} ${mid.y + size.h * 0.3} ${last.x} ${last.y}`} stroke={P.woodDark} strokeWidth={3} fill="none" opacity={0.0} />
          {Array.from({ length: SLOTS - 1 }, (_, i) => {
            const a = spot(i);
            const b = spot(i + 1);
            return <Path key={i} d={`M${a.x} ${a.y} L${b.x} ${b.y}`} stroke="#B9A98F" strokeWidth={3} />;
          })}
        </Svg>
        {Array.from({ length: SLOTS }, (_, i) => {
          const s = spot(i);
          return beads[i] === undefined ? (
            <View key={i} style={[styles.slot, { left: s.x - 17, top: s.y - 17 }]} />
          ) : (
            <Bead key={`${i}-${beads[i]}`} left={s.x - 20} top={s.y - 20} color={COLORS[beads[i]]} onPress={() => { setBeads((b) => b.filter((_, k) => k !== i)); play('pop', 0.3); }} />
          );
        })}
        {beads.length === 0 && <Text style={styles.hint}>Tap a colour to add a bead</Text>}
      </View>
      <View style={styles.tools}>
        {COLORS.map((c, i) => (
          <Pressable key={c} accessibilityRole="button" accessibilityLabel={`Add a bead`} onPress={() => add(i)} style={({ pressed }) => [styles.pot, { backgroundColor: c }, pressed && { transform: [{ scale: 0.9 }] }]} />
        ))}
        <Pressable accessibilityRole="button" onPress={() => setBeads([])} style={styles.clear}>
          <Text style={styles.clearText}>Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Bead({ left, top, color, onPress }: { left: number; top: number; color: string; onPress: () => void }) {
  const s = useRef(new Animated.Value(0.2)).current;
  React.useEffect(() => {
    Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: ND }).start();
  }, [s]);
  return (
    <Animated.View style={{ position: 'absolute', left, top, transform: [{ scale: s }] }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Take this bead off" onPress={onPress} style={[styles.bead, { backgroundColor: color }]}>
        <View style={styles.shine} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, marginHorizontal: 14, backgroundColor: '#F1E8DA', borderRadius: 20, overflow: 'hidden' },
  slot: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: '#CDBFA5', borderStyle: 'dashed' },
  bead: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(92,82,70,0.15)' },
  shine: { position: 'absolute', top: 7, left: 9, width: 11, height: 11, borderRadius: 6, backgroundColor: '#fff', opacity: 0.55 },
  hint: { position: 'absolute', alignSelf: 'center', top: '78%', color: P.ink, opacity: 0.5 },
  tools: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 10, flexWrap: 'wrap' },
  pot: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: '#fff' },
  clear: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: P.paper },
  clearText: { color: P.ink, fontWeight: '700' },
});
