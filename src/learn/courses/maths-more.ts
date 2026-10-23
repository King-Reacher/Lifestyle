import type { Exercise, Rng, Unit } from '../types';
import { choice, int, mc, num, pickOne, teach, tf } from '../util';

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
/** Superscript an integer exponent, e.g. 3 → ³, −2 → ⁻². */
export const sup = (n: number) => (n < 0 ? '⁻' : '') + String(Math.abs(n)).replace(/\d/g, (d) => SUP[+d]);

/* Number bases */

const toBaseGen = (rng: Rng): Exercise => {
  const b = pickOne(rng, [2, 5, 8] as const);
  const n = int(rng, 6, b === 2 ? 40 : 150);
  const digits = n.toString(b);
  const working = digits
    .split('')
    .map((d, i) => `${d}×${b}${sup(digits.length - 1 - i)}`)
    .join(' + ');
  return rng() < 0.5
    ? { kind: 'input', id: 'm4-from-base', prompt: `Convert ${digits}₍${b}₎ to base 10`, answers: [String(n)], explain: `${working} = ${n}.`, tip: { kind: 'shortcut', text: 'Multiply each digit by its place value (powers of the base) and add.' } }
    : choice(rng, { id: 'm4-to-base', prompt: `Write ${n} (base 10) in base ${b}`, explain: `Divide by ${b} repeatedly and read the remainders from the bottom up: ${digits}₍${b}₎. Check: ${working} = ${n}.`, tip: { kind: 'eliminate', text: `A base-${b} number can only use digits 0 to ${b - 1}. Any option with a bigger digit is out.` } }, digits, [(n + 1).toString(b), (n - 1).toString(b), (n + b).toString(b), n.toString(b === 2 ? 8 : 2)]);
};

const bases = {
  id: 'm4-bases',
  title: 'Number bases',
  icon: '🔢',
  teach: [
    teach('m4-bases-t1', 'mei', 'Counting in other bases', [
      'Base 10 uses the digits 0 to 9 and place values 1, 10, 100, …',
      'Base b uses the digits 0 to b − 1 and place values 1, b, b², b³, …',
      'Base b to base 10: multiply each digit by its place value and add.',
      'Base 10 to base b: divide by b again and again; the remainders, read from the bottom up, are the digits.',
    ], { example: ['213₍₅₎ = 2×25 + 1×5 + 3×1 = 58', '13 in base 2: 13÷2 = 6 r1, 6÷2 = 3 r0, 3÷2 = 1 r1, 1÷2 = 0 r1 → 1101₍₂₎'], hook: { kind: 'memory', text: 'Digits in base b never reach b. Base 5 has no 5, base 8 has no 8 or 9.' } }),
  ],
  exercises: [toBaseGen, mc('m4-bases-1', 'Which is NOT a valid base-5 number?', ['1234', '4401', '3150', '2030'], 2, 'Base 5 only uses digits 0 to 4. 3150 contains a 5.', { kind: 'eliminate', text: 'Look for any digit equal to or bigger than the base.' }), toBaseGen, tf('m4-bases-2', '101₍₂₎ equals 5 in base 10.', true, '1×4 + 0×2 + 1×1 = 5.'), toBaseGen, toBaseGen],
};

/* Indices */

const lawsGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 7);
  // m − n is at least 2, so no answer simplifies to a bare first power.
  const m = int(rng, 3, 8);
  const n = int(rng, 1, m - 2);
  const kind = pickOne(rng, ['mul', 'div', 'pow'] as const);
  const spec = {
    mul: { q: `${a}${sup(m)} × ${a}${sup(n)}`, e: m + n, how: `Same base, multiply: add the powers, ${m} + ${n} = ${m + n}.` },
    div: { q: `${a}${sup(m)} ÷ ${a}${sup(n)}`, e: m - n, how: `Same base, divide: subtract the powers, ${m} − ${n} = ${m - n}.` },
    pow: { q: `(${a}${sup(m)})${sup(n)}`, e: m * n, how: `Power of a power: multiply the powers, ${m} × ${n} = ${m * n}.` },
  }[kind];
  const right = `${a}${sup(spec.e)}`;
  return choice(rng, { id: 'm4-laws', prompt: `Simplify ${spec.q}`, explain: spec.how, tip: { kind: 'formula', text: 'aᵐ × aⁿ = aᵐ⁺ⁿ,  aᵐ ÷ aⁿ = aᵐ⁻ⁿ,  (aᵐ)ⁿ = aᵐⁿ' } }, right, [`${a}${sup(m * n)}`, `${a}${sup(m + n)}`, `${a}${sup(Math.abs(m - n))}`, `${a * a}${sup(spec.e)}`, `${a}${sup(spec.e + 1)}`]);
};

/** Bases that are perfect powers, so fractional indices give whole answers. */
const FRACTIONAL: { base: number; root: number; den: number }[] = [
  { base: 8, root: 2, den: 3 },
  { base: 27, root: 3, den: 3 },
  { base: 16, root: 2, den: 4 },
  { base: 81, root: 3, den: 4 },
  { base: 25, root: 5, den: 2 },
  { base: 64, root: 4, den: 3 },
  { base: 32, root: 2, den: 5 },
  { base: 125, root: 5, den: 3 },
];

