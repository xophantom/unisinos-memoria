'use client';

import { useState } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import ClusterReveal from './ClusterReveal';
import GameBoard from './GameBoard';
import { CLUSTERS, type ClusterId, type LaneId } from '../data/clusters';

type Phase = 'quiz' | 'reveal' | 'game';

export default function GameFlow() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<{ clusterId: ClusterId; laneId: LaneId } | null>(null);

  const cluster = answers ? CLUSTERS[answers.clusterId] : null;

  const restartQuiz = () => {
    setAnswers(null);
    setPhase('quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4 py-8">
      <Header />

      {phase === 'quiz' && (
        <Quiz
          onComplete={(clusterId, laneId) => {
            setAnswers({ clusterId, laneId });
            setPhase('reveal');
          }}
        />
      )}

      {phase === 'reveal' && cluster && answers && (
        <ClusterReveal cluster={cluster} laneId={answers.laneId} onStart={() => setPhase('game')} />
      )}

      {phase === 'game' && cluster && answers && (
        <GameBoard cluster={cluster} laneId={answers.laneId} onRestartQuiz={restartQuiz} />
      )}
    </div>
  );
}
