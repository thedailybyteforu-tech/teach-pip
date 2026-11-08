import type { Concept, Option, ShapeName } from '../types';
import { buildQuestion, pick, shuffle } from '../lib/random';

const NAMES: Record<ShapeName, string> = {
  circle: 'circle',
  square: 'square',
  triangle: 'triangle',
  rectangle: 'rectangle',
  star: 'star',
  hexagon: 'hexagon',
  oval: 'oval',
  pentagon: 'pentagon',
};

const SIDES: Partial<Record<ShapeName, number>> = {
  triangle: 3,
  square: 4,
  rectangle: 4,
  pentagon: 5,
  hexagon: 6,
};

const CONFUSE: Partial<Record<ShapeName, ShapeName>> = {
  square: 'rectangle',
  rectangle: 'square',
  circle: 'oval',
  oval: 'circle',
  hexagon: 'pentagon',
  pentagon: 'hexagon',
  triangle: 'star',
  star: 'pentagon',
};

const PAINT = ['#FF6B6B', '#4CC9F0', '#FFD23F', '#7BD389', '#B388FF', '#FF9F1C'];

function shapeOptions(shapes: ShapeName[]): Option[] {
  const paints = shuffle(PAINT);
  return shapes.map((s, i) => ({
    id: s,
    label: NAMES[s],
    hideLabel: true,
    visual: { kind: 'shape', shape: s, color: paints[i % paints.length] },
  }));
}

function findShape(set: ShapeName[]) {
  return () => {
    const target = pick(set);
    const opts = shapeOptions(set);
    const byId = (id: string) => opts.find((o) => o.id === id)!;
    const confusion = CONFUSE[target];
    const wrongId = confusion && set.includes(confusion) ? confusion : pick(set.filter((s) => s !== target));
    return buildQuestion({
      prompt: `Which one is the ${NAMES[target]}?`,
      correct: byId(target),
      wrong: byId(wrongId),
      extras: opts,
      fact: `That's a ${NAMES[target]}! I'll remember its shape.`,
    });
  };
}

function countSides() {
  const shape = pick(Object.keys(SIDES) as ShapeName[]);
  const n = SIDES[shape]!;
  const num = (k: number): Option => ({ id: String(k), label: String(k) });
  return buildQuestion({
    prompt: `How many sides does this ${NAMES[shape]} have?`,
    visual: { kind: 'shape', shape, color: pick(PAINT) },
    correct: num(n),
    wrong: num(n + pick([1, -1])),
    extras: [2, 3, 4, 5, 6, 7].map(num),
    fact: `A ${NAMES[shape]} has ${n} sides! I counted them.`,
  });
}

export const shapeConcepts: Concept[] = [
  { id: 'shape-basic', subject: 'shapes', title: 'Circle, square, triangle', emoji: '🔺', make: findShape(['circle', 'square', 'triangle']) },
  { id: 'shape-more', subject: 'shapes', title: 'Super shapes', emoji: '⭐', make: findShape(['rectangle', 'star', 'hexagon', 'oval', 'pentagon', 'square', 'circle']) },
  { id: 'shape-sides', subject: 'shapes', title: 'Counting sides', emoji: '📐', make: countSides },
];
