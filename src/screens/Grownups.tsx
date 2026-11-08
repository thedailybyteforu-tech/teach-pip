import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SUBJECTS } from '../content';
import type { AgeBand } from '../types';
import { TOYS as PLAYROOM_TOYS } from '../zk/playroom/toys';
import { retention } from '../engine/memory';
import { today, useStore } from '../state/store';
import { hush } from '../lib/voice';
import { randInt, shuffle } from '../lib/random';
import { C, R } from '../theme';
import { BigButton, IconButton, ProgressBar, T } from '../components/ui';

const LIMITS: (number | null)[] = [10, 20, 30, 45, null];
const AGES: [AgeBand, string][] = [
  ['little', 'Ages 2–3'],
  ['middle', 'Ages 3–5'],
  ['big', 'Ages 5–7'],
];

/** A multiplication question keeps little ones out but takes a grown-up two seconds. */
function Gate({ onPass, onBack }: { onPass: () => void; onBack: () => void }) {
  const [q] = useState(() => {
    const a = randInt(6, 9);
    const b = randInt(6, 9);
    const ans = a * b;
    const opts = shuffle([ans, ans + randInt(2, 6), ans - randInt(2, 6), ans + 10]);
    return { a, b, ans, opts };
  });
  const [wrong, setWrong] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="⬅️" label="Back" onPress={onBack} />
        <Text style={T.h2}>Grown-ups only</Text>
        <View style={{ width: 48 }} />
      </View>
      <View style={styles.gate}>
        <Text style={[T.body, { textAlign: 'center' }]}>To continue, answer this question:</Text>
        <Text style={styles.gateQ}>
          {q.a} × {q.b} = ?
        </Text>
        <View style={styles.gateOpts}>
          {q.opts.map((o) => (
            <Pressable
              key={o}
              accessibilityRole="button"
              onPress={() => (o === q.ans ? onPass() : (setWrong(true), setTimeout(onBack, 700)))}
              style={styles.gateBtn}
            >
              <Text style={styles.gateBtnText}>{o}</Text>
            </Pressable>
          ))}
        </View>
        {wrong && <Text style={{ color: C.no, fontWeight: '800', marginTop: 12 }}>Not quite!</Text>}
      </View>
    </View>
  );
}

