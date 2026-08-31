import { COURSES, type Course } from './courses';

export type ClusterId = 'saber' | 'cuidar' | 'criar' | 'analisar' | 'liderar' | 'desenvolver';

// Só o cluster "criar" tem 2 caminhos (P2).
export type LaneId = 'engenharias' | 'criatividade';

export interface Lane {
  id: LaneId;
  label: string;
  emoji: string;
  courseIds: string[];
}

export interface Cluster {
  id: ClusterId;
  label: string;
  mission: string; // frase da P1 ("Você tem uma missão para o seu futuro. Qual será?")
  tagline: string;
  emoji: string;
  accent: string; // gradiente Tailwind (sem vermelho)
  courseIds: string[];
  lanes?: [Lane, Lane]; // presente apenas em "criar"
}

export const CLUSTER_IDS: ClusterId[] = ['saber', 'cuidar', 'criar', 'analisar', 'liderar', 'desenvolver'];

export const CLUSTERS: Record<ClusterId, Cluster> = {
  saber: {
    id: 'saber',
    label: 'Saber, aprender e ensinar',
    mission: 'Compreender o mundo, produzir conhecimento e formar pessoas.',
    tagline: 'Para quem deseja compreender o mundo, produzir conhecimento e formar pessoas.',
    emoji: '📚',
    accent: 'from-indigo-500 to-indigo-700',
    courseIds: ['historia', 'filosofia', 'letras', 'pedagogia', 'matematica', 'biologia'],
  },
  cuidar: {
    id: 'cuidar',
    label: 'Cuidar, nutrir e pesquisar',
    mission: 'Promover saúde, qualidade de vida, cuidado e avanço científico.',
    tagline: 'Para quem quer promover saúde, qualidade de vida, cuidado e avanço científico.',
    emoji: '🩺',
    accent: 'from-emerald-500 to-emerald-700',
    courseIds: ['medicina', 'enfermagem', 'fisioterapia', 'psicologia', 'ed-fisica', 'biomedicina', 'farmacia', 'nutricao', 'gastronomia'],
  },
  criar: {
    id: 'criar',
    label: 'Criar, projetar e manusear',
    mission: 'Transformar ideias em soluções, projetos, produtos e experiências.',
    tagline: 'Para quem transforma ideias em soluções, projetos, produtos e experiências.',
    emoji: '🎨',
    accent: 'from-fuchsia-500 to-purple-700',
    courseIds: ['moda', 'arquitetura', 'realizacao-audiovisual', 'prod-audiovisual', 'prod-fonografica', 'design', 'bihat', 'eng-producao', 'eng-mecanica', 'eng-automacao', 'eng-quimica', 'eng-eletrica', 'eng-civil'],
    lanes: [
      { id: 'engenharias', label: 'Engenharias', emoji: '⚙️', courseIds: ['eng-producao', 'eng-mecanica', 'eng-automacao', 'eng-quimica', 'eng-eletrica', 'eng-civil'] },
      { id: 'criatividade', label: 'Criatividade', emoji: '🎨', courseIds: ['moda', 'arquitetura', 'realizacao-audiovisual', 'prod-audiovisual', 'prod-fonografica', 'design', 'bihat'] },
    ],
  },
  analisar: {
    id: 'analisar',
    label: 'Analisar, comunicar e gerir',
    mission: 'Entender mercados, conectar pessoas e liderar negócios.',
    tagline: 'Para quem deseja entender mercados, conectar pessoas e liderar negócios.',
    emoji: '📊',
    accent: 'from-sky-500 to-blue-700',
    courseIds: ['jornalismo', 'marketing', 'publicidade', 'economicas', 'gestao-financeira', 'gestao-comercial', 'contabeis', 'administracao', 'comercio-exterior'],
  },
  liderar: {
    id: 'liderar',
    label: 'Liderar, empreender e inovar',
    mission: 'Gerar impacto, liderar transformações e atuar em contextos globais.',
    tagline: 'Para quem quer gerar impacto, liderar transformações e atuar em contextos globais.',
    emoji: '🚀',
    accent: 'from-amber-500 to-orange-600',
    courseIds: ['gil', 'agrotecnologia', 'direito', 'relacoes-internacionais'],
  },
  desenvolver: {
    id: 'desenvolver',
    label: 'Desenvolver, programar e sistematizar',
    mission: 'Criar tecnologias e construir soluções digitais para o futuro.',
    tagline: 'Para quem deseja criar tecnologias e construir soluções digitais para o futuro.',
    emoji: '💻',
    accent: 'from-cyan-500 to-teal-700',
    courseIds: ['ads', 'jogos', 'ia', 'eng-software', 'design-engineering', 'computacao', 'eng-computacao', 'seguranca'],
  },
};

export function getClusterCourses(id: ClusterId): Course[] {
  const ids = new Set(CLUSTERS[id].courseIds);
  return COURSES.filter((c) => ids.has(c.id));
}

// Cursos da partida (tabuleiro de tamanho variável): no "criar" usa o lado
// escolhido; nos demais clusters, o cluster inteiro.
export function getGameCourses(cluster: Cluster, laneId?: LaneId): Course[] {
  const lane = cluster.lanes && laneId ? cluster.lanes.find((l) => l.id === laneId) : undefined;
  const ids = new Set(lane ? lane.courseIds : cluster.courseIds);
  return COURSES.filter((c) => ids.has(c.id));
}
