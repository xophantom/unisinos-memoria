import type { BoardCard } from './deck';

export type { BoardCard };

export type Phase = 'idle' | 'peek' | 'playing' | 'checking' | 'won';

export interface GameState {
  cards: BoardCard[];
  flipped: number[];
  moves: number;
  matches: number;
  totalPairs: number;
  phase: Phase;
  gameId: number;
}

export type GameAction =
  | { type: 'NEW_GAME'; cards: BoardCard[]; totalPairs: number }
  | { type: 'END_PEEK' }
  | { type: 'FLIP'; id: number }
  | { type: 'RESOLVE' };

export const initialState: GameState = {
  cards: [],
  flipped: [],
  moves: 0,
  matches: 0,
  totalPairs: 0,
  phase: 'idle',
  gameId: 0,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return {
        cards: action.cards.map((c) => ({ ...c, isFlipped: true, isMatched: false })),
        flipped: [],
        moves: 0,
        matches: 0,
        totalPairs: action.totalPairs,
        phase: 'peek',
        gameId: state.gameId + 1,
      };

    case 'END_PEEK':
      if (state.phase !== 'peek') return state;
      return {
        ...state,
        phase: 'playing',
        cards: state.cards.map((c) => ({ ...c, isFlipped: false })),
      };

    case 'FLIP': {
      if (state.phase !== 'playing') return state;
      if (state.flipped.length >= 2) return state;
      const target = state.cards.find((c) => c.id === action.id);
      if (!target || target.isFlipped || target.isMatched) return state;
      const flipped = [...state.flipped, action.id];
      const cards = state.cards.map((c) => (c.id === action.id ? { ...c, isFlipped: true } : c));
      if (flipped.length === 2) {
        return { ...state, cards, flipped, moves: state.moves + 1, phase: 'checking' };
      }
      return { ...state, cards, flipped };
    }

    case 'RESOLVE': {
      if (state.phase !== 'checking' || state.flipped.length !== 2) return state;
      const [id1, id2] = state.flipped;
      const c1 = state.cards.find((c) => c.id === id1);
      const c2 = state.cards.find((c) => c.id === id2);
      const isMatch = !!c1 && !!c2 && c1.course.id === c2.course.id;
      if (isMatch) {
        const matches = state.matches + 1;
        return {
          ...state,
          cards: state.cards.map((c) =>
            c.id === id1 || c.id === id2 ? { ...c, isMatched: true, isFlipped: true } : c,
          ),
          flipped: [],
          matches,
          phase: matches === state.totalPairs ? 'won' : 'playing',
        };
      }
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === id1 || c.id === id2 ? { ...c, isFlipped: false } : c,
        ),
        flipped: [],
        phase: 'playing',
      };
    }

    default:
      return state;
  }
}
