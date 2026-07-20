import { describe, it, expect } from 'vitest';
import { calcStars } from './scoring';

describe('calcStars', () => {
  it('dá 3 estrelas quando moves <= pares*1.6', () => {
    expect(calcStars(6, 6)).toBe(3);
    expect(calcStars(10, 6)).toBe(3); // round(9.6)=10
  });
  it('dá 2 estrelas na faixa intermediária', () => {
    expect(calcStars(11, 6)).toBe(2); // > 10 e <= round(13.8)=14
    expect(calcStars(14, 6)).toBe(2);
  });
  it('dá 1 estrela acima da faixa', () => {
    expect(calcStars(15, 6)).toBe(1);
  });
});
