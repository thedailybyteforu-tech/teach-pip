import React, { useEffect, useRef } from 'react';
import { Animated, Pressable } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { ND } from '../theme';

/**
 * The ZoomikoKids cast, drawn from the series' character sheets (colours are the sheets' own).
 * Each is a simple, friendly 2D app version of the 3D character, in a 200 x 200 box.
 */
export type BuddyId =
  | 'zoomi'
  | 'roarbow'
  | 'peely'
  | 'mona'
  | 'kiki'
  | 'puddle'
  | 'grumbo'
  | 'bloop'
  | 'fuzzle'
  | 'bobble'
  | 'snoozle'
  | 'nibbles'
  | 'pinky'
  | 'rio'
  | 'brocco';

export const CAST: Record<BuddyId, { name: string; line: string; color: string }> = {
  zoomi: { name: 'Zoomi', line: "Hi friend! Let's play!", color: '#2EC4B6' },
  roarbow: { name: 'Roarbow', line: 'Roar! I am brave and kind!', color: '#F4B942' },
  peely: { name: 'Peely', line: 'Peel out! Time to dance!', color: '#FFD84D' },
  mona: { name: 'Mona', line: 'Picture pose!', color: '#D9A066' },
  kiki: { name: 'Kiki', line: 'Kee-kee! Why? Why? Why?', color: '#A8D84E' },
  puddle: { name: 'Puddle', line: 'Waddle waddle! Copy me!', color: '#2B3A67' },
  grumbo: { name: 'Grumbo', line: 'Hmph! Is it snack time? Ha ha ha!', color: '#A88BD9' },
  bloop: { name: 'Bloop', line: 'BLOOP!', color: '#4FC3F7' },
  fuzzle: { name: 'Fuzzle', line: 'Blehh!', color: '#A7D8F0' },
  bobble: { name: 'Bobble', line: 'La la la!', color: '#7FD8A6' },
  snoozle: { name: 'Snoozle', line: 'Ahhh... hummm.', color: '#FFC7A8' },
  nibbles: { name: 'Nibbles', line: 'Squeak! Nibble nibble!', color: '#F3D9A4' },
  pinky: { name: 'Pinky', line: 'Oink oink! Hello!', color: '#FFAFC8' },
  rio: { name: 'Rio', line: 'Tweet tweet! Look at my rainbow!', color: '#FFFFFF' },
  brocco: { name: 'Brocco', line: 'Eat your greens, and be cool!', color: '#4CAF50' },
};

const INK = '#2B2350';

