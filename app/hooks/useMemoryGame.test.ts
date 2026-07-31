import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { CLUSTERS } from '../data/clusters';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('inicia em peek com 12 cartas (6 pares) e vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.criar, 'engenharia'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(12);
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.cuidar, 'paciente'));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });

  it('cronômetro continua contando na transição playing → checking', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.analisar, 'gerir'));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { vi.advanceTimersByTime(2500); }); // fim da espiada
    act(() => { result.current.flip(0); });
    act(() => { vi.advanceTimersByTime(900); });
    act(() => { result.current.flip(1); });
    act(() => { vi.advanceTimersByTime(200); }); // total 1100ms contínuos, ainda em checking
    expect(result.current.time).toBe(1);
  });
});
