import React, { useMemo, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { play } from '../../lib/sfx';
import { P } from './theme';

type Tool = 'finger' | 'rake' | 'shell';
interface Mark {
  tool: Tool;
  d: string[];
}
interface Stamp {
  x: number;
  y: number;
  e: string;
}
const STAMPS = ['🐚', '⭐', '🦀', '🐟', '🪸', '🐢'];

/** Sand Tray: draw grooves with a finger or a rake, and press shells into the sand. */
export function SandTray() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [tool, setTool] = useState<Tool>('finger');
  const [stampIdx, setStampIdx] = useState(0);
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const stampRef = useRef(stampIdx);
  stampRef.current = stampIdx;
  const origin = useRef({ x: 0, y: 0 });
  const board = useRef<React.ComponentRef<typeof View>>(null);
  const moved = useRef(false);

  const OFFS = (t: Tool) => (t === 'rake' ? [-14, 0, 14] : [0]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const { pageX, pageY } = e.nativeEvent;
          moved.current = false;
          board.current?.measureInWindow((bx, by) => {
            origin.current = { x: bx, y: by };
            const x = pageX - bx;
            const y = pageY - by;
            if (toolRef.current === 'shell') {
              setStamps((s) => [...s, { x, y, e: STAMPS[stampRef.current % STAMPS.length] }]);
              setStampIdx((i) => i + 1);
              play('pop', 0.3);
              return;
            }
            const t = toolRef.current;
            setMarks((m) => [...m, { tool: t, d: OFFS(t).map((o) => `M${x.toFixed(1)} ${(y + o).toFixed(1)} l0.1 0.1`) }]);
          });
        },
        onPanResponderMove: (e) => {
          if (toolRef.current === 'shell') return;
          const x = e.nativeEvent.pageX - origin.current.x;
          const y = e.nativeEvent.pageY - origin.current.y;
          if (!moved.current) {
            moved.current = true;
            play('tock', 0.12);
          }
          setMarks((m) => {
            if (!m.length) return m;
            const last = m[m.length - 1];
            const offs = OFFS(last.tool);
            return [...m.slice(0, -1), { ...last, d: last.d.map((d, i) => `${d} L${x.toFixed(1)} ${(y + offs[i]).toFixed(1)}`) }];
          });
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <View style={{ flex: 1 }}>
      <View ref={board} {...responder.panHandlers} style={styles.sand}>
        <Svg width="100%" height="100%">
          {marks.map((m, i) =>
            m.d.map((d, k) => (
              <React.Fragment key={`${i}-${k}`}>
                <Path d={d} stroke="#F7ECD6" strokeWidth={m.tool === 'rake' ? 5 : 11} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(1.5 2)" />
                <Path d={d} stroke="#C9AE86" strokeWidth={m.tool === 'rake' ? 5 : 11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </React.Fragment>
            )),
          )}
        </Svg>
        {stamps.map((s, i) => (
          <Text key={i} pointerEvents="none" style={[styles.stamp, { left: s.x - 20, top: s.y - 22 }]}>
            {s.e}
          </Text>
        ))}
        {marks.length === 0 && stamps.length === 0 && <Text style={styles.hint}>Draw in the sand</Text>}
      </View>
      <View style={styles.tools}>
        {(['finger', 'rake', 'shell'] as Tool[]).map((t) => (
          <Pressable key={t} accessibilityRole="button" onPress={() => setTool(t)} style={[styles.tool, tool === t && styles.toolOn]}>
            <Text style={[styles.toolText, tool === t && { color: '#fff' }]}>{t === 'finger' ? '☝️ Finger' : t === 'rake' ? '🔱 Rake' : '🐚 Shells'}</Text>
          </Pressable>
        ))}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMarks([]);
            setStamps([]);
          }}
          style={styles.tool}
        >
          <Text style={styles.toolText}>Smooth</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sand: { flex: 1, marginHorizontal: 14, backgroundColor: '#E9D6B0', borderRadius: 20, overflow: 'hidden' },
  stamp: { position: 'absolute', fontSize: 40 },
  hint: { position: 'absolute', alignSelf: 'center', top: '45%', color: P.ink, opacity: 0.45 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolOn: { backgroundColor: P.ink },
  toolText: { color: P.ink, fontWeight: '700' },
});
