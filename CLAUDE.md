# Jogo da Memória — Unisinos Conecta (Play no Futuro)

## Contexto

Atividade prática do evento **Unisinos Conecta**: uma aplicação interativa e
lúdica que envolve o público com o universo acadêmico da universidade
("**Play no Futuro** — descubra seu próximo passo na Unisinos").

## Aplicação

Antes de jogar, **uma pergunta** (a "missão") define um **cluster** (a Unisinos
organiza a oferta por *clusterização por propósito*). O jogo então mostra um
memória clássico com **todos os cursos daquele cluster** (tabuleiro de tamanho
variável) — achar pares do mesmo curso, cada carta pintada pela **cor do cluster**.

Fluxo:
1. **Pergunta única (P1):** "Você tem uma missão para o seu futuro. Qual será?" →
   as **6 opções são as missões** (uma por cluster). O nome do cluster só aparece
   no resultado.
2. Tela de **resultado** ("Você tem tudo a ver com [Cluster]! · Conheça os cursos
   perfeitos para o seu futuro!") → botão **Jogar**.
3. **Jogo:** espiada inicial ~2,5s, depois vira 2 cartas por vez procurando o par.
4. **Vitória:** estrelas, jogadas, tempo e os **cursos que apareceram** ("Nos vemos
   na Unisinos em:"); botões **Jogar de novo** (mesmo cluster) e **Refazer o teste**.

## Funcionalidades

- **Pergunta única (missão)** como porta de entrada — sem 2ª pergunta.
- **6 clusters** que filtram os cursos (pools em `app/data/clusters.ts`).
- **Tabuleiro de tamanho variável:** nº de pares = nº de cursos do cluster
  (de 4 a 12 pares). Sem tiers de dificuldade.
- **Espiada inicial** ~2,5s; **flip 3D** (respeita "reduzir movimento").
- **Placar em tempo real:** jogadas, pares, cronômetro.
- **Recordes persistentes por cluster** (localStorage): melhor nº de jogadas e menor tempo.
- **Estrelas (1–3)** por eficiência na tela de vitória.
- **Acessibilidade:** cartas e opções são botões (teclado + aria), modal com foco/Escape
  e fundo `inert`, região `aria-live`, layout responsivo.

## Cursos e clusters

Fonte: planilha oficial **CURSOS E CLUSTERS 2027.1** (`docs/`). Curadoria: catálogo
de **49 cursos** (`app/data/courses.ts`), sem camada de Escola — a cor vem do cluster.
Cada curso aparece em **exatamente um** cluster (partição limpa: 6+9+9+9+4+12 = 49).

| Cluster | id | Cor | Nº cursos (pares) |
|---|---|---|---|
| Aprender e ensinar | `saber` | Índigo | 6 |
| Cuidar e nutrir | `cuidar` | Esmeralda | 9 |
| Criar e projetar | `criar` | Fúcsia/Violeta | 9 |
| Comunicar e gerir | `analisar` | Azul | 9 |
| Liderar e mediar | `liderar` | Âmbar | 4 |
| Desenvolver e solucionar | `desenvolver` | Ciano/Teal | 12 |

Os `id` internos são históricos (ex.: `analisar` = "Comunicar e gerir") — a UI usa
sempre o `label`. O vermelho carmim (`#C8102E`) é reservado à **marca Unisinos**
(header, botões, carta fechada) — nenhum cluster usa vermelho.

## Identidade visual

- Fundo claro institucional (`--color-surface`), acento **carmim `#C8102E`**.
- Header textual "**UNISINOS** · Conecta" + "Play no Futuro" (placeholder do logo
  oficial — trocar quando o arquivo estiver disponível).
- Cartas: frente carmim com "?"; verso com gradiente do cluster + ícone + nome.

## Tecnologias

Next.js 16, React 19, Tailwind CSS 4, lucide-react. Testes com Vitest +
@testing-library/react.

## Arquitetura

- `app/data/courses.ts` — os 49 cursos (`id`, `label`, `Icon`).
- `app/data/clusters.ts` — os 6 clusters (label, mission, tagline, emoji, cor,
  `courseIds`) + `CLUSTER_IDS`, `getClusterCourses`.
- `app/data/quiz.ts` — `QUESTION_1` (a missão; escolhe o cluster).
- `app/lib/deck.ts` — embaralhamento e montagem do baralho.
- `app/lib/gameReducer.ts` — **reducer puro** com a máquina de estados
  (peek → playing → checking → won). Testável sem React.
- `app/hooks/useMemoryGame.ts` — recebe o **cluster** e monta o baralho com todos
  os cursos dele (tabuleiro variável) + timers (espiada, resolução, cronômetro) +
  recordes por cluster.
- `app/lib/scoring.ts` (estrelas), `app/lib/storage.ts` — recordes por `ClusterId`
  (chave `unisinos-memoria-records-clusters`, localStorage, SSR-safe),
  `app/lib/format.ts` (mm:ss).
- `app/components/` — `Quiz.tsx` (P1 = missão), `ClusterReveal.tsx` (resultado),
  `GameFlow.tsx` (fluxo `quiz → reveal → game`), `Header`, `Scoreboard`, `Board`,
  `Card`, `VictoryModal`; `GameBoard` compõe o jogo.

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
