export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: { id: Difficulty; label: string; pairs: number }[] = [
  { id: 'easy', label: 'Fácil', pairs: 6 },
  { id: 'medium', label: 'Médio', pairs: 10 },
  { id: 'hard', label: 'Difícil', pairs: 16 },
];

export const PAIRS: Record<Difficulty, number> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.id, d.pairs]),
) as Record<Difficulty, number>;
