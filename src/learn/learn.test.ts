import { describe, expect, it } from 'vitest';
import { addDays } from '../lib/dates';
import { parseData } from '../lib/storage';
import {
  accuracy,
  answer,
  buildLesson,
  checkInput,
  correctAnswer,
  dueReviews,
  emptyLearn,
  isFailed,
  isFinished,
  isTeach,
  lessonStatus,
  nextLesson,
  penalty,
  recordLesson,
  reviewResult,
  startSession,
  studyStreak,
  xpFor,
} from './engine';
import { allLessons, MATHS } from './maths';
import type { Exercise, InputEx } from './types';
import { gcd, parseRational } from './util';

const DAY = '2026-10-23';

describe('maths content', () => {
  const lessons = allLessons(MATHS);

  it('has unique lesson ids and something to teach in every lesson', () => {
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    for (const l of lessons) {
      expect(l.teach.length, l.id).toBeGreaterThan(0);
      expect(l.exercises.length, l.id).toBeGreaterThanOrEqual(5);
    }
  });

  // Generators make different numbers every time, so check many seeds.
  it('every exercise is well-formed and its own answer is accepted (200 seeds)', () => {
    for (const lesson of lessons) {
      for (let seed = 1; seed <= 200; seed++) {
        const exercises = buildLesson(lesson, seed).filter((i): i is Exercise => !isTeach(i));
        for (const ex of exercises) {
          const where = `${lesson.id} ${ex.id} seed ${seed}: ${ex.prompt}`;
          expect(ex.explain.length, where).toBeGreaterThan(5);
          if (ex.kind === 'choice') {
            expect(ex.options.length, where).toBeGreaterThanOrEqual(3);
            expect(new Set(ex.options).size, where).toBe(ex.options.length);
            expect(ex.answer, where).toBeGreaterThanOrEqual(0);
            expect(ex.answer, where).toBeLessThan(ex.options.length);
          }
          if (ex.kind === 'input') {
            const shown = correctAnswer(ex).replace(ex.prefix ?? '', '').replace(ex.suffix ?? '', '');
            expect(checkInput(ex, shown), where).toBe(true);
            if (ex.rational) {
              expect(Number.isInteger(ex.rational[0]) && Number.isInteger(ex.rational[1]), where).toBe(true);
              if (ex.lowestTerms) expect(gcd(ex.rational[0], ex.rational[1]), where).toBe(1);
            }
          }
          if (ex.kind === 'match') {
            expect(new Set(ex.pairs.map((p) => p[0])).size, where).toBe(ex.pairs.length);
            expect(new Set(ex.pairs.map((p) => p[1])).size, where).toBe(ex.pairs.length);
          }
          if (ex.kind === 'order') expect(new Set(ex.tiles).size, where).toBe(ex.tiles.length);
        }
      }
    }
  });

  it('generated answers are mathematically right (spot checks)', () => {
    const neg = lessons.find((l) => l.id === 'm1-neg')!;
    for (let seed = 1; seed <= 50; seed++) {
      for (const ex of buildLesson(neg, seed)) {
        if (ex.kind !== 'input') continue;
        // Evaluate "a + (b)" / "a − (−b)" prompts independently.
        const expr = ex.prompt.replace(' = ?', '').replace(/−/g, '-');
        const value = Function(`return (${expr})`)();
        expect(String(value), ex.prompt).toBe(ex.answers![0]);
      }
    }
  });
});

