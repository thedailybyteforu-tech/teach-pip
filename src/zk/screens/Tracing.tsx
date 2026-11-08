import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { BigButton, Confetti } from '../../components/ui';
import { ALPHABET, checkpoints, LETTERS, LETTER_WORDS, toPath, type Pt } from '../letters';
import { Chip, Host, Sky, useTalk, Z, ZHeader } from '../ui';

const TOLERANCE = { little: 17, middle: 13, big: 10 } as const;
const COLORS = ['#FF7A6B', '#2EC4B6', '#9B5DE5', '#FF9F1C'];

/** Alphabet tracing with Mona: follow each stroke in order with a finger. */
export function Tracing({ onBack, start }: { onBack: () => void; start?: string }) {
  const { data, markDone } = useStore();
  const { width, height } = useWindowDimensions();
  const S = Math.max(220, Math.min(width - 40, height * 0.46, 380));
  const [letter, setLetter] = useState(start ?? ALPHABET.find((l) => !data.zk.traced[l]) ?? 'A');
  const strokes = LETTERS[letter];
  const cps = useMemo(() => strokes.map((s) => checkpoints(s)), [strokes]);
  const [stroke, setStroke] = useState(0);
  const [cp, setCp] = useState(0);
  const [ink, setInk] = useState<Pt[][]>([]);
  const [done, setDone] = useState(false);
  const [talking, speak] = useTalk();
  const [line, setLine] = useState('');
  const origin = useRef({ x: 0, y: 0 });
  const box = useRef<React.ComponentRef<typeof View>>(null);
  const state = useRef({ stroke: 0, cp: 0, done: false });
  state.current = { stroke, cp, done };
  const tol = TOLERANCE[data.zk.age];

  const talk = (l: string) => {
    setLine(l);
    speak(l);
  };

  useEffect(() => {
    setStroke(0);
    setCp(0);
    setInk([]);
    setDone(false);
    const [word] = LETTER_WORDS[letter];
    talk(`Let's trace ${letter}! ${letter} is for ${word}. Start at the green dot and follow the line.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter]);

  const toBox = (px: number, py: number): Pt => [((px - origin.current.x) / S) * 100, ((py - origin.current.y) / S) * 100];

  const advance = (p: Pt) => {
    const st = state.current;
    if (st.done) return;
    const pts = cps[st.stroke];
    let next = st.cp;
    // Allow skipping a couple of checkpoints so fast fingers aren't punished.
    for (let k = st.cp; k < Math.min(pts.length, st.cp + 4); k++) {
      if (Math.hypot(pts[k][0] - p[0], pts[k][1] - p[1]) < tol) next = k + 1;
    }
    if (next === st.cp) return;
    if (next >= pts.length) {
      feel.good();
      if (st.stroke + 1 < cps.length) {
        state.current = { stroke: st.stroke + 1, cp: 0, done: false };
        setStroke(st.stroke + 1);
        setCp(0);
        talk(['Great line!', 'Super!', 'Now the next line!'][st.stroke % 3]);
      } else {
        state.current = { ...st, cp: next, done: true };
        setCp(next);
        setDone(true);
        const [word] = LETTER_WORDS[letter];
        markDone('trace', (zk) => ({ ...zk, traced: { ...zk.traced, [letter]: (zk.traced[letter] ?? 0) + 1 } }));
        talk(`Picture pose! You traced ${letter}! ${letter} is for ${word}!`);
      }
    } else {
      state.current = { ...st, cp: next };
      setCp(next);
    }
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const { pageX, pageY } = e.nativeEvent;
          box.current?.measureInWindow((x, y) => {
            origin.current = { x, y };
            const p = toBox(pageX, pageY);
            setInk((k) => [...k, [p]]);
            advance(p);
          });
        },
        onPanResponderMove: (e) => {
          const p = toBox(e.nativeEvent.pageX, e.nativeEvent.pageY);
          setInk((k) => (k.length ? [...k.slice(0, -1), [...k[k.length - 1], p]] : [[p]]));
          advance(p);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cps, S, tol, letter],
  );

  const sc = S / 100;
  const guideW = 15 * sc;
  const startPt = !done ? cps[stroke][cp] ?? cps[stroke][0] : null;

  return (
    <Sky grass={false}>
      <ZHeader title="ABC Tracing" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body} scrollEnabled={false}>
        <Host id="mona" line={line} talking={talking} size={84} />
        <View ref={box} {...responder.panHandlers} style={[styles.pad, { width: S, height: S }]}>
          <Svg width={S} height={S}>
            <Path d={`M0 ${50 * sc} H${S}`} stroke="#E3E8F2" strokeWidth={2} strokeDasharray="8 8" />
            {strokes.map((st, i) => (
              <Path key={`g${i}`} d={toPath(st, sc)} stroke="#E6EAF3" strokeWidth={guideW} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            ))}
            {strokes.map((st, i) => (
              <Path key={`d${i}`} d={toPath(st, sc)} stroke="#B9C3D6" strokeWidth={2.5} strokeDasharray="6 7" fill="none" />
            ))}
            {cps.map((pts, i) => {
              const upto = i < stroke || done ? pts.length : i === stroke ? cp : 0;
              if (upto < 2) return null;
              return (
                <Path
                  key={`c${i}`}
                  d={toPath(pts.slice(0, upto), sc)}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={guideW * 0.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              );
            })}
            {ink.map((pts, i) => (pts.length > 1 ? <Path key={`i${i}`} d={toPath(pts, sc)} stroke="#2B2350" strokeOpacity={0.25} strokeWidth={4} fill="none" strokeLinecap="round" /> : null))}
            {!done &&
              strokes.map((st, i) =>
                i >= stroke ? (
                  <G key={`n${i}`}>
                    <Circle cx={st[0][0] * sc} cy={st[0][1] * sc} r={i === stroke ? 13 : 10} fill={i === stroke ? '#22C55E' : '#C9D2E3'} />
                    <SvgText x={st[0][0] * sc} y={st[0][1] * sc + 5} fontSize={14} fontWeight="900" fill="#fff" textAnchor="middle">
                      {String(i + 1)}
                    </SvgText>
                  </G>
                ) : null,
              )}
            {startPt && cp > 0 && <Circle cx={startPt[0] * sc} cy={startPt[1] * sc} r={9} fill="#22C55E" opacity={0.85} />}
          </Svg>
        </View>

        {done ? (
          <View style={styles.doneRow}>
            <Text style={{ fontSize: 46 }}>{LETTER_WORDS[letter][1]}</Text>
            <BigButton label="Again" emoji="🔁" size="m" color="#fff" shade={Z.line} onPress={resetSame} style={{ flex: 1 }} />
            <BigButton
              label="Next letter"
              emoji="➡️"
              size="m"
              onPress={() => setLetter(ALPHABET[(ALPHABET.indexOf(letter) + 1) % ALPHABET.length])}
              style={{ flex: 1.4 }}
            />
          </View>
        ) : (
          <Text style={styles.hint}>Follow the line with your finger, starting at the green dot.</Text>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.letters}>
          {ALPHABET.map((l) => (
            <Chip key={l} label={data.zk.traced[l] ? `${l}⭐` : l} on={l === letter} onPress={() => setLetter(l)} color="#E4572E" />
          ))}
        </ScrollView>
      </ScrollView>
      {done && <Confetti count={18} />}
    </Sky>
  );

  function resetSame() {
    setStroke(0);
    setCp(0);
    setInk([]);
    setDone(false);
    state.current = { stroke: 0, cp: 0, done: false };
    talk(`Let's trace ${letter} again!`);
  }
}

const styles = StyleSheet.create({
  body: { padding: 16, alignItems: 'center', gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center' },
  pad: { backgroundColor: '#fff', borderRadius: 28, borderWidth: 3, borderColor: Z.line, overflow: 'hidden' },
  hint: { color: Z.sub, fontWeight: '700', textAlign: 'center' },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
  letters: { gap: 8, paddingVertical: 4 },
});
