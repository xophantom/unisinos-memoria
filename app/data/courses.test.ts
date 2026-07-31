import { describe, it, expect } from 'vitest';
import { COURSES } from './courses';
import { SCHOOLS } from './schools';

describe('COURSES', () => {
  it('tem 58 cursos (catálogo estendido)', () => {
    expect(COURSES).toHaveLength(58);
  });
  it('ids são únicos', () => {
    const ids = COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('todo curso aponta para uma escola existente', () => {
    for (const c of COURSES) {
      expect(SCHOOLS[c.schoolId]).toBeTruthy();
    }
  });
  it('contagem por escola bate com a curadoria', () => {
    const count = (id: string) => COURSES.filter((c) => c.schoolId === id).length;
    expect(count('politecnica')).toBe(21);
    expect(count('artes')).toBe(15);
    expect(count('gestao')).toBe(12);
    expect(count('saude')).toBe(8);
    expect(count('direito')).toBe(1);
    expect(count('direito-ri')).toBe(1);
  });
  it('todo curso tem um ícone lucide válido (não undefined)', () => {
    for (const c of COURSES) {
      expect(c.Icon, `ícone ausente para "${c.id}"`).toBeTruthy();
    }
  });
});
