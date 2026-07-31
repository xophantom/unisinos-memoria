import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';
import { COURSES } from '../data/courses';

const medicina = COURSES.find((c) => c.id === 'medicina')!;
const grad = 'from-emerald-500 to-emerald-700';

describe('Card', () => {
  it('mostra o nome do curso e usa o nome no aria-label quando virada', () => {
    render(<Card id={0} course={medicina} gradient={grad} isFlipped isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByText('Medicina')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medicina' })).toBeInTheDocument();
  });

  it('carta fechada tem aria-label "Carta fechada"', () => {
    render(<Card id={0} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked={false} onFlip={() => {}} />);
    expect(screen.getByRole('button', { name: 'Carta fechada' })).toBeInTheDocument();
  });

  it('clique em carta fechada chama onFlip', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).toHaveBeenCalledWith(3);
  });

  it('não chama onFlip quando travada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped={false} isMatched={false} locked onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });

  it('não chama onFlip quando já virada', async () => {
    const onFlip = vi.fn();
    render(<Card id={3} course={medicina} gradient={grad} isFlipped isMatched={false} locked={false} onFlip={onFlip} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onFlip).not.toHaveBeenCalled();
  });
});
