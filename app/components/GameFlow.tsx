'use client';

import { useState } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import ClusterReveal from './ClusterReveal';
import GameBoard from './GameBoard';
import { CLUSTERS, type ClusterId } from '../data/clusters';

type Phase = 'quiz' | 'reveal' | 'game';

export default function GameFlow() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [clusterId, setClusterId] = useState<ClusterId | null>(null);

  const cluster = clusterId ? CLUSTERS[clusterId] : null;

  const restartQuiz = () => {
    setClusterId(null);
    setPhase('quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4 py-8">
      <Header />

      {phase === 'quiz' && (
        <Quiz
          onComplete={(id) => {
            setClusterId(id);
            setPhase('reveal');
          }}
        />
      )}

      {phase === 'reveal' && cluster && (
        <ClusterReveal cluster={cluster} onStart={() => setPhase('game')} />
      )}

      {phase === 'game' && cluster && (
        <GameBoard cluster={cluster} onRestartQuiz={restartQuiz} />
      )}
    </div>
  );
}
