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
