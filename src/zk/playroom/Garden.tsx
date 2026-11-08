import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { play } from '../../lib/sfx';
import { pick } from '../../lib/random';
import { ND } from '../../theme';
import { Buddy } from '../characters';
import { P } from './theme';

const FLOWERS = ['🌷', '🌻', '🌼', '🌸', '🌺', '🌹'];

interface Plant {
  id: number;
  x: number;
  flower: string;
}

/** Day and Night Garden: plant, water, watch things grow slowly; switch to night for fireflies. */
export function Garden() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [night, setNight] = useState(false);
  const [watered, setWatered] = useState(0);
  const [w, setW] = useState(340);
  const id = useRef(0);
  const sky = useRef(new Animated.Value(0)).current;
  const soil = useRef<React.ComponentRef<typeof Pressable>>(null);

  useEffect(() => {
    Animated.timing(sky, { toValue: night ? 1 : 0, duration: 1600, useNativeDriver: false }).start();
  }, [night, sky]);

  const plantAt = (x: number) => {
    if (plants.length >= 14) return;
    play('pop', 0.25);
    setPlants((p) => [...p, { id: id.current++, x: Math.max(10, Math.min(w - 40, x - 20)), flower: pick(FLOWERS) }]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[styles.scene, { backgroundColor: sky.interpolate({ inputRange: [0, 1], outputRange: [P.sky, P.night] }) }]}
        onLayout={(e) => setW(e.nativeEvent.layout.width)}
      >
        <Text style={[styles.orb, night && { opacity: 0 }]}>☀️</Text>
        <Text style={[styles.orb, !night && { opacity: 0 }]}>🌙</Text>
        {night ? <Fireflies /> : <Butterfly width={w} />}
        <Pressable
          ref={soil}
          accessibilityRole="button"
          accessibilityLabel="Plant a seed"
          onPress={(e) => {
            const px = e.nativeEvent.pageX;
            soil.current?.measureInWindow((sx) => plantAt(px - sx));
          }}
          style={styles.soil}
        >
          {plants.map((p) => (
            <Sprout key={p.id} x={p.x} flower={p.flower} night={night} watered={watered} />
          ))}
          {plants.length === 0 && <Text style={styles.hint}>Tap the soil to plant a seed</Text>}
        </Pressable>
        <View style={styles.brocco}>
          <Buddy id="brocco" size={70} still={night} />
        </View>
      </Animated.View>
      <View style={styles.tools}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setWatered((n) => n + 1);
            play('pop', 0.2);
          }}
          style={styles.tool}
        >
          <Text style={styles.toolText}>💧 Water</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setNight(!night)} style={styles.tool}>
          <Text style={styles.toolText}>{night ? '☀️ Morning' : '🌙 Night'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setPlants([])} style={styles.tool}>
          <Text style={styles.toolText}>New garden</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Sprout({ x, flower, night, watered }: { x: number; flower: string; night: boolean; watered: number }) {
  const grow = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const [bloom, setBloom] = useState(false);
  useEffect(() => {
    Animated.timing(grow, { toValue: 1, duration: 3200, easing: Easing.out(Easing.quad), useNativeDriver: ND }).start(() => setBloom(true));
  }, [grow]);
  useEffect(() => {
    if (!watered) return;
    wiggle.setValue(0);
    Animated.timing(wiggle, { toValue: 1, duration: 900, useNativeDriver: ND }).start();
  }, [watered, wiggle]);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: x,
        top: -34,
        fontSize: 40,
        opacity: night ? 0.8 : 1,
        transform: [
          { translateY: grow.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
          { scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) },
          { rotate: wiggle.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: ['0deg', '-8deg', '6deg', '-3deg', '0deg'] }) },
        ],
      }}
    >
      {bloom ? flower : '🌱'}
    </Animated.Text>
  );
}

function Fireflies() {
  const flies = useMemo(
    () => Array.from({ length: 9 }, () => ({ x: Math.random() * 90, y: 10 + Math.random() * 45, v: new Animated.Value(0), d: 2600 + Math.random() * 2400 })),
    [],
  );
  useEffect(() => {
    const loops = flies.map((f) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(f.v, { toValue: 1, duration: f.d, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
          Animated.timing(f.v, { toValue: 0, duration: f.d, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [flies]);
  return (
    <>
      {flies.map((f, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: `${f.x}%`,
            top: `${f.y}%`,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: P.butter,
            opacity: f.v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 1, 0.3] }),
            transform: [{ translateX: f.v.interpolate({ inputRange: [0, 1], outputRange: [-12, 14] }) }, { translateY: f.v.interpolate({ inputRange: [0, 1], outputRange: [6, -10] }) }],
          }}
        />
      ))}
    </>
  );
}

function Butterfly({ width }: { width: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0, duration: 9000, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [v]);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: 70,
        fontSize: 26,
        transform: [
          { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [20, Math.max(60, width - 60)] }) },
          { translateY: v.interpolate({ inputRange: [0, 0.25, 0.5, 0.75, 1], outputRange: [0, -20, 10, -15, 0] }) },
        ],
      }}
    >
      🦋
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  scene: { flex: 1, marginHorizontal: 14, borderRadius: 20, overflow: 'hidden' },
  orb: { position: 'absolute', top: 14, right: 18, fontSize: 40 },
  soil: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '42%', backgroundColor: '#B79B7A', borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  hint: { position: 'absolute', alignSelf: 'center', top: 18, color: '#fff', opacity: 0.85, fontWeight: '700' },
  brocco: { position: 'absolute', right: 8, top: 110 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolText: { color: P.ink, fontWeight: '700' },
});
