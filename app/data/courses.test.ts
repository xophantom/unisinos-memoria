import { describe, it, expect } from 'vitest';
import { COURSES } from './courses';

const REMOVIDOS = [
  'gestao-producao', 'gestao-ti', 'sistemas-info', 'sistemas-internet',
  'relacoes-publicas', 'rh', 'gestao-publica', 'logistica', 'processos',
];

describe('COURSES', () => {
  it('tem 49 cursos', () => {
    expect(COURSES).toHaveLength(49);
  });
  it('ids são únicos', () => {
    const ids = COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('inclui os cursos novos/renomeados (planilha 2027.1)', () => {
    const ids = new Set(COURSES.map((c) => c.id));
    for (const id of ['gil', 'gestao-tec-agro', 'eng-software', 'design-tec-negocios']) {
      expect(ids.has(id), `curso ausente: ${id}`).toBe(true);
    }
  });
  it('não inclui ids antigos (renomeados) nem os órfãos removidos', () => {
    const ids = new Set(COURSES.map((c) => c.id));
    for (const id of [...REMOVIDOS, 'design-engineering', 'agrotecnologia']) {
      expect(ids.has(id), `id antigo ainda presente: ${id}`).toBe(false);
    }
  });
  it('todo curso tem id, label e ícone', () => {
    for (const c of COURSES) {
      expect(c.id).toBeTruthy();
      expect(c.label).toBeTruthy();
      expect(c.Icon, `ícone ausente para "${c.id}"`).toBeTruthy();
    }
  });
});
