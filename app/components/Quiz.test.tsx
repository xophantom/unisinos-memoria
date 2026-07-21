import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';

describe('Quiz', () => {
  it('mostra a pergunta 1 primeiro, depois a 2, e chama onComplete', async () => {
    const onComplete = vi.fn();
    render(<Quiz onComplete={onComplete} />);

    expect(screen.getByText('O que mais desperta sua curiosidade?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 1 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Computadores, tecnologia e inovação/ }));

    expect(screen.getByText('Qual atividade parece mais legal?')).toBeInTheDocument();
    expect(screen.getByText(/Pergunta 2 de 2/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Construir apps, máquinas ou sistemas/ }));

    expect(onComplete).toHaveBeenCalledWith('tech', 'construir');
  });

  it('permite voltar da pergunta 2 para a 1', async () => {
    render(<Quiz onComplete={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: /Saúde e bem-estar/ }));
    expect(screen.getByText('Qual atividade parece mais legal?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByText('O que mais desperta sua curiosidade?')).toBeInTheDocument();
  });
});
