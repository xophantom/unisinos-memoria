# Jogo da Memória — Unisinos Start

## Contexto

Este projeto será desenvolvido como uma atividade prática do evento Start da Unisinos. A proposta é criar uma aplicação interativa e lúdica que envolva os usuários com o universo acadêmico.

## Escopo

O escopo do projeto abrange o desenvolvimento de um jogo da memória temático, voltado para o ambiente universitário.

## Aplicação

O jogador vira as cartas tentando encontrar os pares de cursos. A cada partida as cartas são embaralhadas aleatoriamente, garantindo uma experiência diferente a cada jogo.

O fluxo básico é:

1. O jogador escolhe o nível de dificuldade
2. As cartas são dispostas viradas para baixo no tabuleiro
3. O jogador clica em duas cartas por vez tentando encontrar o par
4. O jogo termina quando todos os pares são encontrados
5. O resultado é exibido com o número de jogadas e o tempo gasto

## Funcionalidades

- **Três níveis de dificuldade**
  - Fácil: 6 pares (12 cartas)
  - Médio: 10 pares (20 cartas)
  - Difícil: 16 pares (32 cartas)

- **Tabuleiro embaralhado** a cada nova partida

- **Animação de flip 3D** nas cartas ao virá-las

- **Placar em tempo real** com:
  - Contador de jogadas
  - Pares encontrados vs. total
  - Cronômetro (inicia no primeiro clique)
  - Recorde de jogadas por dificuldade (sessão atual)

- **16 cursos representados**, cada um com ícone e cor exclusivos:
  - Ciência da Computação, Medicina, Direito, Engenharia, Psicologia, Arquitetura, Administração, Matemática, Física, Química, Biologia, Letras, História, Filosofia, Educação Física, Economia

- **Tela de vitória** exibindo resultado ao completar o jogo

- **Botão Reiniciar** disponível a qualquer momento

## Tecnologias

NextJS e React
