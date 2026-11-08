import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Visual } from '../types';
import { C } from '../theme';
import { feel } from '../lib/voice';

interface Item {
  e: string;
  /** Taken away in a subtraction: shown faded and not counted. */
  gone: boolean;
  /** Which group it belongs to in an addition (0 or 1), for the "+" gap. */
  group: number;
}

function itemsOf(v: Visual): Item[] {
  if (v.kind === 'emoji') return v.items.map((e) => ({ e, gone: false, group: 0 }));
  if (v.kind === 'sum' && v.op === '+') {
    return [...v.a.map((e) => ({ e, gone: false, group: 0 })), ...v.b.map((e) => ({ e, gone: false, group: 1 }))];
  }
  if (v.kind === 'sum') {
    const keep = v.a.length - v.b.length;
    return v.a.map((e, i) => ({ e, gone: i >= keep, group: 0 }));
  }
  return [];
}

/**
 * "Show me how!": the child taps each object and Pip counts along. Every tapped object gets
 * its number, so the child is demonstrating one-to-one counting, not just naming an answer.
 */
export function CountVisual({
  v,
  disabled,
  onCount,
  onGone,
  onDone,
}: {
  v: Visual;
  disabled?: boolean;
  onCount: (n: number) => void;
  onGone: () => void;
  onDone: (total: number) => void;
}) {
  const items = useMemo(() => itemsOf(v), [v]);
  const need = items.filter((it) => !it.gone).length;
  const [order, setOrder] = useState<number[]>([]);
  const fs = items.length > 7 ? 34 : 42;

  const tap = (i: number) => {
    if (disabled) return;
    const it = items[i];
    if (it.gone) {
      feel.oops();
      onGone();
      return;
    }
    if (order.includes(i)) return;
    feel.tap();
    const next = [...order, i];
    setOrder(next);
    onCount(next.length);
    if (next.length === need) onDone(need);
  };

  return (
    <View style={[styles.wrap, { maxWidth: (fs + 22) * 5 }]}>
      {items.map((it, i) => {
        const n = order.indexOf(i) + 1;
        const plus = v.kind === 'sum' && v.op === '+' && it.group === 1 && items[i - 1]?.group === 0;
        return (
          <React.Fragment key={i}>
            {plus && <Text style={styles.plus}>+</Text>}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={it.gone ? 'gone' : n ? `counted ${n}` : 'count this one'}
              onPress={() => tap(i)}
              style={({ pressed }) => [
                styles.item,
                n > 0 && styles.counted,
                it.gone && styles.gone,
                pressed && !it.gone && { transform: [{ scale: 0.9 }] },
              ]}
            >
              <Text style={{ fontSize: fs, opacity: it.gone ? 0.25 : 1 }}>{it.e}</Text>
              {it.gone && <Text style={styles.cross}>✖</Text>}
              {n > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{n}</Text>
                </View>
              )}
            </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 6 },
  item: {
    padding: 6,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counted: { borderColor: C.gold, borderStyle: 'solid', backgroundColor: 'rgba(255,210,63,0.15)' },
  gone: { borderColor: 'transparent' },
  cross: { position: 'absolute', color: C.no, fontSize: 24, fontWeight: '900' },
  plus: { color: C.gold, fontSize: 34, fontWeight: '900', marginHorizontal: 4 },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.gold,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: C.ink, fontWeight: '900', fontSize: 16 },
});
