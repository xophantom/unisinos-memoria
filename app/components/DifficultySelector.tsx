'use client';

import { DIFFICULTIES, type Difficulty } from '../lib/difficulty';

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Dificuldade" className="flex gap-2">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          aria-pressed={value === d.id}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
            value === d.id
              ? 'bg-unisinos text-white shadow-md scale-105'
              : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
