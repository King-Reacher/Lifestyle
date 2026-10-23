import type { Who } from '../../components/Character';
import type { Course, Lesson, Unit } from '../types';
import { ACADEMY as ACADEMY_BASE } from './academy';
import { ACADEMY_MORE } from './academy-more';
import { BIOLOGY as BIOLOGY_BASE } from './biology';
import { CHEMISTRY as CHEMISTRY_BASE } from './chemistry';
import { CODING as CODING_BASE } from './coding';
import { CODING_MORE } from './coding-more';
import { BIOLOGY_DRILLS, ENGLISH_DRILLS } from './drills';
import { ENGLISH as ENGLISH_BASE } from './english';
import { ENGLISH_MORE } from './english-more';
import { MATHS as MATHS_BASE } from './maths';
import { MATHS_MORE } from './maths-more';
import { PHYSICS as PHYSICS_BASE } from './physics';
import { BIOLOGY_MORE, CHEMISTRY_MORE, PHYSICS_MORE } from './science-more';

/** Later units live in their own files; this puts each course back together. */
const extend = (course: Course, more: Unit[], upcoming: string[]): Course => ({ ...course, units: [...course.units, ...more], upcoming });

export const MATHS = extend(MATHS_BASE, MATHS_MORE, ['Logarithms', 'Surds', 'Sets & Venn diagrams', 'Quadratic equations', 'Inequalities', 'Sequences & series', 'Geometry & mensuration', 'Trigonometry', 'Statistics & probability', 'Calculus basics']);
export const PHYSICS = extend(PHYSICS_BASE, PHYSICS_MORE, ['Heat & temperature', 'Waves & sound', 'Light & optics', 'Electricity', 'Magnetism', 'Modern physics']);
export const CHEMISTRY = extend(CHEMISTRY_BASE, CHEMISTRY_MORE, ['Gas laws', 'Electrolysis', 'Rates & equilibrium', 'Metals & non-metals', 'Organic chemistry']);
export const ENGLISH = extend(ENGLISH_BASE, [...ENGLISH_MORE, ENGLISH_DRILLS], ['Comprehension & summary', 'Oral English: vowels & consonants', 'Stress & intonation', 'Sentence interpretation']);
export const BIOLOGY = extend(BIOLOGY_BASE, [...BIOLOGY_MORE, BIOLOGY_DRILLS], ['Transport in plants', 'Reproduction', 'Genetics & variation', 'Evolution', 'Ecology in depth']);
export const CODING = extend(CODING_BASE, CODING_MORE, ['Strings in depth', 'Data structures: stacks, queues, maps', 'HTML & CSS', 'The DOM & events', 'Git & GitHub', 'React', 'APIs & async', 'Databases & SQL', 'Node.js backends', 'Security & testing']);
export const ACADEMY = extend(ACADEMY_BASE, ACADEMY_MORE, ['Deeper lessons in every school']);

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
  { course: CODING, who: 'zara', jamb: false },
  { course: ACADEMY, who: 'zara', jamb: false },
];

export const courseById = (id: string) => COURSES.find((c) => c.course.id === id)?.course ?? MATHS;

export function allLessons(course: Course): Lesson[] {
  return course.units.flatMap((u) => u.lessons);
}
