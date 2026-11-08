import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';
import { play } from '../../lib/sfx';
import { P } from './theme';

interface Ramp {
  id: number;
  kind: 'ramp';
  x: number;
  y: number;
  angle: number; // degrees
  len: number;
}
interface Bumper {
  id: number;
  kind: 'bumper';
  x: number;
  y: number;
  r: number;
}
type Piece = Ramp | Bumper;
interface Marble {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  born: number;
  lastTock: number;
}

const R = 11; // marble radius
const GRAVITY = 700;
const MARBLE_COLORS = ['#E07A5F', '#81B29A', '#F2CC8F', '#3D85C6', '#B48EAD', '#E9A6A6'];
const MAX_MARBLES = 14;

const ends = (p: Ramp) => {
  const a = (p.angle * Math.PI) / 180;
  const dx = (Math.cos(a) * p.len) / 2;
  const dy = (Math.sin(a) * p.len) / 2;
  return [p.x - dx, p.y - dy, p.x + dx, p.y + dy] as const;
};

function distToSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * vx + (py - y1) * vy) / (vx * vx + vy * vy || 1)));
  const cx = x1 + t * vx;
  const cy = y1 + t * vy;
  return { d: Math.hypot(px - cx, py - cy), cx, cy };
}

/**
 * Marble Run: drag wooden ramps and round bumpers anywhere, tap a ramp to tilt it, tap the sky
 * to drop a marble. Real (gentle) physics; no goal, no score.
 */
