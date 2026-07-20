import { describe, it, expect } from 'vitest';
import { SCHOOLS, getSchool } from './schools';

describe('SCHOOLS', () => {
  it('tem as 6 escolas', () => {
    expect(Object.keys(SCHOOLS)).toHaveLength(6);
  });
  it('cada escola tem gradiente e ícone, e nenhuma usa vermelho/carmim', () => {
    for (const s of Object.values(SCHOOLS)) {
      expect(s.gradient).toMatch(/from-/);
      expect(s.Icon).toBeTruthy();
      expect(s.gradient).not.toMatch(/red|rose|unisinos/);
    }
  });
  it('getSchool retorna a escola pelo id', () => {
    expect(getSchool('saude').label).toBe('Saúde');
  });
});
