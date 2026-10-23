import type { Exercise, Rng, Unit } from '../types';
import { choice, int, match, mc, order, pickOne, teach, tf } from '../util';

/* Physics: work, energy and power */

const workGen = (rng: Rng): Exercise => {
  const kind = pickOne(rng, ['work', 'ke', 'pe', 'power'] as const);
  if (kind === 'work') {
    const f = int(rng, 5, 60);
    const d = int(rng, 2, 20);
    return { kind: 'input', id: 'p3-work', prompt: `A ${f} N force moves a box ${d} m. Work done (J)?`, answers: [String(f * d)], explain: `W = F × d = ${f} × ${d} = ${f * d} J.`, tip: { kind: 'formula', text: 'W = F × d' } };
  }
  if (kind === 'ke') {
    const m = 2 * int(rng, 1, 10);
    const v = int(rng, 2, 12);
    const ke = (m * v * v) / 2;
    return { kind: 'input', id: 'p3-ke', prompt: `Kinetic energy (J) of a ${m} kg object moving at ${v} m/s?`, answers: [String(ke)], explain: `KE = ½mv² = ½ × ${m} × ${v}² = ½ × ${m} × ${v * v} = ${ke} J.`, tip: { kind: 'formula', text: 'KE = ½mv². Square the speed first.' } };
  }
  if (kind === 'pe') {
    const m = int(rng, 1, 30);
    const h = int(rng, 2, 25);
    return { kind: 'input', id: 'p3-pe', prompt: `Potential energy (J) of ${m} kg lifted ${h} m? (g = 10 m/s²)`, answers: [String(m * 10 * h)], explain: `PE = mgh = ${m} × 10 × ${h} = ${m * 10 * h} J.`, tip: { kind: 'formula', text: 'PE = mgh' } };
  }
  const t = int(rng, 2, 20);
  const p = 5 * int(rng, 2, 40);
  return { kind: 'input', id: 'p3-power', prompt: `${p * t} J of work is done in ${t} s. Power (W)?`, answers: [String(p)], explain: `P = W ÷ t = ${p * t} ÷ ${t} = ${p} W.`, tip: { kind: 'formula', text: 'P = W / t. 1 watt = 1 joule per second.' } };
};

const efficiencyGen = (rng: Rng): Exercise => {
  const total = 100 * int(rng, 2, 20);
  const pct = pickOne(rng, [20, 25, 40, 50, 60, 75, 80] as const);
  const useful = (total * pct) / 100;
  return { kind: 'input', id: 'p3-eff', prompt: `A machine takes in ${total} J and gives out ${useful} J of useful energy. Efficiency (%)?`, suffix: '%', answers: [String(pct)], explain: `Efficiency = useful ÷ total × 100 = ${useful} ÷ ${total} × 100 = ${pct}%.`, tip: { kind: 'eliminate', text: 'Efficiency can never be more than 100%. Any option above 100 is wrong.' } };
};

