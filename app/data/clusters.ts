import { COURSES, type Course } from './courses';

export type ClusterId = 'saber' | 'cuidar' | 'criar' | 'analisar' | 'liderar' | 'desenvolver';

export interface Cluster {
  id: ClusterId;
  label: string;
  mission: string; // frase da P1 ("Você tem uma missão para o seu futuro. Qual será?")
  tagline: string;
  emoji: string;
  accent: string; // gradiente Tailwind (sem vermelho)
  courseIds: string[];
}

// Ordem oficial (planilha CURSOS E CLUSTERS 2027.1).
export const CLUSTER_IDS: ClusterId[] = ['saber', 'cuidar', 'criar', 'analisar', 'liderar', 'desenvolver'];

export const CLUSTERS: Record<ClusterId, Cluster> = {
  saber: {
    id: 'saber',
    label: 'Aprender e ensinar',
    mission: 'Compreender o mundo, produzir conhecimento e formar pessoas.',
    tagline: 'Para quem deseja compreender o mundo, produzir conhecimento e formar pessoas.',
    emoji: '📚',
    accent: 'from-indigo-500 to-indigo-700',
    courseIds: ['historia', 'pedagogia', 'filosofia', 'letras', 'matematica', 'biologia'],
  },
  cuidar: {
    id: 'cuidar',
    label: 'Cuidar e nutrir',
    mission: 'Promover saúde, qualidade de vida, cuidado e avanço científico.',
    tagline: 'Para quem quer promover saúde, qualidade de vida, cuidado e avanço científico.',
    emoji: '🩺',
    accent: 'from-emerald-500 to-emerald-700',
    courseIds: ['farmacia', 'fisioterapia', 'nutricao', 'enfermagem', 'biomedicina', 'psicologia', 'ed-fisica', 'gastronomia', 'medicina'],
  },
  criar: {
    id: 'criar',
    label: 'Criar e projetar',
    mission: 'Transformar ideias em soluções, projetos, produtos e experiências.',
    tagline: 'Para quem transforma ideias em soluções, projetos, produtos e experiências.',
    emoji: '🎨',
    accent: 'from-fuchsia-500 to-purple-700',
    courseIds: ['moda', 'arquitetura', 'realizacao-audiovisual', 'prod-audiovisual', 'prod-fonografica', 'design', 'bihat', 'jogos', 'design-tec-negocios'],
  },
  analisar: {
    id: 'analisar',
    label: 'Comunicar e gerir',
    mission: 'Entender mercados, conectar pessoas e liderar negócios.',
    tagline: 'Para quem deseja entender mercados, conectar pessoas e liderar negócios.',
    emoji: '📊',
    accent: 'from-sky-500 to-blue-700',
    courseIds: ['jornalismo', 'economicas', 'gestao-financeira', 'marketing', 'gestao-comercial', 'contabeis', 'administracao', 'publicidade', 'comercio-exterior'],
  },
  liderar: {
    id: 'liderar',
    label: 'Liderar e mediar',
    mission: 'Gerar impacto, liderar transformações e atuar em contextos globais.',
    tagline: 'Para quem quer gerar impacto, liderar transformações e atuar em contextos globais.',
    emoji: '🚀',
    accent: 'from-amber-500 to-orange-600',
    courseIds: ['gil', 'direito', 'relacoes-internacionais', 'gestao-tec-agro'],
  },
  desenvolver: {
    id: 'desenvolver',
    label: 'Desenvolver e solucionar',
    mission: 'Criar tecnologias e construir soluções digitais para o futuro.',
    tagline: 'Para quem deseja criar tecnologias e construir soluções digitais para o futuro.',
    emoji: '💻',
    accent: 'from-cyan-500 to-teal-700',
    courseIds: ['eng-software', 'eng-computacao', 'seguranca', 'ia', 'computacao', 'ads', 'eng-producao', 'eng-mecanica', 'eng-automacao', 'eng-quimica', 'eng-eletrica', 'eng-civil'],
  },
};

// Cursos da partida (tabuleiro de tamanho variável = nº de cursos do cluster).
export function getClusterCourses(id: ClusterId): Course[] {
  const ids = new Set(CLUSTERS[id].courseIds);
  return COURSES.filter((c) => ids.has(c.id));
}