export function Grownups({ onBack }: { onBack: () => void }) {
  const store = useStore();
  const { data, update } = store;
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => hush(), []);

  if (!open) return <Gate onPass={() => setOpen(true)} onBack={onBack} />;

  const s = data.stats;
  const pipMistakes = s.catches + s.misses;
  const detective = pipMistakes ? s.catches / pipMistakes : 0;
  const teachAcc = s.teachTotal ? s.teachFirstTry / s.teachTotal : 0;
  const usedMin = data.usage.date === today() ? Math.floor(data.usage.seconds / 60) : 0;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="⬅️" label="Back" onPress={onBack} />
        <Text style={T.h2}>Grown-ups</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today</Text>
          <Text style={T.body}>
            {usedMin} min played · 🔥 {data.streak.count}-day streak · {s.rounds} questions answered in total · 🌍{' '}
            {data.missions.length} Earth Missions done
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👶 Child's age</Text>
          <Text style={T.body}>Sets tracing help, pattern difficulty, song length and the daily path.</Text>
          <View style={styles.limits}>
            {AGES.map(([k, label]) => (
              <Pressable
                key={k}
                onPress={() => update((d) => ({ ...d, zk: { ...d.zk, age: k } }))}
                style={[styles.limit, data.zk.age === k && styles.limitOn]}
              >
                <Text style={styles.limitText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌈 ZoomikoKids progress</Text>
          <Text style={T.body}>
            ✏️ Letters traced: {Object.keys(data.zk.traced).length} of 26{'\n'}
            🔬 Experiments run: {Object.values(data.zk.experiments).reduce((a, b) => a + b, 0)}{'\n'}
            🔴 Pattern level: {data.zk.patternLevel} of 6{'\n'}
            🎵 Longest sound sequence copied: {data.zk.songBest}{'\n'}
            🍳 Dishes cooked: {data.zk.dishes}{'\n'}
            ⭐ Today's learning path: {data.zk.path.date === today() ? data.zk.path.done.length : 0} activities done
          </Text>
          <Text style={[T.small, { marginTop: 8 }]}>
            Activities are organised by the broad areas used in early-years frameworks: literacy, maths, science,
            creative arts, social-emotional play and self-regulation. The app has not been reviewed or endorsed by an
            education body.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌿 Playroom</Text>
          <Text style={T.body}>
            The Playroom has no scores or levels for your child. Here is what they have been playing, and the skill each toy
            quietly builds.
          </Text>
          {PLAYROOM_TOYS.map((t) => (
            <View key={t.id} style={styles.conceptRow}>
              <Text style={[T.small, { flex: 1, color: data.zk.toys[t.id] ? C.sub : C.dim }]}>
                {t.title} · {t.skill}
              </Text>
              <Text style={[T.small, { width: 34, textAlign: 'right' }]}>{data.zk.toys[t.id] ? `×${data.zk.toys[t.id]}` : '–'}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Mistake detective</Text>
          <Text style={T.body}>
            How often your child catches Pip's mistakes. Spotting errors shows real understanding, not just
            memory.
          </Text>
          <View style={styles.statRow}>
            <ProgressBar value={detective} color={C.yes} />
            <Text style={styles.pct}>{pipMistakes ? `${Math.round(detective * 100)}%` : '—'}</Text>
          </View>
          <Text style={T.small}>
            Caught {s.catches} · missed {s.misses} · false alarms {s.falseAlarms} (said Pip was wrong when Pip was right)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍎 Teaching first try</Text>
          <View style={styles.statRow}>
            <ProgressBar value={teachAcc} color={C.gold} />
            <Text style={styles.pct}>{s.teachTotal ? `${Math.round(teachAcc * 100)}%` : '—'}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🧠 What Pip remembers</Text>
          {SUBJECTS.map((sub) => (
            <View key={sub.id} style={{ marginTop: 10 }}>
              <Text style={{ color: sub.color, fontWeight: '900', fontSize: 16 }}>
                {sub.emoji} {sub.name}
              </Text>
              {sub.concepts.map((c) => {
                const m = data.memory[c.id];
                const r = retention(m);
                return (
                  <View key={c.id} style={styles.conceptRow}>
                    <Text style={[T.small, { flex: 1, color: m ? C.sub : C.dim }]}>{c.title}</Text>
                    <View style={{ width: 110 }}>
                      {m ? <ProgressBar value={r} color={sub.color} /> : <Text style={T.small}>not yet</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⏰ Daily play limit</Text>
          <Text style={T.body}>When time is up, Pip gets sleepy and asks to rest until tomorrow. No nagging.</Text>
          <View style={styles.limits}>
            {LIMITS.map((l) => (
              <Pressable
                key={String(l)}
                onPress={() => update((d) => ({ ...d, settings: { ...d.settings, dailyLimitMin: l } }))}
                style={[styles.limit, data.settings.dailyLimitMin === l && styles.limitOn]}
              >
                <Text style={styles.limitText}>{l == null ? 'Off' : `${l}m`}</Text>
              </Pressable>
            ))}
          </View>
          {data.usage.date === today() && data.usage.seconds > 0 && (
            <Pressable onPress={() => update((d) => ({ ...d, usage: { date: today(), seconds: 0 } }))}>
              <Text style={[T.small, { textDecorationLine: 'underline', marginTop: 10 }]}>Give a little more time today</Text>
            </Pressable>
          )}
        </View>

        <View style={[styles.card, styles.switchRow]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>🔊 Pip's voice</Text>
            <Text style={T.small}>Reads everything aloud so pre-readers can play.</Text>
          </View>
          <Switch
            value={data.settings.voice}
            onValueChange={(v) => update((d) => ({ ...d, settings: { ...d.settings, voice: v } }))}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Why Pip works</Text>
          <Text style={T.body}>
            • <Text style={styles.b}>Learning by teaching.</Text> Children explain more carefully when they teach someone
            else (the "protégé effect").{'\n'}• <Text style={styles.b}>Catching mistakes.</Text> Pip makes realistic
            errors — counting one twice, mixing up b and d, thinking blue + yellow stays blue. Spotting them builds deep
            understanding.{'\n'}• <Text style={styles.b}>Spaced repetition.</Text> Pip "forgets" on a real forgetting
            curve, so your child re-teaches just as memory fades.{'\n'}• <Text style={styles.b}>Mixed practice.</Text>{' '}
            Lessons slip in quick reviews from other subjects.{'\n'}• <Text style={styles.b}>Showing how.</Text> In
            "Show me how!" rounds your child counts each object for Pip, teaching the method, not just the answer.
            {'\n'}• <Text style={styles.b}>Earth Missions.</Text> After a lesson Pip sends your child off the screen to
            find the idea in real life: three spoons, something round, something red.{'\n'}•{' '}
            <Text style={styles.b}>Pip's Letters.</Text> Each day Pip writes home about what your child taught it and
            which mistakes they caught. Read it together.{'\n'}• No ads, no purchases, no accounts, no data leaves
            this device.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start over</Text>
          {confirmReset ? (
            <View style={{ gap: 10, marginTop: 8 }}>
              <Text style={T.body}>This erases everything Pip has learned. Are you sure?</Text>
              <BigButton
                label="Yes, erase Pip's memory"
                size="m"
                color={C.no}
                shade={C.noDark}
                textColor="#fff"
                onPress={() => {
                  store.reset();
                  onBack();
                }}
              />
              <BigButton label="Cancel" size="m" color={C.card} shade={C.bg} textColor={C.text} onPress={() => setConfirmReset(false)} />
            </View>
          ) : (
            <Pressable onPress={() => setConfirmReset(true)}>
              <Text style={{ color: C.no, fontWeight: '800', marginTop: 6 }}>Reset progress…</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  body: { padding: 16, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  card: { backgroundColor: C.bg2, borderRadius: R.m, padding: 16, borderWidth: 1, borderColor: C.line },
  cardTitle: { color: C.text, fontSize: 18, fontWeight: '900', marginBottom: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10, paddingRight: 68 },
  pct: { color: C.text, fontWeight: '900', fontSize: 18, position: 'absolute', right: 0 },
  conceptRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  limits: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  limit: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: C.card, borderWidth: 2, borderColor: 'transparent' },
  limitOn: { borderColor: C.gold },
  limitText: { color: C.text, fontWeight: '800' },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
  b: { color: C.text, fontWeight: '800' },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  gateQ: { color: C.text, fontSize: 44, fontWeight: '900', marginVertical: 20 },
  gateOpts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', maxWidth: 320 },
  gateBtn: { width: 130, paddingVertical: 18, borderRadius: R.m, backgroundColor: C.card, alignItems: 'center' },
  gateBtnText: { color: C.text, fontSize: 26, fontWeight: '900' },
});
