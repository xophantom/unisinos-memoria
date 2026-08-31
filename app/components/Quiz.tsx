'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTION_1, getQuestion2 } from '../data/quiz';
import { CLUSTERS, type ClusterId, type LaneId } from '../data/clusters';

interface Props {
  onComplete: (clusterId: ClusterId, laneId?: LaneId) => void;
}

export default function Quiz({ onComplete }: Props) {
  const [clusterId, setClusterId] = useState<ClusterId | null>(null);
  const q2 = clusterId ? getQuestion2(clusterId) : null;
  const step = clusterId && q2 ? 2 : 1;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // Só o "criar" tem P2; os demais vão direto para o jogo.
  const selectCluster = (id: ClusterId) => {
    if (CLUSTERS[id].lanes) setClusterId(id);
    else onComplete(id);
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      {step === 1 ? (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-extrabold text-neutral-900 text-center focus:outline-none"
          >
            {QUESTION_1.prompt}
          </h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_1.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => selectCluster(o.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl shrink-0" aria-hidden>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        q2 && clusterId && (
          <>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-extrabold text-neutral-900 text-center focus:outline-none"
            >
              {q2.prompt}
            </h2>
            <div className="flex flex-col gap-3 w-full">
              {q2.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onComplete(clusterId, o.id)}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
                >
                  <span className="text-2xl" aria-hidden>{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setClusterId(null)}
              className="flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Voltar
            </button>
          </>
        )
      )}
    </div>
  );
}
