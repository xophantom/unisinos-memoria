import {
  // Politécnica
  Code2, DraftingCompass, Dna, Cpu, Construction, CircuitBoard, Bot, Factory,
  Zap, Wrench, FlaskConical, Boxes, Network, BrainCircuit, Sigma, ShieldCheck,
  Database, Globe,
  // Artes, Humanidades e Economia Criativa
  Palette, PenTool, Lightbulb, ChefHat, ScrollText, Gamepad2, Newspaper, BookOpen,
  Shirt, Backpack, Video, Music, Megaphone, Clapperboard, Users,
  // Gestão e Negócios
  Briefcase, Calculator, TrendingUp, Ship, ShoppingCart, UsersRound, Wallet,
  Building2, Truck, Target, Workflow,
  // Saúde
  Microscope, Dumbbell, Syringe, Pill, Accessibility, Stethoscope, Salad, Brain,
  // Direito / RI
  Scale, Earth,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SchoolId } from './schools';

export interface Course {
  id: string;
  label: string;
  schoolId: SchoolId;
  Icon: LucideIcon;
}

export const COURSES: Course[] = [
  // Politécnica (18)
  { id: 'ads', label: 'Análise e Desenvolvimento de Sistemas', schoolId: 'politecnica', Icon: Code2 },
  { id: 'arquitetura', label: 'Arquitetura e Urbanismo', schoolId: 'politecnica', Icon: DraftingCompass },
  { id: 'biologia', label: 'Biologia', schoolId: 'politecnica', Icon: Dna },
  { id: 'computacao', label: 'Ciência da Computação', schoolId: 'politecnica', Icon: Cpu },
  { id: 'eng-civil', label: 'Engenharia Civil', schoolId: 'politecnica', Icon: Construction },
  { id: 'eng-computacao', label: 'Engenharia da Computação', schoolId: 'politecnica', Icon: CircuitBoard },
  { id: 'eng-automacao', label: 'Engenharia de Controle e Automação', schoolId: 'politecnica', Icon: Bot },
  { id: 'eng-producao', label: 'Engenharia de Produção', schoolId: 'politecnica', Icon: Factory },
  { id: 'eng-eletrica', label: 'Engenharia Elétrica', schoolId: 'politecnica', Icon: Zap },
  { id: 'eng-mecanica', label: 'Engenharia Mecânica', schoolId: 'politecnica', Icon: Wrench },
  { id: 'eng-quimica', label: 'Engenharia Química', schoolId: 'politecnica', Icon: FlaskConical },
  { id: 'gestao-producao', label: 'Gestão da Produção Industrial', schoolId: 'politecnica', Icon: Boxes },
  { id: 'gestao-ti', label: 'Gestão da Tecnologia da Informação', schoolId: 'politecnica', Icon: Network },
  { id: 'ia', label: 'Inteligência Artificial', schoolId: 'politecnica', Icon: BrainCircuit },
  { id: 'matematica', label: 'Matemática', schoolId: 'politecnica', Icon: Sigma },
  { id: 'seguranca', label: 'Segurança da Informação', schoolId: 'politecnica', Icon: ShieldCheck },
  { id: 'sistemas-info', label: 'Sistemas da Informação', schoolId: 'politecnica', Icon: Database },
  { id: 'sistemas-internet', label: 'Sistemas para Internet', schoolId: 'politecnica', Icon: Globe },
  // Artes, Humanidades e Economia Criativa (15)
  { id: 'bihat', label: 'Artes, Humanidades e Tecnologia', schoolId: 'artes', Icon: Palette },
  { id: 'design', label: 'Design', schoolId: 'artes', Icon: PenTool },
  { id: 'filosofia', label: 'Filosofia', schoolId: 'artes', Icon: Lightbulb },
  { id: 'gastronomia', label: 'Gastronomia', schoolId: 'artes', Icon: ChefHat },
  { id: 'historia', label: 'História', schoolId: 'artes', Icon: ScrollText },
  { id: 'jogos', label: 'Jogos Digitais', schoolId: 'artes', Icon: Gamepad2 },
  { id: 'jornalismo', label: 'Jornalismo', schoolId: 'artes', Icon: Newspaper },
  { id: 'letras', label: 'Letras', schoolId: 'artes', Icon: BookOpen },
  { id: 'moda', label: 'Moda', schoolId: 'artes', Icon: Shirt },
  { id: 'pedagogia', label: 'Pedagogia', schoolId: 'artes', Icon: Backpack },
  { id: 'prod-audiovisual', label: 'Produção Audiovisual', schoolId: 'artes', Icon: Video },
  { id: 'prod-fonografica', label: 'Produção Fonográfica', schoolId: 'artes', Icon: Music },
  { id: 'publicidade', label: 'Publicidade e Propaganda', schoolId: 'artes', Icon: Megaphone },
  { id: 'realizacao-audiovisual', label: 'Realização Audiovisual', schoolId: 'artes', Icon: Clapperboard },
  { id: 'relacoes-publicas', label: 'Relações Públicas', schoolId: 'artes', Icon: Users },
  // Gestão e Negócios (11)
  { id: 'administracao', label: 'Administração', schoolId: 'gestao', Icon: Briefcase },
  { id: 'contabeis', label: 'Ciências Contábeis', schoolId: 'gestao', Icon: Calculator },
  { id: 'economicas', label: 'Ciências Econômicas', schoolId: 'gestao', Icon: TrendingUp },
  { id: 'comercio-exterior', label: 'Comércio Exterior', schoolId: 'gestao', Icon: Ship },
  { id: 'gestao-comercial', label: 'Gestão Comercial', schoolId: 'gestao', Icon: ShoppingCart },
  { id: 'rh', label: 'Gestão de Recursos Humanos', schoolId: 'gestao', Icon: UsersRound },
  { id: 'gestao-financeira', label: 'Gestão Financeira', schoolId: 'gestao', Icon: Wallet },
  { id: 'gestao-publica', label: 'Gestão Pública', schoolId: 'gestao', Icon: Building2 },
  { id: 'logistica', label: 'Logística', schoolId: 'gestao', Icon: Truck },
  { id: 'marketing', label: 'Marketing', schoolId: 'gestao', Icon: Target },
  { id: 'processos', label: 'Processos Gerenciais', schoolId: 'gestao', Icon: Workflow },
  // Saúde (8)
  { id: 'biomedicina', label: 'Biomedicina', schoolId: 'saude', Icon: Microscope },
  { id: 'ed-fisica', label: 'Educação Física', schoolId: 'saude', Icon: Dumbbell },
  { id: 'enfermagem', label: 'Enfermagem', schoolId: 'saude', Icon: Syringe },
  { id: 'farmacia', label: 'Farmácia', schoolId: 'saude', Icon: Pill },
  { id: 'fisioterapia', label: 'Fisioterapia', schoolId: 'saude', Icon: Accessibility },
  { id: 'medicina', label: 'Medicina', schoolId: 'saude', Icon: Stethoscope },
  { id: 'nutricao', label: 'Nutrição', schoolId: 'saude', Icon: Salad },
  { id: 'psicologia', label: 'Psicologia', schoolId: 'saude', Icon: Brain },
  // Direito (1)
  { id: 'direito', label: 'Direito', schoolId: 'direito', Icon: Scale },
  // Direito e Relações Internacionais (1)
  { id: 'relacoes-internacionais', label: 'Relações Internacionais', schoolId: 'direito-ri', Icon: Earth },
];
