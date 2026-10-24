import type { Exercise, Rng, Unit } from '../types';
import { choice, frac, int, mc, num, pickOne, simplify, teach, tf } from '../util';
import { sup } from './maths-more';

const SUB = '₀₁₂₃₄₅₆₇₈₉';
/** Base 10 is written as plain "log", as JAMB does. */
const log = (b: number) => (b === 10 ? 'log' : `log${String(b).replace(/\d/g, (d) => SUB[+d])}`);

/* Logarithms */

const logValueGen = (rng: Rng): Exercise => {
  const b = pickOne(rng, [2, 3, 5, 10] as const);
  const k = int(rng, 2, b === 2 ? 6 : 4);
  const n = b ** k;
  return rng() < 0.5
    ? { kind: 'input', id: 'm6-log-value', prompt: `Evaluate ${log(b)} ${n}`, answers: [String(k)], explain: `Ask: ${b} to what power gives ${n}? ${b}${sup(k)} = ${n}, so ${log(b)} ${n} = ${k}.`, tip: { kind: 'shortcut', text: 'A log is just a question: "base to what power gives this number?"' } }
    : { kind: 'input', id: 'm6-log-index', prompt: `If ${b}ˣ = ${n}, find x`, answers: [String(k)], explain: `${b}${sup(k)} = ${n}, so x = ${k}. In log form: x = ${log(b)} ${n}.`, tip: { kind: 'formula', text: '2ˣ = 8 is the same statement as x = log₂ 8.' } };
};

/** Pairs whose product (or quotient) is an exact power of 10. */
const PRODUCTS: [number, number][] = [[2, 5], [4, 25], [20, 5], [25, 40], [8, 125], [50, 2], [250, 4], [200, 50]];
const QUOTIENTS: [number, number][] = [[500, 5], [300, 3], [2000, 2], [700, 7], [80, 8], [4000, 4], [60, 6]];

const logLawsGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const [a, b] = pickOne(rng, PRODUCTS);
    const k = Math.round(Math.log10(a * b));
    return { kind: 'input', id: 'm6-log-add', prompt: `Simplify log ${a} + log ${b}`, answers: [String(k)], explain: `Adding logs multiplies the numbers: log ${a} + log ${b} = log (${a} × ${b}) = log ${a * b} = ${k}.`, tip: { kind: 'formula', text: 'log a + log b = log ab' } };
  }
  const [a, b] = pickOne(rng, QUOTIENTS);
  const k = Math.round(Math.log10(a / b));
  return { kind: 'input', id: 'm6-log-sub', prompt: `Simplify log ${a} − log ${b}`, answers: [String(k)], explain: `Subtracting logs divides the numbers: log ${a} − log ${b} = log (${a} ÷ ${b}) = log ${a / b} = ${k}.`, tip: { kind: 'formula', text: 'log a − log b = log (a/b)' } };
};

const logPowerGen = (rng: Rng): Exercise => {
  const b = pickOne(rng, [2, 3] as const);
  const k = int(rng, 2, 4);
  const p = int(rng, 2, 4);
  const right = String(k * p);
  return choice(rng, { id: 'm6-log-power', prompt: `Evaluate ${log(b)} (${b ** k})${sup(p)}`, explain: `The power comes to the front: ${p} × ${log(b)} ${b ** k} = ${p} × ${k} = ${k * p}.`, tip: { kind: 'formula', text: 'log aⁿ = n log a: the power jumps to the front.' } }, right, [String(k + p), String(k ** p), String(p), String(k * p + 1)]);
};

