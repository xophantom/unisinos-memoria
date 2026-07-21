# Mini Teste Vocacional antes do Jogo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um mini teste vocacional (2 perguntas) como porta de entrada; as respostas escolhem uma das 5 áreas, e o jogo passa a exibir sempre 6 pares temáticos dos cursos dessa área (removendo a seleção de dificuldade).

**Architecture:** Novos dados puros (`areas.ts`, `quiz.ts` com `resolveArea`), novos componentes de tela (`Quiz`, `AreaReveal`) e um controlador de fluxo (`GameFlow`) com máquina `quiz → reveal → game`. O `useMemoryGame` passa a receber a área (pool de cursos, 6 pares fixos) e o `storage` passa a guardar recordes por área. `Board`/`GameBoard` perdem a dependência de dificuldade.

**Tech Stack:** Next.js 16, React 19, Tailwind 4, lucide-react, Vitest + @testing-library/react.

**Spec:** `docs/superpowers/specs/2026-07-20-mini-teste-vocacional-design.md`

## Global Constraints

- Manter versões: Next 16.1.6, React 19.2.3, Tailwind 4, lucide-react ^0.576.
- Todo texto de UI em **PT-BR com acentuação correta**.
- **Somente imports relativos** (sem alias `@/`).
- **5 áreas:** `tecnologia`, `saude`, `negocios`, `artes`, `ciencias`. `PAIRS_PER_GAME = 6`.
- `resolveArea`: P1 dá a área; se P1=`natureza`, P2 decide (`construir`→tecnologia, `cuidar`→saude, senão→ciencias).
- Recordes por `AreaId`, chave localStorage `unisinos-memoria-records-areas`, SSR-safe.
- Sem tiers de dificuldade — o jogo é sempre 6 pares.
- **Não rodar `npm run build`/`tsc` entre as tasks 3–8** (estados intermediários ficam com erro de tipo por causa da remoção de `difficulty.ts`). Verificar com `npm test` (Vitest/esbuild não faz type-check). O build volta a passar na **Task 9**; verificação final na **Task 10**.

---

### Task 1: Dados das Áreas (`areas.ts`)

**Files:**
- Create: `app/data/areas.ts`
- Test: `app/data/areas.test.ts`

**Interfaces:**
- Consumes: `COURSES`/`Course` de `./courses`.
- Produces:
  - `type AreaId = 'tecnologia' | 'saude' | 'negocios' | 'artes' | 'ciencias'`
  - `interface Area { id: AreaId; label: string; emoji: string; accent: string; courseIds: string[] }`
  - `AREAS: Record<AreaId, Area>`
  - `getAreaCourses(id: AreaId): Course[]`
  - `PAIRS_PER_GAME = 6`

- [ ] **Step 1: Escrever teste `app/data/areas.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { AREAS, getAreaCourses, PAIRS_PER_GAME, type AreaId } from './areas';
import { COURSES } from './courses';

const AREA_IDS: AreaId[] = ['tecnologia', 'saude', 'negocios', 'artes', 'ciencias'];

describe('AREAS', () => {
  it('tem as 5 áreas', () => {
    expect(Object.keys(AREAS).sort()).toEqual([...AREA_IDS].sort());
  });
  it('PAIRS_PER_GAME é 6', () => {
    expect(PAIRS_PER_GAME).toBe(6);
  });
  it('cada área tem label, emoji e accent', () => {
    for (const id of AREA_IDS) {
      expect(AREAS[id].label).toBeTruthy();
      expect(AREAS[id].emoji).toBeTruthy();
      expect(AREAS[id].accent).toMatch(/from-/);
    }
  });
  it('todo courseId de toda área existe em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const id of AREA_IDS) {
      for (const cid of AREAS[id].courseIds) {
        expect(valid.has(cid), `curso inexistente "${cid}" na área "${id}"`).toBe(true);
      }
    }
  });
  it('getAreaCourses resolve todos os ids e cada área tem ao menos 6 cursos', () => {
    for (const id of AREA_IDS) {
      const courses = getAreaCourses(id);
      expect(courses.length).toBe(AREAS[id].courseIds.length);
      expect(courses.length).toBeGreaterThanOrEqual(PAIRS_PER_GAME);
    }
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- areas`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Criar `app/data/areas.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- areas`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/data/areas.ts app/data/areas.test.ts
git commit -m "feat: add areas data (5 areas, pools, getAreaCourses)"
```

---

### Task 2: Perguntas + `resolveArea` (`quiz.ts`)

**Files:**
- Create: `app/data/quiz.ts`
- Test: `app/data/quiz.test.ts`

**Interfaces:**
- Consumes: `AreaId` de `./areas`.
- Produces:
  - `type Q1Id = 'tech' | 'saude' | 'empresas' | 'pessoas' | 'natureza'`
  - `type Q2Id = 'construir' | 'cuidar' | 'liderar' | 'produzir' | 'pesquisar'`
  - `interface QuizOption<T> { id: T; label: string; emoji: string }`
  - `interface Question<T> { id: string; prompt: string; options: QuizOption<T>[] }`
  - `QUESTION_1: Question<Q1Id>`, `QUESTION_2: Question<Q2Id>`
  - `resolveArea(p1: Q1Id, p2: Q2Id): AreaId`

- [ ] **Step 1: Escrever teste `app/data/quiz.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { QUESTION_1, QUESTION_2, resolveArea, type Q2Id } from './quiz';

