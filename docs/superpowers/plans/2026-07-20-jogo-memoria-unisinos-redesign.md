# Redesign do Jogo da Memória — Unisinos Start — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar o Jogo da Memória (evento Start da Unisinos) com identidade visual Unisinos, camada de Escolas por cor, e refinamentos de jogabilidade (espiada inicial, estrelas, recordes persistentes, acessibilidade), refatorando o monolito atual em unidades testáveis.

**Architecture:** A lógica do jogo vira um reducer puro (`gameReducer`) testável sem React, envolvido por um hook (`useMemoryGame`) que cuida de timers, espiada e persistência. Dados de Escolas e Cursos ficam em módulos separados. A UI é composta por componentes focados (`Header`, `DifficultySelector`, `Scoreboard`, `Board`, `Card`, `VictoryModal`). Testes com Vitest + Testing Library.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, lucide-react, Vitest, @testing-library/react.

## Global Constraints

- Manter versões existentes: Next 16.1.6, React 19.2.3, Tailwind 4, lucide-react ^0.576.
- Todo texto de UI em **PT-BR com acentuação correta** (não trocar acentos por ASCII).
- **Vermelho carmim `#C8102E`** é reservado à marca Unisinos (header, botões primários, carta fechada). Nenhuma Escola usa vermelho.
- Dificuldade: **Fácil 6 / Médio 10 / Difícil 16** pares.
- **54 cursos curados** em 6 Escolas (18 Politécnica, 15 Artes, 11 Gestão, 8 Saúde, 1 Direito, 1 Direito e RI).
- Acesso a `localStorage` sempre **SSR-safe** (`typeof window === 'undefined'` guard).
- **Somente imports relativos** no código novo (sem alias `@/`), para o Vitest resolver sem config extra.
- Shell: usar caminhos e scripts do `package.json` (evitar `cd &&`, redirects, `$(...)`).

---

### Task 1: Instalar deps + infraestrutura de testes (Vitest)

**Files:**
- Modify: `package.json` (scripts + devDependencies)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `app/lib/__smoke__.test.ts` (teste de fumaça, removido no fim da task)

**Interfaces:**
- Consumes: nada.
- Produces: comando `npm test` funcional (Vitest + jsdom + Testing Library).

- [ ] **Step 1: Instalar dependências do projeto e de teste**

```bash
npm install
npm install -D vitest@^3 @vitejs/plugin-react@^4 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```
Expected: instala sem erros; `node_modules/` populado.

- [ ] **Step 2: Criar `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.test.{ts,tsx}'],
  },
});
```

- [ ] **Step 3: Criar `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Adicionar scripts ao `package.json`**

No bloco `"scripts"`, adicionar:
```json
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 5: Criar teste de fumaça `app/lib/__smoke__.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('infra', () => {
  it('roda o vitest', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Rodar e verificar que passa**

Run: `npm test`
Expected: PASS (1 teste).

- [ ] **Step 7: Remover o teste de fumaça e commitar**

```bash
rm app/lib/__smoke__.test.ts
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "chore: set up vitest + testing-library"
```

---

### Task 2: Config de dificuldade + utilitários puros (scoring, format)

**Files:**
- Create: `app/lib/difficulty.ts`
- Create: `app/lib/scoring.ts`
- Create: `app/lib/format.ts`
- Test: `app/lib/scoring.test.ts`, `app/lib/format.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type Difficulty = 'easy' | 'medium' | 'hard'`
  - `DIFFICULTIES: { id: Difficulty; label: string; pairs: number }[]`
  - `PAIRS: Record<Difficulty, number>`
  - `calcStars(moves: number, pairs: number): 1 | 2 | 3`
  - `formatTime(totalSeconds: number): string`

- [ ] **Step 1: Escrever teste `app/lib/scoring.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { calcStars } from './scoring';

describe('calcStars', () => {
  it('dá 3 estrelas quando moves <= pares*1.6', () => {
    expect(calcStars(6, 6)).toBe(3);
    expect(calcStars(10, 6)).toBe(3); // round(9.6)=10
  });
  it('dá 2 estrelas na faixa intermediária', () => {
    expect(calcStars(11, 6)).toBe(2); // > 10 e <= round(13.8)=14
    expect(calcStars(14, 6)).toBe(2);
  });
  it('dá 1 estrela acima da faixa', () => {
    expect(calcStars(15, 6)).toBe(1);
  });
});
```

- [ ] **Step 2: Escrever teste `app/lib/format.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { formatTime } from './format';

describe('formatTime', () => {
  it('formata mm:ss com zero à esquerda', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(9)).toBe('00:09');
    expect(formatTime(75)).toBe('01:15');
    expect(formatTime(600)).toBe('10:00');
  });
});
```

- [ ] **Step 3: Rodar testes e verificar que falham**

Run: `npm test -- scoring format`
Expected: FAIL (módulos não existem).

- [ ] **Step 4: Criar `app/lib/difficulty.ts`**

```ts
export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTIES: { id: Difficulty; label: string; pairs: number }[] = [
  { id: 'easy', label: 'Fácil', pairs: 6 },
  { id: 'medium', label: 'Médio', pairs: 10 },
  { id: 'hard', label: 'Difícil', pairs: 16 },
];

export const PAIRS: Record<Difficulty, number> = { easy: 6, medium: 10, hard: 16 };
```

- [ ] **Step 5: Criar `app/lib/scoring.ts`**

```ts
export function calcStars(moves: number, pairs: number): 1 | 2 | 3 {
  if (moves <= Math.round(pairs * 1.6)) return 3;
  if (moves <= Math.round(pairs * 2.3)) return 2;
  return 1;
}
```

- [ ] **Step 6: Criar `app/lib/format.ts`**

```ts
export function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
```

- [ ] **Step 7: Rodar testes e verificar que passam**

Run: `npm test -- scoring format`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/lib/difficulty.ts app/lib/scoring.ts app/lib/format.ts app/lib/scoring.test.ts app/lib/format.test.ts
git commit -m "feat: add difficulty config, scoring and time-format utils"
```

---

### Task 3: Recordes persistentes (`localStorage`, SSR-safe)

**Files:**
- Create: `app/lib/storage.ts`
- Test: `app/lib/storage.test.ts`

**Interfaces:**
- Consumes: `Difficulty` de `./difficulty`.
- Produces:
  - `interface BestScore { bestMoves: number | null; bestTime: number | null }`
  - `type Records = Record<Difficulty, BestScore>`
  - `emptyRecords(): Records`
  - `mergeBest(prev: BestScore, result: { moves: number; time: number }): BestScore`
  - `loadRecords(): Records`
  - `saveResult(difficulty: Difficulty, result: { moves: number; time: number }): Records`

