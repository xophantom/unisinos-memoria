import { describe, it, expect } from 'vitest';
import { gameReducer, initialState, type GameState, type BoardCard } from './gameReducer';
import type { Course } from '../data/courses';

const course = (id: string): Course => ({ id, label: id, Icon: (() => null) as never });
const card = (id: number, courseId: string): BoardCard => ({ id, course: course(courseId), isFlipped: false, isMatched: false });

// baralho fixo: pares (a,a) e (b,b)
const deck = (): BoardCard[] => [card(0, 'a'), card(1, 'a'), card(2, 'b'), card(3, 'b')];
const newGame = (): GameState => gameReducer(initialState, { type: 'NEW_GAME', cards: deck(), totalPairs: 2 });
const playing = (): GameState => gameReducer(newGame(), { type: 'END_PEEK' });

describe('gameReducer', () => {
  it('NEW_GAME entra em peek com todas as cartas viradas', () => {
    const s = newGame();
    expect(s.phase).toBe('peek');
    expect(s.cards.every((c) => c.isFlipped)).toBe(true);
    expect(s.moves).toBe(0);
    expect(s.matches).toBe(0);
    expect(s.totalPairs).toBe(2);
  });

  it('END_PEEK esconde todas e vai para playing', () => {
    const s = playing();
    expect(s.phase).toBe('playing');
    expect(s.cards.every((c) => !c.isFlipped)).toBe(true);
  });

  it('FLIP vira uma carta', () => {
    const s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    expect(s.cards.find((c) => c.id === 0)!.isFlipped).toBe(true);
    expect(s.flipped).toEqual([0]);
    expect(s.phase).toBe('playing');
  });

  it('duas cartas viradas incrementam moves e vão para checking', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    expect(s.moves).toBe(1);
    expect(s.phase).toBe('checking');
    expect(s.flipped).toEqual([0, 1]);
  });

  it('RESOLVE com par igual marca como casado e volta para playing', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.cards.find((c) => c.id === 0)!.isMatched).toBe(true);
    expect(s.cards.find((c) => c.id === 1)!.isMatched).toBe(true);
    expect(s.matches).toBe(1);
    expect(s.phase).toBe('playing');
    expect(s.flipped).toEqual([]);
  });

  it('RESOLVE com par diferente desvira e volta para playing', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 2 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.cards.find((c) => c.id === 0)!.isFlipped).toBe(false);
    expect(s.cards.find((c) => c.id === 2)!.isFlipped).toBe(false);
    expect(s.matches).toBe(0);
    expect(s.phase).toBe('playing');
  });

  it('completar todos os pares vai para won', () => {
    let s = playing();
    s = gameReducer(s, { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'RESOLVE' });
    s = gameReducer(s, { type: 'FLIP', id: 2 });
    s = gameReducer(s, { type: 'FLIP', id: 3 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.matches).toBe(2);
    expect(s.phase).toBe('won');
  });

  it('ignora FLIP durante peek', () => {
    const s = gameReducer(newGame(), { type: 'FLIP', id: 0 });
    expect(s.phase).toBe('peek');
    expect(s.flipped).toEqual([]);
  });

  it('ignora terceira carta e clique repetido', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 0 }); // mesma carta
    expect(s.flipped).toEqual([0]);
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'FLIP', id: 2 }); // terceira, em checking
    expect(s.flipped).toEqual([0, 1]);
  });
});
