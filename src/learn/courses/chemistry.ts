import type { Course, Exercise, Lesson, Rng } from '../types';
import { choice, dec, gcd, int, match, mc, order, pickOne, teach, tf } from '../util';

export const ELEMENTS = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
const NAMES = ['Hydrogen', 'Helium', 'Lithium', 'Beryllium', 'Boron', 'Carbon', 'Nitrogen', 'Oxygen', 'Fluorine', 'Neon', 'Sodium', 'Magnesium', 'Aluminium', 'Silicon', 'Phosphorus', 'Sulphur', 'Chlorine', 'Argon', 'Potassium', 'Calcium'];

/** Shell filling for the first 20 elements: 2, 8, 8, then 2. */
export function config(z: number): number[] {
  return [Math.min(z, 2), Math.min(Math.max(z - 2, 0), 8), Math.min(Math.max(z - 10, 0), 8), Math.max(z - 18, 0)].filter((n) => n > 0);
}

/** Group by valence electrons (noble gases are group 0) and period by number of shells. */
export function groupPeriod(z: number): { group: string; period: number } {
  const c = config(z);
  const outer = c[c.length - 1];
  const noble = z === 2 || outer === 8;
  return { group: noble ? '0' : String(outer), period: c.length };
}

export const MASS: Record<string, number> = { H: 1, C: 12, N: 14, O: 16, Na: 23, Mg: 24, Al: 27, S: 32, Cl: 35.5, K: 39, Ca: 40 };

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const sub = (n: number) => (n === 1 ? '' : String(n).replace(/\d/g, (d) => SUB[+d]));

/** Compounds with their composition, so molar masses are computed, never typed by hand. */
const COMPOUNDS: { name: string; formula: string; parts: Record<string, number> }[] = [
  { name: 'water', formula: 'H₂O', parts: { H: 2, O: 1 } },
  { name: 'carbon dioxide', formula: 'CO₂', parts: { C: 1, O: 2 } },
  { name: 'sodium chloride', formula: 'NaCl', parts: { Na: 1, Cl: 1 } },
  { name: 'calcium carbonate', formula: 'CaCO₃', parts: { Ca: 1, C: 1, O: 3 } },
  { name: 'sulphuric acid', formula: 'H₂SO₄', parts: { H: 2, S: 1, O: 4 } },
  { name: 'sodium hydroxide', formula: 'NaOH', parts: { Na: 1, O: 1, H: 1 } },
  { name: 'ammonia', formula: 'NH₃', parts: { N: 1, H: 3 } },
  { name: 'methane', formula: 'CH₄', parts: { C: 1, H: 4 } },
  { name: 'magnesium oxide', formula: 'MgO', parts: { Mg: 1, O: 1 } },
  { name: 'hydrochloric acid', formula: 'HCl', parts: { H: 1, Cl: 1 } },
  { name: 'nitric acid', formula: 'HNO₃', parts: { H: 1, N: 1, O: 3 } },
  { name: 'glucose', formula: 'C₆H₁₂O₆', parts: { C: 6, H: 12, O: 6 } },
];

export const molarMass = (parts: Record<string, number>) => Object.entries(parts).reduce((s, [el, n]) => s + MASS[el] * n, 0);

/* Matter */

