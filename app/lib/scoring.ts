export function calcStars(moves: number, pairs: number): 1 | 2 | 3 {
  if (moves <= Math.round(pairs * 1.6)) return 3;
  if (moves <= Math.round(pairs * 2.3)) return 2;
  return 1;
}
