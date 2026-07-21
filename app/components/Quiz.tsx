'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTION_1, QUESTION_2, type Q1Id, type Q2Id } from '../data/quiz';

interface Props {
  onComplete: (p1: Q1Id, p2: Q2Id) => void;
}

export default function Quiz({ onComplete }: Props) {
  const [p1, setP1] = useState<Q1Id | null>(null);
  const step = p1 === null ? 1 : 2;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <div className="text-xs font-bold uppercase tracking-wide text-unisinos">Pergunta {step} de 2</div>

      {step === 1 ? (
        <>
          <h2 className="text-2xl font-extrabold text-neutral-900 text-center">{QUESTION_1.prompt}</h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_1.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setP1(o.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl" aria-hidden>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-neutral-900 text-center">{QUESTION_2.prompt}</h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_2.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onComplete(p1 as Q1Id, o.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl" aria-hidden>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setP1(null)}
            className="flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Voltar
          </button>
        </>
      )}
    </div>
  );
}
