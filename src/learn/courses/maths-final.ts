import type { Exercise, Rng, Unit } from '../types';
import { br, choice, frac, int, mc, num, pickOne, simplify, teach, tf } from '../util';

const nonZero = (rng: Rng, lo: number, hi: number) => {
  const n = int(rng, lo, hi);
  return n === 0 ? hi : n;
};

/* Variation */

const variationGen = (rng: Rng): Exercise => {
  const kind = pickOne(rng, ['direct', 'inverse', 'square'] as const);
  const k = int(rng, 2, 9);
  if (kind === 'direct') {
    const [x1, x2] = [int(rng, 2, 9), int(rng, 2, 12)];
    return { kind: 'input', id: 'm13-direct', prompt: `y varies directly as x. When x = ${x1}, y = ${k * x1}. Find y when x = ${x2}.`, answers: [String(k * x2)], explain: `y = kx. Find k: k = y ÷ x = ${k * x1} ÷ ${x1} = ${k}. Now y = kx = ${k} × ${x2} = ${k * x2}.`, tip: { kind: 'formula', text: 'Direct: y = kx. Find k from the pair you are given, then use it.' } };
  }
  if (kind === 'inverse') {
    // A multiple of 12 divides evenly by every x used below.
    const c = k * int(rng, 1, 4) * 12;
    const [x1, x2] = [pickOne(rng, [2, 3, 6] as const), pickOne(rng, [1, 4, 12] as const)];
    const y1 = c / x1;
    return { kind: 'input', id: 'm13-inverse', prompt: `y varies inversely as x. When x = ${x1}, y = ${y1}. Find y when x = ${x2}.`, answers: [String(c / x2)], explain: `y = k/x. Find k: k = y × x = ${y1} × ${x1} = ${c}. Now y = k ÷ x = ${c} ÷ ${x2} = ${c / x2}.`, tip: { kind: 'eliminate', text: 'Inverse: when x gets bigger, y gets smaller. If x went up, cross out any bigger y.' } };
  }
  const [x1, x2] = [int(rng, 2, 5), int(rng, 2, 7)];
  return { kind: 'input', id: 'm13-square', prompt: `y varies as the square of x. When x = ${x1}, y = ${k * x1 * x1}. Find y when x = ${x2}.`, answers: [String(k * x2 * x2)], explain: `y = kx². Find k: k = y ÷ x² = ${k * x1 * x1} ÷ ${x1 * x1} = ${k}. Now y = kx² = ${k} × ${x2 * x2} = ${k * x2 * x2}.`, tip: { kind: 'formula', text: 'Square variation: y = kx². Square x before you multiply.' } };
};

/* Matrices */

const grid = (a: number, b: number, c: number, d: number) => {
  const w = Math.max(...[a, b, c, d].map((v) => num(v).length));
  const cell = (v: number) => num(v).padStart(w, ' ');
  return `| ${cell(a)}  ${cell(b)} |\n| ${cell(c)}  ${cell(d)} |`;
};

const determinantGen = (rng: Rng): Exercise => {
  const [a, b, c, d] = [nonZero(rng, -6, 9), nonZero(rng, -6, 9), nonZero(rng, -6, 9), nonZero(rng, -6, 9)];
  const det = a * d - b * c;
  return { kind: 'input', id: 'm14-det', prompt: `Find the determinant of\n${grid(a, b, c, d)}`, answers: [String(det)], explain: `Leading diagonal: ${num(a)} × ${br(d)} = ${num(a * d)}. Other diagonal: ${num(b)} × ${br(c)} = ${num(b * c)}. Determinant = ${num(a * d)} − ${br(b * c)} = ${num(det)}.`, tip: { kind: 'formula', text: 'For | a b | over | c d |, the determinant is ad − bc: down-right diagonal minus the other one.' } };
};

const matrixOpGen = (rng: Rng): Exercise => {
  const [a, b, c, d] = [int(rng, -5, 8), int(rng, -5, 8), int(rng, -5, 8), int(rng, -5, 8)];
  if (rng() < 0.5) {
    const k = nonZero(rng, -4, 5);
    const pos = pickOne(rng, [['top-left', a], ['top-right', b], ['bottom-left', c], ['bottom-right', d]] as const);
    return { kind: 'input', id: 'm14-scalar', prompt: `A =\n${grid(a, b, c, d)}\nFind the ${pos[0]} entry of ${num(k)}A.`, answers: [String(k * pos[1])], explain: `Multiply every entry by ${num(k)}. The ${pos[0]} entry is ${br(pos[1])} × ${br(k)} = ${num(k * pos[1])}.`, tip: { kind: 'shortcut', text: 'A number times a matrix multiplies every entry.' } };
  }
  const [e, f, g, h] = [int(rng, -5, 8), int(rng, -5, 8), int(rng, -5, 8), int(rng, -5, 8)];
  const tl = a * e + b * g;
  return { kind: 'input', id: 'm14-product', prompt: `A =\n${grid(a, b, c, d)}\nB =\n${grid(e, f, g, h)}\nFind the top-left entry of AB.`, answers: [String(tl)], explain: `Top-left = (row 1 of A) · (column 1 of B) = ${br(a)} × ${br(e)} + ${br(b)} × ${br(g)} = ${num(a * e)} + ${br(b * g)} = ${num(tl)}.`, tip: { kind: 'shortcut', text: 'Row times column: multiply across the row and down the column in pairs, then add.' } };
};

