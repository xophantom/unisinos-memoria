'use client';

import { Trophy } from 'lucide-react';
import { formatTime } from '../lib/format';
import type { BestScore } from '../lib/storage';

interface Props {
  moves: number;
  matches: number;
  totalPairs: number;
  time: number;
  best: BestScore | null;
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="text-center min-w-14">
      <div className="text-xl font-extrabold text-neutral-900 flex items-center gap-1 justify-center">
        {icon && <Trophy className="w-4 h-4 text-amber-400" aria-hidden />}
        {value}
      </div>
      <div className="text-[0.65rem] uppercase tracking-wide text-neutral-400 font-semibold">{label}</div>
    </div>
  );
}

export default function Scoreboard({ moves, matches, totalPairs, time, best }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 bg-white ring-1 ring-black/5 rounded-2xl px-6 py-3 shadow-lg shadow-cobalt-deep/30">
      <Stat label="Jogadas" value={String(moves)} />
      <Stat label="Pares" value={`${matches}/${totalPairs}`} />
      <Stat label="Tempo" value={formatTime(time)} />
      {best?.bestMoves != null && <Stat label="Recorde" value={String(best.bestMoves)} icon />}
      <span className="sr-only" aria-live="polite">
        {matches} de {totalPairs} pares encontrados
      </span>
    </div>
  );
}