export const PHYSICS_MORE: Unit[] = [
  {
    id: 'p-u3',
    title: 'Energy',
    description: 'Work, kinetic and potential energy, power, efficiency',
    who: 'greta',
    color: '#f59e0b',
    lessons: [
      {
        id: 'p3-energy',
        title: 'Work, energy & power',
        icon: '🔋',
        teach: [
          teach('p3-energy-t1', 'greta', 'Energy is the ability to do work', [
            'Work is done when a force moves something: W = F × d, in joules (J).',
            'Kinetic energy is energy of motion: KE = ½mv².',
            'Potential energy is stored by height: PE = mgh.',
            'Power is how fast work is done: P = W / t, in watts (W).',
            'Energy is never created or destroyed, only changed from one form to another (conservation of energy).',
          ], { example: ['A ball dropped from a height: PE at the top becomes KE at the bottom.'], hook: { kind: 'memory', text: 'Joules for energy, watts for power. A 100 W bulb uses 100 J every second.' } }),
        ],
        exercises: [workGen, workGen, tf('p3-energy-1', 'Doubling the speed of a car doubles its kinetic energy.', false, 'KE depends on v². Double the speed gives four times the KE.'), workGen, workGen, mc('p3-energy-2', 'The unit of power is the…', ['joule', 'newton', 'watt', 'pascal'], 2, 'Power is measured in watts (J/s).')],
      },
      {
        id: 'p3-efficiency',
        title: 'Conservation & efficiency',
        icon: '♻️',
        teach: [
          teach('p3-eff-t1', 'greta', 'No machine is perfect', [
            'Efficiency = useful energy out ÷ total energy in × 100%.',
            'The rest is "wasted", usually as heat and sound.',
            'Efficiency is always less than 100% in real machines.',
          ], { example: ['A bulb takes in 100 J and gives out 20 J of light: efficiency = 20 ÷ 100 × 100 = 20%. The other 80 J becomes heat.'], hook: { kind: 'eliminate', text: 'An answer over 100% is always wrong: no machine gives out more than it takes in.' } }),
        ],
        exercises: [efficiencyGen, efficiencyGen, match('p3-eff-1', 'Match the device to its main energy change', [['Torch', 'Chemical → light'], ['Electric fan', 'Electrical → kinetic'], ['Solar panel', 'Light → electrical'], ['Generator', 'Kinetic → electrical']], 'Name what goes in and what useful energy comes out.'), efficiencyGen],
      },
    ],
  },
];

/* Chemistry: equations, acids, bases and salts */

const EQUATIONS: { q: string; right: string; wrong: string[]; why: string }[] = [
  { q: 'H₂ + O₂ → H₂O', right: '2H₂ + O₂ → 2H₂O', wrong: ['H₂ + O₂ → 2H₂O', '2H₂ + 2O₂ → 2H₂O', 'H₂ + 2O₂ → H₂O'], why: '4 H and 2 O on each side.' },
  { q: 'N₂ + H₂ → NH₃', right: 'N₂ + 3H₂ → 2NH₃', wrong: ['N₂ + H₂ → 2NH₃', 'N₂ + 2H₂ → 2NH₃', '2N₂ + 3H₂ → 2NH₃'], why: '2 N and 6 H on each side.' },
  { q: 'Mg + O₂ → MgO', right: '2Mg + O₂ → 2MgO', wrong: ['Mg + O₂ → 2MgO', 'Mg + 2O₂ → MgO', '2Mg + 2O₂ → 2MgO'], why: '2 Mg and 2 O on each side.' },
  { q: 'CH₄ + O₂ → CO₂ + H₂O', right: 'CH₄ + 2O₂ → CO₂ + 2H₂O', wrong: ['CH₄ + O₂ → CO₂ + 2H₂O', 'CH₄ + 3O₂ → CO₂ + 2H₂O', '2CH₄ + O₂ → CO₂ + H₂O'], why: '1 C, 4 H and 4 O on each side.' },
  { q: 'Na + Cl₂ → NaCl', right: '2Na + Cl₂ → 2NaCl', wrong: ['Na + Cl₂ → 2NaCl', 'Na + 2Cl₂ → NaCl', '2Na + 2Cl₂ → 2NaCl'], why: '2 Na and 2 Cl on each side.' },
  { q: 'Fe + O₂ → Fe₂O₃', right: '4Fe + 3O₂ → 2Fe₂O₃', wrong: ['2Fe + O₂ → Fe₂O₃', '4Fe + O₂ → 2Fe₂O₃', '2Fe + 3O₂ → 2Fe₂O₃'], why: '4 Fe and 6 O on each side.' },
];

const balanceGen = (rng: Rng): Exercise => {
  const e = pickOne(rng, EQUATIONS);
  return choice(rng, { id: 'c3-balance', prompt: `Which correctly balances ${e.q}?`, explain: `${e.right}: ${e.why}`, tip: { kind: 'shortcut', text: 'Count each kind of atom on both sides. Balance the element that appears in the fewest places first; oxygen and hydrogen usually last.' } }, e.right, e.wrong);
};

