# Redesign por Clusters — Unisinos Start

**Data:** 2026-07-31
**Status:** Aprovado (design) — pendente escrita do plano de implementação
**Depende de:** feature "mini teste vocacional" já mergeada na `main` (quiz de 2 perguntas, áreas, hook, componentes).

## Objetivo

A Unisinos passou a organizar a oferta por **clusters (clusterização por propósito)** —
6 grupos temáticos que cruzam as antigas Escolas. O jogo precisa refletir isso:

1. **Remover os termos "escola" e "área de interesse"** da UI **e** do código.
2. Passar a trabalhar com os **6 clusters oficiais** (nome + tagline + cursos das imagens).
3. **P1** do quiz baseada nos **nomes dos clusters** (o aluno escolhe o cluster direto).
4. **P2** nova, mais específica, que **afunila dentro do cluster** — dois caminhos por
   cluster que direcionam para os cursos correspondentes.

Fonte dos dados: as duas imagens enviadas pela organização ("Clusterização por propósito"
e "Os cursos em cada cluster").

## Decisões fixadas no brainstorming

| Tema | Decisão |
|---|---|
| Terminologia | "Escola" e "área" saem da UI e do código. `AreaId`→`ClusterId`, `areas.ts`→`clusters.ts`. |
| Camada de Escola | **Removida** (`schools.ts` + `schoolId`). A cor da carta passa a vir do **cluster ativo**, não do curso. |
| Catálogo | 54 − 9 órfãos + 4 novos = **49 cursos**. |
| Cursos novos | `gil`, `agrotecnologia`, `eng-software`, `design-engineering` entram (fiel às imagens). |
| Cursos órfãos | Os 9 que não aparecem em nenhum cluster **saem do jogo** (espelha a clusterização oficial). |
| Cluster "Liderar" | Tem só 4 cursos → **completado** com 2 afins de "Analisar" (`administracao`, `comercio-exterior`) para fechar 6 pares. |
| P1 | 6 opções = os 6 clusters (nome + tagline como subtítulo). |
| P2 | Muda por cluster: **2 caminhos** ("ou/ou") que dividem os cursos do cluster; o baralho é puxado do caminho escolhido. |
| Cor das cartas | Por **cluster** (1 cor por partida). Carmim `#C8102E` segue reservado à marca (carta fechada "?", header). |
| Vitória | Troca "Escolas que apareceram" por **"Cursos que você encontrou"** (os 6, com ícone). |
| Recordes | Por `ClusterId`, nova chave de localStorage. |

`CRAV` (imagem) é interpretado como **Realização Audiovisual** (`realizacao-audiovisual`).

## Fluxo

```
Abrir → P1 (escolhe 1 dos 6 clusters) → P2 (1 dos 2 caminhos do cluster)
      → Reveal "Você tem tudo a ver com [Cluster] · lado [Caminho]"
      → Jogo (6 pares, puxados do caminho) → vitória
                                               ↓
                    [ Jogar de novo (mesmo cluster+caminho) ]   [ Refazer o teste ]
```

Máquina de fluxo (no topo): `quiz → reveal → game` (+ `game → quiz` via "Refazer o teste").
O estado do fluxo guarda `{ clusterId, laneId }`.

## Os 6 clusters (dados canônicos)

Cada cluster: `id`, `label`, `tagline`, `emoji`, `accent` (gradiente Tailwind, sem vermelho),
`courseIds` (todos os cursos do cluster) e `lanes` (2 caminhos, cada um com `id`, `label`,
`emoji`, `courseIds`). Todo cluster tem ≥ 6 cursos (para 6 pares).

### 1. `saber` — "Saber, aprender e ensinar" — 📚 — Índigo (`from-indigo-500 to-indigo-700`)
Tagline: "Para quem deseja compreender o mundo, produzir conhecimento e formar pessoas."
Cursos (6): `historia, filosofia, letras, pedagogia, matematica, biologia`
- `humanas` 🗣️ "Gente, ideias e palavras": `historia, filosofia, letras, pedagogia`
- `exatas` 🔬 "Lógica e natureza": `matematica, biologia`

### 2. `cuidar` — "Cuidar, nutrir e pesquisar" — 🩺 — Esmeralda (`from-emerald-500 to-emerald-700`)
Tagline: "Para quem quer promover saúde, qualidade de vida, cuidado e avanço científico."
Cursos (9): `medicina, enfermagem, fisioterapia, psicologia, ed-fisica, biomedicina, farmacia, nutricao, gastronomia`
- `paciente` 🤝 "Cuidar de perto do paciente": `medicina, enfermagem, fisioterapia, psicologia, ed-fisica`
- `ciencia` 🔬 "Nutrição, ciência e laboratório": `biomedicina, farmacia, nutricao, gastronomia`

