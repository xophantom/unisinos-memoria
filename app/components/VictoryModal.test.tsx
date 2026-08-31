import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { COURSES } from '../data/courses';

const medicina = COURSES.find((c) => c.id === 'medicina')!;
const enfermagem = COURSES.find((c) => c.id === 'enfermagem')!;

const base = {
  moves: 9,
  time: 75,
  stars: 3 as const,
  courses: [medicina, enfermagem],
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
  it('lista os cursos encontrados', () => {
    render(<VictoryModal {...base} />);
    expect(screen.getByText('Nos vemos na Unisinos em:')).toBeInTheDocument();
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByText('Enfermagem')).toBeInTheDocument();
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
