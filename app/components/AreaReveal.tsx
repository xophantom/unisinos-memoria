'use client';

import type { Area } from '../data/areas';
import { QUESTION_1, QUESTION_2, type Q1Id, type Q2Id } from '../data/quiz';

interface Props {
  area: Area;
  p1: Q1Id;
  p2: Q2Id;
  onStart: () => void;
}

export default function AreaReveal({ area, p1, p2, onStart }: Props) {
  const l1 = QUESTION_1.options.find((o) => o.id === p1)?.label ?? '';
  const l2 = QUESTION_2.options.find((o) => o.id === p2)?.label ?? '';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
      <div className="text-6xl" aria-hidden>{area.emoji}</div>
      <p className="text-neutral-500 font-semibold">Você tem tudo a ver com</p>
      <h2 className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-br ${area.accent} bg-clip-text text-transparent`}>
        {area.label}
      </h2>
      <p className="text-sm text-neutral-500">
        {l1} + {l2}
      </p>
      <p className="text-neutral-600">Bora achar os pares dos cursos dessa área?</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 bg-unisinos hover:bg-unisinos-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
      >
        Começar a jogar
      </button>
    </div>
  );
}
