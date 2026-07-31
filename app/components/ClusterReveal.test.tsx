import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClusterReveal from './ClusterReveal';
import { CLUSTERS } from '../data/clusters';

describe('ClusterReveal', () => {
  it('mostra o cluster e o caminho escolhido', () => {
    render(<ClusterReveal cluster={CLUSTERS.criar} laneId="engenharia" onStart={() => {}} />);
    expect(screen.getByText('Criar, projetar e manusear')).toBeInTheDocument();
    expect(screen.getByText(/Engenharia e construção/)).toBeInTheDocument();
  });
  it('chama onStart no botão "Começar a jogar"', async () => {
    const onStart = vi.fn();
    render(<ClusterReveal cluster={CLUSTERS.cuidar} laneId="paciente" onStart={onStart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Começar a jogar' }));
    expect(onStart).toHaveBeenCalled();
  });
});