const ALL_Q2: Q2Id[] = ['construir', 'cuidar', 'liderar', 'produzir', 'pesquisar'];

describe('perguntas', () => {
  it('cada pergunta tem 5 opções com id/label/emoji', () => {
    for (const q of [QUESTION_1, QUESTION_2]) {
      expect(q.options).toHaveLength(5);
      for (const o of q.options) {
        expect(o.id).toBeTruthy();
        expect(o.label).toBeTruthy();
        expect(o.emoji).toBeTruthy();
      }
    }
  });
});

describe('resolveArea', () => {
  it('mapeia P1 direto (qualquer P2) quando P1 != natureza', () => {
    for (const p2 of ALL_Q2) {
      expect(resolveArea('tech', p2)).toBe('tecnologia');
      expect(resolveArea('saude', p2)).toBe('saude');
      expect(resolveArea('empresas', p2)).toBe('negocios');
      expect(resolveArea('pessoas', p2)).toBe('artes');
    }
  });
  it('natureza é refinada por P2', () => {
    expect(resolveArea('natureza', 'construir')).toBe('tecnologia');
    expect(resolveArea('natureza', 'cuidar')).toBe('saude');
    expect(resolveArea('natureza', 'pesquisar')).toBe('ciencias');
    expect(resolveArea('natureza', 'liderar')).toBe('ciencias');
    expect(resolveArea('natureza', 'produzir')).toBe('ciencias');
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- quiz`
Expected: FAIL.

- [ ] **Step 3: Criar `app/data/quiz.ts`**

```ts
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
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- quiz`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/data/quiz.ts app/data/quiz.test.ts
git commit -m "feat: add quiz questions and resolveArea"
```

---

### Task 3: Recordes por Área (`storage.ts` re-key)

**Files:**
- Modify: `app/lib/storage.ts` (substituição do keying `Difficulty` → `AreaId`)
- Test: `app/lib/storage.test.ts` (atualizar para áreas)

**Interfaces:**
- Consumes: `AreaId` de `../data/areas`.
- Produces:
  - `interface BestScore { bestMoves: number | null; bestTime: number | null }` (inalterado)
  - `type Records = Record<AreaId, BestScore>`
  - `emptyRecords(): Records`, `mergeBest(...)`, `loadRecords(): Records`, `saveResult(areaId: AreaId, result): Records`

- [ ] **Step 1: Substituir `app/lib/storage.test.ts`**

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

describe('persistência por área', () => {
  beforeEach(() => window.localStorage.clear());

  it('emptyRecords tem as 5 áreas nulas', () => {
    const r = emptyRecords();
    expect(Object.keys(r).sort()).toEqual(['artes', 'ciencias', 'negocios', 'saude', 'tecnologia']);
    expect(r.tecnologia).toEqual({ bestMoves: null, bestTime: null });
  });
  it('saveResult grava e loadRecords lê o melhor por área', () => {
    saveResult('tecnologia', { moves: 10, time: 40 });
    saveResult('tecnologia', { moves: 8, time: 55 });
    expect(loadRecords().tecnologia).toEqual({ bestMoves: 8, bestTime: 40 });
  });
  it('tolera JSON parcial corrompido (sem NaN)', () => {
    window.localStorage.setItem('unisinos-memoria-records-areas', JSON.stringify({ saude: { bestMoves: 5 } }));
    expect(loadRecords().saude).toEqual({ bestMoves: 5, bestTime: null });
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- storage`
Expected: FAIL (ainda keyed por dificuldade).

- [ ] **Step 3: Substituir `app/lib/storage.ts`**

```ts
import type { AreaId } from '../data/areas';

export interface BestScore {
  bestMoves: number | null;
  bestTime: number | null;
}
export type Records = Record<AreaId, BestScore>;

const KEY = 'unisinos-memoria-records-areas';
const AREA_IDS: AreaId[] = ['tecnologia', 'saude', 'negocios', 'artes', 'ciencias'];

export function emptyRecords(): Records {
  return AREA_IDS.reduce((acc, id) => {
    acc[id] = { bestMoves: null, bestTime: null };
    return acc;
  }, {} as Records);
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
    const parsed = JSON.parse(raw) as Partial<Record<AreaId, Partial<BestScore>>>;
    const base = emptyRecords();
    for (const id of AREA_IDS) {
      const entry = parsed[id];
      if (entry) {
        base[id] = {
          bestMoves: entry.bestMoves ?? null,
          bestTime: entry.bestTime ?? null,
        };
      }
    }
    return base;
  } catch {
    return emptyRecords();
  }
}

export function saveResult(areaId: AreaId, result: { moves: number; time: number }): Records {
  const records = loadRecords();
  const next: Records = { ...records, [areaId]: mergeBest(records[areaId], result) };
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
Expected: PASS. (Não rodar build: `useMemoryGame`/`GameBoard` antigos ainda usam a assinatura antiga; corrigidos nas Tasks 4 e 8. Vitest não faz type-check.)

- [ ] **Step 5: Commit**

```bash
git add app/lib/storage.ts app/lib/storage.test.ts
git commit -m "refactor: key records by area instead of difficulty"
```

---

### Task 4: `useMemoryGame` por Área

**Files:**
- Modify: `app/hooks/useMemoryGame.ts`
- Test: `app/hooks/useMemoryGame.test.ts`

**Interfaces:**
- Consumes: `gameReducer`/`initialState`/`GameState` de `../lib/gameReducer`; `buildDeck` de `../lib/deck`; `AREAS`/`getAreaCourses`/`PAIRS_PER_GAME`/`Area` de `../data/areas`; `saveResult`/`loadRecords`/`Records` de `../lib/storage`.
- Produces: `useMemoryGame(area: Area): { state: GameState; time: number; records: Records | null; flip: (id: number) => void; restart: () => void }`

- [ ] **Step 1: Substituir `app/hooks/useMemoryGame.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { AREAS } from '../data/areas';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('inicia em peek com 12 cartas (6 pares) da área e vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame(AREAS.tecnologia));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(12);
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame(AREAS.saude));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });

  it('cronômetro continua contando na transição playing → checking', () => {
    const { result } = renderHook(() => useMemoryGame(AREAS.artes));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { vi.advanceTimersByTime(2500); }); // fim da espiada
    act(() => { result.current.flip(0); });
    act(() => { vi.advanceTimersByTime(900); });
    act(() => { result.current.flip(1); });
    act(() => { vi.advanceTimersByTime(200); }); // total 1100ms contínuos, ainda em checking
    expect(result.current.time).toBe(1);
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- useMemoryGame`
Expected: FAIL (assinatura antiga por dificuldade).

- [ ] **Step 3: Substituir `app/hooks/useMemoryGame.ts`**

```ts
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { gameReducer, initialState, type GameState } from '../lib/gameReducer';
import { buildDeck } from '../lib/deck';
import { getAreaCourses, PAIRS_PER_GAME, type Area } from '../data/areas';
import { saveResult, loadRecords, type Records } from '../lib/storage';

const PEEK_MS = 2500;
const MATCH_MS = 500;
const MISMATCH_MS = 1000;

export function useMemoryGame(area: Area): {
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

  const newGame = useCallback((a: Area) => {
    savedRef.current = false;
    setTime(0);
    dispatch({
      type: 'NEW_GAME',
      cards: buildDeck(PAIRS_PER_GAME, getAreaCourses(a.id)),
      totalPairs: PAIRS_PER_GAME,
    });
  }, []);

  // (re)inicia ao trocar de área e na montagem
  useEffect(() => {
    newGame(area);
  }, [area, newGame]);

  // fim da espiada — reinicia a cada novo jogo (state.gameId muda)
  useEffect(() => {
    if (state.phase !== 'peek') return;
    const t = setTimeout(() => dispatch({ type: 'END_PEEK' }), PEEK_MS);
    return () => clearTimeout(t);
  }, [state.phase, state.gameId]);

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

  // cronômetro contínuo durante playing/checking, após o primeiro flip
  const started = state.moves > 0 || state.flipped.length > 0;
  const isTicking = started && (state.phase === 'playing' || state.phase === 'checking');
  useEffect(() => {
    if (!isTicking) return;
    const iv = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(iv);
  }, [isTicking]);

  // persiste recorde da área ao vencer (uma vez)
  useEffect(() => {
    if (state.phase === 'won' && !savedRef.current) {
      savedRef.current = true;
      setRecords(saveResult(area.id, { moves: state.moves, time }));
    }
  }, [state.phase, area.id, state.moves, time]);

  const flip = useCallback((id: number) => dispatch({ type: 'FLIP', id }), []);
  const restart = useCallback(() => newGame(area), [newGame, area]);

  return { state, time, records, flip, restart };
}
```

> Nota: o `gameReducer` já expõe `state.gameId` (adicionado no polish anterior), incrementado a cada `NEW_GAME`; por isso a espiada reinicia corretamente ao "Reiniciar"/trocar de área. Nenhuma mudança no reducer é necessária.

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- useMemoryGame`
Expected: PASS. (Não rodar build — `GameBoard` antigo ainda usa dificuldade; corrigido na Task 8.)

- [ ] **Step 5: Commit**

```bash
git add app/hooks/useMemoryGame.ts app/hooks/useMemoryGame.test.ts
git commit -m "refactor: useMemoryGame takes an area (6-pair themed game, records by area)"
```

---

### Task 5: `VictoryModal` — ação secundária "Refazer o teste"

**Files:**
- Modify: `app/components/VictoryModal.tsx`
- Test: `app/components/VictoryModal.test.tsx`

**Interfaces:**
- Produces: `VictoryModal` props `{ moves: number; time: number; stars: 1 | 2 | 3; schools: School[]; onRestart: () => void; onRestartQuiz: () => void }`

- [ ] **Step 1: Substituir `app/components/VictoryModal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { SCHOOLS } from '../data/schools';

const base = {
  moves: 9,
  time: 75,
  stars: 3 as const,
  schools: [SCHOOLS.saude],
  onRestart: () => {},
  onRestartQuiz: () => {},
};

describe('VictoryModal', () => {
  it('mostra jogadas e tempo', () => {
    render(<VictoryModal {...base} />);
    expect(screen.getByText(/9 jogadas/)).toBeInTheDocument();
    expect(screen.getByText(/01:15/)).toBeInTheDocument();
  });
  it('rotula a quantidade de estrelas', () => {
    render(<VictoryModal {...base} stars={2} />);
    expect(screen.getByLabelText('2 de 3 estrelas')).toBeInTheDocument();
  });
  it('mostra as escolas que apareceram', () => {
    render(<VictoryModal {...base} schools={[SCHOOLS.saude, SCHOOLS.politecnica]} />);
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Politécnica')).toBeInTheDocument();
  });
  it('chama onRestart no botão "Jogar de novo"', async () => {
    const onRestart = vi.fn();
    render(<VictoryModal {...base} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Jogar de novo' }));
    expect(onRestart).toHaveBeenCalled();
  });
  it('chama onRestartQuiz no botão "Refazer o teste"', async () => {
    const onRestartQuiz = vi.fn();
    render(<VictoryModal {...base} onRestartQuiz={onRestartQuiz} />);
    await userEvent.click(screen.getByRole('button', { name: 'Refazer o teste' }));
    expect(onRestartQuiz).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- VictoryModal`
Expected: FAIL (falta `onRestartQuiz`/botão).

- [ ] **Step 3: Substituir `app/components/VictoryModal.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Trophy, Star } from 'lucide-react';
import type { School } from '../data/schools';
import { formatTime } from '../lib/format';

interface Props {
  moves: number;
  time: number;
  stars: 1 | 2 | 3;
  schools: School[];
  onRestart: () => void;
  onRestartQuiz: () => void;
}

export default function VictoryModal({ moves, time, stars, schools, onRestart, onRestartQuiz }: Props) {
  const restartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    restartRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vitória"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onRestart();
      }}
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
        <div className="mt-2 flex flex-col gap-2">
          <button
            ref={restartRef}
            type="button"
            onClick={onRestart}
            className="bg-unisinos hover:bg-unisinos-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            Jogar de novo
          </button>
          <button
            type="button"
            onClick={onRestartQuiz}
            className="text-neutral-500 hover:text-neutral-800 font-semibold text-sm transition-colors"
          >
            Refazer o teste
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- VictoryModal`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/VictoryModal.tsx app/components/VictoryModal.test.tsx
git commit -m "feat: add 'Refazer o teste' action to VictoryModal"
```

---

### Task 6: Componente `Quiz`

**Files:**
- Create: `app/components/Quiz.tsx`
- Test: `app/components/Quiz.test.tsx`

**Interfaces:**
- Consumes: `QUESTION_1`/`QUESTION_2`/`Q1Id`/`Q2Id` de `../data/quiz`.
- Produces: `Quiz` props `{ onComplete: (p1: Q1Id, p2: Q2Id) => void }`.

- [ ] **Step 1: Escrever teste `app/components/Quiz.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';

describe('Quiz', () => {
  it('mostra a pergunta 1 primeiro, depois a 2, e chama onComplete', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    expect(screen.getByText('O que mais desperta sua curiosidade?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Computadores, tecnologia e inovação/ }));

    expect(screen.getByText('Qual atividade parece mais legal?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Construir apps, máquinas ou sistemas/ }));

    expect(onComplete).toHaveBeenCalledWith('tech', 'construir');
  });

  it('permite voltar da pergunta 2 para a 1', async () => {
    render(<Quiz onComplete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /Saúde e bem-estar/ }));
    expect(screen.getByText('Qual atividade parece mais legal?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('O que mais desperta sua curiosidade?')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- Quiz`
Expected: FAIL.

- [ ] **Step 3: Criar `app/components/Quiz.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTION_1, QUESTION_2, type Q1Id, type Q2Id } from '../data/quiz';

interface Props {
  onComplete: (p1: Q1Id, p2: Q2Id) => void;
}

export default function Quiz({ onComplete }: Props) {
  const [p1, setP1] = useState<Q1Id | null>(null);
  const step = p1 === null ? 1 : 2;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <div className="text-xs font-bold uppercase tracking-wide text-unisinos">Pergunta {step} de 2</div>

      {step === 1 ? (
        <>
          <h2 className="text-2xl font-extrabold text-neutral-900 text-center">{QUESTION_1.prompt}</h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_1.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setP1(o.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl" aria-hidden>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-extrabold text-neutral-900 text-center">{QUESTION_2.prompt}</h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_2.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => onComplete(p1 as Q1Id, o.id)}
                className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl" aria-hidden>{o.emoji}</span>
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setP1(null)}
            className="flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Voltar
          </button>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- Quiz`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/Quiz.tsx app/components/Quiz.test.tsx
git commit -m "feat: add Quiz component (two-question vocational mini-test)"
```

---

### Task 7: Componente `AreaReveal`

**Files:**
- Create: `app/components/AreaReveal.tsx`
- Test: `app/components/AreaReveal.test.tsx`

**Interfaces:**
- Consumes: `Area` de `../data/areas`; `QUESTION_1`/`QUESTION_2`/`Q1Id`/`Q2Id` de `../data/quiz`.
- Produces: `AreaReveal` props `{ area: Area; p1: Q1Id; p2: Q2Id; onStart: () => void }`.

- [ ] **Step 1: Escrever teste `app/components/AreaReveal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AreaReveal from './AreaReveal';
import { AREAS } from '../data/areas';

describe('AreaReveal', () => {
  it('mostra o nome da área resolvida', () => {
    render(<AreaReveal area={AREAS.tecnologia} p1="tech" p2="construir" onStart={() => {}} />);
    expect(screen.getByText('Tecnologia e Engenharia')).toBeInTheDocument();
  });
  it('chama onStart no botão "Começar a jogar"', async () => {
    const onStart = vi.fn();
    render(<AreaReveal area={AREAS.saude} p1="saude" p2="cuidar" onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));
    expect(onStart).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- AreaReveal`
Expected: FAIL.

- [ ] **Step 3: Criar `app/components/AreaReveal.tsx`**

```tsx
'use client';

import type { Area } from '../data/areas';
import { QUESTION_1, QUESTION_2, type Q1Id, type Q2Id } from '../data/quiz';

interface Props {
  area: Area;
  p1: Q1Id;
  p2: Q2Id;
  onStart: () => void;
}

export default function AreaReveal({ area, p1, p2, onStart }: Props) {
  const l1 = QUESTION_1.options.find((o) => o.id === p1)?.label ?? '';
  const l2 = QUESTION_2.options.find((o) => o.id === p2)?.label ?? '';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
      <div className="text-6xl" aria-hidden>{area.emoji}</div>
      <p className="text-neutral-500 font-semibold">Você tem tudo a ver com</p>
      <h2 className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-br ${area.accent} bg-clip-text text-transparent`}>
        {area.label}
      </h2>
      <p className="text-sm text-neutral-500">
        {l1} + {l2}
      </p>
      <p className="text-neutral-600">Bora achar os pares dos cursos dessa área?</p>
      <button
        type="button"
        onClick={onStart}
        className="mt-2 bg-unisinos hover:bg-unisinos-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
      >
        Começar a jogar
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Rodar e verificar que passa**

Run: `npm test -- AreaReveal`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/components/AreaReveal.tsx app/components/AreaReveal.test.tsx
git commit -m "feat: add AreaReveal component (result screen)"
```

---

### Task 8: `Board` fixo + `GameBoard` por área + remoção de dificuldade

**Files:**
- Modify: `app/components/Board.tsx` (grid fixo de 12 cartas, sem dificuldade)
- Modify: `app/components/GameBoard.tsx` (substituição completa)
- Delete: `app/components/DifficultySelector.tsx`, `app/components/DifficultySelector.test.tsx`
- Delete: `app/lib/difficulty.ts`

**Interfaces:**
- Consumes: `useMemoryGame` de `../hooks/useMemoryGame`; `PAIRS_PER_GAME`/`Area` de `../data/areas`; `calcStars` de `../lib/scoring`; `getSchool` de `../data/schools`; `Scoreboard`, `Board`, `VictoryModal`.
- Produces:
  - `Board` props `{ cards: BoardCard[]; locked: boolean; onFlip: (id: number) => void }`
  - `GameBoard` props `{ area: Area; onRestartQuiz: () => void }`

- [ ] **Step 1: Substituir `app/components/Board.tsx`**

```tsx
'use client';

import Card from './Card';
import type { BoardCard } from '../lib/gameReducer';

interface Props {
  cards: BoardCard[];
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Board({ cards, locked, onFlip }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
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

- [ ] **Step 2: Substituir `app/components/GameBoard.tsx`**

```tsx
'use client';

import { RotateCcw } from 'lucide-react';
import Scoreboard from './Scoreboard';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { PAIRS_PER_GAME, type Area } from '../data/areas';
import { calcStars } from '../lib/scoring';
import { getSchool, type SchoolId } from '../data/schools';

interface Props {
  area: Area;
  onRestartQuiz: () => void;
}

export default function GameBoard({ area, onRestartQuiz }: Props) {
  const { state, time, records, flip, restart } = useMemoryGame(area);

  const locked = state.phase !== 'playing';
  const best = records ? records[area.id] : null;
  const won = state.phase === 'won';
  const stars = calcStars(state.moves, PAIRS_PER_GAME);
  const schoolsInGame = won
    ? Array.from(new Set(state.cards.map((c) => c.course.schoolId))).map((id: SchoolId) => getSchool(id))
    : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
        <span className="text-lg" aria-hidden>{area.emoji}</span>
        {area.label}
      </div>

      <Scoreboard
        moves={state.moves}
        matches={state.matches}
        totalPairs={PAIRS_PER_GAME}
        time={time}
        best={best}
      />

      {state.cards.length > 0 ? (
        <Board cards={state.cards} locked={locked} onFlip={flip} />
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
          {Array.from({ length: PAIRS_PER_GAME * 2 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-neutral-200 animate-pulse" />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={restart}
          className="flex items-center gap-2 px-6 py-3 bg-white ring-1 ring-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold rounded-full transition-all"
        >
          <RotateCcw className="w-4 h-4" aria-hidden />
          Reiniciar
        </button>
        <button
          type="button"
          onClick={onRestartQuiz}
          className="px-6 py-3 text-neutral-500 hover:text-neutral-800 font-semibold rounded-full transition-colors"
        >
          Refazer o teste
        </button>
      </div>

      {won && (
        <VictoryModal
          moves={state.moves}
          time={time}
          stars={stars}
          schools={schoolsInGame}
          onRestart={restart}
          onRestartQuiz={onRestartQuiz}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Apagar os arquivos de dificuldade**

```bash
git rm app/components/DifficultySelector.tsx app/components/DifficultySelector.test.tsx app/lib/difficulty.ts
```

- [ ] **Step 4: Rodar a suíte e verificar que passa**

Run: `npm test`
Expected: PASS. (Não rodar build ainda: `page.tsx` ainda renderiza `<GameBoard/>` sem props — corrigido na Task 9. Nenhum teste importa `page`/`GameBoard`/`Board`/`DifficultySelector`.)

- [ ] **Step 5: Commit**

```bash
git add app/components/Board.tsx app/components/GameBoard.tsx
git commit -m "refactor: area-based GameBoard, fixed 6-pair Board, drop difficulty"
```

---

### Task 9: Controlador de fluxo `GameFlow` + `page.tsx`

**Files:**
- Create: `app/components/GameFlow.tsx`
- Modify: `app/page.tsx`
- Test: `app/components/GameFlow.test.tsx`

**Interfaces:**
- Consumes: `Header`, `Quiz`, `AreaReveal`, `GameBoard`; `resolveArea`/`Q1Id`/`Q2Id` de `../data/quiz`; `AREAS` de `../data/areas`.
- Produces: `GameFlow` (sem props) — máquina `quiz → reveal → game`.

- [ ] **Step 1: Escrever teste `app/components/GameFlow.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlow from './GameFlow';

describe('GameFlow', () => {
  it('quiz → reveal → game', async () => {
    render(<GameFlow />);

    // Quiz (pergunta 1)
    expect(screen.getByText('O que mais desperta sua curiosidade?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Computadores, tecnologia e inovação/ }));
    // Pergunta 2
    await userEvent.click(screen.getByRole('button', { name: /Construir apps, máquinas ou sistemas/ }));

    // Reveal
    expect(screen.getByText('Tecnologia e Engenharia')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));

    // Game
    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });
});
```

> Nota: ao entrar na fase `game`, o `GameBoard` monta o `useMemoryGame`, que dispara timers reais (espiada) e um `setRecords` no efeito de montagem. Use `findByRole` (assíncrono) para a asserção do jogo e, se aparecer aviso de `act(...)`, envolva a transição em `await act(async () => {})` ou habilite fake timers no teste — o importante é que a saída fique limpa (sem warnings). Ajuste apenas o wiring do teste, não a lógica.

- [ ] **Step 2: Rodar e verificar que falha**

Run: `npm test -- GameFlow`
Expected: FAIL.

- [ ] **Step 3: Criar `app/components/GameFlow.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import AreaReveal from './AreaReveal';
import GameBoard from './GameBoard';
import { resolveArea, type Q1Id, type Q2Id } from '../data/quiz';
import { AREAS } from '../data/areas';

type Phase = 'quiz' | 'reveal' | 'game';

export default function GameFlow() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<{ p1: Q1Id; p2: Q2Id } | null>(null);

  const area = answers ? AREAS[resolveArea(answers.p1, answers.p2)] : null;

  const restartQuiz = () => {
    setAnswers(null);
    setPhase('quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4 py-8">
      <Header />

      {phase === 'quiz' && (
        <Quiz
          onComplete={(p1, p2) => {
            setAnswers({ p1, p2 });
            setPhase('reveal');
          }}
        />
      )}

      {phase === 'reveal' && area && answers && (
        <AreaReveal area={area} p1={answers.p1} p2={answers.p2} onStart={() => setPhase('game')} />
      )}

      {phase === 'game' && area && <GameBoard area={area} onRestartQuiz={restartQuiz} />}
    </div>
  );
}
```

- [ ] **Step 4: Substituir `app/page.tsx`**

```tsx
import GameFlow from './components/GameFlow';

export default function Home() {
  return (
    <main className="min-h-screen bg-surface flex items-start justify-center">
      <GameFlow />
    </main>
  );
}
```

- [ ] **Step 5: Rodar a suíte**

Run: `npm test -- GameFlow`
Expected: PASS.

- [ ] **Step 6: Rodar a suíte completa + build (o app volta a estar consistente)**

Run: `npm test`
Expected: PASS (todos).

Run: `npm run build`
Expected: sucesso (sem erros de tipo — `difficulty.ts` removido, `page → GameFlow → GameBoard(area)` consistente).

- [ ] **Step 7: Commit**

```bash
git add app/components/GameFlow.tsx app/components/GameFlow.test.tsx app/page.tsx
git commit -m "feat: add GameFlow (quiz -> reveal -> game) and wire page"
```

---

### Task 10: Atualizar CLAUDE.md + verificação final

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: tudo implementado.
- Produces: documentação central atualizada.

- [ ] **Step 1: Substituir as seções de jogo do `CLAUDE.md`**

Substituir as seções **## Aplicação**, **## Funcionalidades** e o início de **## Arquitetura** para refletir o novo fluxo. Conteúdo:

````markdown
## Aplicação

Antes de jogar, um **mini teste vocacional** de 2 perguntas define uma **área**.
O jogo então mostra um memória clássico de **6 pares** com cursos daquela área —
achar pares do mesmo curso, cada carta pintada pela **cor da Escola**.

Fluxo:
1. **Pergunta 1** (curiosidade) e **Pergunta 2** (atividade preferida).
2. As respostas resolvem uma das **5 áreas** (`resolveArea`): a P1 dá a área ampla
   e a P2 refina o caso "Ciências".
3. Tela de **resultado** ("Você tem tudo a ver com [Área]!") → botão Começar.
4. **Jogo:** espiada inicial ~2,5s, depois vira 2 cartas por vez procurando o par.
5. **Vitória:** estrelas, jogadas, tempo e Escolas que apareceram; botões
   **Jogar de novo** (mesma área) e **Refazer o teste** (volta às perguntas).

## Funcionalidades

- **Mini teste vocacional** (2 perguntas) como porta de entrada.
- **5 áreas** que filtram os cursos (pools em `app/data/areas.ts`):
  Tecnologia e Engenharia, Saúde e Bem-estar, Negócios/Gestão/Direito,
  Comunicação/Artes/Humanidades, Ciências e Meio Ambiente (cross-escola).
- **6 pares temáticos** por partida (sem tiers de dificuldade), sorteados do pool da área.
- **Espiada inicial** ~2,5s; **flip 3D** (respeita "reduzir movimento").
- **Placar em tempo real:** jogadas, pares, cronômetro.
- **Recordes persistentes por área** (localStorage): melhor nº de jogadas e menor tempo.
- **Estrelas (1–3)** por eficiência na tela de vitória.
- **Acessibilidade:** cartas e opções são botões (teclado + aria), modal com foco/Escape
  e fundo `inert`, região `aria-live`, layout responsivo.
````

Na seção **## Arquitetura**, adicionar/ajustar as linhas:

````markdown
- `app/data/areas.ts` — as 5 áreas (label, emoji, cor, pool de `courseIds`) + `PAIRS_PER_GAME`.
- `app/data/quiz.ts` — as 2 perguntas e `resolveArea(p1, p2)` (pura).
- `app/components/Quiz.tsx` — as 2 perguntas; `AreaReveal.tsx` — tela de resultado;
  `GameFlow.tsx` — máquina de fluxo `quiz → reveal → game`.
- `app/hooks/useMemoryGame.ts` — recebe a **área** (pool de cursos, 6 pares fixos);
  recordes por área.
- `app/lib/storage.ts` — recordes por `AreaId` (chave `unisinos-memoria-records-areas`).
````

Remover da doc qualquer menção a **três dificuldades / 6-10-16 pares / `DifficultySelector` / sorteio geral de todas as escolas** (substituídos pelo teste + 6 pares por área).

- [ ] **Step 2: Verificação final — testes + build + lint**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: sucesso.

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for vocational quiz + area-based game"
```

---

## Notas de execução

- **Não rodar `npm run build`/`tsc` nas Tasks 3–8.** Ao re-keyar o `storage` (Task 3) e trocar a assinatura do `useMemoryGame` (Task 4), o `GameBoard` antigo fica temporariamente incompatível; e apagar `difficulty.ts` (Task 8) deixa `page.tsx` referenciando `<GameBoard/>` sem props até a Task 9. Entre as tasks, verificar só com `npm test` (Vitest/esbuild não faz type-check). O build volta a passar na **Task 9** (page → GameFlow) e é confirmado na **Task 10**.
- **`gameReducer` não muda:** ele já expõe `state.gameId` (do polish anterior), usado pela espiada para reiniciar a cada novo jogo.
- **Card, deck, scoring, format, schools, courses:** inalterados. `buildDeck(pairs, courses)` já aceita um pool de cursos.
- **Branch:** criar um branch de trabalho a partir da `main` antes do primeiro commit (ex.: `git checkout -b feat/teste-vocacional`).
- **localStorage:** a chave mudou (`...-records-areas`), então recordes antigos por dificuldade são ignorados (sem migração — intencional).
