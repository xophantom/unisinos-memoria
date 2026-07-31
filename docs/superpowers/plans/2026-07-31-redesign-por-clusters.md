# Redesign por Clusters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar o jogo pelos 6 clusters oficiais da Unisinos: P1 escolhe o cluster, P2 escolhe 1 de 2 caminhos do cluster, o baralho de 6 pares é puxado do caminho, e "escola"/"área" somem da UI e do código.

**Architecture:** Nova camada de dados `clusters.ts` (6 clusters, cada um com 2 caminhos e cores próprias) substitui `areas.ts`. A cor da carta passa a vir do **cluster ativo** (não da Escola), então a camada `schools.ts`/`schoolId` é removida. O catálogo vai de 54 para 49 cursos (−9 órfãos, +4 novos). Quiz, hook, componentes e recordes são migrados de `Area`/`AreaId` para `Cluster`/`ClusterId`/`LaneId`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, lucide-react, Vitest + @testing-library/react.

## Global Constraints

- **Textos de UI em PT-BR com acentuação correta.** Nunca trocar acento por ASCII.
- **Somente imports relativos** (sem alias `@/`).
- **`PAIRS_PER_GAME = 6` fixo**; grid de 12 cartas (`grid-cols-3 sm:grid-cols-4`) inalterado.
- **Carmim `#C8102E` (token `unisinos`) é exclusivo da marca** (carta fechada "?", header, botões primários). **Nenhum `accent` de cluster pode conter `red`/`rose`/`unisinos`.**
- **Refactor multi-arquivo:** verifique **cada task com o comando de teste listado nela** (`npm test -- <arquivos>`). O runner é o Vitest (esbuild, **não faz type-check**). **NÃO** rode `npm run build`/`tsc` no meio — só na Task 5. A camada antiga (`areas.ts`, `schools.ts`) coexiste com a nova até a Task 4 (limpeza).
- Após cada task, o **`npm test` completo (runtime) deve ficar verde**. O `tsc`/`build` pode ficar vermelho entre a Task 2 e a Task 3 (esperado) — será restaurado na Task 5.
- Commits frequentes, mensagens em PT-BR, terminando com:
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
- Comando de teste alvo: `npm test -- <caminho...>`. Suíte completa: `npm test`.

---

### Task 1: Catálogo estendido + `clusters.ts`

**Files:**
- Modify: `app/data/courses.ts` (adiciona 4 cursos novos; mantém `schoolId` e os órfãos por ora)
- Modify: `app/data/courses.test.ts` (contagens 54→58)
- Create: `app/data/clusters.ts`
- Test: `app/data/clusters.test.ts`

**Interfaces:**
- Consumes: `COURSES`, `Course` de `courses.ts`; `shuffle` de `../lib/deck`.
- Produces:
  - `type ClusterId = 'saber'|'cuidar'|'criar'|'analisar'|'liderar'|'desenvolver'`
  - `type LaneId = 'humanas'|'exatas'|'paciente'|'ciencia'|'arte'|'engenharia'|'comunicar'|'gerir'|'empreender'|'global'|'software'|'sistemas'`
  - `interface Lane { id: LaneId; label: string; emoji: string; courseIds: string[] }`
  - `interface Cluster { id: ClusterId; label: string; tagline: string; emoji: string; accent: string; courseIds: string[]; lanes: [Lane, Lane] }`
  - `CLUSTERS: Record<ClusterId, Cluster>`, `CLUSTER_IDS: ClusterId[]`, `PAIRS_PER_GAME = 6`
  - `getClusterCourses(id: ClusterId): Course[]`
  - `selectGameCourses(cluster: Cluster, laneId: LaneId, shuffleFn?): Course[]` (sempre 6 cursos, priorizando o caminho)

- [ ] **Step 1: Adicionar os 4 cursos novos em `courses.ts`**

No topo, acrescente aos imports do lucide os ícones `Rocket, Sprout, Braces, PencilRuler` (mantenha os demais). Ao final do array `COURSES` (antes do `];`), adicione:

```ts
  // Cursos novos (clusterização por propósito)
  { id: 'eng-software', label: 'Engenharia de Software', schoolId: 'politecnica', Icon: Braces },
  { id: 'design-engineering', label: 'Design Engineering', schoolId: 'politecnica', Icon: PencilRuler },
  { id: 'agrotecnologia', label: 'Agrotecnologia', schoolId: 'politecnica', Icon: Sprout },
  { id: 'gil', label: 'Gestão para Inovação e Liderança', schoolId: 'gestao', Icon: Rocket },
```

- [ ] **Step 2: Atualizar contagens em `courses.test.ts`**

Troque a contagem total e as duas contagens afetadas:

```ts
  it('tem 58 cursos (catálogo estendido)', () => {
    expect(COURSES).toHaveLength(58);
  });
```
```ts
    expect(count('politecnica')).toBe(21);
    expect(count('gestao')).toBe(12);
```
(As outras contagens — artes 15, saude 8, direito 1, direito-ri 1 — permanecem.)

- [ ] **Step 3: Rodar `courses.test.ts` (deve passar)**

Run: `npm test -- app/data/courses.test.ts`
Expected: PASS.

- [ ] **Step 4: Criar `app/data/clusters.ts`**

```ts
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
```

