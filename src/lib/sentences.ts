/**
 * Shared by the app and the voice-recording scripts, so a line is split and looked up the
 * same way when it is recorded and when it is played. Pure TypeScript: no React Native.
 */

// Emoji and pictographs read badly through text-to-speech, so drop them.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{20E3}]/gu;

export function cleanSpeech(text: string): string {
  return text.replace(EMOJI, ' ').replace(/\s+/g, ' ').trim();
}

/** Split a line into sentences: each ends at . ! or ? (a run of them, like "..." or "?!"). */
export function sentences(text: string): string[] {
  const t = cleanSpeech(text);
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < t.length; i++) {
    if ('.!?'.includes(t[i])) {
      let j = i;
      while (j + 1 < t.length && '.!?'.includes(t[j + 1])) j++;
      if (j + 1 >= t.length || t[j + 1] === ' ') {
        const s = t.slice(start, j + 1).trim();
        if (s) out.push(s);
        start = j + 1;
      }
      i = j;
    }
  }
  const rest = t.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

/** Lookup key for a recorded sentence: the voice plus the words, ignoring case and punctuation. */
export function clipKey(voice: string, sentence: string): string {
  return `${voice}|${sentence.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}`;
}
