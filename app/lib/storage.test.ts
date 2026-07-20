import { describe, it, expect, beforeEach } from 'vitest';
import { mergeBest, emptyRecords, loadRecords, saveResult } from './storage';

describe('mergeBest', () => {
  it('usa o resultado quando não há recorde anterior', () => {
    expect(mergeBest({ bestMoves: null, bestTime: null }, { moves: 10, time: 40 }))
      .toEqual({ bestMoves: 10, bestTime: 40 });
  });
  it('mantém o menor de jogadas e tempo independentemente', () => {
    expect(mergeBest({ bestMoves: 8, bestTime: 60 }, { moves: 12, time: 30 }))
      .toEqual({ bestMoves: 8, bestTime: 30 });
  });
});

describe('persistência', () => {
  beforeEach(() => window.localStorage.clear());

  it('emptyRecords tem as 3 dificuldades nulas', () => {
    expect(emptyRecords()).toEqual({
      easy: { bestMoves: null, bestTime: null },
      medium: { bestMoves: null, bestTime: null },
      hard: { bestMoves: null, bestTime: null },
    });
  });
  it('saveResult grava e loadRecords lê o melhor', () => {
    saveResult('easy', { moves: 10, time: 40 });
    saveResult('easy', { moves: 8, time: 55 });
    const r = loadRecords();
    expect(r.easy).toEqual({ bestMoves: 8, bestTime: 40 });
  });
});
