import { describe, it, expect } from 'vitest';
import { QUESTION_1, getQuestion2 } from './quiz';
import { CLUSTER_IDS, CLUSTERS } from './clusters';

describe('QUESTION_1', () => {
  it('tem uma opção por cluster, rotulada pela missão', () => {
    expect(QUESTION_1.options).toHaveLength(CLUSTER_IDS.length);
    for (const o of QUESTION_1.options) {
      expect(CLUSTER_IDS).toContain(o.id);
      expect(o.label).toBe(CLUSTERS[o.id].mission);
      expect(o.emoji).toBeTruthy();
    }
  });
});

describe('getQuestion2', () => {
  it('devolve os 2 caminhos apenas no "criar"', () => {
    const q = getQuestion2('criar');
    expect(q).not.toBeNull();
    expect(q!.options.map((o) => o.id)).toEqual(['engenharias', 'criatividade']);
  });
  it('devolve null nos clusters sem P2', () => {
    for (const id of CLUSTER_IDS) {
      if (id !== 'criar') expect(getQuestion2(id)).toBeNull();
    }
  });
});
