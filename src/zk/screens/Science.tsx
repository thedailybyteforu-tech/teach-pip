import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { shuffle } from '../../lib/random';
import { BigButton, Confetti } from '../../components/ui';
import { ND } from '../../theme';
import { Buddy } from '../characters';
import { Host, Sky, useTalk, Z, ZHeader, zt } from '../ui';

type Exp = 'menu' | 'float' | 'mix' | 'grow';

export function Science({ onBack }: { onBack: () => void }) {
  const [exp, setExp] = useState<Exp>('menu');
  const back = () => setExp('menu');
  if (exp === 'float') return <SinkFloat onBack={back} />;
  if (exp === 'mix') return <MixLab onBack={back} />;
  if (exp === 'grow') return <Grow onBack={back} />;
  return <Menu onBack={onBack} onPick={setExp} />;
}

function Menu({ onBack, onPick }: { onBack: () => void; onPick: (e: Exp) => void }) {
  const [talking, speak] = useTalk();
  const line = "Kee-kee! I always ask WHY. Let's find out with an experiment! Pick one!";
  useEffect(() => speak(line), [speak]);
  const items: { id: Exp; title: string; emoji: string; host: 'kiki' | 'mona' | 'brocco'; color: string }[] = [
    { id: 'float', title: 'Sink or Float?', emoji: '🌊', host: 'kiki', color: '#4FC3F7' },
    { id: 'mix', title: 'Color Mixing', emoji: '🎨', host: 'mona', color: '#FF9EC7' },
    { id: 'grow', title: 'Grow a Plant', emoji: '🌱', host: 'brocco', color: '#7BC67E' },
  ];
  return (
    <Sky>
      <ZHeader title="Science Lab" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="kiki" line={line} talking={talking} />
        {items.map((it) => (
          <Pressable
            key={it.id}
            accessibilityRole="button"
            onPress={() => {
              feel.tap();
              onPick(it.id);
            }}
            style={({ pressed }) => [styles.expCard, { borderColor: it.color }, pressed && { transform: [{ scale: 0.97 }] }]}
          >
            <Buddy id={it.host} size={86} still />
            <View style={{ flex: 1 }}>
              <Text style={zt.h2}>
                {it.emoji} {it.title}
              </Text>
            </View>
            <Text style={{ fontSize: 28 }}>▶️</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Sky>
  );
}

/* ---------- Sink or Float ---------- */

const THINGS = [
  { e: '🦆', name: 'rubber duck', sinks: false, why: 'It is full of air, and air is light, so the duck floats!' },
  { e: '🪨', name: 'rock', sinks: true, why: 'A rock is heavy for its size, so it sinks to the bottom.' },
  { e: '🍎', name: 'apple', sinks: false, why: 'Apples have tiny pockets of air inside, so they float!' },
  { e: '🔑', name: 'key', sinks: true, why: 'A key is made of metal. It is small but heavy, so it sinks.' },
  { e: '🍃', name: 'leaf', sinks: false, why: 'A leaf is light and flat, so the water holds it up.' },
  { e: '🪙', name: 'coin', sinks: true, why: 'A coin is heavy metal, so down it goes!' },
  { e: '🧽', name: 'sponge', sinks: false, why: 'A dry sponge is full of air holes, so it floats.' },
  { e: '🥄', name: 'spoon', sinks: true, why: 'A metal spoon is heavy for its size, so it sinks.' },
];

function SinkFloat({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [order] = useState(() => shuffle(THINGS));
  const [i, setI] = useState(0);
  const [guess, setGuess] = useState<null | boolean>(null);
  const [shown, setShown] = useState(false);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const y = useRef(new Animated.Value(0)).current;
  const t = order[i];
  const TANK = 230;

  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };

  useEffect(() => {
    y.setValue(0);
    setGuess(null);
    setShown(false);
    talk(`Here is a ${t.name}. Will it sink or float? What do you think?`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  const drop = (sinks: boolean) => {
    feel.tap();
    setGuess(sinks);
    const to = t.sinks ? TANK - 70 : 58;
    Animated.timing(y, {
      toValue: to,
      duration: t.sinks ? 1300 : 900,
      easing: t.sinks ? Easing.in(Easing.quad) : Easing.out(Easing.back(2)),
      useNativeDriver: ND,
    }).start(() => {
      setShown(true);
      const right = sinks === t.sinks;
      if (right) feel.good();
      talk(`${right ? 'You guessed it!' : 'Ooh, surprise!'} It ${t.sinks ? 'sinks' : 'floats'}. ${t.why}`);
      markDone('science', (zk) => ({ ...zk, experiments: { ...zk.experiments, float: (zk.experiments.float ?? 0) + 1 } }));
    });
  };

  return (
    <Sky grass={false}>
      <ZHeader title="Sink or Float?" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="kiki" line={line} talking={talking} size={80} />
        <View style={[styles.tank, { height: TANK }]}>
          <View style={styles.water} />
          <Animated.Text style={[styles.thing, { transform: [{ translateY: y }] }]}>{t.e}</Animated.Text>
        </View>
        {guess === null ? (
          <View style={styles.row}>
            <BigButton label="Sink" emoji="⬇️" color="#5B7CFA" shade="#3B57C4" textColor="#fff" onPress={() => drop(true)} style={{ flex: 1 }} />
            <BigButton label="Float" emoji="🛟" color={Z.sun} shade={Z.sunDark} onPress={() => drop(false)} style={{ flex: 1 }} />
          </View>
        ) : shown ? (
          <BigButton label="Try another" emoji="➡️" onPress={() => setI((i + 1) % order.length)} style={{ width: '100%' }} />
        ) : (
          <Text style={zt.body}>Splash! Watch...</Text>
        )}
      </ScrollView>
    </Sky>
  );
}

/* ---------- Color Mixing ---------- */

const PAINTS: Record<string, string> = { red: '#FF3B3B', yellow: '#FFD60A', blue: '#2F7BFF', white: '#FFFFFF' };
const MIXES: Record<string, [string, string]> = {
  'red+yellow': ['orange', '#FF8C1A'],
  'blue+yellow': ['green', '#22C55E'],
  'blue+red': ['purple', '#9B5DE5'],
  'red+white': ['pink', '#FF8FB8'],
  'blue+white': ['light blue', '#9CC8FF'],
  'white+yellow': ['light yellow', '#FFF1A6'],
};

function MixLab({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [picked, setPicked] = useState<string[]>([]);
  const [result, setResult] = useState<[string, string] | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };
  useEffect(() => talk('Picture pose! Tap two paint pots, and we will mix them. What color will we make?'), []); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (c: string) => {
    feel.tap();
    if (result) {
      setResult(null);
      setPicked([c]);
      return;
    }
    const next = [...picked, c].slice(-2);
    setPicked(next);
    if (next.length === 2) {
      const key = [...next].sort().join('+');
      const r: [string, string] = next[0] === next[1] ? [next[0], PAINTS[next[0]]] : MIXES[key];
      setResult(r);
      feel.good();
      const isNew = !found.includes(r[0]);
      if (isNew) setFound((f) => [...f, r[0]]);
      talk(next[0] === next[1] ? `${r[0]} and ${r[0]} is still ${r[0]}! Try two different colors.` : `${next[0]} and ${next[1]} make ${r[0]}! ${isNew ? 'A new color!' : ''}`);
      markDone('science', (zk) => ({ ...zk, experiments: { ...zk.experiments, mix: (zk.experiments.mix ?? 0) + 1 } }));
    }
  };

  const beaker = result ? result[1] : picked.length ? PAINTS[picked[0]] : '#F1F4FA';

  return (
    <Sky grass={false}>
      <ZHeader title="Color Mixing" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="mona" line={line} talking={talking} size={80} />
        <View style={styles.beakerWrap}>
          <View style={styles.beaker}>
            <View style={[styles.paint, { backgroundColor: beaker, height: result ? '80%' : picked.length ? '40%' : '6%' }]} />
          </View>
          <Text style={[zt.h2, { marginTop: 8, textTransform: 'capitalize' }]}>{result ? result[0] : picked.length ? `${picked[0]} + ?` : 'Pick two!'}</Text>
        </View>
        <View style={styles.pots}>
          {Object.entries(PAINTS).map(([name, c]) => (
            <Pressable key={name} accessibilityRole="button" accessibilityLabel={`${name} paint`} onPress={() => tap(name)} style={({ pressed }) => [styles.pot, pressed && { transform: [{ scale: 0.92 }] }]}>
              <View style={[styles.potPaint, { backgroundColor: c }]} />
              <Text style={styles.potName}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[zt.card, { width: '100%' }]}>
          <Text style={zt.h2}>🎨 Colors you made: {found.length} of 6</Text>
          <View style={styles.found}>
            {Object.values(MIXES).map(([n, c]) => (
              <View key={n} style={[styles.dot, { backgroundColor: found.includes(n) ? c : '#EEF1F7' }]} />
            ))}
          </View>
        </View>
      </ScrollView>
      {found.length === 6 && <Confetti />}
    </Sky>
  );
}

/* ---------- Grow a Plant ---------- */

const STAGES = ['🟤', '🌱', '🌿', '🪴', '🌻'];

function Grow({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [water, setWater] = useState(0);
  const [sun, setSun] = useState(0);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const pop = useRef(new Animated.Value(1)).current;
  const stage = Math.min(4, Math.min(water, sun));
  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };
  useEffect(() => talk("Here's a tiny seed! Plants need two things to grow: water and sunshine. Can you help?"), []); // eslint-disable-line react-hooks/exhaustive-deps

  const give = (kind: 'water' | 'sun') => {
    feel.tap();
    const w = water + (kind === 'water' ? 1 : 0);
    const s = sun + (kind === 'sun' ? 1 : 0);
    setWater(w);
    setSun(s);
    const st = Math.min(4, Math.min(w, s));
    if (st > stage) {
      pop.setValue(0.6);
      Animated.spring(pop, { toValue: 1, friction: 3, useNativeDriver: ND }).start();
      feel.good();
      if (st === 4) {
        talk('WOW! A sunflower! Water plus sunshine made it grow. You are a real scientist! Be cool!');
        markDone('science', (zk) => ({ ...zk, experiments: { ...zk.experiments, grow: (zk.experiments.grow ?? 0) + 1 } }));
      } else talk(['It sprouted! Look, a little shoot!', 'More leaves! It is growing!', 'So big! Keep going!'][st - 1]);
    } else if (w - s >= 2) talk('Blub blub! Too much water. The plant needs sunshine too!');
    else if (s - w >= 2) talk('So hot! The plant is thirsty. It needs a drink of water!');
  };

  return (
    <Sky>
      <ZHeader title="Grow a Plant" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="brocco" line={line} talking={talking} size={80} />
        <View style={styles.garden}>
          <Text style={{ fontSize: 36, opacity: Math.min(1, sun * 0.25 + 0.2) }}>☀️</Text>
          <Animated.Text style={{ fontSize: 40 + stage * 22, transform: [{ scale: pop }] }}>{STAGES[stage]}</Animated.Text>
          <View style={styles.potBox} />
        </View>
        <View style={styles.row}>
          <Text style={styles.meter}>💧 {water}</Text>
          <Text style={styles.meter}>☀️ {sun}</Text>
        </View>
        {stage < 4 ? (
          <View style={styles.row}>
            <BigButton label="Water" emoji="💧" color="#4FC3F7" shade="#2A8FC2" onPress={() => give('water')} style={{ flex: 1 }} />
            <BigButton label="Sunshine" emoji="☀️" color={Z.sun} shade={Z.sunDark} onPress={() => give('sun')} style={{ flex: 1 }} />
          </View>
        ) : (
          <BigButton
            label="Plant a new seed"
            emoji="🌱"
            onPress={() => {
              setWater(0);
              setSun(0);
              talk('A new seed! Water and sunshine, here we go!');
            }}
            style={{ width: '100%' }}
          />
        )}
      </ScrollView>
      {stage === 4 && <Confetti />}
    </Sky>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  expCard: { flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', backgroundColor: '#fff', borderRadius: 26, borderWidth: 4, padding: 10 },
  row: { flexDirection: 'row', gap: 12, width: '100%' },
  tank: { width: '100%', borderRadius: 28, backgroundColor: '#E8F6FF', borderWidth: 4, borderColor: '#9CD3F2', overflow: 'hidden', alignItems: 'center' },
  water: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 80, backgroundColor: '#7CC9F2', opacity: 0.75 },
  thing: { fontSize: 56, marginTop: 6 },
  beakerWrap: { alignItems: 'center' },
  beaker: { width: 150, height: 170, borderWidth: 5, borderColor: '#9AA8C7', borderTopWidth: 0, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, backgroundColor: '#fff', overflow: 'hidden', justifyContent: 'flex-end' },
  paint: { width: '100%' },
  pots: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  pot: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 8, borderWidth: 2, borderColor: Z.line, width: 82 },
  potPaint: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: Z.ink },
  potName: { color: Z.ink, fontWeight: '800', marginTop: 4, textTransform: 'capitalize' },
  found: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  dot: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: Z.line },
  garden: { width: '100%', height: 260, backgroundColor: '#fff', borderRadius: 28, borderWidth: 3, borderColor: Z.line, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 0 },
  potBox: { width: 120, height: 50, backgroundColor: '#C9733B', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  meter: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: '900', color: Z.ink },
});
