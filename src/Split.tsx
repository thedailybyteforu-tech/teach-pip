import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, SIDE, type Side } from './theme';

/**
 * The heart of the app: the phone lies flat between two people sitting face to face.
 * The far half is turned upside down so it reads the right way up for the grown-up.
 */
export function Split({ grown, kid, onExit, title }: { grown: React.ReactNode; kid: React.ReactNode; onExit: () => void; title: string }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.half, { backgroundColor: SIDE.grown.soft, transform: [{ rotate: '180deg' }] }]}>{grown}</View>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to games" onPress={onExit} hitSlop={10} style={styles.exit}>
          <Text style={styles.exitText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={[styles.half, { backgroundColor: SIDE.kid.soft }]}>{kid}</View>
    </View>
  );
}

/** A name tag so each person knows which half is theirs. */
export function Tag({ side, note }: { side: Side; note?: string }) {
  const s = SIDE[side];
  return (
    <View style={[styles.tag, { backgroundColor: s.color }]}>
      <Text style={styles.tagText}>
        {s.emoji} {s.name}
        {note ? ` · ${note}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  half: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 8, overflow: 'hidden' },
  bar: { height: 44, backgroundColor: C.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  exit: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  exitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  title: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 0.4 },
  tag: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, alignSelf: 'center', marginBottom: 4 },
  tagText: { color: '#fff', fontWeight: '800', fontSize: 13 },
});