const logs = {
  id: 'm6-logs',
  title: 'Logarithms',
  icon: '📈',
  teach: [
    teach('m6-log-t1', 'mei', 'A logarithm is a power', [
      '"log base b of n" asks: "b to what power gives n?" So log₂ 8 = 3, because 2³ = 8.',
      'bˣ = n and "x = log base b of n" say the same thing in two ways.',
      'Plain "log" means base 10: log 1000 = 3.',
      'In any base, the log of the base itself is 1 and the log of 1 is 0: log₅ 5 = 1, log₅ 1 = 0.',
    ], { example: ['log₃ 81: 3⁴ = 81, so the answer is 4', 'log 0.01 = −2, because 10⁻² = 0.01'], hook: { kind: 'memory', text: '"Log" is short for "what power?". Say it in your head every time.' } }),
    teach('m6-log-t2', 'mei', 'The three laws', [
      'log a + log b = log ab (adding logs multiplies).',
      'log a − log b = log (a/b) (subtracting logs divides).',
      'log aⁿ = n log a (the power comes to the front).',
      'These are the laws of indices, written backwards.',
    ], { example: ['log 2 + log 5 = log 10 = 1', 'log₂ 8² = 2 × log₂ 8 = 2 × 3 = 6'], hook: { kind: 'formula', text: 'Multiply inside, add outside. Divide inside, subtract outside.' } }),
  ],
  exercises: [
    logValueGen,
    logValueGen,
    tf('m6-log-1', 'log 1 = 0', true, '10⁰ = 1, so log 1 = 0. This is true for every base.'),
    logLawsGen,
    logPowerGen,
    logLawsGen,
    mc('m6-log-2', 'log₅ 5 = ?', ['0', '1', '5', '25'], 1, '5¹ = 5. The log of the base itself is always 1.', { kind: 'shortcut', text: 'The log of the base itself is always 1, no working needed.' }),
    logValueGen,
    logLawsGen,
  ],
};

/* Surds */

const SQUAREFREE = [2, 3, 5, 6, 7] as const;
const root = (k: number, b: number) => (k === 1 ? `√${b}` : `${k}√${b}`);

const simplifySurdGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 6);
  const b = pickOne(rng, SQUAREFREE);
  const n = a * a * b;
  return choice(rng, { id: 'm6-surd-simplify', prompt: `Simplify √${n}`, explain: `Find the biggest square factor: ${n} = ${a * a} × ${b}. √${a * a} = ${a}, so √${n} = ${root(a, b)}.`, tip: { kind: 'shortcut', text: 'Look for square factors: 4, 9, 16, 25, 36. Take the biggest one out.' } }, root(a, b), [root(a * a, b), root(a + 1, b), root(a - 1, b), ...([2, 3, 5, 6].includes(a) ? [root(b, a)] : [])]);
};

const addSurdGen = (rng: Rng): Exercise => {
  const b = pickOne(rng, [2, 3, 5] as const);
  const p = int(rng, 1, 4);
  let q = int(rng, 1, 4);
  if (q === p) q = p === 4 ? 1 : p + 1;
  const show = (k: number) => `√${k * k * b}`;
  return choice(rng, { id: 'm6-surd-add', prompt: `Simplify ${show(p)} + ${show(q)}`, explain: `Simplify each first: ${show(p)} = ${root(p, b)} and ${show(q)} = ${root(q, b)}. Like surds add like terms: ${p} + ${q} = ${p + q}, so ${root(p + q, b)}.`, tip: { kind: 'eliminate', text: '√a + √b is NOT √(a + b). Any option that just adds the numbers under the root is wrong.' } }, root(p + q, b), [`√${p * p * b + q * q * b}`, root(p * q, b), root(Math.abs(p - q), b), root(p + q + 1, b)]);
};

const surds = {
  id: 'm6-surds',
  title: 'Surds',
  icon: '√',
  teach: [
    teach('m6-surd-t1', 'mei', 'Roots that never end', [
      'A surd is a square root that is not a whole number, like √2 or √5. It is irrational.',
      '√(ab) = √a × √b, so √12 = √4 × √3 = 2√3.',
      'Only like surds add: 2√3 + 5√3 = 7√3, but √2 + √3 cannot be simplified.',
      'To rationalise 1/√a, multiply top and bottom by √a: 1/√a = √a/a.',
    ], { example: ['√50 = √25 × √2 = 5√2', '√8 + √18 = 2√2 + 3√2 = 5√2', '1/√3 = √3/3'], hook: { kind: 'memory', text: 'Treat √3 like the letter x: 2x + 5x = 7x, so 2√3 + 5√3 = 7√3.' } }),
  ],
  exercises: [
    simplifySurdGen,
    simplifySurdGen,
    addSurdGen,
    mc('m6-surd-1', 'Rationalise 1/√5', ['√5/5', '5/√5', '1/5', '√5'], 0, 'Multiply top and bottom by √5: √5/(√5 × √5) = √5/5.', { kind: 'formula', text: 'Multiply by the surd over itself; it equals 1, so the value is unchanged.' }),
    tf('m6-surd-2', '√2 + √3 = √5', false, 'Different surds do not add. √2 + √3 ≈ 3.15 but √5 ≈ 2.24.'),
    addSurdGen,
    mc('m6-surd-3', '√3 × √12 = ?', ['√15', '6', '36', '3√2'], 1, '√3 × √12 = √36 = 6.', { kind: 'shortcut', text: 'Multiply under one root first; it often becomes a perfect square.' }),
    simplifySurdGen,
  ],
};

