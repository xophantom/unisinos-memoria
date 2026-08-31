import { describe, it, expect } from 'vitest';
import { QUESTION_1 } from './quiz';
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
