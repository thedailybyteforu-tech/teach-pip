import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { SubjectId } from '../types';
import { makeMission } from '../content/missions';
import { stageFor } from '../engine/memory';
import { useStore } from '../state/store';
import { feel, say } from '../lib/voice';
import { C } from '../theme';
import { Pip, type Mood } from '../components/Pip';
import { BigButton, Bubble, Confetti, IconButton, T } from '../components/ui';

type Step = 'brief' | 'away' | 'done';

/**
 * Earth Missions: Pip sends the child off the screen to find the lesson in the real world,
 * then waits on the ship until they come back.
 */
export function Mission({ subject, onDone }: { subject: SubjectId; onDone: () => void }) {
  const { data, completeMission } = useStore();
  const [mission] = useState(() => makeMission(subject));
  const [step, setStep] = useState<Step>('brief');
  const [line, setLine] = useState(`Psst, teacher! I can't leave my spaceship. Here is your mission: ${mission.text}`);
  const [mood, setMood] = useState<Mood>('wow');

  useEffect(() => {
    say(line);
    // Only the opening line plays automatically; later lines are spoken where they are set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const talk = (text: string, m: Mood) => {
    setLine(text);
    setMood(m);
    say(text);
  };

  const go = () => {
    setStep('away');
    talk("Go, go, go! I'll wait right here. Tap the big button when you come back!", 'happy');
  };

  const back = () => {
    feel.good();
    completeMission(mission.stamp, mission.emoji);
    setStep('done');
    talk('You did it! Earth is AMAZING! I put a new stamp in my space passport. Plus 2 brain sparks!', 'proud');
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="✖️" label="Close mission" onPress={onDone} />
        <Text style={T.h2}>🌍 Earth Mission</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Pip size={170} mood={mood} stage={stageFor(data.xp)} />
        <Bubble text={line} onReplay={() => say(line)} />

        <View style={[styles.card, step === 'away' && styles.cardAway]}>
          <Text style={styles.emoji}>{step === 'done' ? '🏅' : mission.emoji}</Text>
          <Text style={styles.task}>{mission.text}</Text>
          {step === 'away' && <Text style={[T.small, { marginTop: 8 }]}>Ask a grown-up if you need help!</Text>}
        </View>

        <View style={styles.actions}>
          {step === 'brief' && (
            <>
              <BigButton label="I'll do it!" emoji="🏃" size="xl" onPress={go} style={styles.wide} />
              <BigButton label="Maybe later" size="m" color={C.card} shade={C.bg} textColor={C.text} onPress={onDone} style={styles.wide} />
            </>
          )}
          {step === 'away' && (
            <BigButton label="I did it!" emoji="✅" size="xl" color={C.yes} shade={C.yesDark} onPress={back} style={styles.wide} />
          )}
          {step === 'done' && <BigButton label="Back to the ship" emoji="🚀" onPress={onDone} style={styles.wide} />}
        </View>
      </ScrollView>
      {step === 'done' && <Confetti />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  body: { alignItems: 'center', padding: 16, paddingBottom: 40, maxWidth: 520, width: '100%', alignSelf: 'center' },
  card: {
    width: '100%',
    marginTop: 16,
    backgroundColor: C.bg2,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: C.pip,
    padding: 20,
    alignItems: 'center',
  },
  cardAway: { borderStyle: 'dashed' },
  emoji: { fontSize: 64 },
  task: { color: C.text, fontSize: 22, fontWeight: '900', textAlign: 'center', marginTop: 8, lineHeight: 30 },
  actions: { width: '100%', alignItems: 'center', gap: 12, marginTop: 20 },
  wide: { width: '100%', maxWidth: 420 },
});
