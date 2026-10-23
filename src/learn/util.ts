import type { ChoiceEx, Rng } from './types';

/** Small, fast seeded RNG (mulberry32), so a lesson can be replayed with the same numbers. */
export function seeded(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));

export const pickOne = <T>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];

export function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};

export const lcm = (a: number, b: number) => Math.abs(a * b) / gcd(a, b);

export function simplify(n: number, d: number): [number, number] {
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d) || 1;
  return [n / g, d / g];
}

/** Show a number with a real minus sign. */
export const num = (n: number) => (n < 0 ? `−${Math.abs(n)}` : String(n));

/** Show a fraction in lowest terms; whole numbers lose the "/1". */
export function frac(n: number, d: number): string {
  const [a, b] = simplify(n, d);
  return b === 1 ? num(a) : `${num(a)}/${b}`;
}

/** Wrap negatives in brackets inside expressions: 3 − (−4). */
export const br = (n: number) => (n < 0 ? `(${num(n)})` : String(n));

/**
 * Build a multiple-choice exercise from the right answer and some wrong ones.
 * Duplicates of the answer and of each other are dropped.
 */
export function choice(rng: Rng, base: Omit<ChoiceEx, 'kind' | 'options' | 'answer'>, right: string, wrong: string[]): ChoiceEx {
  const distinct = [...new Set(wrong.filter((w) => w !== right))].slice(0, 3);
  const options = shuffle(rng, [right, ...distinct]);
  return { ...base, kind: 'choice', options, answer: options.indexOf(right) };
}

/** Normalise typed answers: spaces, unicode minus, thousands separators, currency. */
export function normalise(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, '-')
    .replace(/[₦,%]/g, '')
    .replace(/\s+/g, ' ');
}

/** Parse "3", "-3", "0.75", "3/4", "1 1/2" into an exact fraction [n, d]. */
export function parseRational(input: string): [number, number] | null {
  const s = normalise(input);
  let m = s.match(/^(-?)(\d+) (\d+)\/(\d+)$/);
  if (m) {
    const [, sign, w, n, d] = m;
    if (+d === 0) return null;
    const v = +w * +d + +n;
    return [sign ? -v : v, +d];
  }
  m = s.match(/^(-?\d+)\/(-?\d+)$/);
  if (m) return +m[2] === 0 ? null : [+m[1], +m[2]];
  m = s.match(/^-?\d+(\.\d+)?$/);
  if (m) {
    const places = m[1] ? m[1].length - 1 : 0;
    const d = 10 ** places;
    return [Math.round(parseFloat(s) * d), d];
  }
  return null;
}
