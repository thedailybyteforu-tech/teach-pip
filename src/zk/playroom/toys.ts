import type { BuddyId } from '../characters';

export type Toy =
  | 'marble' | 'music' | 'busy' | 'garden' | 'town' | 'draw' | 'shapes'
  | 'blocks' | 'weather' | 'sorter' | 'beads' | 'sky' | 'sand';

/** Every Playroom toy, with the early-years skill it quietly builds (shown to grown-ups only). */
export const TOYS: { id: Toy; title: string; host: BuddyId; tint: string; skill: string }[] = [
  { id: 'marble', title: 'Marble Run', host: 'bobble', tint: '#E6EEF0', skill: 'Cause and effect, spatial thinking' },
  { id: 'music', title: 'Music Maker', host: 'bloop', tint: '#EAE3F2', skill: 'Rhythm, patterns, listening' },
  { id: 'busy', title: 'Busy Board', host: 'peely', tint: '#F4EAD5', skill: 'Fine motor skills, everyday mechanisms' },
  { id: 'garden', title: 'Garden', host: 'brocco', tint: '#E3EDDC', skill: 'Nature, patience, day and night' },
  { id: 'town', title: 'Tiny Town', host: 'zoomi', tint: '#E1ECE3', skill: 'Pretend play, storytelling' },
  { id: 'draw', title: 'Draw', host: 'mona', tint: '#F5E6DE', skill: 'Creativity, pencil control' },
  { id: 'shapes', title: 'Wooden Shapes', host: 'snoozle', tint: '#EFE6D6', skill: 'Shapes, spatial reasoning' },
  { id: 'blocks', title: 'Block Builder', host: 'roarbow', tint: '#E8E4F0', skill: 'Balance, size, early engineering' },
  { id: 'weather', title: 'Weather Window', host: 'puddle', tint: '#DDE9F0', skill: 'Weather words, observing the world' },
  { id: 'sorter', title: 'Shape Sorter', host: 'kiki', tint: '#EEF0D8', skill: 'Shape matching, hand-eye coordination' },
  { id: 'beads', title: 'Bead Necklace', host: 'pinky', tint: '#F6E4E6', skill: 'Patterns, colour, fine motor skills' },
  { id: 'sky', title: 'Night Sky', host: 'nibbles', tint: '#DCE0EC', skill: 'Calm-down time, counting, constellations' },
  { id: 'sand', title: 'Sand Tray', host: 'rio', tint: '#F2E7CF', skill: 'Sensory play, early writing strokes' },
];
