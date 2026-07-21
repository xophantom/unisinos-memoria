# Mini Teste Vocacional antes do Jogo — Unisinos Start

**Data:** 2026-07-20
**Status:** Aprovado (design) — pendente escrita do plano de implementação
**Depende de:** redesign já mergeado na `main` (schools, courses, reducer, hook, componentes).

## Objetivo

Adicionar um **mini teste vocacional** (2 perguntas rápidas) como porta de entrada do jogo. As respostas escolhem uma **área**, e o jogo passa a exibir sempre **6 pares temáticos** dos cursos dessa área — dando a sensação de um teste vocacional lúdico (<20s) antes da brincadeira.

## Decisões de design (fixadas no brainstorming)

| Tema | Decisão |
|---|---|
| Fluxo | Teste é a **porta de entrada**: 2 perguntas → reveal da área → jogo de **6 pares** daquela área. A seleção de dificuldade (6/10/16) **sai**. |
| Combinação das respostas | **P1 dá a área ampla; P2 refina** (decisiva no caso fuzzy "Ciências", confirma nas demais). |
| Mapeamento | **5 áreas**; Direito+RI ficam dentro de "Negócios"; "Ciências" é um pool **cross-escola** curado. |
| Pós-vitória | "Jogar de novo" (mesma área, reembaralha) ou "Refazer o teste" (volta às perguntas). |
| Recordes | Passam a ser **por área** (melhor jogadas/tempo por área) no localStorage. |

## Fluxo

```
Abrir → P1 → P2 → Reveal "Você combina com [Área]!" → Jogo (6 pares da área)
                                                            ↓ vitória
                                   [ Jogar de novo (mesma área) ]   [ Refazer o teste ]
```

Máquina de estados de fluxo (no topo): `quiz → reveal → game` (+ `game → quiz` via "Refazer o teste").

## As duas perguntas

**P1 — "O que mais desperta sua curiosidade?"** (`id: q1`)
- 💻 Computadores, tecnologia e inovação — `tech`
- ❤️ Saúde e bem-estar — `saude`
- 📈 Empresas, dinheiro e liderança — `empresas`
- 🎭 Pessoas, comunicação e criatividade — `pessoas`
- 🌎 Natureza, ciência e sustentabilidade — `natureza`

**P2 — "Qual atividade parece mais legal?"** (`id: q2`)
- 🔧 Construir apps, máquinas ou sistemas — `construir`
- 🩺 Atender e cuidar de pessoas — `cuidar`
- 🚀 Criar um negócio ou liderar uma equipe — `liderar`
- 🎬 Produzir conteúdo, arte ou projetos — `produzir`
- 🔬 Fazer pesquisas e descobrir coisas novas — `pesquisar`

## Resolução `resolveArea(p1, p2) → AreaId`

```
se p1 === 'natureza':
    se p2 === 'construir' → 'tecnologia'
    se p2 === 'cuidar'    → 'saude'
    senão (pesquisar | liderar | produzir) → 'ciencias'
senão:
    'tech'     → 'tecnologia'
    'saude'    → 'saude'
    'empresas' → 'negocios'
    'pessoas'  → 'artes'
```

Determinístico. A tela de reveal usa **as duas respostas** no texto (ex.: "Curiosidade em tecnologia + gosta de construir → **Escola Politécnica**"), então P2 sempre aparece ao jogador mesmo quando só confirma.

## As 5 áreas e seus pools (por `id` de curso)

Cada área tem `id`, `label`, `emoji`, `accent` (cor de destaque no reveal) e `courseIds`. Pools podem compartilhar cursos entre áreas (sem conflito). Todos têm ≥ 6 cursos (para 6 pares).

- **`tecnologia`** — "Tecnologia e Engenharia" — 💻 — accent azul (Politécnica)
  `ads, computacao, ia, sistemas-info, sistemas-internet, seguranca, gestao-ti, eng-computacao, eng-automacao, eng-civil, eng-eletrica, eng-mecanica, eng-producao, arquitetura, gestao-producao` *(15)*
- **`saude`** — "Saúde e Bem-estar" — ❤️ — accent esmeralda (Saúde)
  `medicina, psicologia, enfermagem, fisioterapia, nutricao, farmacia, biomedicina, ed-fisica` *(8)*
- **`negocios`** — "Negócios, Gestão e Direito" — 📈 — accent âmbar
  `administracao, marketing, processos, gestao-financeira, gestao-comercial, rh, gestao-publica, logistica, contabeis, comercio-exterior, economicas, direito, relacoes-internacionais` *(13)*
- **`artes`** — "Comunicação, Artes e Humanidades" — 🎭 — accent fúcsia/violeta
  `design, jornalismo, publicidade, jogos, gastronomia, moda, prod-audiovisual, realizacao-audiovisual, prod-fonografica, relacoes-publicas, letras, historia, filosofia, pedagogia, bihat` *(15)*
