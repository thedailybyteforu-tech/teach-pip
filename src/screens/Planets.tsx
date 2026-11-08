import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SUBJECTS } from '../content';
import { isUnlocked, moon, retention } from '../engine/memory';
import { useStore } from '../state/store';
import { feel, say } from '../lib/voice';
import { C, R } from '../theme';
import { IconButton, T } from '../components/ui';

export function Planets({ onBack, onConcept }: { onBack: () => void; onConcept: (id: string) => void }) {
  const { data } = useStore();

  useEffect(() => {
    say('Which planet should we visit? Pick something to teach me!');
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <IconButton emoji="⬅️" label="Back" onPress={onBack} />
        <Text style={T.h2}>Pick a planet!</Text>
        <View style={{ width: 48 }} />
      </View>
      <ScrollView contentContainerStyle={styles.list}>
        {SUBJECTS.map((s) => (
          <View key={s.id} style={[styles.planet, { borderColor: s.color }]}>
            <View style={styles.planetHead}>
              <View style={[styles.orb, { backgroundColor: s.color }]}>
                <Text style={{ fontSize: 30 }}>{s.emoji}</Text>
                <View style={styles.ring} />
              </View>
              <View>
                <Text style={[styles.planetName, { color: s.color }]}>{s.planet}</Text>
                <Text style={T.small}>{s.name}</Text>
              </View>
            </View>
            <View style={styles.chips}>
              {s.concepts.map((c, idx) => {
                const m = data.memory[c.id];
                const taught = (m?.taught ?? 0) > 0;
                const open = isUnlocked(s, idx, data.memory);
                return (
                  <Pressable
                    key={c.id}
                    accessibilityRole="button"
                    accessibilityLabel={open ? c.title : `${c.title}, locked`}
                    onPress={() => {
                      if (!open) {
                        feel.oops();
                        say('That one is locked! Teach me the one before it first.');
                        return;
                      }
                      feel.tap();
                      onConcept(c.id);
                    }}
                    style={({ pressed }) => [
                      styles.chip,
                      !open && styles.locked,
                      taught && { borderColor: s.color },
                      pressed && open && { transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <Text style={{ fontSize: 26 }}>{open ? c.emoji : '🔒'}</Text>
                    <Text style={styles.chipText} numberOfLines={2}>
                      {c.title}
                    </Text>
                    <Text style={styles.moon}>{open ? moon(retention(m), taught) : ''}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={[T.small, { textAlign: 'center', marginTop: 6 }]}>
          ✨ new · 🌕 Pip remembers · 🌒 Pip is forgetting
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 6 },
  list: { padding: 16, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
  planet: { backgroundColor: C.bg2, borderRadius: R.l, borderWidth: 2, padding: 14 },
  planetHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  orb: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    width: 84,
    height: 22,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.55)',
    transform: [{ rotate: '-18deg' }],
  },
  planetName: { fontSize: 22, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    width: '31%',
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: C.card,
    borderRadius: R.m,
    padding: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 112,
  },
  locked: { opacity: 0.45 },
  chipText: { color: C.text, fontWeight: '800', fontSize: 14, textAlign: 'center', marginTop: 4 },
  moon: { fontSize: 18, marginTop: 4 },
});
