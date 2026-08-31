import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlow from './GameFlow';
import { CLUSTERS } from '../data/clusters';

describe('GameFlow', () => {
  it('quiz (sem P2) → reveal → game', async () => {
    render(<GameFlow />);

    expect(screen.getByText('Você tem uma missão para o seu futuro. Qual será?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.saber.mission }));

    // vai direto para o resultado (sem P2)
    expect(screen.getByText('Saber, aprender e ensinar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Jogar' }));

    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });

  it('quiz do "criar" passa pela P2 antes do jogo', async () => {
    render(<GameFlow />);

    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.criar.mission }));
    expect(screen.getByText('Você se identifica mais com:')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Criatividade' }));

    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Jogar' }));

    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });
});
