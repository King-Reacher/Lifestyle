import { addDays, diffDays, type ISODate } from '../lib/dates';
import type { ExamRecord } from './exam';
import type { Course, Exercise, InputEx, Lesson, Teach } from './types';
import { gcd, normalise, parseRational, seeded } from './util';

export const HEARTS = 5;
export const LESSON_XP = 10;
export const PERFECT_BONUS = 5;
export const DAILY_GOAL = 30;

export type Item = Teach | Exercise;

export const isTeach = (i: Item): i is Teach => i.kind === 'teach';

/** Turn a lesson into a playable list: teaching cards first, then fresh exercises. */
export function buildLesson(lesson: Lesson, seed: number): Item[] {
  const rng = seeded(seed);
  const exercises = lesson.exercises.map((src, i) => {
    const ex = typeof src === 'function' ? src(rng) : src;
    // Generated exercises get unique ids so review can tell them apart.
    return typeof src === 'function' ? { ...ex, id: `${ex.id}#${seed}-${i}` } : ex;
  });
  return [...lesson.teach, ...exercises];
}

export function checkInput(ex: InputEx, input: string): boolean {
  const typed = normalise(input);
  if (!typed) return false;
  if (ex.answers?.some((a) => normalise(a) === typed)) return true;
  if (ex.rational) {
    const r = parseRational(input);
    if (!r) return false;
    const [n, d] = ex.rational;
    if (r[0] * d !== n * r[1]) return false;
    // "Lowest terms" only matters when the answer was typed as a fraction.
    if (ex.lowestTerms && typed.includes('/')) {
      const parts = typed.split(' ');
      const [fn, fd] = parts[parts.length - 1].split('/').map(Number);
      return gcd(fn, fd) === 1 && Math.abs(fd) !== 1;
    }
    return true;
  }
  return false;
}

/** The answer to show when someone gets it wrong. */
export function correctAnswer(ex: Exercise): string {
  switch (ex.kind) {
    case 'choice':
      return ex.options[ex.answer];
    case 'input': {
      const raw = ex.answers?.[0] ?? (ex.rational![1] === 1 ? String(ex.rational![0]) : `${ex.rational![0]}/${ex.rational![1]}`);
      return `${ex.prefix ?? ''}${raw.replace(/^-/, '−')}${ex.suffix ?? ''}`;
    }
    case 'truefalse':
      return ex.answer ? 'True' : 'False';
    case 'order':
      return ex.tiles.join(' → ');
    case 'match':
      return ex.pairs.map(([a, b]) => `${a} = ${b}`).join(', ');
    case 'code':
      return ex.solution;
  }
}

// Session

export interface Session {
  queue: Item[];
  index: number;
  hearts: number;
  /** Exercises answered wrong at least once, for review later. */
  mistakes: Exercise[];
  /** Exercise ids answered right on the first try. */
  firstTry: string[];
  graded: number;
  startedAt: number;
}

export function startSession(items: Item[], now = Date.now()): Session {
  return {
    queue: items,
    index: 0,
    hearts: HEARTS,
    mistakes: [],
    firstTry: [],
    graded: items.filter((i) => !isTeach(i)).length,
    startedAt: now,
  };
}

export const current = (s: Session): Item | undefined => s.queue[s.index];
export const isFinished = (s: Session) => s.index >= s.queue.length;
export const isFailed = (s: Session) => s.hearts <= 0;
export const progress = (s: Session) => (s.queue.length ? s.index / s.queue.length : 1);

/**
 * Record an answer and move on. A wrong answer costs a heart and the same
 * exercise comes back at the end, until it's answered right.
 */
export function answer(s: Session, correct: boolean): Session {
  const item = current(s);
  if (!item || isTeach(item)) return { ...s, index: s.index + 1 };
  const seenWrong = s.mistakes.some((m) => m.id === item.id);
  if (correct) {
    return { ...s, index: s.index + 1, firstTry: seenWrong ? s.firstTry : [...s.firstTry, item.id] };
  }
  return {
    ...s,
    index: s.index + 1,
    hearts: s.hearts - 1,
    queue: [...s.queue, item],
    mistakes: seenWrong ? s.mistakes : [...s.mistakes, item],
  };
}

