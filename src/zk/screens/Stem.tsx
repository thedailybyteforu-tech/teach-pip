import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { shuffle } from '../../lib/random';
import { BigButton } from '../../components/ui';
import { Pip } from '../../components/Pip';
import { ND } from '../../theme';
import { Buddy } from '../characters';
import { Host, Sky, useTalk, Z, ZHeader, zt } from '../ui';

export function Stem({ onBack, onPip, startPattern }: { onBack: () => void; onPip: () => void; startPattern?: boolean }) {
  const [game, setGame] = useState<'menu' | 'pattern'>(startPattern ? 'pattern' : 'menu');
  const [talking, speak] = useTalk();
  const line = 'La la la! Pick a game. Patterns with my pom-poms, or teach Pip the space alien!';
  useEffect(() => {
    if (game === 'menu') speak(line);
  }, [game, speak]);
  if (game === 'pattern') return <Patterns onBack={() => setGame('menu')} />;
  return (
    <Sky>
      <ZHeader title="STEM Games" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="bobble" line={line} talking={talking} />
        <Pressable accessibilityRole="button" onPress={() => setGame('pattern')} style={[styles.card, { borderColor: '#7FD8A6' }]}>
          <Buddy id="bobble" size={86} still />
          <View style={{ flex: 1 }}>
            <Text style={zt.h2}>🔴🔵 Pattern Party</Text>
            <Text style={zt.body}>What comes next? Gets trickier as you go.</Text>
          </View>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onPip} style={[styles.card, { borderColor: '#5EE6C8', backgroundColor: '#211852' }]}>
          <Pip size={86} />
          <View style={{ flex: 1 }}>
            <Text style={[zt.h2, { color: '#fff' }]}>👽 Teach Pip</Text>
            <Text style={[zt.body, { color: '#C9C3F5' }]}>Be the teacher! Numbers, letters, shapes and more.</Text>
          </View>
        </Pressable>
      </ScrollView>
    </Sky>
  );
}

const POMS = ['#FF5A7A', '#2EC4B6', '#FFD23F', '#9B5DE5'];
/** Pattern units, easiest first. The child's level picks from these. */
const UNITS = ['AB', 'AAB', 'ABC', 'ABB', 'AABB', 'ABCD'];

function makePattern(level: number) {
  const unit = UNITS[Math.min(UNITS.length - 1, level - 1)];
  const colors = shuffle(POMS);
  const seq = Array.from({ length: Math.max(unit.length * 2 + 1, 6) }, (_, i) => colors[unit.charCodeAt(i % unit.length) - 65]);
  const answer = seq[seq.length - 1];
  const choices = shuffle(Array.from(new Set([answer, ...colors.slice(0, 3)]))).slice(0, 3);
  if (!choices.includes(answer)) choices[0] = answer;
  return { shown: seq.slice(0, -1), answer, choices: shuffle(choices) };
}

function Patterns({ onBack }: { onBack: () => void }) {
  const { data, update, markDone } = useStore();
  const level = data.zk.patternLevel;
  const [n, setN] = useState(0);
  const p = useMemo(() => makePattern(level), [level, n]);
  const [streak, setStreak] = useState(0);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(false);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const pop = useRef(new Animated.Value(0)).current;
  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };

  useEffect(() => {
    setSolved(false);
    pop.setValue(0);
    talk('Look at my pom-poms! Which color comes next?');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  const setLevel = (l: number) => update((d) => ({ ...d, zk: { ...d.zk, patternLevel: Math.max(1, Math.min(UNITS.length, l)) } }));

  const choose = (c: string) => {
    if (solved) return;
    if (c === p.answer) {
      feel.good();
      setSolved(true);
      Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: ND }).start();
      markDone('pattern');
      const s = streak + 1;
      setStreak(s);
      setMisses(0);
      // Adaptive: two in a row moves up a level.
      if (s >= 2 && level < UNITS.length) {
        setLevel(level + 1);
        setStreak(0);
        talk('La la la! You got it! Next one is a bit trickier!');
      } else talk('La la la! Yes! That is the pattern!');
    } else {
      feel.oops();
      const m = misses + 1;
      setMisses(m);
      setStreak(0);
      if (m >= 2 && level > 1) {
        setLevel(level - 1);
        talk("Hmm, tricky one! Let's try an easier pattern.");
      } else talk('Not that one. Say the colors out loud with me, then try again!');
    }
  };

  return (
    <Sky>
      <ZHeader title="Pattern Party" onBack={onBack} right={<Text style={styles.level}>Lv {level}</Text>} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="bobble" line={line} talking={talking} size={84} />
        <View style={styles.rowWrap}>
          {p.shown.map((c, i) => (
            <View key={i} style={[styles.pom, { backgroundColor: c }]} />
          ))}
          <Animated.View
            style={[
              styles.pom,
              styles.mystery,
              solved && { backgroundColor: p.answer, borderStyle: 'solid', transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
            ]}
          >
            {!solved && <Text style={{ fontSize: 22, fontWeight: '900', color: Z.sub }}>?</Text>}
          </Animated.View>
        </View>
        <View style={styles.choices}>
          {p.choices.map((c) => (
            <Pressable key={c} accessibilityRole="button" onPress={() => choose(c)} style={({ pressed }) => [styles.choice, { backgroundColor: c }, pressed && { transform: [{ scale: 0.9 }] }]} />
          ))}
        </View>
        {solved && <BigButton label="Next pattern" emoji="➡️" onPress={() => setN(n + 1)} style={{ width: '100%' }} />}
      </ScrollView>
    </Sky>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 16, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', backgroundColor: '#fff', borderRadius: 26, borderWidth: 4, padding: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 26, padding: 14, width: '100%' },
  pom: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, borderColor: 'rgba(0,0,0,0.12)' },
  mystery: { backgroundColor: '#F1F4FA', borderStyle: 'dashed', borderColor: Z.sub, alignItems: 'center', justifyContent: 'center' },
  choices: { flexDirection: 'row', gap: 18 },
  choice: { width: 78, height: 78, borderRadius: 39, borderWidth: 4, borderColor: '#fff' },
  level: { color: Z.ink, fontWeight: '900' },
});
