import { Platform } from 'react-native';

export const C = {
  bg: '#160F35',
  bg2: '#211852',
  card: '#2E2370',
  cardHi: '#3D2F92',
  line: '#4A3DA8',
  text: '#FFFFFF',
  sub: '#C9C3F5',
  dim: '#8A82C4',
  yes: '#2DD881',
  yesDark: '#1A9E5C',
  no: '#FF5A6E',
  noDark: '#C2364A',
  gold: '#FFD23F',
  goldDark: '#C99A00',
  pip: '#5EE6C8',
  pipDark: '#2BB59A',
  ink: '#1B1440',
  white: '#FFFFFF',
};

export const R = { s: 12, m: 20, l: 28, xl: 40 };

/** Native driver is unavailable on web; avoid the warning there. */
export const ND = Platform.OS !== 'web';
