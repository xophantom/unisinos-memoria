'use client';

import Card from './Card';
import type { BoardCard } from '../lib/gameReducer';
import type { Difficulty } from '../lib/difficulty';

const GRID: Record<Difficulty, string> = {
  easy: 'grid-cols-3 sm:grid-cols-4',
  medium: 'grid-cols-4 sm:grid-cols-5',
  hard: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8',
};

interface Props {
  cards: BoardCard[];
  difficulty: Difficulty;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Board({ cards, difficulty, locked, onFlip }: Props) {
  return (
    <div className={`grid ${GRID[difficulty]} gap-2 sm:gap-3 w-full`}>
      {cards.map((c) => (
        <Card
          key={c.id}
          id={c.id}
          course={c.course}
          isFlipped={c.isFlipped}
          isMatched={c.isMatched}
          locked={locked}
          onFlip={onFlip}
        />
      ))}
    </div>
  );
}
