import type { Course, Exercise, Lesson, Rng } from '../types';
import { br, choice, frac, gcd, int, lcm, num, pickOne, simplify } from '../util';

/* Unit 1: Number foundations */

const typesOfNumbers: Lesson = {
  id: 'm1-types',
  title: 'Types of numbers',
  icon: '🔢',
  teach: [
    {
      kind: 'teach',
      id: 'm1-types-t1',
      who: 'mei',
      title: 'Every number has a family',
      body: [
        'Natural numbers are the counting numbers: 1, 2, 3, 4…',
        'Whole numbers are the natural numbers plus 0.',
        'Integers add the negatives: …, −2, −1, 0, 1, 2, …',
        'Rational numbers can be written as a fraction p/q (q ≠ 0): 1/2, −3, 0.75, 0.333…',
        "Irrational numbers can't: √2, π. Their decimals never end and never repeat.",
      ],
      hook: {
        kind: 'memory',
        text: 'Picture rooms inside rooms in your mental mansion: Natural ⊂ Whole ⊂ Integers ⊂ Rational ⊂ Real. Each room holds everything in the rooms inside it.',
      },
    },
  ],
  exercises: [
    {
      kind: 'choice',
      id: 'm1-types-1',
      prompt: 'Which is a whole number but NOT a natural number?',
      options: ['1', '0', '−1', '1/2'],
      answer: 1,
      explain: 'Whole numbers are natural numbers plus 0. So 0 is whole, but not natural.',
    },
    { kind: 'truefalse', id: 'm1-types-2', prompt: '−5 is an integer.', answer: true, explain: 'Integers include negative whole numbers.' },
    {
      kind: 'choice',
      id: 'm1-types-3',
      prompt: 'Which number is irrational?',
      options: ['√9', '0.5', '√2', '3/4'],
      answer: 2,
      explain: '√9 = 3 is rational. √2 = 1.41421… never ends or repeats, so it is irrational.',
      tip: { kind: 'eliminate', text: 'Knock out anything you can write as a fraction first: √9 = 3, 0.5 = 1/2.' },
    },
    {
      kind: 'match',
      id: 'm1-types-4',
      prompt: 'Match each number to its smallest family',
      pairs: [
        ['7', 'Natural'],
        ['0', 'Whole'],
        ['−3', 'Integer'],
        ['2/5', 'Rational'],
        ['π', 'Irrational'],
      ],
      explain: 'Smallest family = the innermost room the number fits in.',
    },
    { kind: 'truefalse', id: 'm1-types-5', prompt: 'Every integer is a rational number.', answer: true, explain: 'Any integer n can be written as n/1.' },
    {
      kind: 'choice',
      id: 'm1-types-6',
      prompt: '0.333… (the 3 repeats forever) is…',
      options: ['Irrational', 'Rational', 'Not a number', 'An integer'],
      answer: 1,
      explain: 'A decimal that repeats is rational: 0.333… = 1/3.',
    },
    {
      kind: 'order',
      id: 'm1-types-7',
      prompt: 'Order the families from smallest to biggest',
      tiles: ['Natural', 'Whole', 'Integers', 'Rational', 'Real'],
      explain: 'Natural ⊂ Whole ⊂ Integers ⊂ Rational ⊂ Real.',
    },
  ],
};

const addNegatives = (rng: Rng): Exercise => {
  const a = int(rng, -12, 12);
  const b = int(rng, -12, -1);
  return {
    kind: 'input',
    id: 'm1-neg-add',
    prompt: `${num(a)} + ${br(b)} = ?`,
    answers: [String(a + b)],
    explain: `Adding a negative moves left on the number line: ${num(a)} + ${br(b)} = ${num(a)} − ${Math.abs(b)} = ${num(a + b)}.`,
  };
};

const subNegative = (rng: Rng): Exercise => {
  const a = int(rng, -10, 10);
  const b = int(rng, 1, 12);
  return {
    kind: 'input',
    id: 'm1-neg-sub',
    prompt: `${num(a)} − (−${b}) = ?`,
    answers: [String(a + b)],
    explain: `Subtracting a negative is adding: ${num(a)} − (−${b}) = ${num(a)} + ${b} = ${num(a + b)}.`,
    tip: { kind: 'memory', text: 'Two minuses side by side become a plus. Taking away a debt makes you richer.' },
  };
};

const signTrap = (rng: Rng): Exercise => {
  const a = int(rng, 4, 15);
  const b = int(rng, 1, a - 1);
  const right = -a + b;
  return choice(
    rng,
    {
      id: 'm1-neg-trap',
      prompt: `${num(-a)} + ${b} = ?`,
      explain: `Start at ${num(-a)} and move ${b} right: ${num(right)}. The bigger number (${a}) is negative, so the answer is negative.`,
      tip: { kind: 'eliminate', text: 'Decide the sign first: the side with the bigger size wins. That kills half the options at once.' },
    },
    num(right),
    [num(a + b), num(-(a + b)), num(a - b + 2), num(-right)],
  );
};

const negatives: Lesson = {
  id: 'm1-neg',
  title: 'Adding & subtracting negatives',
  icon: '➖',
  teach: [
    {
      kind: 'teach',
      id: 'm1-neg-t1',
      who: 'mei',
      title: 'Walk the number line',
      body: ['Adding a positive number: walk right.', 'Adding a negative number: walk left.', 'Subtracting a negative: turn around and walk right. So a − (−b) = a + b.'],
      example: ['−4 + 7 = 3', '5 + (−8) = −3', '2 − (−6) = 2 + 6 = 8'],
      hook: { kind: 'memory', text: 'Money picture: a negative is a debt. Adding a debt makes you poorer; removing a debt makes you richer.' },
    },
  ],
  exercises: [
    addNegatives,
    signTrap,
    subNegative,
    { kind: 'truefalse', id: 'm1-neg-1', prompt: '−3 − 5 = −8', answer: true, explain: 'Start at −3 and move 5 more to the left: −8.' },
    addNegatives,
    { kind: 'truefalse', id: 'm1-neg-2', prompt: '5 − (−2) = 3', answer: false, explain: '5 − (−2) = 5 + 2 = 7.' },
    subNegative,
    signTrap,
  ],
};

