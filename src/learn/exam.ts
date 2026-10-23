import { isTeach, buildLesson } from './engine';
import { allLessons } from './courses';
import type { Course, Exercise } from './types';
import { seeded, shuffle } from './util';

export type ExamFormat = 'quick' | 'jamb' | 'postutme';

export const FORMATS: Record<ExamFormat, { title: string; blurb: string; minutes: number; perSubject: (isEnglish: boolean) => number }> = {
  quick: { title: 'Quick mock', blurb: '10 questions per subject, 20 minutes', minutes: 20, perSubject: () => 10 },
  jamb: { title: 'Full JAMB simulation', blurb: 'English 60, others 40 each, 2 hours, scored out of 400', minutes: 120, perSubject: (e) => (e ? 60 : 40) },
  postutme: { title: 'Post-UTME practice', blurb: 'English 20, others 10 each, 30 minutes, fast and mixed', minutes: 30, perSubject: (e) => (e ? 20 : 10) },
};

export interface ExamQuestion {
  subject: string;
  ex: Exercise;
}

/** Exam-friendly exercises only: multiple choice, true/false and typed answers. */
const examable = (e: Exercise) => e.kind === 'choice' || e.kind === 'truefalse' || e.kind === 'input';

const baseId = (id: string) => id.split('#')[0];

/**
 * Draw up to `count` questions from a course. Hand-written questions appear at
 * most once; generated ones can appear several times with different numbers.
 * Returns fewer than `count` when the bank is too small, rather than repeating.
 */
export function drawQuestions(course: Course, count: number, seed: number): Exercise[] {
  const rng = seeded(seed);
  const picked: Exercise[] = [];
  const seen = new Set<string>();
  const generatedUses = new Map<string, number>();
  for (let round = 0; round < 12 && picked.length < count; round++) {
    const batch = shuffle(
      rng,
      allLessons(course).flatMap((l) => buildLesson(l, seed * 31 + round).filter((i): i is Exercise => !isTeach(i) && examable(i))),
    );
    for (const ex of batch) {
      if (picked.length >= count) break;
      const generated = ex.id.includes('#');
      const key = baseId(ex.id);
      if (!generated && seen.has(key)) continue;
      if (generated && (generatedUses.get(key) ?? 0) >= 4) continue;
      if (seen.has(ex.prompt)) continue;
      seen.add(key);
      seen.add(ex.prompt);
      if (generated) generatedUses.set(key, (generatedUses.get(key) ?? 0) + 1);
      picked.push({ ...ex, id: `${ex.id}~exam${seed}-${picked.length}` });
    }
  }
  return picked;
}

export function buildExam(courses: Course[], format: ExamFormat, seed: number): ExamQuestion[] {
  return courses.flatMap((c, i) =>
    drawQuestions(c, FORMATS[format].perSubject(c.id === 'english'), seed + i * 1000).map((ex) => ({ subject: c.id, ex })),
  );
}

export interface SubjectScore {
  subject: string;
  correct: number;
  total: number;
  /** Out of 100, like a JAMB subject score. */
  score: number;
}

export function scoreExam(questions: ExamQuestion[], results: Record<number, boolean>): { subjects: SubjectScore[]; total: number; max: number } {
  const bySubject = new Map<string, SubjectScore>();
  questions.forEach((q, i) => {
    const s = bySubject.get(q.subject) ?? { subject: q.subject, correct: 0, total: 0, score: 0 };
    s.total++;
    if (results[i]) s.correct++;
    bySubject.set(q.subject, s);
  });
  const subjects = [...bySubject.values()].map((s) => ({ ...s, score: s.total ? Math.round((s.correct / s.total) * 100) : 0 }));
  return { subjects, total: subjects.reduce((a, s) => a + s.score, 0), max: subjects.length * 100 };
}

export interface ExamRecord {
  at: string;
  format: ExamFormat;
  subjects: SubjectScore[];
  total: number;
  max: number;
  minutes: number;
}
