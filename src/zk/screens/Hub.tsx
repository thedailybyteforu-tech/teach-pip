import React, { useEffect, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { today, useStore } from '../../state/store';
import { feel } from '../../lib/voice';
import { pick } from '../../lib/random';
import { Pip } from '../../components/Pip';
import type { ActivityKind } from '../../types';
import { Buddy, type BuddyId } from '../characters';
import { todaysPath } from '../curriculum';
import { Sky, useTalk, Z } from '../ui';

export type HubPlace = 'path' | 'trace' | 'science' | 'stem' | 'playhouse' | 'kitchen' | 'songs' | 'calm';

const PLACES: { id: HubPlace; title: string; sub: string; host: BuddyId; color: string }[] = [
  { id: 'trace', title: 'ABC Tracing', sub: 'with Mona', host: 'mona', color: '#FFD9CF' },
  { id: 'science', title: 'Science Lab', sub: 'with Kiki', host: 'kiki', color: '#E4F5C9' },
  { id: 'stem', title: 'STEM Games', sub: 'with Bobble', host: 'bobble', color: '#D5F5E4' },
  { id: 'playhouse', title: 'Playhouse', sub: 'with Roarbow', host: 'roarbow', color: '#FFEFC8' },
  { id: 'kitchen', title: 'Kitchen', sub: 'with Peely', host: 'peely', color: '#FFF6C2' },
  { id: 'songs', title: 'Song Time', sub: 'with the Woogles', host: 'bloop', color: '#D6F1FF' },
];

const HELLOS = [
  "Hi friend! It's me, Zoomi! What shall we play today?",
  'Zoom zoom! I missed you! Pick a place to play!',
  'Hello, explorer! Your learning path is ready!',
];

export function Hub({ onGo, onGrownups }: { onGo: (p: HubPlace) => void; onGrownups: () => void }) {
  const { data } = useStore();
  const [talking, speak] = useTalk();
  const hello = useMemo(() => pick(HELLOS), []);
  const path = todaysPath(data, today());
  const done = data.zk.path.date === today() ? data.zk.path.done : [];
  const doneCount = path.filter((k: ActivityKind) => done.includes(k)).length;

  useEffect(() => speak(hello), [speak, hello]);

  const go = (p: HubPlace) => {
    feel.tap();
    onGo(p);
  };

  return (
    <Sky>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.top}>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} accessibilityLabel="ZoomikoKids" />
          <Pressable accessibilityRole="button" accessibilityLabel="Grown-ups" onPress={onGrownups} style={styles.lock} hitSlop={8}>
            <Text style={{ fontSize: 20 }}>🔒</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Buddy id="zoomi" size={150} talking={talking} onPress={() => speak(pick(['Zoom zoom!', 'Hee hee! Let’s play!', 'I love exploring with you!']))} />
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{hello}</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" onPress={() => go('path')} style={({ pressed }) => [styles.pathCard, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.pathTitle}>⭐ Today's Learning Path</Text>
          <View style={styles.stones}>
            {path.map((k, i) => (
              <View key={i} style={[styles.stone, done.includes(k) && styles.stoneDone]}>
                <Text style={{ fontSize: 20 }}>{done.includes(k) ? '✅' : i + 1}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.pathSub}>{doneCount === 4 ? 'All done today! Amazing!' : `${doneCount} of 4 done · tap to continue`}</Text>
        </Pressable>

        <View style={styles.grid}>
          {PLACES.map((p) => (
            <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={p.title} onPress={() => go(p.id)} style={({ pressed }) => [styles.tile, { backgroundColor: p.color }, pressed && { transform: [{ scale: 0.96 }] }]}>
              <Buddy id={p.host} size={78} still />
              <Text style={styles.tileTitle}>{p.title}</Text>
              <Text style={styles.tileSub}>{p.sub}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable accessibilityRole="button" onPress={() => go('calm')} accessibilityLabel="Playroom" style={({ pressed }) => [styles.calm, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Buddy id="snoozle" size={64} still />
          <View style={{ flex: 1 }}>
            <Text style={[styles.tileTitle, { color: Z.calmInk }]}>Playroom</Text>
            <Text style={[styles.tileSub, { color: Z.calmInk }]}>Quiet toys: marble run, music, busy board, garden, town</Text>
          </View>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={() => go('stem')} style={styles.pipRow}>
          <Pip size={46} />
          <Text style={styles.pipText}>Pip the space alien is waiting to learn from you!</Text>
        </Pressable>
      </ScrollView>
    </Sky>
  );
}

const styles = StyleSheet.create({
  body: { padding: 16, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 92, height: 92 },
  lock: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bubble: { flex: 1, backgroundColor: '#fff', borderRadius: 22, padding: 14 },
  bubbleText: { color: Z.ink, fontWeight: '800', fontSize: 17, lineHeight: 23 },
  pathCard: { backgroundColor: Z.sun, borderRadius: 28, padding: 16, borderBottomWidth: 6, borderBottomColor: Z.sunDark, gap: 10 },
  pathTitle: { color: Z.ink, fontSize: 22, fontWeight: '900' },
  pathSub: { color: Z.ink, fontWeight: '700' },
  stones: { flexDirection: 'row', gap: 10 },
  stone: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.75)', alignItems: 'center', justifyContent: 'center' },
  stoneDone: { backgroundColor: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47.5%', flexGrow: 1, borderRadius: 26, alignItems: 'center', paddingVertical: 12, borderWidth: 3, borderColor: '#fff' },
  tileTitle: { color: Z.ink, fontSize: 18, fontWeight: '900' },
  tileSub: { color: Z.sub, fontSize: 13, fontWeight: '700' },
  calm: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Z.calm, borderRadius: 26, padding: 10, borderWidth: 3, borderColor: '#fff' },
  pipRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#211852', borderRadius: 22, padding: 10 },
  pipText: { color: '#fff', fontWeight: '800', flex: 1 },
});
