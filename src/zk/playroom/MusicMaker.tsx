import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NOTES, play } from '../../lib/sfx';
import { Buddy, type BuddyId } from '../characters';
import { P } from './theme';

const STEPS = 8;
/** One soft colour per note row, high to low. */
const ROW_COLORS = ['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'];
const SINGERS: BuddyId[] = ['bloop', 'fuzzle', 'bobble', 'snoozle'];
const TEMPOS = [{ label: 'Slow', ms: 520 }, { label: 'Calm', ms: 400 }, { label: 'Bouncy', ms: 300 }];

/**
 * Music Maker: tap squares to switch notes on, and a gentle playhead loops through them.
 * The notes are a pentatonic scale, so any pattern sounds pleasant: there are no wrong notes.
 */
export function MusicMaker() {
  const [grid, setGrid] = useState<boolean[][]>(() =>
    NOTES.map((_, r) => Array.from({ length: STEPS }, (_, c) => (r === 5 && c % 4 === 0) || (r === 2 && c === 2) || (r === 1 && c === 6))),
  );
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [tempo, setTempo] = useState(1);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => {
        const n = (s + 1) % STEPS;
        gridRef.current.forEach((row, r) => {
          if (row[n]) play(NOTES[r], 0.55);
        });
        return n;
      });
    }, TEMPOS[tempo].ms);
    return () => clearInterval(t);
  }, [playing, tempo]);

  const toggle = (r: number, c: number) => {
    setGrid((g) => g.map((row, i) => (i === r ? row.map((v, j) => (j === c ? !v : v)) : row)));
    if (!grid[r][c]) play(NOTES[r], 0.5);
  };

  const singing = grid.some((row) => row[step]) && playing;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.band}>
        {SINGERS.map((id, i) => (
          <Buddy key={id} id={id} size={64} talking={singing && (step + i) % 2 === 0} still />
        ))}
      </View>
      <View style={styles.board}>
        {grid.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((on, c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityLabel={`note ${r + 1}, beat ${c + 1}${on ? ', on' : ''}`}
                onPress={() => toggle(r, c)}
                style={[
                  styles.cell,
                  { backgroundColor: on ? ROW_COLORS[r] : P.paper },
                  c === step && playing && styles.cellNow,
                  c % 4 === 0 && styles.cellBeat,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" onPress={() => setPlaying(!playing)} style={styles.tool}>
          <Text style={styles.toolText}>{playing ? '❚❚ Pause' : '▶ Play'}</Text>
        </Pressable>
        {TEMPOS.map((t, i) => (
          <Pressable key={t.label} accessibilityRole="button" onPress={() => setTempo(i)} style={[styles.tool, tempo === i && styles.toolOn]}>
            <Text style={[styles.toolText, tempo === i && { color: '#fff' }]}>{t.label}</Text>
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={() => setGrid(NOTES.map(() => Array(STEPS).fill(false)))} style={styles.tool}>
          <Text style={styles.toolText}>Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingVertical: 4 },
  board: { flex: 1, marginHorizontal: 14, backgroundColor: P.sky, borderRadius: 20, padding: 10, gap: 6, justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 6, flex: 1, maxHeight: 64 },
  cell: { flex: 1, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
  cellBeat: { borderColor: 'rgba(92,82,70,0.12)' },
  cellNow: { borderColor: P.woodDark, transform: [{ scale: 1.04 }] },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolOn: { backgroundColor: P.ink },
  toolText: { color: P.ink, fontWeight: '700' },
});
