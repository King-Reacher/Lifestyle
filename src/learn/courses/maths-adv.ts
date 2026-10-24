import type { Exercise, Rng, Unit } from '../types';
import { br, choice, frac, int, match, mc, num, pickOne, shuffle, simplify, teach, tf } from '../util';
import { sup } from './maths-more';

const nonZero = (rng: Rng, lo: number, hi: number) => {
  const n = int(rng, lo, hi);
  return n === 0 ? hi : n;
};

/** A polynomial from [coefficient, power] terms, highest power first: "3x² − x + 4". */
export function poly(terms: [number, number][]): string {
  const parts = terms
    .filter(([c]) => c !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(([c, p], i) => {
      const abs = Math.abs(c);
      const body = p === 0 ? String(abs) : `${abs === 1 ? '' : abs}x${p === 1 ? '' : sup(p)}`;
      const sign = c < 0 ? '−' : '+';
      return i === 0 ? (c < 0 ? `−${body}` : body) : ` ${sign} ${body}`;
    });
  return parts.join('') || '0';
}

/* Inequalities */

const FLIP: Record<string, string> = { '<': '>', '>': '<', '≤': '≥', '≥': '≤' };

const inequalityGen = (rng: Rng): Exercise => {
  const a = nonZero(rng, -5, 6);
  // With a = 1 and b = 0 there would be nothing to solve.
  const b = a === 1 ? nonZero(rng, -9, 9) : int(rng, -9, 9);
  const x0 = nonZero(rng, -6, 6);
  const c = a * x0 + b;
  const op = pickOne(rng, ['<', '>', '≤', '≥'] as const);
  const out = a < 0 ? FLIP[op] : op;
  const lhs = `${a === 1 ? '' : a === -1 ? '−' : num(a)}x${b === 0 ? '' : ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}`}`;
  const right = `x ${out} ${num(x0)}`;
  const step1 = b === 0 ? '' : `${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)}: ${a === 1 ? '' : a === -1 ? '−' : num(a)}x ${op} ${num(c - b)}. `;
  const step2 = a === 1 ? '' : a < 0 ? `Divide by ${num(a)}, a negative number, so the sign flips: ${right}.` : `Divide by ${a}: ${right}.`;
  const coef = a === 1 ? '' : a === -1 ? '−' : num(a);
  const steps = [
    ...(b === 0 ? [] : [`${b < 0 ? 'Add' : 'Subtract'} ${Math.abs(b)} on both sides: ${num(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)} = ${num(c - b)}.`, `Now ${coef}x ${op} ${num(c - b)}.`]),
    ...(a === 1 ? [] : [`Divide both sides by ${num(a)}: ${num(c - b)} ÷ ${br(a)} = ${num(x0)}.`, a < 0 ? `You divided by a negative, so ${op} flips to ${out}.` : `You divided by a positive, so ${op} stays ${op}.`]),
    `Answer: ${right}.`,
  ];
  return choice(rng, { id: 'm8-inequality', prompt: `Solve ${lhs} ${op} ${num(c)}`, explain: (step1 + step2).trim(), steps, tip: { kind: 'eliminate', text: 'Multiplying or dividing by a negative flips the sign. If you divided by a negative, the arrow must turn round.' } }, right, [`x ${FLIP[out]} ${num(x0)}`, `x ${out} ${num(-x0)}`, `x ${FLIP[out]} ${num(-x0)}`, `x ${out} ${num(x0 + 1)}`]);
};

const inequalities = {
  id: 'm8-inequalities',
  title: 'Inequalities',
  icon: '⚖️',
  teach: [
    teach('m8-ineq-t1', 'mei', 'Solving like an equation, with one twist', [
      '< means less than, > greater than, ≤ less than or equal to, ≥ greater than or equal to.',
      'Solve an inequality like an equation: do the same to both sides.',
      'The twist: when you multiply or divide both sides by a negative number, the sign flips. < becomes >, ≤ becomes ≥.',
      'On a number line, an open circle means "not included" (< or >); a filled circle means "included" (≤ or ≥).',
    ], { example: ['−2x + 5 ≥ 1', '−2x ≥ −4  (subtract 5)', 'x ≤ 2  (divide by −2 and flip)'], hook: { kind: 'memory', text: 'Negative divide? Turn the sign round. Check with a number: x = 0 should work in both the question and your answer.' } }),
  ],
  exercises: [
    inequalityGen,
    inequalityGen,
    tf('m8-ineq-1', 'If −3x < 9, then x < −3.', false, 'Dividing by −3 flips the sign: x > −3.'),
    inequalityGen,
    mc('m8-ineq-2', 'Which integers satisfy 2 < x ≤ 5?', ['2, 3, 4, 5', '3, 4, 5', '3, 4', '2, 3, 4'], 1, '2 is not included (<); 5 is included (≤).', { kind: 'eliminate', text: 'Check the ends only: is 2 in? is 5 in?' }),
    inequalityGen,
    inequalityGen,
  ],
};

/* Sequences and series */

const apGen = (rng: Rng): Exercise => {
  const a = int(rng, -10, 15);
  const d = nonZero(rng, -5, 9);
  const n = int(rng, 6, 25);
  const terms = [a, a + d, a + 2 * d].map(num).join(', ');
  if (rng() < 0.5) {
    const t = a + (n - 1) * d;
    return { kind: 'input', id: 'm8-ap-term', prompt: `Find the ${n}th term of ${terms}, …`, answers: [String(t)], explain: `a = ${num(a)}, d = ${num(d)}. Tₙ = a + (n − 1)d = ${num(a)} + ${n - 1} × ${d < 0 ? `(${num(d)})` : d} = ${num(t)}.`, tip: { kind: 'formula', text: 'AP: Tₙ = a + (n − 1)d. The common difference d is any term minus the one before.' } };
  }
  const s = (n * (2 * a + (n - 1) * d)) / 2;
  return { kind: 'input', id: 'm8-ap-sum', prompt: `Find the sum of the first ${n} terms of ${terms}, …`, answers: [String(s)], explain: `a = ${num(a)}, d = ${num(d)}. Sₙ = n/2 × (2a + (n − 1)d) = ${n}/2 × (${num(2 * a)} + ${n - 1} × ${d < 0 ? `(${num(d)})` : d}) = ${n}/2 × ${num(2 * a + (n - 1) * d)} = ${num(s)}.`, tip: { kind: 'formula', text: 'AP sum: Sₙ = n/2 (2a + (n − 1)d), or n/2 (first + last).' } };
};

const gpGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const a = int(rng, 1, 5);
    const r = pickOne(rng, [2, 3, -2] as const);
    const n = int(rng, 4, 7);
    const t = a * r ** (n - 1);
    return { kind: 'input', id: 'm8-gp-term', prompt: `Find the ${n}th term of ${[a, a * r, a * r * r].map(num).join(', ')}, …`, answers: [String(t)], explain: `a = ${a}, r = ${num(r)} (each term ÷ the one before). Tₙ = arⁿ⁻¹ = ${a} × ${r < 0 ? `(${num(r)})` : r}${sup(n - 1)} = ${num(t)}.`, tip: { kind: 'formula', text: 'GP: Tₙ = arⁿ⁻¹. The ratio r is any term divided by the one before.' } };
  }
  const q = pickOne(rng, [2, 3, 4] as const);
  const k = q === 4 ? 1 : int(rng, 1, 3);
  const a = k * (q - 1) * q * q;
  const s = (a * q) / (q - 1);
  return { kind: 'input', id: 'm8-gp-infinity', prompt: `Find the sum to infinity of ${a}, ${a / q}, ${a / (q * q)}, …`, answers: [String(s)], explain: `a = ${a}, r = 1/${q}. S∞ = a ÷ (1 − r) = ${a} ÷ ${frac(q - 1, q)} = ${s}.`, tip: { kind: 'formula', text: 'S∞ = a / (1 − r), only when r is between −1 and 1.' } };
};

const sequences = {
  id: 'm8-sequences',
  title: 'Sequences & series',
  icon: '🪜',
  teach: [
    teach('m8-seq-t1', 'mei', 'Arithmetic progressions (AP)', [
      'In an AP you add the same number each time: the common difference d.',
      'nth term: Tₙ = a + (n − 1)d, where a is the first term.',
      'Sum of the first n terms: Sₙ = n/2 (2a + (n − 1)d).',
    ], { example: ['3, 7, 11, …: a = 3, d = 4', 'T₁₀ = 3 + 9 × 4 = 39', 'S₁₀ = 10/2 × (6 + 36) = 210'], hook: { kind: 'memory', text: 'Why n − 1? To reach the 10th term from the 1st you take only 9 steps.' } }),
    teach('m8-seq-t2', 'mei', 'Geometric progressions (GP)', [
      'In a GP you multiply by the same number each time: the common ratio r.',
      'nth term: Tₙ = arⁿ⁻¹.',
      'Sum to infinity, when r is between −1 and 1: S∞ = a / (1 − r).',
    ], { example: ['2, 6, 18, …: r = 3, T₅ = 2 × 3⁴ = 162', '8, 4, 2, …: r = 1/2, S∞ = 8 ÷ 1/2 = 16'] }),
  ],
  exercises: [apGen, apGen, gpGen, mc('m8-seq-1', 'Which is a geometric progression?', ['2, 5, 8, 11', '3, 6, 12, 24', '1, 4, 9, 16', '5, 10, 15, 20'], 1, 'Each term is double the last: r = 2.', { kind: 'eliminate', text: 'If the gaps are equal it is an AP, not a GP.' }), apGen, gpGen, apGen, gpGen],
};

/* Geometry and mensuration */

const REGULAR = [3, 4, 5, 6, 8, 9, 10, 12] as const;
const SHAPE: Record<number, string> = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: 'dodecagon' };

const anglesGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 2);
  if (kind === 0) {
    const n = int(rng, 5, 12);
    return { kind: 'input', id: 'm9-angle-sum', prompt: `Sum of the interior angles of a ${n}-sided polygon (degrees)?`, suffix: '°', answers: [String((n - 2) * 180)], explain: `(n − 2) × 180 = ${n - 2} × 180 = ${(n - 2) * 180}°.`, tip: { kind: 'formula', text: 'Interior sum = (n − 2) × 180°. A polygon splits into n − 2 triangles.' } };
  }
  const n = pickOne(rng, REGULAR);
  if (kind === 1) return { kind: 'input', id: 'm9-interior', prompt: `Each interior angle of a regular ${SHAPE[n]} (degrees)?`, suffix: '°', answers: [String(180 - 360 / n)], explain: `Exterior angle = 360 ÷ ${n} = ${360 / n}°. Interior = 180 − ${360 / n} = ${180 - 360 / n}°.`, tip: { kind: 'shortcut', text: 'Find the exterior angle first (360 ÷ n), then take it from 180.' } };
  return { kind: 'input', id: 'm9-sides', prompt: `Each exterior angle of a regular polygon is ${360 / n}°. How many sides?`, answers: [String(n)], explain: `n = 360 ÷ ${360 / n} = ${n}.`, tip: { kind: 'formula', text: 'Exterior angles always add up to 360°.' } };
};

const TRIPLES: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];

const pythagorasGen = (rng: Rng): Exercise => {
  const [p, q, r] = pickOne(rng, TRIPLES);
  const k = p === 3 ? int(rng, 1, 4) : 1;
  const [a, b, c] = [p * k, q * k, r * k];
  if (rng() < 0.5) return { kind: 'input', id: 'm9-hyp', prompt: `A right-angled triangle has shorter sides ${a} cm and ${b} cm. Hypotenuse (cm)?`, answers: [String(c)], explain: `c² = ${a}² + ${b}² = ${a * a} + ${b * b} = ${c * c}, so c = √${c * c} = ${c} cm.`, tip: { kind: 'shortcut', text: 'Learn the triples 3-4-5, 5-12-13, 8-15-17, 7-24-25 and their multiples. JAMB uses them all the time.' } };
  return { kind: 'input', id: 'm9-leg', prompt: `A right-angled triangle has hypotenuse ${c} cm and one side ${b} cm. The other side (cm)?`, answers: [String(a)], explain: `a² = ${c}² − ${b}² = ${c * c} − ${b * b} = ${a * a}, so a = √${a * a} = ${a} cm.`, tip: { kind: 'formula', text: 'For a shorter side, subtract: a² = c² − b².' } };
};

const mensurationGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 3);
  const k = int(rng, 1, 3);
  const r = 7 * k;
  const tip = { kind: 'shortcut' as const, text: 'With π = 22/7, pick radii that are multiples of 7 so the 7 cancels.' };
  if (kind === 0) return { kind: 'input', id: 'm9-circle-area', prompt: `Area of a circle of radius ${r} cm? (π = 22/7)`, suffix: 'cm²', answers: [String(154 * k * k)], explain: `A = πr² = 22/7 × ${r} × ${r} = ${154 * k * k} cm².`, tip };
  if (kind === 1) return { kind: 'input', id: 'm9-circumference', prompt: `Circumference of a circle of radius ${r} cm? (π = 22/7)`, suffix: 'cm', answers: [String(44 * k)], explain: `C = 2πr = 2 × 22/7 × ${r} = ${44 * k} cm.`, tip };
  if (kind === 2) {
    const h = int(rng, 2, 10);
    return { kind: 'input', id: 'm9-cylinder', prompt: `Volume of a cylinder with radius 7 cm and height ${h} cm? (π = 22/7)`, suffix: 'cm³', answers: [String(154 * h)], explain: `V = πr²h = 22/7 × 7 × 7 × ${h} = 154 × ${h} = ${154 * h} cm³.`, tip: { kind: 'formula', text: 'Any prism or cylinder: volume = area of the end × length.' } };
  }
  const b = 2 * int(rng, 2, 12);
  const h = int(rng, 3, 15);
  return { kind: 'input', id: 'm9-triangle', prompt: `Area of a triangle with base ${b} cm and height ${h} cm?`, suffix: 'cm²', answers: [String((b * h) / 2)], explain: `A = ½ × base × height = ½ × ${b} × ${h} = ${(b * h) / 2} cm².`, tip: { kind: 'formula', text: 'Triangle = half the rectangle around it: ½bh.' } };
};

const geometry = {
  id: 'm9-angles',
  title: 'Angles & polygons',
  icon: '📐',
  teach: [
    teach('m9-ang-t1', 'mei', 'Angle facts', [
      'Angles on a straight line add to 180°. Angles round a point add to 360°.',
      'Angles in a triangle add to 180°; in a quadrilateral, 360°.',
      'A polygon with n sides has interior angles adding to (n − 2) × 180°.',
      'The exterior angles of any polygon add to 360°, so a regular polygon has each exterior angle = 360° ÷ n.',
      'Interior + exterior = 180° at each corner.',
    ], { example: ['A regular hexagon: exterior = 360 ÷ 6 = 60°, interior = 120°'], hook: { kind: 'shortcut', text: 'Exterior first. 360 ÷ n is quicker than (n − 2) × 180 ÷ n.' } }),
  ],
  exercises: [anglesGen, anglesGen, match('m9-ang-1', 'Match the angle fact', [['Angles on a straight line', 'add to 180°'], ['Angles round a point', 'add to 360°'], ['Each exterior angle of a regular hexagon', '60°'], ['Interior angles of a pentagon', 'add to 540°']], 'Straight line 180°, point 360°, exterior 360 ÷ n, interior sum (n − 2) × 180.'), anglesGen, anglesGen, anglesGen],
};

const pythagoras = {
  id: 'm9-pythagoras',
  title: "Pythagoras' theorem",
  icon: '📏',
  teach: [
    teach('m9-pyth-t1', 'mei', 'The right-angle rule', [
      'In a right-angled triangle, the longest side (opposite the right angle) is the hypotenuse.',
      "Pythagoras' theorem: a² + b² = c², where c is the hypotenuse.",
      'To find the hypotenuse, add the squares. To find a shorter side, subtract.',
    ], { example: ['Sides 6 and 8: c² = 36 + 64 = 100, c = 10'], hook: { kind: 'eliminate', text: 'The hypotenuse is always the longest side. An answer shorter than a given side is wrong.' } }),
  ],
  exercises: [pythagorasGen, pythagorasGen, tf('m9-pyth-1', 'A triangle with sides 5, 12 and 13 has a right angle.', true, '25 + 144 = 169 = 13².'), pythagorasGen, pythagorasGen, pythagorasGen],
};

const mensuration = {
  id: 'm9-mensuration',
  title: 'Area & volume',
  icon: '🧊',
  teach: [
    teach('m9-mens-t1', 'mei', 'Measuring shapes', [
      'Rectangle: A = lb. Triangle: A = ½bh. Trapezium: A = ½(a + b)h.',
      'Circle: area A = πr², circumference C = 2πr.',
      'Cuboid: V = lbh. Cylinder: V = πr²h. Cone: V = ⅓πr²h. Sphere: V = ⁴⁄₃πr³.',
      'JAMB often uses π = 22/7.',
    ], { example: ['Radius 14: area = 22/7 × 14 × 14 = 616'], hook: { kind: 'memory', text: 'A cone is a third of the cylinder around it. Pointy shapes get the ⅓.' } }),
  ],
  exercises: [mensurationGen, mensurationGen, mc('m9-mens-1', 'The volume of a cone is…', ['πr²h', '⅓πr²h', '½πr²h', '2πrh'], 1, 'One third of the matching cylinder.'), mensurationGen, mensurationGen, mensurationGen],
};

/* Trigonometry */

const ratioGen = (rng: Rng): Exercise => {
  const [x, y, r] = pickOne(rng, TRIPLES);
  // Sometimes the angle faces the longer leg, so opposite is not always the smaller number.
  const [p, q] = rng() < 0.5 ? [x, y] : [y, x];
  const fn = pickOne(rng, ['sin', 'cos', 'tan'] as const);
  const right = { sin: `${p}/${r}`, cos: `${q}/${r}`, tan: `${p}/${q}` }[fn];
  return choice(rng, { id: 'm10-ratio', prompt: `A right-angled triangle has sides ${p}, ${q} and ${r}. Angle θ is opposite the side ${p}. Find ${fn} θ.`, explain: `Opposite = ${p}, adjacent = ${q}, hypotenuse = ${r}. ${fn} = ${{ sin: 'opposite/hypotenuse', cos: 'adjacent/hypotenuse', tan: 'opposite/adjacent' }[fn]} = ${right}.`, tip: { kind: 'memory', text: 'SOH CAH TOA: Sin = O/H, Cos = A/H, Tan = O/A.' } }, right, [`${p}/${r}`, `${q}/${r}`, `${p}/${q}`, `${q}/${p}`, `${r}/${p}`]);
};

const SPECIAL: [string, string][] = [
  ['sin 30°', '1/2'], ['cos 60°', '1/2'], ['tan 45°', '1'], ['sin 90°', '1'], ['cos 0°', '1'],
  ['sin 60°', '√3/2'], ['cos 30°', '√3/2'], ['tan 60°', '√3'], ['tan 30°', '1/√3'], ['sin 45°', '1/√2'], ['cos 90°', '0'], ['sin 0°', '0'],
];
const VALUES = ['0', '1/2', '1/√2', '√3/2', '1', '√3', '1/√3'];

const specialGen = (rng: Rng): Exercise => {
  const [q, v] = pickOne(rng, SPECIAL);
  return choice(rng, { id: 'm10-special', prompt: `${q} = ?`, explain: `${q} = ${v}.`, tip: { kind: 'shortcut', text: 'Sine of 0°, 30°, 45°, 60°, 90° is √0/2, √1/2, √2/2, √3/2, √4/2. Cosine is the same list backwards.' } }, v, shuffle(rng, VALUES.filter((x) => x !== v)));
};

const sideGen = (rng: Rng): Exercise => {
  const h = 2 * int(rng, 2, 15);
  if (rng() < 0.5) return { kind: 'input', id: 'm10-side30', prompt: `In a right-angled triangle the hypotenuse is ${h} cm and one angle is 30°. Length of the side opposite 30° (cm)?`, answers: [String(h / 2)], explain: `opposite = hypotenuse × sin 30° = ${h} × 1/2 = ${h / 2} cm.`, tip: { kind: 'formula', text: 'opposite = hypotenuse × sin θ' } };
  const a = h / 2;
  return { kind: 'input', id: 'm10-side45', prompt: `In a right-angled triangle one angle is 45° and the side adjacent to it is ${a} cm. Length of the opposite side (cm)?`, answers: [String(a)], explain: `opposite = adjacent × tan 45° = ${a} × 1 = ${a} cm.`, tip: { kind: 'shortcut', text: 'A 45° right triangle is isosceles: the two shorter sides are equal.' } };
};

const trig = {
  id: 'm10-trig',
  title: 'SOH CAH TOA',
  icon: '📐',
  teach: [
    teach('m10-trig-t1', 'mei', 'Ratios in a right-angled triangle', [
      'Label the sides from the angle θ: opposite (across from θ), adjacent (next to θ) and hypotenuse (the longest).',
      'sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.',
      'To find a side, rearrange: opposite = hypotenuse × sin θ, and so on.',
    ], { example: ['Triangle 3, 4, 5 with θ opposite 3:', 'sin θ = 3/5, cos θ = 4/5, tan θ = 3/4'], hook: { kind: 'memory', text: 'SOH CAH TOA. Say it like a chant.' } }),
  ],
  exercises: [ratioGen, ratioGen, sideGen, ratioGen, sideGen, ratioGen],
};

const special = {
  id: 'm10-special',
  title: 'Special angles',
  icon: '🔺',
  teach: [
    teach('m10-spec-t1', 'mei', 'Values to know by heart', [
      'sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2.',
      'cos 30° = √3/2, cos 45° = 1/√2, cos 60° = 1/2.',
      'tan 30° = 1/√3, tan 45° = 1, tan 60° = √3.',
      'sin θ = cos (90° − θ): sin 30° = cos 60°.',
    ], { hook: { kind: 'shortcut', text: 'Write 0, 1, 2, 3, 4. Square-root each and halve: that is sin 0°, 30°, 45°, 60°, 90°.' } }),
  ],
  exercises: [specialGen, specialGen, specialGen, tf('m10-spec-1', 'sin 30° = cos 60°', true, 'Both are 1/2: sin θ = cos (90° − θ).'), specialGen, specialGen],
};

/* Statistics and probability */

const statsGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 3);
  if (kind === 0) {
    const xs = Array.from({ length: 5 }, () => int(rng, 2, 20));
    xs[4] += (5 - (xs.reduce((a, b) => a + b, 0) % 5)) % 5;
    const sum = xs.reduce((a, b) => a + b, 0);
    return { kind: 'input', id: 'm11-mean', prompt: `Find the mean of ${xs.join(', ')}`, answers: [String(sum / 5)], explain: `Add them: ${xs.join(' + ')} = ${sum}. Divide by 5: ${sum / 5}.`, tip: { kind: 'formula', text: 'Mean = sum ÷ how many.' } };
  }
  if (kind === 1) {
    const n = pickOne(rng, [5, 7] as const);
    const xs = Array.from({ length: n }, () => int(rng, 1, 30));
    const sorted = [...xs].sort((a, b) => a - b);
    const median = sorted[(n - 1) / 2];
    return { kind: 'input', id: 'm11-median', prompt: `Find the median of ${xs.join(', ')}`, answers: [String(median)], explain: `Sort first: ${sorted.join(', ')}. The middle value is ${median}.`, steps: [`Sort the numbers: ${sorted.join(', ')}.`, `There are ${n} numbers, so the middle position = (${n} + 1) ÷ 2 = ${(n + 1) / 2}.`, `Number ${(n + 1) / 2} in the sorted list: median = ${median}.`], tip: { kind: 'eliminate', text: 'Never take the middle before sorting. That is the trap.' } };
  }
  if (kind === 2) {
    const mode = int(rng, 1, 12);
    const others = new Set<number>();
    while (others.size < 4) {
      const x = int(rng, 1, 15);
      if (x !== mode) others.add(x);
    }
    const xs = [...others, mode, mode, mode];
    for (let i = xs.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [xs[i], xs[j]] = [xs[j], xs[i]];
    }
    return { kind: 'input', id: 'm11-mode', prompt: `Find the mode of ${xs.join(', ')}`, answers: [String(mode)], explain: `${mode} appears 3 times, more than any other value.`, steps: ['Count how often each value appears.', `${mode} appears 3 times; every other value appears once.`, `Mode = ${mode}.`], tip: { kind: 'memory', text: 'MOde = MOst often.' } };
  }
  const xs = Array.from({ length: 6 }, () => int(rng, 1, 40));
  const range = Math.max(...xs) - Math.min(...xs);
  return { kind: 'input', id: 'm11-range', prompt: `Find the range of ${xs.join(', ')}`, answers: [String(range)], explain: `Highest − lowest = ${Math.max(...xs)} − ${Math.min(...xs)} = ${range}.`, tip: { kind: 'formula', text: 'Range = highest − lowest.' } };
};

const probabilityGen = (rng: Rng): Exercise => {
  if (rng() < 0.6) {
    const [r, b, g] = [int(rng, 1, 9), int(rng, 1, 9), int(rng, 1, 9)];
    const total = r + b + g;
    const pick = pickOne(rng, [['red', r], ['blue', b], ['green', g]] as const);
    const not = rng() < 0.3;
    const want = not ? total - pick[1] : pick[1];
    const [n, d] = simplify(want, total);
    const steps = [`Total balls = ${r} + ${b} + ${g} = ${total}.`, not ? `Balls that are not ${pick[0]} = ${total} − ${pick[1]} = ${want}.` : `${pick[0][0].toUpperCase()}${pick[0].slice(1)} balls = ${want}.`, `Probability = ${want} ÷ ${total} = ${frac(n, d)}.`];
    return { kind: 'input', id: 'm11-bag', steps, prompt: `A bag has ${r} red, ${b} blue and ${g} green balls. One is picked at random. Probability it is ${not ? 'NOT ' : ''}${pick[0]}?`, rational: [n, d], explain: `${not ? `Not ${pick[0]}: ${total} − ${pick[1]} = ${want}` : `${pick[0][0].toUpperCase()}${pick[0].slice(1)} balls: ${want}`} out of ${total}, so ${want}/${total}${d === total ? '' : ` = ${frac(n, d)}`}.`, tip: { kind: 'formula', text: 'P = favourable outcomes ÷ total outcomes. P(not A) = 1 − P(A).' } };
  }
  const k = int(rng, 1, 5);
  const [n, d] = simplify(6 - k, 6);
  return { kind: 'input', id: 'm11-die', prompt: `A fair die is thrown. Probability of a number greater than ${k}?`, rational: [n, d], explain: `Numbers greater than ${k}: ${Array.from({ length: 6 - k }, (_, i) => k + 1 + i).join(', ')}. That is ${6 - k} out of 6 = ${frac(n, d)}.`, tip: { kind: 'shortcut', text: 'List the outcomes. With a die there are only six.' } };
};

const countingGen = (rng: Rng): Exercise => {
  const n = int(rng, 4, 8);
  const r = int(rng, 2, 3);
  let perm = 1;
  for (let i = 0; i < r; i++) perm *= n - i;
  const comb = perm / (r === 2 ? 2 : 6);
  if (rng() < 0.5) return { kind: 'input', id: 'm11-perm', prompt: `In how many ways can ${r} students be chosen from ${n} for ${r === 3 ? 'first, second and third' : 'first and second'} place?`, answers: [String(perm)], explain: `Order matters: ⁿPᵣ = ${Array.from({ length: r }, (_, i) => n - i).join(' × ')} = ${perm}.`, tip: { kind: 'shortcut', text: 'Order matters (places, arrangements): permutation. Order does not matter (a team, a committee): combination.' } };
  return { kind: 'input', id: 'm11-comb', prompt: `In how many ways can a committee of ${r} be chosen from ${n} people?`, answers: [String(comb)], explain: `Order does not matter: ⁿCᵣ = (${Array.from({ length: r }, (_, i) => n - i).join(' × ')}) ÷ ${r === 2 ? '2' : '3 × 2'} = ${comb}.`, tip: { kind: 'formula', text: 'ⁿCᵣ = ⁿPᵣ ÷ r!' } };
};

const statistics = {
  id: 'm11-stats',
  title: 'Mean, median & mode',
  icon: '📊',
  teach: [
    teach('m11-stats-t1', 'mei', 'Averages and spread', [
      'Mean: add all the values and divide by how many there are.',
      'Median: the middle value after sorting. With an even count, take the mean of the middle two.',
      'Mode: the value that appears most often.',
      'Range: highest minus lowest. It measures spread, not average.',
    ], { example: ['4, 8, 1, 8, 9', 'Mean = 30 ÷ 5 = 6, median = 8 (sorted: 1, 4, 8, 8, 9), mode = 8, range = 8'] }),
  ],
  exercises: [statsGen, statsGen, statsGen, statsGen, tf('m11-stats-1', 'The median of 3, 9, 4 is 9.', false, 'Sort first: 3, 4, 9. The median is 4.'), statsGen, statsGen],
};

const probability = {
  id: 'm11-probability',
  title: 'Probability & counting',
  icon: '🎲',
  teach: [
    teach('m11-prob-t1', 'mei', 'How likely is it?', [
      'Probability = favourable outcomes ÷ total outcomes. It is between 0 (impossible) and 1 (certain).',
      'P(not A) = 1 − P(A).',
      'For independent events (a coin and a die), multiply: P(A and B) = P(A) × P(B).',
      'Permutations count arrangements where order matters; combinations count selections where it does not.',
    ], { example: ['P(head and a 6) = 1/2 × 1/6 = 1/12', 'Choose 2 from 5: ⁵C₂ = (5 × 4) ÷ 2 = 10'], hook: { kind: 'eliminate', text: 'A probability above 1 or below 0 is always wrong.' } }),
  ],
  exercises: [probabilityGen, probabilityGen, countingGen, mc('m11-prob-1', 'Two fair coins are tossed. P(two heads)?', ['1/2', '1/4', '1/3', '3/4'], 1, 'HH, HT, TH, TT: one out of four.'), probabilityGen, countingGen, probabilityGen],
};

/* Calculus */

const diffGen = (rng: Rng): Exercise => {
  const n = int(rng, 2, 5);
  const a = nonZero(rng, -6, 7);
  const m = int(rng, 1, n - 1);
  const b = nonZero(rng, -9, 9);
  const c = int(rng, -9, 9);
  const y = poly([[a, n], [b, m], [c, 0]]);
  const right = poly([[a * n, n - 1], [b * m, m - 1]]);
  const steps = [
    ...([[a, n], [b, m]] as [number, number][]).flatMap(([co, p]) => [
      `${poly([[co, p]])}: multiply by the power, ${p} × ${br(co)} = ${num(co * p)}.`,
      `Lower the power: ${p} − 1 = ${p - 1}.`,
      `So ${poly([[co, p]])} becomes ${poly([[co * p, p - 1]])}.`,
    ]),
    ...(c ? [`The constant ${num(c)} becomes 0.`] : []),
    `Put it together: dy/dx = ${right}.`,
  ];
  return choice(rng, { id: 'm12-diff', steps, prompt: `Differentiate y = ${y}`, explain: `Bring each power down and reduce it by one: ${poly([[a, n]])} → ${poly([[a * n, n - 1]])}, ${poly([[b, m]])} → ${poly([[b * m, m - 1]])}${c ? `, and the constant ${num(c)} → 0` : ''}. dy/dx = ${right}.`, tip: { kind: 'formula', text: 'd/dx (axⁿ) = naxⁿ⁻¹. Constants disappear.' } }, right, [poly([[a * n, n], [b * m, m]]), poly([[a, n - 1], [b, m - 1]]), ...(m > 1 && c ? [poly([[a * n, n - 1], [b * m, m - 1], [c, 0]])] : []), poly([[a * n, n + 1], [b * m, m + 1]]), poly([[a * (n - 1), n - 1], [b * Math.max(m - 1, 1), m - 1]])]);
};

const gradientGen = (rng: Rng): Exercise => {
  const a = nonZero(rng, -4, 5);
  const b = int(rng, -9, 9);
  const c = int(rng, -9, 9);
  const x = int(rng, -4, 5);
  if (rng() < 0.5) {
    const g = 2 * a * x + b;
    return { kind: 'input', id: 'm12-gradient', prompt: `Find the gradient of y = ${poly([[a, 2], [b, 1], [c, 0]])} at x = ${num(x)}`, answers: [String(g)], explain: `dy/dx = ${poly([[2 * a, 1], [b, 0]])}. At x = ${num(x)}: ${num(2 * a)} × ${x < 0 ? `(${num(x)})` : x}${b ? ` ${b < 0 ? '−' : '+'} ${Math.abs(b)}` : ''} = ${num(g)}.`, tip: { kind: 'formula', text: 'Gradient at a point: differentiate first, then substitute x.' } };
  }
  const p = int(rng, -6, 6);
  const q = int(rng, -9, 9);
  return { kind: 'input', id: 'm12-turning', prompt: `Find the x-value of the turning point of y = ${poly([[1, 2], [-2 * p, 1], [q, 0]])}`, answers: [String(p)], explain: `At a turning point dy/dx = 0. dy/dx = ${poly([[2, 1], [-2 * p, 0]])} = 0, so x = ${num(p)}.`, tip: { kind: 'formula', text: 'Turning (stationary) point: set dy/dx = 0 and solve.' } };
};

const integrateGen = (rng: Rng): Exercise => {
  const n = int(rng, 1, 4);
  const k = nonZero(rng, -4, 5);
  const a = k * (n + 1);
  const right = `${poly([[k, n + 1]])} + C`;
  const steps = [`Raise the power by one: ${n} + 1 = ${n + 1}.`, `Divide the number in front by the new power: ${num(a)} ÷ ${n + 1} = ${num(k)}.`, `So ${poly([[a, n]])} integrates to ${poly([[k, n + 1]])}.`, `Add the constant: ${right}.`];
  return choice(rng, { id: 'm12-integrate', steps, prompt: `Integrate ${poly([[a, n]])} with respect to x`, explain: `Raise the power by one and divide by the new power: ${poly([[a, n]])} → ${num(a)}x${sup(n + 1)} ÷ ${n + 1} = ${poly([[k, n + 1]])}. Add the constant C.`, tip: { kind: 'formula', text: '∫xⁿ dx = xⁿ⁺¹/(n + 1) + C. Differentiate your answer to check it.' } }, right, [`${poly([[a * n, n - 1]])} + C`, `${poly([[a, n + 1]])} + C`, poly([[k, n + 1]]), `${poly([[k, n]])} + C`]);
};

const differentiation = {
  id: 'm12-diff',
  title: 'Differentiation',
  icon: '📉',
  teach: [
    teach('m12-diff-t1', 'mei', 'The rate of change', [
      'Differentiation finds the gradient (slope) of a curve at any point. Written dy/dx.',
      'Power rule: if y = axⁿ then dy/dx = naxⁿ⁻¹. Bring the power down, then take one off it.',
      'A constant on its own differentiates to 0. Differentiate each term separately.',
      'At a turning point the gradient is 0: set dy/dx = 0 and solve.',
    ], { example: ['y = 3x⁴ − 5x² + 7', 'dy/dx = 12x³ − 10x'], hook: { kind: 'memory', text: '"Multiply by the power, then lower the power."' } }),
  ],
  exercises: [diffGen, diffGen, gradientGen, diffGen, gradientGen, tf('m12-diff-1', 'The derivative of a constant is 0.', true, 'A flat line has no slope.'), gradientGen],
};

const integration = {
  id: 'm12-integration',
  title: 'Integration',
  icon: '∫',
  teach: [
    teach('m12-int-t1', 'mei', 'Differentiation in reverse', [
      'Integration undoes differentiation.',
      'Power rule: ∫axⁿ dx = axⁿ⁺¹/(n + 1) + C. Raise the power by one, then divide by the new power.',
      'Always add the constant C, because any constant would have differentiated to 0.',
    ], { example: ['∫6x² dx = 6x³/3 + C = 2x³ + C', 'Check: d/dx (2x³) = 6x² ✓'], hook: { kind: 'formula', text: 'Differentiate: multiply then lower. Integrate: raise then divide.' } }),
  ],
  exercises: [integrateGen, integrateGen, integrateGen, mc('m12-int-1', 'Why do we add + C after integrating?', ['It stands for calculus', 'Any constant differentiates to 0, so we cannot know it', 'It makes the answer positive', 'It is the gradient'], 1, 'Many functions have the same derivative; C covers them all.'), integrateGen],
};

export const MATHS_ADV: Unit[] = [
  { id: 'm-u8', title: 'Inequalities & sequences', description: 'Linear inequalities, APs and GPs', who: 'mei', color: '#f97316', lessons: [inequalities, sequences] },
  { id: 'm-u9', title: 'Geometry & mensuration', description: "Angles and polygons, Pythagoras' theorem, area and volume", who: 'mei', color: '#0ea5e9', lessons: [geometry, pythagoras, mensuration] },
  { id: 'm-u10', title: 'Trigonometry', description: 'SOH CAH TOA and special angles', who: 'mei', color: '#a855f7', lessons: [trig, special] },
  { id: 'm-u11', title: 'Statistics & probability', description: 'Averages, range, probability, permutations and combinations', who: 'mei', color: '#10b981', lessons: [statistics, probability] },
  { id: 'm-u12', title: 'Calculus', description: 'Differentiation, turning points and integration', who: 'mei', color: '#e11d48', lessons: [differentiation, integration] },
];
