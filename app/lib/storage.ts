import type { Difficulty } from './difficulty';

export interface BestScore {
  bestMoves: number | null;
  bestTime: number | null;
}
export type Records = Record<Difficulty, BestScore>;

const KEY = 'unisinos-memoria-records';

export function emptyRecords(): Records {
  return {
    easy: { bestMoves: null, bestTime: null },
    medium: { bestMoves: null, bestTime: null },
    hard: { bestMoves: null, bestTime: null },
  };
}

export function mergeBest(prev: BestScore, result: { moves: number; time: number }): BestScore {
  return {
    bestMoves: prev.bestMoves === null ? result.moves : Math.min(prev.bestMoves, result.moves),
    bestTime: prev.bestTime === null ? result.time : Math.min(prev.bestTime, result.time),
  };
}

export function loadRecords(): Records {
  const defaults = emptyRecords();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Record<Difficulty, Partial<BestScore>>>;
    return {
      easy: { ...defaults.easy, ...parsed.easy },
      medium: { ...defaults.medium, ...parsed.medium },
      hard: { ...defaults.hard, ...parsed.hard },
    };
  } catch {
    return defaults;
  }
}

export function saveResult(difficulty: Difficulty, result: { moves: number; time: number }): Records {
  const records = loadRecords();
  const next: Records = { ...records, [difficulty]: mergeBest(records[difficulty], result) };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignora quota/privacidade */
    }
  }
  return next;
}
