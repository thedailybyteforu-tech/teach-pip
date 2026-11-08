/**
 * Letter shapes for finger tracing, in a 100 x 100 box. Each letter is a list of strokes in the
 * order a child is taught to write them; each stroke is a list of points.
 */
export type Pt = [number, number];
export type Stroke = Pt[];

/** Points along an ellipse arc, angles in degrees (0 = right, 90 = down). Goes from a0 to a1. */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number): Pt[] {
  const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 12));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });
}

export const LETTERS: Record<string, Stroke[]> = {
  A: [[[50, 8], [16, 92]], [[50, 8], [84, 92]], [[30, 62], [70, 62]]],
  B: [[[26, 8], [26, 92]], [[26, 8], ...arc(56, 29, 22, 21, -90, 90), [26, 50]], [[26, 50], ...arc(58, 71, 24, 21, -90, 90), [26, 92]]],
  C: [arc(56, 50, 38, 42, -45, -315)],
  D: [[[26, 8], [26, 92]], [[26, 8], ...arc(40, 50, 40, 42, -90, 90), [26, 92]]],
  E: [[[74, 8], [26, 8], [26, 92], [74, 92]], [[26, 50], [64, 50]]],
  F: [[[74, 8], [26, 8], [26, 92]], [[26, 50], [64, 50]]],
  G: [[...arc(54, 50, 38, 42, -45, -360)], [[64, 52], [92, 52], [92, 76]]],
  H: [[[24, 8], [24, 92]], [[76, 8], [76, 92]], [[24, 50], [76, 50]]],
  I: [[[50, 8], [50, 92]], [[30, 8], [70, 8]], [[30, 92], [70, 92]]],
  J: [[[70, 8], [70, 68], ...arc(48, 68, 22, 24, 0, 180)]],
  K: [[[26, 8], [26, 92]], [[76, 8], [26, 56]], [[42, 42], [78, 92]]],
  L: [[[28, 8], [28, 92], [76, 92]]],
  M: [[[16, 92], [16, 8], [50, 62], [84, 8], [84, 92]]],
  N: [[[24, 92], [24, 8], [76, 92], [76, 8]]],
  O: [arc(50, 50, 36, 42, -90, 270)],
  P: [[[26, 92], [26, 8]], [[26, 8], ...arc(52, 29, 24, 21, -90, 90), [26, 50]]],
  Q: [arc(50, 48, 36, 40, -90, 270), [[58, 68], [84, 94]]],
  R: [[[26, 92], [26, 8]], [[26, 8], ...arc(52, 29, 24, 21, -90, 90), [26, 50]], [[46, 50], [78, 92]]],
  S: [[...arc(50, 29, 24, 21, -20, -270), ...arc(50, 71, 26, 21, -90, 160)]],
  T: [[[18, 8], [82, 8]], [[50, 8], [50, 92]]],
  U: [[[24, 8], [24, 64], ...arc(50, 64, 26, 28, 180, 0), [76, 8]]],
  V: [[[16, 8], [50, 92], [84, 8]]],
  W: [[[8, 8], [28, 92], [50, 34], [72, 92], [92, 8]]],
  X: [[[20, 8], [80, 92]], [[80, 8], [20, 92]]],
  Y: [[[18, 8], [50, 50]], [[82, 8], [50, 50], [50, 92]]],
  Z: [[[20, 8], [80, 8], [20, 92], [80, 92]]],
};

export const ALPHABET = Object.keys(LETTERS);

/** Word, picture and the character who cheers for each letter. */
export const LETTER_WORDS: Record<string, [string, string]> = {
  A: ['Apple', '🍎'], B: ['Banana', '🍌'], C: ['Cat', '🐱'], D: ['Duck', '🦆'], E: ['Egg', '🥚'],
  F: ['Frog', '🐸'], G: ['Grapes', '🍇'], H: ['Hippo', '🦛'], I: ['Ice cream', '🍦'], J: ['Juice', '🧃'],
  K: ['Kiwi', '🥝'], L: ['Lion', '🦁'], M: ['Moon', '🌙'], N: ['Nose', '👃'], O: ['Octopus', '🐙'],
  P: ['Penguin', '🐧'], Q: ['Queen', '👑'], R: ['Rainbow', '🌈'], S: ['Sun', '☀️'], T: ['Tiger', '🐯'],
  U: ['Umbrella', '☂️'], V: ['Violin', '🎻'], W: ['Whale', '🐋'], X: ['Xylophone', '🎼'], Y: ['Yo-yo', '🪀'],
  Z: ['Zebra', '🦓'],
};

/** Resample a stroke into evenly spaced checkpoints the finger must pass, in order. */
export function checkpoints(stroke: Stroke, step = 6): Pt[] {
  const out: Pt[] = [stroke[0]];
  for (let i = 1; i < stroke.length; i++) {
    const [x0, y0] = stroke[i - 1];
    const [x1, y1] = stroke[i];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 1; k <= n; k++) out.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
  }
  return out;
}

export const toPath = (pts: Pt[], s = 1) =>
  pts.map(([x, y], i) => `${i ? 'L' : 'M'}${(x * s).toFixed(1)} ${(y * s).toFixed(1)}`).join(' ');
