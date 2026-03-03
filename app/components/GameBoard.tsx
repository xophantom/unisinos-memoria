/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import Card from './Card';
import { COURSES, type Course } from '../data/courses';

interface CardData {
  id: number;
  courseId: string;
  course: Course;
  isFlipped: boolean;
  isMatched: boolean;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { pairs: number; label: string; cols: string }> = {
  easy:   { pairs: 6,  label: 'Fácil',   cols: 'grid-cols-4' },
  medium: { pairs: 10, label: 'Médio',   cols: 'grid-cols-5' },
  hard:   { pairs: 16, label: 'Difícil', cols: 'grid-cols-8' },
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createCards(pairs: number): CardData[] {
  const selected = COURSES.slice(0, pairs);
  const doubled = [...selected, ...selected];
  return shuffle(doubled).map((course, index) => ({
    id: index,
    courseId: course.id,
    course,
    isFlipped: false,
    isMatched: false,
  }));
}

export default function GameBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardData[] | null>(null);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState<Record<Difficulty, number | null>>({ easy: null, medium: null, hard: null });

  const totalPairs = DIFFICULTY_CONFIG[difficulty].pairs;

  // Inicializa as cartas apenas no cliente para evitar hydration mismatch
  useEffect(() => {
    setCards(createCards(DIFFICULTY_CONFIG.easy.pairs));
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (matches > 0 && matches === totalPairs) {
      setIsRunning(false);
      setGameWon(true);
      setBestScore((prev) => {
        const current = prev[difficulty];
        if (current === null || moves < current) return { ...prev, [difficulty]: moves };
        return prev;
      });
    }
  }, [matches, totalPairs, difficulty, moves]);

  const startGame = useCallback((diff: Difficulty = difficulty) => {
    const { pairs } = DIFFICULTY_CONFIG[diff];
    setCards(null);
    setTimeout(() => setCards(createCards(pairs)), 0);
    setFlippedIds([]);
    setMoves(0);
    setMatches(0);
    setIsChecking(false);
    setTime(0);
    setIsRunning(false);
    setGameWon(false);
  }, [difficulty]);

  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    startGame(diff);
  };

  const handleCardClick = useCallback((id: number) => {
    if (isChecking || gameWon) return;
    if (!isRunning) setIsRunning(true);

    setFlippedIds((prev) => {
      if (prev.length === 1 && prev[0] === id) return prev;
      if (prev.length === 2) return prev;
      return [...prev, id];
    });

    setCards((prev) =>
      prev ? prev.map((card) => (card.id === id ? { ...card, isFlipped: true } : card)) : prev
    );
  }, [isChecking, gameWon, isRunning]);

  useEffect(() => {
    if (flippedIds.length !== 2) return;

    setIsChecking(true);
    setMoves((m) => m + 1);

    const [id1, id2] = flippedIds;
    const card1 = cards?.find((c) => c.id === id1);
    const card2 = cards?.find((c) => c.id === id2);

    if (card1 && card2 && card1.courseId === card2.courseId) {
      setTimeout(() => {
        setCards((prev) =>
          prev ? prev.map((card) =>
            card.id === id1 || card.id === id2 ? { ...card, isMatched: true, isFlipped: true } : card
          ) : prev
        );
        setMatches((m) => m + 1);
        setFlippedIds([]);
        setIsChecking(false);
      }, 500);
    } else {
      setTimeout(() => {
        setCards((prev) =>
          prev ? prev.map((card) =>
            card.id === id1 || card.id === id2 ? { ...card, isFlipped: false } : card
          ) : prev
        );
        setFlippedIds([]);
        setIsChecking(false);
      }, 1000);
    }
  }, [flippedIds]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const { cols } = DIFFICULTY_CONFIG[difficulty];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-lg">Jogo da Memória</h1>
        <p className="text-indigo-200">Encontre os pares de cursos!</p>
      </div>

      {/* Dificuldade */}
      <div className="flex gap-2">
        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
          <button
            key={diff}
            onClick={() => handleDifficultyChange(diff)}
            className={`px-4 py-2 rounded-full font-semibold transition-all text-sm ${
              difficulty === diff
                ? 'bg-white text-indigo-700 shadow-lg scale-105'
                : 'bg-indigo-700 text-indigo-200 hover:bg-indigo-600'
            }`}
          >
            {DIFFICULTY_CONFIG[diff].label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-6 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-4 text-white">
        <div className="text-center">
          <div className="text-2xl font-bold">{moves}</div>
          <div className="text-xs text-indigo-200 uppercase tracking-wide">Jogadas</div>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-bold">{matches}/{totalPairs}</div>
          <div className="text-xs text-indigo-200 uppercase tracking-wide">Pares</div>
        </div>
        <div className="w-px bg-white/20" />
        <div className="text-center">
          <div className="text-2xl font-bold">{formatTime(time)}</div>
          <div className="text-xs text-indigo-200 uppercase tracking-wide">Tempo</div>
        </div>
        {bestScore[difficulty] !== null && (
          <>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold flex items-center gap-1 justify-center">
                <Trophy className="w-5 h-5 text-yellow-400" />
                {bestScore[difficulty]}
              </div>
              <div className="text-xs text-indigo-200 uppercase tracking-wide">Recorde</div>
            </div>
          </>
        )}
      </div>

      {/* Tela de vitória */}
      {gameWon && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10">
          <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm mx-4">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Parabéns!</h2>
            <p className="text-gray-600 mb-1">Concluído em <strong>{moves} jogadas</strong></p>
            <p className="text-gray-600 mb-6">Tempo: <strong>{formatTime(time)}</strong></p>
            <button
              onClick={() => startGame()}
              className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors"
            >
              Jogar novamente
            </button>
          </div>
        </div>
      )}

      {/* Board */}
      <div className={`grid ${cols} gap-3 w-full`}>
        {cards
          ? cards.map((card) => (
              <Card
                key={card.id}
                id={card.id}
                course={card.course}
                isFlipped={card.isFlipped}
                isMatched={card.isMatched}
                onClick={handleCardClick}
              />
            ))
          : Array.from({ length: DIFFICULTY_CONFIG[difficulty].pairs * 2 }).map((_, i) => (
              <div key={i} className="w-full aspect-square rounded-xl bg-white/10 animate-pulse" />
            ))}
      </div>

      {/* Botão reiniciar */}
      <button
        onClick={() => startGame()}
        className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-full transition-all backdrop-blur-sm"
      >
        <RotateCcw className="w-4 h-4" />
        Reiniciar
      </button>
    </div>
  );
}
