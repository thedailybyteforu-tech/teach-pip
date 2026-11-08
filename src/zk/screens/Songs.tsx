import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { feel, hush, say } from '../../lib/voice';
import { randInt } from '../../lib/random';
import { BigButton, Confetti } from '../../components/ui';
import { ND } from '../../theme';
import { Buddy, CAST, type BuddyId } from '../characters';
import { Chip, Sky, Z, ZHeader, zt } from '../ui';

const WOOGLES: { id: BuddyId; sound: string }[] = [
  { id: 'bloop', sound: 'Bloop!' },
  { id: 'fuzzle', sound: 'Blehh!' },
  { id: 'bobble', sound: 'La la la!' },
  { id: 'snoozle', sound: 'Ahhh, hummm.' },
];

/** An original sing-along: each verse belongs to one Woogle, and everyone copies its sound. */
const SONG: { who: number | 'all'; text: string }[] = [
  { who: 'all', text: 'Woogle, woogle, sing with me! Make the sounds, one, two, three!' },
  { who: 0, text: 'Bloop is round and sky-blue too. Bloop says BLOOP! Now you do!' },
  { who: 1, text: 'Fuzzle is fluffy, Fuzzle is silly. Tongue out, BLEHH! Wiggly, wiggly!' },
  { who: 2, text: 'Bobble juggles pom-poms high. La la la, up to the sky!' },
  { who: 'all', text: 'Woogle, woogle, sing with me! Make the sounds, one, two, three!' },
  { who: 3, text: 'Snoozle is sleepy, eyes so low. A big yawn: Ahhh, hummm. Night night, slow.' },
];

export function Songs({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'sing' | 'copy'>('sing');
  return (
    <Sky>
      <ZHeader title="Song Time" onBack={onBack} />
      <View style={styles.tabs}>
        <Chip label="🎤 Sing along" on={mode === 'sing'} onPress={() => setMode('sing')} color="#4FC3F7" />
        <Chip label="👂 Copy me!" on={mode === 'copy'} onPress={() => setMode('copy')} color="#FF8A65" />
      </View>
      {mode === 'sing' ? <SingAlong /> : <CopyMe />}
    </Sky>
  );
}

function useBounces() {
  const vals = useRef(WOOGLES.map(() => new Animated.Value(1))).current;
  const bounce = (i: number) => {
    vals[i].setValue(1.25);
    Animated.spring(vals[i], { toValue: 1, friction: 3, useNativeDriver: ND }).start();
  };
  return { vals, bounce };
}

function Band({ active, onTap, vals }: { active: number[]; onTap?: (i: number) => void; vals: Animated.Value[] }) {
  return (
    <View style={styles.band}>
      {WOOGLES.map((w, i) => (
        <Animated.View key={w.id} style={{ transform: [{ scale: vals[i] }], alignItems: 'center' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={CAST[w.id].name} onPress={onTap ? () => onTap(i) : undefined} disabled={!onTap}>
            <Buddy id={w.id} size={74} talking={active.includes(i)} still />
          </Pressable>
          <Text style={styles.name}>{CAST[w.id].name}</Text>
        </Animated.View>
      ))}
    </View>
  );
}

function SingAlong() {
  const { markDone } = useStore();
  const [line, setLine] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { vals, bounce } = useBounces();

  const stop = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    hush();
    setLine(-1);
  };
  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    stop();
    let at = 300;
    SONG.forEach((l, i) => {
      timers.current.push(
        setTimeout(() => {
          setLine(i);
          say(l.text, l.who === 'all' ? 'bobble' : WOOGLES[l.who].id);
          if (l.who === 'all') WOOGLES.forEach((_, k) => bounce(k));
          else bounce(l.who);
        }, at),
      );
      at += 900 + l.text.length * 75;
    });
    timers.current.push(
      setTimeout(() => {
        setLine(-1);
        markDone('song');
      }, at),
    );
  };

  const cur = SONG[line];
  const active = !cur ? [] : cur.who === 'all' ? [0, 1, 2, 3] : [cur.who];

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Band active={active} vals={vals} />
      <View style={[zt.card, { width: '100%' }]}>
        <Text style={zt.h2}>🎵 The Woogles Sound Song</Text>
        {SONG.map((l, i) => (
          <Text key={i} style={[styles.lyric, i === line && styles.lyricOn]}>
            {l.text}
          </Text>
        ))}
      </View>
      {line < 0 ? (
        <BigButton label="Sing!" emoji="▶️" onPress={play} style={{ width: '100%' }} />
      ) : (
        <BigButton label="Stop" emoji="⏹️" color="#fff" shade={Z.line} onPress={stop} style={{ width: '100%' }} />
      )}
      <Text style={[zt.body, { textAlign: 'center' }]}>Make each Woogle's sound with them!</Text>
    </ScrollView>
  );
}

