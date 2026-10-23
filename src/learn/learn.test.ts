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
  flagCard,
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
import { config, groupPeriod, molarMass } from './courses/chemistry';
import { allLessons, BIOLOGY, CHEMISTRY, COURSES, ENGLISH, MATHS, PHYSICS } from './courses';
import { buildExam, drawQuestions, scoreExam } from './exam';
import { coverage, keyIdeas, termsIn } from './glossary';
import type { Exercise, InputEx } from './types';
import { gcd, parseRational } from './util';

const DAY = '2026-10-23';

describe('course content', () => {
  const everyLesson = COURSES.flatMap(({ course }) => allLessons(course));

  it('has unique lesson ids across all courses and something to teach in every lesson', () => {
    expect(new Set(everyLesson.map((l) => l.id)).size).toBe(everyLesson.length);
    for (const l of everyLesson) {
      expect(l.teach.length, l.id).toBeGreaterThan(0);
      expect(l.exercises.length, l.id).toBeGreaterThanOrEqual(3);
    }
  });

  // Generators make different numbers every time, so check many seeds.
  for (const { course } of COURSES) {
    it(`${course.title}: every exercise is well-formed and its own answer is accepted (200 seeds)`, () => {
      for (const lesson of allLessons(course)) {
        for (let seed = 1; seed <= 200; seed++) {
          const exercises = buildLesson(lesson, seed).filter((i): i is Exercise => !isTeach(i));
          for (const ex of exercises) {
            const where = `${lesson.id} ${ex.id} seed ${seed}: ${ex.prompt}`;
            expect(ex.explain.length, where).toBeGreaterThan(5);
            // Catch broken template values; coding lessons talk about undefined on purpose.
            if (course.id !== 'coding') {
              expect(ex.prompt, where).not.toMatch(/\bNaN\b|undefined|Infinity/);
              expect(ex.explain, where).not.toMatch(/\bNaN\b|undefined|Infinity/);
            }
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
  }

  it('generated maths answers are right (independent check)', () => {
    const neg = allLessons(MATHS).find((l) => l.id === 'm1-neg')!;
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

describe('chemistry facts', () => {
  it('fills electron shells 2, 8, 8, 2 and sums to Z', () => {
    expect(config(11)).toEqual([2, 8, 1]);
    expect(config(17)).toEqual([2, 8, 7]);
    expect(config(20)).toEqual([2, 8, 8, 2]);
    for (let z = 1; z <= 20; z++) expect(config(z).reduce((a, b) => a + b, 0)).toBe(z);
  });

  it('places elements in the right group and period', () => {
    expect(groupPeriod(11)).toEqual({ group: '1', period: 3 });
    expect(groupPeriod(17)).toEqual({ group: '7', period: 3 });
    expect(groupPeriod(2)).toEqual({ group: '0', period: 1 });
    expect(groupPeriod(18)).toEqual({ group: '0', period: 3 });
    expect(groupPeriod(20)).toEqual({ group: '2', period: 4 });
  });

  it('computes molar masses from atomic masses', () => {
    expect(molarMass({ H: 2, O: 1 })).toBe(18);
    expect(molarMass({ Na: 1, Cl: 1 })).toBe(58.5);
    expect(molarMass({ Ca: 1, C: 1, O: 3 })).toBe(100);
    expect(molarMass({ H: 2, S: 1, O: 4 })).toBe(98);
  });
});

describe('mock exams', () => {
  it('builds a quick mock with 10 questions per subject, all examable', () => {
    const qs = buildExam([ENGLISH, MATHS, PHYSICS, CHEMISTRY], 'quick', 42);
    for (const s of ['english', 'maths', 'physics', 'chemistry']) expect(qs.filter((q) => q.subject === s)).toHaveLength(10);
    expect(qs.every((q) => ['choice', 'truefalse', 'input'].includes(q.ex.kind))).toBe(true);
    expect(new Set(qs.map((q) => q.ex.id)).size).toBe(qs.length);
  });

  it('never repeats a hand-written question, even when the bank is smaller than asked', () => {
    const english = drawQuestions(ENGLISH, 60, 7);
    expect(english.length).toBeLessThanOrEqual(60);
    expect(new Set(english.map((e) => e.prompt)).size).toBe(english.length);
  });

  it('fills a complete full-JAMB paper in every subject without repeating a question', () => {
    for (const course of [ENGLISH, MATHS, PHYSICS, CHEMISTRY, BIOLOGY]) {
      const want = course.id === 'english' ? 60 : 40;
      const qs = drawQuestions(course, want, 11);
      expect(qs, course.id).toHaveLength(want);
      expect(new Set(qs.map((q) => q.prompt)).size, course.id).toBe(want);
    }
  });

  it('fills a full JAMB maths paper with generated questions', () => {
    expect(drawQuestions(MATHS, 40, 3)).toHaveLength(40);
  });

  it('scores each subject out of 100 and totals out of 400', () => {
    const qs = buildExam([ENGLISH, MATHS, PHYSICS, CHEMISTRY], 'quick', 1);
    const results = Object.fromEntries(qs.map((q, i) => [i, q.subject !== 'physics']));
    const s = scoreExam(qs, results);
    expect(s.max).toBe(400);
    expect(s.total).toBe(300);
    expect(s.subjects.find((x) => x.subject === 'physics')?.score).toBe(0);
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

describe('do you understand?', () => {
  it('finds hard words in an explanation, without false matches inside other words', () => {
    const terms = termsIn('The numerator sits over the denominator. A molecule is not a mole.').map((t) => t.term);
    expect(terms).toEqual(expect.arrayContaining(['numerator', 'denominator', 'mole']));
    expect(termsIn('molecules everywhere').map((t) => t.term)).not.toContain('mole');
  });

  it('prefers the longer term when one contains another', () => {
    const terms = termsIn('the atomic number tells you the protons').map((t) => t.term);
    expect(terms).toContain('atomic number');
  });

  it('checks which key ideas an explanation covers', () => {
    const ideas = keyIdeas('A vector has magnitude and direction. Velocity is a vector; speed is a scalar.');
    expect(ideas).toEqual(expect.arrayContaining(['vector', 'magnitude', 'scalar']));
    const { covered, missing } = coverage(['vector', 'magnitude', 'direction'], 'vectors have a size (magnitude) and a direction');
    expect(covered).toEqual(['vector', 'magnitude', 'direction']);
    expect(missing).toEqual([]);
    expect(coverage(['vector', 'direction'], 'it is about size').missing).toEqual(['vector', 'direction']);
  });

  it('every teaching card has words the dictionary can explain, or a hook or example', () => {
    for (const { course } of COURSES)
      for (const lesson of allLessons(course))
        for (const card of lesson.teach) {
          const text = [card.title, ...card.body].join(' ');
          expect(termsIn(text).length > 0 || !!card.hook || !!card.example, card.id).toBe(true);
        }
  });

  it('flags a card once, keeping the latest note', () => {
    const card = allLessons(MATHS)[0].teach[0];
    let s = flagCard(emptyLearn(), card, 'first');
    s = flagCard(s, card, 'second');
    expect(s.flagged).toHaveLength(1);
    expect(s.flagged[0].note).toBe('second');
  });
});
