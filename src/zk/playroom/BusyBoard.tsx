import React, { useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { play } from '../../lib/sfx';
import { pick } from '../../lib/random';
import { ND } from '../../theme';
import { Buddy, type BuddyId } from '../characters';
import { P } from './theme';

/** Busy Board: little real-world mechanisms to fiddle with. Each does one satisfying thing. */
export function BusyBoard() {
  return (
    <ScrollView contentContainerStyle={styles.grid}>
      <Card label="Light">
        <LightSwitch />
      </Card>
      <Card label="Door">
        <Door />
      </Card>
      <Card label="Zipper" wide>
        <Zipper />
      </Card>
      <Card label="Spinner">
        <Spinner />
      </Card>
      <Card label="Bolt">
        <Bolt />
      </Card>
      <Card label="Bubbles">
        <Bubbles />
      </Card>
      <Card label="Beads" wide>
        <Abacus />
      </Card>
    </ScrollView>
  );
}

function Card({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <View style={[styles.card, wide && styles.wide]}>
      {children}
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

function LightSwitch() {
  const [on, setOn] = useState(false);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      onPress={() => {
        setOn(!on);
        play('tock', 0.5);
      }}
      style={styles.center}
    >
      <Svg width={70} height={70} viewBox="0 0 70 70">
        <Circle cx={35} cy={30} r={22} fill={on ? P.butter : '#E8E2D6'} opacity={on ? 1 : 0.9} />
        {on && <Circle cx={35} cy={30} r={30} fill={P.butter} opacity={0.25} />}
        <Path d="M27 52 h16 v8 h-16 Z" fill={P.woodDark} />
      </Svg>
      <View style={styles.switchPlate}>
        <View style={[styles.switchKnob, { top: on ? 4 : 22 }]} />
      </View>
    </Pressable>
  );
}

const FRIENDS: BuddyId[] = ['zoomi', 'roarbow', 'peely', 'mona', 'kiki', 'puddle', 'nibbles', 'pinky', 'rio', 'snoozle'];

function Door() {
  const [open, setOpen] = useState(false);
  const [who, setWho] = useState<BuddyId>('zoomi');
  const swing = useRef(new Animated.Value(0)).current;
  const toggle = () => {
    const to = open ? 0 : 1;
    if (!open) setWho(pick(FRIENDS));
    setOpen(!open);
    play('tock', 0.4);
    Animated.timing(swing, { toValue: to, duration: 600, easing: Easing.inOut(Easing.quad), useNativeDriver: ND }).start();
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={open ? 'Close the door' : 'Open the door'} onPress={toggle} style={styles.doorFrame}>
      <View style={styles.doorInside}>
        <Buddy id={who} size={74} still />
      </View>
      <Animated.View
        style={[
          styles.door,
          { transform: [{ translateX: swing.interpolate({ inputRange: [0, 1], outputRange: [0, -52] }) }, { scaleX: swing.interpolate({ inputRange: [0, 1], outputRange: [1, 0.12] }) }] },
        ]}
      >
        <View style={styles.knob} />
      </Animated.View>
    </Pressable>
  );
}

function Zipper() {
  const [w, setW] = useState(260);
  const x = useRef(new Animated.Value(0)).current;
  const pos = useRef(0);
  const start = useRef(0);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          start.current = pos.current;
        },
        onPanResponderMove: (_, g) => {
          const v = Math.max(0, Math.min(w - 40, start.current + g.dx));
          pos.current = v;
          x.setValue(v);
        },
      }),
    [w, x],
  );
  return (
    <View style={styles.zipTrack} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <View style={styles.rainbow}>
        {['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'].map((c) => (
          <View key={c} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>
      <Animated.View style={[styles.zipCover, { left: Animated.add(x, 20) }]} />
      <Animated.View {...responder.panHandlers} style={[styles.zipPull, { transform: [{ translateX: x }] }]}>
        <View style={styles.zipTab} />
      </Animated.View>
    </View>
  );
}

function Spinner() {
  const turns = useRef(0);
  const rot = useRef(new Animated.Value(0)).current;
  const spin = () => {
    turns.current += 1 + Math.floor(Math.random() * 3);
    play('tock', 0.3);
    Animated.timing(rot, { toValue: turns.current, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: ND }).start();
  };
  const colors = ['#E9A6A6', '#E8C07D', '#C9D98F', '#9CC9B4', '#9DB7D9', '#B9A6D9'];
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Spin the wheel" onPress={spin} style={styles.center}>
      <Animated.View style={{ transform: [{ rotate: rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '120deg'] }) }] }}>
        <Svg width={96} height={96} viewBox="-50 -50 100 100">
          {colors.map((c, i) => {
            const a0 = (i * Math.PI) / 3;
            const a1 = ((i + 1) * Math.PI) / 3;
            return <Path key={c} d={`M0 0 L${46 * Math.cos(a0)} ${46 * Math.sin(a0)} A46 46 0 0 1 ${46 * Math.cos(a1)} ${46 * Math.sin(a1)} Z`} fill={c} />;
          })}
          <Circle r={8} fill={P.paper} stroke={P.woodDark} strokeWidth={3} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