const multSigns = (rng: Rng): Exercise => {
  const a = int(rng, 2, 12) * pickOne(rng, [1, -1]);
  const b = int(rng, 2, 12) * pickOne(rng, [1, -1]);
  return {
    kind: 'input',
    id: 'm1-sign-mul',
    prompt: `${br(a)} × ${br(b)} = ?`,
    answers: [String(a * b)],
    explain: `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(a * b)}. Signs: ${a < 0 === b < 0 ? 'same → positive' : 'different → negative'}.`,
  };
};

const divSigns = (rng: Rng): Exercise => {
  const q = int(rng, 2, 9) * pickOne(rng, [1, -1]);
  const b = int(rng, 2, 9) * pickOne(rng, [1, -1]);
  const a = q * b;
  return {
    kind: 'input',
    id: 'm1-sign-div',
    prompt: `${br(a)} ÷ ${br(b)} = ?`,
    answers: [String(q)],
    explain: `${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(q)}. Signs: ${a < 0 === b < 0 ? 'same → positive' : 'different → negative'}.`,
  };
};

const signs: Lesson = {
  id: 'm1-signs',
  title: 'Multiplying & dividing signs',
  icon: '✖️',
  teach: [
    {
      kind: 'teach',
      id: 'm1-signs-t1',
      who: 'mei',
      title: 'Same signs: positive. Different signs: negative.',
      body: ['(+) × (+) = +   (−) × (−) = +', '(+) × (−) = −   (−) × (+) = −', 'Division follows exactly the same rules.'],
      example: ['(−6) × (−2) = 12', '(−6) × 2 = −12', '(−6) ÷ (−2) = 3'],
      hook: { kind: 'memory', text: 'Friends and enemies: the enemy of my enemy is my friend (− × − = +). The friend of my enemy is my enemy (+ × − = −).' },
    },
    {
      kind: 'teach',
      id: 'm1-signs-t2',
      who: 'greta',
      title: 'Shortcut for long products',
      body: ['Count the negative signs.', 'Even number of negatives → positive answer.', 'Odd number of negatives → negative answer.'],
      example: ['(−1)(−2)(−3) → 3 negatives (odd) → −6'],
      hook: { kind: 'shortcut', text: 'Sort out the sign first, then multiply the sizes. Two simple jobs instead of one messy one.' },
    },
  ],
  exercises: [
    multSigns,
    divSigns,
    {
      kind: 'match',
      id: 'm1-signs-1',
      prompt: 'Match each calculation to its answer',
      pairs: [
        ['(−6) × (−2)', '12'],
        ['(−6) × 2', '−12'],
        ['(−6) ÷ (−2)', '3'],
        ['6 ÷ (−2)', '−3'],
      ],
      explain: 'Same signs give positive; different signs give negative.',
    },
    {
      kind: 'choice',
      id: 'm1-signs-2',
      prompt: 'What is the sign of (−2) × (−3) × (−4)?',
      options: ['Positive', 'Negative', 'Zero', "Can't tell"],
      answer: 1,
      explain: 'Three negatives is odd, so the answer is negative: −24.',
      tip: { kind: 'shortcut', text: 'Count the negatives: odd → negative, even → positive.' },
    },
    multSigns,
    { kind: 'truefalse', id: 'm1-signs-3', prompt: '(−1) × (−1) × (−1) × (−1) = 1', answer: true, explain: 'Four negatives is even, so the answer is positive: 1.' },
    divSigns,
    multSigns,
  ],
};

const bodmasAddMul = (rng: Rng): Exercise => {
  const a = int(rng, 2, 20);
  const b = int(rng, 2, 9);
  const c = int(rng, 2, 9);
  return {
    kind: 'input',
    id: 'm1-bodmas-amul',
    prompt: `${a} + ${b} × ${c} = ?`,
    answers: [String(a + b * c)],
    explain: `Multiply before adding: ${b} × ${c} = ${b * c}, then ${a} + ${b * c} = ${a + b * c}.`,
  };
};

const bodmasBrackets = (rng: Rng): Exercise => {
  const a = int(rng, 2, 12);
  const b = int(rng, 2, 9);
  const c = int(rng, 2, 6);
  return {
    kind: 'input',
    id: 'm1-bodmas-br',
    prompt: `(${a} + ${b}) × ${c} = ?`,
    answers: [String((a + b) * c)],
    explain: `Brackets first: ${a} + ${b} = ${a + b}, then × ${c} = ${(a + b) * c}.`,
  };
};

