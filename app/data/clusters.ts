import { COURSES, type Course } from './courses';
import { shuffle } from '../lib/deck';

export type ClusterId = 'saber' | 'cuidar' | 'criar' | 'analisar' | 'liderar' | 'desenvolver';

export type LaneId =
  | 'humanas' | 'exatas'
  | 'paciente' | 'ciencia'
  | 'arte' | 'engenharia'
  | 'comunicar' | 'gerir'
  | 'empreender' | 'global'
  | 'software' | 'sistemas';

export interface Lane {
  id: LaneId;
  label: string;
  emoji: string;
  courseIds: string[];
}

export interface Cluster {
  id: ClusterId;
  label: string;
  tagline: string;
  emoji: string;
  accent: string; // gradiente Tailwind (sem vermelho)
  courseIds: string[];
  lanes: [Lane, Lane];
}

export const PAIRS_PER_GAME = 6;

export const CLUSTER_IDS: ClusterId[] = ['saber', 'cuidar', 'criar', 'analisar', 'liderar', 'desenvolver'];

export const CLUSTERS: Record<ClusterId, Cluster> = {
  saber: {
    id: 'saber',
    label: 'Saber, aprender e ensinar',
    tagline: 'Para quem deseja compreender o mundo, produzir conhecimento e formar pessoas.',
    emoji: '📚',
    accent: 'from-indigo-500 to-indigo-700',
    courseIds: ['historia', 'filosofia', 'letras', 'pedagogia', 'matematica', 'biologia'],
    lanes: [
      { id: 'humanas', label: 'Gente, ideias e palavras', emoji: '🗣️', courseIds: ['historia', 'filosofia', 'letras', 'pedagogia'] },
      { id: 'exatas', label: 'Lógica e natureza', emoji: '🔬', courseIds: ['matematica', 'biologia'] },
    ],
  },
  cuidar: {
    id: 'cuidar',
    label: 'Cuidar, nutrir e pesquisar',
    tagline: 'Para quem quer promover saúde, qualidade de vida, cuidado e avanço científico.',
    emoji: '🩺',
    accent: 'from-emerald-500 to-emerald-700',
    courseIds: ['medicina', 'enfermagem', 'fisioterapia', 'psicologia', 'ed-fisica', 'biomedicina', 'farmacia', 'nutricao', 'gastronomia'],
    lanes: [
      { id: 'paciente', label: 'Cuidar de perto do paciente', emoji: '🤝', courseIds: ['medicina', 'enfermagem', 'fisioterapia', 'psicologia', 'ed-fisica'] },
      { id: 'ciencia', label: 'Nutrição, ciência e laboratório', emoji: '🔬', courseIds: ['biomedicina', 'farmacia', 'nutricao', 'gastronomia'] },
    ],
  },
  criar: {
    id: 'criar',
    label: 'Criar, projetar e manusear',
    tagline: 'Para quem transforma ideias em soluções, projetos, produtos e experiências.',
    emoji: '🎨',
    accent: 'from-fuchsia-500 to-purple-700',
    courseIds: ['moda', 'design', 'prod-audiovisual', 'prod-fonografica', 'realizacao-audiovisual', 'bihat', 'arquitetura', 'eng-producao', 'eng-mecanica', 'eng-automacao', 'eng-quimica', 'eng-eletrica', 'eng-civil'],
    lanes: [
      { id: 'arte', label: 'Arte, mídia e design', emoji: '🎨', courseIds: ['moda', 'design', 'prod-audiovisual', 'prod-fonografica', 'realizacao-audiovisual', 'bihat'] },
      { id: 'engenharia', label: 'Engenharia e construção', emoji: '⚙️', courseIds: ['arquitetura', 'eng-producao', 'eng-mecanica', 'eng-automacao', 'eng-quimica', 'eng-eletrica', 'eng-civil'] },
    ],
  },
  analisar: {
    id: 'analisar',
    label: 'Analisar, comunicar e gerir',
    tagline: 'Para quem deseja entender mercados, conectar pessoas e liderar negócios.',
    emoji: '📊',
    accent: 'from-sky-500 to-blue-700',
    courseIds: ['jornalismo', 'marketing', 'publicidade', 'economicas', 'gestao-financeira', 'gestao-comercial', 'contabeis', 'administracao', 'comercio-exterior'],
    lanes: [
      { id: 'comunicar', label: 'Comunicar e influenciar', emoji: '📣', courseIds: ['jornalismo', 'marketing', 'publicidade'] },
      { id: 'gerir', label: 'Analisar números e gerir', emoji: '💼', courseIds: ['economicas', 'gestao-financeira', 'gestao-comercial', 'contabeis', 'administracao', 'comercio-exterior'] },
    ],
  },
  liderar: {
    id: 'liderar',
    label: 'Liderar, empreender e inovar',
    tagline: 'Para quem quer gerar impacto, liderar transformações e atuar em contextos globais.',
    emoji: '🚀',
    accent: 'from-amber-500 to-orange-600',
    courseIds: ['gil', 'agrotecnologia', 'administracao', 'direito', 'relacoes-internacionais', 'comercio-exterior'],
    lanes: [
      { id: 'empreender', label: 'Empreender e inovar', emoji: '🚀', courseIds: ['gil', 'agrotecnologia', 'administracao'] },
      { id: 'global', label: 'Direito e cenário global', emoji: '🌐', courseIds: ['direito', 'relacoes-internacionais', 'comercio-exterior'] },
    ],
  },
  desenvolver: {
    id: 'desenvolver',
    label: 'Desenvolver, programar e sistematizar',
    tagline: 'Para quem deseja criar tecnologias e construir soluções digitais para o futuro.',
    emoji: '💻',
    accent: 'from-cyan-500 to-teal-700',
    courseIds: ['ads', 'jogos', 'ia', 'eng-software', 'design-engineering', 'computacao', 'eng-computacao', 'seguranca'],
    lanes: [
      { id: 'software', label: 'Apps, jogos e IA', emoji: '📱', courseIds: ['ads', 'jogos', 'ia', 'eng-software', 'design-engineering'] },
      { id: 'sistemas', label: 'Sistemas, dados e segurança', emoji: '🛡️', courseIds: ['computacao', 'eng-computacao', 'seguranca'] },
    ],
  },
};

export function getClusterCourses(id: ClusterId): Course[] {
  const ids = new Set(CLUSTERS[id].courseIds);
  return COURSES.filter((c) => ids.has(c.id));
}

export function selectGameCourses(
  cluster: Cluster,
  laneId: LaneId,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): Course[] {
  const byId = new Map(COURSES.map((c) => [c.id, c] as const));
  const toCourses = (ids: string[]): Course[] =>
    ids.map((cid) => byId.get(cid)).filter((c): c is Course => Boolean(c));

  const lane = cluster.lanes.find((l) => l.id === laneId);
  const laneCourses = shuffleFn(toCourses(lane ? lane.courseIds : []));
  if (laneCourses.length >= PAIRS_PER_GAME) return laneCourses.slice(0, PAIRS_PER_GAME);

  const laneSet = new Set(lane ? lane.courseIds : []);
  const rest = shuffleFn(toCourses(cluster.courseIds.filter((cid) => !laneSet.has(cid))));
  return [...laneCourses, ...rest].slice(0, PAIRS_PER_GAME);
}