const matter: Lesson = {
  id: 'c1-matter',
  title: 'Matter & changes of state',
  icon: '🧊',
  teach: [
    teach('c1-matter-t1', 'greta', 'Everything is particles', [
      'Matter is anything that has mass and takes up space. It exists as solid, liquid or gas.',
      'Solid: particles tightly packed, vibrate in place. Liquid: close but can slide past each other. Gas: far apart, moving fast and randomly.',
      'Melting (solid to liquid), freezing (liquid to solid), evaporation or boiling (liquid to gas), condensation (gas to liquid), sublimation (solid straight to gas, like iodine or naphthalene).',
    ]),
    teach('c1-matter-t2', 'greta', 'Element, compound or mixture?', [
      'Element: one kind of atom only (oxygen, iron).',
      'Compound: two or more elements chemically joined in a fixed ratio (water, H₂O). Separating it needs a chemical reaction.',
      'Mixture: substances mixed but not joined (air, salt water). Separate by physical methods: filtration, distillation, evaporation.',
    ], { hook: { kind: 'memory', text: 'Compound = chemically bonded, fixed ratio. Mixture = just mixed, any ratio.' } }),
  ],
  exercises: [
    match('c1-matter-1', 'Match the change to its name', [['Solid → liquid', 'Melting'], ['Liquid → solid', 'Freezing'], ['Gas → liquid', 'Condensation'], ['Solid → gas', 'Sublimation']], 'These four plus evaporation cover every change of state.'),
    mc('c1-matter-2', 'Which is a compound?', ['Air', 'Oxygen', 'Water', 'Sea water'], 2, 'Water is hydrogen and oxygen chemically joined, H₂O. Air and sea water are mixtures; oxygen is an element.'),
    tf('c1-matter-3', 'In a gas, particles are far apart and move randomly.', true, 'That is why gases spread out and can be compressed.'),
    mc('c1-matter-4', 'Which substance sublimes when heated?', ['Common salt', 'Iodine', 'Sand', 'Sugar'], 1, 'Iodine goes straight from solid to purple vapour.'),
    mc('c1-matter-5', 'Salt can be recovered from salt water by…', ['Filtration', 'Evaporation', 'Magnetism', 'Sieving'], 1, 'Dissolved salt passes through filter paper; evaporate the water to leave the salt.', { kind: 'eliminate', text: 'Filtration only removes undissolved solids, so it is out straight away.' }),
    tf('c1-matter-6', 'A mixture always has a fixed composition.', false, 'Compounds have a fixed composition. Mixtures can be in any ratio.'),
  ],
};

/* Atomic structure */

const nucleonGen = (rng: Rng): Exercise => {
  const z = int(rng, 3, 20);
  const n = z + int(rng, 0, 2);
  const a = z + n;
  const ask = pickOne(rng, ['n', 'a', 'e'] as const);
  if (ask === 'n') return { kind: 'input', id: 'c1-neutrons', prompt: `An atom has atomic number ${z} and mass number ${a}. How many neutrons?`, answers: [String(n)], explain: `Neutrons = A − Z = ${a} − ${z} = ${n}.`, tip: { kind: 'formula', text: 'A = protons + neutrons, so neutrons = A − Z.' } };
  if (ask === 'a') return { kind: 'input', id: 'c1-mass-no', prompt: `An atom has ${z} protons and ${n} neutrons. Mass number?`, answers: [String(a)], explain: `A = protons + neutrons = ${z} + ${n} = ${a}.` };
  return { kind: 'input', id: 'c1-electrons', prompt: `A neutral atom of ${NAMES[z - 1].toLowerCase()} (Z = ${z}) has how many electrons?`, answers: [String(z)], explain: `Neutral atom: electrons = protons = Z = ${z}.` };
};

const configGen = (rng: Rng): Exercise => {
  const z = int(rng, 3, 20);
  const right = config(z).join(', ');
  const wrong = [config(Math.max(1, z - 1)).join(', '), config(Math.min(20, z + 1)).join(', '), [Math.min(z, 2), z - 2].join(', '), [2, 8, z - 10].filter((x) => x > 0).join(', ')];
  return choice(rng, { id: 'c1-config', prompt: `Electron configuration of ${NAMES[z - 1].toLowerCase()} (Z = ${z})?`, explain: `Fill shells 2, then 8, then 8: ${right}. The numbers must add up to ${z}.`, tip: { kind: 'eliminate', text: 'Add up each option. Only one adds to Z, and no shell can break the 2, 8, 8 limits.' } }, right, wrong);
};

