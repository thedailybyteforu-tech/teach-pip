import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { mostFaded, stageFor, STAGES } from '../engine/memory';
import { ALL_CONCEPTS } from '../content';
import { pick } from '../lib/random';
import { say } from '../lib/voice';
import { C } from '../theme';
import { Pip, type Mood } from '../components/Pip';
import { BigButton, Bubble, IconButton, ProgressBar, T } from '../components/ui';

const GREETINGS = [
  'Hi, teacher! My brain is hungry. What will you teach me today?',
  'I dreamed about numbers last night! Can we learn more?',
  'Teacher! Teacher! I want to learn something new!',
  'Earth is so interesting. Teach me something!',
];

const GIGGLES = ['Hee hee! That tickles!', 'Boop! Hello!', 'Wheee!', 'I like you, teacher!', 'Bleep bloop! That means hello in Alien!'];

export function Home({
  onTeach,
  onConcept,
  onBrain,
  onGrownups,
}: {
  onTeach: () => void;
  onConcept: (id: string) => void;
  onBrain: () => void;
  onGrownups: () => void;
}) {
  const { data } = useStore();
  const stage = stageFor(data.xp);
  const next = STAGES[stage + 1];
  const faded = useMemo(() => mostFaded(data.memory), [data.memory]);
  const learned = ALL_CONCEPTS.filter((c) => (data.memory[c.id]?.taught ?? 0) > 0).length;

  const greeting = useMemo(
    () =>
      faded
        ? `Uh oh, teacher... I'm forgetting ${faded.title}! Can you teach me again?`
        : learned === 0
          ? "Hi, teacher! I'm ready for my very first lesson!"
          : pick(GREETINGS),
    [faded, learned],
  );
  const [line, setLine] = useState(greeting);
  const [mood, setMood] = useState<Mood>(faded ? 'sad' : 'happy');

  useEffect(() => {
    setLine(greeting);
    say(greeting);
  }, [greeting]);

  const tickle = () => {
    const g = pick(GIGGLES);
    setLine(g);
    setMood('wow');
    say(g);
    setTimeout(() => setMood(faded ? 'sad' : 'happy'), 1500);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <View style={styles.top}>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{data.avatar} Teacher</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>🔥 {data.streak.count}</Text>
          </View>
          <IconButton emoji="🔒" label="Grown-ups" onPress={onGrownups} />
        </View>
      </View>

      <View style={styles.bubble}>
        <Bubble text={line} onReplay={() => say(line)} pointer="down" />
      </View>
      <Pip size={230} mood={mood} stage={stage} onPress={tickle} />

      <View style={styles.stage}>
        <Text style={styles.stageName}>{STAGES[stage].name}</Text>
        <ProgressBar value={next ? (data.xp - STAGES[stage].xp) / (next.xp - STAGES[stage].xp) : 1} />
        <Text style={T.small}>
          {next ? `✨ ${data.xp} sparks · ${next.xp - data.xp} more to evolve!` : `✨ ${data.xp} sparks · fully evolved!`}
        </Text>
      </View>

      {faded && (
        <BigButton
          label={`Re-teach: ${faded.title}`}
          emoji="🌒"
          color={C.pip}
          shade={C.pipDark}
          onPress={() => onConcept(faded.id)}
          style={styles.wide}
        />
      )}
      {faded && <View style={{ height: 14 }} />}
      <BigButton label="Teach Pip" emoji="🚀" size="xl" onPress={onTeach} style={styles.wide} />
      <View style={{ height: 14 }} />
      <BigButton label="Pip's Brain" emoji="🧠" color={C.card} shade={C.bg} textColor={C.text} onPress={onBrain} style={styles.wide} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 16, paddingBottom: 32 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: 520 },
  chip: { backgroundColor: C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 2, borderColor: C.line },
  chipText: { color: C.text, fontWeight: '800', fontSize: 16 },
  bubble: { width: '100%', maxWidth: 440, marginTop: 10 },
  stage: { width: '100%', maxWidth: 360, alignItems: 'center', gap: 6, marginBottom: 20, marginTop: 2 },
  stageName: { color: C.gold, fontWeight: '900', fontSize: 20 },
  wide: { width: '100%', maxWidth: 440 },
});
