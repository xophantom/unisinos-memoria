# Redesign do Jogo da Memória — Unisinos Start

**Data:** 2026-07-20
**Status:** Aprovado (design) — pendente escrita do plano de implementação

## Objetivo

Refinar o Jogo da Memória do evento Start da Unisinos em três frentes:

1. **Visual/UI** — redesign com identidade Unisinos (vermelho carmim + neutros claros).
2. **Lógica de jogo** — refinamentos de jogabilidade (espiada inicial, estrelas, recordes persistentes, acessibilidade).
3. **Dados** — usar o catálogo atualizado de `docs/cursos.md`, incorporando a camada de **Escolas**.

Toda a documentação passa a ser centralizada no `CLAUDE.md` (fonte única do projeto).

## Decisões de design (fixadas no brainstorming)

| Tema | Decisão |
|---|---|
| Mecânica | Memória **clássico**: achar 2 cartas do **mesmo curso**. Escola = camada visual/educativa (cor da carta). |
| Seleção de cartas | **Sorteio geral** entre os ~54 cursos, misturando escolas. Sem tela/filtro extra. |
| Direção visual | **Identidade Unisinos**: fundo claro institucional + **carmim ~#C8102E** como cor-assinatura. |
| Marca | **Interpretação** (sem assets oficiais ainda): header textual "UNISINOS · Start" como placeholder do logo. |
| Refinamentos | **Todos**: recordes persistentes, estrelas, espiada inicial, acessibilidade + mobile. |
| Dificuldade | Mantém Fácil 6 / Médio 10 / Difícil 16 pares, com grid **responsivo**. |

## Modelo de dados

Duas fontes de verdade separadas.

### `app/data/schools.ts`

As 6 Escolas do `cursos.md`. Cada Escola define a cor/gradiente e um ícone.

| id | label | Cor (família) |
|---|---|---|
| `politecnica` | Politécnica | Azul |
| `saude` | Saúde | Esmeralda |
| `gestao` | Gestão e Negócios | Âmbar |
| `artes` | Artes, Humanidades e Economia Criativa | Violeta/Fúcsia |
| `direito` | Direito | Índigo |
| `direito-ri` | Direito e Relações Internacionais | Teal |

**Restrição de cor:** vermelho carmim é reservado para a marca (header, botões primários, "?" da carta fechada). Nenhuma Escola usa vermelho, para não competir com a identidade. As cores são constantes ajustáveis.

### `app/data/courses.ts`

Cada curso tem `id`, `label`, `schoolId` e `Icon` (lucide). **A cor vem da Escola** — não há cor por curso.

**Curadoria do catálogo** (a partir de `docs/cursos.md`):
- As 3 variantes de "Administração" (base, Comércio Exterior, Gestão para Inovação e Liderança) colapsam em **um** "Administração".
- "Comércio Exterior" duplicado é mantido **uma vez** (na Gestão e Negócios).
- Resultado: **54 cursos distintos** (18 Politécnica + 15 Artes + 11 Gestão + 8 Saúde + 1 Direito + 1 Direito e RI).

Catálogo curado por Escola:

- **Politécnica (18):** Análise e Desenvolvimento de Sistemas, Arquitetura e Urbanismo, Biologia, Ciência da Computação, Engenharia Civil, Engenharia da Computação, Engenharia de Controle e Automação, Engenharia de Produção, Engenharia Elétrica, Engenharia Mecânica, Engenharia Química, Gestão da Produção Industrial, Gestão da Tecnologia da Informação, Inteligência Artificial, Matemática, Segurança da Informação, Sistemas da Informação, Sistemas para Internet.
- **Artes, Humanidades e Economia Criativa (15):** BIHAT, Design, Filosofia, Gastronomia, História, Jogos Digitais, Jornalismo, Letras, Moda, Pedagogia, Produção Audiovisual, Produção Fonográfica, Publicidade e Propaganda, Realização Audiovisual, Relações Públicas.
- **Gestão e Negócios (11):** Administração, Ciências Contábeis, Ciências Econômicas, Comércio Exterior, Gestão Comercial, Gestão de Recursos Humanos, Gestão Financeira, Gestão Pública, Logística, Marketing, Processos Gerenciais.
- **Saúde (8):** Biomedicina, Educação Física, Enfermagem, Farmácia, Fisioterapia, Medicina, Nutrição, Psicologia.
- **Direito (1):** Direito.
- **Direito e Relações Internacionais (1):** Relações Internacionais.

Ícones: escolhidos do `lucide-react` por curso; quando não houver um óbvio, usa o ícone da Escola como fallback. O mapeamento exato é detalhado no plano de implementação.

