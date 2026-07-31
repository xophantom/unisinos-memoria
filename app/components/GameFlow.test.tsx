import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlow from './GameFlow';

describe('GameFlow', () => {
  it('quiz → reveal → game', async () => {
    render(<GameFlow />);

    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Criar, projetar e manusear/ }));
    await userEvent.click(screen.getByRole('button', { name: /Engenharia e construção/ }));

    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));

    expect(await screen.findByRole('button', { name: 'Refazer o teste' })).toBeInTheDocument();
  });
});
