import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon } from 'react-native-svg';
import { C, ND } from '../theme';

export type Mood = 'happy' | 'thinking' | 'confused' | 'wow' | 'proud' | 'sleepy' | 'sad';

const BODY = ['#7FE9D3', '#5EE6C8', '#55D6EE', '#9D8CFF'];
const BELLY = ['#C9FFF2', '#BDF8EC', '#C4F1FF', '#DCD5FF'];

interface Props {
  size?: number;
  mood?: Mood;
  /** Evolution stage 0..3 — Pip grows antennae, a crest, then wings and a halo. */
  stage?: number;
  onPress?: () => void;
}

export function Pip({ size = 180, mood = 'happy', stage = 0, onPress }: Props) {
  const [blink, setBlink] = useState(false);
  const float = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        setTimeout(() => alive && setBlink(false), 140);
        loop();
      }, 2200 + Math.random() * 2600);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const ease = Easing.inOut(Easing.sin);
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: -9, duration: mood === 'sleepy' ? 2200 : 1100, easing: ease, useNativeDriver: ND }),
        Animated.timing(float, { toValue: 0, duration: mood === 'sleepy' ? 2200 : 1100, easing: ease, useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [float, mood]);

  useEffect(() => {
    pop.setValue(0.86);
    Animated.spring(pop, { toValue: 1, friction: 3, tension: 120, useNativeDriver: ND }).start();
  }, [mood, pop]);

  const s = Math.max(0, Math.min(3, stage));
  const eyesClosed = blink || mood === 'sleepy';

  const pupil = (cx: number) => {
    let dx = 0;
    let dy = 2;
    if (mood === 'thinking') {
      dx = 6;
      dy = -8;
    } else if (mood === 'confused') {
      dx = cx < 100 ? 5 : -5;
    }
    const r = mood === 'wow' ? 7 : 10;
    return (
      <G>
        <Circle cx={cx + dx} cy={100 + dy} r={r} fill={C.ink} />
        <Circle cx={cx + dx + 4} cy={100 + dy - 4} r={3.5} fill="#fff" />
      </G>
    );
  };

  const mouth = () => {
    switch (mood) {
      case 'proud':
        return (
          <G>
            <Path d="M80 134 Q100 168 120 134 Z" fill={C.ink} />
            <Ellipse cx={100} cy={151} rx={10} ry={6} fill="#FF7EA8" />
          </G>
        );
      case 'wow':
        return <Ellipse cx={100} cy={146} rx={9} ry={12} fill={C.ink} />;
      case 'thinking':
        return <Path d="M90 147 Q101 142 113 146" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />;
      case 'confused':
        return (
          <Path d="M84 148 Q92 140 100 148 Q108 156 116 148" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />
        );
      case 'sleepy':
        return <Ellipse cx={100} cy={147} rx={5} ry={4} fill={C.ink} />;
      case 'sad':
        return <Path d="M86 151 Q100 139 114 151" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />;
      default:
        return <Path d="M83 139 Q100 158 117 139" stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />;
    }
  };

  const svg = (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Ellipse cx={100} cy={190} rx={55} ry={7} fill="#000" opacity={0.28} />
      {s >= 3 && <Circle cx={100} cy={108} r={94} fill={C.gold} opacity={0.12} />}
      {s >= 3 && (
        <G>
          <Path d="M38 112 Q2 74 12 128 Q22 146 42 130 Z" fill="#C7F4FF" opacity={0.9} />
          <Path d="M162 112 Q198 74 188 128 Q178 146 158 130 Z" fill="#C7F4FF" opacity={0.9} />
        </G>
      )}

      {/* antennae */}
      {s === 0 ? (
        <G>
          <Line x1={84} y1={56} x2={78} y2={40} stroke={BODY[s]} strokeWidth={6} strokeLinecap="round" />
          <Line x1={116} y1={56} x2={122} y2={40} stroke={BODY[s]} strokeWidth={6} strokeLinecap="round" />
          <Circle cx={78} cy={38} r={6} fill={C.pipDark} />
          <Circle cx={122} cy={38} r={6} fill={C.pipDark} />
        </G>
      ) : (
        <G>
          <Path d="M84 56 Q70 34 62 16" stroke={BODY[s]} strokeWidth={6} strokeLinecap="round" fill="none" />
          <Path d="M116 56 Q130 34 138 16" stroke={BODY[s]} strokeWidth={6} strokeLinecap="round" fill="none" />
          <Circle cx={62} cy={15} r={16} fill={C.gold} opacity={0.3} />
          <Circle cx={138} cy={15} r={16} fill={C.gold} opacity={0.3} />
          <Circle cx={62} cy={15} r={9} fill={C.gold} />
          <Circle cx={138} cy={15} r={9} fill={C.gold} />
        </G>
      )}

      {/* feet */}
      <Ellipse cx={72} cy={178} rx={17} ry={9} fill={C.pipDark} />
      <Ellipse cx={128} cy={178} rx={17} ry={9} fill={C.pipDark} />

      {/* body */}
      <Path
        d="M100 45 C150 45 172 85 172 120 C172 160 140 180 100 180 C60 180 28 160 28 120 C28 85 50 45 100 45 Z"
        fill={BODY[s]}
      />
      <Ellipse cx={100} cy={146} rx={44} ry={28} fill={BELLY[s]} opacity={0.65} />
      <Circle cx={48} cy={122} r={6} fill={C.pipDark} opacity={0.35} />
      <Circle cx={154} cy={116} r={5} fill={C.pipDark} opacity={0.35} />
      <Circle cx={58} cy={92} r={4} fill={C.pipDark} opacity={0.3} />

      {s >= 2 && (
        <G>
          <Polygon points="92,49 100,26 108,49" fill={C.gold} />
          <Polygon points="76,55 79,36 90,51" fill="#FF9EC7" />
          <Polygon points="110,51 121,36 124,55" fill="#FF9EC7" />
        </G>
      )}

      {/* eyes */}
      {eyesClosed ? (
        <G>
          <Path d="M58 101 Q76 111 94 101" stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
          <Path d="M106 101 Q124 111 142 101" stroke={C.ink} strokeWidth={5} strokeLinecap="round" fill="none" />
        </G>
      ) : (
        <G>
          <Ellipse cx={76} cy={100} rx={19} ry={mood === 'wow' ? 23 : 21} fill="#fff" />
          <Ellipse cx={124} cy={100} rx={19} ry={mood === 'wow' ? 23 : 21} fill="#fff" />
          {pupil(76)}
          {pupil(124)}
        </G>
      )}
      {mood === 'confused' && (
        <Path d="M108 72 Q124 64 140 74" stroke={C.ink} strokeWidth={4} strokeLinecap="round" fill="none" />
      )}
      {mood === 'sad' && (
        <G>
          <Path d="M60 76 L88 82" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
          <Path d="M140 76 L112 82" stroke={C.ink} strokeWidth={4} strokeLinecap="round" />
        </G>
      )}

      {/* cheeks */}
      <Ellipse cx={58} cy={128} rx={11} ry={6} fill="#FF8FB8" opacity={0.75} />
      <Ellipse cx={142} cy={128} rx={11} ry={6} fill="#FF8FB8" opacity={0.75} />
      {mouth()}
    </Svg>
  );

  return (
    <Animated.View style={{ transform: [{ translateY: float }, { scale: pop }] }}>
      {onPress ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Pip the alien">
          {svg}
        </Pressable>
      ) : (
        svg
      )}
    </Animated.View>
  );
}
