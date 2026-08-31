/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { gameReducer, initialState, type GameState } from '../lib/gameReducer';
import { buildDeck } from '../lib/deck';
import { getGameCourses, type Cluster, type LaneId } from '../data/clusters';
import { saveResult, loadRecords, type Records } from '../lib/storage';

const PEEK_MS = 2500;
const MATCH_MS = 500;
const MISMATCH_MS = 1000;

export function useMemoryGame(cluster: Cluster, laneId?: LaneId): {
  state: GameState;
  time: number;
  records: Records | null;
  flip: (id: number) => void;
  restart: () => void;
} {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [time, setTime] = useState(0);
  const [records, setRecords] = useState<Records | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const newGame = useCallback((c: Cluster, lane?: LaneId) => {
    savedRef.current = false;
    setTime(0);
    const courses = getGameCourses(c, lane);
    dispatch({
      type: 'NEW_GAME',
      cards: buildDeck(courses.length, courses),
      totalPairs: courses.length,
    });
  }, []);

  // (re)inicia ao trocar cluster/caminho e na montagem
  useEffect(() => {
    newGame(cluster, laneId);
  }, [cluster, laneId, newGame]);

  // fim da espiada — reinicia a cada novo jogo (state.gameId muda)
  useEffect(() => {
    if (state.phase !== 'peek') return;
    const t = setTimeout(() => dispatch({ type: 'END_PEEK' }), PEEK_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.gameId]);

  // resolve o par após duas cartas viradas
  useEffect(() => {
    if (state.phase !== 'checking') return;
    const [id1, id2] = state.flipped;
    const c1 = state.cards.find((c) => c.id === id1);
    const c2 = state.cards.find((c) => c.id === id2);
    const isMatch = !!c1 && !!c2 && c1.course.id === c2.course.id;
    const t = setTimeout(() => dispatch({ type: 'RESOLVE' }), isMatch ? MATCH_MS : MISMATCH_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.flipped, state.cards]);

  // cronômetro contínuo durante playing/checking, após o primeiro flip
  const started = state.moves > 0 || state.flipped.length > 0;
  const isTicking = started && (state.phase === 'playing' || state.phase === 'checking');
  useEffect(() => {
    if (!isTicking) return;
    const iv = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [isTicking]);

  // persiste recorde do cluster ao vencer (uma vez)
  useEffect(() => {
    if (state.phase === 'won' && !savedRef.current) {
      savedRef.current = true;
      setRecords(saveResult(cluster.id, { moves: state.moves, time }));
    }
  }, [state.phase, cluster.id, state.moves, time]);

  const flip = useCallback((id: number) => dispatch({ type: 'FLIP', id }), []);
  const restart = useCallback(() => newGame(cluster, laneId), [newGame, cluster, laneId]);

  return { state, time, records, flip, restart };
}
