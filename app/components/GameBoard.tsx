'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Header from './Header';
import DifficultySelector from './DifficultySelector';
import Scoreboard from './Scoreboard';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { PAIRS, type Difficulty } from '../lib/difficulty';
import { calcStars } from '../lib/scoring';
import { getSchool, type SchoolId } from '../data/schools';

export default function GameBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { state, time, records, flip, restart } = useMemoryGame(difficulty);

  const totalPairs = PAIRS[difficulty];
  const locked = state.phase !== 'playing';
  const best = records ? records[difficulty] : null;
  const won = state.phase === 'won';
  const stars = calcStars(state.moves, totalPairs);
  const schoolsInGame = won
    ? Array.from(new Set(state.cards.map((c) => c.course.schoolId))).map((id: SchoolId) => getSchool(id))
    : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 py-8">
      <Header />
      <DifficultySelector value={difficulty} onChange={setDifficulty} />
      <Scoreboard
        moves={state.moves}
        matches={state.matches}
        totalPairs={totalPairs}
        time={time}
        best={best}
      />

      {state.cards.length > 0 ? (
        <Board cards={state.cards} difficulty={difficulty} locked={locked} onFlip={flip} />
      ) : (
        <div className="grid grid-cols-4 gap-3 w-full">
          {Array.from({ length: totalPairs * 2 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-neutral-200 animate-pulse" />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={restart}
        className="flex items-center gap-2 px-6 py-3 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-full transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Reiniciar
      </button>

      {won && (
        <VictoryModal
          moves={state.moves}
          time={time}
          stars={stars}
          schools={schoolsInGame}
          onRestart={restart}
        />
      )}
    </div>
  );
}
