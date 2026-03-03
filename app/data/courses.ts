import {
  Monitor,
  Stethoscope,
  Scale,
  Wrench,
  Brain,
  Building2,
  Briefcase,
  Calculator,
  Atom,
  FlaskConical,
  Microscope,
  BookOpen,
  Landmark,
  Lightbulb,
  Dumbbell,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Course {
  id: string;
  label: string;
  Icon: LucideIcon;
  bg: string;
  text: string;
}

export const COURSES: Course[] = [
  { id: 'computacao',    label: 'Ciência da\nComputação', Icon: Monitor,      bg: 'from-blue-500 to-blue-700',       text: 'text-blue-50' },
  { id: 'medicina',      label: 'Medicina',               Icon: Stethoscope,  bg: 'from-red-500 to-rose-700',        text: 'text-red-50' },
  { id: 'direito',       label: 'Direito',                Icon: Scale,        bg: 'from-slate-500 to-slate-700',     text: 'text-slate-50' },
  { id: 'engenharia',    label: 'Engenharia',             Icon: Wrench,       bg: 'from-orange-500 to-amber-700',    text: 'text-orange-50' },
  { id: 'psicologia',    label: 'Psicologia',             Icon: Brain,        bg: 'from-purple-500 to-violet-700',   text: 'text-purple-50' },
  { id: 'arquitetura',   label: 'Arquitetura',            Icon: Building2,    bg: 'from-stone-500 to-stone-700',     text: 'text-stone-50' },
  { id: 'administracao', label: 'Administração',          Icon: Briefcase,    bg: 'from-sky-500 to-cyan-700',        text: 'text-sky-50' },
  { id: 'matematica',    label: 'Matemática',             Icon: Calculator,   bg: 'from-teal-500 to-teal-700',       text: 'text-teal-50' },
  { id: 'fisica',        label: 'Física',                 Icon: Atom,         bg: 'from-violet-500 to-indigo-700',   text: 'text-violet-50' },
  { id: 'quimica',       label: 'Química',                Icon: FlaskConical, bg: 'from-lime-500 to-green-700',      text: 'text-lime-50' },
  { id: 'biologia',      label: 'Biologia',               Icon: Microscope,   bg: 'from-emerald-500 to-emerald-700', text: 'text-emerald-50' },
  { id: 'letras',        label: 'Letras',                 Icon: BookOpen,     bg: 'from-amber-500 to-yellow-700',    text: 'text-amber-50' },
  { id: 'historia',      label: 'História',               Icon: Landmark,     bg: 'from-yellow-600 to-orange-700',   text: 'text-yellow-50' },
  { id: 'filosofia',     label: 'Filosofia',              Icon: Lightbulb,    bg: 'from-indigo-500 to-blue-700',     text: 'text-indigo-50' },
  { id: 'ed-fisica',     label: 'Educação\nFísica',       Icon: Dumbbell,     bg: 'from-green-500 to-teal-700',      text: 'text-green-50' },
  { id: 'economia',      label: 'Economia',               Icon: TrendingUp,   bg: 'from-cyan-500 to-sky-700',        text: 'text-cyan-50' },
];
