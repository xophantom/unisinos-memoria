import { describe, it, expect } from 'vitest';
import { CLUSTERS, CLUSTER_IDS, getClusterCourses, selectGameCourses, PAIRS_PER_GAME } from './clusters';
import { COURSES } from './courses';

const identity = <T,>(a: T[]): T[] => a;

describe('CLUSTERS', () => {
  it('tem os 6 clusters', () => {
    expect(Object.keys(CLUSTERS).sort()).toEqual([...CLUSTER_IDS].sort());
  });
  it('PAIRS_PER_GAME é 6', () => {
    expect(PAIRS_PER_GAME).toBe(6);
  });
  it('cada cluster tem label, tagline, emoji, accent sem vermelho e 2 caminhos', () => {
    for (const id of CLUSTER_IDS) {
      const c = CLUSTERS[id];
      expect(c.label).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.accent).toMatch(/from-/);
      expect(c.accent).not.toMatch(/red|rose|unisinos/);
      expect(c.lanes).toHaveLength(2);
    }
  });
  it('todo courseId de cluster e de caminho existe em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const id of CLUSTER_IDS) {
      for (const cid of CLUSTERS[id].courseIds) {
        expect(valid.has(cid), `curso inexistente "${cid}" no cluster "${id}"`).toBe(true);
      }
      for (const lane of CLUSTERS[id].lanes) {
        expect(lane.courseIds.length).toBeGreaterThan(0);
        for (const cid of lane.courseIds) {
          expect(valid.has(cid), `curso inexistente "${cid}" no caminho "${lane.id}"`).toBe(true);
        }
      }
    }
  });
  it('a união dos 2 caminhos é igual ao courseIds do cluster', () => {
    for (const id of CLUSTER_IDS) {
      const c = CLUSTERS[id];
      const union = [...c.lanes[0].courseIds, ...c.lanes[1].courseIds].sort();
      expect(union).toEqual([...c.courseIds].sort());
    }
  });
  it('cada cluster tem ao menos 6 cursos', () => {
    for (const id of CLUSTER_IDS) {
      expect(getClusterCourses(id).length).toBe(CLUSTERS[id].courseIds.length);
      expect(getClusterCourses(id).length).toBeGreaterThanOrEqual(PAIRS_PER_GAME);
    }
  });
});

describe('selectGameCourses', () => {
  it('devolve exatamente 6 cursos para qualquer caminho', () => {
    for (const id of CLUSTER_IDS) {
      for (const lane of CLUSTERS[id].lanes) {
        expect(selectGameCourses(CLUSTERS[id], lane.id, identity)).toHaveLength(PAIRS_PER_GAME);
      }
    }
  });
  it('prioriza os cursos do caminho quando o caminho tem >= 6', () => {
    const eng = CLUSTERS.criar.lanes.find((l) => l.id === 'engenharia')!;
    const selected = selectGameCourses(CLUSTERS.criar, 'engenharia', identity).map((c) => c.id);
    for (const cid of selected) {
      expect(eng.courseIds).toContain(cid);
    }
  });
  it('completa com o resto do cluster quando o caminho tem < 6', () => {
    const selected = selectGameCourses(CLUSTERS.saber, 'exatas', identity).map((c) => c.id);
    expect(selected).toHaveLength(6);
    expect(selected).toContain('matematica');
    expect(selected).toContain('biologia');
  });
  it('todos os ids retornados existem em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const c of selectGameCourses(CLUSTERS.desenvolver, 'software', identity)) {
      expect(valid.has(c.id)).toBe(true);
    }
  });
});
