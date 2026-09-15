import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { CLUSTERS } from '../data/clusters';
import { peekDurationMs } from '../lib/timing';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('monta o tabuleiro com todos os cursos do cluster (criar = 9 pares) e vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.criar));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(18);
    expect(result.current.state.totalPairs).toBe(9);
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(peekDurationMs(9)); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('tabuleiro de tamanho variável — usa todos os cursos do cluster (liderar = 4 pares)', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.liderar));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(8);
    expect(result.current.state.totalPairs).toBe(4);
  });

  it('a espiada dura mais nos tabuleiros maiores', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.desenvolver));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.totalPairs).toBe(12);
    act(() => { vi.advanceTimersByTime(peekDurationMs(4)); }); // piso dos pequenos
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(peekDurationMs(12) - peekDurationMs(4)); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.cuidar));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });

  it('cronômetro continua contando na transição playing → checking', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.analisar));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { vi.advanceTimersByTime(peekDurationMs(9)); }); // fim da espiada
    act(() => { result.current.flip(0); });
    act(() => { vi.advanceTimersByTime(900); });
    act(() => { result.current.flip(1); });
    act(() => { vi.advanceTimersByTime(200); }); // total 1100ms contínuos, ainda em checking
    expect(result.current.time).toBe(1);
  });
});