export const CHEMISTRY_MORE: Unit[] = [
  {
    id: 'c-u3',
    title: 'Reactions',
    description: 'Balancing equations, acids, bases and salts',
    who: 'greta',
    color: '#fb923c',
    lessons: [
      {
        id: 'c3-equations',
        title: 'Balancing equations',
        icon: '⚖️',
        teach: [
          teach('c3-eq-t1', 'greta', 'Atoms are never lost', [
            'In a reaction, atoms are rearranged, never created or destroyed (conservation of mass).',
            'So both sides of an equation must have the same number of each kind of atom.',
            'Balance by changing the big numbers in front (coefficients), never the small numbers in formulas.',
          ], { example: ['H₂ + O₂ → H₂O has 2 O on the left, 1 on the right', 'Put 2 in front of H₂O: H₂ + O₂ → 2H₂O (now 4 H on the right)', 'Put 2 in front of H₂: 2H₂ + O₂ → 2H₂O ✓'], hook: { kind: 'memory', text: 'You may change how many molecules, never what the molecules are.' } }),
        ],
        exercises: [balanceGen, balanceGen, tf('c3-eq-1', 'To balance an equation you may change H₂O to H₂O₂.', false, 'That changes the substance (water becomes hydrogen peroxide). Only change the coefficients.'), balanceGen, balanceGen],
      },
      {
        id: 'c3-acids',
        title: 'Acids, bases & salts',
        icon: '🧪',
        teach: [
          teach('c3-acid-t1', 'greta', 'The pH scale', [
            'pH runs from 0 to 14. Below 7 is acidic, 7 is neutral, above 7 is alkaline (basic).',
            'Acids turn blue litmus red. Alkalis turn red litmus blue.',
            'Phenolphthalein is colourless in acid and pink in alkali. Methyl orange is red in acid and yellow in alkali.',
            'Neutralisation: acid + base → salt + water.',
            'Hydrochloric acid makes chlorides, sulphuric acid makes sulphates, nitric acid makes nitrates.',
          ], { example: ['HCl + NaOH → NaCl + H₂O'], hook: { kind: 'memory', text: 'Litmus: Acid turns it Red, Base turns it Blue. A-R, B-B.' } }),
        ],
        exercises: [
          mc('c3-acid-1', 'A solution has pH 3. It is…', ['strongly alkaline', 'neutral', 'acidic', 'weakly alkaline'], 2, 'Below 7 is acidic; 3 is quite acidic.'),
          match('c3-acid-2', 'Match the acid to the salts it forms', [['Hydrochloric acid', 'Chlorides'], ['Sulphuric acid', 'Sulphates'], ['Nitric acid', 'Nitrates']], 'The salt name comes from the acid.'),
          mc('c3-acid-3', 'Phenolphthalein in an alkali turns…', ['red', 'colourless', 'pink', 'yellow'], 2, 'Pink in alkali, colourless in acid.'),
          tf('c3-acid-4', 'Acid + base → salt + water is called neutralisation.', true, 'The acid and base cancel each other out.'),
          mc('c3-acid-5', 'Which pH is neutral?', ['0', '7', '10', '14'], 1, 'Pure water is pH 7.'),
        ],
      },
    ],
  },
];

/* Biology: respiration, the heart, excretion */

