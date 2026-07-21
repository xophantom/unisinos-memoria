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
