import type { Concept, Subject, SubjectId } from '../types';
import { numberConcepts } from './numbers';
import { letterConcepts } from './letters';
import { shapeConcepts } from './shapes';
import { colorConcepts } from './colors';
import { natureConcepts } from './nature';

/** Each subject is a planet in Pip's home galaxy. */
export const SUBJECTS: Subject[] = [
  { id: 'numbers', name: 'Numbers', planet: 'Planet Counto', emoji: '🔢', color: '#FF9F1C', concepts: numberConcepts },
  { id: 'letters', name: 'Letters', planet: 'Planet Abcee', emoji: '🔤', color: '#FF5DA2', concepts: letterConcepts },
  { id: 'shapes', name: 'Shapes', planet: 'Planet Shapeo', emoji: '🔷', color: '#4CC9F0', concepts: shapeConcepts },
  { id: 'colors', name: 'Colors', planet: 'Planet Rainbo', emoji: '🎨', color: '#B388FF', concepts: colorConcepts },
  { id: 'nature', name: 'Nature', planet: 'Planet Leafy', emoji: '🌱', color: '#7BD389', concepts: natureConcepts },
];

export const ALL_CONCEPTS: Concept[] = SUBJECTS.flatMap((s) => s.concepts);

const byId = new Map(ALL_CONCEPTS.map((c) => [c.id, c]));
export const getConcept = (id: string) => byId.get(id);
export const getSubject = (id: SubjectId) => SUBJECTS.find((s) => s.id === id)!;
