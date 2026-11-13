import { Platform } from 'react-native';

/** Warm paper world; coral is the child's side, teal the grown-up's. */
export const C = {
  paper: '#FFF7EC',
  card: '#FFFFFF',
  ink: '#2A2440',
  sub: '#6E6884',
  line: '#EADFCB',
  kid: '#FF7A59',
  kidSoft: '#FFE3D9',
  grown: '#1FA3A3',
  grownSoft: '#D6F1EF',
  sun: '#FFC93C',
  sunDark: '#D9A21F',
  yes: '#3BB273',
};

export type Side = 'kid' | 'grown';
export const SIDE = {
  kid: { color: C.kid, soft: C.kidSoft, emoji: '🧒', name: 'Kid' },
  grown: { color: C.grown, soft: C.grownSoft, emoji: '🧑', name: 'Grown-up' },
} as const;

export const ND = Platform.OS !== 'web';
export const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