const bodmas: Lesson = {
  id: 'm1-bodmas',
  title: 'Order of operations (BODMAS)',
  icon: '🧮',
  teach: [
    {
      kind: 'teach',
      id: 'm1-bodmas-t1',
      who: 'mei',
      title: 'BODMAS decides what goes first',
      body: [
        'B: Brackets',
        'O: Orders (powers and roots)',
        'D, M: Division and Multiplication have equal rank, so go left to right',
        'A, S: Addition and Subtraction have equal rank, so go left to right',
      ],
      example: ['2 + 3 × 4 = 2 + 12 = 14 (not 20)', '20 ÷ 4 × 5 = 5 × 5 = 25 (left to right)'],
      hook: { kind: 'memory', text: "BODMAS trap: D doesn't beat M, and A doesn't beat S. They are partners of equal rank, so whichever comes first from the left goes first." },
    },
  ],
  exercises: [
    choiceStatic('m1-bodmas-1', '2 + 3 × 4 = ?', ['14', '20', '24', '9'], 0, 'Multiply first: 3 × 4 = 12, then 2 + 12 = 14.'),
    choiceStatic('m1-bodmas-2', '20 ÷ 4 × 5 = ?', ['1', '25', '100', '4'], 1, 'D and M have equal rank, so go left to right: 20 ÷ 4 = 5, then 5 × 5 = 25.'),
    {
      kind: 'order',
      id: 'm1-bodmas-3',
      prompt: 'Put the steps for 3 + (8 − 2)² ÷ 4 in order',
      tiles: ['Brackets: 8 − 2 = 6', 'Order: 6² = 36', 'Divide: 36 ÷ 4 = 9', 'Add: 3 + 9 = 12'],
      explain: 'B → O → D → A. The answer is 12.',
    },
    bodmasAddMul,
    { kind: 'truefalse', id: 'm1-bodmas-4', prompt: '10 − 4 + 2 = 4', answer: false, explain: 'A and S go left to right: 10 − 4 = 6, then 6 + 2 = 8.' },
    bodmasBrackets,
    { kind: 'input', id: 'm1-bodmas-5', prompt: '(5 + 3) × 2 − 4² = ?', answers: ['0'], explain: 'Brackets: 8. Orders: 4² = 16. Multiply: 8 × 2 = 16. Subtract: 16 − 16 = 0.' },
    { kind: 'input', id: 'm1-bodmas-6', prompt: '18 ÷ (3 × 2) + 1 = ?', answers: ['4'], explain: 'Brackets: 3 × 2 = 6. Divide: 18 ÷ 6 = 3. Add: 3 + 1 = 4.' },
  ],
};

function choiceStatic(id: string, prompt: string, options: string[], answer: number, explain: string, tip?: Exercise['tip']): Exercise {
  return { kind: 'choice', id, prompt, options, answer, explain, tip };
}

const divisibleBy = (k: 3 | 9) => (rng: Rng): Exercise => {
  const n = int(rng, 100, 999);
  const digits = String(n).split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return {
    kind: 'truefalse',
    id: `m1-fac-div${k}`,
    prompt: `${n} is divisible by ${k}.`,
    answer: n % k === 0,
    explain: `Digit sum: ${digits.join(' + ')} = ${sum}. ${sum} ${sum % k === 0 ? 'is' : 'is not'} divisible by ${k}, so ${n} ${n % k === 0 ? 'is' : 'is not'}.`,
    tip: { kind: 'shortcut', text: `Divisible by ${k} ⇔ the digit sum is divisible by ${k}.` },
  };
};

const factors: Lesson = {
  id: 'm1-factors',
  title: 'Factors, multiples & primes',
  icon: '🧩',
  teach: [
    {
      kind: 'teach',
      id: 'm1-factors-t1',
      who: 'mei',
      title: 'Factors divide in. Multiples come out.',
      body: [
        'A factor of 12 divides it exactly: 1, 2, 3, 4, 6, 12.',
        'A multiple of 12 is in its times table: 12, 24, 36…',
        'A prime has exactly two factors: 1 and itself. 1 is NOT prime. 2 is the only even prime.',
      ],
      example: ['60 = 2 × 2 × 3 × 5 = 2² × 3 × 5 (prime factorisation)'],
    },
    {
      kind: 'teach',
      id: 'm1-factors-t2',
      who: 'mei',
      title: 'Divisibility shortcuts',
      body: [
        '2: last digit is even',
        '3: digit sum divisible by 3',
        '4: last two digits divisible by 4',
        '5: ends in 0 or 5',
        '9: digit sum divisible by 9',
        '10: ends in 0',
      ],
      hook: { kind: 'shortcut', text: '471 → 4 + 7 + 1 = 12 → divisible by 3. You never have to do the division.' },
    },
  ],
  exercises: [
    choiceStatic('m1-factors-1', 'Which of these is prime?', ['51', '57', '53', '49'], 2, '51 = 3 × 17, 57 = 3 × 19, 49 = 7 × 7. Only 53 has no factors except 1 and itself.', {
      kind: 'eliminate',
      text: 'Digit sums: 5+1 = 6 and 5+7 = 12 are divisible by 3, so 51 and 57 are out. 49 = 7². That leaves 53.',
    }),
    { kind: 'truefalse', id: 'm1-factors-2', prompt: '1 is a prime number.', answer: false, explain: 'A prime needs exactly two factors. 1 has only one.' },
    divisibleBy(3),
    choiceStatic('m1-factors-3', 'The prime factorisation of 60 is…', ['2 × 3 × 10', '2² × 3 × 5', '2² × 15', '4 × 3 × 5'], 1, 'Every factor must be prime: 60 = 2 × 2 × 3 × 5 = 2² × 3 × 5.', {
      kind: 'eliminate',
      text: '10, 15 and 4 are not prime, so those options are out immediately.',
    }),
    { kind: 'input', id: 'm1-factors-4', prompt: 'How many factors does 12 have?', answers: ['6'], explain: '1, 2, 3, 4, 6, 12 makes six factors. Find them in pairs: 1×12, 2×6, 3×4.' },
    divisibleBy(9),
    {
      kind: 'match',
      id: 'm1-factors-5',
      prompt: 'Match each number to its smallest prime factor',
      pairs: [
        ['91', '7'],
        ['35', '5'],
        ['27', '3'],
        ['121', '11'],
      ],
      explain: '91 = 7 × 13, 35 = 5 × 7, 27 = 3 × 9, 121 = 11 × 11.',
    },
  ],
};

const hcfGen = (rng: Rng): Exercise => {
  const h = int(rng, 2, 12);
  let m = int(rng, 2, 7);
  let n = int(rng, 2, 7);
  while (gcd(m, n) !== 1 || m === n) {
    m = int(rng, 2, 7);
    n = int(rng, 2, 7);
  }
  return { kind: 'input', id: 'm1-hcf', prompt: `HCF of ${h * m} and ${h * n} = ?`, answers: [String(h)], explain: `${h * m} = ${h} × ${m} and ${h * n} = ${h} × ${n}. ${m} and ${n} share nothing, so the HCF is ${h}.` };
};

const lcmGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 12);
  let b = int(rng, 2, 12);
  while (b === a) b = int(rng, 2, 12);
  const l = lcm(a, b);
  return { kind: 'input', id: 'm1-lcm', prompt: `LCM of ${a} and ${b} = ?`, answers: [String(l)], explain: `Count up in ${Math.max(a, b)}s until you hit a multiple of ${Math.min(a, b)}: ${l}.`, tip: { kind: 'shortcut', text: 'List multiples of the BIGGER number and stop at the first one the smaller number divides.' } };
};

const hcfLcm: Lesson = {
  id: 'm1-hcf-lcm',
  title: 'HCF & LCM',
  icon: '🔗',
  teach: [
    {
      kind: 'teach',
      id: 'm1-hcf-t1',
      who: 'mei',
      title: 'Highest common factor, lowest common multiple',
      body: ['HCF: the biggest number that divides into both.', 'LCM: the smallest number both divide into.', 'With prime factors: HCF takes the LOWEST powers of shared primes; LCM takes the HIGHEST powers of every prime.'],
      example: ['24 = 2³ × 3,  36 = 2² × 3²', 'HCF = 2² × 3 = 12', 'LCM = 2³ × 3² = 72'],
    },
    {
      kind: 'teach',
      id: 'm1-hcf-t2',
      who: 'greta',
      title: 'A formula worth remembering',
      body: ['For any two numbers a and b: HCF × LCM = a × b.', 'So if you know three of them, you can find the fourth.'],
      example: ['HCF(24, 36) × LCM(24, 36) = 12 × 72 = 864 = 24 × 36 ✓'],
      hook: { kind: 'formula', text: 'LCM = (a × b) ÷ HCF' },
    },
  ],
  exercises: [
    hcfGen,
    choiceStatic('m1-hcf-1', 'HCF of 24 and 36 is…', ['6', '12', '72', '4'], 1, '24 = 2³ × 3, 36 = 2² × 3². Lowest powers of shared primes: 2² × 3 = 12.'),
    lcmGen,
    choiceStatic('m1-hcf-2', 'LCM of 4, 6 and 8 is…', ['48', '24', '12', '192'], 1, 'Multiples of 8: 8, 16, 24. 24 is divisible by 4 and 6, so the answer is 24.'),
    { kind: 'input', id: 'm1-hcf-3', prompt: 'Two numbers have HCF 6 and their product is 216. Their LCM is?', answers: ['36'], explain: 'LCM = product ÷ HCF = 216 ÷ 6 = 36.', tip: { kind: 'formula', text: 'HCF × LCM = a × b' } },
    { kind: 'truefalse', id: 'm1-hcf-4', prompt: 'The LCM of 5 and 7 is 35.', answer: true, explain: '5 and 7 share no factors, so their LCM is just 5 × 7 = 35.' },
    choiceStatic('m1-hcf-5', 'Two bells ring every 6 and 8 minutes. They ring together now. When do they next ring together?', ['14 min', '48 min', '24 min', '2 min'], 2, 'You need the LCM of 6 and 8: 24 minutes.', {
      kind: 'memory',
      text: '"Together again / at the same time" in a word problem means LCM. "Biggest equal groups" means HCF.',
    }),
    hcfGen,
  ],
};

/* Unit 2: Fractions, decimals and percentages */

/** A proper fraction already in lowest terms, so questions never show things like 2/4 or 4/4. */
function properFraction(rng: Rng, exceptDen?: number): [number, number] {
  for (;;) {
    const d = int(rng, 2, 9);
    const n = int(rng, 1, d - 1);
    if (gcd(n, d) === 1 && d !== exceptDen) return [n, d];
  }
}

const simplifyGen = (rng: Rng): Exercise => {
  const [p, q] = simplify(int(rng, 1, 9), int(rng, 2, 12));
  const [a, b] = p < q ? [p, q] : [q, p];
  if (a === b) return simplifyGen(rng);
  const k = int(rng, 2, 9);
  return { kind: 'input', id: 'm2-simp', prompt: `Simplify ${a * k}/${b * k}`, rational: [a, b], lowestTerms: true, explain: `Divide top and bottom by their HCF, ${k}: ${a * k}/${b * k} = ${frac(a, b)}.` };
};

const fractionsBasics: Lesson = {
  id: 'm2-fractions',
  title: 'Fractions & equivalence',
  icon: '🍕',
  teach: [
    {
      kind: 'teach',
      id: 'm2-frac-t1',
      who: 'mei',
      title: 'Top counts, bottom names',
      body: [
        'In 3/4, the denominator (4) says how many equal parts the whole is cut into. The numerator (3) says how many you have.',
        "Multiply or divide top AND bottom by the same number and the value doesn't change: 2/3 = 4/6 = 8/12.",
        'Simplest form: divide top and bottom by their HCF.',
      ],
      example: ['18/24 → HCF is 6 → 3/4'],
    },
    {
      kind: 'teach',
      id: 'm2-frac-t2',
      who: 'mei',
      title: 'Which fraction is bigger?',
      body: ['Cross-multiply: for a/b vs c/d compare a × d with c × b. The bigger product sits with the bigger fraction.'],
      example: ['5/8 vs 3/5 → 5 × 5 = 25 vs 3 × 8 = 24 → 5/8 is bigger'],
      hook: { kind: 'shortcut', text: 'Cross-multiplying is faster than finding a common denominator when you only need to compare.' },
    },
  ],
  exercises: [
    simplifyGen,
    choiceStatic('m2-frac-1', 'Which fraction equals 2/3?', ['4/5', '6/8', '8/12', '3/2'], 2, '8/12: divide top and bottom by 4 → 2/3.'),
    { kind: 'truefalse', id: 'm2-frac-2', prompt: '6/9 = 2/3', answer: true, explain: 'Divide top and bottom by 3: 6/9 = 2/3.' },
    simplifyGen,
    {
      kind: 'order',
      id: 'm2-frac-3',
      prompt: 'Order from smallest to biggest',
      tiles: ['1/3', '1/2', '2/3', '3/4'],
      explain: 'As decimals: 0.333…, 0.5, 0.666…, 0.75.',
    },
    choiceStatic('m2-frac-4', 'Which is bigger: 5/8 or 3/5?', ['5/8', '3/5', 'They are equal', "Can't tell"], 0, 'Cross-multiply: 5 × 5 = 25 vs 3 × 8 = 24, so 5/8 is bigger.', {
      kind: 'shortcut',
      text: 'Cross-multiply to compare fractions in seconds.',
    }),
    simplifyGen,
  ],
};

