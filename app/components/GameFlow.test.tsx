import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlow from './GameFlow';
import { CLUSTERS } from '../data/clusters';

describe('GameFlow', () => {
  it('quiz → reveal → game', async () => {
    render(<GameFlow />);

    expect(screen.getByText('Você tem uma missão para o seu futuro. Qual será?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.saber.mission }));

    expect(screen.getByText('Aprender e ensinar')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Jogar' }));

    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });
});
