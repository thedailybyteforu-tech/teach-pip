import type { Concept, Option } from '../types';
import { buildQuestion, pick } from '../lib/random';

export const PALETTE: Record<string, string> = {
  red: '#FF3B3B',
  blue: '#2F7BFF',
  yellow: '#FFD60A',
  green: '#22C55E',
  orange: '#FF8C1A',
  purple: '#9B5DE5',
  pink: '#FF7EB6',
  brown: '#8B5A2B',
  white: '#FFFFFF',
};

const CONFUSE: Record<string, string> = {
  red: 'pink',
  pink: 'purple',
  blue: 'purple',
  purple: 'blue',
  yellow: 'orange',
  orange: 'red',
  green: 'blue',
  brown: 'orange',
};

const swatch = (name: string, hideLabel = false): Option => ({
  id: name,
  label: name,
  hideLabel,
  visual: { kind: 'swatch', color: PALETTE[name] },
});

const BASIC = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
const NAMED = [...BASIC, 'pink', 'brown'];

function findColor() {
  const target = pick(BASIC);
  return buildQuestion({
    prompt: `Which one is ${target}?`,
    correct: swatch(target, true),
    wrong: swatch(CONFUSE[target], true),
    extras: BASIC.map((c) => swatch(c, true)),
    fact: `This one is ${target}! What a lovely ${target}.`,
  });
}

const THINGS = [
  { e: '🍌', w: 'banana', c: 'yellow' },
  { e: '🍓', w: 'strawberry', c: 'red' },
  { e: '🐸', w: 'frog', c: 'green' },
  { e: '🍆', w: 'eggplant', c: 'purple' },
  { e: '🥕', w: 'carrot', c: 'orange' },
  { e: '🫐', w: 'blueberry', c: 'blue' },
  { e: '🐷', w: 'pig', c: 'pink' },
  { e: '🍫', w: 'chocolate bar', c: 'brown' },
  { e: '🍋', w: 'lemon', c: 'yellow' },
  { e: '🥦', w: 'broccoli', c: 'green' },
];

function colorOfThing() {
  const t = pick(THINGS);
  return buildQuestion({
    prompt: `What color is a ${t.w}?`,
    visual: { kind: 'big', text: t.e },
    correct: swatch(t.c),
    wrong: swatch(CONFUSE[t.c]),
    extras: NAMED.map((c) => swatch(c)),
    fact: `A ${t.w} is ${t.c}!`,
  });
}

const MIXES = [
  { a: 'red', b: 'yellow', c: 'orange' },
  { a: 'blue', b: 'yellow', c: 'green' },
  { a: 'red', b: 'blue', c: 'purple' },
  { a: 'red', b: 'white', c: 'pink' },
];

function mixing() {
  const m = pick(MIXES);
  // Common misconception: "the stronger colour wins", so the mix stays one of its parents.
  const wrong = m.a === 'white' ? m.b : m.b === 'white' ? m.a : pick([m.a, m.b]);
  return buildQuestion({
    prompt: `What color do ${m.a} and ${m.b} make together?`,
    visual: { kind: 'mix', a: PALETTE[m.a], b: PALETTE[m.b] },
    correct: swatch(m.c),
    wrong: swatch(wrong),
    extras: ['orange', 'green', 'purple', 'pink', 'brown'].map((c) => swatch(c)),
    fact: `${m.a} and ${m.b} make ${m.c}! Like magic!`,
  });
}

export const colorConcepts: Concept[] = [
  { id: 'color-find', subject: 'colors', title: 'Spot the color', emoji: '🎨', make: findColor },
  { id: 'color-things', subject: 'colors', title: 'Colors of things', emoji: '🍓', make: colorOfThing },
  { id: 'color-mix', subject: 'colors', title: 'Magic mixing', emoji: '🧪', make: mixing },
];
