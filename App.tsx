import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Creature } from './src/Creature';
import { StoreProvider, useStore } from './src/store';
import { C, pick } from './src/theme';
import { Describe } from './src/games/Describe';
import { Launch } from './src/games/Launch';
import { Draw } from './src/games/Draw';
import { Talk } from './src/games/Talk';

type Route = 'home' | 'describe' | 'launch' | 'draw' | 'talk';

const GAMES: { id: Exclude<Route, 'home'>; emoji: string; title: string; sub: string; color: string }[] = [
  { id: 'describe', emoji: '🗣️', title: 'Describe It', sub: 'One describes, one finds. Then swap!', color: '#FFE3D9' },
  { id: 'launch', emoji: '🚀', title: 'Launch Together', sub: 'Both hold on... 3, 2, 1!', color: '#FFF0C2' },
  { id: 'draw', emoji: '🖍️', title: 'Draw Together', sub: 'One page, two artists', color: '#D6F1EF' },
  { id: 'talk', emoji: '💬', title: 'Talk Time', sub: 'Pick in secret, then tell why', color: '#E8E0FA' },
];

/** Ideas for carrying the game on after the phone is put away. */
const POCKET = [
  'Play Describe It with real toys: hide one behind your back and describe it.',
  'Count down 3, 2, 1 and jump off the sofa cushion together.',
  'Draw one picture on real paper, taking turns to add one line.',
  'At dinner, everyone answers: what made you smile today?',
  'Play "I spy" using only colors and shapes.',
];

function Home({ go }: { go: (r: Route) => void }) {
  const { data } = useStore();
  const [why, setWhy] = useState(false);
  const [idea] = useState(() => pick(POCKET));
  const moments = data.describe + data.launches + data.drawings + data.talks;
  return (
    <ScrollView contentContainerStyle={styles.home}>
      <Text style={styles.logo}>
        Nose <Text style={{ color: C.kid }}>to</Text> Nose
      </Text>
      <Text style={styles.tagline}>Games for one kid and one grown-up, together.</Text>

      <View style={styles.how}>
        <View style={{ transform: [{ rotate: '180deg' }] }}>
          <Creature c={{ color: 1, shape: 'tall', eyes: 2, hat: 'none', spots: false }} size={64} />
        </View>
        <View style={styles.phone}>
          <View style={[styles.phoneHalf, { backgroundColor: C.grown }]} />
          <View style={[styles.phoneHalf, { backgroundColor: C.kid }]} />
        </View>
        <Creature c={{ color: 0, shape: 'round', eyes: 2, hat: 'party', spots: true }} size={64} />
        <Text style={styles.howText}>Lay the phone flat between you and sit face to face. Each of you gets half the screen.</Text>
      </View>

      {GAMES.map((g) => (
        <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={g.title} onPress={() => go(g.id)} style={({ pressed }) => [styles.card, { backgroundColor: g.color }, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Text style={styles.cardEmoji}>{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{g.title}</Text>
            <Text style={styles.cardSub}>{g.sub}</Text>
          </View>
          <Text style={styles.go}>▶</Text>
        </Pressable>
      ))}

      <View style={styles.stat}>
        <Text style={styles.statBig}>{data.days.length}</Text>
        <Text style={styles.statText}>
          {data.days.length === 1 ? 'day' : 'days'} played together · {moments} shared {moments === 1 ? 'moment' : 'moments'}
        </Text>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>🎒 Pocket idea (no phone needed)</Text>
        <Text style={styles.noteText}>{idea}</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={() => setWhy(!why)} style={styles.note}>
        <Text style={styles.noteTitle}>For grown-ups {why ? '▾' : '▸'}</Text>
        {why && (
          <Text style={styles.noteText}>
            Most kids' apps are built for a child alone. This one cannot be played alone: every game needs both of you, talking.
            {'\n\n'}• Describe It is a "barrier game", a classic way to grow describing and listening skills.
            {'\n'}• Launch Together practises waiting, eye contact and doing something at the same moment.
            {'\n'}• Draw Together and Talk Time are just reasons to chat.
            {'\n\n'}There are no scores against each other, no ads, no purchases and no accounts. Nothing leaves this device. A few minutes is plenty.
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

function Main() {
  const [route, setRoute] = useState<Route>('home');
  const home = () => setRoute('home');
  if (route === 'describe') return <Describe onExit={home} />;
  if (route === 'launch') return <Launch onExit={home} />;
  if (route === 'draw') return <Draw onExit={home} />;
  if (route === 'talk') return <Talk onExit={home} />;
  return <Home go={setRoute} />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: C.paper }}>
          <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
            <Main />
          </SafeAreaView>
          <StatusBar style="dark" />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  home: { padding: 18, gap: 12, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  logo: { fontSize: 40, fontWeight: '900', color: C.ink, textAlign: 'center', marginTop: 8 },
  tagline: { color: C.sub, fontWeight: '700', textAlign: 'center', fontSize: 15 },
  how: { backgroundColor: C.card, borderRadius: 26, padding: 14, alignItems: 'center', gap: 4, borderWidth: 2, borderColor: C.line },
  phone: { width: 54, height: 92, borderRadius: 12, borderWidth: 4, borderColor: C.ink, overflow: 'hidden' },
  phoneHalf: { flex: 1 },
  howText: { color: C.ink, fontWeight: '700', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 24, padding: 16 },
  cardEmoji: { fontSize: 38 },
  cardTitle: { color: C.ink, fontSize: 20, fontWeight: '900' },
  cardSub: { color: C.sub, fontWeight: '700', fontSize: 13 },
  go: { color: C.ink, fontSize: 20 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.ink, borderRadius: 24, padding: 16 },
  statBig: { color: C.sun, fontSize: 40, fontWeight: '900' },
  statText: { color: '#fff', fontWeight: '700', flex: 1, lineHeight: 20 },
  note: { backgroundColor: C.card, borderRadius: 22, padding: 14, borderWidth: 2, borderColor: C.line, gap: 4 },
  noteTitle: { color: C.ink, fontWeight: '900', fontSize: 15 },
  noteText: { color: C.sub, fontWeight: '600', lineHeight: 20 },
});