### 3. `criar` — "Criar, projetar e manusear" — 🎨 — Fúcsia/Violeta (`from-fuchsia-500 to-purple-700`)
Tagline: "Para quem transforma ideias em soluções, projetos, produtos e experiências."
Cursos (13): `moda, design, prod-audiovisual, prod-fonografica, realizacao-audiovisual, bihat, arquitetura, eng-producao, eng-mecanica, eng-automacao, eng-quimica, eng-eletrica, eng-civil`
- `arte` 🎨 "Arte, mídia e design": `moda, design, prod-audiovisual, prod-fonografica, realizacao-audiovisual, bihat`
- `engenharia` ⚙️ "Engenharia e construção": `arquitetura, eng-producao, eng-mecanica, eng-automacao, eng-quimica, eng-eletrica, eng-civil`

### 4. `analisar` — "Analisar, comunicar e gerir" — 📊 — Azul (`from-sky-500 to-blue-700`)
Tagline: "Para quem deseja entender mercados, conectar pessoas e liderar negócios."
Cursos (9): `jornalismo, marketing, publicidade, economicas, gestao-financeira, gestao-comercial, contabeis, administracao, comercio-exterior`
- `comunicar` 📣 "Comunicar e influenciar": `jornalismo, marketing, publicidade`
- `gerir` 💼 "Analisar números e gerir": `economicas, gestao-financeira, gestao-comercial, contabeis, administracao, comercio-exterior`

### 5. `liderar` — "Liderar, empreender e inovar" — 🚀 — Âmbar (`from-amber-500 to-orange-600`)
Tagline: "Para quem quer gerar impacto, liderar transformações e atuar em contextos globais."
Cursos (6): `gil, agrotecnologia, administracao, direito, relacoes-internacionais, comercio-exterior`
(`administracao` e `comercio-exterior` são emprestados de `analisar` para fechar 6 pares.)
- `empreender` 🚀 "Empreender e inovar": `gil, agrotecnologia, administracao`
- `global` 🌐 "Direito e cenário global": `direito, relacoes-internacionais, comercio-exterior`

### 6. `desenvolver` — "Desenvolver, programar e sistematizar" — 💻 — Ciano/Teal (`from-cyan-500 to-teal-700`)
Tagline: "Para quem deseja criar tecnologias e construir soluções digitais para o futuro."
Cursos (8): `ads, jogos, ia, eng-software, design-engineering, computacao, eng-computacao, seguranca`
- `software` 📱 "Apps, jogos e IA": `ads, jogos, ia, eng-software, design-engineering`
- `sistemas` 🛡️ "Sistemas, dados e segurança": `computacao, eng-computacao, seguranca`

**Observações:**
- Um mesmo curso pode aparecer em dois clusters (`administracao`, `comercio-exterior`) —
  proposital. A cor da carta é sempre a do **cluster da partida**, não do curso.
- Nos clusters pequenos (`saber`, `liderar`) o caminho com < 6 cursos completa com o resto
  do cluster (ver "Montagem do baralho"); o afunilamento é mais cosmético lá, mas ainda molda
  reveal e destaque. Nos grandes (`criar`, `cuidar`, `analisar`) ele funciona forte.

## Catálogo de cursos (`courses.ts`)

`Course` passa a ser `{ id, label, Icon }` — **sem `schoolId`**.

- **Removidos (9):** `gestao-producao, gestao-ti, sistemas-info, sistemas-internet,
  relacoes-publicas, rh, gestao-publica, logistica, processos`.
- **Adicionados (4):** `gil` ("Gestão para Inovação e Liderança"), `agrotecnologia`
  ("Agrotecnologia"), `eng-software` ("Engenharia de Software"), `design-engineering`
  ("Design Engineering"). Ícones lucide escolhidos no plano (distintos dos já usados).
- Total: **49 cursos**.

`schools.ts` (e seu teste, se houver) é **removido**.

## Montagem do baralho

Função pura, dado `cluster` + `laneId`, devolve os **6 cursos** da partida, priorizando o caminho:

```
selecionarCursos(cluster, laneId):
  caminho   = cluster.lanes[laneId].courseIds
  poolLane  = embaralhar(cursos de caminho)
  se poolLane.length >= 6: retorna poolLane[0..6]
  resto     = embaralhar(cursos do cluster que não estão no caminho)
  retorna (poolLane ++ resto)[0..6]
```

`buildDeck` continua montando os pares a partir desses 6 cursos. `PAIRS_PER_GAME = 6`
permanece fixo (grid de 12 cartas inalterado). A aleatoriedade segue o padrão do `deck.ts`
atual, para manter os testes determinísticos onde já são.

