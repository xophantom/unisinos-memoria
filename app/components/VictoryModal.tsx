'use client';

import { useEffect, useRef } from 'react';
import { Trophy, Star } from 'lucide-react';
import type { Course } from '../data/courses';
import { formatTime } from '../lib/format';

interface Props {
  moves: number;
  time: number;
  stars: 1 | 2 | 3;
  courses: Course[];
  onRestart: () => void;
  onRestartQuiz: () => void;
}

export default function VictoryModal({ moves, time, stars, courses, onRestart, onRestartQuiz }: Props) {
  const restartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    restartRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vitória"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onRestart();
      }}
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
        <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3" aria-hidden />
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Parabéns!</h2>
        <div className="flex justify-center gap-1 my-3" aria-label={`${stars} de 3 estrelas`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-8 h-8 ${n <= stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-neutral-600">
          Concluído em <strong>{moves} jogadas</strong> · <strong>{formatTime(time)}</strong>
        </p>
        <p className="mt-4 mb-2 text-sm font-semibold text-neutral-500">Nos vemos na Unisinos em:</p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {courses.map((c) => {
            const Icon = c.Icon;
            return (
              <span
                key={c.id}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-full"
              >
                <Icon className="w-3.5 h-3.5" aria-hidden />
                {c.label}
              </span>
            );
          })}
        </div>
        <div className="mt-2 flex flex-col gap-2">
          <button
            ref={restartRef}
            type="button"
            onClick={onRestart}
            className="bg-unisinos hover:bg-unisinos-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            Jogar de novo
          </button>
          <button
            type="button"
            onClick={onRestartQuiz}
            className="text-neutral-500 hover:text-neutral-800 font-semibold text-sm transition-colors"
          >
            Refazer o teste
          </button>
        </div>
      </div>
    </div>
  );
}
