import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

/**
 * Soft sound effects for the Playroom, made for this app (gentle sine "marimba" notes, a wooden
 * tock and a pop). Each sound keeps a small pool of players so quick repeats can overlap.
 */
const SOURCES = {
  c: require('../../assets/sfx/note-c.mp3'),
  d: require('../../assets/sfx/note-d.mp3'),
  e: require('../../assets/sfx/note-e.mp3'),
  g: require('../../assets/sfx/note-g.mp3'),
  a: require('../../assets/sfx/note-a.mp3'),
  c2: require('../../assets/sfx/note-c2.mp3'),
  tock: require('../../assets/sfx/tock.mp3'),
  pop: require('../../assets/sfx/pop.mp3'),
} as const;

export type Sfx = keyof typeof SOURCES;

/** Notes from high to low, as rows in the Music Maker. */
export const NOTES: Sfx[] = ['c2', 'a', 'g', 'e', 'd', 'c'];

const POOL = 3;
const pools = new Map<Sfx, { players: AudioPlayer[]; next: number }>();
let enabled = true;

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

export function play(sound: Sfx, volume = 0.8) {
  if (!enabled) return;
  try {
    let p = pools.get(sound);
    if (!p) {
      p = { players: Array.from({ length: POOL }, () => createAudioPlayer(SOURCES[sound])), next: 0 };
      pools.set(sound, p);
    }
    const player = p.players[p.next];
    p.next = (p.next + 1) % POOL;
    player.volume = volume;
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // Sound is a nicety; never let it break play.
  }
}
