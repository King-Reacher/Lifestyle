import { calculate, close } from './calc';
import { allLessons, COURSES } from './courses';
import type { Exercise, Lesson } from './types';
import { normalise, parseRational, seeded } from './util';

/**
 * One line of a worked solution. When it ends in a number, `ask` is the same
 * line with that number blanked out, so the learner can work it out too.
 */
export interface Step {
  text: string;
  ask?: string;
  answer?: string;
  unit?: string;
}

const VALUE = /^(₦)?(−?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\/\d+)?)\s*([a-zA-Zμ°%Ω²³]+(?:\/[a-zA-Z²³]+)?)?$/;
const CONNECTOR = /^(so|then|giving|which gives|and)\s+/i;

/** Splits "value unit" at the end of a working line; null if it is not a plain number. */
function valueOf(segment: string): { answer: string; unit?: string; prefix?: string } | null {
  const clean = segment.replace(/\s*\([^)]*\)\s*$/, '').replace(/[.!]+$/, '').trim();
  const m = clean.match(VALUE);
  return m ? { answer: m[2].replace(/,/g, ''), unit: m[3], prefix: m[1] } : null;
}

function stepOf(clause: string): Step {
  const trimmed = clause.trim();
  // Capitalise words like "so", but never a variable such as y or f.
  const text = /^[a-z]{2,}/.test(trimmed) ? trimmed[0].toUpperCase() + trimmed.slice(1) : trimmed;
  const core = text.replace(CONNECTOR, '').replace(/[.!]+$/, '');
  const blank = (head: string, sep: string, v: NonNullable<ReturnType<typeof valueOf>>): Step => ({
    text,
    ask: `${head}${sep}${v.prefix ?? ''}?${v.unit ? ` ${v.unit}` : ''}`,
    answer: v.answer,
    unit: v.unit,
  });

  const eq = core.split(' = ');
  if (eq.length > 1) {
    const v = valueOf(eq[eq.length - 1]);
    // "x = 3" alone has nothing to work out; it is the answer, so it still gets a blank.
    const head = eq.slice(0, -1).join(' = ');
    // "(x − 3)(x + 7) = 0" states a fact to use, not a sum to work out.
    if (v && !(v.answer === '0' && /x/.test(head))) return blank(head, ' = ', v);
    return { text };
  }
  const arrow = core.split(' → ');
  if (arrow.length > 1) {
    const v = valueOf(arrow[arrow.length - 1]);
    if (v) return blank(arrow.slice(0, -1).join(' → '), ' → ', v);
  }
  const colon = core.match(/^(.*?):\s*([^:]+)$/);
  if (colon) {
    const v = valueOf(colon[2]);
    if (v && /[a-z]/i.test(colon[1])) return blank(colon[1], ': ', v);
  }
  return { text };
}

/** Breaks working text into steps: one per sentence, and one per "so"/"then" clause. */
export function parseWorking(lines: string[]): Step[] {
  const out: Step[] = [];
  for (const line of lines)
    for (const sentence of line.split(/(?<=[.!?])\s+(?=[A-Z0-9(−"√∫'])/))
      for (const clause of sentence.split(/;\s+|,\s+(?=(?:so|giving)\s)/)) if (clause.trim()) out.push(stepOf(clause));
  return out;
}

/** The worked steps for an exercise: hand-written ones when it has them, otherwise its explanation. */
export const stepsFor = (ex: Exercise): Step[] => parseWorking(ex.steps ?? [ex.explain]);

export const hasWorking = (steps: Step[]) => steps.some((s) => s.answer !== undefined);

/** Accepts the number in any sensible form: 0.5, 1/2, −3, with or without the unit. */
export function checkStep(step: Step, typed: string): boolean {
  if (step.answer === undefined) return true;
  let t = normalise(typed);
  if (step.unit) t = t.replace(new RegExp(`\\s*${step.unit.toLowerCase().replace(/[/^$.*+?()[\]{}|\\]/g, '\\$&')}$`), '');
  if (!t) return false;
  const want = parseRational(step.answer);
  const got = parseRational(t) ?? (() => {
    const v = calculate(t);
    return v === null ? null : ([v, 1] as [number, number]);
  })();
  if (want && got) return close(want[0] / want[1], got[0] / got[1]);
  return normalise(step.answer) === t;
}

/* Fresh numbers for "your turn" */

const baseId = (ex: Exercise) => ex.id.split('#')[0];

let sources: Map<string, { lesson: Lesson; index: number }[]> | null = null;

/** Which generator makes which kind of question, found by running each one a few times. */
function sourceMap() {
  if (sources) return sources;
  sources = new Map();
  for (const { course } of COURSES)
    for (const lesson of allLessons(course))
      lesson.exercises.forEach((src, index) => {
        if (typeof src !== 'function') return;
        for (let seed = 1; seed <= 40; seed++) {
          const id = src(seeded(seed * 7919 + index)).id;
          const list = sources!.get(id) ?? [];
          if (!list.some((s) => s.lesson === lesson && s.index === index)) list.push({ lesson, index });
          sources!.set(id, list);
        }
      });
  return sources;
}

export const isGenerated = (ex: Exercise) => sourceMap().has(baseId(ex));

/** The same kind of question with new numbers, or null for a fixed question. */
export function regenerate(ex: Exercise, seed: number): Exercise | null {
  const list = sourceMap().get(baseId(ex));
  if (!list) return null;
  const { lesson, index } = list[0];
  const src = lesson.exercises[index] as (rng: () => number) => Exercise;
  for (let i = 0; i < 300; i++) {
    const fresh = src(seeded(seed + i * 104729));
    if (fresh.id === baseId(ex) && fresh.prompt !== ex.prompt) return { ...fresh, id: `${fresh.id}#nb${seed + i}` };
  }
  return null;
}

/** The lesson a question comes from, so practice can be offered by topic. */
export function lessonOf(ex: Exercise): Lesson | undefined {
  const fromGen = sourceMap().get(baseId(ex))?.[0]?.lesson;
  if (fromGen) return fromGen;
  for (const { course } of COURSES) for (const l of allLessons(course)) if (l.exercises.some((e) => typeof e !== 'function' && e.id === ex.id)) return l;
  return undefined;
}

/** Generators in a lesson whose questions have working to copy, for the notebook's practice list. */
export function practiceKinds(lesson: Lesson): string[] {
  const kinds = new Set<string>();
  lesson.exercises.forEach((src, index) => {
    if (typeof src !== 'function') return;
    for (let seed = 1; seed <= 12; seed++) {
      const ex = src(seeded(seed * 31 + index));
      if (hasWorking(stepsFor(ex))) kinds.add(ex.id);
    }
  });
  return [...kinds];
}

/** A fresh question of one kind, for practice from the notebook. */
export function sample(kind: string, seed: number): Exercise | null {
  const list = sourceMap().get(kind);
  if (!list) return null;
  const { lesson, index } = list[0];
  const src = lesson.exercises[index] as (rng: () => number) => Exercise;
  for (let i = 0; i < 300; i++) {
    const ex = src(seeded(seed + i * 7907));
    if (ex.id === kind) return { ...ex, id: `${kind}#nb${seed + i}` };
  }
  return null;
}