function Eyes({ y = 96, gap = 24, r = 13, iris = INK, sleepy = false }: { y?: number; gap?: number; r?: number; iris?: string; sleepy?: boolean }) {
  if (sleepy) {
    return (
      <G>
        <Path d={`M${100 - gap - 11} ${y} q11 8 22 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d={`M${100 + gap - 11} ${y} q11 8 22 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      </G>
    );
  }
  return (
    <G>
      {[100 - gap, 100 + gap].map((x) => (
        <G key={x}>
          <Ellipse cx={x} cy={y} rx={r} ry={r * 1.12} fill="#fff" />
          <Circle cx={x + 1} cy={y + 2} r={r * 0.62} fill={iris} />
          <Circle cx={x + 1} cy={y + 2} r={r * 0.3} fill={INK} />
          <Circle cx={x + 4} cy={y - 2} r={r * 0.26} fill="#fff" />
        </G>
      ))}
    </G>
  );
}

const Smile = ({ y = 122, w = 16, open = false }: { y?: number; w?: number; open?: boolean }) =>
  open ? (
    <G>
      <Path d={`M${100 - w} ${y} Q100 ${y + w * 1.6} ${100 + w} ${y} Z`} fill={INK} />
      <Ellipse cx={100} cy={y + w * 0.65} rx={w * 0.5} ry={w * 0.28} fill="#FF7EA8" />
    </G>
  ) : (
    <Path d={`M${100 - w} ${y} Q100 ${y + w} ${100 + w} ${y}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
  );

const Cheeks = ({ y = 116, gap = 40, color = '#FF8FB8' }: { y?: number; gap?: number; color?: string }) => (
  <G opacity={0.7}>
    <Ellipse cx={100 - gap} cy={y} rx={9} ry={5.5} fill={color} />
    <Ellipse cx={100 + gap} cy={y} rx={9} ry={5.5} fill={color} />
  </G>
);

const Shadow = () => <Ellipse cx={100} cy={190} rx={52} ry={7} fill="#000" opacity={0.18} />;

function draw(id: BuddyId, talk: boolean): React.ReactNode {
  switch (id) {
    case 'zoomi':
      return (
        <G>
          <Shadow />
          {/* sneakers, onesie body, cream knit vest, backpack straps */}
          <Ellipse cx={80} cy={182} rx={16} ry={9} fill="#F3E6CC" />
          <Ellipse cx={120} cy={182} rx={16} ry={9} fill="#F3E6CC" />
          <Rect x={70} y={174} width={20} height={5} rx={2} fill="#2EC4B6" />
          <Rect x={110} y={174} width={20} height={5} rx={2} fill="#2EC4B6" />
          <Rect x={58} y={120} width={84} height={60} rx={28} fill="#2EC4B6" />
          <Path d="M70 128 h60 v34 q-30 12 -60 0 Z" fill="#F3E6CC" />
          <Circle cx={100} cy={138} r={3.5} fill="#8B5E3C" />
          <Circle cx={100} cy={152} r={3.5} fill="#8B5E3C" />
          <Rect x={62} y={124} width={8} height={36} rx={4} fill="#C9A26B" />
          <Rect x={130} y={124} width={8} height={36} rx={4} fill="#C9A26B" />
          {/* hood with plush horns */}
          <Path d="M52 48 q-8 -26 10 -34 q8 14 6 30 Z" fill="#2EC4B6" />
          <Path d="M148 48 q8 -26 -10 -34 q-8 14 -6 30 Z" fill="#2EC4B6" />
          <Circle cx={58} cy={30} r={3} fill="#8B5E3C" />
          <Circle cx={142} cy={30} r={3} fill="#8B5E3C" />
          <Circle cx={100} cy={86} r={58} fill="#2EC4B6" />
          {/* face */}
          <Ellipse cx={100} cy={96} rx={42} ry={40} fill="#F6D2B8" />
          {/* navy bangs and ponytail */}
          <Path d="M60 84 q8 -30 40 -28 q34 0 42 28 q-12 -10 -22 -8 q-6 -10 -14 -2 q-10 -12 -22 0 q-12 -6 -24 10 Z" fill="#23305E" />
          <Path d="M100 30 q6 -18 20 -20 q-6 10 -4 22 Z" fill="#23305E" />
          <Eyes y={100} gap={18} r={10} iris="#3BB273" />
          <Cheeks y={116} gap={30} />
          <Smile y={118} w={11} open={talk} />
        </G>
      );
    case 'roarbow':
      return (
        <G>
          <Shadow />
          <Ellipse cx={100} cy={160} rx={46} ry={32} fill="#F4B942" />
          <Ellipse cx={100} cy={166} rx={26} ry={18} fill="#FFE2A8" />
          <Ellipse cx={74} cy={186} rx={13} ry={7} fill="#E3A22F" />
          <Ellipse cx={126} cy={186} rx={13} ry={7} fill="#E3A22F" />
          {/* rainbow quiff */}
          {['#FF5A5A', '#FF9F1C', '#FFD23F', '#5ED36B', '#4CC9F0', '#9B5DE5'].map((c, i) => (
            <Path key={c} d={`M${62 + i * 4} 52 Q${100} ${4 + i * 7} ${138 - i * 4} 52`} stroke={c} strokeWidth={7} fill="none" strokeLinecap="round" />
          ))}
          <Circle cx={56} cy={62} r={14} fill="#F4B942" />
          <Circle cx={144} cy={62} r={14} fill="#F4B942" />
          <Circle cx={56} cy={62} r={7} fill="#FFE2A8" />
          <Circle cx={144} cy={62} r={7} fill="#FFE2A8" />
          <Circle cx={100} cy={96} r={50} fill="#F4B942" />
          <Ellipse cx={100} cy={118} rx={26} ry={18} fill="#FFE2A8" />
          <Path d="M92 108 h16 l-8 8 Z" fill="#8B4E2C" />
          <Eyes y={92} gap={22} r={11} iris="#8B4E2C" />
          <Cheeks y={112} gap={34} />
          <Smile y={122} w={10} open={talk} />
        </G>
      );
    case 'peely':
      return (
        <G>
          <Shadow />
          <Ellipse cx={82} cy={184} rx={13} ry={7} fill="#7E57C2" />
          <Ellipse cx={118} cy={184} rx={13} ry={7} fill="#FFD23F" />
          <Rect x={76} y={150} width={48} height={32} rx={10} fill="#2A9D8F" />
          <Rect x={66} y={126} width={68} height={36} rx={16} fill="#F5C518" />
          <Rect x={86} y={128} width={28} height={30} rx={6} fill="#FF9EC7" />
          <Rect x={86} y={136} width={28} height={5} fill="#fff" />
          <Rect x={86} y={148} width={28} height={5} fill="#fff" />
          {/* peel petals */}
          {[-36, -12, 12, 36].map((dx, i) => (
            <G key={i}>
              <Path d={`M${100 + dx * 0.6} 52 q${dx * 0.9} -40 ${dx * 0.35} -46 q-14 18 -12 46 Z`} fill="#FFD84D" />
              <Circle cx={100 + dx * 0.95} cy={8 + Math.abs(dx) * 0.2} r={6} fill="#FF7EB6" />
            </G>
          ))}
          <Rect x={96} y={2} width={8} height={10} rx={3} fill="#7A5230" />
          <Circle cx={100} cy={88} r={50} fill="#FFD84D" />
          <Ellipse cx={100} cy={98} rx={38} ry={34} fill="#FFE9C7" />
          {[66, 74, 82].map((y) => (
            <Circle key={y} cx={100} cy={y - 14} r={3} fill="#B98CFF" />
          ))}
          <Eyes y={94} gap={18} r={10} iris="#2EC4B6" />
          <Cheeks y={110} gap={28} />
          <Smile y={114} w={12} open={talk} />
        </G>
      );
    case 'mona':
      return (
        <G>
          <Shadow />
          <Rect x={64} y={124} width={72} height={58} rx={26} fill="#FFF3E0" />
          <Circle cx={80} cy={146} r={4} fill="#2EC4B6" />
          <Circle cx={116} cy={156} r={4} fill="#FFD23F" />
          <Circle cx={98} cy={168} r={4} fill="#FF7EB6" />
          <Ellipse cx={100} cy={92} rx={50} ry={46} fill="#D9A066" />
          {/* long floppy ears */}
          <Path d="M54 66 q-22 30 -6 76 q14 6 18 -6 q-4 -40 4 -62 Z" fill="#6B3E26" />
          <Path d="M146 66 q22 30 6 76 q-14 6 -18 -6 q4 -40 -4 -62 Z" fill="#6B3E26" />
          {/* beret */}
          <Ellipse cx={92} cy={50} rx={40} ry={14} fill="#E4572E" transform="rotate(-12 92 50)" />
          <Circle cx={88} cy={36} r={4} fill="#E4572E" />
          <Ellipse cx={100} cy={112} rx={28} ry={20} fill="#F3D9B1" />
          <Ellipse cx={100} cy={104} rx={9} ry={6} fill="#5A3A2A" />
          <Eyes y={86} gap={22} r={11} iris="#6B4226" />
          <Cheeks y={104} gap={34} />
          <Smile y={118} w={8} open={talk} />
        </G>
      );
    case 'kiki':
      return (
        <G>
          <Shadow />
          <Ellipse cx={84} cy={184} rx={12} ry={6} fill="#E75480" />
          <Ellipse cx={116} cy={184} rx={12} ry={6} fill="#E75480" />
          <Rect x={70} y={136} width={60} height={44} rx={18} fill="#4F7C6B" />
          <Rect x={88} y={138} width={24} height={36} fill="#FFA94D" />
          <Rect x={88} y={150} width={24} height={5} fill="#FFF3E0" />
          {[-24, -12, 0, 12, 24].map((dx) => (
            <Ellipse key={dx} cx={100 + dx} cy={30} rx={7} ry={14} fill="#7CC242" transform={`rotate(${dx} ${100 + dx} 40)`} />
          ))}
          <Ellipse cx={100} cy={92} rx={54} ry={58} fill="#8B6B3E" />
          <Ellipse cx={100} cy={100} rx={44} ry={44} fill="#A8D84E" />
          <Ellipse cx={100} cy={100} rx={30} ry={30} fill="#F4F1C9" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            return <Ellipse key={i} cx={100 + Math.cos(a) * 37} cy={100 + Math.sin(a) * 37} rx={2.4} ry={4} fill={INK} transform={`rotate(${(a * 180) / Math.PI + 90} ${100 + Math.cos(a) * 37} ${100 + Math.sin(a) * 37})`} />;
          })}
          <Eyes y={94} gap={14} r={9} />
          <Path d={talk ? 'M92 112 L108 112 L100 126 Z' : 'M92 112 Q100 122 108 112 Z'} fill="#F48FB1" />
        </G>
      );
    case 'puddle':
      return (
        <G>
          <Shadow />
          <Ellipse cx={84} cy={186} rx={13} ry={6} fill="#FF9A3C" />
          <Ellipse cx={116} cy={186} rx={13} ry={6} fill="#FF9A3C" />
          <Ellipse cx={100} cy={148} rx={46} ry={40} fill="#2B3A67" />
          <Ellipse cx={100} cy={154} rx={30} ry={30} fill="#fff" />
          <Path d="M56 136 q-16 20 -6 36 q10 -6 12 -20 Z" fill="#2B3A67" />
          <Path d="M144 136 q16 20 6 36 q-10 -6 -12 -20 Z" fill="#2B3A67" />
          <Path d="M92 34 q-2 -14 6 -18 M100 32 q0 -16 6 -20 M108 34 q4 -12 10 -12" stroke="#2B3A67" strokeWidth={5} strokeLinecap="round" fill="none" />
          <Circle cx={100} cy={82} r={50} fill="#2B3A67" />
          <Path d="M64 88 q0 -30 36 -30 q36 0 36 30 q0 34 -36 36 q-36 -2 -36 -36 Z" fill="#fff" />
          <Path d="M64 118 q36 22 72 0 l0 14 q-36 18 -72 0 Z" fill="#7FD8BE" />
          <Rect x={118} y={124} width={12} height={22} rx={5} fill="#7FD8BE" />
          <Eyes y={88} gap={18} r={11} iris="#5A3A2A" />
          <Cheeks y={104} gap={28} color="#FFA39A" />
          <Path d={talk ? 'M90 104 L110 104 L100 118 Z' : 'M90 104 L110 104 L100 112 Z'} fill="#FF9A3C" />
        </G>
      );
    case 'grumbo':
      return (
        <G>
          <Shadow />
          <Ellipse cx={100} cy={146} rx={70} ry={44} fill="#A88BD9" />
          <Ellipse cx={100} cy={156} rx={46} ry={28} fill="#FFC6D9" />
          <Rect x={50} y={170} width={22} height={18} rx={8} fill="#9479C7" />
          <Rect x={128} y={170} width={22} height={18} rx={8} fill="#9479C7" />
          <Circle cx={62} cy={46} r={9} fill="#A88BD9" />
          <Circle cx={138} cy={46} r={9} fill="#A88BD9" />
          <Ellipse cx={100} cy={80} rx={52} ry={42} fill="#A88BD9" />
          <Ellipse cx={100} cy={40} rx={30} ry={8} fill="#FFD93D" />
          <Rect x={80} y={22} width={40} height={18} rx={8} fill="#FFD93D" />
          <Circle cx={112} cy={32} r={5} fill="#fff" />
          <Circle cx={112} cy={32} r={2} fill="#FFD23F" />
          <Ellipse cx={100} cy={102} rx={46} ry={26} fill="#FFC6D9" />
          <Ellipse cx={86} cy={92} rx={4} ry={3} fill="#8E6BBF" />
          <Ellipse cx={114} cy={92} rx={4} ry={3} fill="#8E6BBF" />
          <Path d="M70 62 l18 4 M130 62 l-18 4" stroke="#6F55A3" strokeWidth={5} strokeLinecap="round" />
          <Eyes y={74} gap={20} r={8} />
          {talk ? (
            <Path d="M78 108 Q100 136 122 108 Z" fill={INK} />
          ) : (
            <Path d="M80 112 Q100 122 120 112" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          )}
          <Rect x={92} y={108} width={7} height={7} fill="#fff" />
          <Rect x={101} y={108} width={7} height={7} fill="#fff" />
        </G>
      );
    case 'bloop':
      return (
        <G>
          <Shadow />
          <Path d="M48 118 q-18 6 -14 24 q12 2 18 -10 Z" fill="#FF8A65" />
          <Path d="M152 118 q18 6 14 24 q-12 2 -18 -10 Z" fill="#FF8A65" />
          <Ellipse cx={100} cy={124} rx={54} ry={62} fill="#4FC3F7" />
          <Path d="M58 150 q42 26 84 0 l0 18 q-42 22 -84 0 Z" fill="#FF8A65" />
          <Circle cx={88} cy={162} r={3} fill="#FFD54F" />
          <Circle cx={112} cy={162} r={3} fill="#FFD54F" />
          <Path d="M58 74 q42 -46 84 0 Z" fill="#F48FB1" />
          <Rect x={58} y={68} width={84} height={10} rx={5} fill="#B39DDB" />
          <Circle cx={100} cy={40} r={9} fill="#B39DDB" />
          <Eyes y={96} gap={20} r={14} />
          <Smile y={128} w={talk ? 22 : 14} open={talk} />
        </G>
      );
    case 'fuzzle':
      return (
        <G>
          <Shadow />
          <Path d="M50 120 q-34 10 -30 40" stroke="#FF9E8A" strokeWidth={8} fill="none" strokeLinecap="round" />
          <Path d="M150 120 q34 10 30 40" stroke="#FF9E8A" strokeWidth={8} fill="none" strokeLinecap="round" />
          <Rect x={76} y={164} width={48} height={20} rx={8} fill="#2B3A67" />
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i / 18) * Math.PI * 2;
            return <Circle key={i} cx={100 + Math.cos(a) * 54} cy={112 + Math.sin(a) * 54} r={14} fill="#A7D8F0" />;
          })}
          <Circle cx={100} cy={112} r={56} fill="#A7D8F0" />
          <Rect x={52} y={60} width={96} height={16} rx={8} fill="#FFA94D" />
          {['#F48FB1', '#2EC4B6', '#FFD23F', '#B39DDB', '#F48FB1'].map((c, i) => (
            <Circle key={i} cx={62 + i * 19} cy={54} r={8} fill={c} />
          ))}
          <Eyes y={104} gap={20} r={12} />
          {talk ? (
            <G>
              <Path d="M84 124 Q100 146 116 124 Z" fill={INK} />
              <Ellipse cx={100} cy={140} rx={8} ry={10} fill="#FF7EA8" />
            </G>
          ) : (
            <Smile y={128} w={12} />
          )}
        </G>
      );
    case 'bobble':
      return (
        <G>
          <Shadow />
          <Ellipse cx={84} cy={184} rx={12} ry={6} fill="#F8BBD0" />
          <Ellipse cx={116} cy={184} rx={12} ry={6} fill="#F8BBD0" />
          <Rect x={62} y={128} width={76} height={54} rx={24} fill="#8A9A5B" />
          <Rect x={98} y={130} width={4} height={48} fill="#C5CFA0" />
          <Line2 x1={80} y1={30} x2={72} y2={10} />
          <Line2 x1={120} y1={30} x2={128} y2={10} />
          <Circle cx={72} cy={10} r={7} fill="#FFA94D" />
          <Circle cx={128} cy={10} r={7} fill="#FFA94D" />
          <Circle cx={100} cy={86} r={58} fill="#FFA94D" />
          {[0, 1, 2, 3].map((i) => (
            <Path key={i} d={`M${46 + i * 3} ${60 + i * 12} Q100 ${40 + i * 12} ${154 - i * 3} ${60 + i * 12}`} stroke="#7FD8A6" strokeWidth={6} fill="none" />
          ))}
          <Circle cx={100} cy={26} r={9} fill="#7FD8A6" />
          <Circle cx={100} cy={100} r={44} fill="#7FD8A6" />
          <Circle cx={72} cy={112} r={3} fill="#5DBB88" />
          <Circle cx={130} cy={92} r={3} fill="#5DBB88" />
          <Eyes y={96} gap={17} r={11} />
          <Smile y={120} w={12} open={talk} />
          {[['#F48FB1', 26, 120], ['#2EC4B6', 174, 104], ['#FFD23F', 168, 156]].map(([c, x, y]) => (
            <Circle key={String(c)} cx={Number(x)} cy={Number(y)} r={11} fill={String(c)} />
          ))}
        </G>
      );
    case 'snoozle':
      return (
        <G>
          <Shadow />
          <Rect x={56} y={122} width={88} height={62} rx={28} fill="#26A69A" />
          {[0, 1, 2].map((i) => (
            <Rect key={i} x={56} y={132 + i * 16} width={88} height={7} fill="#FFF3E0" />
          ))}
          <Rect x={84} y={156} width={32} height={18} rx={6} fill="#FF7F50" />
          <Circle cx={100} cy={92} r={54} fill="#FFC7A8" />
          <Path d="M46 82 q54 -76 108 0 Z" fill="#FF7F50" />
          {[0, 1].map((i) => (
            <Path key={i} d={`M${52 + i * 4} ${66 + i * 10} Q100 ${26 + i * 10} ${148 - i * 4} ${66 + i * 10}`} stroke="#26A69A" strokeWidth={6} fill="none" />
          ))}
          <Circle cx={100} cy={26} r={10} fill="#26A69A" />
          <Eyes y={100} gap={20} sleepy />
          <Cheeks y={114} gap={32} />
          {talk ? <Ellipse cx={100} cy={128} rx={12} ry={16} fill={INK} /> : <Ellipse cx={100} cy={126} rx={6} ry={5} fill={INK} />}
        </G>
      );
    case 'nibbles':
      return (
        <G>
          <Shadow />
          <Circle cx={60} cy={60} r={14} fill="#F3D9A4" />
          <Circle cx={140} cy={60} r={14} fill="#F3D9A4" />
          <Circle cx={60} cy={60} r={7} fill="#FFB6C8" />
          <Circle cx={140} cy={60} r={7} fill="#FFB6C8" />
          <Ellipse cx={100} cy={118} rx={62} ry={66} fill="#F3D9A4" />
          <Ellipse cx={100} cy={140} rx={40} ry={36} fill="#FFF3DC" />
          <Ellipse cx={62} cy={118} rx={20} ry={16} fill="#FFE7BD" />
          <Ellipse cx={138} cy={118} rx={20} ry={16} fill="#FFE7BD" />
          <Eyes y={96} gap={22} r={11} />
          <Ellipse cx={100} cy={112} rx={6} ry={4.5} fill="#FF8FB8" />
          <Smile y={120} w={8} open={talk} />
          <Ellipse cx={84} cy={172} rx={9} ry={6} fill="#FFB6C8" />
          <Ellipse cx={116} cy={172} rx={9} ry={6} fill="#FFB6C8" />
        </G>
      );
    case 'pinky':
      return (
        <G>
          <Shadow />
          <Ellipse cx={100} cy={150} rx={48} ry={36} fill="#FFAFC8" />
          <Path d="M60 54 l-8 -24 l24 12 Z M140 54 l8 -24 l-24 12 Z" fill="#FF8FB1" />
          <Circle cx={100} cy={94} r={52} fill="#FFAFC8" />
          {['#FF5A5A', '#FFD23F', '#5ED36B', '#4CC9F0', '#9B5DE5'].map((c, i) => (
            <Path key={c} d={`M${54 + i * 2} ${66 - i * 6} Q100 ${16 - i * 4} ${146 - i * 2} ${66 - i * 6}`} stroke={c} strokeWidth={7} fill="none" />
          ))}
          <Ellipse cx={100} cy={116} rx={20} ry={14} fill="#FF8FB1" />
          <Ellipse cx={93} cy={116} rx={3.5} ry={5} fill="#C2577A" />
          <Ellipse cx={107} cy={116} rx={3.5} ry={5} fill="#C2577A" />
          <Eyes y={90} gap={20} r={9} />
          <Circle cx={80} cy={92} r={14} stroke={INK} strokeWidth={3} fill="none" />
          <Circle cx={120} cy={92} r={14} stroke={INK} strokeWidth={3} fill="none" />
          <Path d="M94 92 h12" stroke={INK} strokeWidth={3} />
          <Smile y={134} w={9} open={talk} />
        </G>
      );
    case 'rio':
      return (
        <G>
          <Shadow />
          {['#FF5A5A', '#FF9F1C', '#FFD23F', '#5ED36B', '#4CC9F0', '#9B5DE5'].map((c, i) => (
            <Ellipse key={c} cx={70 + i * 12} cy={42 - Math.sin((i / 5) * Math.PI) * 14} rx={7} ry={22} fill={c} transform={`rotate(${-30 + i * 12} ${70 + i * 12} 60)`} />
          ))}
          <Ellipse cx={100} cy={116} rx={58} ry={64} fill="#FFFFFF" stroke="#DDE3F0" strokeWidth={3} />
          <Path d="M44 118 q-24 10 -18 34 q20 -4 26 -18 Z" fill="#F1F4FA" />
          <Path d="M156 118 q24 10 18 34 q-20 -4 -26 -18 Z" fill="#F1F4FA" />
          <Eyes y={98} gap={20} r={11} />
          <Path d={talk ? 'M88 116 L112 116 L100 132 Z' : 'M88 116 L112 116 L100 126 Z'} fill="#FF9F1C" />
          <Cheeks y={118} gap={32} />
          <Ellipse cx={86} cy={182} rx={8} ry={5} fill="#FF9F1C" />
          <Ellipse cx={114} cy={182} rx={8} ry={5} fill="#FF9F1C" />
        </G>
      );
    case 'brocco':
      return (
        <G>
          <Shadow />
          <Path d="M84 180 v-20 M116 180 v-20" stroke="#3E8E41" strokeWidth={8} strokeLinecap="round" />
          <Rect x={72} y={110} width={56} height={58} rx={20} fill="#7BC67E" />
          <Path d="M72 130 q-22 6 -26 22 M128 130 q22 6 26 22" stroke="#7BC67E" strokeWidth={8} strokeLinecap="round" fill="none" />
          {[[60, 62], [84, 40], [116, 40], [140, 62], [72, 88], [128, 88], [100, 30], [100, 70]].map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={30} fill={i % 2 ? '#43A047' : '#4CAF50'} />
          ))}
          <Ellipse cx={100} cy={108} rx={38} ry={30} fill="#A5D6A7" />
          <Rect x={66} y={92} width={30} height={18} rx={8} fill="#FF9F1C" />
          <Rect x={104} y={92} width={30} height={18} rx={8} fill="#FF9F1C" />
          <Path d="M96 100 h8" stroke={INK} strokeWidth={4} />
          <Smile y={122} w={11} open={talk} />
        </G>
      );
  }
}

const Line2 = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <Path d={`M${x1} ${y1} L${x2} ${y2}`} stroke="#FFA94D" strokeWidth={5} strokeLinecap="round" />
);

/**
 * A ZoomikoKids character. Bobs gently; when `talking` the mouth opens. `onPress` gives a squish.
 */
export function Buddy({
  id,
  size = 140,
  talking = false,
  still = false,
  onPress,
}: {
  id: BuddyId;
  size?: number;
  talking?: boolean;
  still?: boolean;
  onPress?: () => void;
}) {
  const bob = useRef(new Animated.Value(0)).current;
  const squish = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (still) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: -6, duration: 900 + Math.random() * 300, useNativeDriver: ND }),
        Animated.timing(bob, { toValue: 0, duration: 900 + Math.random() * 300, useNativeDriver: ND }),
      ]),
    );
    a.start();
    return () => a.stop();
  }, [bob, still]);

  const press = () => {
    squish.setValue(0.85);
    Animated.spring(squish, { toValue: 1, friction: 3, tension: 160, useNativeDriver: ND }).start();
    onPress?.();
  };

  const svg = (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {draw(id, talking)}
    </Svg>
  );

  return (
    <Animated.View style={{ transform: [{ translateY: bob }, { scale: squish }] }}>
      {onPress ? (
        <Pressable onPress={press} accessibilityRole="button" accessibilityLabel={CAST[id].name}>
          {svg}
        </Pressable>
      ) : (
        svg
      )}
    </Animated.View>
  );
}
