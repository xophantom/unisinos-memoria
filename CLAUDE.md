# Jogo da Memória — Unisinos Start

## Contexto

Atividade prática do evento **Start da Unisinos**: uma aplicação interativa e
lúdica que envolve o público com o universo acadêmico da universidade.

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
- `app/data/areas.ts` — as 5 áreas (label, emoji, cor, pool de `courseIds`) + `PAIRS_PER_GAME`.
- `app/data/quiz.ts` — as 2 perguntas e `resolveArea(p1, p2)` (pura).
- `app/lib/deck.ts` — embaralhamento e montagem do baralho.
- `app/lib/gameReducer.ts` — **reducer puro** com a máquina de estados
  (peek → playing → checking → won). Toda a lógica de jogo, testável sem React.
- `app/hooks/useMemoryGame.ts` — recebe a **área** (pool de cursos, 6 pares fixos)
  e orquestra reducer + timers (espiada, resolução, cronômetro) + recordes por área.
- `app/lib/scoring.ts` (estrelas), `app/lib/storage.ts` — recordes por `AreaId`
  (chave `unisinos-memoria-records-areas`, localStorage, SSR-safe), `app/lib/format.ts` (mm:ss).
- `app/components/` — `Quiz.tsx` (as 2 perguntas), `AreaReveal.tsx` (tela de
  resultado), `GameFlow.tsx` (máquina de fluxo `quiz → reveal → game`),
  `Header`, `Scoreboard`, `Board`, `Card`, `VictoryModal`; `GameBoard` compõe o jogo.

## Comandos

- `npm run dev` — servidor de desenvolvimento.
- `npm test` — suíte de testes (Vitest).
- `npm run build` — build de produção (checa tipos e lint).

## Convenções

- Textos de UI em **PT-BR com acentuação correta**.
- Somente imports relativos no código (sem alias `@/`) para o Vitest resolver
  sem configuração extra.
- Lógica de jogo nova entra no reducer (com teste) antes da UI.
