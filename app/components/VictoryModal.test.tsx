import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VictoryModal from './VictoryModal';
import { SCHOOLS } from '../data/schools';

describe('VictoryModal', () => {
  it('mostra jogadas e tempo', () => {
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude]} onRestart={() => {}} />);
    expect(screen.getByText(/9 jogadas/)).toBeInTheDocument();
    expect(screen.getByText(/01:15/)).toBeInTheDocument();
  });
  it('rotula a quantidade de estrelas', () => {
    render(<VictoryModal moves={9} time={75} stars={2} schools={[SCHOOLS.saude]} onRestart={() => {}} />);
    expect(screen.getByLabelText('2 de 3 estrelas')).toBeInTheDocument();
  });
  it('mostra as escolas que apareceram', () => {
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude, SCHOOLS.politecnica]} onRestart={() => {}} />);
    expect(screen.getByText('Saúde')).toBeInTheDocument();
    expect(screen.getByText('Politécnica')).toBeInTheDocument();
  });
  it('chama onRestart no botão', async () => {
    const onRestart = vi.fn();
    render(<VictoryModal moves={9} time={75} stars={3} schools={[SCHOOLS.saude]} onRestart={onRestart} />);
    await userEvent.click(screen.getByRole('button', { name: 'Jogar novamente' }));
    expect(onRestart).toHaveBeenCalled();
  });
});
