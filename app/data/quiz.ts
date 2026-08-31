import { CLUSTERS, CLUSTER_IDS, type ClusterId } from './clusters';

export interface QuizOption<T> {
  id: T;
  label: string;
  emoji: string;
}
export interface Question<T> {
  prompt: string;
  options: QuizOption<T>[];
}

// P1 (única pergunta): o aluno escolhe a missão; o nome do cluster só aparece no resultado.
export const QUESTION_1: Question<ClusterId> = {
  prompt: 'Você tem uma missão para o seu futuro. Qual será?',
  options: CLUSTER_IDS.map((id) => ({
    id,
    label: CLUSTERS[id].mission,
    emoji: CLUSTERS[id].emoji,
  })),
};
