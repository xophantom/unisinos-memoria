'use client';

import { useEffect, useRef } from 'react';
import { QUESTION_1 } from '../data/quiz';
import type { ClusterId } from '../data/clusters';

interface Props {
  onComplete: (clusterId: ClusterId) => void;
}

export default function Quiz({ onComplete }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-extrabold text-white text-center focus:outline-none"
      >
        {QUESTION_1.prompt}
      </h2>
      <div className="flex flex-col gap-3 w-full">
        {QUESTION_1.options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onComplete(o.id)}
            className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-black/5 shadow-lg shadow-cobalt-deep/30 hover:ring-unisinos hover:-translate-y-0.5 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
          >
            <span className="text-2xl shrink-0" aria-hidden>{o.emoji}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
