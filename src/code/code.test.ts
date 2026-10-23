import { describe, expect, it } from 'vitest';
import { CODING } from '../learn/courses';
import { allLessons } from '../learn/courses';
import type { CodeEx } from '../learn/types';
import { CHALLENGES, outputOk, scaffold } from './challenges';
import { suggest, tokenize } from './complete';
import { evaluate, passed } from './runner';

const codeExercises = allLessons(CODING).flatMap((l) => l.exercises.filter((e): e is CodeEx => typeof e !== 'function' && e.kind === 'code'));

describe('code runner', () => {
  it('captures console output', () => {
    expect(evaluate('console.log("hi"); console.log(1 + 2, [1, 2]);').output).toEqual(['hi', '3 [1,2]']);
  });

  it('evaluates checks in the same scope as the code', () => {
    const r = evaluate('function sq(n) { return n * n; }', [{ call: 'sq(3)', expect: 9 }, { call: 'sq(2)', expect: 5 }]);
    expect(r.results.map((x) => x.ok)).toEqual([true, false]);
  });

  it('reports syntax and runtime errors instead of crashing', () => {
    expect(evaluate('let x = ;').error).toMatch(/SyntaxError/);
    expect(evaluate('missing();').error).toMatch(/ReferenceError/);
    expect(passed(evaluate('missing();'))).toBe(false);
  });

  it('a throwing check fails without breaking the others', () => {
    const r = evaluate('function f() { throw new Error("boom"); }', [{ call: 'f()', expect: 1 }, { call: '1 + 1', expect: 2 }]);
    expect(r.results.map((x) => x.ok)).toEqual([false, true]);
  });

  it('compares expected output line by line', () => {
    expect(passed(evaluate('console.log(1); console.log(2);'), ['1', '2'])).toBe(true);
    expect(passed(evaluate('console.log(1);'), ['1', '2'])).toBe(false);
  });
});

describe('coding course', () => {
  it('has code exercises to practise', () => {
    expect(codeExercises.length).toBeGreaterThanOrEqual(15);
  });

  for (const ex of codeExercises) {
    it(`${ex.id}: the solution passes and the starter does not`, () => {
      const good = evaluate(ex.solution, ex.checks);
      expect(good.error, ex.solution).toBeUndefined();
      expect(passed(good, ex.output), JSON.stringify(good)).toBe(true);
      expect(passed(evaluate(ex.starter, ex.checks), ex.output)).toBe(false);
    });

    it(`${ex.id}: following the ghost text from the starter rebuilds the solution`, () => {
      // Simulate a learner who clears the starter and keeps accepting suggestions, pressing Enter at line ends.
      let text = '';
      for (let step = 0; step < 200; step++) {
        const ghost = suggest(text, text.length, ex.solution);
        if (!ghost) {
          if (text.replace(/\s/g, '') === ex.solution.replace(/\s/g, '')) break;
          text += '\n';
          continue;
        }
        text += ghost;
      }
      expect(text.replace(/\s/g, '')).toBe(ex.solution.replace(/\s/g, ''));
      expect(passed(evaluate(text, ex.checks), ex.output)).toBe(true);
    });
  }
});

describe('ghost suggestions', () => {
  const solution = 'function square(n) {\n  return n * n;\n}';

  it('guides with the rest of the line from the model solution', () => {
    expect(suggest('func', 4, solution)).toBe('tion square(n) {');
    expect(suggest('function square(n) {\n  ', 22, solution)).toBe('return n * n;');
  });

  it('keeps guiding when the starter has hint comments', () => {
    // On the comment line itself nothing is suggested (it would be commented out); on the next line the guide continues.
    const onComment = 'function square(n) {\n  // your code here';
    expect(suggest(onComment, onComment.length, solution)).toBe('');
    const nextLine = `${onComment}\n  `;
    expect(suggest(nextLine, nextLine.length, solution)).toBe('return n * n;');
    expect(suggest('// Print it\n', 12, 'console.log(1);')).toBe('console.log(1);');
  });

  it('ignores spacing differences while guiding', () => {
    const typed = 'function  square( n ){\n';
    expect(suggest(typed, typed.length, solution)).toBe('return n * n;');
  });

  it('falls back to keywords, snippets, methods and your own names', () => {
    expect(suggest('con', 3)).toBe('sole.log(');
    expect(suggest('const total = 0;\nto', 19)).toBe('tal');
    expect(suggest('arr.pu', 6)).toBe('sh(');
    expect(suggest('for', 3)).toBe(' (let i = 0; i < 10; i++) {');
  });

  it('stays quiet in the middle of a line', () => {
    expect(suggest('con x', 3)).toBe('');
  });

  it('colours keywords, strings, numbers and comments', () => {
    const kinds = tokenize('const x = "a"; // hi\nlog(5)').map((t) => t.kind);
    expect(kinds).toEqual(expect.arrayContaining(['kw', 'str', 'com', 'fn', 'num']));
  });
});

describe('invent challenges', () => {
  // Reference solutions live only in tests, so the app never shows a model answer for these.
  const REFERENCE: Record<string, string> = {
    tip: 'function tip(bill, percent) { return bill * percent / 100; }',
    grade: 'function letter(s) { if (s >= 70) return "A"; if (s >= 60) return "B"; if (s >= 50) return "C"; if (s >= 45) return "D"; return "F"; }',
    table: 'for (let i = 1; i <= 10; i++) console.log(`7 x ${i} = ${7 * i}`);',
    weeks: 'function weeksToGoal(goal, perWeek) { return Math.ceil(goal / perWeek); }',
    password: 'function isStrong(p) { return p.length >= 8 && /[0-9]/.test(p); }',
    words: 'function countWords(t) { return t.split(" ").filter((w) => w !== "").length; }',
    aggregate: 'function canApply(scores, cutoff) { let total = 0; for (const s of scores) total += s; return total >= cutoff && scores.every((s) => s >= 40); }',
    fizz: 'for (let i = 1; i <= 15; i++) console.log(i % 15 === 0 ? "FizzBuzz" : i % 3 === 0 ? "Fizz" : i % 5 === 0 ? "Buzz" : i);',
  };

  for (const c of CHALLENGES) {
    it(`${c.id}: a correct solution passes, an empty one fails`, () => {
      const good = evaluate(REFERENCE[c.id], c.checks);
      expect(passed(good) && outputOk(good.output, c.outputMatches), JSON.stringify(good)).toBe(true);
      const empty = evaluate('// nothing yet', c.checks);
      expect(passed(empty) && outputOk(empty.output, c.outputMatches)).toBe(false);
    });
  }

  it('a different but valid approach passes too', () => {
    const loopVersion = 'function weeksToGoal(goal, perWeek) { let saved = 0, weeks = 0; while (saved < goal) { saved += perWeek; weeks++; } return weeks; }';
    const c = CHALLENGES.find((x) => x.id === 'weeks')!;
    expect(passed(evaluate(loopVersion, c.checks))).toBe(true);
  });

  it('gives a planning outline for your own idea', () => {
    expect(scaffold('days until JAMB')).toMatch(/My idea: days until JAMB[\s\S]*What goes in/);
  });
});
