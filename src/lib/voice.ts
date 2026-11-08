import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let voiceOn = true;

export function setVoiceEnabled(on: boolean) {
  voiceOn = on;
  if (!on) Speech.stop().catch(() => {});
}

// Emoji and pictographs read badly through text-to-speech, so drop them.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;

/**
 * Pick the most natural-sounding English voice the device has. Phones and browsers ship
 * several voices; the default is often the oldest, most robotic one, while the "enhanced",
 * "neural" or "natural" voices sound close to a real person.
 */
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
  if (name.includes('network')) s += 10; // Android's cloud voices are the most natural ones
  // Novelty voices sound like robots or monsters: never use them for Pip.
  if (/(whisper|zarvox|trinoids|bad news|bells|boing|bubbles|cellos|jester|organ|superstar|albert|fred|junior|ralph|grandpa|grandma|rocko|eddy|flo|reed|sandy|shelley)/.test(name)) s -= 100;
  return s;
}

async function pickVoice(attempt = 0): Promise<void> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    if (!voices.length && attempt < 5) {
      // Browsers load their voice list a moment after the page starts.
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

/**
 * Pip's voice: warm, a touch higher than normal and a little slow, so pre-readers can follow.
 * A gentle pitch lift keeps it natural; pushing pitch further makes every engine sound robotic.
 */
export function say(text: string) {
  if (!voiceOn) return;
  const clean = text.replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  Speech.stop()
    .catch(() => {})
    .finally(() =>
      Speech.speak(clean, { pitch: 1.12, rate: 0.92, language: 'en-US', ...(chosenVoice ? { voice: chosenVoice } : {}) }),
    );
}

export function hush() {
  Speech.stop().catch(() => {});
}

const native = Platform.OS !== 'web';

export const feel = {
  tap: () => native && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  good: () => native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  oops: () => native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
