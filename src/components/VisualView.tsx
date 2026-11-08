import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Visual } from '../types';
import { C } from '../theme';
import { ShapeView } from './ShapeView';

function emojiSize(n: number, compact: boolean) {
  if (compact) return 34;
  if (n <= 3) return 52;
  if (n <= 6) return 42;
  return 34;
}

/** Draws whatever Pip is asking about (or a picture on an answer card). */
export function VisualView({ v, compact = false }: { v: Visual; compact?: boolean }) {
  switch (v.kind) {
    case 'emoji': {
      const fs = emojiSize(v.items.length, compact);
      return (
        <View style={[styles.wrap, { maxWidth: fs * 5.6 }]}>
          {v.items.map((e, i) => (
            <Text key={i} style={{ fontSize: fs, margin: 2 }}>
              {e}
            </Text>
          ))}
        </View>
      );
    }
    case 'sum': {
      const fs = v.a.length + v.b.length > 7 ? 28 : 36;
      if (v.op === '-') {
        // Show the whole group, with the ones that "go away" faded and crossed.
        const total = v.a.length;
        const gone = v.b.length;
        return (
          <View style={[styles.group, { maxWidth: fs * 6.2 }]}>
            {v.a.map((e, i) => {
              const away = i >= total - gone;
              return (
                <View key={i} style={{ margin: 2 }}>
                  <Text style={{ fontSize: fs, opacity: away ? 0.25 : 1 }}>{e}</Text>
                  {away && <Text style={styles.cross}>✖</Text>}
                </View>
              );
            })}
          </View>
        );
      }
      return (
        <View style={styles.row}>
          <View style={[styles.group, { maxWidth: fs * 3.4 }]}>
            {v.a.map((e, i) => (
              <Text key={i} style={{ fontSize: fs, margin: 1 }}>
                {e}
              </Text>
            ))}
          </View>
          <Text style={styles.op}>+</Text>
          <View style={[styles.group, { maxWidth: fs * 3.4 }]}>
            {v.b.map((e, i) => (
              <Text key={i} style={{ fontSize: fs, margin: 1 }}>
                {e}
              </Text>
            ))}
          </View>
        </View>
      );
    }
    case 'shape':
      return <ShapeView shape={v.shape} color={v.color} size={compact ? 64 : 130} />;
    case 'swatch':
      return (
        <View
          style={[
            styles.swatch,
            { backgroundColor: v.color, width: compact ? 58 : 110, height: compact ? 58 : 110 },
          ]}
        />
      );
    case 'mix':
      return (
        <View style={styles.row}>
          <View style={[styles.swatch, styles.blob, { backgroundColor: v.a }]} />
          <Text style={styles.op}>+</Text>
          <View style={[styles.swatch, styles.blob, { backgroundColor: v.b }]} />
          <Text style={styles.op}>=</Text>
          <View style={[styles.swatch, styles.blob, styles.mystery]}>
            <Text style={{ fontSize: 34 }}>❓</Text>
          </View>
        </View>
      );
    case 'big':
      return <Text style={{ fontSize: compact ? 40 : 92, textAlign: 'center' }}>{v.text}</Text>;
  }
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    padding: 6,
  },
  op: { color: C.gold, fontSize: 40, fontWeight: '900', marginHorizontal: 8 },
  cross: { position: 'absolute', alignSelf: 'center', top: '18%', color: C.no, fontSize: 22, fontWeight: '900' },
  swatch: { borderRadius: 22, borderWidth: 3, borderColor: C.ink },
  blob: { width: 66, height: 66, borderRadius: 33 },
  mystery: { backgroundColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
});