const addFracGen = (rng: Rng): Exercise => {
  const [a, b] = properFraction(rng);
  const [c, d] = properFraction(rng, b);
  // Subtract only when the answer stays positive.
  const sub = rng() < 0.4 && a * d > c * b;
  const [n, den] = simplify(sub ? a * d - c * b : a * d + c * b, b * d);
  const l = lcm(b, d);
  return {
    kind: 'input',
    id: sub ? 'm2-sub' : 'm2-add',
    prompt: `${a}/${b} ${sub ? '−' : '+'} ${c}/${d} = ?  (simplest form)`,
    rational: [n, den],
    lowestTerms: true,
    explain: `Common denominator ${l}: ${(a * l) / b}/${l} ${sub ? '−' : '+'} ${(c * l) / d}/${l} = ${frac(n, den)}.`,
  };
};

const addFractions: Lesson = {
  id: 'm2-add',
  title: 'Adding & subtracting fractions',
  icon: '➕',
  teach: [
    {
      kind: 'teach',
      id: 'm2-add-t1',
      who: 'mei',
      title: 'Same bottoms first',
      body: [
        'You can only add fractions with the same denominator.',
        '1. Find the LCM of the denominators.',
        '2. Convert each fraction to that denominator.',
        '3. Add or subtract the numerators. Keep the denominator.',
        '4. Simplify.',
        'Mixed numbers (like 2 1/2): turn them into improper fractions first, or add wholes and fractions separately.',
      ],
      example: ['1/4 + 1/6 → LCM 12 → 3/12 + 2/12 = 5/12'],
      hook: { kind: 'shortcut', text: 'Quick formula: a/b + c/d = (ad + bc) / bd. Then simplify.' },
    },
  ],
  exercises: [
    addFracGen,
    { kind: 'truefalse', id: 'm2-add-1', prompt: '1/2 + 1/3 = 2/5', answer: false, explain: 'Never add bottoms! 1/2 + 1/3 = 3/6 + 2/6 = 5/6.' },
    addFracGen,
    choiceStatic('m2-add-2', '2 1/2 + 1 1/3 = ?', ['3 2/5', '3 5/6', '3 1/6', '4 5/6'], 1, 'Wholes: 2 + 1 = 3. Fractions: 1/2 + 1/3 = 5/6. Total: 3 5/6.', {
      kind: 'eliminate',
      text: 'The answer must be a bit less than 4 (2.5 + 1.33 ≈ 3.8). That removes 4 5/6 and 3 1/6 straight away.',
    }),
    addFracGen,
    addFracGen,
  ],
};

/** "12/16 = 3/4", or just "3/4" when it's already simplest. */
const raw = (n: number, d: number) => (frac(n, d) === `${n}/${d}` ? `${n}/${d}` : `${n}/${d} = ${frac(n, d)}`);

const mulFracGen = (rng: Rng): Exercise => {
  const [a, b] = properFraction(rng);
  const [c, d] = properFraction(rng);
  const div = rng() < 0.5;
  const [n, den] = div ? simplify(a * d, b * c) : simplify(a * c, b * d);
  return {
    kind: 'input',
    id: div ? 'm2-div' : 'm2-mul',
    prompt: `${a}/${b} ${div ? '÷' : '×'} ${c}/${d} = ?  (simplest form)`,
    rational: [n, den],
    lowestTerms: true,
    explain: div
      ? `Keep, Change, Flip: ${a}/${b} × ${d}/${c} = ${raw(a * d, b * c)}.`
      : `Tops × tops, bottoms × bottoms: ${raw(a * c, b * d)}.`,
  };
};

const mulFractions: Lesson = {
  id: 'm2-mul',
  title: 'Multiplying & dividing fractions',
  icon: '🔁',
  teach: [
    {
      kind: 'teach',
      id: 'm2-mul-t1',
      who: 'mei',
      title: 'Multiply straight across',
      body: ['Top × top, bottom × bottom.', 'Cancel common factors BEFORE multiplying to keep numbers small.', '"Of" means multiply: 3/4 of 20 = 3/4 × 20 = 15.'],
      example: ['2/3 × 9/10 → cancel 3 with 9, 2 with 10 → 1/1 × 3/5 = 3/5'],
    },
    {
      kind: 'teach',
      id: 'm2-mul-t2',
      who: 'mei',
      title: 'Dividing: Keep, Change, Flip',
      body: ['Keep the first fraction.', 'Change ÷ to ×.', 'Flip the second fraction upside down.'],
      example: ['2/5 ÷ 4/3 = 2/5 × 3/4 = 6/20 = 3/10'],
      hook: { kind: 'memory', text: 'KCF means Keep, Change, Flip. Picture a kite: keep hold, change direction, flip it over.' },
    },
  ],
  exercises: [
    mulFracGen,
    choiceStatic('m2-mul-1', '3/4 of 20 = ?', ['15', '12', '80/3', '5'], 0, '20 ÷ 4 = 5, then × 3 = 15.', { kind: 'shortcut', text: 'Divide by the bottom first, then multiply by the top. Small numbers, fewer mistakes.' }),
    { kind: 'truefalse', id: 'm2-mul-2', prompt: '2/3 ÷ 1/3 = 2', answer: true, explain: 'KCF: 2/3 × 3/1 = 6/3 = 2. (How many thirds fit into two-thirds? Two.)' },
    {
      kind: 'order',
      id: 'm2-mul-3',
      prompt: 'Put the steps for 2/5 ÷ 4/3 in order',
      tiles: ['Keep 2/5', 'Change ÷ to ×', 'Flip 4/3 to 3/4', 'Multiply: 6/20', 'Simplify: 3/10'],
      explain: 'Keep, Change, Flip, multiply, simplify.',
    },
    mulFracGen,
    mulFracGen,
  ],
};

