import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';
import { CLUSTERS } from '../data/clusters';

describe('Quiz', () => {
  it('P1 mostra as missões; cluster sem P2 chama onComplete direto', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    expect(screen.getByText('Você tem uma missão para o seu futuro. Qual será?')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.saber.mission }));

    expect(onComplete).toHaveBeenCalledWith('saber');
  });

  it('o cluster "criar" abre a P2 e chama onComplete com o lado', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.criar.mission }));

    expect(screen.getByText('Você se identifica mais com:')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Engenharias' }));

    expect(onComplete).toHaveBeenCalledWith('criar', 'engenharias');
  });

  it('permite voltar da P2 para a P1', async () => {
    render(<Quiz onComplete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: CLUSTERS.criar.mission }));
    expect(screen.getByText('Você se identifica mais com:')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('Você tem uma missão para o seu futuro. Qual será?')).toBeInTheDocument();
  });
});
