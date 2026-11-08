import type { Concept, Option } from '../types';
import { An, an, buildQuestion, pick } from '../lib/random';

const HOMES = [
  { e: '🐟', a: 'fish', h: 'ocean', he: '🌊' },
  { e: '🐦', a: 'bird', h: 'tree', he: '🌳' },
  { e: '🐝', a: 'bee', h: 'hive', he: '🍯' },
  { e: '🐰', a: 'rabbit', h: 'burrow', he: '🕳️' },
  { e: '🐧', a: 'penguin', h: 'ice', he: '🧊' },
  { e: '🐒', a: 'monkey', h: 'jungle', he: '🌴' },
  { e: '🐫', a: 'camel', h: 'desert', he: '🏜️' },
];

function animalHomes() {
  const t = pick(HOMES);
  const home = (x: (typeof HOMES)[number]): Option => ({ id: x.h, label: x.h, visual: { kind: 'big', text: x.he } });
  const others = HOMES.filter((x) => x.h !== t.h);
  return buildQuestion({
    prompt: `Where does ${an(t.a)} ${t.a} live?`,
    visual: { kind: 'big', text: t.e },
    correct: home(t),
    wrong: home(pick(others)),
    extras: others.map(home),
    fact: `${An(t.a)} ${t.a} lives in the ${t.h}!`,
  });
}

const BABIES = [
  { e: '🐱', a: 'cat', b: 'kitten' },
  { e: '🐶', a: 'dog', b: 'puppy' },
  { e: '🐄', a: 'cow', b: 'calf' },
  { e: '🐑', a: 'sheep', b: 'lamb' },
  { e: '🐸', a: 'frog', b: 'tadpole' },
  { e: '🐔', a: 'hen', b: 'chick' },
  { e: '🦋', a: 'butterfly', b: 'caterpillar' },
  { e: '🐴', a: 'horse', b: 'foal' },
  { e: '🦘', a: 'kangaroo', b: 'joey' },
];

function babyAnimals() {
  const t = pick(BABIES);
  const baby = (x: (typeof BABIES)[number]): Option => ({ id: x.b, label: x.b });
  const others = BABIES.filter((x) => x.b !== t.b);
  return buildQuestion({
    prompt: `What is a baby ${t.a} called?`,
    visual: { kind: 'big', text: t.e },
    correct: baby(t),
    wrong: baby(pick(others)),
    extras: others.map(baby),
    fact: `A baby ${t.a} is called a ${t.b}!`,
  });
}

const AWAKE = [
  { e: '🦉', a: 'owl', night: true },
  { e: '🦇', a: 'bat', night: true },
  { e: '🦝', a: 'raccoon', night: true },
  { e: '🦔', a: 'hedgehog', night: true },
  { e: '🦋', a: 'butterfly', night: false },
  { e: '🐝', a: 'bee', night: false },
  { e: '🐓', a: 'rooster', night: false },
  { e: '🐿️', a: 'squirrel', night: false },
];

function dayOrNight() {
  const t = pick(AWAKE);
  const day: Option = { id: 'day', label: 'day', visual: { kind: 'big', text: '☀️' } };
  const night: Option = { id: 'night', label: 'night', visual: { kind: 'big', text: '🌙' } };
  return buildQuestion({
    prompt: `Is ${an(t.a)} ${t.a} awake in the day or at night?`,
    visual: { kind: 'big', text: t.e },
    correct: t.night ? night : day,
    wrong: t.night ? day : night,
    extras: [],
    count: 2,
    fact: t.night
      ? `${An(t.a)} ${t.a} is awake at night and sleeps in the day!`
      : `${An(t.a)} ${t.a} is busy in the day and sleeps at night!`,
  });
}

export const natureConcepts: Concept[] = [
  { id: 'nature-homes', subject: 'nature', title: 'Animal homes', emoji: '🏡', make: animalHomes },
  { id: 'nature-babies', subject: 'nature', title: 'Baby animals', emoji: '🐣', make: babyAnimals },
  { id: 'nature-night', subject: 'nature', title: 'Day and night animals', emoji: '🦉', make: dayOrNight },
];
