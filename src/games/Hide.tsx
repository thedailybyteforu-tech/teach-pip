import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Creature, randomCritter } from '../Creature';
import { Split, Tag } from '../Split';
import { useStore } from '../store';
import { C, shuffle, type Side } from '../theme';

/**
 * Hide and Seek: one person hides a creature while the other closes their eyes. The seeker then
 * taps hiding places, and the hider's half shows a clue to SAY OUT LOUD: "warmer" or "colder".
 * The hider's half never shows where the creature is, so there is nothing to peek at.
 */
const THINGS = ['🌳', '🪨', '🏠', '🌲', '🍄', '⛺', '🌻', '🛶', '🧺', '🪵'];
const SLOTS: [number, number][] = [
  [8, 10], [40, 4], [72, 12], [20, 40], [56, 36], [84, 46], [6, 70], [36, 72], [66, 68],
];
const W = 290;
const H = 150;

type Phase = 'hide' | 'seek' | 'found';
type Clue = 'start' | 'hot' | 'cold' | 'warmer' | 'colder';

const CLUES: Record<Clue, { emoji: string; say: string }> = {
  start: { emoji: '👀', say: 'Watch your partner look!' },
  hot: { emoji: '🔥', say: 'Say: "You are HOT!"' },
  cold: { emoji: '🧊', say: 'Say: "You are COLD!"' },
  warmer: { emoji: '☀️', say: 'Say: "Warmer!"' },
  colder: { emoji: '❄️', say: 'Say: "Colder!"' },
};

export function Hide({ onExit }: { onExit: () => void }) {
  const { bump } = useStore();
  const [n, setN] = useState(0);
  const scene = useMemo(() => ({ things: shuffle(THINGS).slice(0, SLOTS.length), critter: randomCritter() }), [n]); // eslint-disable-line react-hooks/exhaustive-deps
  const [phase, setPhase] = useState<Phase>('hide');
  const [spot, setSpot] = useState(-1);
  const [tried, setTried] = useState<number[]>([]);
  const [clue, setClue] = useState<Clue>('start');
  // The grown-up hides first, to show how the clues work.
  const hider: Side = n % 2 === 0 ? 'grown' : 'kid';

  const dist = (a: number, b: number) => Math.hypot(SLOTS[a][0] - SLOTS[b][0], SLOTS[a][1] - SLOTS[b][1]);

  const hideAt = (i: number) => {
    setSpot(i);
    setPhase('seek');
  };

  const look = (i: number) => {
    if (phase !== 'seek' || tried.includes(i)) return;
    if (i === spot) {
      setPhase('found');
      bump('hides');
      return;
    }
    const d = dist(i, spot);
    const last = tried[tried.length - 1];
    if (last === undefined) setClue(d < 42 ? 'hot' : 'cold');
    else setClue(d < dist(last, spot) ? 'warmer' : 'colder');
    setTried((t) => [...t, i]);
  };

  const next = () => {
    setPhase('hide');
    setSpot(-1);
    setTried([]);
    setClue('start');
    setN(n + 1);
  };

  const sceneView = (onTap: ((i: number) => void) | null, showFound: boolean) => (
    <View style={styles.scene}>
      {SLOTS.map(([x, y], i) => {
        const empty = tried.includes(i);
        const here = showFound && i === spot;
        return (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`hiding place ${i + 1}`}
            disabled={!onTap || empty}
            onPress={() => onTap?.(i)}
            style={[styles.thing, { left: (x / 100) * W, top: (y / 100) * H }, empty && { opacity: 0.3 }]}
          >
            {here && (
              <View style={styles.peek}>
                <Creature c={scene.critter} size={40} />
              </View>
            )}
            <Text style={styles.emoji}>{scene.things[i]}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const half = (side: Side) => {
    const isHider = side === hider;
    if (phase === 'found') {
      return (
        <View style={styles.center}>
          <Text style={styles.h}>🎉 Found it in {tried.length + 1} {tried.length === 0 ? 'look' : 'looks'}!</Text>
          {sceneView(null, true)}
          <Pressable accessibilityRole="button" onPress={next} style={styles.next}>
            <Text style={styles.nextText}>Swap jobs ▶</Text>
          </Pressable>
        </View>
      );
    }
    if (phase === 'hide') {
      return isHider ? (
        <View style={styles.center}>
          <Tag side={side} note="hide it" />
          <View style={styles.row}>
            <Creature c={scene.critter} size={40} />
            <Text style={styles.h}>Tap a place to hide me!</Text>
          </View>
          {sceneView(hideAt, false)}
        </View>
      ) : (
        <View style={styles.center}>
          <Tag side={side} note="seeker" />
          <Text style={styles.huge}>🙈</Text>
          <Text style={styles.h}>Close your eyes. No peeking!</Text>
        </View>
      );
    }
    return isHider ? (
      <View style={styles.center}>
        <Tag side={side} note="give clues" />
        <Text style={styles.huge}>{CLUES[clue].emoji}</Text>
        <Text style={styles.h}>{CLUES[clue].say}</Text>
        <Text style={styles.tip}>Hidden! Only your words can help.</Text>
      </View>
    ) : (
      <View style={styles.center}>
        <Tag side={side} note="find it" />
        <Text style={styles.h}>Open your eyes! Where is it hiding?</Text>
        {sceneView(look, false)}
        <Text style={styles.tip}>{tried.length ? 'Listen: warmer or colder?' : 'Tap a place to look.'}</Text>
      </View>
    );
  };

  return <Split title={`Hide and Seek · round ${n + 1}`} onExit={onExit} grown={half('grown')} kid={half('kid')} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scene: { width: W + 44, height: H + 40, backgroundColor: '#DFF0D2', borderRadius: 24 },
  thing: { position: 'absolute', width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 36 },
  peek: { position: 'absolute', top: -20, left: 18 },
  h: { color: C.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  tip: { color: C.sub, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  huge: { fontSize: 72 },
  next: { backgroundColor: C.sun, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 10, borderBottomWidth: 4, borderBottomColor: C.sunDark },
  nextText: { color: C.ink, fontWeight: '900', fontSize: 17 },
});
