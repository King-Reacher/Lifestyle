import type { Who } from '../../components/Character';
import type { Course, Lesson } from '../types';
import { ACADEMY } from './academy';
import { BIOLOGY } from './biology';
import { CHEMISTRY } from './chemistry';
import { ENGLISH } from './english';
import { MATHS } from './maths';
import { PHYSICS } from './physics';

export interface CourseInfo {
  course: Course;
  who: Who;
  /** JAMB subjects can appear in mock exams. */
  jamb: boolean;
}

export const COURSES: CourseInfo[] = [
  { course: MATHS, who: 'mei', jamb: true },
  { course: ENGLISH, who: 'maddie', jamb: true },
  { course: PHYSICS, who: 'greta', jamb: true },
  { course: CHEMISTRY, who: 'greta', jamb: true },
  { course: BIOLOGY, who: 'priya', jamb: true },
  { course: ACADEMY, who: 'zara', jamb: false },
];

export const courseById = (id: string) => COURSES.find((c) => c.course.id === id)?.course ?? MATHS;

export function allLessons(course: Course): Lesson[] {
  return course.units.flatMap((u) => u.lessons);
}

export { ACADEMY, BIOLOGY, CHEMISTRY, ENGLISH, MATHS, PHYSICS };
