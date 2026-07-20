import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('inicia em peek com o baralho da dificuldade e depois vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame('easy'));
    // efeito de montagem cria o baralho
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(12); // 6 pares
    expect(result.current.state.phase).toBe('peek');
    // fim da espiada (2500ms)
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame('easy'));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });
});