const fractionalGen = (rng: Rng): Exercise => {
  const f = pickOne(rng, FRACTIONAL);
  const p = int(rng, 1, 3);
  const value = f.root ** p;
  return {
    kind: 'input',
    id: 'm4-frac-index',
    prompt: `Evaluate ${f.base}^(${p}/${f.den})`,
    answers: [String(value)],
    explain: `The bottom of the fraction is the root, the top is the power: the ${f.den === 2 ? 'square' : f.den === 3 ? 'cube' : `${f.den}th`} root of ${f.base} is ${f.root}, then ${f.root}${sup(p)} = ${value}.`,
    tip: { kind: 'shortcut', text: 'Root first, then power: the numbers stay small.' },
  };
};

const negativeGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 6);
  const n = int(rng, 1, 3);
  return { kind: 'input', id: 'm4-neg-index', prompt: `Evaluate ${a}${sup(-n)} (as a fraction)`, rational: [1, a ** n], lowestTerms: true, explain: `A negative power means "one over": ${a}${sup(-n)} = 1/${a}${sup(n)} = 1/${a ** n}.` };
};

const indices = {
  id: 'm4-indices',
  title: 'Laws of indices',
  icon: '⚡',
  teach: [
    teach('m4-ind-t1', 'mei', 'Powers have rules', [
      'aᵐ × aⁿ = aᵐ⁺ⁿ (same base: add the powers).',
      'aᵐ ÷ aⁿ = aᵐ⁻ⁿ (subtract).',
      '(aᵐ)ⁿ = aᵐⁿ (multiply).',
      'a⁰ = 1 for any a that is not 0.',
      'a⁻ⁿ = 1/aⁿ (negative means "one over").',
      'a^(1/n) is the nth root of a; a^(m/n) is that root raised to the power m.',
    ], { example: ['2³ × 2⁴ = 2⁷ = 128', '8^(2/3) = (cube root of 8)² = 2² = 4', '5⁻² = 1/25'], hook: { kind: 'memory', text: 'For a fractional power, think "the bottom is the root, the top is the power".' } }),
  ],
  exercises: [lawsGen, fractionalGen, negativeGen, tf('m4-ind-1', '7⁰ = 0', false, 'Any non-zero number to the power 0 is 1.'), lawsGen, fractionalGen, negativeGen],
};

/* Standard form */

const standardGen = (rng: Rng): Exercise => {
  const mant = int(rng, 11, 99);
  const p = int(rng, 3, 7);
  const big = rng() < 0.6;
  const value = big ? String(mant * 10 ** (p - 1)) : `0.${'0'.repeat(p - 1)}${mant}`;
  const a = `${Math.floor(mant / 10)}.${mant % 10}`;
  // 0.00ab has p − 1 zeros after the point, so the first digit sits in place p: power −p.
  const e = big ? p : -p;
  const right = `${a} × 10${sup(e)}`;
  return choice(rng, { id: 'm4-standard', prompt: `Write ${value} in standard form`, explain: `Move the point until one non-zero digit is in front: ${a}. You moved it ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} ${big ? 'left, so the power is positive' : 'right, so the power is negative'}: ${right}.`, tip: { kind: 'eliminate', text: 'Big numbers have positive powers, tiny decimals have negative powers. That removes half the options.' } }, right, [`${a} × 10${sup(-e)}`, `${a} × 10${sup(e + 1)}`, `${mant} × 10${sup(e - 1)}`, `${a} × 10${sup(e - 1)}`]);
};

const standard = {
  id: 'm4-standard',
  title: 'Standard form',
  icon: '🔬',
  teach: [
    teach('m4-std-t1', 'mei', 'Huge and tiny numbers, written neatly', [
      'Standard form is A × 10ⁿ, where A is at least 1 and less than 10.',
      'Big numbers: count how many places the point moves left; that is a positive n.',
      'Small decimals: count how many places it moves right; that is a negative n.',
    ], { example: ['45 000 = 4.5 × 10⁴', '0.0036 = 3.6 × 10⁻³'] }),
  ],
  exercises: [standardGen, standardGen, mc('m4-std-1', 'Which is in correct standard form?', ['45 × 10³', '0.45 × 10⁵', '4.5 × 10⁴', '450 × 10²'], 2, 'A must be between 1 and 10: only 4.5 qualifies.'), standardGen, standardGen],
};

/* Algebra */

