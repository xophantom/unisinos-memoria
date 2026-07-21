import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AreaReveal from './AreaReveal';
import { AREAS } from '../data/areas';

describe('AreaReveal', () => {
  it('mostra o nome da área resolvida', () => {
    render(<AreaReveal area={AREAS.tecnologia} p1="tech" p2="construir" onStart={() => {}} />);
    expect(screen.getByText('Tecnologia e Engenharia')).toBeInTheDocument();
  });
  it('chama onStart no botão "Começar a jogar"', async () => {
    const onStart = vi.fn();
    render(<AreaReveal area={AREAS.saude} p1="saude" p2="cuidar" onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));
    expect(onStart).toHaveBeenCalled();
  });
});
