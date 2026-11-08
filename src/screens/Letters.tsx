import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { DayLog } from '../types';
import { getConcept } from '../content';
import { stageFor } from '../engine/memory';
import { today, useStore } from '../state/store';
import { feel, say } from '../lib/voice';
import { C, R } from '../theme';
import { Pip } from '../components/Pip';
import { IconButton, T } from '../components/ui';

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

function listWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

/** Pip's letter home to its alien family, written from what really happened that day. */
export function composeLetter(day: DayLog | undefined, avatar: string): string[] {
  const lines = ['Dear Mama and Papa Blorp,'];
  if (!day || (day.concepts.length === 0 && day.missions.length === 0)) {
    lines.push("My teacher and I didn't have a lesson yet today. I'm waiting by the window of my spaceship!");
  } else {
    const titles = day.concepts.map((id) => getConcept(id)?.title).filter((t): t is string => !!t);
    if (titles.length) lines.push(`Today my teacher ${avatar} taught me ${listWords(titles.map(lowerFirst))}!`);
    if (day.shown > 0) lines.push('My teacher showed me HOW to count: you touch each one and say the next number.');
    for (const f of day.fixed.slice(-2)) {
      lines.push(`I said "${f.said}", but my teacher fixed my mistake: ${f.fact}`);
    }
    if (day.catches > 0) {
      lines.push(
        day.catches === 1
          ? 'My teacher caught one of my mistakes. My brain is getting stronger!'
          : `My teacher caught ${day.catches} of my mistakes! My brain is getting stronger!`,
      );
    }
    for (const m of day.missions.slice(-2)) lines.push(`We went on an Earth Mission, and my teacher ${lowerFirst(m)}!`);
  }
  lines.push('I love Earth. See you soon!');
  lines.push('Love, Pip 👽');
  return lines;
}

function dayLabel(date: string) {
  if (date === today()) return 'Today';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });
}

export function Letters({ onBack }: { onBack: () => void }) {
  const { data } = useStore();
  const days = useMemo(() => {
    const has = data.diary.some((d) => d.date === today());
    return has ? data.diary : [{ date: today(), concepts: [], catches: 0, fixed: [], shown: 0, missions: [] }, ...data.diary];
  }, [data.diary]);
  const [sel, setSel] = useState(days[0].date);
  const day = days.find((d) => d.date === sel);
  const letter = composeLetter(day, data.avatar);

  useEffect(() => {
    say(letter.join(' '));
    // Re-read only when a different day's letter is opened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="⬅️" label="Back" onPress={onBack} />
        <Text style={T.h2}>📮 Pip's Letters</Text>
        <IconButton emoji="🔊" label="Read the letter" onPress={() => say(letter.join(' '))} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
          {days.map((d) => (
            <Pressable
              key={d.date}
              accessibilityRole="button"
              onPress={() => {
                feel.tap();
                setSel(d.date);
              }}
              style={[styles.day, sel === d.date && styles.dayOn]}
            >
              <Text style={styles.dayText}>{dayLabel(d.date)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.paper}>
          <View style={styles.stampCorner}>
            <Text style={{ fontSize: 30 }}>🪐</Text>
          </View>
          {letter.map((l, k) => (
            <Text key={k} style={[styles.line, k === 0 && styles.greeting, k >= letter.length - 1 && styles.sign]}>
              {l}
            </Text>
          ))}
        </View>
        <View style={{ marginTop: -24 }}>
          <Pip size={110} mood="happy" stage={stageFor(data.xp)} />
        </View>

        <View style={styles.passport}>
          <Text style={styles.passportTitle}>🌍 Space passport</Text>
          <Text style={T.small}>
            {data.missions.length === 0
              ? 'Finish a lesson to get an Earth Mission. Each one you do adds a stamp here.'
              : `${data.missions.length} Earth Mission${data.missions.length === 1 ? '' : 's'} done!`}
          </Text>
          <View style={styles.stamps}>
            {data.missions.slice(0, 24).map((m, k) => (
              <View key={k} style={styles.stamp}>
                <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const PAPER = '#FFF6DF';
const PAPER_INK = '#3A2A1A';

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  body: { padding: 16, paddingBottom: 40, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center' },
  days: { gap: 8, paddingBottom: 12 },
  day: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent' },
  dayOn: { borderColor: C.gold },
  dayText: { color: C.text, fontWeight: '800' },
  paper: {
    width: '100%',
    backgroundColor: PAPER,
    borderRadius: R.m,
    padding: 22,
    paddingTop: 26,
    gap: 10,
    transform: [{ rotate: '-1deg' }],
  },
  stampCorner: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 2,
    borderColor: '#D9B77A',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 4,
  },
  line: { color: PAPER_INK, fontSize: 18, lineHeight: 26, fontWeight: '600' },
  greeting: { fontWeight: '900', fontSize: 20, paddingRight: 50 },
  sign: { fontWeight: '900', textAlign: 'right' },
  passport: {
    width: '100%',
    marginTop: 8,
    backgroundColor: C.bg2,
    borderRadius: R.m,
    borderWidth: 2,
    borderColor: C.pip,
    padding: 16,
    gap: 6,
  },
  passportTitle: { color: C.pip, fontSize: 20, fontWeight: '900' },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  stamp: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: C.pip,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
});