export const BIOLOGY_MORE: Unit[] = [
  {
    id: 'b-u3',
    title: 'Body systems',
    description: 'Respiration, the heart and circulation, excretion',
    who: 'priya',
    color: '#ef4444',
    lessons: [
      {
        id: 'b3-respiration',
        title: 'Respiration',
        icon: '🫁',
        teach: [
          teach('b3-resp-t1', 'priya', 'Releasing energy from food', [
            'Respiration happens in every living cell, all the time. It is not the same as breathing.',
            'Aerobic respiration (with oxygen): glucose + oxygen → carbon dioxide + water + lots of energy. It happens in the mitochondria.',
            'Anaerobic respiration (without oxygen) releases less energy.',
            'In human muscles: glucose → lactic acid + a little energy (this causes cramp).',
            'In yeast: glucose → ethanol + carbon dioxide + a little energy (used in bread and brewing).',
          ], { example: ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy'] }),
        ],
        exercises: [
          tf('b3-resp-1', 'Respiration and breathing are the same thing.', false, 'Breathing moves air; respiration releases energy inside cells.'),
          mc('b3-resp-2', 'Anaerobic respiration in human muscles produces…', ['ethanol', 'lactic acid', 'oxygen', 'glucose'], 1, 'Muscles make lactic acid; yeast makes ethanol.'),
          mc('b3-resp-3', 'Where in the cell does aerobic respiration mainly happen?', ['Nucleus', 'Mitochondria', 'Cell wall', 'Vacuole'], 1, 'The mitochondria are the power stations.'),
          match('b3-resp-4', 'Match the respiration to its products', [['Aerobic', 'Carbon dioxide + water'], ['Muscles, no oxygen', 'Lactic acid'], ['Yeast, no oxygen', 'Ethanol + carbon dioxide']], 'Learn all three; JAMB likes to swap them.'),
        ],
      },
      {
        id: 'b3-heart',
        title: 'The heart & circulation',
        icon: '❤️',
        teach: [
          teach('b3-heart-t1', 'priya', 'A double pump', [
            'The heart has four chambers: two atria on top, two ventricles below.',
            'The right side pumps deoxygenated blood to the lungs. The left side pumps oxygenated blood to the body.',
            'Arteries carry blood away from the heart; veins carry blood back. Capillaries connect them.',
            'Exception to remember: the pulmonary artery carries deoxygenated blood, the pulmonary vein carries oxygenated blood.',
            'The left ventricle has the thickest wall because it pumps blood to the whole body.',
          ], { hook: { kind: 'memory', text: 'A for Away: Arteries carry blood Away from the heart.' } }),
        ],
        exercises: [
          order('b3-heart-1', 'Order the path of blood starting from the body', ['Vena cava', 'Right atrium', 'Right ventricle', 'Pulmonary artery', 'Lungs', 'Pulmonary vein', 'Left atrium', 'Left ventricle', 'Aorta'], 'Body → right side → lungs → left side → body.'),
          mc('b3-heart-2', 'Which blood vessel carries deoxygenated blood?', ['Aorta', 'Pulmonary vein', 'Pulmonary artery', 'Coronary artery'], 2, 'The pulmonary artery takes deoxygenated blood to the lungs.', { kind: 'eliminate', text: 'This is the famous exception. Arteries usually carry oxygenated blood, except this one.' }),
          tf('b3-heart-3', 'The left ventricle has a thicker wall than the right.', true, 'It pumps blood all around the body, not just to the lungs.'),
          mc('b3-heart-4', 'Veins carry blood…', ['away from the heart', 'towards the heart', 'only to the lungs', 'only to the brain'], 1, 'Veins return blood to the heart.'),
        ],
      },
      {
        id: 'b3-excretion',
        title: 'Excretion',
        icon: '🚰',
        teach: [
          teach('b3-exc-t1', 'priya', 'Removing waste from metabolism', [
            "Excretion removes waste made by the body's own chemical reactions.",
            'Kidneys remove urea, excess water and salts as urine.',
            'Lungs remove carbon dioxide.',
            'Skin removes water, salts and some urea in sweat.',
            'Liver breaks down old red blood cells and excess amino acids (making urea).',
          ]),
        ],
        exercises: [
          match('b3-exc-1', 'Match the organ to what it excretes', [['Kidneys', 'Urea in urine'], ['Lungs', 'Carbon dioxide'], ['Skin', 'Sweat']], 'Three main excretory organs.'),
          mc('b3-exc-2', 'Urea is made in the…', ['kidneys', 'liver', 'lungs', 'skin'], 1, 'The liver makes urea; the kidneys remove it.', { kind: 'eliminate', text: 'Made vs removed: JAMB loves that difference.' }),
          tf('b3-exc-3', 'Passing out faeces is excretion.', false, 'That is egestion: undigested food, not metabolic waste.'),
        ],
      },
    ],
  },
];