const atoms: Lesson = {
  id: 'c1-atoms',
  title: 'Atomic structure',
  icon: '⚛️',
  teach: [
    teach('c1-atoms-t1', 'greta', 'Inside the atom', [
      'Protons: positive charge, mass 1, in the nucleus.',
      'Neutrons: no charge, mass 1, in the nucleus.',
      'Electrons: negative charge, almost no mass (about 1/1840), moving in shells around the nucleus.',
      'Atomic number Z = number of protons. Mass number A = protons + neutrons.',
      'Isotopes: same element (same Z), different numbers of neutrons, like carbon-12 and carbon-14.',
    ]),
    teach('c1-atoms-t2', 'greta', 'Filling the shells', ['First shell holds 2 electrons, the next 8, the next 8 (for the first 20 elements).'], { example: ['Sodium, Z = 11 → 2, 8, 1', 'Chlorine, Z = 17 → 2, 8, 7', 'Calcium, Z = 20 → 2, 8, 8, 2'] }),
  ],
  exercises: [
    match('c1-atoms-1', 'Match the particle to its charge', [['Proton', 'Positive'], ['Neutron', 'No charge'], ['Electron', 'Negative']], 'Protons and neutrons sit in the nucleus; electrons orbit in shells.'),
    nucleonGen,
    configGen,
    tf('c1-atoms-2', 'Isotopes of an element have different numbers of protons.', false, 'Isotopes have the same protons (same element) but different neutrons.'),
    nucleonGen,
    configGen,
  ],
};

/* Periodic table */

const groupGen = (rng: Rng): Exercise => {
  const z = int(rng, 1, 20);
  const { group, period } = groupPeriod(z);
  const label = (g: string, p: number) => `Group ${g === '0' ? '0' : roman(+g)}, Period ${p}`;
  const right = label(group, period);
  const wrong = [label(group, Math.max(1, period - 1)), label(group === '0' ? '1' : String(Math.min(7, +group + 1)), period), label(String(period > 7 ? 1 : period), +group || 1), label('0', period + 1)];
  return choice(rng, { id: 'c1-group', prompt: `Where is ${NAMES[z - 1].toLowerCase()} (Z = ${z}) in the periodic table?`, explain: `Configuration ${config(z).join(', ')}: ${config(z).length} shell(s) gives the period; ${group === '0' ? 'a full outer shell means group 0' : `${group} outer electron(s) gives the group`}.`, tip: { kind: 'shortcut', text: 'Group = electrons in the outer shell. Period = number of shells.' } }, right, wrong);
};

const roman = (n: number) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][n] ?? String(n);

const periodic: Lesson = {
  id: 'c1-periodic',
  title: 'The periodic table',
  icon: '🧪',
  teach: [
    teach('c1-periodic-t1', 'greta', 'Rows and columns that mean something', [
      'Elements are arranged by atomic number.',
      'Groups (columns): elements with the same number of outer electrons, so similar chemistry.',
      'Periods (rows): elements with the same number of shells.',
      'Group I: alkali metals (Li, Na, K), very reactive. Group VII: halogens (F, Cl). Group 0: noble gases (He, Ne, Ar), unreactive because their outer shell is full.',
    ], { hook: { kind: 'memory', text: 'First 20 in order: "Happy Henry Likes Beer But Could Not Obtain Food. Nelly Nancy Might Also Sing Pop Songs, Clara Always Keeps Calm." H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca.' } }),
  ],
  exercises: [
    groupGen,
    mc('c1-periodic-1', 'Why are noble gases unreactive?', ['They are metals', 'Their outer shell is full', 'They have no protons', 'They are liquids'], 1, "A full outer shell is stable, so they don't need to gain, lose or share electrons."),
    order('c1-periodic-2', 'Order by atomic number', ['H', 'He', 'Li', 'Be', 'B', 'C'], 'H 1, He 2, Li 3, Be 4, B 5, C 6.'),
    groupGen,
    tf('c1-periodic-3', 'Sodium and potassium are in the same group.', true, 'Both have 1 outer electron: group I, the alkali metals.'),
    groupGen,
  ],
};