/* Coordinate geometry */

const coordGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 3);
  const [x1, y1] = [int(rng, -6, 6), int(rng, -6, 6)];
  if (kind === 0) {
    const dx = nonZero(rng, -5, 6);
    const m = nonZero(rng, -3, 3);
    const [x2, y2] = [x1 + dx, y1 + m * dx];
    return { kind: 'input', id: 'm15-gradient', prompt: `Find the gradient of the line through (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}).`, answers: [String(m)], explain: `Rise: ${num(y2)} − ${br(y1)} = ${num(y2 - y1)}. Run: ${num(x2)} − ${br(x1)} = ${num(dx)}. Gradient = ${num(y2 - y1)} ÷ ${br(dx)} = ${num(m)}.`, tip: { kind: 'formula', text: 'Gradient m = (y₂ − y₁) ÷ (x₂ − x₁): rise over run.' } };
  }
  if (kind === 1) {
    const [x2, y2] = [x1 + 2 * int(rng, -4, 4), y1 + 2 * int(rng, -4, 4)];
    const ask = rng() < 0.5 ? 'x' : 'y';
    const v = ask === 'x' ? (x1 + x2) / 2 : (y1 + y2) / 2;
    const [p, q] = ask === 'x' ? [x1, x2] : [y1, y2];
    return { kind: 'input', id: 'm15-midpoint', prompt: `Find the ${ask}-coordinate of the midpoint of (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}).`, answers: [String(v)], explain: `Add the ${ask}-values: ${num(p)} + ${br(q)} = ${num(p + q)}. Halve it: ${num(p + q)} ÷ 2 = ${num(v)}.`, tip: { kind: 'formula', text: 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2): the average of each coordinate.' } };
  }
  if (kind === 2) {
    const [p, q, r] = pickOne(rng, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]] as const);
    const [x2, y2] = [x1 + p * pickOne(rng, [1, -1] as const), y1 + q * pickOne(rng, [1, -1] as const)];
    return { kind: 'input', id: 'm15-distance', prompt: `Find the distance between (${num(x1)}, ${num(y1)}) and (${num(x2)}, ${num(y2)}).`, answers: [String(r)], explain: `Across: ${num(x2)} − ${br(x1)} = ${num(x2 - x1)}. Up: ${num(y2)} − ${br(y1)} = ${num(y2 - y1)}. Squares: ${p * p} + ${q * q} = ${r * r}. Distance = √${r * r} = ${r}.`, tip: { kind: 'formula', text: "Distance = √((x₂ − x₁)² + (y₂ − y₁)²). It is Pythagoras' theorem on the grid." } };
  }
  const m = nonZero(rng, -4, 5);
  const c = y1 - m * x1;
  return { kind: 'input', id: 'm15-intercept', prompt: `A line with gradient ${num(m)} passes through (${num(x1)}, ${num(y1)}). Find c in y = mx + c.`, answers: [String(c)], explain: `Put the point into y = mx + c: ${num(y1)} = ${num(m)} × ${br(x1)} + c. So ${num(y1)} = ${num(m * x1)} + c. c = ${num(y1)} − ${br(m * x1)} = ${num(c)}.`, tip: { kind: 'shortcut', text: 'Any point on the line fits y = mx + c. Substitute it and solve for c.' } };
};

/* Circle theorems */

const circleGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 2);
  if (kind === 0) {
    const a = int(rng, 15, 85);
    return rng() < 0.5
      ? { kind: 'input', id: 'm16-centre', prompt: `An arc subtends ${a}° at the circumference. What angle does it subtend at the centre?`, suffix: '°', answers: [String(2 * a)], explain: `The angle at the centre is twice the angle at the circumference: 2 × ${a} = ${2 * a}°.`, tip: { kind: 'formula', text: 'Centre = 2 × circumference (same arc).' } }
      : { kind: 'input', id: 'm16-circumference', prompt: `An arc subtends ${2 * a}° at the centre. What angle does it subtend at the circumference?`, suffix: '°', answers: [String(a)], explain: `The angle at the circumference is half the angle at the centre: ${2 * a} ÷ 2 = ${a}°.`, tip: { kind: 'formula', text: 'Circumference = half the centre angle.' } };
  }
  if (kind === 1) {
    const a = int(rng, 40, 140);
    return { kind: 'input', id: 'm16-cyclic', prompt: `In a cyclic quadrilateral one angle is ${a}°. Find the angle opposite it.`, suffix: '°', answers: [String(180 - a)], explain: `Opposite angles of a cyclic quadrilateral add up to 180°: 180 − ${a} = ${180 - a}°.`, tip: { kind: 'memory', text: 'Cyclic quadrilateral: opposite angles are supplementary (add to 180°).' } };
  }
  const a = int(rng, 20, 70);
  return { kind: 'input', id: 'm16-semicircle', prompt: `AB is a diameter and C is on the circle. Angle CAB = ${a}°. Find angle CBA.`, suffix: '°', answers: [String(90 - a)], explain: `The angle in a semicircle is 90°, so angle ACB = 90°. Angles in a triangle: 180 − 90 − ${a} = ${90 - a}°.`, tip: { kind: 'memory', text: 'An angle standing on a diameter is always 90°.' } };
};

/* Bearings */

const bearingGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const b = int(rng, 1, 35) * 10;
    const back = b > 180 ? b - 180 : b === 180 ? 360 : b + 180;
    const pad = (v: number) => String(v).padStart(3, '0');
    return choice(rng, { id: 'm17-back', prompt: `The bearing of B from A is ${pad(b)}°. Find the bearing of A from B.`, explain: `The back bearing differs by 180°. ${b} ${b > 180 ? '−' : '+'} 180 = ${back}, so ${pad(back)}°.`, steps: [`The back bearing differs by 180°.`, `${b} ${b > 180 ? '−' : '+'} 180 = ${back}.`, `Write it with three figures: ${pad(back)}°.`], tip: { kind: 'shortcut', text: 'Up to 180, add 180. Above 180, subtract 180.' } }, `${pad(back)}°`, [`${pad(360 - b)}°`, `${pad((b + 90) % 360)}°`, `${pad(Math.abs(180 - b) || 90)}°`, `${pad((back + 10) % 360)}°`]);
  }
  const [p, q, r] = pickOne(rng, [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17]] as const);
  return { kind: 'input', id: 'm17-distance', prompt: `A boy walks ${p} km due north, then ${q} km due east. How far is he from his starting point (km)?`, answers: [String(r)], explain: `North and east are at right angles, so use Pythagoras. ${p}² + ${q}² = ${p * p} + ${q * q} = ${r * r}. Distance = √${r * r} = ${r} km.`, tip: { kind: 'shortcut', text: 'Draw it. North then east makes a right angle, so the straight-line distance is a hypotenuse.' } };
};

const probabilityMore = (rng: Rng): Exercise => {
  const [a, b] = [pickOne(rng, [2, 3, 4, 5] as const), pickOne(rng, [2, 3, 4, 5, 6] as const)];
  const [n, d] = simplify(1, a * b);
  return { kind: 'input', id: 'm18-and', prompt: `P(A) = 1/${a} and P(B) = 1/${b}. A and B are independent. Find P(A and B).`, rational: [n, d], explain: `Independent events multiply: 1/${a} × 1/${b} = ${frac(n, d)}.`, tip: { kind: 'formula', text: 'AND means multiply (for independent events). OR means add (for events that cannot happen together).' } };
};

