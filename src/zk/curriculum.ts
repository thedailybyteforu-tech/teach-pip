import type { ActivityKind, AppData } from '../types';
import { mostFaded } from '../engine/memory';
import type { BuddyId } from './characters';

/**
 * The learning areas the hub covers. They follow the broad domains used in early-years
 * frameworks (language and literacy, maths, science, creative arts, social-emotional,
 * physical/self-regulation). This is a design guide, not an accreditation.
 */
export const ACTIVITIES: Record<ActivityKind, { title: string; area: string; host: BuddyId | 'pip'; emoji: string; color: string }> = {
  trace: { title: 'Trace a letter', area: 'Literacy', host: 'mona', emoji: '✏️', color: '#E4572E' },
  teach: { title: 'Teach Pip', area: 'Maths & thinking', host: 'pip', emoji: '👽', color: '#5EE6C8' },
  pattern: { title: 'Pattern Party', area: 'Maths', host: 'bobble', emoji: '🔴', color: '#7FD8A6' },
  science: { title: 'Science experiment', area: 'Science', host: 'kiki', emoji: '🔬', color: '#A8D84E' },
  song: { title: 'Song Time', area: 'Music & memory', host: 'bloop', emoji: '🎵', color: '#4FC3F7' },
  cook: { title: 'Cook with Peely', area: 'Healthy food & creativity', host: 'peely', emoji: '🍳', color: '#FFD84D' },
  play: { title: 'Pretend play', area: 'Social & emotional', host: 'roarbow', emoji: '🏠', color: '#F4B942' },
  calm: { title: 'Calm Room', area: 'Calm & self-regulation', host: 'snoozle', emoji: '🌿', color: '#C9B79C' },
};

const dayNumber = (date: string) => Math.floor(new Date(`${date}T12:00:00`).getTime() / 86400000);

/**
 * Today's path of four stops: one literacy, one maths, one science-or-music, one creative or
 * social. It rotates by day so every area comes round, and adapts to age and memory: if Pip is
 * forgetting something, "Teach Pip" takes the maths stop so the child re-teaches it.
 */
export function todaysPath(d: AppData, date: string): ActivityKind[] {
  const n = dayNumber(date);
  const age = d.zk.age;
  const fading = !!mostFaded(d.memory);
  const maths: ActivityKind = age === 'little' ? 'pattern' : fading || n % 2 === 0 ? 'teach' : 'pattern';
  const discover: ActivityKind = n % 2 === 0 ? 'science' : 'song';
  const create: ActivityKind = (['cook', 'play', 'calm'] as const)[n % 3];
  return ['trace', maths, discover, create];
}
