import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { play } from '../../lib/sfx';
import { Buddy, type BuddyId } from '../characters';
import { Draggable } from '../Draggable';
import { P } from './theme';

const PEOPLE: BuddyId[] = ['zoomi', 'roarbow', 'puddle', 'nibbles', 'pinky', 'kiki'];
const THINGS = ['🚗', '🚌', '🚲', '🛴', '🐕', '🐈', '🌳', '🌳', '⛲', '🧺'];
/** Starting spots (fractions of the map) so the village looks lived-in, not piled up. */
const SPOTS: [number, number][] = [
  [0.08, 0.47], [0.6, 0.47], [0.47, 0.2], [0.47, 0.78], [0.32, 0.36], [0.82, 0.58], [0.32, 0.14], [0.3, 0.84], [0.78, 0.3], [0.28, 0.6],
];
const PEOPLE_SPOTS: [number, number][] = [[0.04, 0.35], [0.6, 0.3], [0.16, 0.85], [0.66, 0.86], [0.83, 0.42], [0.5, 0.6]];

/** Tiny Town: a quiet little village. Move anyone anywhere; tap houses to light their windows. */
export function Town() {
  const [size, setSize] = useState({ w: 340, h: 480 });
  const [lit, setLit] = useState([false, true, false, false]);
  const houses = [
    { x: 0.06, y: 0.06, color: P.clay, roof: P.woodDark },
    { x: 0.62, y: 0.08, color: P.butter, roof: P.clay },
    { x: 0.08, y: 0.62, color: P.sage, roof: P.woodDark },
    { x: 0.64, y: 0.64, color: P.dusk, roof: P.clay },
  ];
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.map} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <View style={[styles.road, { top: '46%', left: 0, right: 0, height: 44 }]} />
        <View style={[styles.road, { left: '45%', top: 0, bottom: 0, width: 44 }]} />
        <View style={styles.pond} />
        {houses.map((h, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={lit[i] ? 'Turn the lights off' : 'Turn the lights on'}
            onPress={() => {
              setLit((l) => l.map((v, k) => (k === i ? !v : v)));
              play('tock', 0.35);
            }}
            style={[styles.house, { left: h.x * size.w, top: h.y * size.h }]}
          >
            <View style={[styles.roof, { borderBottomColor: h.roof }]} />
            <View style={[styles.walls, { backgroundColor: h.color }]}>
              <View style={[styles.window, lit[i] && styles.windowLit]} />
              <View style={[styles.window, lit[i] && styles.windowLit]} />
            </View>
          </Pressable>
        ))}
        {THINGS.map((t, i) => (
          <Draggable key={`t${i}`} x={SPOTS[i][0] * size.w} y={SPOTS[i][1] * size.h} onTap={() => play('pop', 0.25)}>
            <Text style={{ fontSize: 34 }}>{t}</Text>
          </Draggable>
        ))}
        {PEOPLE.map((id, i) => (
          <Draggable key={id} x={PEOPLE_SPOTS[i][0] * size.w} y={PEOPLE_SPOTS[i][1] * size.h} onTap={() => play('pop', 0.3)}>
            <Buddy id={id} size={58} still />
          </Draggable>
        ))}
      </View>
      <Text style={styles.hint}>Move anyone anywhere. Tap a house to switch its lights.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, marginHorizontal: 14, backgroundColor: '#CFDFC4', borderRadius: 20, overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: '#D8D2C6' },
  pond: { position: 'absolute', right: '6%', top: '30%', width: 90, height: 60, borderRadius: 40, backgroundColor: '#B9D3DE' },
  house: { position: 'absolute', alignItems: 'center' },
  roof: { width: 0, height: 0, borderLeftWidth: 44, borderRightWidth: 44, borderBottomWidth: 30, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  walls: { width: 76, height: 56, borderBottomLeftRadius: 6, borderBottomRightRadius: 6, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  window: { width: 18, height: 18, borderRadius: 3, backgroundColor: '#8E8576' },
  windowLit: { backgroundColor: P.butter },
  hint: { color: P.ink, opacity: 0.6, textAlign: 'center', paddingVertical: 12 },
});