## Identidade visual

- **Base:** fundo claro institucional (off-white / cinza levíssimo). **Carmim ~#C8102E** como cor-assinatura (header, botões primários, destaques, "?" da carta fechada).
- **Header:** faixa com "**UNISINOS** · Start" em tipografia forte (placeholder textual do logo) + subtítulo "Jogo da Memória dos Cursos". Deixar espaço/hook para trocar por logo real depois.
- **Cards:**
  - **Frente (fechada):** carmim com "?" e textura sutil.
  - **Verso (curso):** gradiente da cor da Escola + ícone + nome do curso + micro-tag da Escola.
  - **Match:** brilho/pulso verde + leve "pop"; cartas casadas ficam levemente rebaixadas/desaturadas.
- **Tipografia:** manter Geist; pesos fortes nos números do placar.

Wireframe:

```
┌───────────────────────────────────────────────┐
│  UNISINOS · Start        Jogo da Memória        │  header carmim
├───────────────────────────────────────────────┤
│        [ Fácil ]  [ Médio ]  [ Difícil ]        │  dificuldade (pill ativa carmim)
│                                                 │
│   Jogadas 8 · Pares 3/6 · ⏱ 00:42 · 🏆 12/00:31 │  placar (glass claro)
│                                                 │
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐   cor da carta = escola   │
│   │? │ │Med│ │? │ │? │                          │
│   └──┘ └──┘ └──┘ └──┘                          │
│              [ ↺ Reiniciar ]                    │
└───────────────────────────────────────────────┘
```

## Fluxo e lógica

1. **Espiada inicial:** ao iniciar/reiniciar, todas as cartas viram por **~2,5s** e depois escondem. Tabuleiro travado nessa fase; cronômetro e jogadas **não** contam.
2. **Jogo:** cronômetro começa no **primeiro clique real** pós-espiada. "Move" = par revelado (contado quando 2 cartas estão viradas). Match permanece; erro desvira após ~1s.
3. **Vitória:** modal com **1–3 estrelas** (por eficiência), jogadas, tempo e destaque das **Escolas que apareceram** na partida. Botão "Jogar novamente".
4. **Recordes persistentes (`localStorage`):** melhor **jogadas** e melhor **tempo** por dificuldade, sobrevivendo a refresh. SSR-safe (lê/grava apenas no cliente).

Fórmula de estrelas (constantes ajustáveis):
- ⭐⭐⭐: `moves ≤ round(pares × 1.6)`
- ⭐⭐: `moves ≤ round(pares × 2.3)`
- ⭐: acima disso.

## Dificuldade

Mantém **Fácil 6 / Médio 10 / Difícil 16** pares. Grid **responsivo** (menos colunas no celular, mais no desktop/projetor) em vez de colunas fixas por dificuldade.

## Acessibilidade + mobile

- Teclado: tab/enter/espaço com roving tabindex nas cartas.
- `aria-label` por carta: "Carta fechada" / "Medicina — Escola Saúde".
- Região `aria-live` anuncia match e vitória.
- `prefers-reduced-motion`: troca o flip 3D por transição instantânea.
- Layout fluido para celular e telão.

## Arquitetura de código

O `GameBoard.tsx` atual (≈260 linhas, lógica de flip em `useEffect` frágil com `eslint-disable`) é refatorado em unidades focadas:

- **`app/hooks/useMemoryGame.ts`** — máquina de estados do jogo (cartas, flips, matches, jogadas, timer, espiada, vitória). Testável isoladamente.
- **`app/lib/scoring.ts`** — cálculo de estrelas.
- **`app/lib/storage.ts`** — recordes em `localStorage`, SSR-safe.
- **`app/data/schools.ts`** e **`app/data/courses.ts`** — dados.
- **UI:** `Header`, `DifficultySelector`, `Scoreboard`, `Board`, `Card`, `VictoryModal` — cada um com responsabilidade única. `GameBoard` passa a compor essas peças.

## CLAUDE.md como fonte única

Ao final, reescrever o `CLAUDE.md` para refletir: mecânica atualizada, sistema de cores por Escola, catálogo de cursos e sua fonte, refinamentos de jogabilidade, identidade Unisinos e a arquitetura de código. Vira a documentação central do projeto.

## Fora de escopo

- Assets oficiais da marca (logo/hex exatos) — usados placeholders até o usuário fornecer.
- Backend / ranking online — recordes ficam só no `localStorage`.
- Filtro/seleção por Escola — descartado no brainstorming.
- Modos de jogo alternativos (curso↔escola) — descartado no brainstorming.
