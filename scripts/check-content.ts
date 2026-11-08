/**
 * Sanity-checks every question generator: run with `npm run check:content`.
 * Each question must contain its correct answer and Pip's wrong answer, they must differ,
 * and option ids must be unique.
 */
import { ALL_CONCEPTS } from '../src/content';
import { buildSession } from '../src/engine/session';
import { reinforce, retention } from '../src/engine/memory';

let failures = 0;
const fail = (msg: string) => {
  failures++;
  if (failures < 20) console.error('FAIL', msg);
};

for (const c of ALL_CONCEPTS) {
  for (let i = 0; i < 2000; i++) {
    const q = c.make();
    const ids = q.options.map((o) => o.id);
    if (new Set(ids).size !== ids.length) fail(`${c.id}: duplicate options ${ids}`);
    if (!ids.includes(q.correctId)) fail(`${c.id}: correct missing`);
    if (!ids.includes(q.wrongId)) fail(`${c.id}: wrong missing`);
    if (q.correctId === q.wrongId) fail(`${c.id}: wrong === correct (${q.prompt})`);
    if (q.options.length < 2 || q.options.length > 3) fail(`${c.id}: ${q.options.length} options`);
    if (q.options.some((o) => /^-/.test(o.id))) fail(`${c.id}: negative option ${ids}`);
  }
  const s = buildSession(c.id, {});
  const countable = s[0].q.visual?.kind === 'emoji' || s[0].q.visual?.kind === 'sum';
  if (countable !== s.some((r) => r.mode === 'show')) fail(`${c.id}: show round mismatch`);
  for (let k = 0; k < 200; k++) {
    for (const r of buildSession(c.id, {})) {
      const v = r.q.visual;
      const n = v?.kind === 'emoji' ? v.items.length : v?.kind === 'sum' ? (v.op === '+' ? v.a.length + v.b.length : v.a.length - v.b.length) : 0;
      if (r.mode === 'show' && n < 3) fail(`${c.id}: show round with only ${n} to count`);
    }
  }
  if (!s.some((r) => r.mode === 'check' && r.pipPick !== r.q.correctId)) fail(`${c.id}: no Pip mistake in session`);
}

// Memory: re-teaching after forgetting should strengthen more than cramming.
const day = 86400000;
const m1 = reinforce(undefined, 1, 0);
const cram = reinforce(m1, 1, 60 * 1000);
const spaced = reinforce(m1, 1, 3 * day);
if (!(spaced.stability > cram.stability)) fail('spacing should beat cramming');
if (!(retention(m1, day) < retention(m1, 0))) fail('retention should decay');

console.log(failures ? `${failures} failures` : `OK: ${ALL_CONCEPTS.length} concepts × 2000 questions checked`);
process.exit(failures ? 1 : 0);