const decimalToFracGen = (rng: Rng): Exercise => {
  let k = int(rng, 1, 99);
  while (k % 10 === 0) k = int(rng, 1, 99);
  const [n, d] = simplify(k, 100);
  const shown = (k / 100).toFixed(2);
  return { kind: 'input', id: 'm2-dec-frac', prompt: `Write ${shown} as a fraction in simplest form`, rational: [n, d], lowestTerms: true, explain: `${shown} = ${k}/100 = ${frac(n, d)}.` };
};

const decimals: Lesson = {
  id: 'm2-decimals',
  title: 'Decimals & fractions',
  icon: '🔟',
  teach: [
    {
      kind: 'teach',
      id: 'm2-dec-t1',
      who: 'mei',
      title: 'Decimals are fractions in disguise',
      body: [
        'Places after the point are tenths, hundredths, thousandths…',
        'Decimal → fraction: put it over 10, 100 or 1000 and simplify. 0.35 = 35/100 = 7/20.',
        'Fraction → decimal: divide top by bottom. 3/8 = 3 ÷ 8 = 0.375.',
        'Multiplying decimals: multiply as whole numbers, then count the decimal places.',
      ],
      example: ['0.4 × 0.3 → 4 × 3 = 12 → 2 decimal places → 0.12'],
      hook: { kind: 'memory', text: 'Learn these by heart: 1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75, 1/5 = 0.2, 1/8 = 0.125, 1/3 = 0.333…' },
    },
  ],
  exercises: [
    {
      kind: 'match',
      id: 'm2-dec-1',
      prompt: 'Match each fraction to its decimal',
      pairs: [
        ['1/4', '0.25'],
        ['1/8', '0.125'],
        ['3/5', '0.6'],
        ['1/3', '0.333…'],
        ['7/20', '0.35'],
      ],
      explain: 'Divide top by bottom, or remember the common ones.',
    },
    decimalToFracGen,
    choiceStatic('m2-dec-2', '0.4 × 0.3 = ?', ['1.2', '0.12', '0.012', '0.7'], 1, '4 × 3 = 12, with 2 decimal places in total → 0.12.', { kind: 'shortcut', text: 'Count decimal places in the question; the answer has the same total.' }),
    { kind: 'input', id: 'm2-dec-3', prompt: '2.5 + 0.75 = ?', answers: ['3.25'], explain: 'Line up the points: 2.50 + 0.75 = 3.25.' },
    { kind: 'truefalse', id: 'm2-dec-4', prompt: '0.5 is bigger than 0.45', answer: true, explain: '0.5 = 0.50, and 50 hundredths beats 45 hundredths.' },
    decimalToFracGen,
  ],
};

const percentOfGen = (rng: Rng): Exercise => {
  const p = pickOne(rng, [10, 20, 25, 50, 5, 15, 75] as const);
  const base = { 10: 10, 20: 5, 25: 4, 50: 2, 5: 20, 15: 20, 75: 4 }[p];
  const n = base * int(rng, 2, 40);
  const ans = (p * n) / 100;
  const how: Record<number, string> = {
    10: `10%: move the point one place left → ${ans}.`,
    20: `20% = 2 × 10%: 2 × ${n / 10} = ${ans}.`,
    25: `25% = a quarter: ${n} ÷ 4 = ${ans}.`,
    50: `50% = half: ${n} ÷ 2 = ${ans}.`,
    5: `5% = half of 10%: ${n / 10} ÷ 2 = ${ans}.`,
    15: `15% = 10% + 5%: ${n / 10} + ${n / 20} = ${ans}.`,
    75: `75% = three quarters: ${n} ÷ 4 × 3 = ${ans}.`,
  };
  return { kind: 'input', id: 'm2-pct-of', prompt: `${p}% of ${n} = ?`, answers: [String(ans)], explain: how[p], tip: { kind: 'shortcut', text: 'Build any percentage from 10%, 5% and 1%.' } };
};

const percentages: Lesson = {
  id: 'm2-percent',
  title: 'Percentages',
  icon: '💯',
  teach: [
    {
      kind: 'teach',
      id: 'm2-pct-t1',
      who: 'mei',
      title: 'Per cent = per hundred',
      body: ['35% = 35/100 = 0.35.', 'Fraction → percentage: × 100. 3/5 = 0.6 = 60%.'],
      hook: {
        kind: 'shortcut',
        text: '10% → move the decimal point one place left. 5% → half of that. 1% → two places left. 15% = 10% + 5%.',
      },
    },
    {
      kind: 'teach',
      id: 'm2-pct-t2',
      who: 'greta',
      title: 'The swap trick',
      body: ['x% of y = y% of x. Pick whichever is easier.'],
      example: ['8% of 50 = 50% of 8 = 4'],
      hook: { kind: 'shortcut', text: "Both are just (x × y) ÷ 100, which is why swapping works." },
    },
  ],
  exercises: [
    percentOfGen,
    choiceStatic('m2-pct-1', '8% of 50 = ?', ['40', '4', '0.4', '400'], 1, 'Swap it: 50% of 8 = 4.', { kind: 'shortcut', text: 'x% of y = y% of x.' }),
    percentOfGen,
    { kind: 'input', id: 'm2-pct-2', prompt: '3/5 as a percentage = ?', answers: ['60'], suffix: '%', explain: '3/5 = 0.6 = 60%.' },
    { kind: 'truefalse', id: 'm2-pct-3', prompt: '0.07 = 7%', answer: true, explain: '0.07 = 7/100 = 7%.' },
    {
      kind: 'match',
      id: 'm2-pct-4',
      prompt: 'Match the fraction to the percentage',
      pairs: [
        ['1/2', '50%'],
        ['1/4', '25%'],
        ['1/5', '20%'],
        ['3/4', '75%'],
        ['1/10', '10%'],
      ],
      explain: 'Fraction × 100 = percentage.',
    },
    percentOfGen,
  ],
};

