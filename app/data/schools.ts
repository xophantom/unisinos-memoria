import { Cpu, HeartPulse, Briefcase, Palette, Scale, Earth } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SchoolId = 'politecnica' | 'saude' | 'gestao' | 'artes' | 'direito' | 'direito-ri';

export interface School {
  id: SchoolId;
  label: string;
  short: string;
  gradient: string;
  Icon: LucideIcon;
}

export const SCHOOLS: Record<SchoolId, School> = {
  politecnica: { id: 'politecnica', label: 'Politécnica', short: 'Politécnica', gradient: 'from-blue-500 to-blue-700', Icon: Cpu },
  saude:       { id: 'saude', label: 'Saúde', short: 'Saúde', gradient: 'from-emerald-500 to-emerald-700', Icon: HeartPulse },
  gestao:      { id: 'gestao', label: 'Gestão e Negócios', short: 'Gestão', gradient: 'from-amber-500 to-orange-600', Icon: Briefcase },
  artes:       { id: 'artes', label: 'Artes, Humanidades e Economia Criativa', short: 'Artes & Humanidades', gradient: 'from-fuchsia-500 to-purple-700', Icon: Palette },
  direito:     { id: 'direito', label: 'Direito', short: 'Direito', gradient: 'from-indigo-500 to-indigo-700', Icon: Scale },
  'direito-ri': { id: 'direito-ri', label: 'Direito e Relações Internacionais', short: 'Direito & RI', gradient: 'from-teal-500 to-teal-700', Icon: Earth },
};

export function getSchool(id: SchoolId): School {
  return SCHOOLS[id];
}
