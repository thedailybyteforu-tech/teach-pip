import type { SubjectId } from '../types';
import { pick, randInt } from '../lib/random';

export interface Mission {
  /** What Pip asks for, spoken aloud. */
  text: string;
  /** A short version for the stamp book. */
  stamp: string;
  emoji: string;
}

const LETTERS = ['B', 'C', 'S', 'M', 'P', 'T', 'D', 'F', 'L', 'R'];

/**
 * Earth Missions send the child off the screen to find the lesson in the real world.
 * Every mission can be done safely indoors, with things found in most homes.
 */
const MAKERS: Record<SubjectId, (() => Mission)[]> = {
  numbers: [
    () => {
      const n = randInt(2, 5);
      return { text: `Find ${n} spoons and count them out loud!`, stamp: `Counted ${n} spoons`, emoji: '🥄' };
    },
    () => {
      const n = randInt(3, 6);
      return { text: `Jump ${n} times and count every jump!`, stamp: `Jumped ${n} times`, emoji: '🦘' };
    },
    () => ({ text: 'Count the windows in your room!', stamp: 'Counted the windows', emoji: '🪟' }),
    () => ({ text: 'Count all your fingers and toes. Are there more than 10?', stamp: 'Counted fingers and toes', emoji: '🖐️' }),
  ],
  letters: [
    () => {
      const L = pick(LETTERS);
      return { text: `Find something in your home that starts with ${L}!`, stamp: `Found a ${L} thing`, emoji: '🔤' };
    },
    () => ({ text: 'Find the first letter of your name, written somewhere at home!', stamp: 'Found my letter', emoji: '🏷️' }),
    () => ({ text: 'Draw a big letter in the air with your finger. Which letter did you draw?', stamp: 'Drew a letter in the air', emoji: '✍️' }),
  ],
  shapes: [
    () => ({ text: 'Find something round, like a circle!', stamp: 'Found a circle', emoji: '⭕' }),
    () => ({ text: 'Find something shaped like a rectangle. Hint: look at doors and books!', stamp: 'Found a rectangle', emoji: '🚪' }),
    () => ({ text: 'Find a triangle hiding somewhere in your home!', stamp: 'Found a triangle', emoji: '🔺' }),
    () => ({ text: 'Make a circle with your arms!', stamp: 'Made a circle with my arms', emoji: '🙆' }),
  ],
  colors: [
    () => {
      const c = pick(['red', 'blue', 'yellow', 'green']);
      return { text: `Find 3 things that are ${c}!`, stamp: `Found 3 ${c} things`, emoji: '🎨' };
    },
    () => ({ text: 'What color are your socks today? Show a grown-up!', stamp: 'Checked my sock color', emoji: '🧦' }),
    () => ({ text: 'Find something that has two colors on it!', stamp: 'Found a two-color thing', emoji: '🌈' }),
  ],
  nature: [
    () => ({ text: 'Look out of a window. Can you see a tree, a bird or a cloud?', stamp: 'Looked out the window', emoji: '🌳' }),
    () => ({ text: 'Find a toy animal, or a picture of one. Where does it live?', stamp: 'Found an animal', emoji: '🧸' }),
    () => ({ text: 'Make the sound of an animal that is awake at night!', stamp: 'Made a night animal sound', emoji: '🦉' }),
  ],
};

export function makeMission(subject: SubjectId): Mission {
  return pick(MAKERS[subject])();
}
