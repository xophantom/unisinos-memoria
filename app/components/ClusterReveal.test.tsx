import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterReveal from './ClusterReveal';
import { CLUSTERS } from '../data/clusters';

describe('ClusterReveal', () => {
  it('mostra o nome do cluster e a chamada de cursos', () => {
    render(<ClusterReveal cluster={CLUSTERS.criar} onStart={() => {}} />);
    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    expect(screen.getByText('Conheça os cursos perfeitos para o seu futuro!')).toBeInTheDocument();
  });
  it('chama onStart no botão "Jogar"', async () => {
    const onStart = vi.fn();
    render(<ClusterReveal cluster={CLUSTERS.cuidar} onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    expect(onStart).toHaveBeenCalled();
  });
});