const increaseGen = (rng: Rng): Exercise => {
  const p = pickOne(rng, [10, 20, 25, 50, 5, 15] as const);
  const n = 100 * int(rng, 2, 30);
  const up = rng() < 0.5;
  const ans = up ? n + (n * p) / 100 : n - (n * p) / 100;
  return {
    kind: 'input',
    id: up ? 'm2-pct-up' : 'm2-pct-down',
    prompt: `₦${n.toLocaleString()} ${up ? 'increased' : 'decreased'} by ${p}% = ?`,
    prefix: '₦',
    answers: [String(ans)],
    explain: `${p}% of ${n} = ${(n * p) / 100}. ${n} ${up ? '+' : '−'} ${(n * p) / 100} = ${ans}. Or: ${n} × ${up ? 1 + p / 100 : 1 - p / 100} = ${ans}.`,
    tip: { kind: 'formula', text: `Increase by p%: × (1 + p/100). Decrease by p%: × (1 − p/100).` },
  };
};

const changeGen = (rng: Rng): Exercise => {
  const a = 20 * int(rng, 2, 25);
  const p = pickOne(rng, [5, 10, 20, 25, 50] as const);
  const b = a + (a * p) / 100;
  return {
    kind: 'input',
    id: 'm2-pct-chg',
    prompt: `A price rises from ₦${a} to ₦${b}. Percentage increase = ?`,
    suffix: '%',
    answers: [String(p)],
    explain: `Change = ${b - a}. ${b - a} ÷ ${a} × 100 = ${p}%.`,
    tip: { kind: 'formula', text: '% change = change ÷ ORIGINAL × 100' },
  };
};

const percentChange: Lesson = {
  id: 'm2-pct-change',
  title: 'Percentage increase & decrease',
  icon: '📈',
  teach: [
    {
      kind: 'teach',
      id: 'm2-chg-t1',
      who: 'mei',
      title: 'Change compared to the original',
      body: ['% change = (change ÷ original) × 100.', 'Increase by p%: multiply by (1 + p/100). Decrease by p%: multiply by (1 − p/100).'],
      example: ['₦800 up 15% → 800 × 1.15 = ₦920', '₦800 down 15% → 800 × 0.85 = ₦680'],
    },
    {
      kind: 'teach',
      id: 'm2-chg-t2',
      who: 'greta',
      title: 'The classic exam trap',
      body: ['Up 10% then down 10% does NOT bring you back.', '₦1000 × 1.1 = ₦1100, then × 0.9 = ₦990.', 'The second percentage is taken of a different (bigger) number.'],
      hook: { kind: 'eliminate', text: 'In JAMB, the "obvious" answer (back to the start) is usually the trap option.' },
    },
  ],
  exercises: [
    increaseGen,
    changeGen,
    choiceStatic('m2-chg-1', '₦1000 goes up 10%, then down 10%. Final price?', ['₦1000', '₦990', '₦1010', '₦900'], 1, '1000 × 1.1 = 1100, then 1100 × 0.9 = 990.'),
    choiceStatic('m2-chg-2', 'Multiplier for a 15% decrease is…', ['1.15', '0.15', '0.85', '0.015'], 2, '1 − 0.15 = 0.85.'),
    { kind: 'truefalse', id: 'm2-chg-3', prompt: 'Reducing ₦500 by 20% gives ₦400.', answer: true, explain: '20% of 500 = 100. 500 − 100 = 400.' },
    increaseGen,
    changeGen,
  ],
};

/* Unit 3: Speed maths */

const times5Gen = (rng: Rng): Exercise => {
  const m = pickOne(rng, [5, 25, 50] as const);
  const n = m === 25 ? 4 * int(rng, 3, 60) : 2 * int(rng, 6, 120);
  const how = { 5: `× 10 then ÷ 2: ${n * 10} ÷ 2`, 25: `× 100 then ÷ 4: ${n * 100} ÷ 4`, 50: `× 100 then ÷ 2: ${n * 100} ÷ 2` }[m];
  return {
    kind: 'input',
    id: 'm3-x5',
    prompt: `${n} × ${m} = ?`,
    answers: [String(n * m)],
    explain: `${how} = ${n * m}.`,
    tip: { kind: 'shortcut', text: '× 5 = × 10 ÷ 2.  × 25 = × 100 ÷ 4.  × 50 = × 100 ÷ 2.' },
  };
};

const times11Gen = (rng: Rng): Exercise => {
  const n = int(rng, 12, 98);
  const [a, b] = [Math.floor(n / 10), n % 10];
  const s = a + b;
  return {
    kind: 'input',
    id: 'm3-x11',
    prompt: `${n} × 11 = ?`,
    answers: [String(n * 11)],
    explain:
      s < 10
        ? `Split ${a}_${b}, put ${a} + ${b} = ${s} in the middle: ${a}${s}${b}.`
        : `Split ${a}_${b}, middle is ${a} + ${b} = ${s}, so carry the 1: ${a + 1}${s - 10}${b}.`,
    tip: { kind: 'shortcut', text: "Two-digit × 11: split the digits and put their sum in the middle (carry if it's 10 or more)." },
  };
};

