'use client';

import { useEffect, useRef } from 'react';
import type { Cluster, LaneId } from '../data/clusters';

interface Props {
  cluster: Cluster;
  laneId: LaneId;
  onStart: () => void;
}

export default function ClusterReveal({ cluster, laneId, onStart }: Props) {
  const lane = cluster.lanes.find((l) => l.id === laneId);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
      <div className="text-6xl" aria-hidden>{cluster.emoji}</div>
      <p className="text-neutral-500 font-semibold">Você tem tudo a ver com</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-br ${cluster.accent} bg-clip-text text-transparent focus:outline-none`}
      >
        {cluster.label}
      </h2>
      {lane && (
        <p className="text-neutral-600">
          E, dentro dele, com o lado <strong>{lane.label}</strong>.
        </p>
      )}
      <p className="text-neutral-600">Bora achar os pares desses cursos?</p>
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
