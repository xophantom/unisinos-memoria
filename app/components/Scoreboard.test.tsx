import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Scoreboard from './Scoreboard';

describe('Scoreboard', () => {
  it('mostra jogadas, pares e tempo formatado', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={null} />);
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('3/6')).toBeInTheDocument();
    expect(screen.getByText('01:15')).toBeInTheDocument();
  });
  it('mostra o recorde de jogadas quando existe', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={{ bestMoves: 12, bestTime: 40 }} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });
  it('omite recorde quando não há', () => {
    render(<Scoreboard moves={8} matches={3} totalPairs={6} time={75} best={{ bestMoves: null, bestTime: null }} />);
    expect(screen.queryByText(/Recorde/i)).not.toBeInTheDocument();
  });
});
