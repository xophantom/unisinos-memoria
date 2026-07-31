import type { ClusterId } from '../data/clusters';

export interface BestScore {
  bestMoves: number | null;
  bestTime: number | null;
}
export type Records = Record<ClusterId, BestScore>;

const KEY = 'unisinos-memoria-records-clusters';
const CLUSTER_IDS: ClusterId[] = ['saber', 'cuidar', 'criar', 'analisar', 'liderar', 'desenvolver'];

export function emptyRecords(): Records {
  return CLUSTER_IDS.reduce((acc, id) => {
    acc[id] = { bestMoves: null, bestTime: null };
    return acc;
  }, {} as Records);
}

export function mergeBest(prev: BestScore, result: { moves: number; time: number }): BestScore {
  return {
    bestMoves: prev.bestMoves === null ? result.moves : Math.min(prev.bestMoves, result.moves),
    bestTime: prev.bestTime === null ? result.time : Math.min(prev.bestTime, result.time),
  };
}

export function loadRecords(): Records {
  if (typeof window === 'undefined') return emptyRecords();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyRecords();
    const parsed = JSON.parse(raw) as Partial<Record<ClusterId, Partial<BestScore>>>;
    const base = emptyRecords();
    for (const id of CLUSTER_IDS) {
      const entry = parsed[id];
      if (entry) {
        base[id] = {
          bestMoves: entry.bestMoves ?? null,
          bestTime: entry.bestTime ?? null,
        };
      }
    }
    return base;
  } catch {
    return emptyRecords();
  }
}

export function saveResult(clusterId: ClusterId, result: { moves: number; time: number }): Records {
  const records = loadRecords();
  const next: Records = { ...records, [clusterId]: mergeBest(records[clusterId], result) };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignora quota/privacidade */
    }
  }
  return next;
}