const square5Gen = (rng: Rng): Exercise => {
  const t = int(rng, 1, 12);
  const n = t * 10 + 5;
  return {
    kind: 'input',
    id: 'm3-sq5',
    prompt: `${n}² = ?`,
    answers: [String(n * n)],
    explain: `${t} × ${t + 1} = ${t * (t + 1)}, then write 25: ${n * n}.`,
    tip: { kind: 'shortcut', text: 'Squaring a number ending in 5: (front) × (front + 1), then stick 25 on the end.' },
  };
};

const lo = (n: number) => Math.floor(n / 10) * 10;
const hi = (n: number) => Math.ceil(n / 10) * 10;

const estimateGen = (rng: Rng): Exercise => {
  const a = int(rng, 21, 89);
  const b = int(rng, 11, 49);
  const right = a * b;
  // Each wrong option fails the last-digit check or the size check.
  const wrongLast = right + pickOne(rng, [1, 2, 3, 4]);
  return choice(
    rng,
    {
      id: 'm3-est',
      prompt: `${a} × ${b} = ?  (don't multiply it out)`,
      explain: `Last digits: ${a % 10} × ${b % 10} ends in ${(a * b) % 10}. Size: between ${lo(a)} × ${lo(b)} = ${lo(a) * lo(b)} and ${hi(a)} × ${hi(b)} = ${hi(a) * hi(b)}. Only ${right} passes both checks.`,
      tip: { kind: 'eliminate', text: 'Two quick checks kill most options: the last digit, and a rough size estimate.' },
    },
    String(right),
    [String(wrongLast), String(right * 10), String(Math.floor(right / 10)), String(right + 5)],
  );
};

const speed: Lesson[] = [
  {
    id: 'm3-x5',
    title: '× 5, × 25, × 50 in your head',
    icon: '⚡',
    teach: [
      {
        kind: 'teach',
        id: 'm3-x5-t1',
        who: 'mei',
        title: 'Speed is understanding, practised',
        body: ['5 is 10 ÷ 2. So × 5 = × 10, then halve.', '25 is 100 ÷ 4. So × 25 = × 100, then quarter.', '50 is 100 ÷ 2. So × 50 = × 100, then halve.'],
        example: ['48 × 5 → 480 ÷ 2 = 240', '36 × 25 → 3600 ÷ 4 = 900'],
      },
    ],
    exercises: [times5Gen, times5Gen, times5Gen, times5Gen, times5Gen, times5Gen],
  },
  {
    id: 'm3-x11',
    title: '× 11 trick',
    icon: '🎯',
    teach: [
      {
        kind: 'teach',
        id: 'm3-x11-t1',
        who: 'mei',
        title: 'Split and fill the middle',
        body: ['For a two-digit number × 11: split the digits apart and put their sum in the gap.', 'If the sum is 10 or more, carry the 1 into the first digit.'],
        example: ['36 × 11 → 3 (3+6) 6 → 396', '78 × 11 → 7 (15) 8 → carry → 858'],
        hook: { kind: 'formula', text: 'Why it works: n × 11 = n × 10 + n. The middle digit is where the two copies overlap.' },
      },
    ],
    exercises: [times11Gen, times11Gen, times11Gen, times11Gen, times11Gen, times11Gen],
  },
  {
    id: 'm3-sq5',
    title: 'Squares ending in 5',
    icon: '🟧',
    teach: [
      {
        kind: 'teach',
        id: 'm3-sq5-t1',
        who: 'greta',
        title: 'Front × next, then 25',
        body: ['Take the digits in front of the 5, multiply by the next number up, then write 25 after it.'],
        example: ['35² → 3 × 4 = 12 → 1225', '85² → 8 × 9 = 72 → 7225'],
        hook: { kind: 'formula', text: "(10t + 5)² = 100·t(t + 1) + 25. That's the whole trick." },
      },
    ],
    exercises: [square5Gen, square5Gen, square5Gen, square5Gen, square5Gen],
  },
  {
    id: 'm3-est',
    title: 'Estimate & eliminate',
    icon: '🔍',
    teach: [
      {
        kind: 'teach',
        id: 'm3-est-t1',
        who: 'greta',
        title: 'Look at the options before you calculate',
        body: [
          'Last-digit check: the last digit of a product depends only on the last digits.',
          'Size check: round both numbers down, then both up. The answer sits between the two products.',
          'Most wrong options fail one of the two checks. In an exam this saves minutes.',
        ],
        example: ['49 × 21: ends in 9 (9 × 1), between 40 × 20 = 800 and 50 × 30 = 1500 → 1029'],
        hook: { kind: 'eliminate', text: 'Never skip the reasoning. Do the reasoning faster. Check, eliminate, then commit.' },
      },
    ],
    exercises: [estimateGen, estimateGen, estimateGen, estimateGen, estimateGen],
  },
];

export const MATHS: Course = {
  id: 'maths',
  title: 'Mathematics',
  icon: '➗',
  units: [
    {
      id: 'm-u1',
      title: 'Number foundations',
      description: 'Types of numbers, negatives, BODMAS, factors, HCF & LCM',
      who: 'mei',
      color: '#2fd27a',
      lessons: [typesOfNumbers, negatives, signs, bodmas, factors, hcfLcm],
    },
    {
      id: 'm-u2',
      title: 'Fractions, decimals & percentages',
      description: 'The everyday maths behind half of all JAMB questions',
      who: 'mei',
      color: '#4ea4ff',
      lessons: [fractionsBasics, addFractions, mulFractions, decimals, percentages, percentChange],
    },
    {
      id: 'm-u3',
      title: 'Speed maths',
      description: 'Mental shortcuts and option elimination',
      who: 'greta',
      color: '#f5b938',
      lessons: speed,
    },
  ],
  upcoming: ['Number bases', 'Indices & logarithms', 'Surds', 'Sets', 'Algebra & formula manipulation', 'Equations & inequalities'],
};

