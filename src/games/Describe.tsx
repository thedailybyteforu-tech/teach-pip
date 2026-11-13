import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Creature, critterKey, lookAlike, randomCritter, type Critter } from '../Creature';
import { Split, Tag } from '../Split';
import { useStore } from '../store';
import { C, shuffle, type Side } from '../theme';

/**
 * Describe It: one person sees a creature and describes it in words; the other sees six
 * look-alikes and has to find it. Roles swap every round, so the child both listens and
 * describes. (Speech therapists call this a "barrier game".)
 */
function makeRound(n: number): { target: Critter; options: Critter[] } {
  const target = randomCritter();
  const seen = new Set([critterKey(target)]);
  const options = [target];
  // Early rounds: look-alikes differ a lot. Later rounds: by one feature, so words must be exact.
  const diff = n < 2 ? 3 : n < 5 ? 2 : 1;
  let guard = 0;
  while (options.length < 6 && guard++ < 200) {
    const o = lookAlike(target, guard > 80 ? 2 : diff);
    if (!seen.has(critterKey(o))) {
      seen.add(critterKey(o));
      options.push(o);
    }
  }
  return { target, options: shuffle(options) };
}

export function Describe({ onExit }: { onExit: () => void }) {
  const { bump } = useStore();
  const [n, setN] = useState(0);
  const round = useMemo(() => makeRound(n), [n]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  // The grown-up describes first, to show how it's done.
  const describer: Side = n % 2 === 0 ? 'grown' : 'kid';

  const guess = (c: Critter) => {
    if (solved) return;
    if (critterKey(c) === critterKey(round.target)) {
      setSolved(true);
      bump('describe');
    } else setWrong((w) => [...w, critterKey(c)]);
  };
  const next = () => {
    setWrong([]);
    setSolved(false);
    setN(n + 1);
  };

  const done = (
    <View style={styles.center}>
      <Text style={styles.big}>🎉</Text>
      <Text style={styles.h}>You found it together!</Text>
      <Creature c={round.target} size={96} />
      <Pressable accessibilityRole="button" onPress={next} style={styles.next}>
        <Text style={styles.nextText}>Swap jobs ▶</Text>
      </Pressable>
    </View>
  );

  const describing = (side: Side) => (
    <View style={styles.center}>
      <Tag side={side} note="describe it" />
      <View style={styles.spot}>
        <Creature c={round.target} size={150} />
      </View>
      <Text style={styles.h}>Say what it looks like. No pointing! 🙈</Text>
      <Text style={styles.tip}>Color? Shape? How many eyes? A hat? Spots?</Text>
    </View>
  );

  const finding = (side: Side) => (
    <View style={styles.center}>
      <Tag side={side} note="find it" />
      <View style={styles.grid}>
        {round.options.map((o) => {
          const k = critterKey(o);
          const out = wrong.includes(k);
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityLabel={`creature ${k}`} disabled={out} onPress={() => guess(o)} style={[styles.cell, out && styles.out]}>
              <Creature c={o} size={78} />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.tip}>{wrong.length ? 'Not that one. Ask another question!' : 'Listen, ask questions, then tap.'}</Text>
    </View>
  );

  const half = (side: Side) => (solved ? done : side === describer ? describing(side) : finding(side));
  return <Split title={`Describe It · round ${n + 1}`} onExit={onExit} grown={half('grown')} kid={half('kid')} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  spot: { backgroundColor: '#fff', borderRadius: 28, padding: 10 },
  h: { color: C.ink, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  tip: { color: C.sub, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  big: { fontSize: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 300 },
  cell: { width: 90, height: 90, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  out: { opacity: 0.25 },
  next: { backgroundColor: C.sun, borderRadius: 20, paddingHorizontal: 22, paddingVertical: 12, borderBottomWidth: 4, borderBottomColor: C.sunDark, marginTop: 4 },
  nextText: { color: C.ink, fontWeight: '900', fontSize: 17 },
});
