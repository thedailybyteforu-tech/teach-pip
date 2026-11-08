import type { ConceptMemory, Subject } from '../types';
import { ALL_CONCEPTS, getConcept } from '../content';

const DAY = 24 * 60 * 60 * 1000;

/** Below this, Pip says it is forgetting and asks to be taught again. */
export const FADING = 0.5;

/**
 * How much Pip still remembers, from 0 to 1, using an exponential forgetting curve.
 * This is the hidden spaced-repetition schedule: the child just sees Pip forgetting.
 */
export function retention(m: ConceptMemory | undefined, now = Date.now()): number {
  if (!m || m.taught === 0) return 0;
  return Math.exp(-(now - m.last) / (m.stability * DAY));
}

/**
 * Update a memory after a lesson. `quality` is the share of rounds the child got right (0..1).
 * Re-teaching something Pip had nearly forgotten strengthens it most, as in real spacing.
 */
export function reinforce(m: ConceptMemory | undefined, quality: number, now = Date.now()): ConceptMemory {
  if (!m || m.taught === 0) {
    return { stability: 0.5 + quality, last: now, taught: 1 };
  }
  const r = retention(m, now);
  const growth = 1 + quality * (0.4 + 1.6 * (1 - r));
  return { stability: Math.min(m.stability * growth, 180), last: now, taught: m.taught + 1 };
}

export function isUnlocked(subject: Subject, index: number, memory: Record<string, ConceptMemory>): boolean {
  if (index === 0) return true;
  return (memory[subject.concepts[index - 1].id]?.taught ?? 0) > 0;
}

/** The taught concept Pip is forgetting most, if any is below the fading line. */
export function mostFaded(memory: Record<string, ConceptMemory>, exclude?: string, now = Date.now()) {
  let best: { id: string; r: number } | null = null;
  for (const c of ALL_CONCEPTS) {
    if (c.id === exclude) continue;
    const m = memory[c.id];
    if (!m) continue;
    const r = retention(m, now);
    if (r < FADING && (!best || r < best.r)) best = { id: c.id, r };
  }
  return best ? getConcept(best.id) ?? null : null;
}

export function moon(r: number, taught: boolean): string {
  if (!taught) return '✨';
  if (r >= 0.8) return '🌕';
  if (r >= 0.5) return '🌔';
  if (r >= 0.25) return '🌓';
  return '🌒';
}

/** Pip evolves as the child teaches it more. XP never decays, so evolution is never lost. */
export const STAGES = [
  { xp: 0, name: 'Baby Pip' },
  { xp: 12, name: 'Curious Pip' },
  { xp: 35, name: 'Clever Pip' },
  { xp: 80, name: 'Genius Pip' },
];

export function stageFor(xp: number): number {
  let s = 0;
  STAGES.forEach((st, i) => {
    if (xp >= st.xp) s = i;
  });
  return s;
}
