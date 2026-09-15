import { describe, it, expect } from 'vitest';
import { peekDurationMs } from './timing';

describe('peekDurationMs', () => {
  it('cresce com o número de pares', () => {
    expect(peekDurationMs(6)).toBe(3000);
    expect(peekDurationMs(9)).toBe(3900);
    expect(peekDurationMs(12)).toBe(4800);
  });

  it('respeita o piso de 2500ms nos tabuleiros pequenos', () => {
    expect(peekDurationMs(4)).toBe(2500);
    expect(peekDurationMs(1)).toBe(2500);
  });

  it('respeita o teto de 5000ms', () => {
    expect(peekDurationMs(30)).toBe(5000);
  });
})