/** A wrong tap inside a match exercise: costs a heart, but you stay on it. */
export function penalty(s: Session): Session {
  const item = current(s);
  const add = item && !isTeach(item) && !s.mistakes.some((m) => m.id === item.id) ? [item] : [];
  return { ...s, hearts: s.hearts - 1, mistakes: [...s.mistakes, ...add] };
}

export function accuracy(s: Session): number {
  return s.graded ? s.firstTry.length / s.graded : 1;
}

export function xpFor(s: Session): number {
  return LESSON_XP + (s.mistakes.length === 0 ? PERFECT_BONUS : 0);
}

// Progress and spaced repetition

export interface ReviewItem {
  ex: Exercise;
  /** Leitner box 1 to 5. Higher means better known and reviewed less often. */
  box: number;
  due: ISODate;
}

export interface LessonRecord {
  times: number;
  bestAccuracy: number;
  lastAt: string;
}

export interface LearnState {
  lessons: Record<string, LessonRecord>;
  xpByDay: Record<ISODate, number>;
  review: ReviewItem[];
  exams: ExamRecord[];
}

export const emptyLearn = (): LearnState => ({ lessons: {}, xpByDay: {}, review: [], exams: [] });

/** Days until the next review, by box. */
const INTERVALS = [0, 1, 2, 4, 7, 15];

export function addMistakes(review: ReviewItem[], mistakes: Exercise[], day: ISODate): ReviewItem[] {
  const ids = new Set(mistakes.map((m) => m.id));
  return [...review.filter((r) => !ids.has(r.ex.id)), ...mistakes.map((ex) => ({ ex, box: 1, due: addDays(day, 1) }))];
}

/** Move a reviewed item up a box when right (retired after box 5), back to box 1 when wrong. */
export function reviewResult(review: ReviewItem[], id: string, correct: boolean, day: ISODate): ReviewItem[] {
  return review.flatMap((r) => {
    if (r.ex.id !== id) return [r];
    if (!correct) return [{ ...r, box: 1, due: addDays(day, 1) }];
    const box = r.box + 1;
    return box > 5 ? [] : [{ ...r, box, due: addDays(day, INTERVALS[box]) }];
  });
}

export const dueReviews = (review: ReviewItem[], day: ISODate) => review.filter((r) => diffDays(r.due, day) >= 0);

export function recordLesson(state: LearnState, lessonId: string, s: Session, day: ISODate, at = new Date().toISOString()): LearnState {
  const prev = state.lessons[lessonId];
  return {
    ...state,
    lessons: {
      ...state.lessons,
      [lessonId]: { times: (prev?.times ?? 0) + 1, bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy(s)), lastAt: at },
    },
    xpByDay: { ...state.xpByDay, [day]: (state.xpByDay[day] ?? 0) + xpFor(s) },
    review: addMistakes(state.review, s.mistakes, day),
  };
}

/** Consecutive days with XP earned; today only counts once you've studied. */
export function studyStreak(state: LearnState, day: ISODate): number {
  const has = (d: ISODate) => (state.xpByDay[d] ?? 0) > 0;
  let d = has(day) ? day : addDays(day, -1);
  let n = 0;
  while (has(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

/** Lessons unlock strictly in order: the next one opens when the previous is done. */
export function lessonStatus(course: Course, state: LearnState): Map<string, 'done' | 'current' | 'locked'> {
  const out = new Map<string, 'done' | 'current' | 'locked'>();
  let foundCurrent = false;
  for (const unit of course.units) {
    for (const l of unit.lessons) {
      if (state.lessons[l.id]) out.set(l.id, 'done');
      else if (!foundCurrent) {
        out.set(l.id, 'current');
        foundCurrent = true;
      } else out.set(l.id, 'locked');
    }
  }
  return out;
}

export function nextLesson(course: Course, state: LearnState): Lesson | undefined {
  const status = lessonStatus(course, state);
  return course.units.flatMap((u) => u.lessons).find((l) => status.get(l.id) === 'current');
}
