import { CLUSTERS, CLUSTER_IDS, type ClusterId, type LaneId } from './clusters';

export interface QuizOption<T> {
  id: T;
  label: string;
  emoji: string;
  sublabel?: string;
}
export interface Question<T> {
  prompt: string;
  options: QuizOption<T>[];
}

export const QUESTION_1: Question<ClusterId> = {
  prompt: 'Qual desses combina mais com você?',
  options: CLUSTER_IDS.map((id) => ({
    id,
    label: CLUSTERS[id].label,
    emoji: CLUSTERS[id].emoji,
    sublabel: CLUSTERS[id].tagline,
  })),
};

export function getQuestion2(clusterId: ClusterId): Question<LaneId> {
  const cluster = CLUSTERS[clusterId];
  return {
    prompt: `Dentro de "${cluster.label}", você é mais...`,
    options: cluster.lanes.map((l) => ({ id: l.id, label: l.label, emoji: l.emoji })),
  };
}