- [ ] **Step 5: Criar `app/data/clusters.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { CLUSTERS, CLUSTER_IDS, getClusterCourses, selectGameCourses, PAIRS_PER_GAME } from './clusters';
import { COURSES } from './courses';

const identity = <T,>(a: T[]): T[] => a;

describe('CLUSTERS', () => {
  it('tem os 6 clusters', () => {
    expect(Object.keys(CLUSTERS).sort()).toEqual([...CLUSTER_IDS].sort());
  });
  it('PAIRS_PER_GAME é 6', () => {
    expect(PAIRS_PER_GAME).toBe(6);
  });
  it('cada cluster tem label, tagline, emoji, accent sem vermelho e 2 caminhos', () => {
    for (const id of CLUSTER_IDS) {
      const c = CLUSTERS[id];
      expect(c.label).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.accent).toMatch(/from-/);
      expect(c.accent).not.toMatch(/red|rose|unisinos/);
      expect(c.lanes).toHaveLength(2);
    }
  });
  it('todo courseId de cluster e de caminho existe em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const id of CLUSTER_IDS) {
      for (const cid of CLUSTERS[id].courseIds) {
        expect(valid.has(cid), `curso inexistente "${cid}" no cluster "${id}"`).toBe(true);
      }
      for (const lane of CLUSTERS[id].lanes) {
        expect(lane.courseIds.length).toBeGreaterThan(0);
        for (const cid of lane.courseIds) {
          expect(valid.has(cid), `curso inexistente "${cid}" no caminho "${lane.id}"`).toBe(true);
        }
      }
    }
  });
  it('a união dos 2 caminhos é igual ao courseIds do cluster', () => {
    for (const id of CLUSTER_IDS) {
      const c = CLUSTERS[id];
      const union = [...c.lanes[0].courseIds, ...c.lanes[1].courseIds].sort();
      expect(union).toEqual([...c.courseIds].sort());
    }
  });
  it('cada cluster tem ao menos 6 cursos', () => {
    for (const id of CLUSTER_IDS) {
      expect(getClusterCourses(id).length).toBe(CLUSTERS[id].courseIds.length);
      expect(getClusterCourses(id).length).toBeGreaterThanOrEqual(PAIRS_PER_GAME);
    }
  });
});

describe('selectGameCourses', () => {
  it('devolve exatamente 6 cursos para qualquer caminho', () => {
    for (const id of CLUSTER_IDS) {
      for (const lane of CLUSTERS[id].lanes) {
        expect(selectGameCourses(CLUSTERS[id], lane.id, identity)).toHaveLength(PAIRS_PER_GAME);
      }
    }
  });
  it('prioriza os cursos do caminho quando o caminho tem >= 6', () => {
    const eng = CLUSTERS.criar.lanes.find((l) => l.id === 'engenharia')!;
    const selected = selectGameCourses(CLUSTERS.criar, 'engenharia', identity).map((c) => c.id);
    for (const cid of selected) {
      expect(eng.courseIds).toContain(cid);
    }
  });
  it('completa com o resto do cluster quando o caminho tem < 6', () => {
    const selected = selectGameCourses(CLUSTERS.saber, 'exatas', identity).map((c) => c.id);
    expect(selected).toHaveLength(6);
    expect(selected).toContain('matematica');
    expect(selected).toContain('biologia');
  });
  it('todos os ids retornados existem em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const c of selectGameCourses(CLUSTERS.desenvolver, 'software', identity)) {
      expect(valid.has(c.id)).toBe(true);
    }
  });
});
```

- [ ] **Step 6: Rodar os testes de dados**

Run: `npm test -- app/data/clusters.test.ts app/data/courses.test.ts`
Expected: PASS.

- [ ] **Step 7: Rodar a suíte completa (deve seguir verde)**

Run: `npm test`
Expected: PASS (a camada antiga `areas.ts` continua intacta).

- [ ] **Step 8: Commit**

```bash
git add app/data/courses.ts app/data/courses.test.ts app/data/clusters.ts app/data/clusters.test.ts
git commit -m "feat: add clusters data layer + 4 new courses

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Recordes por cluster (`storage.ts`)

**Files:**
- Modify: `app/lib/storage.ts`
- Test: `app/lib/storage.test.ts`

**Interfaces:**
- Consumes: `ClusterId` de `../data/clusters`.
- Produces (assinaturas iguais, agora keyed por `ClusterId`): `BestScore`, `Records = Record<ClusterId, BestScore>`, `emptyRecords()`, `mergeBest(prev, {moves,time})`, `loadRecords()`, `saveResult(clusterId: ClusterId, {moves,time})`. Nova chave localStorage `unisinos-memoria-records-clusters`.

- [ ] **Step 1: Reescrever `app/lib/storage.ts`**

```ts
import type { ClusterId } from '../data/clusters';

export interface BestScore {
  bestMoves: number | null;
  bestTime: number | null;
}
export type Records = Record<ClusterId, BestScore>;

const KEY = 'unisinos-memoria-records-clusters';
const CLUSTER_IDS: ClusterId[] = ['saber', 'cuidar', 'criar', 'analisar', 'liderar', 'desenvolver'];

