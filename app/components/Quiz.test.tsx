import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';
import { CLUSTERS } from '../data/clusters';

describe('Quiz', () => {
  it('mostra as missões (P1) e chama onComplete com o cluster escolhido', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);
    expect(screen.getByText('Você tem uma missão para o seu futuro. Qual será?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.saber.mission }));
    expect(onComplete).toHaveBeenCalledWith('saber');
  });

  it('todos os clusters vão direto (sem 2ª pergunta), inclusive o "criar"', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);
    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.criar.mission }));
    expect(onComplete).toHaveBeenCalledWith('criar');
  });
});
