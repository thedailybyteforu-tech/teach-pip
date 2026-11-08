import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { NOTES, play } from '../../lib/sfx';
import { ND } from '../../theme';
import { Buddy } from '../characters';
import { P } from './theme';

interface Star {
  id: number;
  x: number;
  y: number;
  s: number;
}

/**
 * Night Sky: tap to hang stars. Neighbouring stars join with a thin line into a constellation;
 * every star hums a soft note by its height. An occasional shooting star crosses the sky.
 */
export function NightSky() {
  const [size, setSize] = useState({ w: 340, h: 460 });
  const [stars, setStars] = useState<Star[]>([]);
  const [lines, setLines] = useState(true);
  const id = useRef(1);
  const skyRef = useRef<React.ComponentRef<typeof Pressable>>(null);

  const add = (x: number, y: number) => {
    if (stars.length >= 40) return;
    setStars((s) => [...s, { id: id.current++, x, y, s: 16 + Math.random() * 14 }]);
    const row = Math.min(5, Math.max(0, Math.floor((1 - y / size.h) * 6)));
    play(NOTES[row], 0.35);
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a star"
        ref={skyRef}
        onPress={(e) => {
          const { pageX, pageY } = e.nativeEvent;
          skyRef.current?.measureInWindow((bx, by) => add(pageX - bx, pageY - by));
        }}
        style={styles.sky}
        onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      >
        <Text style={styles.moon}>🌙</Text>
        <Shooting w={size.w} />
        {lines && (
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill} pointerEvents="none">
            {stars.slice(1).map((s, i) => (
              <Line key={s.id} x1={stars[i].x} y1={stars[i].y} x2={s.x} y2={s.y} stroke="#F2D891" strokeOpacity={0.45} strokeWidth={1.5} />
            ))}
          </Svg>
        )}
        {stars.map((s) => (
          <Twinkle key={s.id} s={s} />
        ))}
        {stars.length === 0 && <Text style={styles.hint}>Tap the sky to hang a star</Text>}
        <View style={styles.sleeper} pointerEvents="none">
          <Buddy id="snoozle" size={70} still />
        </View>
      </Pressable>
      <View style={styles.tools}>
        <Pressable accessibilityRole="button" onPress={() => setLines(!lines)} style={styles.tool}>
          <Text style={styles.toolText}>{lines ? 'Hide lines' : 'Join stars'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => setStars([])} style={styles.tool}>
          <Text style={styles.toolText}>New sky</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Twinkle({ s }: { s: Star }) {
  const v = useRef(new Animated.Value(0)).current;
  const grow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(grow, { toValue: 1, friction: 5, useNativeDriver: ND }).start();
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1800 + (s.id % 5) * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
        Animated.timing(v, { toValue: 0, duration: 1800 + (s.id % 4) * 300, easing: Easing.inOut(Easing.sin), useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [v, grow, s.id]);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        left: s.x - s.s / 2,
        top: s.y - s.s / 2,
        fontSize: s.s,
        opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] }),
        transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }) }],
      }}
    >
      ⭐
    </Animated.Text>
  );
}

function Shooting({ w }: { w: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let alive = true;
    const go = () => {
      if (!alive) return;
      v.setValue(0);
      Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: ND }).start(() => {
        setTimeout(go, 7000 + Math.random() * 6000);
      });
    };
    const t = setTimeout(go, 3000);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [v]);
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 24,
        left: 0,
        fontSize: 22,
        opacity: v.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 0.8, 0] }),
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [w * 0.9, -40] }) }, { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, 140] }) }],
      }}
    >
      ✨
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  sky: { flex: 1, marginHorizontal: 14, backgroundColor: P.night, borderRadius: 20, overflow: 'hidden' },
  moon: { position: 'absolute', top: 12, right: 16, fontSize: 40, opacity: 0.9 },
  hint: { position: 'absolute', alignSelf: 'center', top: '45%', color: '#fff', opacity: 0.55 },
  sleeper: { position: 'absolute', bottom: 0, left: 8 },
  tools: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10, flexWrap: 'wrap' },
  tool: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: P.paper },
  toolText: { color: P.ink, fontWeight: '700' },
});