export function emptyRecords(): Records {
  return CLUSTER_IDS.reduce((acc, id) => {
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
    const parsed = JSON.parse(raw) as Partial<Record<ClusterId, Partial<BestScore>>>;
    const base = emptyRecords();
    for (const id of CLUSTER_IDS) {
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

export function saveResult(clusterId: ClusterId, result: { moves: number; time: number }): Records {
  const records = loadRecords();
  const next: Records = { ...records, [clusterId]: mergeBest(records[clusterId], result) };
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

- [ ] **Step 2: Reescrever `app/lib/storage.test.ts`**

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

describe('persistência por cluster', () => {
  beforeEach(() => window.localStorage.clear());

  it('emptyRecords tem os 6 clusters nulos', () => {
    const r = emptyRecords();
    expect(Object.keys(r).sort()).toEqual(['analisar', 'criar', 'cuidar', 'desenvolver', 'liderar', 'saber']);
    expect(r.criar).toEqual({ bestMoves: null, bestTime: null });
  });
  it('saveResult grava e loadRecords lê o melhor por cluster', () => {
    saveResult('criar', { moves: 10, time: 40 });
    saveResult('criar', { moves: 8, time: 55 });
    expect(loadRecords().criar).toEqual({ bestMoves: 8, bestTime: 40 });
  });
  it('tolera JSON parcial corrompido (sem NaN)', () => {
    window.localStorage.setItem('unisinos-memoria-records-clusters', JSON.stringify({ cuidar: { bestMoves: 5 } }));
    expect(loadRecords().cuidar).toEqual({ bestMoves: 5, bestTime: null });
  });
});
```

- [ ] **Step 3: Rodar o teste de storage**

Run: `npm test -- app/lib/storage.test.ts`
Expected: PASS.

- [ ] **Step 4: Rodar a suíte completa (runtime deve seguir verde)**

Run: `npm test`
Expected: PASS. (Observação: o `useMemoryGame` antigo ainda passa `area.id` a `saveResult` — o `tsc` ficaria vermelho agora, mas **não rode build**; em runtime tudo passa porque os testes do hook não chegam à vitória.)

- [ ] **Step 5: Commit**

```bash
git add app/lib/storage.ts app/lib/storage.test.ts
git commit -m "refactor: records keyed by cluster (nova chave localStorage)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Migrar hook + componentes + fluxo para clusters

Migração coordenada (o `GameFlow.test` exercita quiz→reveal→jogo, então quiz, reveal, tabuleiro e hook precisam virar clusters juntos). Cada arquivo abaixo é uma substituição completa. `AreaReveal` é substituído por `ClusterReveal`.

**Files:**
- Modify: `app/hooks/useMemoryGame.ts` + `app/hooks/useMemoryGame.test.ts`
- Modify: `app/components/Card.tsx` + `app/components/Card.test.tsx`
- Modify: `app/components/Board.tsx`
- Modify: `app/components/VictoryModal.tsx` + `app/components/VictoryModal.test.tsx`
- Modify: `app/components/GameBoard.tsx`
- Modify: `app/data/quiz.ts` + `app/data/quiz.test.ts`
- Modify: `app/components/Quiz.tsx` + `app/components/Quiz.test.tsx`
- Create: `app/components/ClusterReveal.tsx` + `app/components/ClusterReveal.test.tsx`
- Delete: `app/components/AreaReveal.tsx` + `app/components/AreaReveal.test.tsx`
- Modify: `app/components/GameFlow.tsx` + `app/components/GameFlow.test.tsx`

**Interfaces:**
- Consumes: `CLUSTERS`, `CLUSTER_IDS`, `selectGameCourses`, `PAIRS_PER_GAME`, `Cluster`, `ClusterId`, `LaneId` de `../data/clusters`; `Course` de `../data/courses`; `saveResult/loadRecords/Records` de `../lib/storage`.
- Produces:
  - `useMemoryGame(cluster: Cluster, laneId: LaneId)` → `{ state, time, records, flip, restart }`
  - `quiz.ts`: `QUESTION_1: Question<ClusterId>` (uma opção por cluster, com `sublabel`), `getQuestion2(clusterId): Question<LaneId>`, `QuizOption<T>`, `Question<T>`
  - `Card` props `{ id, course, gradient, isFlipped, isMatched, locked, onFlip }`; `Board` props `{ cards, gradient, locked, onFlip }`
  - `VictoryModal` props `{ moves, time, stars, courses: Course[], onRestart, onRestartQuiz }`
  - `GameBoard` props `{ cluster: Cluster, laneId: LaneId, onRestartQuiz }`
  - `ClusterReveal` props `{ cluster: Cluster, laneId: LaneId, onStart }`
  - `Quiz` prop `onComplete: (clusterId: ClusterId, laneId: LaneId) => void`

- [ ] **Step 1: Reescrever `app/hooks/useMemoryGame.ts`**

```ts
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { gameReducer, initialState, type GameState } from '../lib/gameReducer';
import { buildDeck } from '../lib/deck';
import { selectGameCourses, PAIRS_PER_GAME, type Cluster, type LaneId } from '../data/clusters';
import { saveResult, loadRecords, type Records } from '../lib/storage';

const PEEK_MS = 2500;
const MATCH_MS = 500;
const MISMATCH_MS = 1000;

export function useMemoryGame(cluster: Cluster, laneId: LaneId): {
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

  const newGame = useCallback((c: Cluster, lane: LaneId) => {
    savedRef.current = false;
    setTime(0);
    dispatch({
      type: 'NEW_GAME',
      cards: buildDeck(PAIRS_PER_GAME, selectGameCourses(c, lane)),
      totalPairs: PAIRS_PER_GAME,
    });
  }, []);

  // (re)inicia ao trocar cluster/caminho e na montagem
  useEffect(() => {
    newGame(cluster, laneId);
  }, [cluster, laneId, newGame]);

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

  // persiste recorde do cluster ao vencer (uma vez)
  useEffect(() => {
    if (state.phase === 'won' && !savedRef.current) {
      savedRef.current = true;
      setRecords(saveResult(cluster.id, { moves: state.moves, time }));
    }
  }, [state.phase, cluster.id, state.moves, time]);

  const flip = useCallback((id: number) => dispatch({ type: 'FLIP', id }), []);
  const restart = useCallback(() => newGame(cluster, laneId), [newGame, cluster, laneId]);

  return { state, time, records, flip, restart };
}
```

- [ ] **Step 2: Reescrever `app/hooks/useMemoryGame.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMemoryGame } from './useMemoryGame';
import { CLUSTERS } from '../data/clusters';

describe('useMemoryGame', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('inicia em peek com 12 cartas (6 pares) e vai para playing', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.criar, 'engenharia'));
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current.state.cards).toHaveLength(12);
    expect(result.current.state.phase).toBe('peek');
    act(() => { vi.advanceTimersByTime(2500); });
    expect(result.current.state.phase).toBe('playing');
  });

  it('flip é ignorado durante a espiada', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.cuidar, 'paciente'));
    act(() => { vi.advanceTimersByTime(0); });
    act(() => { result.current.flip(0); });
    expect(result.current.state.flipped).toEqual([]);
  });

  it('cronômetro continua contando na transição playing → checking', () => {
    const { result } = renderHook(() => useMemoryGame(CLUSTERS.analisar, 'gerir'));
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

- [ ] **Step 3: Reescrever `app/components/Card.tsx`** (remove Escola; recebe `gradient`)

```tsx
'use client';

import type { Course } from '../data/courses';

interface CardProps {
  id: number;
  course: Course;
  gradient: string;
  isFlipped: boolean;
  isMatched: boolean;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Card({ id, course, gradient, isFlipped, isMatched, locked, onFlip }: CardProps) {
  const { Icon, label } = course;
  const faceUp = isFlipped || isMatched;
  const ariaLabel = faceUp ? label : 'Carta fechada';

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

        {/* Verso (curso) — cor do cluster */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex flex-col items-center justify-center gap-1 p-1.5 shadow-md text-white ring-1 transition ${
            isMatched
              ? 'ring-2 ring-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-600'
              : `ring-white/20 bg-gradient-to-br ${gradient}`
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

- [ ] **Step 4: Reescrever `app/components/Card.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';
import { COURSES } from '../data/courses';

const medicina = COURSES.find((c) => c.id === 'medicina')!;
const grad = 'from-emerald-500 to-emerald-700';

describe('Card', () => {
  it('mostra o nome do curso e usa o nome no aria-label quando virada', () => {
    render(<Card id={0} course={medicina} gradient={grad} isFlipped isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medicina' })).toBeInTheDocument();
  });

  it('carta fechada tem aria-label "Carta fechada"', () => {
    render(<Card id={0} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByRole('button', { name: 'Carta fechada' })).toBeInTheDocument();
  });

  it('clique em carta fechada chama onFlip', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).toHaveBeenCalledWith(3);
  });

  it('não chama onFlip quando travada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('não chama onFlip quando já virada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 5: Reescrever `app/components/Board.tsx`** (repassa `gradient`)

```tsx
'use client';

import Card from './Card';
import type { BoardCard } from '../lib/gameReducer';

interface Props {
  cards: BoardCard[];
  gradient: string;
  locked: boolean;
  onFlip: (id: number) => void;
}

export default function Board({ cards, gradient, locked, onFlip }: Props) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full">
      {cards.map((c) => (
        <Card
          key={c.id}
          id={c.id}
          course={c.course}
          gradient={gradient}
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

- [ ] **Step 6: Reescrever `app/components/VictoryModal.tsx`** (mostra os cursos, não as Escolas)

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { Trophy, Star } from 'lucide-react';
import type { Course } from '../data/courses';
import { formatTime } from '../lib/format';

interface Props {
  moves: number;
  time: number;
  stars: 1 | 2 | 3;
  courses: Course[];
  onRestart: () => void;
  onRestartQuiz: () => void;
}

export default function VictoryModal({ moves, time, stars, courses, onRestart, onRestartQuiz }: Props) {
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
        <p className="mt-4 mb-2 text-sm font-semibold text-neutral-500">Cursos que você encontrou</p>
        <div className="flex flex-wrap justify-center gap-1.5 mb-4">
          {courses.map((c) => {
            const Icon = c.Icon;
            return (
              <span
                key={c.id}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-full"
              >
                <Icon className="w-3.5 h-3.5" aria-hidden />
                {c.label}
              </span>
            );
          })}
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

- [ ] **Step 7: Reescrever `app/components/VictoryModal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { COURSES } from '../data/courses';

const medicina = COURSES.find((c) => c.id === 'medicina')!;
const enfermagem = COURSES.find((c) => c.id === 'enfermagem')!;

const base = {
  moves: 9,
  time: 75,
  stars: 3 as const,
  courses: [medicina, enfermagem],
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
  it('lista os cursos encontrados', () => {
    render(<VictoryModal {...base} />);
    expect(screen.getByText('Cursos que você encontrou')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Enfermagem')).toBeInTheDocument();
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

- [ ] **Step 8: Reescrever `app/components/GameBoard.tsx`** (cor do cluster; cursos na vitória; mantém wrapper `inert`)

```tsx
'use client';

import { RotateCcw } from 'lucide-react';
import Scoreboard from './Scoreboard';
import Board from './Board';
import VictoryModal from './VictoryModal';
import { useMemoryGame } from '../hooks/useMemoryGame';
import { PAIRS_PER_GAME, type Cluster, type LaneId } from '../data/clusters';
import { calcStars } from '../lib/scoring';
import type { Course } from '../data/courses';

interface Props {
  cluster: Cluster;
  laneId: LaneId;
  onRestartQuiz: () => void;
}

export default function GameBoard({ cluster, laneId, onRestartQuiz }: Props) {
  const { state, time, records, flip, restart } = useMemoryGame(cluster, laneId);

  const locked = state.phase !== 'playing';
  const best = records ? records[cluster.id] : null;
  const won = state.phase === 'won';
  const stars = calcStars(state.moves, PAIRS_PER_GAME);
  const coursesInGame: Course[] = won
    ? Array.from(new Map(state.cards.map((c) => [c.course.id, c.course])).values())
    : [];

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">
      <div className="contents" inert={won || undefined}>
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-500">
          <span className="text-lg" aria-hidden>{cluster.emoji}</span>
          {cluster.label}
        </div>

        <Scoreboard
          moves={state.moves}
          matches={state.matches}
          totalPairs={PAIRS_PER_GAME}
          time={time}
          best={best}
        />

        {state.cards.length > 0 ? (
          <Board cards={state.cards} gradient={cluster.accent} locked={locked} onFlip={flip} />
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
      </div>

      {won && (
        <VictoryModal
          moves={state.moves}
          time={time}
          stars={stars}
          courses={coursesInGame}
          onRestart={restart}
          onRestartQuiz={onRestartQuiz}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 9: Reescrever `app/data/quiz.ts`** (P1 = clusters; P2 = caminhos)

```ts
import { CLUSTERS, CLUSTER_IDS, type ClusterId, type LaneId } from './clusters';

export interface QuizOption<T> {
  id: T;
  label: string;
  emoji: string;
  sublabel?: string;
}
export interface Question<T> {
  prompt: string;
  options: QuizOption<T>[];
}

export const QUESTION_1: Question<ClusterId> = {
  prompt: 'Qual desses combina mais com você?',
  options: CLUSTER_IDS.map((id) => ({
    id,
    label: CLUSTERS[id].label,
    emoji: CLUSTERS[id].emoji,
    sublabel: CLUSTERS[id].tagline,
  })),
};

export function getQuestion2(clusterId: ClusterId): Question<LaneId> {
  const cluster = CLUSTERS[clusterId];
  return {
    prompt: `Dentro de "${cluster.label}", você é mais...`,
    options: cluster.lanes.map((l) => ({ id: l.id, label: l.label, emoji: l.emoji })),
  };
}
```

- [ ] **Step 10: Reescrever `app/data/quiz.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { QUESTION_1, getQuestion2 } from './quiz';
import { CLUSTER_IDS, CLUSTERS } from './clusters';

describe('QUESTION_1', () => {
  it('tem uma opção por cluster, com label/emoji/sublabel', () => {
    expect(QUESTION_1.options).toHaveLength(CLUSTER_IDS.length);
    for (const o of QUESTION_1.options) {
      expect(o.label).toBeTruthy();
      expect(o.emoji).toBeTruthy();
      expect(o.sublabel).toBeTruthy();
      expect(CLUSTER_IDS).toContain(o.id);
    }
  });
});

describe('getQuestion2', () => {
  it('devolve os 2 caminhos do cluster escolhido', () => {
    for (const id of CLUSTER_IDS) {
      const q = getQuestion2(id);
      expect(q.options.map((o) => o.id)).toEqual(CLUSTERS[id].lanes.map((l) => l.id));
      for (const o of q.options) {
        expect(o.label).toBeTruthy();
        expect(o.emoji).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 11: Reescrever `app/components/Quiz.tsx`** (P1 cluster → P2 caminho)

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { QUESTION_1, getQuestion2 } from '../data/quiz';
import type { ClusterId, LaneId } from '../data/clusters';

interface Props {
  onComplete: (clusterId: ClusterId, laneId: LaneId) => void;
}

export default function Quiz({ onComplete }: Props) {
  const [clusterId, setClusterId] = useState<ClusterId | null>(null);
  const step = clusterId === null ? 1 : 2;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const q2 = clusterId ? getQuestion2(clusterId) : null;

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-5">
      <div className="text-xs font-bold uppercase tracking-wide text-unisinos">Pergunta {step} de 2</div>

      {step === 1 ? (
        <>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-extrabold text-neutral-900 text-center focus:outline-none"
          >
            {QUESTION_1.prompt}
          </h2>
          <div className="flex flex-col gap-3 w-full">
            {QUESTION_1.options.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setClusterId(o.id)}
                className="flex items-start gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
              >
                <span className="text-2xl leading-none" aria-hidden>{o.emoji}</span>
                <span className="flex flex-col">
                  <span>{o.label}</span>
                  {o.sublabel && <span className="text-xs font-normal text-neutral-500">{o.sublabel}</span>}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        q2 && (
          <>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-2xl font-extrabold text-neutral-900 text-center focus:outline-none"
            >
              {q2.prompt}
            </h2>
            <div className="flex flex-col gap-3 w-full">
              {q2.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onComplete(clusterId as ClusterId, o.id)}
                  className="flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl bg-white ring-1 ring-neutral-200 hover:ring-unisinos hover:bg-neutral-50 font-semibold text-neutral-800 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-unisinos/40"
                >
                  <span className="text-2xl" aria-hidden>{o.emoji}</span>
                  <span>{o.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setClusterId(null)}
              className="flex items-center gap-1 text-sm font-semibold text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden />
              Voltar
            </button>
          </>
        )
      )}
    </div>
  );
}
```

- [ ] **Step 12: Reescrever `app/components/Quiz.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';

describe('Quiz', () => {
  it('mostra a P1 (clusters), depois a P2 do cluster, e chama onComplete', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Criar, projetar e manusear/ }));

    expect(screen.getByText('Dentro de "Criar, projetar e manusear", você é mais...')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Engenharia e construção/ }));

    expect(onComplete).toHaveBeenCalledWith('criar', 'engenharia');
  });

  it('permite voltar da P2 para a P1', async () => {
    render(<Quiz onComplete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /Cuidar, nutrir e pesquisar/ }));
    expect(screen.getByText(/Dentro de "Cuidar/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
  });
});
```

- [ ] **Step 13: Criar `app/components/ClusterReveal.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type { Cluster, LaneId } from '../data/clusters';

interface Props {
  cluster: Cluster;
  laneId: LaneId;
  onStart: () => void;
}

export default function ClusterReveal({ cluster, laneId, onStart }: Props) {
  const lane = cluster.lanes.find((l) => l.id === laneId);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4 text-center">
      <div className="text-6xl" aria-hidden>{cluster.emoji}</div>
      <p className="text-neutral-500 font-semibold">Você tem tudo a ver com</p>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-br ${cluster.accent} bg-clip-text text-transparent focus:outline-none`}
      >
        {cluster.label}
      </h2>
      {lane && (
        <p className="text-neutral-600">
          E, dentro dele, com o lado <strong>{lane.label}</strong>.
        </p>
      )}
      <p className="text-neutral-600">Bora achar os pares desses cursos?</p>
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

- [ ] **Step 14: Criar `app/components/ClusterReveal.test.tsx`**

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterReveal from './ClusterReveal';
import { CLUSTERS } from '../data/clusters';

describe('ClusterReveal', () => {
  it('mostra o cluster e o caminho escolhido', () => {
    render(<ClusterReveal cluster={CLUSTERS.criar} laneId="engenharia" onStart={() => {}} />);
    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    expect(screen.getByText(/Engenharia e construção/)).toBeInTheDocument();
  });
  it('chama onStart no botão "Começar a jogar"', async () => {
    const onStart = vi.fn();
    render(<ClusterReveal cluster={CLUSTERS.cuidar} laneId="paciente" onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));
    expect(onStart).toHaveBeenCalled();
  });
});
```

- [ ] **Step 15: Apagar `AreaReveal`**

```bash
git rm app/components/AreaReveal.tsx app/components/AreaReveal.test.tsx
```

- [ ] **Step 16: Reescrever `app/components/GameFlow.tsx`**

```tsx
'use client';

import { useState } from 'react';
import Header from './Header';
import Quiz from './Quiz';
import ClusterReveal from './ClusterReveal';
import GameBoard from './GameBoard';
import { CLUSTERS, type ClusterId, type LaneId } from '../data/clusters';

type Phase = 'quiz' | 'reveal' | 'game';

export default function GameFlow() {
  const [phase, setPhase] = useState<Phase>('quiz');
  const [answers, setAnswers] = useState<{ clusterId: ClusterId; laneId: LaneId } | null>(null);

  const cluster = answers ? CLUSTERS[answers.clusterId] : null;

  const restartQuiz = () => {
    setAnswers(null);
    setPhase('quiz');
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4 py-8">
      <Header />

      {phase === 'quiz' && (
        <Quiz
          onComplete={(clusterId, laneId) => {
            setAnswers({ clusterId, laneId });
            setPhase('reveal');
          }}
        />
      )}

      {phase === 'reveal' && cluster && answers && (
        <ClusterReveal cluster={cluster} laneId={answers.laneId} onStart={() => setPhase('game')} />
      )}

      {phase === 'game' && cluster && answers && (
        <GameBoard cluster={cluster} laneId={answers.laneId} onRestartQuiz={restartQuiz} />
      )}
    </div>
  );
}
```

- [ ] **Step 17: Reescrever `app/components/GameFlow.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlow from './GameFlow';

describe('GameFlow', () => {
  it('quiz → reveal → game', async () => {
    render(<GameFlow />);

    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Criar, projetar e manusear/ }));
    await userEvent.click(screen.getByRole('button', { name: /Engenharia e construção/ }));

    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));

    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 18: Rodar a suíte completa (runtime deve ficar verde)**

Run: `npm test`
Expected: PASS. (`areas.ts`/`schools.ts` ainda existem como código morto, testados por `areas.test.ts`/`schools.test.ts` — seguem verdes.)

- [ ] **Step 19: Commit**

```bash
git add app/hooks app/components app/data/quiz.ts app/data/quiz.test.ts
git commit -m "feat: migrate quiz, hook, board and flow to clusters

- P1 escolhe cluster, P2 escolhe 1 de 2 caminhos
- carta colorida pelo cluster ativo; vitória lista os cursos
- AreaReveal -> ClusterReveal

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Limpeza — remover Escola e cursos órfãos

**Files:**
- Modify: `app/data/courses.ts` (remove `schoolId` e os 9 órfãos; catálogo final = 49)
- Modify: `app/data/courses.test.ts`
- Modify: `app/lib/deck.test.ts` (mock sem `schoolId`)
- Delete: `app/data/schools.ts`, `app/data/schools.test.ts`, `app/data/areas.ts`, `app/data/areas.test.ts`

**Interfaces:**
- Produces: `Course = { id: string; label: string; Icon: LucideIcon }` (sem `schoolId`); `COURSES` com 49 itens.

- [ ] **Step 1: Reescrever `app/data/courses.ts`** (final, sem `schoolId`, sem órfãos)

```ts
import {
  Code2, DraftingCompass, Dna, Cpu, Construction, CircuitBoard, Bot, Factory,
  Zap, Wrench, FlaskConical, BrainCircuit, Sigma, ShieldCheck, Braces, PencilRuler,
  Sprout, Palette, PenTool, Lightbulb, ChefHat, ScrollText, Gamepad2, Newspaper,
  BookOpen, Shirt, Backpack, Video, Music, Megaphone, Clapperboard, Briefcase,
  Calculator, TrendingUp, Ship, ShoppingCart, Wallet, Target, Rocket, Microscope,
  Dumbbell, Syringe, Pill, Accessibility, Stethoscope, Salad, Brain, Scale, Earth,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Course {
  id: string;
  label: string;
  Icon: LucideIcon;
}

export const COURSES: Course[] = [
  { id: 'ads', label: 'Análise e Desenvolvimento de Sistemas', Icon: Code2 },
  { id: 'arquitetura', label: 'Arquitetura e Urbanismo', Icon: DraftingCompass },
  { id: 'biologia', label: 'Biologia', Icon: Dna },
  { id: 'computacao', label: 'Ciência da Computação', Icon: Cpu },
  { id: 'eng-civil', label: 'Engenharia Civil', Icon: Construction },
  { id: 'eng-computacao', label: 'Engenharia da Computação', Icon: CircuitBoard },
  { id: 'eng-automacao', label: 'Engenharia de Controle e Automação', Icon: Bot },
  { id: 'eng-producao', label: 'Engenharia de Produção', Icon: Factory },
  { id: 'eng-eletrica', label: 'Engenharia Elétrica', Icon: Zap },
  { id: 'eng-mecanica', label: 'Engenharia Mecânica', Icon: Wrench },
  { id: 'eng-quimica', label: 'Engenharia Química', Icon: FlaskConical },
  { id: 'ia', label: 'Inteligência Artificial', Icon: BrainCircuit },
  { id: 'matematica', label: 'Matemática', Icon: Sigma },
  { id: 'seguranca', label: 'Segurança da Informação', Icon: ShieldCheck },
  { id: 'eng-software', label: 'Engenharia de Software', Icon: Braces },
  { id: 'design-engineering', label: 'Design Engineering', Icon: PencilRuler },
  { id: 'agrotecnologia', label: 'Agrotecnologia', Icon: Sprout },
  { id: 'bihat', label: 'Artes, Humanidades e Tecnologia', Icon: Palette },
  { id: 'design', label: 'Design', Icon: PenTool },
  { id: 'filosofia', label: 'Filosofia', Icon: Lightbulb },
  { id: 'gastronomia', label: 'Gastronomia', Icon: ChefHat },
  { id: 'historia', label: 'História', Icon: ScrollText },
  { id: 'jogos', label: 'Jogos Digitais', Icon: Gamepad2 },
  { id: 'jornalismo', label: 'Jornalismo', Icon: Newspaper },
  { id: 'letras', label: 'Letras', Icon: BookOpen },
  { id: 'moda', label: 'Moda', Icon: Shirt },
  { id: 'pedagogia', label: 'Pedagogia', Icon: Backpack },
  { id: 'prod-audiovisual', label: 'Produção Audiovisual', Icon: Video },
  { id: 'prod-fonografica', label: 'Produção Fonográfica', Icon: Music },
  { id: 'publicidade', label: 'Publicidade e Propaganda', Icon: Megaphone },
  { id: 'realizacao-audiovisual', label: 'Realização Audiovisual', Icon: Clapperboard },
  { id: 'administracao', label: 'Administração', Icon: Briefcase },
  { id: 'contabeis', label: 'Ciências Contábeis', Icon: Calculator },
  { id: 'economicas', label: 'Ciências Econômicas', Icon: TrendingUp },
  { id: 'comercio-exterior', label: 'Comércio Exterior', Icon: Ship },
  { id: 'gestao-comercial', label: 'Gestão Comercial', Icon: ShoppingCart },
  { id: 'gestao-financeira', label: 'Gestão Financeira', Icon: Wallet },
  { id: 'marketing', label: 'Marketing', Icon: Target },
  { id: 'gil', label: 'Gestão para Inovação e Liderança', Icon: Rocket },
  { id: 'biomedicina', label: 'Biomedicina', Icon: Microscope },
  { id: 'ed-fisica', label: 'Educação Física', Icon: Dumbbell },
  { id: 'enfermagem', label: 'Enfermagem', Icon: Syringe },
  { id: 'farmacia', label: 'Farmácia', Icon: Pill },
  { id: 'fisioterapia', label: 'Fisioterapia', Icon: Accessibility },
  { id: 'medicina', label: 'Medicina', Icon: Stethoscope },
  { id: 'nutricao', label: 'Nutrição', Icon: Salad },
  { id: 'psicologia', label: 'Psicologia', Icon: Brain },
  { id: 'direito', label: 'Direito', Icon: Scale },
  { id: 'relacoes-internacionais', label: 'Relações Internacionais', Icon: Earth },
];
```

- [ ] **Step 2: Reescrever `app/data/courses.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { COURSES } from './courses';

const REMOVIDOS = [
  'gestao-producao', 'gestao-ti', 'sistemas-info', 'sistemas-internet',
  'relacoes-publicas', 'rh', 'gestao-publica', 'logistica', 'processos',
];

describe('COURSES', () => {
  it('tem 49 cursos', () => {
    expect(COURSES).toHaveLength(49);
  });
  it('ids são únicos', () => {
    const ids = COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('inclui os 4 cursos novos', () => {
    const ids = new Set(COURSES.map((c) => c.id));
    for (const id of ['gil', 'agrotecnologia', 'eng-software', 'design-engineering']) {
      expect(ids.has(id), `curso novo ausente: ${id}`).toBe(true);
    }
  });
  it('não inclui os cursos órfãos removidos', () => {
    const ids = new Set(COURSES.map((c) => c.id));
    for (const id of REMOVIDOS) {
      expect(ids.has(id), `curso órfão ainda presente: ${id}`).toBe(false);
    }
  });
  it('todo curso tem id, label e ícone', () => {
    for (const c of COURSES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.Icon, `ícone ausente para "${c.id}"`).toBeTruthy();
    }
  });
});
```

- [ ] **Step 3: Ajustar o mock de `app/lib/deck.test.ts`** (remover `schoolId`)

Substitua o array `mock` por:

```ts
const mock: Course[] = [
  { id: 'a', label: 'A', Icon: (() => null) as never },
  { id: 'b', label: 'B', Icon: (() => null) as never },
  { id: 'c', label: 'C', Icon: (() => null) as never },
];
```

- [ ] **Step 4: Apagar as camadas antigas**

```bash
git rm app/data/schools.ts app/data/schools.test.ts app/data/areas.ts app/data/areas.test.ts
```

- [ ] **Step 5: Garantir que nada mais referencia Escola/Área**

Run: `rg -n "schoolId|schools|getSchool|SCHOOLS|/areas|getAreaCourses|resolveArea|AreaId" /Users/leosperandio/Git/EliteFinder/Unisinos-Memoria/app`
Expected: **nenhum** resultado. Se aparecer algo, corrija o arquivo apontado antes de seguir.

- [ ] **Step 6: Rodar a suíte completa**

Run: `npm test`
Expected: PASS (todos os arquivos).

- [ ] **Step 7: Commit**

```bash
git add app/data/courses.ts app/data/courses.test.ts app/lib/deck.test.ts
git commit -m "refactor: remove school layer and 9 orphan courses (catalog = 49)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: CLAUDE.md + integração (build/lint)

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Conferir textos de UI sem "escola"/"área"**

Run: `rg -ni "escola|área de interesse" /Users/leosperandio/Git/EliteFinder/Unisinos-Memoria/app`
Expected: nenhum texto de UI usando "escola"/"área de interesse". (Se `Header.tsx` ou outro tiver, ajuste para linguagem de cluster.)

- [ ] **Step 2: Reescrever `CLAUDE.md`** com o conteúdo abaixo (substitui o arquivo inteiro)

````markdown
# Jogo da Memória — Unisinos Start

## Contexto

Atividade prática do evento **Start da Unisinos**: uma aplicação interativa e
lúdica que envolve o público com o universo acadêmico da universidade.

## Aplicação

Antes de jogar, um **mini teste vocacional** de 2 perguntas define um **cluster**
(a Unisinos organiza a oferta por *clusterização por propósito*). O jogo então
mostra um memória clássico de **6 pares** com cursos daquele cluster — achar pares
do mesmo curso, cada carta pintada pela **cor do cluster**.

Fluxo:
1. **Pergunta 1:** "Qual desses combina mais com você?" → as **6 opções são os
   clusters** (nome + tagline).
2. **Pergunta 2:** "Dentro de [Cluster], você é mais…" → **2 caminhos** do cluster;
   o baralho é puxado do caminho escolhido (afunilamento para os cursos).
3. Tela de **resultado** ("Você tem tudo a ver com [Cluster]! · lado [Caminho]") →
   botão Começar.
4. **Jogo:** espiada inicial ~2,5s, depois vira 2 cartas por vez procurando o par.
5. **Vitória:** estrelas, jogadas, tempo e os **cursos que apareceram**; botões
   **Jogar de novo** (mesmo cluster+caminho) e **Refazer o teste** (volta às perguntas).

## Funcionalidades

- **Mini teste vocacional** (2 perguntas) como porta de entrada.
- **6 clusters** que filtram os cursos (pools em `app/data/clusters.ts`):
  Saber/aprender/ensinar, Cuidar/nutrir/pesquisar, Criar/projetar/manusear,
  Analisar/comunicar/gerir, Liderar/empreender/inovar, Desenvolver/programar/sistematizar.
- **2 caminhos por cluster** (P2) que priorizam um subconjunto dos cursos.
- **6 pares** por partida (sem tiers de dificuldade), sorteados do caminho.
- **Espiada inicial** ~2,5s; **flip 3D** (respeita "reduzir movimento").
- **Placar em tempo real:** jogadas, pares, cronômetro.
- **Recordes persistentes por cluster** (localStorage): melhor nº de jogadas e menor tempo.
- **Estrelas (1–3)** por eficiência na tela de vitória.
- **Acessibilidade:** cartas e opções são botões (teclado + aria), modal com foco/Escape
  e fundo `inert`, região `aria-live`, layout responsivo.

## Cursos e clusters

Fonte: clusterização oficial da Unisinos ("Os cursos em cada cluster"). Curadoria:
catálogo de **49 cursos** (`app/data/courses.ts`), sem camada de Escola — a cor vem
do cluster. Um curso pode aparecer em dois clusters (ex.: Administração e Comércio
Exterior também compõem "Liderar" para fechar 6 pares).

| Cluster | id | Cor | Nº cursos | Caminhos (P2) |
|---|---|---|---|---|
| Saber, aprender e ensinar | `saber` | Índigo | 6 | Gente/ideias/palavras · Lógica/natureza |
| Cuidar, nutrir e pesquisar | `cuidar` | Esmeralda | 9 | Perto do paciente · Nutrição/ciência/lab |
| Criar, projetar e manusear | `criar` | Fúcsia/Violeta | 13 | Arte/mídia/design · Engenharia/construção |
| Analisar, comunicar e gerir | `analisar` | Azul | 9 | Comunicar/influenciar · Números/gerir |
| Liderar, empreender e inovar | `liderar` | Âmbar | 6 | Empreender/inovar · Direito/global |
| Desenvolver, programar e sistematizar | `desenvolver` | Ciano/Teal | 8 | Apps/jogos/IA · Sistemas/dados/segurança |

O vermelho carmim (`#C8102E`) é reservado à **marca Unisinos** (header, botões,
carta fechada) — nenhum cluster usa vermelho.

## Identidade visual

- Fundo claro institucional (`--color-surface`), acento **carmim `#C8102E`**.
- Header textual "**UNISINOS** · Start" (placeholder do logo oficial — trocar
  quando o arquivo estiver disponível).
- Cartas: frente carmim com "?"; verso com gradiente do cluster + ícone + nome.

## Tecnologias

Next.js 16, React 19, Tailwind CSS 4, lucide-react. Testes com Vitest +
@testing-library/react.

## Arquitetura

- `app/data/courses.ts` — os 49 cursos (`id`, `label`, `Icon`).
- `app/data/clusters.ts` — os 6 clusters (label, tagline, emoji, cor, `courseIds`,
  2 `lanes`) + `PAIRS_PER_GAME`, `getClusterCourses`, `selectGameCourses`.
- `app/data/quiz.ts` — `QUESTION_1` (escolhe o cluster) e `getQuestion2(clusterId)`
  (os 2 caminhos).
- `app/lib/deck.ts` — embaralhamento e montagem do baralho.
- `app/lib/gameReducer.ts` — **reducer puro** com a máquina de estados
  (peek → playing → checking → won). Testável sem React.
- `app/hooks/useMemoryGame.ts` — recebe **cluster + caminho** (6 pares) e orquestra
  reducer + timers (espiada, resolução, cronômetro) + recordes por cluster.
- `app/lib/scoring.ts` (estrelas), `app/lib/storage.ts` — recordes por `ClusterId`
  (chave `unisinos-memoria-records-clusters`, localStorage, SSR-safe),
  `app/lib/format.ts` (mm:ss).
- `app/components/` — `Quiz.tsx` (P1 cluster → P2 caminho), `ClusterReveal.tsx`
  (resultado), `GameFlow.tsx` (fluxo `quiz → reveal → game`), `Header`, `Scoreboard`,
  `Board`, `Card`, `VictoryModal`; `GameBoard` compõe o jogo.

## Comandos

- `npm run dev` — servidor de desenvolvimento.
- `npm test` — suíte de testes (Vitest).
- `npm run build` — build de produção (checa tipos e lint).

## Convenções

- Textos de UI em **PT-BR com acentuação correta**.
- Somente imports relativos no código (sem alias `@/`) para o Vitest resolver
  sem configuração extra.
- Lógica de jogo nova entra no reducer/dados (com teste) antes da UI.
- "Escola"/"área de interesse" não são usados — o vocabulário é **cluster**.
````

- [ ] **Step 3: Rodar a suíte completa**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Rodar o build (checa tipos e lint)**

Run: `npm run build`
Expected: build de produção **sem erros** de tipo/lint.

- [ ] **Step 5: Lint explícito**

Run: `npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for cluster-based game

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review (autor do plano)

**Cobertura do spec:**
- Terminologia escola/área → cluster: Task 3 (código/UI) + Task 4 (remoção da camada) + Task 5 (CLAUDE.md, grep de UI). ✓
- 6 clusters oficiais + taglines + cores: Task 1 (`clusters.ts`). ✓
- P1 = clusters; P2 = 2 caminhos por cluster: Task 3 (`quiz.ts`, `Quiz.tsx`). ✓
- Baralho puxado do caminho (`selectGameCourses`): Task 1 + Task 3 (hook). ✓
- Catálogo 49 (−9 órfãos, +4 novos): Task 1 (+4) e Task 4 (−9, −schoolId). ✓
- Liderar completado com afins (Administração, Comércio Exterior): `clusters.ts` (Task 1). ✓
- Cor da carta pelo cluster: Task 3 (`Card`/`Board`/`GameBoard`). ✓
- Vitória mostra cursos, não Escolas: Task 3 (`VictoryModal`/`GameBoard`). ✓
- Recordes por `ClusterId`, nova chave: Task 2. ✓
- CRAV = `realizacao-audiovisual`: presente no pool `criar`/`arte`. ✓

**Placeholders:** nenhum "TBD"/"TODO"; todos os arquivos têm código completo. ✓

**Consistência de tipos/nomes:** `useMemoryGame(cluster, laneId)`, `selectGameCourses(cluster, laneId)`, `Card`/`Board` com `gradient`, `VictoryModal` com `courses`, `GameBoard`/`ClusterReveal` com `{cluster, laneId}`, `Quiz.onComplete(clusterId, laneId)`, storage por `ClusterId` — coerentes entre Tasks 1–4. ✓

**Ordem/verde:** Task 1 (aditiva) e Task 2 mantêm `npm test` verde; `tsc` pode ficar vermelho entre Task 2 e Task 3 (documentado); Task 3 restaura consistência de tipos; Task 4 remove camada morta; Task 5 valida `build`/`lint`. ✓
