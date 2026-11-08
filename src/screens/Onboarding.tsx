import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useStore } from '../state/store';
import { feel, say } from '../lib/voice';
import { C } from '../theme';
import { Pip, type Mood } from '../components/Pip';
import { BigButton, Bubble, T } from '../components/ui';

const AVATARS = ['🦊', '🦁', '🐼', '🐸', '🐙', '🦄', '🐯', '🐵', '🐧'];

const STEPS: { line: string; mood: Mood; button: string }[] = [
  {
    line: 'Whoosh... BUMP! Oh hello! I am Pip. My spaceship crashed on your planet!',
    mood: 'wow',
    button: 'Hello, Pip!',
  },
  {
    line: "I don't know ANYTHING about Earth. Not numbers, not letters, not colors! Will you be my teacher?",
    mood: 'sad',
    button: 'Yes! I will teach you!',
  },
  {
    line: "Hooray! One secret: sometimes I get things wrong. If I make a mistake, you have to catch it! Now pick your teacher badge.",
    mood: 'proud',
    button: "Let's go!",
  },
];

export function Onboarding() {
  const { update, data } = useStore();
  const [step, setStep] = useState(0);
  const [avatar, setAvatar] = useState(data.avatar);
  const s = STEPS[step];

  useEffect(() => {
    say(s.line);
  }, [s.line]);

  const finish = () => {
    say(`Hello, Teacher! Let's learn together!`);
    update((d) => ({ ...d, avatar, onboarded: true }));
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.title}>Teach Pip</Text>
      <Text style={[T.small, { marginBottom: 6 }]}>the alien who learns from YOU</Text>
      <Pip size={210} mood={s.mood} stage={0} />
      <View style={{ width: '100%', maxWidth: 440 }}>
        <Bubble text={s.line} onReplay={() => say(s.line)} />
      </View>

      {step === 2 && (
        <View style={styles.grid}>
          {AVATARS.map((a) => (
            <Pressable
              key={a}
              accessibilityRole="button"
              accessibilityLabel={`Badge ${a}`}
              onPress={() => {
                feel.tap();
                setAvatar(a);
              }}
              style={[styles.avatar, avatar === a && styles.avatarOn]}
            >
              <Text style={{ fontSize: 40 }}>{a}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={{ height: 20 }} />
      <BigButton
        label={s.button}
        size="xl"
        onPress={() => (step < STEPS.length - 1 ? setStep(step + 1) : finish())}
        style={{ width: '100%', maxWidth: 440 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: 24, paddingTop: 36, flexGrow: 1, justifyContent: 'center' },
  title: { color: C.gold, fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 330, marginTop: 18, gap: 10 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  avatarOn: { borderColor: C.gold, backgroundColor: C.cardHi },
});
