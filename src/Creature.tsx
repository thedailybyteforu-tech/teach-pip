import React from 'react';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';
import { pick } from './theme';

/** A describable little creature. Every feature is something a child can put into words. */
export interface Critter {
  color: 0 | 1 | 2 | 3;
  shape: 'round' | 'square' | 'tall';
  eyes: 1 | 2 | 3;
  hat: 'none' | 'party' | 'bow';
  spots: boolean;
}

export const COLORS = ['#FF7A59', '#35B8C4', '#FFC93C', '#9B6BDF'];
export const COLOR_NAMES = ['orange', 'blue', 'yellow', 'purple'];
const INK = '#2A2440';

export const critterKey = (c: Critter) => `${c.color}${c.shape}${c.eyes}${c.hat}${c.spots ? 1 : 0}`;

export function randomCritter(): Critter {
  return {
    color: pick([0, 1, 2, 3] as const),
    shape: pick(['round', 'square', 'tall'] as const),
    eyes: pick([1, 2, 3] as const),
    hat: pick(['none', 'party', 'bow'] as const),
    spots: Math.random() < 0.5,
  };
}

/** A look-alike that differs from `c` in exactly `n` features, so describing has to be precise. */
export function lookAlike(c: Critter, n: number): Critter {
  const out = { ...c };
  const keys = (['color', 'shape', 'eyes', 'hat', 'spots'] as const).slice().sort(() => Math.random() - 0.5).slice(0, n);
  for (const k of keys) {
    if (k === 'color') out.color = pick(([0, 1, 2, 3] as const).filter((v) => v !== c.color));
    if (k === 'shape') out.shape = pick((['round', 'square', 'tall'] as const).filter((v) => v !== c.shape));
    if (k === 'eyes') out.eyes = pick(([1, 2, 3] as const).filter((v) => v !== c.eyes));
    if (k === 'hat') out.hat = pick((['none', 'party', 'bow'] as const).filter((v) => v !== c.hat));
    if (k === 'spots') out.spots = !c.spots;
  }
  return out;
}

export function Creature({ c, size = 90 }: { c: Critter; size?: number }) {
  const fill = COLORS[c.color];
  const eyeX = c.eyes === 1 ? [50] : c.eyes === 2 ? [38, 62] : [30, 50, 70];
  const top = c.shape === 'tall' ? 24 : 34;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Ellipse cx={36} cy={93} rx={9} ry={5} fill={INK} opacity={0.7} />
      <Ellipse cx={64} cy={93} rx={9} ry={5} fill={INK} opacity={0.7} />
      {c.shape === 'round' && <Circle cx={50} cy={60} r={32} fill={fill} />}
      {c.shape === 'square' && <Rect x={18} y={30} width={64} height={60} rx={10} fill={fill} />}
      {c.shape === 'tall' && <Ellipse cx={50} cy={57} rx={24} ry={36} fill={fill} />}
      {c.spots && (
        <>
          <Circle cx={34} cy={76} r={5} fill="#fff" opacity={0.75} />
          <Circle cx={66} cy={72} r={4} fill="#fff" opacity={0.75} />
          <Circle cx={52} cy={84} r={3.5} fill="#fff" opacity={0.75} />
        </>
      )}
      {eyeX.map((x) => (
        <React.Fragment key={x}>
          <Circle cx={x} cy={52} r={7.5} fill="#fff" />
          <Circle cx={x + 1} cy={53} r={3.6} fill={INK} />
        </React.Fragment>
      ))}
      <Path d="M40 67 Q50 76 60 67" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {c.hat === 'party' && (
        <>
          <Polygon points={`50,${top - 24} 36,${top + 2} 64,${top + 2}`} fill="#3BB273" />
          <Circle cx={50} cy={top - 24} r={4} fill="#fff" />
        </>
      )}
      {c.hat === 'bow' && (
        <>
          <Polygon points={`50,${top - 4} 34,${top - 14} 34,${top + 6}`} fill="#E84A8A" />
          <Polygon points={`50,${top - 4} 66,${top - 14} 66,${top + 6}`} fill="#E84A8A" />
          <Circle cx={50} cy={top - 4} r={4} fill="#C2356E" />
        </>
      )}
    </Svg>
  );
}
