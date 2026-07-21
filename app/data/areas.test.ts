import { describe, it, expect } from 'vitest';
import { AREAS, getAreaCourses, PAIRS_PER_GAME, type AreaId } from './areas';
import { COURSES } from './courses';

const AREA_IDS: AreaId[] = ['tecnologia', 'saude', 'negocios', 'artes', 'ciencias'];

describe('AREAS', () => {
  it('tem as 5 áreas', () => {
    expect(Object.keys(AREAS).sort()).toEqual([...AREA_IDS].sort());
  });
  it('PAIRS_PER_GAME é 6', () => {
    expect(PAIRS_PER_GAME).toBe(6);
  });
  it('cada área tem label, emoji e accent', () => {
    for (const id of AREA_IDS) {
      expect(AREAS[id].label).toBeTruthy();
      expect(AREAS[id].emoji).toBeTruthy();
      expect(AREAS[id].accent).toMatch(/from-/);
    }
  });
  it('todo courseId de toda área existe em COURSES', () => {
    const valid = new Set(COURSES.map((c) => c.id));
    for (const id of AREA_IDS) {
      for (const cid of AREAS[id].courseIds) {
        expect(valid.has(cid), `curso inexistente "${cid}" na área "${id}"`).toBe(true);
      }
    }
  });
  it('getAreaCourses resolve todos os ids e cada área tem ao menos 6 cursos', () => {
    for (const id of AREA_IDS) {
      const courses = getAreaCourses(id);
      expect(courses.length).toBe(AREAS[id].courseIds.length);
      expect(courses.length).toBeGreaterThanOrEqual(PAIRS_PER_GAME);
    }
  });
});
