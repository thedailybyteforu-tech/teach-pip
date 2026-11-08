import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { getConcept, getSubject } from '../content';
import { buildSession, type Round } from '../engine/session';
import { STAGES, stageFor } from '../engine/memory';
import { useStore, type RoundResult, type SessionSummary } from '../state/store';
import { feel, hush, say } from '../lib/voice';
import { pick } from '../lib/random';
import { C } from '../theme';
import { Pip, type Mood } from '../components/Pip';
import { BigButton, Bubble, Confetti, IconButton, T } from '../components/ui';
import { OptionCard, type CardState } from '../components/OptionCard';
import { VisualView } from '../components/VisualView';
import type { Option } from '../types';

type Phase = 'ask' | 'pipGuess' | 'fix' | 'learned';

const YAY = ['Yay!', 'Wow, thank you!', 'Ooh, I get it now!', 'You are a great teacher!', 'Brain sparkle!'];
const HMM = [
  "Hmm, I don't think that's it. Can you look again?",
  "Are you sure, teacher? Let's check again!",
  'Ooh, tricky! Try another one?',
];

const optionWord = (o: Option) => o.speak ?? o.label;

function introLine(r: Round): string {
  const pre = r.review ? "Oh! Wait, I'm forgetting this one... " : '';
  if (r.mode === 'teach') return `${pre}Teacher! ${r.q.prompt}`;
  const pipOpt = r.q.options.find((o) => o.id === r.pipPick)!;
  const guess = pipOpt.hideLabel ? 'this one!' : `${optionWord(pipOpt)}!`;
  return `${pre}${r.q.prompt} Let me try... I think it's ${guess} Am I right?`;
}

/** Spoken version also reads labelled options aloud, for children who can't read yet. */
function spokenIntro(r: Round): string {
  const line = introLine(r);
  if (r.mode !== 'teach' || r.q.options.some((o) => o.hideLabel)) return line;
  const words = r.q.options.map(optionWord);
  const last = words.pop();
  return `${line} Is it ${words.join(', ')} or ${last}?`;
}

