import type { ConceptMemory, Question } from '../types';
import { getConcept } from '../content';
import { mostFaded } from './memory';

/**
 * teach: Pip asks, the child answers (the child is the teacher).
 * check: Pip answers on its own — sometimes wrongly — and the child must judge it.
 * show:  Pip wants the method, not the answer: the child taps each object to count it for Pip.
 */
export type RoundMode = 'teach' | 'check' | 'show';

/** A question can be shown (counted out) when its picture is a set of objects. */
export const isCountable = (q: Question) => q.visual?.kind === 'emoji' || q.visual?.kind === 'sum';

export interface Round {
  conceptId: string;
  mode: RoundMode;
  q: Question;
  pipPick: string;
  /** A round pulled in from another concept Pip is forgetting (interleaved review). */
  review: boolean;
}

/** How often Pip makes a mistake in a check round. */
const PIP_MISTAKE_RATE = 0.6;

function makeQuestion(conceptId: string, avoidPrompt?: string): Question {
  const c = getConcept(conceptId);
  if (!c) throw new Error(`Unknown concept ${conceptId}`);
  // Avoid asking the exact same thing twice in a row.
  let q = c.make();
  for (let i = 0; i < 4 && q.prompt === avoidPrompt; i++) q = c.make();
  return q;
}

/** Objects to count in a picture: a "Show me how!" round needs a few, or there's nothing to show. */
function countableItems(q: Question): number {
  const v = q.visual;
  if (v?.kind === 'emoji') return v.items.length;
  if (v?.kind === 'sum') return v.op === '+' ? v.a.length + v.b.length : v.a.length - v.b.length;
  return 0;
}

function round(conceptId: string, mode: RoundMode, review: boolean, avoid?: string): Round {
  let q = makeQuestion(conceptId, avoid);
  for (let i = 0; mode === 'show' && countableItems(q) < 3 && i < 80; i++) q = makeQuestion(conceptId, avoid);
  const pipPick = mode === 'check' && Math.random() < PIP_MISTAKE_RATE ? q.wrongId : q.correctId;
  return { conceptId, mode, q, pipPick, review };
}

export function buildSession(conceptId: string, memory: Record<string, ConceptMemory>): Round[] {
  const isNew = (memory[conceptId]?.taught ?? 0) === 0;
  const modes: RoundMode[] = isNew
    ? ['teach', 'teach', 'check', 'check', 'teach', 'check']
    : ['teach', 'check', 'check', 'teach', 'check', 'check'];

  // Counting concepts get a "Show me how!" round in place of the second teach round.
  if (isCountable(makeQuestion(conceptId))) modes[isNew ? 1 : 3] = 'show';

  const rounds: Round[] = [];
  for (const mode of modes) {
    rounds.push(round(conceptId, mode, false, rounds[rounds.length - 1]?.q.prompt));
  }

  // Interleave a quick review of something Pip is forgetting from elsewhere.
  const faded = mostFaded(memory, conceptId);
  if (faded) rounds.splice(4, 0, round(faded.id, 'check', true));

  // Guarantee at least one Pip mistake per lesson: spotting errors is the heart of the game.
  const checks = rounds.filter((r) => r.mode === 'check');
  if (checks.length && !checks.some((r) => r.pipPick !== r.q.correctId)) {
    const r = checks[checks.length - 1];
    r.pipPick = r.q.wrongId;
  }
  return rounds;
}
