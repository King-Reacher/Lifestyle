import { describe, expect, it } from 'vitest';
import { calculate, checkLine, close } from './calc';
import { allLessons, COURSES } from './courses';
import { buildLesson, isTeach } from './engine';
import { checkStep, hasWorking, parseWorking, regenerate, sample, stepsFor } from './steps';
import type { Exercise } from './types';

const everyExercise = (seeds: number) => {
  const out: Exercise[] = [];
  for (const { course } of COURSES)
    for (const lesson of allLessons(course))
      for (let seed = 1; seed <= seeds; seed++) for (const ex of buildLesson(lesson, seed)) if (!isTeach(ex) && (seed === 1 || ex.id.includes('#'))) out.push(ex);
  return out;
};

describe('notebook calculator', () => {
  it('reads maths the way lessons write it', () => {
    expect(calculate('2 × 3 + 4')).toBe(10);
    expect(calculate('(37 − 7) ÷ 6')).toBe(5);
    expect(calculate('7² + 24²')).toBe(625);
    expect(calculate('22/7 × 7 × 7')).toBeCloseTo(154);
    expect(calculate('½ × 4 × 4²')).toBe(32);
    expect(calculate('−12 ÷ (−3)')).toBe(4);
    expect(calculate('2√9')).toBe(6);
    expect(calculate('15% × 60')).toBeCloseTo(9);
    expect(calculate('1,500 + 1')).toBe(1501);
    expect(calculate('3x + 2')).toBeNull();
    expect(calculate('hello')).toBeNull();
  });

  it('checks a line of working and says which part is wrong', () => {
    expect(checkLine('25² − 24² = 625 − 576 = 49')).toMatchObject({ kind: 'check', ok: true });
    const bad = checkLine('625 − 576 = 59');
    expect(bad.ok).toBe(false);
    expect(bad.text).toContain('49');
    expect(checkLine('3/4 + 1/2')).toMatchObject({ kind: 'value', text: '= 1.25  (5/4)' });
    expect(checkLine('Notes about the question')).toMatchObject({ kind: 'note' });
  });
});

describe('worked steps', () => {
  const all = everyExercise(40);

  it('turns working into steps with blanks', () => {
    const steps = parseWorking(['V = IR = 2 × 6 = 12 V. So the voltage is 12 V.']);
    expect(steps[0]).toMatchObject({ ask: 'V = IR = 2 × 6 = ? V', answer: '12', unit: 'V' });
    expect(steps[1].answer).toBeUndefined();
  });

  it('every blank accepts its own answer, with or without the unit, and rejects a wrong one', () => {
    for (const ex of all)
      for (const st of stepsFor(ex)) {
        if (st.answer === undefined) continue;
        const where = `${ex.id}: ${st.ask}`;
        expect(checkStep(st, st.answer), where).toBe(true);
        if (st.unit) expect(checkStep(st, `${st.answer} ${st.unit}`), where).toBe(true);
        expect(checkStep(st, `${st.answer}1`), where).toBe(false);
      }
  });

  it('every "a = b" in every worked solution is true arithmetic', () => {
    let checked = 0;
    for (const ex of all)
      for (const line of [ex.explain, ...(ex.steps ?? [])])
        for (const clause of line.split(/[.;:,](?=\s)|\s(?:so|and|then|Or)\s/)) {
          // Sides with different units ("1 min = 60 s") are conversions, not arithmetic.
          const sides = clause.split(' = ').map((s) => {
            const m = s.trim().match(/^(.*?)(?:\s+([a-zA-Zμ°%Ω²³/]+))?$/)!;
            return { expr: m[1], unit: m[2] ?? '' };
          });
          for (let i = 1; i < sides.length; i++) {
            if (sides[i - 1].unit && sides[i].unit && sides[i - 1].unit !== sides[i].unit) continue;
            const [a, b] = [calculate(sides[i - 1].expr), calculate(sides[i].expr)];
            if (a === null || b === null) continue;
            checked++;
            expect(close(a, b), `${ex.id}: "${clause.trim()}"`).toBe(true);
          }
        }
    expect(checked).toBeGreaterThan(1000);
  });

  it('almost every generated question type has working to copy', () => {
    const kinds = new Map<string, boolean>();
    for (const ex of all) if (ex.id.includes('#')) kinds.set(ex.id.split('#')[0], (kinds.get(ex.id.split('#')[0]) ?? false) || hasWorking(stepsFor(ex)));
    const without = [...kinds].filter(([, w]) => !w).map(([k]) => k);
    expect(without.length / kinds.size, without.join(', ')).toBeLessThan(0.1);
    for (const k of ['m8-inequality', 'm12-diff', 'm12-integrate', 'm11-median', 'm11-mode', 'm11-bag', 'p8-decay', 'c5-formula', 'c5-name', 'm1-hcf']) expect(kinds.get(k), k).toBe(true);
  });

  it('"your turn" gives the same kind of question with new numbers', () => {
    const seen = new Set<string>();
    for (const ex of all) {
      const kind = ex.id.split('#')[0];
      if (!ex.id.includes('#') || seen.has(kind)) continue;
      seen.add(kind);
      const fresh = regenerate(ex, 99);
      expect(fresh, kind).not.toBeNull();
      expect(fresh!.id.split('#')[0], kind).toBe(kind);
      expect(sample(kind, 5)?.id.split('#')[0], kind).toBe(kind);
    }
    expect(seen.size).toBeGreaterThan(100);
  });
});