- [ ] **Step 1: Escrever teste `app/lib/storage.test.ts`**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { mergeBest, emptyRecords, loadRecords, saveResult } from './storage';

describe('mergeBest', () => {
  it('usa o resultado quando não há recorde anterior', () => {
    expect(mergeBest({ bestMoves: null, bestTime: null }, { moves: 10, time: 40 }))
      .toEqual({ bestMoves: 10, bestTime: 40 });
  });
  it('mantém o menor de jogadas e tempo independentemente', () => {
    expect(mergeBest({ bestMoves: 8, bestTime: 60 }, { moves: 12, time: 30 }))
      .toEqual({ bestMoves: 8, bestTime: 30 });
  });
});

describe('persistência', () => {
  beforeEach(() => window.localStorage.clear());

  it('emptyRecords tem as 3 dificuldades nulas', () => {
    expect(emptyRecords()).toEqual({
      easy: { bestMoves: null, bestTime: null },
      medium: { bestMoves: null, bestTime: null },
      hard: { bestMoves: null, bestTime: null },
    });
  });
  it('saveResult grava e loadRecords lê o melhor', () => {
    saveResult('easy', { moves: 10, time: 40 });
    saveResult('easy', { moves: 8, time: 55 });
    const r = loadRecords();
    expect(r.easy).toEqual({ bestMoves: 8, bestTime: 40 });
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- storage`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Criar `app/lib/storage.ts`**

```ts
import type { Difficulty } from './difficulty';

export interface BestScore {
  bestMoves: number | null;
  bestTime: number | null;
}
export type Records = Record<Difficulty, BestScore>;

const KEY = 'unisinos-memoria-records';

export function emptyRecords(): Records {
  return {
    easy: { bestMoves: null, bestTime: null },
    medium: { bestMoves: null, bestTime: null },
    hard: { bestMoves: null, bestTime: null },
  };
}

export function mergeBest(prev: BestScore, result: { moves: number; time: number }): BestScore {
  return {
    bestMoves: prev.bestMoves === null ? result.moves : Math.min(prev.bestMoves, result.moves),
    bestTime: prev.bestTime === null ? result.time : Math.min(prev.bestTime, result.time),
  };
}

export function loadRecords(): Records {
  if (typeof window === 'undefined') return emptyRecords();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyRecords();
    return { ...emptyRecords(), ...JSON.parse(raw) };
  } catch {
    return emptyRecords();
  }
}

export function saveResult(difficulty: Difficulty, result: { moves: number; time: number }): Records {
  const records = loadRecords();
  const next: Records = { ...records, [difficulty]: mergeBest(records[difficulty], result) };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignora quota/privacidade */
    }
  }
  return next;
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- storage`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/storage.ts app/lib/storage.test.ts
git commit -m "feat: add SSR-safe localStorage records (best moves + time)"
```

---

### Task 4: Dados das Escolas

**Files:**
- Create: `app/data/schools.ts`
- Test: `app/data/schools.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - `type SchoolId = 'politecnica' | 'saude' | 'gestao' | 'artes' | 'direito' | 'direito-ri'`
  - `interface School { id: SchoolId; label: string; short: string; gradient: string; Icon: LucideIcon }`
  - `SCHOOLS: Record<SchoolId, School>`
  - `getSchool(id: SchoolId): School`

- [ ] **Step 1: Escrever teste `app/data/schools.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { SCHOOLS, getSchool } from './schools';

describe('SCHOOLS', () => {
  it('tem as 6 escolas', () => {
    expect(Object.keys(SCHOOLS)).toHaveLength(6);
  });
  it('cada escola tem gradiente e ícone, e nenhuma usa vermelho/carmim', () => {
    for (const s of Object.values(SCHOOLS)) {
      expect(s.gradient).toMatch(/from-/);
      expect(s.Icon).toBeTruthy();
      expect(s.gradient).not.toMatch(/red|rose|unisinos/);
    }
  });
  it('getSchool retorna a escola pelo id', () => {
    expect(getSchool('saude').label).toBe('Saúde');
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- schools`
Expected: FAIL.

- [ ] **Step 3: Criar `app/data/schools.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- schools`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/data/schools.ts app/data/schools.test.ts
git commit -m "feat: add schools data with per-school color/icon"
```

---

### Task 5: Catálogo de Cursos (54, curados)

**Files:**
- Modify: `app/data/courses.ts` (substituição completa)
- Test: `app/data/courses.test.ts`

**Interfaces:**
- Consumes: `SchoolId` de `./schools`.
- Produces:
  - `interface Course { id: string; label: string; schoolId: SchoolId; Icon: LucideIcon }`
  - `COURSES: Course[]` (54 itens)

- [ ] **Step 1: Escrever teste `app/data/courses.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { COURSES } from './courses';
import { SCHOOLS } from './schools';

describe('COURSES', () => {
  it('tem 54 cursos', () => {
    expect(COURSES).toHaveLength(54);
  });
  it('ids são únicos', () => {
    const ids = COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('todo curso aponta para uma escola existente', () => {
    for (const c of COURSES) {
      expect(SCHOOLS[c.schoolId]).toBeTruthy();
    }
  });
  it('contagem por escola bate com a curadoria', () => {
    const count = (id: string) => COURSES.filter((c) => c.schoolId === id).length;
    expect(count('politecnica')).toBe(18);
    expect(count('artes')).toBe(15);
    expect(count('gestao')).toBe(11);
    expect(count('saude')).toBe(8);
    expect(count('direito')).toBe(1);
    expect(count('direito-ri')).toBe(1);
  });
  it('todo curso tem um ícone lucide válido (não undefined)', () => {
    for (const c of COURSES) {
      expect(c.Icon, `ícone ausente para "${c.id}"`).toBeTruthy();
    }
  });
});
```

> Esse teste falha se algum nome de ícone não existir no `lucide-react` (import vira `undefined`), então cobre a validação sem precisar de `tsc` — que aqui acusaria erros do `Card` antigo (ainda usa os campos removidos `bg`/`text`).

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- courses`
Expected: FAIL (formato antigo, 16 cursos).

- [ ] **Step 3: Substituir `app/data/courses.ts` inteiro**

```ts
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
```

- [ ] **Step 4: Rodar teste e verificar que passa**

Run: `npm test -- courses`
Expected: PASS. Se falhar no import de um ícone (`does not provide an export named X`) ou na asserção de ícone truthy, troque o ícone pelo vizinho semântico mais próximo (ex.: `Accessibility`→`PersonStanding`, `Earth`→`Globe2`, `Salad`→`Apple`, `Backpack`→`GraduationCap`) e rode de novo.

- [ ] **Step 5: Commit**

```bash
git add app/data/courses.ts app/data/courses.test.ts
git commit -m "feat: expand course catalog to 54 curated courses with schoolId"
```

---

### Task 6: Montagem do baralho (`buildDeck`)

**Files:**
- Create: `app/lib/deck.ts`
- Test: `app/lib/deck.test.ts`

**Interfaces:**
- Consumes: `COURSES`/`Course` de `../data/courses`.
- Produces:
  - `interface BoardCard { id: number; course: Course; isFlipped: boolean; isMatched: boolean }` (tipo compartilhado da carta; o `gameReducer` da Task 7 o re-exporta)
  - `shuffle<T>(array: T[]): T[]`
  - `buildDeck(pairs: number, courses?: Course[], shuffleFn?: <T>(a: T[]) => T[]): BoardCard[]`

- [ ] **Step 1: Escrever teste `app/lib/deck.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildDeck } from './deck';
import type { Course } from '../data/courses';

const identity = <T,>(a: T[]): T[] => a;
const mock: Course[] = [
  { id: 'a', label: 'A', schoolId: 'saude', Icon: (() => null) as never },
  { id: 'b', label: 'B', schoolId: 'gestao', Icon: (() => null) as never },
  { id: 'c', label: 'C', schoolId: 'direito', Icon: (() => null) as never },
];

describe('buildDeck', () => {
  it('cria 2×pares cartas', () => {
    expect(buildDeck(3, mock, identity)).toHaveLength(6);
  });
  it('cada curso aparece exatamente duas vezes', () => {
    const deck = buildDeck(3, mock, identity);
    const counts = deck.reduce<Record<string, number>>((acc, c) => {
      acc[c.course.id] = (acc[c.course.id] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({ a: 2, b: 2, c: 2 });
  });
  it('ids das cartas são únicos e sequenciais', () => {
    const deck = buildDeck(3, mock, identity);
    expect(deck.map((c) => c.id)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('cartas começam fechadas e não casadas', () => {
    const deck = buildDeck(2, mock, identity);
    expect(deck.every((c) => !c.isFlipped && !c.isMatched)).toBe(true);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- deck`
Expected: FAIL.

- [ ] **Step 3: Criar `app/lib/deck.ts`**

```ts
import { COURSES, type Course } from '../data/courses';

export interface BoardCard {
  id: number;
  course: Course;
  isFlipped: boolean;
  isMatched: boolean;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildDeck(
  pairs: number,
  courses: Course[] = COURSES,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): BoardCard[] {
  const selected = shuffleFn(courses).slice(0, pairs);
  const doubled = [...selected, ...selected];
  return shuffleFn(doubled).map((course, index) => ({
    id: index,
    course,
    isFlipped: false,
    isMatched: false,
  }));
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- deck`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/deck.ts app/lib/deck.test.ts
git commit -m "feat: add deck builder (shuffle + pairing)"
```

---

### Task 7: Reducer puro do jogo (`gameReducer`)

**Files:**
- Create: `app/lib/gameReducer.ts`
- Test: `app/lib/gameReducer.test.ts`

**Interfaces:**
- Consumes: `BoardCard` de `./deck` (Task 6).
- Produces:
  - `type Phase = 'idle' | 'peek' | 'playing' | 'checking' | 'won'`
  - `BoardCard` re-exportado (consumidores importam de `./gameReducer` ou de `./deck` — ambos válidos)
  - `interface GameState { cards: BoardCard[]; flipped: number[]; moves: number; matches: number; totalPairs: number; phase: Phase }`
  - `type GameAction` (NEW_GAME | END_PEEK | FLIP | RESOLVE)
  - `initialState: GameState`
  - `gameReducer(state: GameState, action: GameAction): GameState`

- [ ] **Step 1: Escrever teste `app/lib/gameReducer.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { gameReducer, initialState, type GameState, type BoardCard } from './gameReducer';
import type { Course } from '../data/courses';

const course = (id: string): Course => ({ id, label: id, schoolId: 'saude', Icon: (() => null) as never });
const card = (id: number, courseId: string): BoardCard => ({ id, course: course(courseId), isFlipped: false, isMatched: false });

// baralho fixo: pares (a,a) e (b,b)
const deck = (): BoardCard[] => [card(0, 'a'), card(1, 'a'), card(2, 'b'), card(3, 'b')];
const newGame = (): GameState => gameReducer(initialState, { type: 'NEW_GAME', cards: deck(), totalPairs: 2 });
const playing = (): GameState => gameReducer(newGame(), { type: 'END_PEEK' });

describe('gameReducer', () => {
  it('NEW_GAME entra em peek com todas as cartas viradas', () => {
    const s = newGame();
    expect(s.phase).toBe('peek');
    expect(s.cards.every((c) => c.isFlipped)).toBe(true);
    expect(s.moves).toBe(0);
    expect(s.matches).toBe(0);
    expect(s.totalPairs).toBe(2);
  });

  it('END_PEEK esconde todas e vai para playing', () => {
    const s = playing();
    expect(s.phase).toBe('playing');
    expect(s.cards.every((c) => !c.isFlipped)).toBe(true);
  });

  it('FLIP vira uma carta', () => {
    const s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    expect(s.cards.find((c) => c.id === 0)!.isFlipped).toBe(true);
    expect(s.flipped).toEqual([0]);
    expect(s.phase).toBe('playing');
  });

  it('duas cartas viradas incrementam moves e vão para checking', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    expect(s.moves).toBe(1);
    expect(s.phase).toBe('checking');
    expect(s.flipped).toEqual([0, 1]);
  });

  it('RESOLVE com par igual marca como casado e volta para playing', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.cards.find((c) => c.id === 0)!.isMatched).toBe(true);
    expect(s.cards.find((c) => c.id === 1)!.isMatched).toBe(true);
    expect(s.matches).toBe(1);
    expect(s.phase).toBe('playing');
    expect(s.flipped).toEqual([]);
  });

  it('RESOLVE com par diferente desvira e volta para playing', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 2 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.cards.find((c) => c.id === 0)!.isFlipped).toBe(false);
    expect(s.cards.find((c) => c.id === 2)!.isFlipped).toBe(false);
    expect(s.matches).toBe(0);
    expect(s.phase).toBe('playing');
  });

  it('completar todos os pares vai para won', () => {
    let s = playing();
    s = gameReducer(s, { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'RESOLVE' });
    s = gameReducer(s, { type: 'FLIP', id: 2 });
    s = gameReducer(s, { type: 'FLIP', id: 3 });
    s = gameReducer(s, { type: 'RESOLVE' });
    expect(s.matches).toBe(2);
    expect(s.phase).toBe('won');
  });

  it('ignora FLIP durante peek', () => {
    const s = gameReducer(newGame(), { type: 'FLIP', id: 0 });
    expect(s.phase).toBe('peek');
    expect(s.flipped).toEqual([]);
  });

  it('ignora terceira carta e clique repetido', () => {
    let s = gameReducer(playing(), { type: 'FLIP', id: 0 });
    s = gameReducer(s, { type: 'FLIP', id: 0 }); // mesma carta
    expect(s.flipped).toEqual([0]);
    s = gameReducer(s, { type: 'FLIP', id: 1 });
    s = gameReducer(s, { type: 'FLIP', id: 2 }); // terceira, em checking
    expect(s.flipped).toEqual([0, 1]);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- gameReducer`
Expected: FAIL.

- [ ] **Step 3: Criar `app/lib/gameReducer.ts`**

```ts
import type { BoardCard } from './deck';

export type { BoardCard };

export type Phase = 'idle' | 'peek' | 'playing' | 'checking' | 'won';

export interface GameState {
  cards: BoardCard[];
  flipped: number[];
  moves: number;
  matches: number;
  totalPairs: number;
  phase: Phase;
}

export type GameAction =
  | { type: 'NEW_GAME'; cards: BoardCard[]; totalPairs: number }
  | { type: 'END_PEEK' }
  | { type: 'FLIP'; id: number }
  | { type: 'RESOLVE' };

export const initialState: GameState = {
  cards: [],
  flipped: [],
  moves: 0,
  matches: 0,
  totalPairs: 0,
  phase: 'idle',
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        cards: action.cards.map((c) => ({ ...c, isFlipped: true, isMatched: false })),
        flipped: [],
        moves: 0,
        matches: 0,
        totalPairs: action.totalPairs,
        phase: 'peek',
      };

    case 'END_PEEK':
      if (state.phase !== 'peek') return state;
      return {
        ...state,
        phase: 'playing',
        cards: state.cards.map((c) => ({ ...c, isFlipped: false })),
      };

    case 'FLIP': {
      if (state.phase !== 'playing') return state;
      if (state.flipped.length >= 2) return state;
      const target = state.cards.find((c) => c.id === action.id);
      if (!target || target.isFlipped || target.isMatched) return state;
      const flipped = [...state.flipped, action.id];
      const cards = state.cards.map((c) => (c.id === action.id ? { ...c, isFlipped: true } : c));
      if (flipped.length === 2) {
        return { ...state, cards, flipped, moves: state.moves + 1, phase: 'checking' };
      }
      return { ...state, cards, flipped };
    }

    case 'RESOLVE': {
      if (state.phase !== 'checking' || state.flipped.length !== 2) return state;
      const [id1, id2] = state.flipped;
      const c1 = state.cards.find((c) => c.id === id1);
      const c2 = state.cards.find((c) => c.id === id2);
      const isMatch = !!c1 && !!c2 && c1.course.id === c2.course.id;
      if (isMatch) {
        const matches = state.matches + 1;
        return {
          ...state,
          cards: state.cards.map((c) =>
            c.id === id1 || c.id === id2 ? { ...c, isMatched: true, isFlipped: true } : c,
          ),
          flipped: [],
          matches,
          phase: matches === state.totalPairs ? 'won' : 'playing',
        };
      }
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c,
        ),
        flipped: [],
        phase: 'playing',
      };
    }

    default:
      return state;
  }
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- gameReducer`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/lib/gameReducer.ts app/lib/gameReducer.test.ts
git commit -m "feat: add pure game reducer (peek/flip/match/win state machine)"
```

---

### Task 8: Hook `useMemoryGame` (timers, espiada, persistência)

**Files:**
- Create: `app/hooks/useMemoryGame.ts`
- Test: `app/hooks/useMemoryGame.test.ts`

**Interfaces:**
- Consumes: `gameReducer`, `initialState`, `GameState` de `../lib/gameReducer`; `buildDeck` de `../lib/deck`; `PAIRS`, `Difficulty` de `../lib/difficulty`; `saveResult`, `loadRecords`, `Records` de `../lib/storage`.
- Produces:
  - `useMemoryGame(difficulty: Difficulty): { state: GameState; time: number; records: Records | null; flip: (id: number) => void; restart: () => void }`

- [ ] **Step 1: Escrever teste `app/hooks/useMemoryGame.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('inicia em peek com o baralho da dificuldade e depois vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame('easy'));
    // efeito de montagem cria o baralho
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(12); // 6 pares
    expect(result.current.state.phase).toBe('peek');
    // fim da espiada (2500ms)
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame('easy'));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- useMemoryGame`
Expected: FAIL.

- [ ] **Step 3: Criar `app/hooks/useMemoryGame.ts`**

```ts
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { gameReducer, initialState, type GameState } from '../lib/gameReducer';
import { buildDeck } from '../lib/deck';
import { PAIRS, type Difficulty } from '../lib/difficulty';
import { saveResult, loadRecords, type Records } from '../lib/storage';

const PEEK_MS = 2500;
const MATCH_MS = 500;
const MISMATCH_MS = 1000;

export function useMemoryGame(difficulty: Difficulty): {
  state: GameState;
  time: number;
  records: Records | null;
  flip: (id: number) => void;
  restart: () => void;
} {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [time, setTime] = useState(0);
  const [records, setRecords] = useState<Records | null>(null);
  const savedRef = useRef(false);

  useEffect(() => {
    setRecords(loadRecords());
  }, []);

  const newGame = useCallback((diff: Difficulty) => {
    savedRef.current = false;
    setTime(0);
    dispatch({ type: 'NEW_GAME', cards: buildDeck(PAIRS[diff]), totalPairs: PAIRS[diff] });
  }, []);

  // (re)inicia ao trocar dificuldade e na montagem (client-only evita hydration mismatch)
  useEffect(() => {
    newGame(difficulty);
  }, [difficulty, newGame]);

  // fim da espiada
  useEffect(() => {
    if (state.phase !== 'peek') return;
    const t = setTimeout(() => dispatch({ type: 'END_PEEK' }), PEEK_MS);
    return () => clearTimeout(t);
  }, [state.phase]);

  // resolve o par após duas cartas viradas
  useEffect(() => {
    if (state.phase !== 'checking') return;
    const [id1, id2] = state.flipped;
    const c1 = state.cards.find((c) => c.id === id1);
    const c2 = state.cards.find((c) => c.id === id2);
    const isMatch = !!c1 && !!c2 && c1.course.id === c2.course.id;
    const t = setTimeout(() => dispatch({ type: 'RESOLVE' }), isMatch ? MATCH_MS : MISMATCH_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.flipped, state.cards]);

  // cronômetro: começa no primeiro clique real, para na vitória
  const started = state.moves > 0 || state.flipped.length > 0;
  useEffect(() => {
    if (!started) return;
    if (state.phase === 'won' || state.phase === 'idle' || state.phase === 'peek') return;
    const iv = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [started, state.phase]);

  // persiste recorde ao vencer (uma vez)
  useEffect(() => {
    if (state.phase === 'won' && !savedRef.current) {
      savedRef.current = true;
      setRecords(saveResult(difficulty, { moves: state.moves, time }));
    }
  }, [state.phase, difficulty, state.moves, time]);

  const flip = useCallback((id: number) => dispatch({ type: 'FLIP', id }), []);
  const restart = useCallback(() => newGame(difficulty), [newGame, difficulty]);

  return { state, time, records, flip, restart };
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- useMemoryGame`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useMemoryGame.ts app/hooks/useMemoryGame.test.ts
git commit -m "feat: add useMemoryGame hook (peek/timer/records orchestration)"
```

---

### Task 9: Tema Unisinos + utilitários de flip no CSS

**Files:**
- Modify: `app/globals.css` (substituição completa)

**Interfaces:**
- Consumes: nada.
- Produces: tokens de cor `--color-unisinos`, `--color-unisinos-dark`, `--color-surface` (usáveis como `bg-unisinos`, `text-unisinos`, `bg-surface`); utilitários `.perspective-1000`, `.transform-style-3d`, `.backface-hidden`, `.rotate-y-180`, `.card-flip`; respeito a `prefers-reduced-motion`.

- [ ] **Step 1: Substituir `app/globals.css` inteiro**

```css
@import "tailwindcss";

@theme {
  --color-unisinos: #C8102E;
  --color-unisinos-dark: #A00C24;
  --color-surface: #f6f5f3;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

:root {
  --background: #f6f5f3;
  --foreground: #1a1a1a;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-geist-sans), system-ui, Arial, sans-serif;
}

/* Flip 3D das cartas */
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }

@media (prefers-reduced-motion: reduce) {
  .card-flip { transition: none !important; }
}
```

- [ ] **Step 2: Verificar que a suíte de testes segue verde**

Run: `npm test`
Expected: PASS. (Não rodar `npm run build`/`tsc` aqui: o `Card` antigo ainda referencia os campos `bg`/`text` removidos de `Course` na Task 5, então o type-check só volta a passar após a Task 13. O build de produção é validado lá. Vitest usa esbuild e não faz type-check, então a suíte continua verde.)

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add Unisinos theme tokens + reduced-motion flip"
```

---

### Task 10: Componente `Card` (acessível, cor por Escola)

**Files:**
- Modify: `app/components/Card.tsx` (substituição completa)
- Test: `app/components/Card.test.tsx`

**Interfaces:**
- Consumes: `Course` de `../data/courses`; `getSchool` de `../data/schools`.
- Produces: `Card` com props `{ id: number; course: Course; isFlipped: boolean; isMatched: boolean; locked: boolean; onFlip: (id: number) => void }`.

- [ ] **Step 1: Escrever teste `app/components/Card.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';
import { COURSES } from '../data/courses';

const medicina = COURSES.find((c) => c.id === 'medicina')!;

describe('Card', () => {
  it('mostra o nome do curso e a escola no aria-label quando virada', () => {
    render(<Card id={0} course={medicina} isFlipped isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Medicina — Escola Saúde/ })).toBeInTheDocument();
  });

  it('carta fechada tem aria-label "Carta fechada"', () => {
    render(<Card id={0} course={medicina} isFlipped={false} isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByRole('button', { name: 'Carta fechada' })).toBeInTheDocument();
  });

  it('clique em carta fechada chama onFlip', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} isFlipped={false} isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).toHaveBeenCalledWith(3);
  });

  it('não chama onFlip quando travada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} isFlipped={false} isMatched={false} locked onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('não chama onFlip quando já virada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} isFlipped isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- Card`
Expected: FAIL (props/estrutura antigas).

- [ ] **Step 3: Substituir `app/components/Card.tsx`**

```tsx
'use client';

import type { Course } from '../data/courses';
import { getSchool } from '../data/schools';

interface CardProps {
  id: number;
  course: Course;
  isFlipped: boolean;
  isMatched: boolean;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Card({ id, course, isFlipped, isMatched, locked, onFlip }: CardProps) {
  const school = getSchool(course.schoolId);
  const { Icon, label } = course;
  const faceUp = isFlipped || isMatched;
  const ariaLabel = faceUp ? `${label} — Escola ${school.label}` : 'Carta fechada';

  const handleClick = () => {
    if (faceUp || locked) return;
    onFlip(id);
  };

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={faceUp}
      onClick={handleClick}
      className="group w-full aspect-square perspective-1000 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
    >
      <div
        className={`card-flip relative w-full h-full transition-transform duration-500 transform-style-3d ${
          faceUp ? 'rotate-y-180' : ''
        }`}
      >
        {/* Frente (fechada) */}
        <div className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-unisinos to-unisinos-dark flex items-center justify-center shadow-md ring-1 ring-black/5 group-hover:brightness-110 transition">
          <span className="text-white/90 text-2xl font-black select-none">?</span>
        </div>

        {/* Verso (curso) */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex flex-col items-center justify-center gap-1 p-1.5 shadow-md text-white ring-1 transition ${
            isMatched
              ? 'ring-2 ring-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-600'
              : `ring-white/20 bg-gradient-to-br ${school.gradient}`
          }`}
        >
          <Icon className="w-1/3 h-1/3 shrink-0" strokeWidth={1.5} aria-hidden />
          <span className="text-center font-semibold leading-tight select-none text-[clamp(0.5rem,1.6vw,0.8rem)]">
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- Card`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/Card.tsx app/components/Card.test.tsx
git commit -m "feat: accessible Card with school color + keyboard/aria"
```

---

### Task 11: `Header`, `DifficultySelector`, `Scoreboard`

**Files:**
- Create: `app/components/Header.tsx`
- Create: `app/components/DifficultySelector.tsx`
- Create: `app/components/Scoreboard.tsx`
- Test: `app/components/DifficultySelector.test.tsx`, `app/components/Scoreboard.test.tsx`

**Interfaces:**
- Consumes: `DIFFICULTIES`, `Difficulty` de `../lib/difficulty`; `formatTime` de `../lib/format`; `BestScore` de `../lib/storage`.
- Produces:
  - `Header` (sem props)
  - `DifficultySelector` props `{ value: Difficulty; onChange: (d: Difficulty) => void }`
  - `Scoreboard` props `{ moves: number; matches: number; totalPairs: number; time: number; best: BestScore | null }`

- [ ] **Step 1: Escrever teste `app/components/DifficultySelector.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DifficultySelector from './DifficultySelector';

describe('DifficultySelector', () => {
  it('renderiza as três dificuldades', () => {
    render(<DifficultySelector value="easy" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fácil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Médio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Difícil' })).toBeInTheDocument();
  });
  it('marca a dificuldade ativa com aria-pressed', () => {
    render(<DifficultySelector value="medium" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Médio' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('chama onChange ao clicar', async () => {
    const onChange = vi.fn();
    render(<DifficultySelector value="easy" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Difícil' }));
    expect(onChange).toHaveBeenCalledWith('hard');
  });
});
```

- [ ] **Step 2: Escrever teste `app/components/Scoreboard.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Scoreboard from './Scoreboard';

describe('Scoreboard', () => {
  it('mostra jogadas, pares e tempo formatado', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={null} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3/6')).toBeInTheDocument();
    expect(screen.getByText('01:15')).toBeInTheDocument();
  });
  it('mostra o recorde de jogadas quando existe', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={{ bestMoves: 12, bestTime: 40 }} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });
  it('omite recorde quando não há', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={{ bestMoves: null, bestTime: null }} />);
    expect(screen.queryByText(/Recorde/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Rodar e verificar que falham**

Run: `npm test -- DifficultySelector Scoreboard`
Expected: FAIL.

- [ ] **Step 4: Criar `app/components/Header.tsx`**

```tsx
export default function Header() {
  return (
    <header className="w-full text-center">
      <div className="inline-flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight text-unisinos">UNISINOS</span>
        <span className="px-2 py-0.5 rounded-md bg-unisinos text-white text-sm font-bold">Start</span>
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-neutral-900">
        Jogo da Memória dos Cursos
      </h1>
      <p className="text-neutral-500">Encontre os pares e descubra as Escolas da Unisinos</p>
    </header>
  );
}
```

- [ ] **Step 5: Criar `app/components/DifficultySelector.tsx`**

```tsx
'use client';

import { DIFFICULTIES, type Difficulty } from '../lib/difficulty';

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

export default function DifficultySelector({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Dificuldade" className="flex gap-2">
      {DIFFICULTIES.map((d) => (
        <button
          key={d.id}
          type="button"
          onClick={() => onChange(d.id)}
          aria-pressed={value === d.id}
          className={`px-5 py-2 rounded-full font-semibold text-sm transition-all ${
            value === d.id
              ? 'bg-unisinos text-white shadow-md scale-105'
              : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Criar `app/components/Scoreboard.tsx`**

```tsx
'use client';

import { Trophy } from 'lucide-react';
import { formatTime } from '../lib/format';
import type { BestScore } from '../lib/storage';

interface Props {
  moves: number;
  matches: number;
  totalPairs: number;
  time: number;
  best: BestScore | null;
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: boolean }) {
  return (
    <div className="text-center min-w-14">
      <div className="text-xl font-extrabold text-neutral-900 flex items-center gap-1 justify-center">
        {icon && <Trophy className="w-4 h-4 text-amber-400" aria-hidden />}
        {value}
      </div>
      <div className="text-[0.65rem] uppercase tracking-wide text-neutral-400 font-semibold">{label}</div>
    </div>
  );
}

export default function Scoreboard({ moves, matches, totalPairs, time, best }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 bg-white ring-1 ring-neutral-200 rounded-2xl px-6 py-3 shadow-sm">
      <Stat label="Jogadas" value={String(moves)} />
      <Stat label="Pares" value={`${matches}/${totalPairs}`} />
      <Stat label="Tempo" value={formatTime(time)} />
      {best?.bestMoves != null && <Stat label="Recorde" value={String(best.bestMoves)} icon />}
      <span className="sr-only" aria-live="polite">
        {matches} de {totalPairs} pares encontrados
      </span>
    </div>
  );
}
```

- [ ] **Step 7: Rodar e verificar que passam**

Run: `npm test -- DifficultySelector Scoreboard`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add app/components/Header.tsx app/components/DifficultySelector.tsx app/components/Scoreboard.tsx app/components/DifficultySelector.test.tsx app/components/Scoreboard.test.tsx
git commit -m "feat: add Header, DifficultySelector and Scoreboard components"
```

---

### Task 12: `Board` + `VictoryModal`

**Files:**
- Create: `app/components/Board.tsx`
- Create: `app/components/VictoryModal.tsx`
- Test: `app/components/VictoryModal.test.tsx`

**Interfaces:**
- Consumes: `BoardCard` de `../lib/gameReducer`; `Difficulty` de `../lib/difficulty`; `Card` de `./Card`; `School` de `../data/schools`; `formatTime` de `../lib/format`.
- Produces:
  - `Board` props `{ cards: BoardCard[]; difficulty: Difficulty; locked: boolean; onFlip: (id: number) => void }`
  - `VictoryModal` props `{ moves: number; time: number; stars: 1 | 2 | 3; schools: School[]; onRestart: () => void }`

- [ ] **Step 1: Escrever teste `app/components/VictoryModal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { SCHOOLS } from '../data/schools';

describe('VictoryModal', () => {
  it('mostra jogadas e tempo', () => {
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude]} onRestart={() => {}} />);
    expect(screen.getByText(/9 jogadas/)).toBeInTheDocument();
    expect(screen.getByText(/01:15/)).toBeInTheDocument();
  });
  it('rotula a quantidade de estrelas', () => {
    render(<VictoryModal moves={9} time={75} stars={2} schools={[SCHOOLS.saude]} onRestart={() => {}} />);
    expect(screen.getByLabelText('2 de 3 estrelas')).toBeInTheDocument();
  });
  it('mostra as escolas que apareceram', () => {
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude, SCHOOLS.politecnica]} onRestart={() => {}} />);
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Politécnica')).toBeInTheDocument();
  });
  it('chama onRestart no botão', async () => {
    const onRestart = vi.fn();
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude]} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Jogar novamente' }));
    expect(onRestart).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- VictoryModal`
Expected: FAIL.

- [ ] **Step 3: Criar `app/components/Board.tsx`**

```tsx
'use client';

import Card from './Card';
import type { BoardCard } from '../lib/gameReducer';
import type { Difficulty } from '../lib/difficulty';

const GRID: Record<Difficulty, string> = {
  easy: 'grid-cols-3 sm:grid-cols-4',
  medium: 'grid-cols-4 sm:grid-cols-5',
  hard: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-8',
};

interface Props {
  cards: BoardCard[];
  difficulty: Difficulty;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Board({ cards, difficulty, locked, onFlip }: Props) {
  return (
    <div className={`grid ${GRID[difficulty]} gap-2 sm:gap-3 w-full`}>
      {cards.map((c) => (
        <Card
          key={c.id}
          id={c.id}
          course={c.course}
          isFlipped={c.isFlipped}
          isMatched={c.isMatched}
          locked={locked}
          onFlip={onFlip}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Criar `app/components/VictoryModal.tsx`**

```tsx
'use client';

import { Trophy, Star } from 'lucide-react';
import type { School } from '../data/schools';
import { formatTime } from '../lib/format';

interface Props {
  moves: number;
  time: number;
  stars: 1 | 2 | 3;
  schools: School[];
  onRestart: () => void;
}

export default function VictoryModal({ moves, time, stars, schools, onRestart }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vitória"
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 text-center shadow-2xl max-w-sm w-full">
        <Trophy className="w-14 h-14 text-amber-400 mx-auto mb-3" aria-hidden />
        <h2 className="text-3xl font-extrabold text-neutral-900 mb-1">Parabéns!</h2>
        <div className="flex justify-center gap-1 my-3" aria-label={`${stars} de 3 estrelas`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-8 h-8 ${n <= stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`}
              aria-hidden
            />
          ))}
        </div>
        <p className="text-neutral-600">
          Concluído em <strong>{moves} jogadas</strong> · <strong>{formatTime(time)}</strong>
        </p>
        <div className="flex flex-wrap justify-center gap-1.5 my-4">
          {schools.map((s) => (
            <span
              key={s.id}
              className={`text-xs font-semibold text-white px-2 py-1 rounded-full bg-gradient-to-br ${s.gradient}`}
            >
              {s.short}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="mt-2 bg-unisinos hover:bg-unisinos-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
        >
          Jogar novamente
        </button>
      </div>
    </div>
  );
}
```

> Nota: o teste usa `SCHOOLS.saude.short` = "Saúde" e `SCHOOLS.politecnica.short` = "Politécnica" (definidos na Task 4).

- [ ] **Step 5: Rodar e verificar que passa**

Run: `npm test -- VictoryModal`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/components/Board.tsx app/components/VictoryModal.tsx app/components/VictoryModal.test.tsx
git commit -m "feat: add Board grid + VictoryModal with stars and schools"
```

---

### Task 13: Recompor `GameBoard` + `page` + `layout`

**Files:**
- Modify: `app/components/GameBoard.tsx` (substituição completa)
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `useMemoryGame` de `../hooks/useMemoryGame`; `PAIRS`, `Difficulty` de `../lib/difficulty`; `calcStars` de `../lib/scoring`; `getSchool` de `../data/schools`; componentes `Header`, `DifficultySelector`, `Scoreboard`, `Board`, `VictoryModal`.
- Produces: app jogável completo.

- [ ] **Step 1: Substituir `app/components/GameBoard.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import Header from './Header';
import DifficultySelector from './DifficultySelector';
import Scoreboard from './Scoreboard';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { PAIRS, type Difficulty } from '../lib/difficulty';
import { calcStars } from '../lib/scoring';
import { getSchool, type SchoolId } from '../data/schools';

export default function GameBoard() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const { state, time, records, flip, restart } = useMemoryGame(difficulty);

  const totalPairs = PAIRS[difficulty];
  const locked = state.phase !== 'playing';
  const best = records ? records[difficulty] : null;
  const won = state.phase === 'won';
  const stars = calcStars(state.moves, totalPairs);
  const schoolsInGame = won
    ? Array.from(new Set(state.cards.map((c) => c.course.schoolId))).map((id: SchoolId) => getSchool(id))
    : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4 py-8">
      <Header />
      <DifficultySelector value={difficulty} onChange={setDifficulty} />
      <Scoreboard
        moves={state.moves}
        matches={state.matches}
        totalPairs={totalPairs}
        time={time}
        best={best}
      />

      {state.cards.length > 0 ? (
        <Board cards={state.cards} difficulty={difficulty} locked={locked} onFlip={flip} />
      ) : (
        <div className="grid grid-cols-4 gap-3 w-full">
          {Array.from({ length: totalPairs * 2 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-neutral-200 animate-pulse" />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={restart}
        className="flex items-center gap-2 px-6 py-3 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-full transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Reiniciar
      </button>

      {won && (
        <VictoryModal
          moves={state.moves}
          time={time}
          stars={stars}
          schools={schoolsInGame}
          onRestart={restart}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Substituir `app/page.tsx`**

```tsx
import GameBoard from './components/GameBoard';

export default function Home() {
  return (
    <main className="min-h-screen bg-surface flex items-start justify-center">
      <GameBoard />
    </main>
  );
}
```

- [ ] **Step 3: Corrigir `app/layout.tsx` (lang + metadata)**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jogo da Memória — Unisinos Start",
  description: "Encontre os pares de cursos e descubra as Escolas da Unisinos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Rodar toda a suíte de testes**

Run: `npm test`
Expected: PASS (todos os testes).

- [ ] **Step 5: Build de produção**

Run: `npm run build`
Expected: build conclui sem erros de tipo/lint.

- [ ] **Step 6: Verificação manual no navegador**

Run: `npm run dev` e abrir `http://localhost:3000`. Conferir:
- Espiada inicial (~2,5s) mostra e esconde as cartas.
- Flip 3D funciona; par certo fica verde; par errado desvira.
- Placar conta jogadas/pares/tempo; recorde aparece após vencer e persiste ao recarregar (F5).
- Trocar dificuldade reinicia com grid responsivo.
- Tela de vitória mostra estrelas + escolas.
- Header carmim "UNISINOS Start".

- [ ] **Step 7: Commit**

```bash
git add app/components/GameBoard.tsx app/page.tsx app/layout.tsx
git commit -m "feat: recompose GameBoard from hook + components, Unisinos layout"
```

---

### Task 14: Centralizar documentação no CLAUDE.md + README + verificação final

**Files:**
- Modify: `CLAUDE.md` (substituição completa)
- Modify: `README.md`

**Interfaces:**
- Consumes: tudo implementado.
- Produces: documentação central atualizada.

- [ ] **Step 1: Substituir `CLAUDE.md` inteiro**

````markdown
# Jogo da Memória — Unisinos Start

## Contexto

Atividade prática do evento **Start da Unisinos**: uma aplicação interativa e
lúdica que envolve o público com o universo acadêmico da universidade.

## Aplicação

Jogo da memória clássico: o jogador vira duas cartas por vez tentando achar
**pares do mesmo curso**. Cada carta é pintada com a **cor da Escola** a que o
curso pertence — então, além de jogar, o participante conhece a estrutura de
Escolas e cursos da Unisinos. As cartas são embaralhadas a cada partida.

Fluxo:
1. O jogador escolhe o nível de dificuldade.
2. **Espiada inicial:** todas as cartas aparecem viradas por ~2,5s e escondem.
3. O jogador clica em duas cartas por vez procurando o par.
4. Par certo permanece; par errado desvira após ~1s.
5. O jogo termina quando todos os pares são encontrados.
6. A tela de vitória mostra estrelas, jogadas, tempo e as Escolas que apareceram.

## Funcionalidades

- **Três dificuldades:** Fácil 6 pares (12 cartas), Médio 10 (20), Difícil 16 (32).
- **Sorteio geral:** cada partida sorteia N cursos aleatórios do catálogo de 54,
  misturando Escolas — o tabuleiro é um mosaico de cores diferente a cada jogo.
- **Espiada inicial** de ~2,5s antes de começar (cronômetro só começa depois).
- **Animação de flip 3D** (desligada quando o sistema pede "reduzir movimento").
- **Placar em tempo real:** jogadas, pares encontrados/total, cronômetro.
- **Recordes persistentes** (localStorage) de menor nº de jogadas e menor tempo,
  por dificuldade — sobrevivem ao recarregar a página.
- **Estrelas (1–3)** por eficiência na tela de vitória.
- **Botão Reiniciar** a qualquer momento.
- **Acessibilidade:** cartas são botões (teclado + `aria-label`), região
  `aria-live` para pares/vitória, layout responsivo (celular e projetor).

## Cursos e Escolas

Fonte da lista: `docs/cursos.md`. Curadoria aplicada: as 3 variantes de
"Administração" viram uma só e "Comércio Exterior" duplicado é mantido uma vez →
**54 cursos** em **6 Escolas**:

| Escola | id | Cor | Nº cursos |
|---|---|---|---|
| Politécnica | `politecnica` | Azul | 18 |
| Artes, Humanidades e Economia Criativa | `artes` | Fúcsia/Violeta | 15 |
| Gestão e Negócios | `gestao` | Âmbar | 11 |
| Saúde | `saude` | Esmeralda | 8 |
| Direito | `direito` | Índigo | 1 |
| Direito e Relações Internacionais | `direito-ri` | Teal | 1 |

O vermelho carmim (`#C8102E`) é reservado à **marca Unisinos** (header, botões,
carta fechada) — nenhuma Escola usa vermelho.

## Identidade visual

- Fundo claro institucional (`--color-surface`), acento **carmim `#C8102E`**.
- Header textual "**UNISINOS** · Start" (placeholder do logo oficial — trocar
  quando o arquivo estiver disponível).
- Cartas: frente carmim com "?"; verso com gradiente da Escola + ícone + nome.

## Tecnologias

Next.js 16, React 19, Tailwind CSS 4, lucide-react. Testes com Vitest +
@testing-library/react.

## Arquitetura

- `app/data/schools.ts` — as 6 Escolas (cor/ícone).
- `app/data/courses.ts` — os 54 cursos (`id`, `label`, `schoolId`, `Icon`).
- `app/lib/difficulty.ts` — níveis e nº de pares.
- `app/lib/deck.ts` — embaralhamento e montagem do baralho.
- `app/lib/gameReducer.ts` — **reducer puro** com a máquina de estados
  (peek → playing → checking → won). Toda a lógica de jogo, testável sem React.
- `app/hooks/useMemoryGame.ts` — hook que orquestra reducer + timers (espiada,
  resolução, cronômetro) + persistência de recordes.
- `app/lib/scoring.ts` (estrelas), `app/lib/storage.ts` (recordes localStorage,
  SSR-safe), `app/lib/format.ts` (mm:ss).
- `app/components/` — `Header`, `DifficultySelector`, `Scoreboard`, `Board`,
  `Card`, `VictoryModal`; `GameBoard` compõe tudo.

## Comandos

- `npm run dev` — servidor de desenvolvimento.
- `npm test` — suíte de testes (Vitest).
- `npm run build` — build de produção (checa tipos e lint).

## Convenções

- Textos de UI em **PT-BR com acentuação correta**.
- Somente imports relativos no código (sem alias `@/`) para o Vitest resolver
  sem configuração extra.
- Lógica de jogo nova entra no reducer (com teste) antes da UI.
````

- [ ] **Step 2: Substituir `README.md`**

```markdown
# Jogo da Memória — Unisinos Start

Jogo da memória dos cursos da Unisinos, feito para o evento **Start**. Ache os
pares do mesmo curso; cada carta tem a cor da sua Escola.

## Rodando

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — desenvolvimento
- `npm test` — testes (Vitest)
- `npm run build` — build de produção

## Documentação

Visão geral do jogo, cursos/Escolas e arquitetura em [`CLAUDE.md`](./CLAUDE.md).
Design e plano em `docs/superpowers/`.
```

- [ ] **Step 3: Verificação final — testes + build + lint**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: sucesso.

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: centralize project docs in CLAUDE.md + refresh README"
```

---

## Notas de execução

- **Ordem de dependência de tipo:** `BoardCard` é definido em `deck.ts` (Task 6) e re-exportado por `gameReducer.ts` (Task 7); `useMemoryGame` (Task 8), `Board` (Task 12) e testes podem importar `BoardCard` de qualquer um dos dois. Executar as tasks na ordem numérica satisfaz todas as dependências (dificuldade → utils → storage → schools → courses → deck → reducer → hook → CSS → componentes → composição → docs).
- **Não rodar `npm run build`/`tsc` no meio (Tasks 5–12):** ao remover `bg`/`text` de `Course` (Task 5), o `Card` antigo fica com erro de tipo até ser substituído (Task 10) e o `GameBoard` antigo até a Task 13. Entre as tasks use só `npm test` (Vitest/esbuild não faz type-check). O type-check completo volta a passar no `npm run build` da Task 13/14.
- **Ícones lucide:** se um teste falhar no import de ícone (`does not provide an export named X`) ou na asserção "ícone truthy", troque pelo vizinho semântico mais próximo (ex.: `Accessibility`→`PersonStanding`, `Earth`→`Globe2`, `Salad`→`Apple`, `Backpack`→`GraduationCap`) e rode de novo.
- **Branch:** o repositório está na `main`. Antes do primeiro commit desta implementação, crie um branch de trabalho (ex.: `git checkout -b feat/redesign-memoria`).
```