/* Formulas and valency */

const CATIONS = [
  { name: 'sodium', sym: 'Na', v: 1 },
  { name: 'potassium', sym: 'K', v: 1 },
  { name: 'magnesium', sym: 'Mg', v: 2 },
  { name: 'calcium', sym: 'Ca', v: 2 },
  { name: 'aluminium', sym: 'Al', v: 3 },
  { name: 'ammonium', sym: 'NH₄', v: 1, poly: true },
];
const ANIONS = [
  { name: 'chloride', sym: 'Cl', v: 1 },
  { name: 'oxide', sym: 'O', v: 2 },
  { name: 'hydroxide', sym: 'OH', v: 1, poly: true },
  { name: 'nitrate', sym: 'NO₃', v: 1, poly: true },
  { name: 'sulphate', sym: 'SO₄', v: 2, poly: true },
  { name: 'carbonate', sym: 'CO₃', v: 2, poly: true },
];

const part = (sym: string, n: number, poly?: boolean) => (n === 1 ? sym : poly ? `(${sym})${sub(n)}` : `${sym}${sub(n)}`);

/** Criss-cross the valencies and cancel common factors. */
export function formula(c: (typeof CATIONS)[number], a: (typeof ANIONS)[number]): string {
  const g = gcd(c.v, a.v);
  return part(c.sym, a.v / g, c.poly) + part(a.sym, c.v / g, a.poly);
}

const formulaGen = (rng: Rng): Exercise => {
  let c = pickOne(rng, CATIONS);
  let a = pickOne(rng, ANIONS);
  // Skip pairs that aren't standard exam compounds.
  while ((c.sym === 'NH₄' && (a.sym === 'OH' || a.sym === 'O')) || (c.sym === 'Al' && a.sym === 'CO₃')) {
    c = pickOne(rng, CATIONS);
    a = pickOne(rng, ANIONS);
  }
  const right = formula(c, a);
  // Common mistakes first; extra ratios guarantee three distinct wrong options when both valencies are 1.
  const wrong = [
    part(c.sym, c.v, c.poly) + part(a.sym, a.v, a.poly),
    c.sym + a.sym,
    `${c.sym}${sub(a.v)}${a.sym}${sub(c.v)}`,
    part(c.sym, a.v + 1, c.poly) + part(a.sym, c.v, a.poly),
    part(c.sym, 2, c.poly) + part(a.sym, 1, a.poly),
    part(c.sym, 1, c.poly) + part(a.sym, 2, a.poly),
    part(c.sym, 1, c.poly) + part(a.sym, 3, a.poly),
  ];
  return choice(rng, { id: 'c1-formula', prompt: `Formula of ${c.name} ${a.name}?`, explain: `${c.sym} has valency ${c.v}, ${a.sym} has valency ${a.v}. Criss-cross and simplify: ${right}.`, tip: { kind: 'shortcut', text: "Criss-cross: each valency becomes the other one's number. Brackets go round a polyatomic ion when there is more than one." } }, right, wrong);
};

const formulas: Lesson = {
  id: 'c1-formulas',
  title: 'Valency & chemical formulas',
  icon: '🔗',
  teach: [
    teach('c1-formulas-t1', 'greta', 'Combining power', [
      'Valency is how many bonds an atom or ion forms.',
      'Valency 1: Na, K, H, Cl, OH (hydroxide), NO₃ (nitrate), NH₄ (ammonium).',
      'Valency 2: Mg, Ca, Zn, O, SO₄ (sulphate), CO₃ (carbonate).',
      'Valency 3: Al, PO₄ (phosphate).',
    ], { example: ['Aluminium (3) + oxide (2) → Al₂O₃', 'Calcium (2) + hydroxide (1) → Ca(OH)₂', 'Magnesium (2) + oxide (2) → Mg₂O₂ → MgO'], hook: { kind: 'shortcut', text: 'Criss-cross the valencies, then cancel if both numbers share a factor.' } }),
  ],
  exercises: [formulaGen, formulaGen, mc('c1-formulas-1', 'The valency of the sulphate ion (SO₄) is…', ['1', '2', '3', '4'], 1, 'Sulphate is SO₄²⁻, valency 2. The 4 is the number of oxygen atoms, not the valency.', { kind: 'eliminate', text: "Don't confuse the small number in the formula with the valency." }), formulaGen, formulaGen],
};