export const MATHS_FINAL: Unit[] = [
  {
    id: 'm-u13',
    title: 'Variation & matrices',
    description: 'Direct, inverse and square variation; determinants and matrix arithmetic',
    who: 'mei',
    color: '#14b8a6',
    lessons: [
      {
        id: 'm13-variation',
        title: 'Variation',
        icon: '🔗',
        teach: [
          teach('m13-var-t1', 'mei', 'How one quantity follows another', [
            'Direct variation: y ∝ x, so y = kx. Double x and y doubles.',
            'Inverse variation: y ∝ 1/x, so y = k/x. Double x and y halves.',
            'Square variation: y ∝ x², so y = kx².',
            'Joint variation: y ∝ xz, so y = kxz.',
            'Method: write the equation with k, use the given pair to find k, then use k to answer.',
          ], { example: ['y ∝ x, y = 12 when x = 3', 'k = 12 ÷ 3 = 4', 'When x = 5: y = 4 × 5 = 20'], hook: { kind: 'formula', text: 'Three moves every time: equation with k, find k, use k.' } }),
        ],
        exercises: [variationGen, variationGen, mc('m13-var-1', 'y varies inversely as x. If x is doubled, y is…', ['doubled', 'halved', 'squared', 'unchanged'], 1, 'y = k/x: twice the bottom gives half the value.'), variationGen, variationGen, variationGen],
      },
      {
        id: 'm14-matrices',
        title: 'Matrices & determinants',
        icon: '🔲',
        teach: [
          teach('m14-mat-t1', 'mei', 'Grids of numbers', [
            'A matrix is a grid of numbers. A 2 × 2 matrix has 2 rows and 2 columns.',
            'Add or subtract matrices entry by entry. Multiply by a number: multiply every entry.',
            'Multiply two matrices row by column: each entry is a row of the first times a column of the second, added up.',
            'The determinant of | a b | over | c d | is ad − bc. If it is 0, the matrix has no inverse.',
          ], { example: ['| 3  2 |', '| 1  4 |', 'Determinant = 3 × 4 − 2 × 1 = 12 − 2 = 10'], hook: { kind: 'memory', text: 'Determinant: down-right diagonal minus up-right diagonal.' } }),
        ],
        exercises: [determinantGen, determinantGen, matrixOpGen, tf('m14-mat-1', 'A matrix with determinant 0 has an inverse.', false, 'The inverse divides by the determinant, and you cannot divide by 0.'), matrixOpGen, determinantGen],
      },
    ],
  },
  {
    id: 'm-u14',
    title: 'Coordinates, circles & bearings',
    description: 'Gradient, midpoint, distance, lines, circle theorems, bearings',
    who: 'mei',
    color: '#f43f5e',
    lessons: [
      {
        id: 'm15-coordinates',
        title: 'Coordinate geometry',
        icon: '📍',
        teach: [
          teach('m15-coord-t1', 'mei', 'Lines on a grid', [
            'Gradient m = (y₂ − y₁) ÷ (x₂ − x₁): rise over run.',
            'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2).',
            'Distance = √((x₂ − x₁)² + (y₂ − y₁)²).',
            'The equation of a straight line is y = mx + c, where c is where it cuts the y-axis.',
            'Parallel lines have equal gradients. Perpendicular gradients multiply to −1.',
          ], { example: ['(1, 2) and (4, 8): gradient = (8 − 2) ÷ (4 − 1) = 6 ÷ 3 = 2'], hook: { kind: 'shortcut', text: 'Distance is just Pythagoras: across and up are the two shorter sides.' } }),
        ],
        exercises: [coordGen, coordGen, coordGen, mc('m15-coord-1', 'A line perpendicular to one with gradient 2 has gradient…', ['2', '−2', '1/2', '−1/2'], 3, 'Perpendicular gradients multiply to −1: 2 × (−1/2) = −1.', { kind: 'shortcut', text: 'Flip it and change the sign.' }), coordGen, coordGen, coordGen],
      },
      {
        id: 'm16-circles',
        title: 'Circle theorems',
        icon: '⭕',
        teach: [
          teach('m16-circ-t1', 'mei', 'Angles in circles', [
            'The angle at the centre is twice the angle at the circumference standing on the same arc.',
            'Angles in the same segment are equal.',
            'The angle in a semicircle (standing on a diameter) is 90°.',
            'Opposite angles of a cyclic quadrilateral add up to 180°.',
            'A tangent meets the radius at 90°. Two tangents from one point are equal in length.',
          ], { hook: { kind: 'memory', text: 'Centre is double, semicircle is 90, cyclic opposite makes 180.' } }),
        ],
        exercises: [circleGen, circleGen, tf('m16-circ-1', 'A tangent meets the radius at 90°.', true, 'This is one of the most used circle facts.'), circleGen, circleGen, mc('m16-circ-2', 'Angles in the same segment are…', ['supplementary', 'equal', 'complementary', 'always 90°'], 1, 'They stand on the same arc, so they are equal.'), circleGen],
      },
      {
        id: 'm17-bearings',
        title: 'Bearings & probability',
        icon: '🧭',
        teach: [
          teach('m17-bear-t1', 'mei', 'Directions as angles', [
            'A bearing is measured clockwise from north and written with three figures: east is 090°, south is 180°, west is 270°.',
            'The back bearing (the way home) differs by 180°.',
            'Distances after moving north/south then east/west: use Pythagoras.',
            'Independent events: P(A and B) = P(A) × P(B).',
          ], { example: ['Bearing 060°: back bearing 060 + 180 = 240°', 'Bearing 300°: back bearing 300 − 180 = 120°'], hook: { kind: 'memory', text: 'Bearings: from North, Clockwise, Three figures. "Never Cross The road."' } }),
        ],
        exercises: [bearingGen, bearingGen, mc('m17-bear-1', 'The bearing of due west is…', ['090°', '180°', '270°', '360°'], 2, 'Clockwise from north: east 090, south 180, west 270.'), bearingGen, probabilityMore, bearingGen, probabilityMore],
      },
    ],
  },
];
