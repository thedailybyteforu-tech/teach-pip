import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Split, Tag } from '../Split';
import { useStore } from '../store';
import { C, shuffle, SIDE, type Side } from '../theme';

const QUESTIONS: { q: string; a: string[] }[] = [
  { q: 'How was your day?', a: ['😀', '🙂', '😴', '😢'] },
  { q: 'Which animal would you be today?', a: ['🦁', '🐬', '🦅', '🐢'] },
  { q: 'What shall we do together next?', a: ['📚', '⚽', '🎨', '🍪'] },
  { q: 'What is the best weather?', a: ['☀️', '🌧️', '❄️', '🌈'] },
  { q: 'Which snack wins?', a: ['🍎', '🍌', '🧀', '🍓'] },
  { q: 'Where would you fly a rocket?', a: ['🌙', '🪐', '⭐', '🌍'] },
  { q: 'How do you feel right now?', a: ['🤩', '😌', '🥱', '😤'] },
  { q: 'What made you smile today?', a: ['🧸', '👫', '🐶', '🎵'] },
  { q: 'Which would you ride?', a: ['🚲', '🚂', '🐘', '🛶'] },
  { q: 'What is the coziest thing?', a: ['🛏️', '🤗', '🧦', '🔥'] },
  { q: 'What should we cook?', a: ['🍕', '🥞', '🍜', '🥗'] },
  { q: 'Which superpower?', a: ['🦸', '🫥', '🐟', '⚡'] },
];

/**
 * Talk Time: both answer the same little question in secret, then the answers are shown side
 * by side. The point is the chat afterwards: "Tell each other why."
 */
export function Talk({ onExit }: { onExit: () => void }) {
  const { bump } = useStore();
  const [order] = useState(() => shuffle(QUESTIONS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<{ kid?: string; grown?: string }>({});
  const item = order[i % order.length];
  const both = !!picked.kid && !!picked.grown;

  const choose = (side: Side, a: string) => {
    if (picked[side]) return;
    const next = { ...picked, [side]: a };
    setPicked(next);
    if (next.kid && next.grown) bump('talks');
  };

  const half = (side: Side) => {
    const other: Side = side === 'kid' ? 'grown' : 'kid';
    return (
      <View style={styles.center}>
        <Tag side={side} />
        <Text style={styles.q}>{item.q}</Text>
        {both ? (
          <>
            <View style={styles.reveal}>
              <View style={styles.answer}>
                <Text style={styles.face}>{picked[side]}</Text>
                <Text style={styles.small}>You</Text>
              </View>
              <View style={styles.answer}>
                <Text style={styles.face}>{picked[other]}</Text>
                <Text style={styles.small}>{SIDE[other].name}</Text>
              </View>
            </View>
            <Text style={styles.why}>{picked.kid === picked.grown ? 'The same! 🎉 Tell each other why.' : 'Tell each other why!'}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setPicked({});
                setI(i + 1);
              }}
              style={styles.next}
            >
              <Text style={styles.nextText}>Next question ▶</Text>
            </Pressable>
          </>
        ) : picked[side] ? (
          <Text style={styles.why}>✅ Picked! Keep it secret... 🤫</Text>
        ) : (
          <View style={styles.row}>
            {item.a.map((a) => (
              <Pressable key={a} accessibilityRole="button" accessibilityLabel={`${side} picks ${a}`} onPress={() => choose(side, a)} style={styles.opt}>
                <Text style={styles.face}>{a}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return <Split title="Talk Time" onExit={onExit} grown={half('grown')} kid={half('kid')} />;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  q: { color: C.ink, fontSize: 22, fontWeight: '900', textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  opt: { width: 66, height: 66, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  face: { fontSize: 36 },
  reveal: { flexDirection: 'row', gap: 16 },
  answer: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  small: { color: C.sub, fontWeight: '700', fontSize: 12 },
  why: { color: C.ink, fontWeight: '800', fontSize: 16, textAlign: 'center' },
  next: { backgroundColor: C.sun, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 4, borderBottomColor: C.sunDark },
  nextText: { color: C.ink, fontWeight: '900', fontSize: 16 },
});