describe('answer checking', () => {
  const half: InputEx = { kind: 'input', id: 'x', prompt: '', explain: '', rational: [1, 2], lowestTerms: true };

  it('accepts equal values in any sensible form', () => {
    expect(checkInput(half, '1/2')).toBe(true);
    expect(checkInput(half, '0.5')).toBe(true);
    expect(checkInput(half, ' 1/2 ')).toBe(true);
  });

  it('rejects unsimplified fractions when lowest terms are required', () => {
    expect(checkInput(half, '2/4')).toBe(false);
    expect(checkInput({ ...half, lowestTerms: false }, '2/4')).toBe(true);
  });

  it('handles mixed numbers and negatives', () => {
    const ex: InputEx = { kind: 'input', id: 'x', prompt: '', explain: '', rational: [-7, 2] };
    expect(checkInput(ex, '−3 1/2')).toBe(true);
    expect(checkInput(ex, '-7/2')).toBe(true);
    expect(checkInput(ex, '3 1/2')).toBe(false);
    expect(parseRational('1 1/2')).toEqual([3, 2]);
    expect(parseRational('abc')).toBeNull();
    expect(parseRational('1/0')).toBeNull();
  });

  it('matches plain answers ignoring unicode minus and currency', () => {
    const ex: InputEx = { kind: 'input', id: 'x', prompt: '', explain: '', answers: ['-4'] };
    expect(checkInput(ex, '−4')).toBe(true);
    expect(checkInput(ex, '4')).toBe(false);
    expect(checkInput({ ...ex, answers: ['1150'] }, '₦1,150')).toBe(true);
  });
});

describe('lesson session', () => {
  const lesson = allLessons(MATHS)[0];
  const items = buildLesson(lesson, 1);
  const graded = items.filter((i) => !isTeach(i)).length;

  it('wrong answers cost a heart and come back at the end', () => {
    let s = startSession(items);
    for (let i = 0; i < lesson.teach.length; i++) s = answer(s, true);
    const first = s.queue[s.index];
    s = answer(s, false);
    expect(s.hearts).toBe(4);
    expect(s.queue[s.queue.length - 1]).toBe(first);
    while (!isFinished(s)) s = answer(s, true);
    expect(s.mistakes).toHaveLength(1);
    expect(accuracy(s)).toBeCloseTo((graded - 1) / graded);
    expect(xpFor(s)).toBe(10);
  });

  it('a perfect lesson earns the bonus', () => {
    let s = startSession(items);
    while (!isFinished(s)) s = answer(s, true);
    expect(xpFor(s)).toBe(15);
    expect(accuracy(s)).toBe(1);
  });

  it('fails when hearts run out', () => {
    let s = startSession(items);
    for (let i = 0; i < 5; i++) s = penalty(s);
    expect(isFailed(s)).toBe(true);
  });
});

describe('progress and spaced repetition', () => {
  it('unlocks lessons strictly in order', () => {
    const first = allLessons(MATHS)[0];
    let state = emptyLearn();
    expect(nextLesson(MATHS, state)?.id).toBe(first.id);
    let s = startSession(buildLesson(first, 1));
    while (!isFinished(s)) s = answer(s, true);
    state = recordLesson(state, first.id, s, DAY);
    const status = lessonStatus(MATHS, state);
    expect(status.get(first.id)).toBe('done');
    expect(status.get(allLessons(MATHS)[1].id)).toBe('current');
    expect(status.get(allLessons(MATHS)[2].id)).toBe('locked');
    expect(studyStreak(state, DAY)).toBe(1);
    expect(state.xpByDay[DAY]).toBe(15);
  });

  it('mistakes come back tomorrow and climb the boxes until retired', () => {
    const ex: Exercise = { kind: 'truefalse', id: 'q', prompt: '', explain: '', answer: true };
    let review = recordLesson(emptyLearn(), 'l', { ...startSession([ex]), mistakes: [ex] }, DAY).review;
    expect(dueReviews(review, DAY)).toHaveLength(0);
    let day = addDays(DAY, 1);
    expect(dueReviews(review, day)).toHaveLength(1);
    for (let box = 1; box <= 5; box++) {
      review = reviewResult(review, 'q', true, day);
      if (review.length) day = review[0].due;
    }
    expect(review).toHaveLength(0);
  });

  it('a wrong review drops back to box 1', () => {
    const ex: Exercise = { kind: 'truefalse', id: 'q', prompt: '', explain: '', answer: true };
    const review = reviewResult([{ ex, box: 4, due: DAY }], 'q', false, DAY);
    expect(review[0]).toMatchObject({ box: 1, due: addDays(DAY, 1) });
  });

  it('old backups without learning data still load', () => {
    const d = parseData(JSON.stringify({ version: 1, entries: [], createdAt: DAY }));
    expect(d?.learn).toEqual(emptyLearn());
  });
});