type Phase = 'ready' | 'listen' | 'turn' | 'won' | 'oops';

function CopyMe() {
  const { data, markDone } = useStore();
  const startLen = data.zk.age === 'little' ? 2 : 3;
  const [len, setLen] = useState(startLen);
  const [seq, setSeq] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [phase, setPhase] = useState<Phase>('ready');
  const [active, setActive] = useState<number[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { vals, bounce } = useBounces();

  useEffect(() => {
    say('Listen to the Woogles, then copy them! Tap each Woogle in the same order.', 'bobble');
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const playSeq = (s: number[]) => {
    timers.current.forEach(clearTimeout);
    setPhase('listen');
    s.forEach((w, i) => {
      timers.current.push(
        setTimeout(() => {
          setActive([w]);
          bounce(w);
          say(WOOGLES[w].sound, WOOGLES[w].id);
        }, 600 + i * 1100),
      );
      timers.current.push(setTimeout(() => setActive([]), 600 + i * 1100 + 700));
    });
    timers.current.push(
      setTimeout(() => {
        setPhase('turn');
        say('Your turn!', 'bobble');
      }, 600 + s.length * 1100),
    );
  };

  const start = (l = len) => {
    const s = Array.from({ length: l }, () => randInt(0, 3));
    setSeq(s);
    setPos(0);
    playSeq(s);
  };

  const tap = (i: number) => {
    if (phase !== 'turn') return;
    bounce(i);
    say(WOOGLES[i].sound, WOOGLES[i].id);
    if (i !== seq[pos]) {
      feel.oops();
      setPhase('oops');
      setLen(Math.max(2, len - 1));
      timers.current.push(setTimeout(() => say("Oops! That's okay. Let's listen again!", 'bobble'), 800));
      return;
    }
    feel.tap();
    if (pos + 1 === seq.length) {
      feel.good();
      setPhase('won');
      setLen(len + 1);
      markDone('song', (zk) => ({ ...zk, songBest: Math.max(zk.songBest, seq.length) }));
      timers.current.push(setTimeout(() => say(`You copied ${seq.length} sounds! The Woogles are so proud!`, 'bobble'), 700));
    } else setPos(pos + 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Band active={active} vals={vals} onTap={tap} />
      <View style={[zt.card, { width: '100%', alignItems: 'center' }]}>
        <Text style={zt.h2}>
          {phase === 'listen' ? '👂 Listen...' : phase === 'turn' ? `👆 Your turn! ${pos}/${seq.length}` : phase === 'won' ? '🎉 Yes!' : phase === 'oops' ? '🙈 Oops!' : 'Copy the Woogles'}
        </Text>
        <Text style={zt.body}>Sounds to copy: {len} · Best: {data.zk.songBest}</Text>
      </View>
      {(phase === 'ready' || phase === 'won' || phase === 'oops') && (
        <BigButton label={phase === 'ready' ? 'Start' : phase === 'won' ? 'Next round' : 'Try again'} emoji="▶️" onPress={() => start()} style={{ width: '100%' }} />
      )}
      {phase === 'won' && <Confetti count={14} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 10, justifyContent: 'center', paddingVertical: 6 },
  body: { padding: 16, gap: 14, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  band: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 0, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 28, padding: 8, width: '100%' },
  name: { color: Z.ink, fontWeight: '800', fontSize: 13 },
  lyric: { color: Z.sub, fontSize: 16, lineHeight: 23, marginTop: 6 },
  lyricOn: { color: Z.ink, fontWeight: '900', backgroundColor: '#FFF3B0', borderRadius: 8 },
});
