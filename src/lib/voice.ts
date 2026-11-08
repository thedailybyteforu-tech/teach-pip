import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { Platform } from 'react-native';
import { CLIPS, SPRITES } from '../voice/manifest';
import { cleanSpeech, clipKey, sentences } from './sentences';

/** Who is speaking. Each character has its own recorded voice. */
export type VoiceId =
  | 'pip'
  | 'zoomi'
  | 'roarbow'
  | 'peely'
  | 'mona'
  | 'kiki'
  | 'puddle'
  | 'grumbo'
  | 'bloop'
  | 'fuzzle'
  | 'bobble'
  | 'snoozle'
  | 'nibbles'
  | 'pinky'
  | 'rio'
  | 'brocco';

let voiceOn = true;
let defaultVoice: VoiceId = 'zoomi';
/** Bumped on every new line, so an older line stops as soon as a new one starts. */
let token = 0;
let timer: ReturnType<typeof setTimeout> | null = null;
const players = new Map<number, AudioPlayer>();
let playing: AudioPlayer | null = null;

export function setVoiceEnabled(on: boolean) {
  voiceOn = on;
  if (!on) hush();
}

/** The voice used when a screen doesn't name a speaker (Pip in Pip's game, Zoomi in the hub). */
export function setDefaultVoice(v: VoiceId) {
  defaultVoice = v;
}

function player(sprite: number): AudioPlayer {
  let p = players.get(sprite);
  if (!p) {
    p = createAudioPlayer(SPRITES[sprite]);
    players.set(sprite, p);
  }
  return p;
}

/* ---------- Fallback: the device's own text-to-speech ---------- */

let chosenVoice: string | undefined;

const GOOD_NAMES = [
  'natural', 'neural', 'premium', 'enhanced', 'wavenet',
  'samantha', 'ava', 'zoe', 'allison', 'nicky', 'karen', 'serena',
  'google us english', 'aria', 'jenny', 'ana', 'sonia', 'libby',
];

function score(v: Speech.Voice): number {
  const name = `${v.name} ${v.identifier}`.toLowerCase();
  const lang = (v.language || '').toLowerCase().replace('_', '-');
  if (!lang.startsWith('en')) return -1;
  let s = 0;
  if (lang === 'en-us') s += 30;
  else if (lang === 'en-gb' || lang === 'en-au') s += 20;
  if (v.quality === Speech.VoiceQuality.Enhanced) s += 40;
  GOOD_NAMES.forEach((g, i) => {
    if (name.includes(g)) s += i < 5 ? 35 : 15;
  });
  if (name.includes('network')) s += 10;
  if (/(whisper|zarvox|trinoids|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|albert|fred|junior|ralph|grandpa|grandma|rocko|eddy|flo|reed|sandy|shelley)/.test(name)) s -= 100;
  return s;
}

async function pickVoice(attempt = 0): Promise<void> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices.length && attempt < 5) {
      setTimeout(() => pickVoice(attempt + 1), 400);
      return;
    }
    const best = voices.map((v) => ({ v, s: score(v) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s)[0];
    chosenVoice = best?.v.identifier;
  } catch {
    chosenVoice = undefined;
  }
}
pickVoice();

function speakDevice(text: string) {
  Speech.speak(text, { pitch: 1.12, rate: 0.92, language: 'en-US', ...(chosenVoice ? { voice: chosenVoice } : {}) });
}

/* ---------- Recorded voices ---------- */

function playClips(clips: [number, number, number][], my: number, i = 0) {
  if (my !== token || i >= clips.length) {
    playing = null;
    return;
  }
  const [sprite, start, end] = clips[i];
  const p = player(sprite);
  playing = p;
  p.seekTo(start)
    .catch(() => {})
    .finally(() => {
      if (my !== token) return;
      p.play();
      timer = setTimeout(() => {
        p.pause();
        playClips(clips, my, i + 1);
      }, Math.max(150, (end - start) * 1000));
    });
}

/**
 * Say a line in a character's voice. If every sentence of it has been recorded, the recording
 * plays; otherwise the whole line falls back to the device voice, so a line never switches
 * voices halfway through.
 */
export function say(text: string, who: VoiceId = defaultVoice) {
  if (!voiceOn) return;
  hush();
  const my = token;
  const clean = cleanSpeech(text);
  if (!clean) return;
  const parts = sentences(clean);
  const clips = parts.map((s) => CLIPS[clipKey(who, s)]);
  if (clips.length && clips.every(Boolean)) {
    playClips(clips as [number, number, number][], my);
    return;
  }
  speakDevice(clean);
}

export function hush() {
  token++;
  if (timer) clearTimeout(timer);
  timer = null;
  if (playing) {
    try {
      playing.pause();
    } catch {
      // The player may already be released.
    }
    playing = null;
  }
  Speech.stop().catch(() => {});
}

const native = Platform.OS !== 'web';

export const feel = {
  tap: () => native && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  good: () => native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  oops: () => native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