function Bolt() {
  const [shut, setShut] = useState(true);
  const x = useRef(new Animated.Value(1)).current;
  const slide = () => {
    setShut(!shut);
    play('tock', 0.55);
    Animated.timing(x, { toValue: shut ? 0 : 1, duration: 350, easing: Easing.inOut(Easing.quad), useNativeDriver: ND }).start();
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={shut ? 'Slide the bolt open' : 'Slide the bolt shut'} onPress={slide} style={styles.center}>
      <View style={styles.boltPlate}>
        <Animated.View style={[styles.bolt, { transform: [{ translateX: x.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] }) }] }]}>
          <View style={styles.boltHandle} />
        </Animated.View>
        <View style={styles.boltCatch} />
      </View>
      <Text style={styles.small}>{shut ? 'Locked' : 'Open'}</Text>
    </Pressable>
  );
}

function Bubbles() {
  const [list, setList] = useState<{ id: number; x: number; v: Animated.Value; s: number }[]>([]);
  const id = useRef(0);
  const blow = () => {
    play('pop', 0.4);
    const fresh = Array.from({ length: 5 }, () => ({ id: id.current++, x: 10 + Math.random() * 80, v: new Animated.Value(0), s: 14 + Math.random() * 18 }));
    setList((l) => [...l.slice(-15), ...fresh]);
    fresh.forEach((b, i) =>
      Animated.timing(b.v, { toValue: 1, duration: 2600 + i * 300, easing: Easing.out(Easing.quad), useNativeDriver: ND }).start(),
    );
  };
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Blow bubbles" onPress={blow} style={[styles.center, { overflow: 'hidden', height: 110, width: '100%' }]}>
      {list.map((b) => (
        <Animated.View
          key={b.id}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            bottom: 10,
            width: b.s,
            height: b.s,
            borderRadius: b.s,
            borderWidth: 2,
            borderColor: '#9DB7D9',
            backgroundColor: 'rgba(157,183,217,0.18)',
            opacity: b.v.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [{ translateY: b.v.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }],
          }}
        />
      ))}
      <View style={styles.bubbleButton} />
    </Pressable>
  );
}

function Abacus() {
  const ROWS = ['#E9A6A6', '#E8C07D', '#9CC9B4'];
  const [moved, setMoved] = useState([0, 0, 0]);
  const tap = (r: number, i: number) => {
    // Beads slide across like a real abacus: tapping a bead moves it and everything on its side.
    setMoved((m) => m.map((v, k) => (k === r ? (i < 5 - v ? 5 - i : 5 - i - 1) : v)));
    play('tock', 0.35);
  };
  return (
    <View style={{ width: '100%', gap: 8, paddingVertical: 6 }}>
      {ROWS.map((c, r) => (
        <View key={c} style={styles.rod}>
          <View style={styles.rodLine} />
          <View style={{ flexDirection: 'row', flex: 1 }}>
            {Array.from({ length: 5 }, (_, i) => {
              const right = i >= 5 - moved[r];
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`bead ${i + 1}`}
                  onPress={() => tap(r, i)}
                  style={[styles.bead, { backgroundColor: c, marginLeft: i === 5 - moved[r] ? 'auto' : 2 }]}
                />
              );
            })}
          </View>
          <Text style={styles.count}>{moved[r]}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 14, paddingBottom: 30 },
  card: { width: '47%', flexGrow: 1, backgroundColor: P.paper, borderRadius: 20, padding: 12, alignItems: 'center', justifyContent: 'center', minHeight: 150 },
  wide: { width: '100%' },
  label: { color: P.ink, opacity: 0.6, marginTop: 6, fontWeight: '700' },
  center: { alignItems: 'center', justifyContent: 'center' },
  small: { color: P.ink, opacity: 0.6, fontSize: 12, marginTop: 4 },
  switchPlate: { width: 34, height: 52, borderRadius: 8, backgroundColor: '#EFE8DA', borderWidth: 2, borderColor: P.wood, marginTop: 4 },
  switchKnob: { position: 'absolute', left: 6, width: 18, height: 22, borderRadius: 5, backgroundColor: P.woodDark },
  doorFrame: { width: 80, height: 110, borderRadius: 10, backgroundColor: '#EFE8DA', borderWidth: 4, borderColor: P.woodDark, overflow: 'hidden' },
  doorInside: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  door: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%', backgroundColor: P.clay },
  knob: { position: 'absolute', right: 8, top: '50%', width: 10, height: 10, borderRadius: 5, backgroundColor: P.butter },
  zipTrack: { width: '100%', height: 64, borderRadius: 14, overflow: 'hidden', justifyContent: 'center' },
  rainbow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row' },
  zipCover: { position: 'absolute', top: 0, bottom: 0, right: 0, backgroundColor: P.sage },
  zipPull: { position: 'absolute', left: 0, width: 40, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: P.woodDark, borderRadius: 10 },
  zipTab: { width: 12, height: 32, borderRadius: 6, backgroundColor: P.butter },
  boltPlate: { width: 100, height: 44, borderRadius: 10, backgroundColor: '#EFE8DA', justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  bolt: { width: 58, height: 14, borderRadius: 7, backgroundColor: P.woodDark, justifyContent: 'center' },
  boltHandle: { position: 'absolute', left: 18, top: -12, width: 12, height: 18, borderRadius: 4, backgroundColor: P.woodDark },
  boltCatch: { position: 'absolute', right: 6, width: 10, height: 24, borderRadius: 3, backgroundColor: P.wood },
  bubbleButton: { position: 'absolute', bottom: 4, width: 44, height: 20, borderRadius: 10, backgroundColor: '#9DB7D9' },
  rod: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rodLine: { position: 'absolute', left: 0, right: 30, height: 4, backgroundColor: P.wood, borderRadius: 2 },
  bead: { width: 34, height: 26, borderRadius: 13 },
  count: { width: 22, textAlign: 'right', color: P.ink, fontWeight: '800' },
});
