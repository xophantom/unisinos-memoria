import { describe, it, expect } from 'vitest';
import { QUESTION_1, getQuestion2 } from './quiz';
import { CLUSTER_IDS, CLUSTERS } from './clusters';

describe('QUESTION_1', () => {
  it('tem uma opção por cluster, com label/emoji/sublabel', () => {
    expect(QUESTION_1.options).toHaveLength(CLUSTER_IDS.length);
    for (const o of QUESTION_1.options) {
      expect(o.label).toBeTruthy();
      expect(o.emoji).toBeTruthy();
      expect(o.sublabel).toBeTruthy();
      expect(CLUSTER_IDS).toContain(o.id);
    }
  });
});

describe('getQuestion2', () => {
  it('devolve os 2 caminhos do cluster escolhido', () => {
    for (const id of CLUSTER_IDS) {
      const q = getQuestion2(id);
      expect(q.options.map((o) => o.id)).toEqual(CLUSTERS[id].lanes.map((l) => l.id));
      for (const o of q.options) {
        expect(o.label).toBeTruthy();
        expect(o.emoji).toBeTruthy();
      }
    }
  });
});
