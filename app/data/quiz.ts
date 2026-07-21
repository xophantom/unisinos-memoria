import type { AreaId } from './areas';

export type Q1Id = 'tech' | 'saude' | 'empresas' | 'pessoas' | 'natureza';
export type Q2Id = 'construir' | 'cuidar' | 'liderar' | 'produzir' | 'pesquisar';

export interface QuizOption<T> {
  id: T;
  label: string;
  emoji: string;
}
export interface Question<T> {
  id: string;
  prompt: string;
  options: QuizOption<T>[];
}

export const QUESTION_1: Question<Q1Id> = {
  id: 'q1',
  prompt: 'O que mais desperta sua curiosidade?',
  options: [
    { id: 'tech', label: 'Computadores, tecnologia e inovação', emoji: '💻' },
    { id: 'saude', label: 'Saúde e bem-estar', emoji: '❤️' },
    { id: 'empresas', label: 'Empresas, dinheiro e liderança', emoji: '📈' },
    { id: 'pessoas', label: 'Pessoas, comunicação e criatividade', emoji: '🎭' },
    { id: 'natureza', label: 'Natureza, ciência e sustentabilidade', emoji: '🌎' },
  ],
};

export const QUESTION_2: Question<Q2Id> = {
  id: 'q2',
  prompt: 'Qual atividade parece mais legal?',
  options: [
    { id: 'construir', label: 'Construir apps, máquinas ou sistemas', emoji: '🔧' },
    { id: 'cuidar', label: 'Atender e cuidar de pessoas', emoji: '🩺' },
    { id: 'liderar', label: 'Criar um negócio ou liderar uma equipe', emoji: '🚀' },
    { id: 'produzir', label: 'Produzir conteúdo, arte ou projetos', emoji: '🎬' },
    { id: 'pesquisar', label: 'Fazer pesquisas e descobrir coisas novas', emoji: '🔬' },
  ],
};

const DIRECT: Record<Exclude<Q1Id, 'natureza'>, AreaId> = {
  tech: 'tecnologia',
  saude: 'saude',
  empresas: 'negocios',
  pessoas: 'artes',
};

export function resolveArea(p1: Q1Id, p2: Q2Id): AreaId {
  if (p1 === 'natureza') {
    if (p2 === 'construir') return 'tecnologia';
    if (p2 === 'cuidar') return 'saude';
    return 'ciencias'; // pesquisar | liderar | produzir
  }
  return DIRECT[p1];
}
