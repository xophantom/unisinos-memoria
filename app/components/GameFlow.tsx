'use client';

import { useState } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import AreaReveal from './AreaReveal';
import GameBoard from './GameBoard';
import { resolveArea, type Q1Id, type Q2Id } from '../data/quiz';
import { AREAS } from '../data/areas';

type Phase = 'quiz' | 'reveal' | 'game';

export default function GameFlow() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<{ p1: Q1Id; p2: Q2Id } | null>(null);

  const area = answers ? AREAS[resolveArea(answers.p1, answers.p2)] : null;

  const restartQuiz = () => {
    setAnswers(null);
    setPhase('quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4 py-8">
      <Header />

      {phase === 'quiz' && (
        <Quiz
          onComplete={(p1, p2) => {
            setAnswers({ p1, p2 });
            setPhase('reveal');
          }}
        />
      )}

      {phase === 'reveal' && area && answers && (
        <AreaReveal area={area} p1={answers.p1} p2={answers.p2} onStart={() => setPhase('game')} />
      )}

      {phase === 'game' && area && <GameBoard area={area} onRestartQuiz={restartQuiz} />}
    </div>
  );
}
