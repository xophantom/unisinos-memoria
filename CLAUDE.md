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