export function MarbleRun() {
  const [size, setSize] = useState({ w: 340, h: 480 });
  const [pieces, setPieces] = useState<Piece[]>([]);
  const marbles = useRef<Marble[]>([]);
  const [, setFrame] = useState(0);
  const nextId = useRef(1);
  const piecesRef = useRef(pieces);
  piecesRef.current = pieces;
  const sizeRef = useRef(size);
  sizeRef.current = size;

  // A gentle starting layout: three ramps that zig-zag down.
  useEffect(() => {
    const { w, h } = size;
    setPieces([
      { id: 1, kind: 'ramp', x: w * 0.38, y: h * 0.26, angle: 18, len: w * 0.55 },
      { id: 2, kind: 'ramp', x: w * 0.62, y: h * 0.48, angle: -18, len: w * 0.55 },
      { id: 3, kind: 'ramp', x: w * 0.4, y: h * 0.7, angle: 15, len: w * 0.5 },
      { id: 4, kind: 'bumper', x: w * 0.85, y: h * 0.82, r: 18 },
    ]);
    nextId.current = 5;
  }, [size]);

  // Physics loop.
  useEffect(() => {
    let raf = 0;
    let last = Date.now();
    const step = () => {
      const now = Date.now();
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const { w, h } = sizeRef.current;
      const ps = piecesRef.current;
      const ms = marbles.current;
      for (const m of ms) {
        m.vy += GRAVITY * dt;
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        for (const p of ps) {
          let nx = 0;
          let ny = 0;
          let pen = 0;
          let bounce = 0.3;
          if (p.kind === 'ramp') {
            const [x1, y1, x2, y2] = ends(p);
            const { d, cx, cy } = distToSeg(m.x, m.y, x1, y1, x2, y2);
            if (d < R + 6 && d > 0) {
              nx = (m.x - cx) / d;
              ny = (m.y - cy) / d;
              pen = R + 6 - d;
            }
          } else {
            const d = Math.hypot(m.x - p.x, m.y - p.y);
            if (d < R + p.r && d > 0) {
              nx = (m.x - p.x) / d;
              ny = (m.y - p.y) / d;
              pen = R + p.r - d;
              bounce = 0.75;
            }
          }
          if (pen > 0) {
            m.x += nx * pen;
            m.y += ny * pen;
            const vn = m.vx * nx + m.vy * ny;
            if (vn < 0) {
              m.vx -= (1 + bounce) * vn * nx;
              m.vy -= (1 + bounce) * vn * ny;
              m.vx *= 0.995;
              if (-vn > 140 && now - m.lastTock > 120) {
                m.lastTock = now;
                play('tock', Math.min(0.7, -vn / 900));
              }
            }
          }
        }
        if (m.x < R) {
          m.x = R;
          m.vx = Math.abs(m.vx) * 0.5;
        }
        if (m.x > w - R) {
          m.x = w - R;
          m.vx = -Math.abs(m.vx) * 0.5;
        }
        if (m.y > h - R) {
          m.y = h - R;
          m.vy = -Math.abs(m.vy) * 0.25;
          m.vx *= 0.96;
        }
      }
      // Marbles rest in the tray for a while, then quietly disappear.
      marbles.current = ms.filter((m) => now - m.born < 14000);
      setFrame((f) => (f + 1) % 1000000);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const drop = (x: number) => {
    if (marbles.current.length >= MAX_MARBLES) marbles.current.shift();
    marbles.current.push({
      id: nextId.current++,
      x: Math.max(R, Math.min(sizeRef.current.w - R, x)),
      y: R + 2,
      vx: (Math.random() - 0.5) * 30,
      vy: 0,
      color: MARBLE_COLORS[Math.floor(Math.random() * MARBLE_COLORS.length)],
      born: Date.now(),
      lastTock: 0,
    });
    play('pop', 0.35);
  };

  // One responder for the whole board: grab a piece, tap a ramp to tilt it, or tap empty space to drop.
  const drag = useRef<{ id: number; ox: number; oy: number; moved: boolean } | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const board = useRef<React.ComponentRef<typeof View>>(null);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const { pageX, pageY } = e.nativeEvent;
          board.current?.measureInWindow((bx, by) => {
            origin.current = { x: bx, y: by };
            const x = pageX - bx;
            const y = pageY - by;
            const hit = [...piecesRef.current].reverse().find((p) =>
              p.kind === 'ramp' ? distToSeg(x, y, ...ends(p)).d < 24 : Math.hypot(x - p.x, y - p.y) < p.r + 14,
            );
            drag.current = hit ? { id: hit.id, ox: x - hit.x, oy: y - hit.y, moved: false } : null;
            if (!hit) drop(x);
          });
        },
        onPanResponderMove: (e, g) => {
          const dr = drag.current;
          if (!dr) return;
          if (Math.abs(g.dx) + Math.abs(g.dy) > 6) dr.moved = true;
          const x = e.nativeEvent.pageX - origin.current.x - dr.ox;
          const y = e.nativeEvent.pageY - origin.current.y - dr.oy;
          setPieces((ps) => ps.map((p) => (p.id === dr.id ? { ...p, x, y } : p)));
        },
        onPanResponderRelease: () => {
          const dr = drag.current;
          if (dr && !dr.moved) {
            setPieces((ps) => ps.map((p) => (p.id === dr.id && p.kind === 'ramp' ? { ...p, angle: ((p.angle + 60) % 180) - 30 } : p)));
            play('tock', 0.3);
          }
          drag.current = null;
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const add = (kind: Piece['kind']) => {
    const { w, h } = sizeRef.current;
    const id = nextId.current++;
    setPieces((ps) => [
      ...ps,
      kind === 'ramp'
        ? { id, kind, x: w / 2, y: h * 0.4, angle: -15, len: w * 0.42 }
        : { id, kind, x: w / 2, y: h * 0.5, r: 18 },
    ]);
  };

  return (
    <View style={{ flex: 1 }}>
      <View
        ref={board}
        {...responder.panHandlers}
        style={styles.board}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (Math.abs(width - size.w) > 2 || Math.abs(height - size.h) > 2) setSize({ w: width, h: height });
        }}
      >
        <Svg width={size.w} height={size.h}>
          <Line x1={0} y1={size.h - 2} x2={size.w} y2={size.h - 2} stroke={P.wood} strokeWidth={4} />
          {pieces.map((p) =>
            p.kind === 'ramp' ? (
              <G key={p.id}>
                <Line x1={ends(p)[0]} y1={ends(p)[1]} x2={ends(p)[2]} y2={ends(p)[3]} stroke={P.woodDark} strokeWidth={14} strokeLinecap="round" />
                <Line x1={ends(p)[0]} y1={ends(p)[1] - 2} x2={ends(p)[2]} y2={ends(p)[3] - 2} stroke={P.wood} strokeWidth={9} strokeLinecap="round" />
              </G>
            ) : (
              <G key={p.id}>
                <Circle cx={p.x} cy={p.y} r={p.r} fill={P.sage} stroke={P.woodDark} strokeWidth={3} />
                <Circle cx={p.x} cy={p.y} r={p.r * 0.4} fill={P.paper} opacity={0.7} />
              </G>
            ),
          )}
          {marbles.current.map((m) => (
            <G key={m.id}>
              <Circle cx={m.x} cy={m.y} r={R} fill={m.color} />
              <Circle cx={m.x - 3.5} cy={m.y - 3.5} r={3.5} fill="#fff" opacity={0.6} />
            </G>
          ))}
        </Svg>
        <Text style={styles.hint} pointerEvents="none">
          Tap the sky to drop a marble
        </Text>
      </View>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" onPress={() => add('ramp')} style={styles.tool}>
          <Text style={styles.toolText}>＋ Ramp</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => add('bumper')} style={styles.tool}>
          <Text style={styles.toolText}>＋ Bumper</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => drop(sizeRef.current.w * (0.2 + Math.random() * 0.6))} style={styles.tool}>
          <Text style={styles.toolText}>Drop</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            marbles.current = [];
          }}
          style={styles.tool}
        >
          <Text style={styles.toolText}>Tidy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { flex: 1, marginHorizontal: 14, backgroundColor: P.sky, borderRadius: 20, overflow: 'hidden' },
  hint: { position: 'absolute', top: 8, alignSelf: 'center', color: P.ink, opacity: 0.45, fontSize: 13 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolText: { color: P.ink, fontWeight: '700' },
});