- **`ciencias`** — "Ciências e Meio Ambiente" — 🌎 — accent teal (cross-escola)
  `biologia, matematica, eng-quimica, biomedicina, farmacia, nutricao, eng-civil` *(7)*

Observações:
- `biologia`, `matematica`, `eng-quimica` saem de "tecnologia" e vão para "ciencias" (por isso não aparecem no pool `tecnologia`).
- `biomedicina`, `farmacia`, `nutricao`, `eng-civil` aparecem em duas áreas — proposital.
- A cor das cartas continua sendo a da **Escola** de cada curso (via `getSchool`). Em áreas de escola única (Saúde, Artes...) o tabuleiro fica quase monocromático (reforça "esses são os cursos da escola X"); em `negocios` e `ciencias` as cores variam.

## O que muda no jogo existente

- **Remove** `DifficultySelector` (componente + teste). O jogo é sempre **6 pares**.
- **`app/lib/difficulty.ts`**: o conceito de dificuldade sai. Substituir por uma constante única `PAIRS_PER_GAME = 6` (em `areas.ts` ou um `config.ts`).
- **`useMemoryGame`**: passa a receber a **área** (ou o pool de cursos da área) em vez de `difficulty`; usa `buildDeck(6, poolDaÁrea)` (o `buildDeck` já aceita uma lista de cursos). Recordes keyed por `AreaId`.
- **`storage.ts`**: `Records` passa a ser keyed por `AreaId` (5 áreas) em vez de `Difficulty`. Usar uma **nova chave** de localStorage (ex.: `unisinos-memoria-records-areas`) para não colidir com dados antigos por dificuldade.
- **`GameBoard`**: recebe `area`; sem barra de dificuldade; recebe callbacks `onReplay` (mesma área) e `onRestartQuiz` (voltar ao teste); `Scoreboard` mostra o recorde da área.
- **Reveal na vitória**: mantém estrelas + jogadas/tempo; botões "Jogar de novo" e "Refazer o teste".

## Telas

- **Quiz** (`Quiz.tsx`): cartão central, uma pergunta por vez, opções grandes com emoji (bom para toque/projetor), indicador "1 de 2" / "2 de 2", botão voltar para P1. Acessível (botões, teclado, aria).
- **Reveal** (`AreaReveal.tsx`): "Você tem a ver com **[Área]**!" com emoji/cor da área, uma linha usando as duas respostas, e botão **Começar a jogar**.
- **Jogo**: igual ao atual sem a barra de dificuldade; placar com recorde da área.
- **Vitória**: estrelas + jogadas/tempo + Escolas que apareceram + **Jogar de novo** / **Refazer o teste**.

## Arquitetura

Novos módulos:
- `app/data/areas.ts` — `type AreaId`, `interface Area { id; label; emoji; accent; courseIds: string[] }`, `AREAS: Record<AreaId, Area>`, `getAreaCourses(id): Course[]`, `PAIRS_PER_GAME = 6`.
- `app/data/quiz.ts` — definição das 2 perguntas (`id`, `prompt`, `options[{ id, label, emoji }]`) e `resolveArea(p1, p2): AreaId` (pura, testável).
- `app/components/Quiz.tsx` — coleta P1 e P2, chama `onComplete(p1, p2)`.
- `app/components/AreaReveal.tsx` — mostra a área resolvida + `onStart`.
- Controlador de fluxo no topo (`app/components/GameFlow.tsx` ou expandir `page`) — máquina `quiz → reveal → game`, guarda `{ p1, p2, areaId }`.

Ajustes:
- `app/hooks/useMemoryGame.ts` — recebe a área/pool; 6 pares fixos; recordes por área.
- `app/lib/storage.ts` — records por `AreaId`, nova chave.
- `app/lib/difficulty.ts` — removido/substituído por `PAIRS_PER_GAME`.
- `app/components/GameBoard.tsx` — sem `DifficultySelector`; props de área + callbacks.
- `app/components/DifficultySelector.tsx` (+ teste) — removidos.
- `CLAUDE.md` — atualizar (fluxo do teste, sem dificuldade, áreas e pools).

## Testes (alvos principais)

- `resolveArea` (todas as combinações relevantes, especialmente `natureza` × P2).
- `getAreaCourses` (cada área resolve para ≥6 cursos existentes; ids válidos).
- `storage` por área (mergeBest, load/save com nova chave).
- `Quiz` (fluxo P1→P2, chama onComplete com os ids corretos).
- `AreaReveal` (mostra a área e chama onStart).
- Reducer/deck/scoring: inalterados (já cobertos).

## Fora de escopo

- Backend / analytics do teste (qual área mais escolhida) — só localStorage.
- Botão "pular teste" — o teste é rápido e é a experiência; não haverá skip (o jogador pode "Refazer o teste" depois).
- Ponderar P2 dentro das áreas não-fuzzy (sub-conjuntos por atividade) — possível melhoria futura; por ora P2 só decide o caso "Ciências".
- Assets oficiais da marca (logo/hex) — segue placeholder.
