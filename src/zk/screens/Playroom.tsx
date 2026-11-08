import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../../state/store';
import { hush } from '../../lib/voice';
import { Buddy, type BuddyId } from '../characters';
import { P } from '../playroom/theme';
import { MarbleRun } from '../playroom/MarbleRun';
import { MusicMaker } from '../playroom/MusicMaker';
import { BusyBoard } from '../playroom/BusyBoard';
import { Garden } from '../playroom/Garden';
import { Town } from '../playroom/Town';
import { Draw, Shapes } from './Calm';
import { BlockBuilder } from '../playroom/BlockBuilder';
import { WeatherWindow } from '../playroom/WeatherWindow';
import { ShapeSorter } from '../playroom/ShapeSorter';
import { BeadNecklace } from '../playroom/BeadNecklace';
import { NightSky } from '../playroom/NightSky';
import { SandTray } from '../playroom/SandTray';
import { TOYS, type Toy } from '../playroom/toys';
import { setSfxEnabled } from '../../lib/sfx';

/**
 * Snoozle's Playroom: a Montessori-inspired, low-stimulation space of open-ended toys.
 * Soft natural colours, slow animations, quiet sounds, no voice-over, no rewards, no timers,
 * no levels and no winning or losing.
 */
export function Playroom({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [toy, setToy] = useState<Toy | null>(null);
  const counted = useRef(false);
  useEffect(() => hush(), []);

  const [quiet, setQuiet] = useState(false);
  const open = (t: Toy) => {
    setToy(t);
    // Counted once per time a toy is opened, for the grown-ups' summary (never shown to the child).
    markDone('calm', (zk) => ({ ...zk, toys: { ...zk.toys, [t]: (zk.toys[t] ?? 0) + 1 } }));
    counted.current = true;
  };
  const surprise = () => open(TOYS[Math.floor(Math.random() * TOYS.length)].id);
  const mute = () => {
    setQuiet(!quiet);
    setSfxEnabled(quiet);
  };

  const current = TOYS.find((t) => t.id === toy);

  return (
    <View style={styles.room}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={toy ? () => setToy(null) : onBack} style={styles.back} hitSlop={10}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>{current ? current.title : 'Playroom'}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={quiet ? 'Sounds off' : 'Sounds on'} onPress={mute} style={styles.mute} hitSlop={8}>
          <Text style={{ fontSize: 20 }}>{quiet ? '🔇' : '🔈'}</Text>
        </Pressable>
      </View>
      {toy === null && (
        <ScrollView contentContainerStyle={styles.grid}>
          <Text style={styles.intro}>Quiet toys. No rules, no scores. Play however you like.</Text>
          <Pressable accessibilityRole="button" onPress={surprise} style={styles.surprise}>
            <Text style={styles.surpriseText}>🎁 Surprise me</Text>
          </Pressable>
          {TOYS.map((t) => (
            <Pressable
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={t.title}
              onPress={() => open(t.id)}
              style={({ pressed }) => [styles.tile, { backgroundColor: t.tint }, pressed && { opacity: 0.85 }]}
            >
              <Buddy id={t.host} size={70} still />
              <Text style={styles.tileText}>{t.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
      {toy === 'marble' && <MarbleRun />}
      {toy === 'music' && <MusicMaker />}
      {toy === 'busy' && <BusyBoard />}
      {toy === 'garden' && <Garden />}
      {toy === 'town' && <Town />}
      {toy === 'draw' && <Draw onTouch={() => {}} />}
      {toy === 'shapes' && <Shapes onTouch={() => {}} />}
      {toy === 'blocks' && <BlockBuilder />}
      {toy === 'weather' && <WeatherWindow />}
      {toy === 'sorter' && <ShapeSorter />}
      {toy === 'beads' && <BeadNecklace />}
      {toy === 'sky' && <NightSky />}
      {toy === 'sand' && <SandTray />}
    </View>
  );
}

const styles = StyleSheet.create({
  room: { flex: 1, backgroundColor: P.room },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: P.paper, alignItems: 'center', justifyContent: 'center' },
  backText: { color: P.ink, fontSize: 22, fontWeight: '700' },
  title: { color: P.ink, fontSize: 20, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 14, paddingBottom: 30, maxWidth: 560, alignSelf: 'center', width: '100%' },
  intro: { width: '100%', color: P.ink, opacity: 0.7, textAlign: 'center', marginBottom: 4 },
  mute: { width: 44, height: 44, borderRadius: 22, backgroundColor: P.paper, alignItems: 'center', justifyContent: 'center' },
  surprise: { width: '100%', alignItems: 'center', paddingVertical: 12, borderRadius: 18, backgroundColor: P.butter },
  surpriseText: { color: P.ink, fontWeight: '800', fontSize: 16 },
  tile: { width: '47%', flexGrow: 1, borderRadius: 22, alignItems: 'center', paddingVertical: 14, gap: 4 },
  tileText: { color: P.ink, fontWeight: '700', fontSize: 16 },
});
