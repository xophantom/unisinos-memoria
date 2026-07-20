import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DifficultySelector from './DifficultySelector';

describe('DifficultySelector', () => {
  it('renderiza as três dificuldades', () => {
    render(<DifficultySelector value="easy" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Fácil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Médio' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Difícil' })).toBeInTheDocument();
  });
  it('marca a dificuldade ativa com aria-pressed', () => {
    render(<DifficultySelector value="medium" onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Médio' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('chama onChange ao clicar', async () => {
    const onChange = vi.fn();
    render(<DifficultySelector value="easy" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Difícil' }));
    expect(onChange).toHaveBeenCalledWith('hard');
  });
});