const likeTermsGen = (rng: Rng): Exercise => {
  const [a, b, c, d] = [int(rng, 2, 9), int(rng, 1, 9), int(rng, 1, 9), int(rng, 1, 9)];
  const x = a - c;
  const y = b + d;
  const coef = (k: number, v: string) => (Math.abs(k) === 1 ? v : `${Math.abs(k)}${v}`);
  const term = (k: number, v: string) => (k === 0 ? '' : `${k < 0 ? '−' : ''}${coef(k, v)}`);
  // Joins terms with proper signs: "13x − 6y", never "13x + −6y".
  const expr = (p: number, q: number) => {
    if (!p && !q) return '0';
    if (!p) return term(q, 'y');
    if (!q) return term(p, 'x');
    return `${term(p, 'x')} ${q < 0 ? '−' : '+'} ${coef(q, 'y')}`;
  };
  const right = expr(x, y);
  return choice(rng, { id: 'm5-like', prompt: `Simplify ${coef(a, 'x')} + ${coef(b, 'y')} − ${coef(c, 'x')} + ${coef(d, 'y')}`, explain: `Collect x terms: ${coef(a, 'x')} − ${coef(c, 'x')} = ${term(x, 'x') || '0'}. Collect y terms: ${coef(b, 'y')} + ${coef(d, 'y')} = ${coef(y, 'y')}. Answer: ${right}.`, tip: { kind: 'memory', text: 'Only like terms combine: x with x, y with y. Carry each sign with the term after it.' } }, right, [expr(a + c, y), expr(x, b - d), expr(a + c, b - d), `${x + y}xy`]);
};

const linearGen = (rng: Rng): Exercise => {
  const x = int(rng, -9, 9);
  const a = int(rng, 2, 9);
  const b = int(rng, -12, 12) || 5;
  const c = a * x + b;
  return {
    kind: 'input',
    id: 'm5-linear',
    prompt: `Solve ${a}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${num(c)}`,
    answers: [String(x)],
    explain: `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${a}x = ${num(c - b)}. Divide both sides by ${a}: x = ${num(x)}.`,
    tip: { kind: 'formula', text: 'Undo in reverse order: first the + or −, then the × by dividing. Check by putting x back in.' },
  };
};

const algebraBasics = {
  id: 'm5-algebra',
  title: 'Simplifying & solving',
  icon: '🧮',
  teach: [
    teach('m5-alg-t1', 'mei', 'Letters are just unknown numbers', [
      'Like terms have the same letters and powers: 3x and −5x are like terms; 3x and 3y are not.',
      'Simplify by collecting like terms: 3x + 2y − x = 2x + 2y.',
      'Solving an equation means finding the value that makes both sides equal.',
      'Whatever you do to one side, do to the other. Undo operations in reverse order.',
    ], { example: ['3x + 7 = 22', '3x = 15  (subtract 7 from both sides)', 'x = 5   (divide both sides by 3)'] }),
  ],
  exercises: [likeTermsGen, linearGen, likeTermsGen, linearGen, tf('m5-alg-1', '3x and 3x² are like terms.', false, 'The powers differ, so they cannot be combined.'), linearGen],
};

const subject = {
  id: 'm5-subject',
  title: 'Changing the subject',
  icon: '🔄',
  teach: [
    teach('m5-subj-t1', 'mei', 'Formula manipulation', [
      'The subject is the letter on its own on one side, like v in v = u + at.',
      'To make another letter the subject, undo everything around it, step by step, doing the same to both sides.',
      'Undo + with −, × with ÷, squares with square roots, and the reverse.',
    ], { example: ['v = u + at → v − u = at → t = (v − u)/a', 'A = πr² → r² = A/π → r = √(A/π)'], hook: { kind: 'formula', text: 'Formula manipulation is equation solving with letters. Same moves, same order.' } }),
  ],
  exercises: [
    mc('m5-subj-1', 'Make t the subject of v = u + at', ['t = (v − u)/a', 't = v − u − a', 't = (v + u)/a', 't = a/(v − u)'], 0, 'Subtract u from both sides, then divide by a.', { kind: 'formula', text: 'Remove what is added first, then what multiplies.' }),
    mc('m5-subj-2', 'Make r the subject of A = πr²', ['r = A/π', 'r = √(A/π)', 'r = √A/π', 'r = (A/π)²'], 1, 'Divide by π to get r² = A/π, then square root both sides.'),
    mc('m5-subj-3', 'Make w the subject of P = 2(l + w)', ['w = P − 2l', 'w = P/2 − l', 'w = 2P − l', 'w = (P − l)/2'], 1, 'Divide by 2: P/2 = l + w. Subtract l: w = P/2 − l.'),
    mc('m5-subj-4', 'Make m the subject of y = mx + c', ['m = y − c − x', 'm = (y − c)/x', 'm = y/x − c', 'm = (y + c)/x'], 1, 'Subtract c: y − c = mx. Divide by x: m = (y − c)/x.'),
    mc('m5-subj-5', 'Make u the subject of v² = u² + 2as', ['u = v − 2as', 'u = √(v² − 2as)', 'u = v² − 2as', 'u = √(v² + 2as)'], 1, 'Subtract 2as: u² = v² − 2as. Square root both sides.'),
  ],
};

export const MATHS_MORE: Unit[] = [
  { id: 'm-u4', title: 'Bases, indices & standard form', description: 'Number bases, laws of indices, standard form', who: 'mei', color: '#f472b6', lessons: [bases, indices, standard] },
  { id: 'm-u5', title: 'Algebra', description: 'Like terms, linear equations, changing the subject', who: 'mei', color: '#38bdf8', lessons: [algebraBasics, subject] },
];