/* Relative molecular mass and the mole */

const mrGen = (rng: Rng): Exercise => {
  const c = pickOne(rng, COMPOUNDS);
  const m = molarMass(c.parts);
  const working = Object.entries(c.parts).map(([el, n]) => (n === 1 ? `${MASS[el]}` : `${n}×${MASS[el]}`)).join(' + ');
  return { kind: 'input', id: 'c1-mr', prompt: `Relative molecular mass of ${c.formula} (${c.name})?`, answers: [dec(m)], explain: `${working} = ${dec(m)}.`, tip: { kind: 'memory', text: 'Know these by heart: H 1, C 12, N 14, O 16, Na 23, Mg 24, Al 27, S 32, Cl 35.5, K 39, Ca 40.' } };
};

const moleGen = (rng: Rng): Exercise => {
  const c = pickOne(rng, COMPOUNDS.filter((x) => Number.isInteger(molarMass(x.parts))));
  const M = molarMass(c.parts);
  const n = pickOne(rng, [0.5, 1, 2, 3, 0.25, 4]);
  const m = n * M;
  return rng() < 0.5
    ? { kind: 'input', id: 'c1-moles', prompt: `How many moles in ${dec(m)} g of ${c.formula}? (Mr = ${M})`, answers: [dec(n)], explain: `n = mass ÷ Mr = ${dec(m)} ÷ ${M} = ${dec(n)} mol.`, tip: { kind: 'formula', text: 'n = m / M' } }
    : { kind: 'input', id: 'c1-mass', prompt: `Mass (g) of ${dec(n)} mol of ${c.formula}? (Mr = ${M})`, answers: [dec(m)], explain: `m = n × Mr = ${dec(n)} × ${M} = ${dec(m)} g.`, tip: { kind: 'formula', text: 'm = n × M' } };
};

const mole: Lesson = {
  id: 'c1-mole',
  title: 'Molar mass & the mole',
  icon: '⚖️',
  teach: [
    teach('c1-mole-t1', 'greta', 'Counting atoms by weighing them', [
      'Relative molecular mass (Mr): add up the relative atomic masses of every atom in the formula.',
      "A mole is 6.02 × 10²³ particles (Avogadro's number).",
      'One mole of a substance has a mass equal to its Mr in grams.',
      'Moles = mass ÷ molar mass: n = m / M.',
    ], { example: ['H₂O: 2×1 + 16 = 18', '36 g of water = 36 ÷ 18 = 2 mol'] }),
  ],
  exercises: [mrGen, moleGen, mc('c1-mole-1', 'One mole of any substance contains…', ['6.02 × 10²³ particles', '1000 particles', '22.4 particles', '12 particles'], 0, "That is Avogadro's number."), mrGen, moleGen, moleGen],
};

export const CHEMISTRY: Course = {
  id: 'chemistry',
  title: 'Chemistry',
  icon: '🧪',
  units: [
    { id: 'c-u1', title: 'Matter & atoms', description: 'States of matter, atomic structure, the periodic table', who: 'greta', color: '#34d399', lessons: [matter, atoms, periodic] },
    { id: 'c-u2', title: 'Formulas & the mole', description: 'Valency, formulas, molar mass and moles', who: 'greta', color: '#f472b6', lessons: [formulas, mole] },
  ],
  upcoming: ['Chemical equations', 'Acids, bases & salts', 'Gas laws', 'Electrolysis', 'Rates & equilibrium', 'Organic chemistry'],
};

export { NAMES as ELEMENT_NAMES };