/* Sets */

const vennGen = (rng: Rng): Exercise => {
  const [onlyA, onlyB, both, none] = [int(rng, 3, 15), int(rng, 3, 15), int(rng, 2, 10), int(rng, 0, 8)];
  const [a, b, total] = [onlyA + both, onlyB + both, onlyA + onlyB + both + none];
  const [s1, s2] = pickOne(rng, [['Physics', 'Chemistry'], ['football', 'basketball'], ['rice', 'beans'], ['French', 'Yoruba']] as const);
  if (rng() < 0.5)
    return { kind: 'input', id: 'm6-venn-both', prompt: `In a class of ${total}, ${a} like ${s1}, ${b} like ${s2} and ${none} like neither. How many like both?`, answers: [String(both)], explain: `Those who like at least one: ${total} − ${none} = ${total - none}. Then ${a} + ${b} − both = ${total - none}, so both = ${a + b} − ${total - none} = ${both}.`, tip: { kind: 'formula', text: 'n(A ∪ B) = n(A) + n(B) − n(A ∩ B)' } };
  return { kind: 'input', id: 'm6-venn-none', prompt: `In a class of ${total}, ${a} like ${s1}, ${b} like ${s2} and ${both} like both. How many like neither?`, answers: [String(none)], explain: `At least one: ${a} + ${b} − ${both} = ${a + b - both} (the "both" group was counted twice). Neither: ${total} − ${a + b - both} = ${none}.`, tip: { kind: 'shortcut', text: 'Fill the Venn diagram from the middle out: "both" first, then "only", then outside.' } };
};

const subsetsGen = (rng: Rng): Exercise => {
  const n = int(rng, 2, 6);
  const items = ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, n);
  return { kind: 'input', id: 'm6-subsets', prompt: `How many subsets does {${items.join(', ')}} have?`, answers: [String(2 ** n)], explain: `Each of the ${n} elements is either in or out of a subset: 2${sup(n)} = ${2 ** n}. That includes the empty set and the set itself.`, tip: { kind: 'formula', text: 'A set with n elements has 2ⁿ subsets.' } };
};

