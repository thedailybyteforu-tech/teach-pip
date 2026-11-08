import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { useStore } from '../../state/store';
import { hush } from '../../lib/voice';
import { Buddy } from '../characters';
import { Draggable } from '../Draggable';
import { Z } from '../ui';

/**
 * Snoozle's Calm Room: a low-stimulation space for open-ended play, inspired by Montessori
 * materials. Soft natural colours, no voice, no sounds, no rewards, no timers, no "right" answer.
 */
const INKS = ['#5C5246', '#9C6B4E', '#C98B6B', '#8DA383', '#7FA3B5', '#D9B86C'];
const WIDTHS = [4, 9, 16];

export function Calm({ onBack }: { onBack: () => void }) {
  const { markDone } = useStore();
  const [tab, setTab] = useState<'draw' | 'shapes'>('draw');
  const counted = useRef(false);
  useEffect(() => hush(), []);
  const touched = () => {
    if (!counted.current) {
      counted.current = true;
      markDone('calm');
    }
  };

  return (
    <View style={styles.room}>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={styles.back} hitSlop={10}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Calm Room</Text>
        <View style={{ width: 44 }}>
          <Buddy id="snoozle" size={44} still />
        </View>
      </View>
      <View style={styles.tabs}>
        {(['draw', 'shapes'] as const).map((t) => (
          <Pressable key={t} accessibilityRole="button" onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={[styles.tabText, tab === t && { color: '#fff' }]}>{t === 'draw' ? 'Draw' : 'Wooden shapes'}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'draw' ? <Draw onTouch={touched} /> : <Shapes onTouch={touched} />}
    </View>
  );
}

interface Stroke {
  color: string;
  width: number;
  d: string;
}

function Draw({ onTouch }: { onTouch: () => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState(INKS[0]);
  const [width, setWidth] = useState(WIDTHS[1]);
  const origin = useRef({ x: 0, y: 0 });
  const pad = useRef<React.ComponentRef<typeof View>>(null);
  const pen = useRef({ color, width });
  pen.current = { color, width };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const { pageX, pageY } = e.nativeEvent;
          onTouch();
          pad.current?.measureInWindow((x, y) => {
            origin.current = { x, y };
            const px = pageX - x;
            const py = pageY - y;
            setStrokes((s) => [...s, { ...pen.current, d: `M${px.toFixed(1)} ${py.toFixed(1)} l0.1 0.1` }]);
          });
        },
        onPanResponderMove: (e) => {
          const px = e.nativeEvent.pageX - origin.current.x;
          const py = e.nativeEvent.pageY - origin.current.y;
          setStrokes((s) => {
            if (!s.length) return s;
            const last = s[s.length - 1];
            return [...s.slice(0, -1), { ...last, d: `${last.d} L${px.toFixed(1)} ${py.toFixed(1)}` }];
          });
        },
      }),
    [onTouch],
  );

  return (
    <View style={{ flex: 1 }}>
      <View ref={pad} {...responder.panHandlers} style={styles.paper}>
        <Svg width="100%" height="100%">
          {strokes.map((s, i) => (
            <Path key={i} d={s.d} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </Svg>
      </View>
      <View style={styles.tools}>
        {INKS.map((c) => (
          <Pressable key={c} accessibilityRole="button" accessibilityLabel="Crayon colour" onPress={() => setColor(c)} style={[styles.ink, { backgroundColor: c }, color === c && styles.inkOn]} />
        ))}
      </View>
      <View style={styles.tools}>
        {WIDTHS.map((w) => (
          <Pressable key={w} accessibilityRole="button" accessibilityLabel="Crayon size" onPress={() => setWidth(w)} style={[styles.size, width === w && styles.sizeOn]}>
            <View style={{ width: w + 4, height: w + 4, borderRadius: w, backgroundColor: color }} />
          </Pressable>
        ))}
        <Pressable accessibilityRole="button" onPress={() => setStrokes([])} style={styles.fresh}>
          <Text style={styles.freshText}>Fresh paper</Text>
        </Pressable>
      </View>
    </View>
  );
}

const WOOD = { light: '#E8C9A0', mid: '#D2A679', dark: '#B9875A', edge: '#8C6239' };

function WoodShape({ kind }: { kind: number }) {
  const s = { stroke: WOOD.edge, strokeWidth: 2 };
  switch (kind) {
    case 0:
      return (
        <Svg width={80} height={80}>
          <Circle cx={40} cy={40} r={36} fill={WOOD.light} {...s} />
        </Svg>
      );
    case 1:
      return (
        <Svg width={76} height={76}>
          <Rect x={3} y={3} width={70} height={70} rx={4} fill={WOOD.mid} {...s} />
        </Svg>
      );
    case 2:
      return (
        <Svg width={86} height={76}>
          <Polygon points="43,3 83,73 3,73" fill={WOOD.dark} {...s} />
        </Svg>
      );
    case 3:
      return (
        <Svg width={120} height={50}>
          <Rect x={3} y={3} width={114} height={44} rx={4} fill={WOOD.light} {...s} />
        </Svg>
      );
    case 4:
      return (
        <Svg width={90} height={50}>
          <Path d="M3 47 A42 42 0 0 1 87 47 Z" fill={WOOD.mid} {...s} />
        </Svg>
      );
    default:
      return (
        <Svg width={60} height={110}>
          <Rect x={3} y={3} width={54} height={104} rx={4} fill={WOOD.dark} {...s} />
        </Svg>
      );
  }
}

function Shapes({ onTouch }: { onTouch: () => void }) {
  const [round, setRound] = useState(0);
  const set = [0, 1, 2, 3, 4, 5, 0, 1, 2, 3];
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.table}>
        {set.map((k, i) => (
          <Draggable key={`${round}-${i}`} x={14 + (i % 4) * 82} y={14 + Math.floor(i / 4) * 116} onDrop={onTouch}>
            <WoodShape kind={k} />
          </Draggable>
        ))}
      </View>
      <View style={styles.tools}>
        <Text style={styles.note}>Build a house, a tower, a face... anything you like.</Text>
        <Pressable accessibilityRole="button" onPress={() => setRound(round + 1)} style={styles.fresh}>
          <Text style={styles.freshText}>Tidy up</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  room: { flex: 1, backgroundColor: Z.calm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  backText: { color: Z.calmInk, fontSize: 22, fontWeight: '700' },
  title: { color: Z.calmInk, fontSize: 20, fontWeight: '700' },
  tabs: { flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 16, backgroundColor: '#fff' },
  tabOn: { backgroundColor: Z.calmInk },
  tabText: { color: Z.calmInk, fontWeight: '700' },
  paper: { flex: 1, marginHorizontal: 14, backgroundColor: '#FFFDF8', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#E3D8C6' },
  table: { flex: 1, marginHorizontal: 14, backgroundColor: '#EADFCB', borderRadius: 20, overflow: 'hidden' },
  tools: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 14, flexWrap: 'wrap' },
  ink: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: 'transparent' },
  inkOn: { borderColor: '#fff', transform: [{ scale: 1.15 }] },
  size: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  sizeOn: { borderWidth: 2, borderColor: Z.calmInk },
  fresh: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: '#fff' },
  freshText: { color: Z.calmInk, fontWeight: '700' },
  note: { color: Z.calmInk, opacity: 0.8, flexShrink: 1 },
});
