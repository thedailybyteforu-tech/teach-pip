import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { play } from '../../lib/sfx';
import { ND } from '../../theme';
import { P } from './theme';

interface Block {
  id: number;
  c: number; // left column
  w: number; // width in cells
  color: string;
}

const COLS = 8;
const COLORS = ['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'];
const KINDS = [1, 2, 3, 2, 1, 3];

/** Where each block rests: it falls until it lands on the tallest thing below it. */
function settle(blocks: Block[]): { rows: Record<number, number>; tops: number[] } {
  const tops = Array(COLS).fill(0);
  const rows: Record<number, number> = {};
  for (const b of blocks) {
    let r = 0;
    for (let k = b.c; k < b.c + b.w; k++) r = Math.max(r, tops[k]);
    rows[b.id] = r;
    for (let k = b.c; k < b.c + b.w; k++) tops[k] = r + 1;
  }
  return { rows, tops };
}

/**
 * Block Builder: pick a block, tap the board where it should fall. Tap a block to take it away
 * and everything above it settles. Stacks, bridges and towers: no goal, nothing to win.
 */
export function BlockBuilder() {
  const [size, setSize] = useState({ w: 340, h: 420 });
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [pick, setPick] = useState(0);
  const next = useRef(1);
  const boardRef = useRef<React.ComponentRef<typeof Pressable>>(null);
  const cell = size.w / COLS;
  const { rows, tops } = useMemo(() => settle(blocks), [blocks]);
  const maxRows = Math.floor(size.h / cell);

  const drop = (x: number) => {
    const w = KINDS[pick];
    const c = Math.max(0, Math.min(COLS - w, Math.floor(x / cell - (w - 1) / 2 + 0.5)));
    let r = 0;
    for (let k = c; k < c + w; k++) r = Math.max(r, tops[k]);
    if (r >= maxRows) return;
    setBlocks((b) => [...b, { id: next.current++, c, w, color: COLORS[pick % COLORS.length] }]);
    play(['c', 'd', 'e', 'g', 'a', 'c2'][pick % 6] as 'c', 0.45);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Drop the block here"
        ref={boardRef}
        onPress={(e) => {
          // Measure against the board itself: locationX is relative to whatever was touched.
          const px = e.nativeEvent.pageX;
          boardRef.current?.measureInWindow((bx) => drop(px - bx));
        }}
        style={styles.board}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <View style={styles.floor} />
        {blocks.map((b) => (
          <FallingBlock
            key={b.id}
            block={b}
            row={rows[b.id]}
            cell={cell}
            boardH={size.h}
            onRemove={() => {
              setBlocks((all) => all.filter((x) => x.id !== b.id));
              play('pop', 0.3);
            }}
          />
        ))}
        {blocks.length === 0 && <Text style={styles.hint}>Pick a block, then tap where it should go</Text>}
      </Pressable>
      <View style={styles.tray}>
        {KINDS.map((w, i) => (
          <Pressable
            key={i}
            accessibilityRole="button"
            accessibilityLabel={`Block ${w} wide`}
            onPress={() => setPick(i)}
            style={[styles.pick, pick === i && styles.pickOn]}
          >
            <View style={{ width: 14 * w + 6, height: 26, borderRadius: 6, backgroundColor: COLORS[i % COLORS.length] }} />
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={() => setBlocks([])} style={styles.clear}>
          <Text style={styles.clearText}>Tidy</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FallingBlock({ block, row, cell, boardH, onRemove }: { block: Block; row: number; cell: number; boardH: number; onRemove: () => void }) {
  const y = useRef(new Animated.Value(-cell * 2)).current;
  useEffect(() => {
    Animated.timing(y, { toValue: boardH - (row + 1) * cell - 4, duration: 420, useNativeDriver: ND }).start();
  }, [row, boardH, cell, y]);
  return (
    <Animated.View style={{ position: 'absolute', left: block.c * cell + 2, top: 0, transform: [{ translateY: y }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Take this block away"
        onPress={onRemove}
        style={{ width: block.w * cell - 4, height: cell - 4, borderRadius: 10, backgroundColor: block.color, borderWidth: 2, borderColor: 'rgba(92,82,70,0.18)' }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, marginHorizontal: 14, backgroundColor: P.sky, borderRadius: 20, overflow: 'hidden' },
  floor: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: P.wood },
  hint: { position: 'absolute', alignSelf: 'center', top: '40%', color: P.ink, opacity: 0.5 },
  tray: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  pick: { paddingHorizontal: 8, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper, borderWidth: 2, borderColor: 'transparent' },
  pickOn: { borderColor: P.woodDark },
  clear: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, backgroundColor: P.paper },
  clearText: { color: P.ink, fontWeight: '700' },
});
