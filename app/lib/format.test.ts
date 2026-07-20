import { describe, it, expect } from 'vitest';
import { formatTime } from './format';

describe('formatTime', () => {
  it('formata mm:ss com zero à esquerda', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(75)).toBe('01:15');
    expect(formatTime(600)).toBe('10:00');
  });
});