const sets = {
  id: 'm6-sets',
  title: 'Sets & Venn diagrams',
  icon: '⭕',
  teach: [
    teach('m6-sets-t1', 'mei', 'Groups of things', [
      'A set is a collection of things, written in curly brackets: {2, 4, 6}.',
      'The union A ∪ B is everything in A or B (or both). The intersection A ∩ B is only what is in both.',
      "The complement A' is everything in the universal set that is not in A.",
      'A subset is a set inside another set. A set with n elements has 2ⁿ subsets.',
    ], { example: ['A = {1, 2, 3}, B = {2, 3, 4}', 'A ∪ B = {1, 2, 3, 4}', 'A ∩ B = {2, 3}'], hook: { kind: 'memory', text: '∪ looks like a cup: it holds everything. ∩ is the narrow overlap.' } }),
    teach('m6-sets-t2', 'mei', 'Solving Venn problems', [
      'Draw two overlapping circles inside a box (the universal set).',
      'Fill the overlap (both) first, then each "only" part, then the outside (neither).',
      'n(A ∪ B) = n(A) + n(B) − n(A ∩ B), because the overlap was counted twice.',
    ], { example: ['30 students: 18 do Physics, 15 do Chemistry, 5 do both', 'At least one: 18 + 15 − 5 = 28', 'Neither: 30 − 28 = 2'] }),
  ],
  exercises: [
    mc('m6-sets-1', 'A = {1, 2, 3, 4}, B = {3, 4, 5}. Find A ∩ B.', ['{1, 2, 3, 4, 5}', '{3, 4}', '{1, 2}', '{5}'], 1, 'The intersection is what is in both: 3 and 4.'),
    mc('m6-sets-2', 'A = {1, 2, 3, 4}, B = {3, 4, 5}. Find A ∪ B.', ['{1, 2, 3, 4, 5}', '{3, 4}', '{1, 2, 5}', '{1, 2, 3, 3, 4, 4, 5}'], 0, 'The union is everything in either set, each listed once.', { kind: 'eliminate', text: 'A set never lists an element twice, so the option with repeats is out.' }),
    vennGen,
    subsetsGen,
    vennGen,
    tf('m6-sets-3', 'The empty set is a subset of every set.', true, 'The empty set { } has nothing that is outside any set.'),
    vennGen,
  ],
};

/* Quadratic equations */

/** "x² − 5x + 6", skipping zero terms and coefficients of 1. */
function quad(a: number, b: number, c: number): string {
  const lead = a === 1 ? 'x²' : `${a}x²`;
  const mid = b === 0 ? '' : ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`}`;
  const end = c === 0 ? '' : ` ${c < 0 ? '−' : '+'} ${Math.abs(c)}`;
  return `${lead}${mid}${end}`;
}

const roots = (r: number, s: number) => {
  const [lo, hi] = [Math.min(r, s), Math.max(r, s)];
  return lo === hi ? `x = ${num(lo)} (twice)` : `x = ${num(lo)} or x = ${num(hi)}`;
};

const nonZero = (rng: Rng, lo: number, hi: number) => {
  const n = int(rng, lo, hi);
  return n === 0 ? hi : n;
};

const factoriseGen = (rng: Rng): Exercise => {
  const r = nonZero(rng, -7, 7);
  let s = nonZero(rng, -7, 7);
  if (s === r) s = r === 7 ? -7 : r + 1 || 1;
  const [b, c] = [-(r + s), r * s];
  const bracket = (k: number) => `(x ${k > 0 ? '−' : '+'} ${Math.abs(k)})`;
  return choice(rng, { id: 'm7-factorise', prompt: `Solve ${quad(1, b, c)} = 0`, explain: `Find two numbers that multiply to ${num(c)} and add to ${num(b)}: ${num(-r)} and ${num(-s)}. So ${bracket(r)}${bracket(s)} = 0, giving ${roots(r, s)}.`, tip: { kind: 'eliminate', text: 'Put each option back into the equation. Or check: the roots must add to −b and multiply to c.' } }, roots(r, s), [roots(-r, -s), roots(r, -s), roots(-r, s), roots(r + 1, s)]);
};

const sumProductGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 5);
  const b = nonZero(rng, -12, 12);
  const c = nonZero(rng, -12, 12);
  const sum = rng() < 0.5;
  const [n, d] = simplify(sum ? -b : c, a);
  return {
    kind: 'input',
    id: sum ? 'm7-sum' : 'm7-product',
    prompt: `For ${quad(a, b, c)} = 0, find the ${sum ? 'sum' : 'product'} of the roots`,
    rational: [n, d],
    explain: `${sum ? 'Sum' : 'Product'} of roots = ${sum ? '−b/a' : 'c/a'} = ${num(sum ? -b : c)}/${a}${d === a ? '' : ` = ${frac(n, d)}`}.`,
    tip: { kind: 'formula', text: 'For ax² + bx + c = 0: sum = −b/a, product = c/a. No need to find the roots.' },
  };
};

const NATURE = ['two real and distinct roots', 'two equal roots', 'no real roots'];

const discriminantGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 2);
  let a = 1;
  let b: number;
  let c: number;
  if (kind === 1) {
    const k = nonZero(rng, -6, 6);
    [b, c] = [2 * k, k * k];
  } else if (kind === 0) {
    a = int(rng, 1, 3);
    b = nonZero(rng, -9, 9);
    c = -int(rng, 1, 10);
  } else {
    a = int(rng, 1, 3);
    b = int(rng, -3, 3);
    c = int(rng, b * b + 1, b * b + 9);
  }
  const d = b * b - 4 * a * c;
  return { kind: 'choice', id: 'm7-discriminant', prompt: `How many real roots does ${quad(a, b, c)} = 0 have?`, options: NATURE, answer: kind, explain: `b² − 4ac = ${b * b} − ${4 * a * c < 0 ? `(${num(4 * a * c)})` : 4 * a * c} = ${num(d)}. ${d > 0 ? 'Positive: two real, distinct roots.' : d === 0 ? 'Zero: two equal roots.' : 'Negative: no real roots.'}`, tip: { kind: 'shortcut', text: 'Only the sign of b² − 4ac matters: +, 0 or −.' } };
};

const quadratics = {
  id: 'm7-quadratics',
  title: 'Solving quadratics',
  icon: '✖️',
  teach: [
    teach('m7-quad-t1', 'mei', 'Factorise, then split', [
      'A quadratic equation looks like ax² + bx + c = 0.',
      'When a = 1, find two numbers that multiply to c and add to b. Then write (x + p)(x + q) = 0.',
      'If two things multiply to 0, one of them is 0. So x = −p or x = −q.',
      'If it will not factorise, use the formula: x = (−b ± √(b² − 4ac)) / 2a.',
    ], { example: ['x² − 5x + 6 = 0', 'Multiply to 6, add to −5: −2 and −3', '(x − 2)(x − 3) = 0, so x = 2 or x = 3'], hook: { kind: 'formula', text: 'Check every answer by putting it back in. It takes five seconds and catches sign slips.' } }),
  ],
  exercises: [factoriseGen, factoriseGen, tf('m7-quad-1', 'If (x − 4)(x + 1) = 0 then x = 4 or x = −1.', true, 'Each bracket can be 0: x − 4 = 0 or x + 1 = 0.'), factoriseGen, factoriseGen, factoriseGen],
};

const roots2 = {
  id: 'm7-roots',
  title: 'Sum, product & nature of roots',
  icon: '🎯',
  teach: [
    teach('m7-roots-t1', 'mei', 'Facts about roots without solving', [
      'For ax² + bx + c = 0: the sum of the roots is −b/a and the product is c/a.',
      'The discriminant b² − 4ac tells you the nature of the roots.',
      'Positive: two real, distinct roots. Zero: two equal roots. Negative: no real roots.',
      'If you know the roots α and β, the equation is x² − (α + β)x + αβ = 0.',
    ], { example: ['2x² − 6x + 3 = 0: sum = 6/2 = 3, product = 3/2', 'x² + 4x + 4: b² − 4ac = 16 − 16 = 0, equal roots'], hook: { kind: 'memory', text: 'Sum has the minus ("−b/a"), product does not ("c/a").' } }),
  ],
  exercises: [
    sumProductGen,
    discriminantGen,
    sumProductGen,
    mc('m7-roots-1', 'Which equation has roots 2 and 5?', ['x² + 7x + 10 = 0', 'x² − 7x + 10 = 0', 'x² − 7x − 10 = 0', 'x² + 3x − 10 = 0'], 1, 'x² − (2 + 5)x + 2 × 5 = x² − 7x + 10.', { kind: 'formula', text: 'x² − (sum)x + (product) = 0' }),
    discriminantGen,
    sumProductGen,
    discriminantGen,
  ],
};

export const MATHS_NEXT: Unit[] = [
  { id: 'm-u6', title: 'Logs, surds & sets', description: 'Logarithms, surds, sets and Venn diagrams', who: 'mei', color: '#22c55e', lessons: [logs, surds, sets] },
  { id: 'm-u7', title: 'Quadratic equations', description: 'Factorising, sum and product of roots, the discriminant', who: 'mei', color: '#8b5cf6', lessons: [quadratics, roots2] },
];
