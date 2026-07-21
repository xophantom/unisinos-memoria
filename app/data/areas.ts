import { COURSES, type Course } from './courses';

export type AreaId = 'tecnologia' | 'saude' | 'negocios' | 'artes' | 'ciencias';

export interface Area {
  id: AreaId;
  label: string;
  emoji: string;
  accent: string; // classes de gradiente Tailwind para o reveal/acento
  courseIds: string[];
}

export const PAIRS_PER_GAME = 6;

export const AREAS: Record<AreaId, Area> = {
  tecnologia: {
    id: 'tecnologia',
    label: 'Tecnologia e Engenharia',
    emoji: '💻',
    accent: 'from-blue-500 to-blue-700',
    courseIds: [
      'ads', 'computacao', 'ia', 'sistemas-info', 'sistemas-internet', 'seguranca',
      'gestao-ti', 'eng-computacao', 'eng-automacao', 'eng-civil', 'eng-eletrica',
      'eng-mecanica', 'eng-producao', 'arquitetura', 'gestao-producao',
    ],
  },
  saude: {
    id: 'saude',
    label: 'Saúde e Bem-estar',
    emoji: '❤️',
    accent: 'from-emerald-500 to-emerald-700',
    courseIds: [
      'medicina', 'psicologia', 'enfermagem', 'fisioterapia', 'nutricao', 'farmacia',
      'biomedicina', 'ed-fisica',
    ],
  },
  negocios: {
    id: 'negocios',
    label: 'Negócios, Gestão e Direito',
    emoji: '📈',
    accent: 'from-amber-500 to-orange-600',
    courseIds: [
      'administracao', 'marketing', 'processos', 'gestao-financeira', 'gestao-comercial',
      'rh', 'gestao-publica', 'logistica', 'contabeis', 'comercio-exterior', 'economicas',
      'direito', 'relacoes-internacionais',
    ],
  },
  artes: {
    id: 'artes',
    label: 'Comunicação, Artes e Humanidades',
    emoji: '🎭',
    accent: 'from-fuchsia-500 to-purple-700',
    courseIds: [
      'design', 'jornalismo', 'publicidade', 'jogos', 'gastronomia', 'moda',
      'prod-audiovisual', 'realizacao-audiovisual', 'prod-fonografica', 'relacoes-publicas',
      'letras', 'historia', 'filosofia', 'pedagogia', 'bihat',
    ],
  },
  ciencias: {
    id: 'ciencias',
    label: 'Ciências e Meio Ambiente',
    emoji: '🌎',
    accent: 'from-teal-500 to-teal-700',
    courseIds: [
      'biologia', 'matematica', 'eng-quimica', 'biomedicina', 'farmacia', 'nutricao',
      'eng-civil',
    ],
  },
};

export function getAreaCourses(id: AreaId): Course[] {
  const ids = new Set(AREAS[id].courseIds);
  return COURSES.filter((c) => ids.has(c.id));
}
