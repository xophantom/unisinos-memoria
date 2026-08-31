import { CLUSTERS, CLUSTER_IDS, type ClusterId, type LaneId } from './clusters';

export interface QuizOption<T> {
  id: T;
  label: string;
  emoji: string;
}
export interface Question<T> {
  prompt: string;
  options: QuizOption<T>[];
}

// P1: o aluno escolhe a missão; o nome do cluster só aparece no resultado.
export const QUESTION_1: Question<ClusterId> = {
  prompt: 'Você tem uma missão para o seu futuro. Qual será?',
  options: CLUSTER_IDS.map((id) => ({
    id,
    label: CLUSTERS[id].mission,
    emoji: CLUSTERS[id].emoji,
  })),
};

// P2: só existe no cluster "criar" (2 caminhos). Nos demais, devolve null.
export function getQuestion2(clusterId: ClusterId): Question<LaneId> | null {
  const cluster = CLUSTERS[clusterId];
  if (!cluster.lanes) return null;
  return {
    prompt: 'Você se identifica mais com:',
    options: cluster.lanes.map((l) => ({ id: l.id, label: l.label, emoji: l.emoji })),
  };
}
