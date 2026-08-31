import { describe, it, expect } from 'vitest';
import { CLUSTERS, CLUSTER_IDS, getClusterCourses, getGameCourses } from './clusters';
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
  it('só o cluster "criar" tem P2 (2 caminhos); os demais não', () => {
    for (const id of CLUSTER_IDS) {
      if (id === 'criar') {
        expect(CLUSTERS[id].lanes).toHaveLength(2);
      } else {
        expect(CLUSTERS[id].lanes).toBeUndefined();
      }
    }
  });
  it('no "criar", a união dos 2 caminhos é igual ao courseIds', () => {
    const c = CLUSTERS.criar;
    const union = [...c.lanes![0].courseIds, ...c.lanes![1].courseIds].sort();
    expect(union).toEqual([...c.courseIds].sort());
  });
  it('contagem de cursos por cluster (tabuleiro variável)', () => {
    expect(getClusterCourses('saber')).toHaveLength(6);
    expect(getClusterCourses('cuidar')).toHaveLength(9);
    expect(getClusterCourses('criar')).toHaveLength(13);
    expect(getClusterCourses('analisar')).toHaveLength(9);
    expect(getClusterCourses('liderar')).toHaveLength(4);
    expect(getClusterCourses('desenvolver')).toHaveLength(8);
  });
});

describe('getGameCourses', () => {
  it('nos clusters sem P2, usa todos os cursos do cluster', () => {
    expect(getGameCourses(CLUSTERS.liderar)).toHaveLength(4);
    expect(getGameCourses(CLUSTERS.cuidar)).toHaveLength(9);
  });
  it('no "criar", usa os cursos do lado escolhido', () => {
    expect(getGameCourses(CLUSTERS.criar, 'engenharias')).toHaveLength(6);
    expect(getGameCourses(CLUSTERS.criar, 'criatividade')).toHaveLength(7);
  });
  it('no "criar" sem lado, usa o cluster inteiro (fallback)', () => {
    expect(getGameCourses(CLUSTERS.criar)).toHaveLength(13);
  });
  it('todos os ids retornados existem em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const c of getGameCourses(CLUSTERS.criar, 'criatividade')) {
      expect(valid.has(c.id)).toBe(true);
    }
  });
});
