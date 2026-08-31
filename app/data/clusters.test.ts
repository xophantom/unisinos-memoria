import { describe, it, expect } from 'vitest';
import { CLUSTERS, CLUSTER_IDS, getClusterCourses } from './clusters';
import { COURSES } from './courses';

describe('CLUSTERS', () => {
  it('tem os 6 clusters', () => {
    expect(Object.keys(CLUSTERS).sort()).toEqual([...CLUSTER_IDS].sort());
  });
  it('cada cluster tem label, mission, tagline, emoji e accent sem vermelho', () => {
    for (const id of CLUSTER_IDS) {
      const c = CLUSTERS[id];
      expect(c.label).toBeTruthy();
      expect(c.mission).toBeTruthy();
      expect(c.tagline).toBeTruthy();
      expect(c.emoji).toBeTruthy();
      expect(c.accent).toMatch(/from-/);
      expect(c.accent).not.toMatch(/red|rose|unisinos/);
    }
  });
  it('todo courseId de cluster existe em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const id of CLUSTER_IDS) {
      for (const cid of CLUSTERS[id].courseIds) {
        expect(valid.has(cid), `curso inexistente "${cid}" no cluster "${id}"`).toBe(true);
      }
    }
  });
  it('cada curso do catálogo aparece em exatamente um cluster', () => {
    const assigned = CLUSTER_IDS.flatMap((id) => CLUSTERS[id].courseIds);
    expect(assigned).toHaveLength(COURSES.length);
    expect(new Set(assigned).size).toBe(COURSES.length);
  });
  it('contagem de cursos por cluster (planilha 2027.1, tabuleiro variável)', () => {
    expect(getClusterCourses('saber')).toHaveLength(6);
    expect(getClusterCourses('cuidar')).toHaveLength(9);
    expect(getClusterCourses('criar')).toHaveLength(9);
    expect(getClusterCourses('analisar')).toHaveLength(9);
    expect(getClusterCourses('liderar')).toHaveLength(4);
    expect(getClusterCourses('desenvolver')).toHaveLength(12);
  });
});
