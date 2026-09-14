'use client';

import type { Course } from '../data/courses';

interface CardProps {
  id: number;
  course: Course;
  gradient: string;
  isFlipped: boolean;
  isMatched: boolean;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Card({ id, course, gradient, isFlipped, isMatched, locked, onFlip }: CardProps) {
  const { Icon, label } = course;
  const faceUp = isFlipped || isMatched;
  const ariaLabel = faceUp ? label : 'Carta fechada';

  const handleClick = () => {
    if (faceUp || locked) return;
    onFlip(id);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={faceUp}
      onClick={handleClick}
      className="group w-full aspect-square perspective-1000 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
    >
      <div
        className={`card-flip relative w-full h-full transition-transform duration-500 transform-style-3d ${
          faceUp ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente (fechada) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-unisinos to-unisinos-dark flex items-center justify-center shadow-md ring-1 ring-white/25 group-hover:brightness-110 transition">
          <span className="text-white/90 text-2xl font-black select-none">?</span>
        </div>

        {/* Verso (curso) — cor do cluster */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex flex-col items-center justify-center gap-1 p-1.5 shadow-md text-white ring-1 transition ${
            isMatched
              ? 'ring-2 ring-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-600'
              : `ring-white/20 bg-gradient-to-br ${gradient}`
          }`}
        >
          <Icon className="w-1/3 h-1/3 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="text-center font-semibold leading-tight select-none text-[clamp(0.5rem,1.6vw,0.8rem)]">
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}