export function Teach({ conceptId, onExit, onBrain }: { conceptId: string; onExit: () => void; onBrain: () => void }) {
  const store = useStore();
  const { data } = store;
  const { width } = useWindowDimensions();
  const concept = getConcept(conceptId)!;
  const subject = getSubject(concept.subject);

  const [rounds] = useState(() => buildSession(conceptId, data.memory));
  const [i, setI] = useState(0);
  const r = rounds[i];

  const [phase, setPhase] = useState<Phase>(r.mode === 'teach' ? 'ask' : 'pipGuess');
  const [disabled, setDisabled] = useState<string[]>([]);
  const [mood, setMood] = useState<Mood>('thinking');
  const [line, setLine] = useState(() => introLine(r));
  const [firstTry, setFirstTry] = useState(true);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  // Start of each round.
  useEffect(() => {
    const round = rounds[i];
    setPhase(round.mode === 'teach' ? 'ask' : 'pipGuess');
    setDisabled([]);
    setFirstTry(true);
    setMood(round.mode === 'teach' ? 'thinking' : 'proud');
    setLine(introLine(round));
    say(spokenIntro(round));
  }, [i, rounds]);

  useEffect(() => () => hush(), []);

  const speakLine = useCallback((text: string, m: Mood) => {
    setLine(text);
    setMood(m);
    say(text);
  }, []);

  const correct = r.q.options.find((o) => o.id === r.q.correctId)!;

  const finishRound = (ok: boolean) => {
    setResults((prev) => [...prev, { conceptId: r.conceptId, ok }]);
    store.bumpStats({ rounds: 1 });
    setPhase('learned');
  };

  const onOption = (id: string) => {
    if (phase !== 'ask' && phase !== 'fix') return;
    if (id === r.q.correctId) {
      feel.good();
      if (phase === 'ask') {
        store.bumpStats({ teachTotal: 1, teachFirstTry: firstTry ? 1 : 0 });
        speakLine(`${pick(YAY)} ${r.q.fact}`, 'proud');
      } else {
        speakLine(`Thank you for fixing my mistake, teacher! ${r.q.fact}`, 'proud');
      }
      finishRound(firstTry);
    } else {
      feel.oops();
      setDisabled((d) => [...d, id]);
      setFirstTry(false);
      speakLine(pick(HMM), 'confused');
    }
  };

  const onJudge = (saysRight: boolean) => {
    const pipRight = r.pipPick === r.q.correctId;
    if (saysRight && pipRight) {
      feel.good();
      speakLine(`Yippee! I got it right! ${r.q.fact}`, 'proud');
      finishRound(true);
    } else if (!saysRight && !pipRight) {
      feel.good();
      store.bumpStats({ catches: 1 });
      setDisabled([r.pipPick]);
      speakLine('Oh no, I made a mistake! Good catch! Which one is it then, teacher?', 'confused');
      setPhase('fix');
    } else if (saysRight && !pipRight) {
      feel.oops();
      store.bumpStats({ misses: 1 });
      const it = correct.hideLabel ? 'the glowing one' : optionWord(correct);
      speakLine(`Hmm, wait... I checked again. It's not that one, it's ${it}! Tricky! ${r.q.fact}`, 'thinking');
      finishRound(false);
    } else {
      feel.oops();
      store.bumpStats({ falseAlarms: 1 });
      speakLine(`Hmm, I checked again... I think I was right this time! ${r.q.fact}`, 'wow');
      finishRound(false);
    }
  };

  const next = () => {
    if (i + 1 < rounds.length) {
      setI(i + 1);
      return;
    }
    const s = store.completeSession(results);
    setSummary(s);
    const evolved = s.stageAfter > s.stageBefore;
    say(
      evolved
        ? `Whoa! Something is happening... I evolved! I'm ${STAGES[s.stageAfter].name} now! Thank you, teacher!`
        : `My brain grew! I learned ${concept.title}. You're the best teacher in the galaxy!`,
    );
  };

  const cardState = (o: Option): CardState => {
    if (phase === 'learned') return o.id === r.q.correctId ? 'correct' : 'faded';
    if (phase === 'pipGuess' && o.id === r.pipPick) return 'pip';
    if (phase === 'fix' && o.id === r.pipPick) return 'pipWrong';
    if (disabled.includes(o.id)) return 'disabled';
    return 'idle';
  };

  const cols = r.q.options.length === 2 ? 2 : 3;
  const cardW = Math.min(150, (Math.min(width, 520) - 32 - (cols - 1) * 12) / cols);
  const stage = stageFor(data.xp);

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <IconButton emoji="✖️" label="Stop lesson" onPress={onExit} />
        <View style={styles.dots}>
          {rounds.map((_, k) => (
            <View
              key={k}
              style={[
                styles.dot,
                k < results.length && { backgroundColor: results[k].ok ? C.gold : C.dim },
                k === i && !summary && { borderColor: C.gold, transform: [{ scale: 1.25 }] },
              ]}
            />
          ))}
        </View>
        <IconButton emoji="🔊" label="Hear again" onPress={() => say(phase === 'ask' || phase === 'pipGuess' ? spokenIntro(r) : line)} />
      </View>
    ),
    [rounds, results, i, summary, onExit, phase, r, line],
  );

  if (summary) {
    const evolved = summary.stageAfter > summary.stageBefore;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.summary}>
          <Text style={T.h1}>{evolved ? 'Pip evolved!' : 'Lesson complete!'}</Text>
          <Pip size={220} mood="proud" stage={summary.stageAfter} />
          {evolved && <Text style={styles.evolve}>✨ {STAGES[summary.stageAfter].name} ✨</Text>}
          <Text style={styles.stars}>
            {Array.from({ length: summary.total }, (_, k) => (k < summary.stars ? '⭐' : '☆')).join(' ')}
          </Text>
          <Text style={[T.body, { textAlign: 'center' }]}>
            You taught Pip <Text style={{ color: subject.color, fontWeight: '900' }}>{concept.title}</Text>.{'\n'}
            Pip's brain got +{summary.xpGained} sparks!
          </Text>
          <View style={{ height: 18 }} />
          <BigButton label="See Pip's brain" emoji="🧠" onPress={onBrain} style={styles.wide} />
          <View style={{ height: 14 }} />
          <BigButton label="Back to the ship" emoji="🚀" onPress={onExit} color={C.card} shade={C.bg} textColor={C.text} style={styles.wide} />
        </ScrollView>
        <Confetti count={evolved ? 40 : 24} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {header}
      <ScrollView contentContainerStyle={styles.body} bounces={false}>
        <View style={styles.pipRow}>
          <Pip size={118} mood={mood} stage={stage} />
          <View style={{ flex: 1, marginLeft: 6 }}>
            {r.review && <Text style={styles.review}>🌒 Pip is forgetting this!</Text>}
            <Text style={[styles.mode, { color: subject.color }]}>
              {r.mode === 'teach' ? '🍎 Teach Pip' : '🔍 Check Pip'}
            </Text>
          </View>
        </View>
        <Bubble text={line} onReplay={() => say(line)} />

        {r.q.visual && (
          <View style={styles.visual}>
            <VisualView v={r.q.visual} />
          </View>
        )}

        <View style={[styles.options, { marginTop: r.q.visual ? 12 : 28 }]}>
          {r.q.options.map((o) => (
            <OptionCard
              key={o.id}
              option={o}
              width={cardW}
              state={cardState(o)}
              onPress={phase === 'ask' || phase === 'fix' ? () => onOption(o.id) : undefined}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {phase === 'pipGuess' && (
            <View style={styles.judge}>
              <BigButton label="Right!" emoji="👍" color={C.yes} shade={C.yesDark} onPress={() => onJudge(true)} style={{ flex: 1 }} />
              <View style={{ width: 14 }} />
              <BigButton label="Oops!" emoji="👎" color={C.no} shade={C.noDark} textColor="#fff" onPress={() => onJudge(false)} style={{ flex: 1 }} />
            </View>
          )}
          {phase === 'learned' && <BigButton label={i + 1 < rounds.length ? 'Next' : 'Finish'} emoji="▶️" onPress={next} style={styles.wide} />}
          {(phase === 'ask' || phase === 'fix') && (
            <Text style={styles.hint}>{phase === 'fix' ? 'Tap the right answer to fix Pip!' : 'Tap the answer to teach Pip!'}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', flex: 1, marginHorizontal: 8 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    margin: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  body: { paddingHorizontal: 16, paddingBottom: 30, alignItems: 'center', maxWidth: 560, width: '100%', alignSelf: 'center' },
  pipRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 4 },
  mode: { fontSize: 20, fontWeight: '900' },
  review: { color: C.gold, fontWeight: '800', fontSize: 14, marginBottom: 2 },
  visual: {
    marginTop: 14,
    minHeight: 120,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 24,
    paddingVertical: 14,
  },
  options: { flexDirection: 'row', justifyContent: 'center', gap: 12, width: '100%' },
  actions: { marginTop: 22, width: '100%', alignItems: 'center', minHeight: 80 },
  judge: { flexDirection: 'row', width: '100%' },
  hint: { color: C.dim, fontSize: 15, fontWeight: '700', marginTop: 8 },
  wide: { width: '100%', maxWidth: 420 },
  summary: { alignItems: 'center', padding: 24, paddingTop: 40 },
  evolve: { color: C.gold, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  stars: { fontSize: 26, color: C.gold, marginVertical: 12, textAlign: 'center' },
});
