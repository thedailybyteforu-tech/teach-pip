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

/** Pip's voice: a bit higher and slower than normal, so pre-readers can follow along. */
export function say(text: string) {
  if (!voiceOn) return;
  const clean = text.replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return;
  Speech.stop()
    .catch(() => {})
    .finally(() => Speech.speak(clean, { pitch: 1.4, rate: 0.9, language: 'en-US' }));
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
