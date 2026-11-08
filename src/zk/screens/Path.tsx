import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { today, useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { Pip } from '../../components/Pip';
import { Confetti } from '../../components/ui';
import type { ActivityKind } from '../../types';
import { Buddy } from '../characters';
import { ACTIVITIES, todaysPath } from '../curriculum';
import { Host, Sky, useTalk, Z, ZHeader } from '../ui';

/** Today's learning path: four stepping stones across learning areas. */
export function Path({ onBack, onOpen }: { onBack: () => void; onOpen: (k: ActivityKind) => void }) {
  const { data } = useStore();
  const path = todaysPath(data, today());
  const done = data.zk.path.date === today() ? data.zk.path.done : [];
  const all = path.every((k) => done.includes(k));
  const [talking, speak] = useTalk();
  const next = path.find((k) => !done.includes(k));
  const line = all
    ? 'You finished the whole path today! You are a super learner! Zoom zoom!'
    : next
      ? `Let's walk the path together! Next stop: ${ACTIVITIES[next].title}!`
      : '';

  useEffect(() => speak(line), [speak, line]);

  return (
    <Sky>
      <ZHeader title="Learning Path" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.body}>
        <Host id="zoomi" line={line} talking={talking} size={90} />
        {path.map((k, i) => {
          const a = ACTIVITIES[k];
          const isDone = done.includes(k);
          const isNext = k === next;
          return (
            <View key={`${k}${i}`} style={[styles.stopRow, { alignSelf: i % 2 ? 'flex-end' : 'flex-start' }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={a.title}
                onPress={() => {
                  feel.tap();
                  onOpen(k);
                }}
                style={({ pressed }) => [styles.stop, { borderColor: a.color }, isNext && styles.next, pressed && { transform: [{ scale: 0.96 }] }]}
              >
                {a.host === 'pip' ? <Pip size={64} /> : <Buddy id={a.host} size={70} still />}
                <View style={{ flex: 1 }}>
                  <Text style={styles.area}>{a.area}</Text>
                  <Text style={styles.title}>
                    {a.emoji} {a.title}
                  </Text>
                </View>
                <Text style={{ fontSize: 26 }}>{isDone ? '✅' : isNext ? '▶️' : '⭕'}</Text>
              </Pressable>
            </View>
          );
        })}
        <Text style={styles.note}>A new path every day. Every area of learning comes round.</Text>
      </ScrollView>
      {all && <Confetti />}
    </Sky>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  stopRow: { width: '88%' },
  stop: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 28, borderWidth: 4, padding: 8, paddingRight: 14 },
  next: { borderWidth: 6, transform: [{ scale: 1.03 }] },
  area: { color: Z.sub, fontWeight: '800', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { color: Z.ink, fontWeight: '900', fontSize: 18 },
  note: { color: Z.sub, textAlign: 'center', fontWeight: '700' },
});
