import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { SCHOOLS } from '../data/schools';

const base = {
  moves: 9,
  time: 75,
  stars: 3 as const,
  schools: [SCHOOLS.saude],
  onRestart: () => {},
  onRestartQuiz: () => {},
};

describe('VictoryModal', () => {
  it('mostra jogadas e tempo', () => {
    render(<VictoryModal {...base} />);
    expect(screen.getByText(/9 jogadas/)).toBeInTheDocument();
    expect(screen.getByText(/01:15/)).toBeInTheDocument();
  });
  it('rotula a quantidade de estrelas', () => {
    render(<VictoryModal {...base} stars={2} />);
    expect(screen.getByLabelText('2 de 3 estrelas')).toBeInTheDocument();
  });
  it('mostra as escolas que apareceram', () => {
    render(<VictoryModal {...base} schools={[SCHOOLS.saude, SCHOOLS.politecnica]} />);
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Politécnica')).toBeInTheDocument();
  });
  it('chama onRestart no botão "Jogar de novo"', async () => {
    const onRestart = vi.fn();
    render(<VictoryModal {...base} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Jogar de novo' }));
    expect(onRestart).toHaveBeenCalled();
  });
  it('chama onRestartQuiz no botão "Refazer o teste"', async () => {
    const onRestartQuiz = vi.fn();
    render(<VictoryModal {...base} onRestartQuiz={onRestartQuiz} />);
    await userEvent.click(screen.getByRole('button', { name: 'Refazer o teste' }));
    expect(onRestartQuiz).toHaveBeenCalled();
  });
});
