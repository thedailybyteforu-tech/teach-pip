import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Text as SvgText } from 'react-native-svg';
import { SUBJECTS } from '../content';
import { FADING, isUnlocked, retention } from '../engine/memory';
import { useStore } from '../state/store';
import { feel, say } from '../lib/voice';
import { C, R } from '../theme';
import { BigButton, IconButton, ProgressBar, T } from '../components/ui';

interface Node {
  id: string;
  title: string;
  emoji: string;
  color: string;
  x: number;
  y: number;
  r: number;
  taught: boolean;
  open: boolean;
}

/**
 * Pip's Brain: every concept the child has taught is a glowing neuron. Brightness is
 * Pip's memory of it — the spaced-repetition state made visible and touchable.
 */
export function Brain({ onBack, onConcept }: { onBack: () => void; onConcept: (id: string) => void }) {
  const { data } = useStore();
  const { width } = useWindowDimensions();
  const W = Math.max(260, Math.min(width - 32, 480));
  const H = W;
  const [sel, setSel] = useState<string | null>(null);

  const { nodes, clusters } = useMemo(() => {
    const cx = W / 2;
    const cy = H / 2;
    const nodes: Node[] = [];
    const clusters: { x: number; y: number; color: string; lit: boolean; emoji: string }[] = [];
    SUBJECTS.forEach((s, si) => {
      const a = -Math.PI / 2 + (si * 2 * Math.PI) / SUBJECTS.length;
      const ccx = cx + Math.cos(a) * W * 0.29;
      const ccy = cy + Math.sin(a) * H * 0.28;
      let lit = false;
      s.concepts.forEach((c, ci) => {
        // Spread a subject's concepts evenly in a ring around its hub, starting outward.
        const b = a + (ci * 2 * Math.PI) / s.concepts.length;
        const rr = W * 0.1;
        const m = data.memory[c.id];
        const taught = (m?.taught ?? 0) > 0;
        lit = lit || taught;
        nodes.push({
          id: c.id,
          title: c.title,
          emoji: c.emoji,
          color: s.color,
          x: ccx + Math.cos(b) * rr,
          y: ccy + Math.sin(b) * rr,
          r: W * 0.036,
          taught,
          open: isUnlocked(s, ci, data.memory),
        });
      });
      clusters.push({ x: ccx, y: ccy, color: s.color, lit, emoji: s.emoji });
    });
    return { nodes, clusters };
  }, [W, H, data.memory]);

  const learned = nodes.filter((n) => n.taught).length;

  useEffect(() => {
    say(
      learned === 0
        ? "This is my brain! It's empty and dark. Teach me something and watch it light up!"
        : `This is my brain! You taught me ${learned} ${learned === 1 ? 'thing' : 'things'}. Bright lights are things I remember. Dim lights are things I'm forgetting!`,
    );
  }, [learned]);

  const selected = nodes.find((n) => n.id === sel);
  const selR = selected ? retention(data.memory[selected.id]) : 0;

  const choose = (n: Node) => {
    feel.tap();
    setSel(n.id);
    if (!n.taught) say(n.open ? `${n.title}. You haven't taught me this yet!` : `${n.title} is still locked.`);
    else {
      const r = retention(data.memory[n.id]);
      say(
        r >= FADING
          ? `${n.title}! I remember it ${r > 0.8 ? 'really well' : 'pretty well'}.`
          : `${n.title}... it's getting fuzzy. Can you teach me again?`,
      );
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="⬅️" label="Back" onPress={onBack} />
        <Text style={T.h2}>Pip's Brain</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={[T.body, { textAlign: 'center', marginBottom: 6 }]}>
          {learned} of {nodes.length} brain lights glowing. Tap a light!
        </Text>
        <Svg width={W} height={H}>
          {/* brain outline */}
          <Path
            d={`M ${W * 0.5} ${H * 0.04}
                C ${W * 0.8} ${H * 0.0}, ${W * 1.0} ${H * 0.25}, ${W * 0.96} ${H * 0.5}
                C ${W * 1.0} ${H * 0.78}, ${W * 0.78} ${H * 0.99}, ${W * 0.5} ${H * 0.96}
                C ${W * 0.22} ${H * 0.99}, ${W * 0.0} ${H * 0.78}, ${W * 0.04} ${H * 0.5}
                C ${W * 0.0} ${H * 0.25}, ${W * 0.2} ${H * 0.0}, ${W * 0.5} ${H * 0.04} Z`}
            fill="rgba(255,140,200,0.07)"
            stroke="rgba(255,170,220,0.35)"
            strokeWidth={3}
            strokeDasharray="10 8"
          />
          {/* bridges between subjects light up once both have something taught */}
          {clusters.map((a, i) =>
            clusters.slice(i + 1).map((b, j) => (
              <Line
                key={`${i}-${j}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={a.lit && b.lit ? C.gold : 'rgba(255,255,255,0.06)'}
                strokeWidth={a.lit && b.lit ? 2 : 1}
                opacity={a.lit && b.lit ? 0.5 : 1}
              />
            )),
          )}
          {/* links inside each subject */}
          {nodes.map((n) => {
            const c = clusters[SUBJECTS.findIndex((s) => s.concepts.some((k) => k.id === n.id))];
            return (
              <Line
                key={`l-${n.id}`}
                x1={c.x}
                y1={c.y}
                x2={n.x}
                y2={n.y}
                stroke={n.taught ? n.color : 'rgba(255,255,255,0.12)'}
                strokeWidth={n.taught ? 3 : 1.5}
                opacity={n.taught ? 0.4 + 0.6 * retention(data.memory[n.id]) : 1}
              />
            );
          })}
          {clusters.map((c, i) => (
            <G key={`c-${i}`}>
              <Circle cx={c.x} cy={c.y} r={W * 0.05} fill={c.lit ? c.color : C.card} opacity={c.lit ? 0.9 : 0.6} />
              <SvgText x={c.x} y={c.y + W * 0.02} fontSize={W * 0.05} textAnchor="middle">
                {c.emoji}
              </SvgText>
            </G>
          ))}
          {nodes.map((n) => {
            const r = n.taught ? retention(data.memory[n.id]) : 0;
            return (
              <G key={n.id} onPress={() => choose(n)}>
                {n.taught && <Circle cx={n.x} cy={n.y} r={n.r * 2} fill={n.color} opacity={0.12 + 0.3 * r} />}
                <Circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r}
                  fill={n.taught ? n.color : 'rgba(255,255,255,0.05)'}
                  opacity={n.taught ? 0.3 + 0.7 * r : 1}
                  stroke={sel === n.id ? '#fff' : n.taught ? n.color : 'rgba(255,255,255,0.3)'}
                  strokeWidth={sel === n.id ? 4 : 2}
                  strokeDasharray={n.taught ? undefined : '4 4'}
                />
                {n.taught && r < FADING && (
                  <SvgText x={n.x + n.r} y={n.y - n.r} fontSize={W * 0.04} textAnchor="middle">
                    💤
                  </SvgText>
                )}
              </G>
            );
          })}
        </Svg>

        {selected ? (
          <View style={[styles.card, { borderColor: selected.color }]}>
            <Text style={[T.h2, { color: selected.color }]}>
              {selected.emoji} {selected.title}
            </Text>
            {selected.taught ? (
              <>
                <Text style={[T.body, { marginTop: 6 }]}>
                  {selR >= FADING ? 'Pip remembers this!' : 'Pip is forgetting this — re-teach it to make it bright again!'}
                </Text>
                <View style={{ marginVertical: 10 }}>
                  <ProgressBar value={selR} color={selected.color} />
                </View>
              </>
            ) : (
              <Text style={[T.body, { marginVertical: 8 }]}>
                {selected.open ? "Pip doesn't know this yet." : '🔒 Teach the one before it to unlock.'}
              </Text>
            )}
            {selected.open && (
              <BigButton
                label={selected.taught ? 'Teach again' : 'Teach this'}
                emoji="🍎"
                size="m"
                onPress={() => onConcept(selected.id)}
              />
            )}
          </View>
        ) : (
          <Text style={[T.small, { textAlign: 'center', marginTop: 8 }]}>
            Bright = Pip remembers · Dim 💤 = Pip is forgetting
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  body: { alignItems: 'center', padding: 16, paddingBottom: 40 },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: C.bg2,
    borderRadius: R.l,
    borderWidth: 2,
    padding: 16,
    marginTop: 12,
  },
});
