import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { play } from '../../lib/sfx';
import { ND } from '../../theme';
import { Buddy, type BuddyId } from '../characters';
import { P } from './theme';

type Weather = 'sun' | 'cloud' | 'rain' | 'snow' | 'rainbow' | 'night';

const SKY: Record<Weather, string> = { sun: '#CFE8F5', cloud: '#D5DCE3', rain: '#B9C6D2', snow: '#E4ECF2', rainbow: '#D7EAF4', night: '#2F3A4F' };
const BUTTONS: { id: Weather; label: string }[] = [
  { id: 'sun', label: '☀️' },
  { id: 'cloud', label: '☁️' },
  { id: 'rain', label: '🌧️' },
  { id: 'snow', label: '❄️' },
  { id: 'rainbow', label: '🌈' },
  { id: 'night', label: '🌙' },
];
const WATCHER: Record<Weather, BuddyId> = { sun: 'zoomi', cloud: 'peely', rain: 'puddle', snow: 'snoozle', rainbow: 'roarbow', night: 'snoozle' };
const NOTE: Record<Weather, 'c' | 'e' | 'g' | 'a' | 'd' | 'c2'> = { sun: 'c2', cloud: 'g', rain: 'd', snow: 'a', rainbow: 'e', night: 'c' };

/** Weather Window: change the weather outside the window and see who is looking out. */
export function WeatherWindow() {
  const [w, setW] = useState<Weather>('sun');
  const sky = useRef(new Animated.Value(0)).current;
  const [from, setFrom] = useState<Weather>('sun');

  useEffect(() => {
    sky.setValue(0);
    Animated.timing(sky, { toValue: 1, duration: 1400, useNativeDriver: false }).start();
  }, [w, sky]);

  const choose = (n: Weather) => {
    setFrom(w);
    setW(n);
    play(NOTE[n], 0.4);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.frame}>
        <Animated.View style={[styles.sky, { backgroundColor: sky.interpolate({ inputRange: [0, 1], outputRange: [SKY[from], SKY[w]] }) }]}>
          {(w === 'sun' || w === 'rainbow') && <Text style={styles.sun}>☀️</Text>}
          {w === 'night' && <Text style={styles.sun}>🌙</Text>}
          {w === 'night' && <Stars />}
          {(w === 'cloud' || w === 'rain' || w === 'rainbow' || w === 'snow') && <Clouds dark={w === 'rain'} />}
          {w === 'rain' && <Falling kind="rain" />}
          {w === 'snow' && <Falling kind="snow" />}
          {w === 'rainbow' && <Text style={styles.rainbow}>🌈</Text>}
          <View style={styles.hill} />
        </Animated.View>
        <View style={styles.crossH} pointerEvents="none" />
        <View style={styles.crossV} pointerEvents="none" />
        <View style={styles.sill} />
        <View style={styles.watcher}>
          <Buddy id={WATCHER[w]} size={92} still />
        </View>
      </View>
      <View style={styles.tools}>
        {BUTTONS.map((b) => (
          <Pressable key={b.id} accessibilityRole="button" accessibilityLabel={b.id} onPress={() => choose(b.id)} style={[styles.tool, w === b.id && styles.toolOn]}>
            <Text style={{ fontSize: 26 }}>{b.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function useLoop(ms: number, delay = 0) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: ms, delay, easing: Easing.linear, useNativeDriver: ND }));
    a.start();
    return () => a.stop();
  }, [v, ms, delay]);
  return v;
}

function Clouds({ dark }: { dark: boolean }) {
  const a = useLoop(24000);
  const b = useLoop(32000, 4000);
  const c = dark ? '#8C99A8' : '#FFFFFF';
  return (
    <>
      <Animated.Text style={[styles.cloud, { top: 30, opacity: dark ? 0.9 : 0.95, color: c, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [-80, 360] }) }] }]}>☁️</Animated.Text>
      <Animated.Text style={[styles.cloud, { top: 90, fontSize: 52, opacity: 0.9, transform: [{ translateX: b.interpolate({ inputRange: [0, 1], outputRange: [360, -90] }) }] }]}>☁️</Animated.Text>
    </>
  );
}

function Falling({ kind }: { kind: 'rain' | 'snow' }) {
  const drops = useMemo(() => Array.from({ length: kind === 'rain' ? 16 : 14 }, (_, i) => ({ x: (i * 37) % 100, d: (kind === 'rain' ? 900 : 4200) + (i % 5) * 260, delay: (i * 211) % 1600 })), [kind]);
  return (
    <>
      {drops.map((d, i) => (
        <Drop key={i} left={d.x} ms={d.d} delay={d.delay} kind={kind} />
      ))}
    </>
  );
}

function Drop({ left, ms, delay, kind }: { left: number; ms: number; delay: number; kind: 'rain' | 'snow' }) {
  const v = useLoop(ms, delay);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: `${left}%`,
        top: 0,
        fontSize: kind === 'rain' ? 16 : 20,
        opacity: 0.85,
        transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [-20, 330] }) }, { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, kind === 'snow' ? 18 : 0] }) }],
      }}
    >
      {kind === 'rain' ? '💧' : '❄️'}
    </Animated.Text>
  );
}

function Stars() {
  const stars = useMemo(() => Array.from({ length: 16 }, (_, i) => ({ x: (i * 53) % 96, y: (i * 29) % 60 })), []);
  const v = useLoop(3600);
  return (
    <>
      {stars.map((s, i) => (
        <Animated.View
          key={i}
          style={{ position: 'absolute', left: `${s.x}%`, top: `${s.y + 4}%`, width: 5, height: 5, borderRadius: 3, backgroundColor: P.butter, opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [i % 2 ? 0.3 : 1, i % 2 ? 1 : 0.3, i % 2 ? 0.3 : 1] }) }}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, marginHorizontal: 14, borderRadius: 22, borderWidth: 10, borderColor: P.wood, overflow: 'hidden', backgroundColor: P.wood },
  sky: { flex: 1, overflow: 'hidden' },
  sun: { position: 'absolute', top: 16, right: 20, fontSize: 52 },
  rainbow: { position: 'absolute', top: 60, left: 16, fontSize: 110, opacity: 0.9 },
  cloud: { position: 'absolute', left: 0, fontSize: 64 },
  hill: { position: 'absolute', left: -40, right: -40, bottom: -60, height: 150, borderRadius: 100, backgroundColor: '#A7C79A' },
  crossH: { position: 'absolute', left: 0, right: 0, top: '50%', height: 8, backgroundColor: P.wood, marginTop: -4 },
  crossV: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 8, backgroundColor: P.wood, marginLeft: -4 },
  sill: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 16, backgroundColor: P.woodDark },
  watcher: { position: 'absolute', bottom: 8, right: 14 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { width: 54, height: 54, borderRadius: 16, backgroundColor: P.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  toolOn: { borderColor: P.woodDark },
});
