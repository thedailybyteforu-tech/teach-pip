import type { Option, Question, Visual } from '../types';

/** "a" or "an" for a word, so Pip never says "a owl". */
export const an = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');
export const An = (word: string) => (/^[aeiou]/i.test(word) ? 'An' : 'A');

export const randInt = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Assemble a question from the right answer, Pip's likely wrong answer, and a pool of
 * extra distractors. Always contains both the correct and the wrong option.
 */
export function buildQuestion(p: {
  prompt: string;
  visual?: Visual;
  correct: Option;
  wrong: Option;
  extras: Option[];
  fact: string;
  count?: number;
}): Question {
  const count = p.count ?? 3;
  const seen = new Set([p.correct.id, p.wrong.id]);
  const chosen = [p.correct, p.wrong];
  for (const o of shuffle(p.extras)) {
    if (chosen.length >= count) break;
    if (seen.has(o.id)) continue;
    seen.add(o.id);
    chosen.push(o);
  }
  return {
    prompt: p.prompt,
    visual: p.visual,
    options: shuffle(chosen),
    correctId: p.correct.id,
    wrongId: p.wrong.id,
    fact: p.fact,
  };
}
