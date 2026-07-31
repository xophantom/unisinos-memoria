import { describe, it, expect } from 'vitest';
import { buildDeck } from './deck';
import type { Course } from '../data/courses';

const identity = <T,>(a: T[]): T[] => a;
const mock: Course[] = [
  { id: 'a', label: 'A', Icon: (() => null) as never },
  { id: 'b', label: 'B', Icon: (() => null) as never },
  { id: 'c', label: 'C', Icon: (() => null) as never },
];

describe('buildDeck', () => {
  it('cria 2×pares cartas', () => {
    expect(buildDeck(3, mock, identity)).toHaveLength(6);
  });
  it('cada curso aparece exatamente duas vezes', () => {
    const deck = buildDeck(3, mock, identity);
    const counts = deck.reduce<Record<string, number>>((acc, c) => {
      acc[c.course.id] = (acc[c.course.id] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({ a: 2, b: 2, c: 2 });
  });
  it('ids das cartas são únicos e sequenciais', () => {
    const deck = buildDeck(3, mock, identity);
    expect(deck.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('cartas começam fechadas e não casadas', () => {
    const deck = buildDeck(2, mock, identity);
    expect(deck.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
  });
});
