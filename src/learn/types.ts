import type { Check } from '../code/runner';
import type { Who } from '../components/Character';

/** Which of the three mastery systems (or memory) a tip trains. */
export type TipKind = 'shortcut' | 'eliminate' | 'formula' | 'memory';

export interface Tip {
  kind: TipKind;
  text: string;
}

interface Base {
  id: string;
  prompt: string;
  /** Shown after answering, right or wrong. */
  explain: string;
  tip?: Tip;
  /** Worked solution, one line per step, for the notebook. Defaults to the explanation. */
  steps?: string[];
}

export interface ChoiceEx extends Base {
  kind: 'choice';
  options: string[];
  answer: number;
}

export interface InputEx extends Base {
  kind: 'input';
  /** Accepted answers, compared after normalising spaces and minus signs. */
  answers?: string[];
  /** Or: any input equal to this fraction n/d is accepted. */
  rational?: [number, number];
  /** With `rational`: the fraction must be in lowest terms. */
  lowestTerms?: boolean;
  /** Shown after the input, e.g. "%" or "₦". */
  suffix?: string;
  prefix?: string;
}

export interface TrueFalseEx extends Base {
  kind: 'truefalse';
  answer: boolean;
}

/** Tap tiles into the right order. */
export interface OrderEx extends Base {
  kind: 'order';
  tiles: string[];
}

/** Tap matching pairs. */
export interface MatchEx extends Base {
  kind: 'match';
  pairs: [string, string][];
}

/** Write code that passes checks. `solution` also drives the ghost-text guide. */
export interface CodeEx extends Base {
  kind: 'code';
  starter: string;
  solution: string;
  /** Expected console output, line by line. */
  output?: string[];
  checks?: Check[];
}

export type Exercise = ChoiceEx | InputEx | TrueFalseEx | OrderEx | MatchEx | CodeEx;

/** A teaching card: understand first, then practise. */
export interface Teach {
  kind: 'teach';
  id: string;
  who: Who;
  title: string;
  body: string[];
  example?: string[];
  hook?: Tip;
}

export type Rng = () => number;

/** A fixed exercise, or a generator that makes a fresh one each time. */
export type ExerciseSource = Exercise | ((rng: Rng) => Exercise);

export interface Lesson {
  id: string;
  title: string;
  icon: string;
  teach: Teach[];
  exercises: ExerciseSource[];
}

export interface Unit {
  id: string;
  title: string;
  description: string;
  who: Who;
  color: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  units: Unit[];
  /** Units on the roadmap, shown locked. */
  upcoming: string[];
}
