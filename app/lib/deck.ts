import { COURSES, type Course } from '../data/courses';

export interface BoardCard {
  id: number;
  course: Course;
  isFlipped: boolean;
  isMatched: boolean;
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function buildDeck(
  pairs: number,
  courses: Course[] = COURSES,
  shuffleFn: <T>(a: T[]) => T[] = shuffle,
): BoardCard[] {
  const selected = shuffleFn(courses).slice(0, pairs);
  const doubled = [...selected, ...selected];
  return shuffleFn(doubled).map((course, index) => ({
    id: index,
    course,
    isFlipped: false,
    isMatched: false,
  }));
}
