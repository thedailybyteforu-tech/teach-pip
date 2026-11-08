import type { Concept, Option } from '../types';
import { buildQuestion, pick, randInt } from '../lib/random';

const THINGS = [
  { e: '🍎', one: 'apple', many: 'apples' },
  { e: '⭐', one: 'star', many: 'stars' },
  { e: '🐟', one: 'fish', many: 'fish' },
  { e: '🚀', one: 'rocket', many: 'rockets' },
  { e: '🍪', one: 'cookie', many: 'cookies' },
  { e: '🌸', one: 'flower', many: 'flowers' },
  { e: '🐞', one: 'ladybug', many: 'ladybugs' },
  { e: '🎈', one: 'balloon', many: 'balloons' },
  { e: '🐥', one: 'chick', many: 'chicks' },
] as const;

const num = (n: number): Option => ({ id: String(n), label: String(n) });
const name = (t: (typeof THINGS)[number], n: number) => (n === 1 ? t.one : t.many);
const repeat = (e: string, n: number) => Array.from({ length: n }, () => e);

/** Distractor numbers near the answer, so the choice is about counting, not guessing. */
function near(answer: number, lo: number, hi: number): Option[] {
  const out: Option[] = [];
  for (const d of [-2, -1, 1, 2, 3]) {
    const n = answer + d;
    if (n >= lo && n <= hi) out.push(num(n));
  }
  return out;
}

/** A plausible wrong count: Pip counted one twice, or skipped one. */
function offByOne(n: number, lo: number): number {
  if (n <= lo) return n + 1;
  return pick([n + 1, n - 1]);
}

function counting(lo: number, hi: number) {
  return () => {
    const t = pick(THINGS);
    const n = randInt(lo, hi);
    return buildQuestion({
      prompt: `How many ${t.many} are there?`,
      visual: { kind: 'emoji', items: repeat(t.e, n) },
      correct: num(n),
      wrong: num(offByOne(n, 1)),
      extras: near(n, 1, 12),
      fact: `I count ${n}! There are ${n} ${name(t, n)}.`,
    });
  };
}

function adding(max: number) {
  return () => {
    const t = pick(THINGS);
    const a = randInt(1, max - 1);
    const b = randInt(1, max - a);
    const sum = a + b;
    return buildQuestion({
      prompt: `${a} ${name(t, a)} and ${b} more. How many altogether?`,
      visual: { kind: 'sum', a: repeat(t.e, a), b: repeat(t.e, b), op: '+' },
      correct: num(sum),
      // Classic slip: counting the last item of the first group twice.
      wrong: num(sum + 1),
      extras: near(sum, 1, 12),
      fact: `${a} plus ${b} makes ${sum}!`,
    });
  };
}

function takingAway(max: number) {
  return () => {
    const t = pick(THINGS);
    const a = randInt(2, max);
    const b = randInt(1, a - 1);
    const left = a - b;
    // Two real misconceptions: adding instead of taking away, or forgetting to take any away.
    const wrong = Math.random() < 0.5 ? a + b : a;
    return buildQuestion({
      prompt: `${a} ${name(t, a)}. ${b} go away. How many are left?`,
      visual: { kind: 'sum', a: repeat(t.e, a), b: repeat(t.e, b), op: '-' },
      correct: num(left),
      wrong: num(wrong),
      extras: near(left, 0, 12),
      fact: `${a} take away ${b} leaves ${left}!`,
    });
  };
}

function bigger() {
  const a = randInt(1, 10);
  let b = randInt(1, 10);
  while (b === a) b = randInt(1, 10);
  const big = Math.max(a, b);
  const small = Math.min(a, b);
  return buildQuestion({
    prompt: `Which number is bigger, ${a} or ${b}?`,
    correct: num(big),
    wrong: num(small),
    extras: [],
    count: 2,
    fact: `${big} is bigger than ${small}!`,
  });
}

export const numberConcepts: Concept[] = [
  { id: 'num-count-5', subject: 'numbers', title: 'Counting to 5', emoji: '🖐️', make: counting(1, 5) },
  { id: 'num-count-10', subject: 'numbers', title: 'Counting to 10', emoji: '🔟', make: counting(6, 10) },
  { id: 'num-bigger', subject: 'numbers', title: 'Bigger numbers', emoji: '🐘', make: bigger },
  { id: 'num-add-5', subject: 'numbers', title: 'Adding to 5', emoji: '➕', make: adding(5) },
  { id: 'num-sub-5', subject: 'numbers', title: 'Taking away', emoji: '➖', make: takingAway(5) },
  { id: 'num-add-10', subject: 'numbers', title: 'Adding to 10', emoji: '🧮', make: adding(10) },
];
