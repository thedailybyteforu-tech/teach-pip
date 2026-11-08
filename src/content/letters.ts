import type { Concept, Option } from '../types';
import { buildQuestion, pick } from '../lib/random';

const WORDS: Record<string, { e: string; w: string }> = {
  A: { e: '🍎', w: 'Apple' },
  B: { e: '🐻', w: 'Bear' },
  C: { e: '🐱', w: 'Cat' },
  D: { e: '🐶', w: 'Dog' },
  E: { e: '🥚', w: 'Egg' },
  F: { e: '🐟', w: 'Fish' },
  G: { e: '🍇', w: 'Grapes' },
  H: { e: '🎩', w: 'Hat' },
  I: { e: '🍦', w: 'Ice cream' },
  J: { e: '🧃', w: 'Juice' },
  K: { e: '🪁', w: 'Kite' },
  L: { e: '🦁', w: 'Lion' },
  M: { e: '🌙', w: 'Moon' },
  N: { e: '👃', w: 'Nose' },
  O: { e: '🐙', w: 'Octopus' },
  P: { e: '🐷', w: 'Pig' },
  Q: { e: '👑', w: 'Queen' },
  R: { e: '🌈', w: 'Rainbow' },
  S: { e: '☀️', w: 'Sun' },
  T: { e: '🐯', w: 'Tiger' },
  U: { e: '☂️', w: 'Umbrella' },
  V: { e: '🎻', w: 'Violin' },
  W: { e: '🐋', w: 'Whale' },
  Y: { e: '🪀', w: 'Yo-yo' },
  Z: { e: '🦓', w: 'Zebra' },
};

/** Letters children (and Pip) really do mix up because they look or sound alike. */
const LOOKALIKE: Record<string, string> = {
  B: 'D', D: 'B', P: 'Q', Q: 'O', O: 'Q', M: 'N', N: 'M', E: 'F', F: 'E',
  C: 'G', G: 'C', U: 'V', V: 'U', W: 'M', I: 'L', L: 'I', K: 'C', S: 'Z', Z: 'S',
  H: 'A', A: 'H', T: 'D', R: 'P', J: 'G', Y: 'U',
};

const ALL = Object.keys(WORDS);
const letter = (L: string): Option => ({ id: L, label: `${L}${L.toLowerCase()}`, speak: L });

function firstLetter(group: string[]) {
  return () => {
    const L = pick(group);
    const { e, w } = WORDS[L];
    const wrongL = LOOKALIKE[L] ?? pick(ALL.filter((x) => x !== L));
    return buildQuestion({
      prompt: `What letter does ${w} start with?`,
      visual: { kind: 'big', text: e },
      correct: letter(L),
      wrong: letter(wrongL),
      extras: [...group, ...ALL].filter((x) => x !== L).map(letter),
      fact: `${w} starts with ${L}! ${L} is for ${w}.`,
    });
  };
}

export const letterConcepts: Concept[] = [
  { id: 'abc-1', subject: 'letters', title: 'Letters A to F', emoji: '🍎', make: firstLetter(['A', 'B', 'C', 'D', 'E', 'F']) },
  { id: 'abc-2', subject: 'letters', title: 'Letters G to M', emoji: '🍇', make: firstLetter(['G', 'H', 'I', 'J', 'K', 'L', 'M']) },
  { id: 'abc-3', subject: 'letters', title: 'Letters N to S', emoji: '🐙', make: firstLetter(['N', 'O', 'P', 'Q', 'R', 'S']) },
  { id: 'abc-4', subject: 'letters', title: 'Letters T to Z', emoji: '🦓', make: firstLetter(['T', 'U', 'V', 'W', 'Y', 'Z']) },
];
