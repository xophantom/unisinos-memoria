import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { CLUSTERS } from '../data/clusters';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('monta o tabuleiro com os cursos do lado escolhido (criar/criatividade = 7 pares) e vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.criar, 'criatividade'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(14);
    expect(result.current.state.totalPairs).toBe(7);
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('tabuleiro de tamanho variável — cluster sem P2 usa todos os cursos (liderar = 4 pares)', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.liderar));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(8);
    expect(result.current.state.totalPairs).toBe(4);
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
    act(() => { vi.advanceTimersByTime(2500); }); // fim da espiada
    act(() => { result.current.flip(0); });
    act(() => { vi.advanceTimersByTime(900); });
    act(() => { result.current.flip(1); });
    act(() => { vi.advanceTimersByTime(200); }); // total 1100ms contínuos, ainda em checking
    expect(result.current.time).toBe(1);
  });
});