## Telas

- **Quiz** (`Quiz.tsx`): P1 com 6 opções (nome do cluster + tagline + emoji); ao escolher,
  vai para a P2 daquele cluster (2 caminhos). "Pergunta 1 de 2" / "2 de 2", botão Voltar
  para a P1. Acessível (botões, teclado, aria, foco no heading a cada passo).
- **Reveal** (`ClusterReveal.tsx`, renomeado de `AreaReveal`): "Você tem tudo a ver com
  **[Cluster]**!" + "E, dentro dele, com o lado **[Caminho]**." + botão **Começar a jogar**.
  Usa a cor/emoji do cluster.
- **Jogo** (`GameBoard.tsx`): recebe `cluster` + `laneId`; cartas na **cor do cluster**;
  placar com recorde **do cluster**; botões "Reiniciar" e "Refazer o teste".
- **Cartas** (`Card.tsx`): frente carmim "?"; verso no gradiente do **cluster** + ícone + nome
  do curso. `aria-label` "Carta fechada" / "[Curso]".
- **Vitória** (`VictoryModal.tsx`): estrelas + jogadas + tempo + **"Cursos que você encontrou"**
  (os 6 cursos com ícone, no lugar das Escolas) + botões **Jogar de novo** / **Refazer o teste**.
  Mantém `role="dialog"`, foco inicial, Escape e fundo `inert`.

## Arquitetura

Novos/renomeados:
- `app/data/clusters.ts` (substitui `areas.ts`) — `type ClusterId`, `type LaneId`,
  `interface Lane`, `interface Cluster`, `CLUSTERS: Record<ClusterId, Cluster>`,
  `PAIRS_PER_GAME = 6`, `getClusterCourses(clusterId)`, `selecionarCursos(cluster, laneId)`.
- `app/components/ClusterReveal.tsx` (renomeia `AreaReveal.tsx`).

Ajustes:
- `app/data/quiz.ts` — `QUESTION_1` vira o seletor de cluster (6 opções, `id: ClusterId`);
  `getQuestion2(clusterId)` devolve a pergunta dos 2 caminhos daquele cluster
  (`id: LaneId`). `resolveArea` é **removido** (a P1 já entrega o cluster).
- `app/data/courses.ts` — sem `schoolId`; −9 removidos, +4 novos.
- `app/hooks/useMemoryGame.ts` — assinatura `useMemoryGame(cluster, laneId)`; baralho via
  `selecionarCursos`; recordes por `ClusterId`.
- `app/lib/storage.ts` — `Records` keyed por `ClusterId`; nova chave
  `unisinos-memoria-records-clusters`; SSR-safe; deep-merge sobre os 6 ids.
- `app/components/GameBoard.tsx` / `Card.tsx` / `Scoreboard.tsx` — cor por cluster; sem Escola.
- `app/components/GameFlow.tsx` — estado `{ clusterId, laneId }`; `area`→`cluster`.
- `app/components/Quiz.tsx` — fluxo P1 (cluster) → P2 (caminho).

Removidos:
- `app/data/areas.ts`, `app/data/schools.ts` (e testes associados).

## Testes (alvos principais)

- `getQuestion2` (cada cluster resolve 2 caminhos com ids/cursos válidos).
- `selecionarCursos` (sempre 6 cursos; prioriza o caminho; completa quando o caminho tem < 6;
  ids todos existentes no catálogo).
- `clusters` (cada cluster ≥ 6 cursos; cada lane não-vazia; união das lanes ⊆ courseIds).
- `courses` (49 cursos; ids únicos; sem `schoolId`; os 4 novos presentes; os 9 órfãos ausentes).
- `storage` por cluster (mergeBest, load/save com a nova chave, SSR-safe).
- `Quiz` (P1→P2 do cluster escolhido; chama `onComplete(clusterId, laneId)`).
- `ClusterReveal` (mostra cluster + caminho; chama `onStart`).
- `VictoryModal` (mostra os 6 cursos; botões corretos; foco/Escape/`inert`).
- Reducer/deck/scoring: inalterados (já cobertos).

## Fora de escopo

- Backend/analytics (qual cluster/caminho mais escolhido) — só localStorage.
- Botão "pular teste" — o teste é a experiência; há "Refazer o teste" na vitória.
- Ícones/labels definitivos dos 4 cursos novos podem ser refinados quando a marca confirmar.
- Assets oficiais (logo/hex exatos) — segue placeholder textual "UNISINOS · Start".
- Guardar a Escola como metadado — descartado (camada removida); reversível se necessário.
