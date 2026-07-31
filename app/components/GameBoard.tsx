'use client';

import { RotateCcw } from 'lucide-react';
import Scoreboard from './Scoreboard';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { PAIRS_PER_GAME, type Cluster, type LaneId } from '../data/clusters';
import { calcStars } from '../lib/scoring';
import type { Course } from '../data/courses';

interface Props {
  cluster: Cluster;
  laneId: LaneId;
  onRestartQuiz: () => void;
}

export default function GameBoard({ cluster, laneId, onRestartQuiz }: Props) {
  const { state, time, records, flip, restart } = useMemoryGame(cluster, laneId);

  const locked = state.phase !== 'playing';
  const best = records ? records[cluster.id] : null;
  const won = state.phase === 'won';
  const stars = calcStars(state.moves, PAIRS_PER_GAME);
  const coursesInGame: Course[] = won
    ? Array.from(new Map(state.cards.map((c) => [c.course.id, c.course])).values())
    : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="contents" inert={won || undefined}>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <span className="text-lg" aria-hidden>{cluster.emoji}</span>
          {cluster.label}
        </div>

        <Scoreboard
          moves={state.moves}
          matches={state.matches}
          totalPairs={PAIRS_PER_GAME}
          time={time}
          best={best}
        />

        {state.cards.length > 0 ? (
          <Board cards={state.cards} gradient={cluster.accent} locked={locked} onFlip={flip} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
            {Array.from({ length: PAIRS_PER_GAME * 2 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-neutral-200 animate-pulse" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-2 px-6 py-3 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-full transition-all"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            Reiniciar
          </button>
          <button
            type="button"
            onClick={onRestartQuiz}
            className="px-6 py-3 text-neutral-500 hover:text-neutral-800 font-semibold rounded-full transition-colors"
          >
            Refazer o teste
          </button>
        </div>
      </div>

      {won && (
        <VictoryModal
          moves={state.moves}
          time={time}
          stars={stars}
          courses={coursesInGame}
          onRestart={restart}
          onRestartQuiz={onRestartQuiz}
        />
      )}
    </div>
  );
}
