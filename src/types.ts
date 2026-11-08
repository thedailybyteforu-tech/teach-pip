export type SubjectId = 'numbers' | 'letters' | 'shapes' | 'colors' | 'nature';

export type ShapeName =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle'
  | 'star'
  | 'hexagon'
  | 'oval'
  | 'pentagon';

/** Something drawn on screen: the thing Pip asks about, or an answer card. */
export type Visual =
  | { kind: 'emoji'; items: string[] }
  | { kind: 'sum'; a: string[]; b: string[]; op: '+' | '-' }
  | { kind: 'shape'; shape: ShapeName; color?: string }
  | { kind: 'swatch'; color: string }
  | { kind: 'mix'; a: string; b: string }
  | { kind: 'big'; text: string };

export interface Option {
  id: string;
  /** Shown on the card (unless hideLabel) and spoken aloud. */
  label: string;
  /** What the voice says, if different from the label (e.g. "B" for "Bb"). */
  speak?: string;
  visual?: Visual;
  /** Hide the text so the child has to recognise the picture, not read it. */
  hideLabel?: boolean;
}

export interface Question {
  prompt: string;
  visual?: Visual;
  options: Option[];
  correctId: string;
  /** The answer Pip gives when it makes a mistake — a realistic misconception. */
  wrongId: string;
  /** What Pip says once it has learned the right answer. */
  fact: string;
}

export interface Concept {
  id: string;
  subject: SubjectId;
  title: string;
  emoji: string;
  make: () => Question;
}

export interface Subject {
  id: SubjectId;
  name: string;
  planet: string;
  emoji: string;
  color: string;
  concepts: Concept[];
}

export interface ConceptMemory {
  /** Days until Pip's memory of this falls to ~37%. Grows each time it is re-taught. */
  stability: number;
  /** Last time it was taught (ms). */
  last: number;
  taught: number;
}

export interface Stats {
  rounds: number;
  teachFirstTry: number;
  teachTotal: number;
  /** Pip was wrong and the child caught it. */
  catches: number;
  /** Pip was wrong and the child said it was right. */
  misses: number;
  /** Pip was right and the child said it was wrong. */
  falseAlarms: number;
}

export interface Settings {
  voice: boolean;
  /** Minutes per day, or null for no limit. */
  dailyLimitMin: number | null;
}

/** One fixed mistake, retold in Pip's letter home. */
export interface FixedMistake {
  said: string;
  fact: string;
}

/** What happened on one day of play: the raw material for Pip's letter home. */
export interface DayLog {
  date: string;
  concepts: string[];
  catches: number;
  fixed: FixedMistake[];
  shown: number;
  missions: string[];
}

export type AgeBand = 'little' | 'middle' | 'big';

/** Kinds of activity in the ZoomikoKids hub, used by the daily learning path. */
export type ActivityKind = 'trace' | 'science' | 'pattern' | 'teach' | 'song' | 'cook' | 'play' | 'calm';

/** Progress in the ZoomikoKids hub. */
export interface ZkProgress {
  age: AgeBand;
  /** Letters traced, and how many times. */
  traced: Record<string, number>;
  experiments: Record<string, number>;
  dishes: number;
  /** Times each Playroom toy was opened, by toy id. */
  toys: Record<string, number>;
  patternLevel: number;
  songBest: number;
  /** Today's learning path: which activity kinds are done. */
  path: { date: string; done: ActivityKind[] };
  /** Activity counts per kind, for balancing the daily path. */
  counts: Partial<Record<ActivityKind, number>>;
}

export interface AppData {
  version: 1;
  onboarded: boolean;
  avatar: string;
  xp: number;
  memory: Record<string, ConceptMemory>;
  stats: Stats;
  settings: Settings;
  usage: { date: string; seconds: number };
  streak: { last: string; count: number };
  /** Real-world missions completed, newest first. */
  missions: { date: string; text: string; emoji: string }[];
  /** Recent days, newest first. */
  diary: DayLog[];
  zk: ZkProgress;
}
