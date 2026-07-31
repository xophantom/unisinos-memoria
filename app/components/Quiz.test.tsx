import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';

describe('Quiz', () => {
  it('mostra a P1 (clusters), depois a P2 do cluster, e chama onComplete', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Criar, projetar e manusear/ }));

    expect(screen.getByText('Dentro de "Criar, projetar e manusear", você é mais...')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Engenharia e construção/ }));

    expect(onComplete).toHaveBeenCalledWith('criar', 'engenharia');
  });

  it('permite voltar da P2 para a P1', async () => {
    render(<Quiz onComplete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /Cuidar, nutrir e pesquisar/ }));
    expect(screen.getByText(/Dentro de "Cuidar/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('Qual desses combina mais com você?')).toBeInTheDocument();
  });
});
