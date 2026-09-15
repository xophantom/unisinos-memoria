/** Espiada inicial: cresce com o tabuleiro para dar tempo de decorar. */
const PEEK_BASE_MS = 1200;
const PEEK_PER_PAIR_MS = 300;
const PEEK_MIN_MS = 2500;
const PEEK_MAX_MS = 5000;

export function peekDurationMs(pairs: number): number {
  const raw = PEEK_BASE_MS + pairs * PEEK_PER_PAIR_MS;
  return Math.min(PEEK_MAX_MS, Math.max(PEEK_MIN_MS, raw));
}
