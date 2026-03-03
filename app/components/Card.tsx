'use client';

import type { Course } from '../data/courses';

interface CardProps {
  id: number;
  course: Course;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: (id: number) => void;
}

export default function Card({ id, course, isFlipped, isMatched, onClick }: CardProps) {
  const { Icon, label, bg, text } = course;

  return (
    <div
      className="w-full aspect-square cursor-pointer perspective-1000"
      onClick={() => !isFlipped && !isMatched && onClick(id)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped || isMatched ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente da carta (fechada) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-indigo-400 hover:from-indigo-400 hover:to-purple-500 transition-colors">
          <span className="text-white text-2xl font-bold select-none">?</span>
        </div>

        {/* Verso da carta (curso) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex flex-col items-center justify-center gap-1 shadow-lg border-2 transition-colors p-1 ${
            isMatched
              ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-300 text-white'
              : `bg-gradient-to-br ${bg} border-white/20 ${text}`
          }`}
        >
          <Icon className="w-1/3 h-1/3 shrink-0" strokeWidth={1.5} />
          <span className="text-center font-semibold leading-tight select-none whitespace-pre-line text-[clamp(0.45rem,1.5vw,0.75rem)]">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
