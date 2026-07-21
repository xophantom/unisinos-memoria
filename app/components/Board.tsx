'use client';

import Card from './Card';
import type { BoardCard } from '../lib/gameReducer';

interface Props {
  cards: BoardCard[];
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Board({ cards, locked, onFlip }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
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
