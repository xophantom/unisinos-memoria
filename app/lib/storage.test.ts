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

describe('persistência por área', () => {
  beforeEach(() => window.localStorage.clear());

  it('emptyRecords tem as 5 áreas nulas', () => {
    const r = emptyRecords();
    expect(Object.keys(r).sort()).toEqual(['artes', 'ciencias', 'negocios', 'saude', 'tecnologia']);
    expect(r.tecnologia).toEqual({ bestMoves: null, bestTime: null });
  });
  it('saveResult grava e loadRecords lê o melhor por área', () => {
    saveResult('tecnologia', { moves: 10, time: 40 });
    saveResult('tecnologia', { moves: 8, time: 55 });
    expect(loadRecords().tecnologia).toEqual({ bestMoves: 8, bestTime: 40 });
  });
  it('tolera JSON parcial corrompido (sem NaN)', () => {
    window.localStorage.setItem('unisinos-memoria-records-areas', JSON.stringify({ saude: { bestMoves: 5 } }));
    expect(loadRecords().saude).toEqual({ bestMoves: 5, bestTime: null });
  });
});
