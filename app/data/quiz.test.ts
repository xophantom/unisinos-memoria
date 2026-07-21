import { describe, it, expect } from 'vitest';
import { QUESTION_1, QUESTION_2, resolveArea, type Q2Id } from './quiz';

const ALL_Q2: Q2Id[] = ['construir', 'cuidar', 'liderar', 'produzir', 'pesquisar'];

describe('perguntas', () => {
  it('cada pergunta tem 5 opções com id/label/emoji', () => {
    for (const q of [QUESTION_1, QUESTION_2]) {
      expect(q.options).toHaveLength(5);
      for (const o of q.options) {
        expect(o.id).toBeTruthy();
        expect(o.label).toBeTruthy();
        expect(o.emoji).toBeTruthy();
      }
    }
  });
});

describe('resolveArea', () => {
  it('mapeia P1 direto (qualquer P2) quando P1 != natureza', () => {
    for (const p2 of ALL_Q2) {
      expect(resolveArea('tech', p2)).toBe('tecnologia');
      expect(resolveArea('saude', p2)).toBe('saude');
      expect(resolveArea('empresas', p2)).toBe('negocios');
      expect(resolveArea('pessoas', p2)).toBe('artes');
    }
  });
  it('natureza é refinada por P2', () => {
    expect(resolveArea('natureza', 'construir')).toBe('tecnologia');
    expect(resolveArea('natureza', 'cuidar')).toBe('saude');
    expect(resolveArea('natureza', 'pesquisar')).toBe('ciencias');
    expect(resolveArea('natureza', 'liderar')).toBe('ciencias');
    expect(resolveArea('natureza', 'produzir')).toBe('ciencias');
  });
});
