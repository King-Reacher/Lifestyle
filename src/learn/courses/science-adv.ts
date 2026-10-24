import type { Exercise, Rng, Unit } from '../types';
import { choice, dec, int, match, mc, order, pickOne, teach, tf } from '../util';

/* Physics: light and optics */

/** "an 18 cm", "a 45 cm": the article follows the spoken number. */
const an = (n: number) => (/^(8|11|18)$|^8\d$/.test(String(n)) ? `an ${n}` : `a ${n}`);

const MEDIA = [
  { name: 'glass block', n: '1.5', top: 3, bottom: 2, also: ['3/2'] },
  { name: 'tank of water', n: '4/3', top: 4, bottom: 3, also: ['1.33'] },
] as const;

const depthGen = (rng: Rng): Exercise => {
  const m = pickOne(rng, MEDIA);
  const apparent = m.bottom * int(rng, 2, 15);
  const real = (apparent * m.top) / m.bottom;
  return rng() < 0.5
    ? { kind: 'input', id: 'p6-real-depth', prompt: `A mark under a ${m.name} looks ${apparent} cm deep. The refractive index is ${m.n}. Real depth (cm)?`, answers: [String(real)], explain: `n = real depth ÷ apparent depth, so real = ${m.n} × ${apparent} = ${real} cm.`, tip: { kind: 'eliminate', text: 'Looking into water or glass makes things look shallower, so the real depth must be bigger than the apparent depth.' } }
    : { kind: 'input', id: 'p6-index', prompt: `A mark at the bottom of ${an(real)} cm ${m.name} appears to be ${apparent} cm deep. Refractive index?`, answers: [m.n, ...m.also], explain: `n = real ÷ apparent = ${real} ÷ ${apparent} = ${m.n}.`, tip: { kind: 'formula', text: 'n = real depth ÷ apparent depth = sin i ÷ sin r' } };
};

/** Object and image distances that give whole-number focal lengths. */
const LENS: [number, number, number][] = [[30, 60, 20], [20, 20, 10], [12, 24, 8], [15, 30, 10], [40, 40, 20], [24, 12, 8], [60, 30, 20], [36, 18, 12], [60, 20, 15], [10, 40, 8]];

const lensGen = (rng: Rng): Exercise => {
  const [u, v, f] = pickOne(rng, LENS);
  if (rng() < 0.6) return { kind: 'input', id: 'p6-focal', prompt: `An object ${u} cm from a converging lens forms a real image ${v} cm away. Focal length (cm)?`, answers: [String(f)], explain: `1/f = 1/u + 1/v = 1/${u} + 1/${v} = 1/${f}, so f = ${f} cm.`, tip: { kind: 'formula', text: '1/f = 1/u + 1/v (real is positive). Find a common denominator.' } };
  return { kind: 'input', id: 'p6-magnification', prompt: `An object ${u} cm from a lens forms an image ${v} cm away. Magnification?`, answers: [dec(v / u)], explain: `m = v ÷ u = ${v} ÷ ${u} = ${dec(v / u)}.${v > u ? ' The image is bigger than the object.' : v < u ? ' The image is smaller than the object.' : ' The image is the same size.'}`, tip: { kind: 'formula', text: 'Magnification m = image distance ÷ object distance = image height ÷ object height.' } };
};

/* Physics: magnetism and induction */

const transformerGen = (rng: Rng): Exercise => {
  const np = pickOne(rng, [100, 200, 400, 500, 1000] as const);
  const ratio = pickOne(rng, [2, 4, 5, 10] as const);
  const up = rng() < 0.5;
  const ns = up ? np * ratio : np / ratio;
  const vp = pickOne(rng, [10, 20, 40, 220, 240] as const);
  const vs = (vp * ns) / np;
  return { kind: 'input', id: 'p7-transformer', prompt: `A transformer has ${np} turns on the primary and ${ns} on the secondary. The input is ${vp} V. Output voltage (V)?`, answers: [dec(vs)], explain: `Vs/Vp = Ns/Np, so Vs = ${vp} × ${ns}/${np} = ${dec(vs)} V. It is a step-${up ? 'up' : 'down'} transformer.`, tip: { kind: 'shortcut', text: 'More turns on the secondary means more volts out (step-up). Fewer turns means step-down.' } };
};

/* Physics: modern physics */

const halfLifeGen = (rng: Rng): Exercise => {
  const t = pickOne(rng, [2, 3, 5, 8, 10] as const);
  const n = int(rng, 1, 4);
  const start = 2 ** int(rng, n + 1, 7) * pickOne(rng, [1, 3, 5] as const);
  const left = start / 2 ** n;
  return rng() < 0.6
    ? { kind: 'input', id: 'p8-half-life', prompt: `A radioactive sample has a half-life of ${t} days. How much of ${start} g is left after ${n * t} days (g)?`, answers: [String(left)], explain: `${n * t} days is ${n} half-li${n === 1 ? 'fe' : 'ves'}. Halve ${n === 1 ? 'once' : `${n} times`}: ${Array.from({ length: n + 1 }, (_, i) => start / 2 ** i).join(' → ')} g.`, tip: { kind: 'shortcut', text: 'Count half-lives first (time ÷ half-life), then halve that many times.' } }
    : { kind: 'input', id: 'p8-find-half-life', prompt: `${start} g of a radioactive substance decays to ${left} g in ${n * t} hours. Half-life (hours)?`, answers: [String(t)], explain: `${start} → ${left} is ${n} halving${n === 1 ? '' : 's'}. Half-life = ${n * t} ÷ ${n} = ${t} hours.`, tip: { kind: 'formula', text: 'Number of half-lives = log₂ (start ÷ left). Half-life = time ÷ that number.' } };
};

const NUCLEI: [string, number, number][] = [['U', 238, 92], ['Ra', 226, 88], ['Th', 234, 90], ['Po', 210, 84], ['Rn', 222, 86], ['Pb', 214, 82], ['Bi', 214, 83], ['C', 14, 6]];

const decayGen = (rng: Rng): Exercise => {
  const [sym, a, z] = pickOne(rng, NUCLEI.filter(([s]) => s !== 'C'));
  const alpha = rng() < 0.6;
  const [na, nz] = alpha ? [a - 4, z - 2] : [a, z + 1];
  const show = (m: number, p: number) => `mass ${m}, atomic number ${p}`;
  return choice(rng, { id: 'p8-decay', prompt: `${sym} has mass number ${a} and atomic number ${z}. It emits ${alpha ? 'an alpha' : 'a beta'} particle. The new nucleus has…`, explain: alpha ? `An alpha particle is ⁴₂He: mass falls by 4 (${a} → ${na}), atomic number falls by 2 (${z} → ${nz}).` : `In beta decay a neutron becomes a proton and an electron is thrown out: mass stays ${a}, atomic number rises by 1 (${z} → ${nz}).`, tip: { kind: 'memory', text: 'Alpha: mass −4, number −2. Beta: mass same, number +1. Gamma: no change.' } }, show(na, nz), [show(a - 4, z - 2), show(a, z + 1), show(a, z - 1), show(a - 2, z - 4), show(a - 4, z + 2)]);
};

export const PHYSICS_ADV: Unit[] = [
  {
    id: 'p-u6',
    title: 'Light & optics',
    description: 'Reflection, refraction, lenses and the eye',
    who: 'greta',
    color: '#facc15',
    lessons: [
      {
        id: 'p6-reflection',
        title: 'Reflection & refraction',
        icon: '🪞',
        teach: [
          teach('p6-refl-t1', 'greta', 'How light bends and bounces', [
            'Law of reflection: the angle of incidence equals the angle of reflection, measured from the normal.',
            'A plane mirror forms an image that is upright, the same size, as far behind the mirror as the object is in front, and laterally inverted (left and right swapped).',
            'Refraction is light bending as it enters a new medium, because its speed changes.',
            'Refractive index n = sin i ÷ sin r = real depth ÷ apparent depth. For water n ≈ 1.33; for glass about 1.5.',
            'Total internal reflection happens when light in a dense medium hits the boundary at more than the critical angle. Optical fibres use it.',
          ], { example: ['A pool 3 m deep looks only about 2.25 m deep, because n = 4/3'], hook: { kind: 'memory', text: 'Light slows down going into glass and bends TOWARDS the normal; it speeds up coming out and bends AWAY.' } }),
        ],
        exercises: [
          depthGen,
          mc('p6-refl-1', 'A ray hits a mirror at 35° to the normal. The angle of reflection is…', ['35°', '55°', '70°', '145°'], 0, 'Angle of incidence = angle of reflection, both measured from the normal.', { kind: 'eliminate', text: '55° is the angle to the mirror surface, not the normal. Watch which line the angle is measured from.' }),
          depthGen,
          tf('p6-refl-2', 'An image in a plane mirror is laterally inverted.', true, 'Left and right are swapped. That is why AMBULANCE is written backwards on the front of ambulances.'),
          mc('p6-refl-3', 'Optical fibres carry light by…', ['refraction only', 'total internal reflection', 'diffraction', 'absorption'], 1, 'Light keeps reflecting inside the fibre without escaping.'),
          depthGen,
        ],
      },
      {
        id: 'p6-lenses',
        title: 'Lenses & the eye',
        icon: '👓',
        teach: [
          teach('p6-lens-t1', 'greta', 'Bending light on purpose', [
            'A converging (convex) lens brings parallel rays to a point: the principal focus. The distance to it is the focal length f.',
            'Lens formula: 1/f = 1/u + 1/v, where u is the object distance and v the image distance (real is positive).',
            'Magnification m = v ÷ u.',
            'Power of a lens = 1 ÷ f (f in metres), measured in dioptres.',
            'Short sight (myopia) is corrected with a diverging (concave) lens; long sight (hypermetropia) with a converging lens.',
          ], { example: ['u = 30 cm, v = 60 cm: 1/f = 1/30 + 1/60 = 3/60 = 1/20, so f = 20 cm, m = 2'], hook: { kind: 'memory', text: 'A short-sighted eye focuses too soon, in front of the retina. A diverging lens pushes the image back onto it.' } }),
        ],
        exercises: [lensGen, lensGen, mc('p6-lens-1', 'Short sight is corrected with a…', ['converging lens', 'diverging lens', 'plane mirror', 'prism'], 1, 'A diverging lens spreads the rays so they focus further back, on the retina.'), lensGen, mc('p6-lens-2', 'A lens of focal length 0.5 m has a power of…', ['0.5 D', '2 D', '5 D', '50 D'], 1, 'P = 1 ÷ f = 1 ÷ 0.5 = 2 dioptres.', { kind: 'formula', text: 'Power = 1 ÷ f, with f in metres.' }), lensGen],
      },
    ],
  },
  {
    id: 'p-u7',
    title: 'Magnetism & induction',
    description: 'Magnetic fields, the motor effect, induction and transformers',
    who: 'greta',
    color: '#64748b',
    lessons: [
      {
        id: 'p7-magnetism',
        title: 'Magnets & induction',
        icon: '🧲',
        teach: [
          teach('p7-mag-t1', 'greta', 'Fields, motors and generators', [
            'Like poles repel, unlike poles attract. Field lines run from north to south outside a magnet.',
            'A current-carrying wire has a magnetic field around it. In a magnetic field it feels a force: the motor effect.',
            "Electromagnetic induction: moving a magnet near a coil (or changing the field) makes a voltage. Faraday's law: faster change, bigger voltage.",
            "Lenz's law: the induced current opposes the change that caused it.",
            'Iron is used for electromagnets because it is easily magnetised and demagnetised (soft); steel keeps its magnetism (hard) and is used for permanent magnets.',
          ], { hook: { kind: 'memory', text: "Fleming's left hand for Motors, right hand for generators: thuMb = Motion, First finger = Field, seCond finger = Current." } }),
          teach('p7-mag-t2', 'greta', 'Transformers', [
            'A transformer changes an alternating voltage using two coils on an iron core.',
            'Vs/Vp = Ns/Np: the voltage ratio equals the turns ratio.',
            'Step-up transformers have more secondary turns; step-down have fewer.',
            'Transformers only work with a.c., because they need a changing magnetic field.',
            'Power stations step voltage up for transmission, which lowers the current and so the heat lost in the cables.',
          ], { example: ['240 V in, 1000 primary turns, 50 secondary turns: Vs = 240 × 50/1000 = 12 V'] }),
        ],
        exercises: [
          transformerGen,
          mc('p7-mag-1', 'Transformers do not work with direct current because…', ['d.c. is too strong', 'd.c. does not produce a changing magnetic field', 'd.c. has no voltage', 'iron blocks d.c.'], 1, 'Induction needs a changing field; steady d.c. gives a steady field.'),
          transformerGen,
          tf('p7-mag-2', 'Steel is preferred to iron for permanent magnets.', true, 'Steel keeps its magnetism; iron loses it easily.'),
          mc('p7-mag-3', 'High voltage is used to transmit electricity over long distances because it…', ['is safer', 'reduces the current and so the energy lost as heat', 'travels faster', 'needs thinner poles'], 1, 'Power lost in cables = I²R; a smaller current wastes much less.'),
          transformerGen,
          mc('p7-mag-4', 'The magnitude of an induced voltage depends on…', ['the colour of the wire', 'how fast the magnetic field changes', 'the direction of north only', 'the room temperature'], 1, "Faraday's law: the faster the change, the bigger the voltage."),
        ],
      },
    ],
  },
  {
    id: 'p-u8',
    title: 'Modern physics',
    description: 'Radioactivity, half-life and nuclear reactions',
    who: 'greta',
    color: '#22c55e',
    lessons: [
      {
        id: 'p8-radioactivity',
        title: 'Radioactivity',
        icon: '☢️',
        teach: [
          teach('p8-rad-t1', 'greta', 'Unstable nuclei', [
            'Radioactivity is the spontaneous break-up of unstable nuclei, giving out radiation.',
            'Alpha (α): a helium nucleus, 2 protons and 2 neutrons. Strongly ionising, stopped by paper.',
            'Beta (β): a fast electron from the nucleus. Stopped by a few mm of aluminium.',
            'Gamma (γ): an electromagnetic wave. Weakly ionising, very penetrating; reduced by thick lead.',
            'Half-life: the time for half the nuclei in a sample to decay. It never changes for a given isotope.',
          ], { example: ['Half-life 5 days, 80 g: after 10 days (two half-lives) 80 → 40 → 20 g'], hook: { kind: 'memory', text: 'Paper, aluminium, lead: alpha, beta, gamma in order of penetration.' } }),
        ],
        exercises: [
          halfLifeGen,
          decayGen,
          order('p8-rad-1', 'Order from least to most penetrating', ['Alpha', 'Beta', 'Gamma'], 'Alpha is stopped by paper, beta by aluminium, gamma needs thick lead.'),
          halfLifeGen,
          decayGen,
          tf('p8-rad-2', 'Heating a radioactive sample shortens its half-life.', false, 'Half-life is a property of the nucleus; heat, pressure and chemistry do not change it.'),
          halfLifeGen,
          mc('p8-rad-3', 'Nuclear fission is…', ['joining light nuclei', 'splitting a heavy nucleus', 'emitting an electron', 'burning uranium in oxygen'], 1, 'Fission splits heavy nuclei like uranium-235; fusion joins light ones, as in the sun.', { kind: 'memory', text: 'FISSion = splitting (like a fissure). FUSion = fusing together.' }),
        ],
      },
    ],
  },
];

/* Chemistry */

const rateGen = (rng: Rng): Exercise => {
  const t = pickOne(rng, [10, 20, 25, 40, 50, 60] as const);
  const r = int(rng, 1, 6);
  const v = r * t;
  return { kind: 'input', id: 'c6-rate', prompt: `A reaction gives off ${v} cm³ of gas in ${t} s. Average rate (cm³/s)?`, answers: [String(r)], explain: `Rate = amount ÷ time = ${v} ÷ ${t} = ${r} cm³/s.`, tip: { kind: 'formula', text: 'Rate = change in amount ÷ time taken.' } };
};

export const CHEMISTRY_ADV: Unit[] = [
  {
    id: 'c-u6',
    title: 'Rates & equilibrium',
    description: 'What speeds reactions up, and how equilibria shift',
    who: 'greta',
    color: '#f43f5e',
    lessons: [
      {
        id: 'c6-rates',
        title: 'Rates of reaction',
        icon: '⏱️',
        teach: [
          teach('c6-rate-t1', 'greta', 'Making reactions go faster', [
            'Particles must collide with enough energy (the activation energy) to react.',
            'Rate increases with higher temperature, higher concentration (or pressure for gases), larger surface area (powder instead of lumps) and a catalyst.',
            'A catalyst speeds up a reaction by giving a route with lower activation energy. It is not used up.',
            'Rate can be measured by gas given off, mass lost, or time for a colour change or cloudiness.',
          ], { hook: { kind: 'memory', text: 'TCSC: Temperature, Concentration, Surface area, Catalyst.' } }),
        ],
        exercises: [
          rateGen,
          mc('c6-rate-1', 'Which makes marble chips react fastest with acid?', ['Large lumps, cold acid', 'Powder, hot acid', 'Large lumps, hot acid', 'Powder, cold dilute acid'], 1, 'Powder (more surface) plus heat (more energetic collisions).', { kind: 'eliminate', text: 'Pick the option with the most factors pushing the rate up.' }),
          tf('c6-rate-2', 'A catalyst is used up during a reaction.', false, 'It is chemically unchanged at the end and can be reused.'),
          rateGen,
          mc('c6-rate-3', 'A catalyst works by…', ['raising the temperature', 'lowering the activation energy', 'adding more reactant', 'changing the products'], 1, 'It offers an easier pathway.'),
        ],
      },
      {
        id: 'c6-equilibrium',
        title: 'Equilibrium',
        icon: '⚖️',
        teach: [
          teach('c6-eq-t1', 'greta', "Le Chatelier's principle", [
            'In a reversible reaction (⇌), dynamic equilibrium is reached when the forward and backward rates are equal.',
            "Le Chatelier's principle: if conditions change, the equilibrium shifts to oppose the change.",
            'More pressure shifts it to the side with fewer gas molecules.',
            'Higher temperature shifts it in the endothermic direction; lower temperature favours the exothermic direction.',
            'A catalyst does not shift the equilibrium; it only helps reach it faster.',
          ], { example: ['N₂ + 3H₂ ⇌ 2NH₃ (exothermic): 4 gas molecules on the left, 2 on the right', 'High pressure shifts it right, giving more ammonia'], hook: { kind: 'memory', text: 'Equilibrium is stubborn: whatever you do, it does the opposite.' } }),
        ],
        exercises: [
          mc('c6-eq-1', 'For N₂ + 3H₂ ⇌ 2NH₃, increasing pressure…', ['shifts it left', 'shifts it right', 'has no effect', 'stops the reaction'], 1, '4 gas molecules on the left, 2 on the right: higher pressure favours fewer molecules.', { kind: 'shortcut', text: 'Count the gas molecules on each side.' }),
          tf('c6-eq-2', 'A catalyst increases the amount of product at equilibrium.', false, 'It speeds up both directions equally, so the position does not move.'),
          mc('c6-eq-3', 'For an exothermic forward reaction, raising the temperature…', ['increases the yield of product', 'decreases the yield of product', 'has no effect', 'doubles the rate constant only'], 1, 'Heat favours the endothermic (backward) direction.'),
          mc('c6-eq-4', 'For H₂ + I₂ ⇌ 2HI (all gases), increasing pressure…', ['shifts it right', 'shifts it left', 'has no effect on the position', 'stops the reaction'], 2, '2 molecules on each side, so pressure cannot favour either side.'),
        ],
      },
    ],
  },
  {
    id: 'c-u7',
    title: 'Metals, non-metals & industry',
    description: 'The reactivity series, extraction, and key industrial processes',
    who: 'greta',
    color: '#78716c',
    lessons: [
      {
        id: 'c7-metals',
        title: 'Metals & reactivity',
        icon: '⛏️',
        teach: [
          teach('c7-met-t1', 'greta', 'The reactivity series', [
            'From most to least reactive: potassium, sodium, calcium, magnesium, aluminium, (carbon), zinc, iron, tin, lead, (hydrogen), copper, silver, gold.',
            'A more reactive metal displaces a less reactive one from its compounds.',
            'Metals above carbon are extracted by electrolysis; metals below carbon can be extracted by heating with carbon (reduction).',
            'Iron is extracted in the blast furnace with coke; aluminium by electrolysis of bauxite dissolved in cryolite.',
            'Rusting needs both water and oxygen. Prevent it by painting, oiling, galvanising (zinc coating) or sacrificial protection.',
          ], { hook: { kind: 'memory', text: 'Please Send Cats, Monkeys And Cute Zebras Into Hot Countries Signed Gordon: K, Na, Ca, Mg, Al, C, Zn, Fe, H, Cu, Ag, Au.' } }),
        ],
        exercises: [
          order('c7-met-1', 'Order from most to least reactive', ['Potassium', 'Magnesium', 'Zinc', 'Iron', 'Copper', 'Gold'], 'Follow the reactivity series.'),
          mc('c7-met-2', 'Which reaction happens?', ['Copper + zinc sulphate', 'Zinc + copper(II) sulphate', 'Silver + iron(II) sulphate', 'Gold + magnesium chloride'], 1, 'Zinc is above copper, so it displaces copper.', { kind: 'eliminate', text: 'The free metal must be MORE reactive than the metal in the compound.' }),
          mc('c7-met-3', 'Aluminium is extracted by…', ['heating with carbon', 'electrolysis', 'roasting in air', 'dissolving in water'], 1, 'It is above carbon, so carbon cannot reduce it.'),
          tf('c7-met-4', 'Iron rusts in dry air.', false, 'Rusting needs both water and oxygen.'),
          mc('c7-met-5', 'Galvanising protects iron with a coat of…', ['tin', 'zinc', 'copper', 'lead'], 1, 'Zinc, which corrodes first even if scratched (sacrificial protection).'),
        ],
      },
      {
        id: 'c7-industry',
        title: 'Chemistry & industry',
        icon: '🏭',
        teach: [
          teach('c7-ind-t1', 'greta', 'Processes JAMB loves', [
            'Haber process: N₂ + 3H₂ ⇌ 2NH₃, iron catalyst, about 450 °C and 200 atm. Ammonia is used for fertilisers.',
            'Contact process: 2SO₂ + O₂ ⇌ 2SO₃, vanadium(V) oxide catalyst, about 450 °C. Used to make sulphuric acid.',
            'Hard water contains dissolved calcium and magnesium ions. Temporary hardness is removed by boiling; permanent hardness by washing soda or ion exchange.',
            'Crude oil is separated by fractional distillation into fractions with different boiling points.',
          ], { hook: { kind: 'memory', text: 'Haber makes Ammonia (H-A), Contact makes acid (sulphuric). Iron for Haber, V₂O₅ for Contact.' } }),
        ],
        exercises: [
          match('c7-ind-1', 'Match the process to its catalyst', [['Haber process', 'Iron'], ['Contact process', 'Vanadium(V) oxide'], ['Hydrogenation of oils', 'Nickel']], 'Learn each process with its catalyst.'),
          mc('c7-ind-2', 'The Haber process makes…', ['sulphuric acid', 'ammonia', 'nitric acid', 'sodium hydroxide'], 1, 'N₂ + 3H₂ ⇌ 2NH₃.'),
          mc('c7-ind-3', 'Temporary hardness of water is removed by…', ['boiling', 'filtering', 'adding chlorine', 'freezing'], 0, 'Boiling breaks down calcium hydrogencarbonate, which causes temporary hardness.'),
          tf('c7-ind-4', 'Crude oil is separated by fractional distillation.', true, 'Fractions boil off at different temperatures up the column.'),
          mc('c7-ind-5', 'Which fraction of crude oil has the lowest boiling point?', ['Bitumen', 'Diesel', 'Refinery gas', 'Lubricating oil'], 2, 'Small molecules like methane and propane boil lowest and come off the top.'),
        ],
      },
    ],
  },
];

/* Biology */

const energyGen = (rng: Rng): Exercise => {
  const start = pickOne(rng, [1000, 5000, 10000, 20000, 50000, 100000] as const);
  const steps = int(rng, 1, 3);
  const levels = ['producers', 'primary consumers', 'secondary consumers', 'tertiary consumers'];
  const left = start / 10 ** steps;
  return { kind: 'input', id: 'b6-energy', prompt: `${levels[0][0].toUpperCase()}${levels[0].slice(1)} hold ${start} kJ of energy. About how much reaches the ${levels[steps]} (kJ)? (10% passes on at each level)`, answers: [String(left)], explain: `Each step keeps about 10%: ${Array.from({ length: steps + 1 }, (_, i) => start / 10 ** i).join(' → ')} kJ.`, tip: { kind: 'shortcut', text: 'Divide by 10 for each arrow in the food chain.' } };
};

export const BIOLOGY_ADV: Unit[] = [
  {
    id: 'b-u6',
    title: 'Plants, coordination & evolution',
    description: 'Transport in plants, the nervous and hormonal systems, evolution',
    who: 'priya',
    color: '#16a34a',
    lessons: [
      {
        id: 'b6-plant-transport',
        title: 'Transport in plants',
        icon: '🌱',
        teach: [
          teach('b6-tr-t1', 'priya', 'Water up, food around', [
            'Water enters root hairs by osmosis and travels up the xylem to the leaves.',
            'Transpiration is the loss of water vapour from leaves through the stomata. It pulls water up the stem.',
            'Transpiration is faster when it is hot, windy, dry (low humidity) and bright.',
            'Phloem carries sugars from the leaves to other parts: translocation.',
            'Guard cells open and close the stomata.',
          ], { hook: { kind: 'memory', text: 'Wet washing dries fastest on a hot, windy, dry, sunny day. So do leaves.' } }),
        ],
        exercises: [
          mc('b6-tr-1', 'Water enters root hair cells by…', ['active transport', 'osmosis', 'diffusion of sugar', 'phagocytosis'], 1, 'Water moves from the dilute soil water into the more concentrated cell sap.'),
          mc('b6-tr-2', 'Which condition slows transpiration?', ['High temperature', 'Wind', 'High humidity', 'Bright light'], 2, 'Humid air is already full of water vapour, so less evaporates.', { kind: 'eliminate', text: 'Three of these would dry washing faster. The odd one out is the answer.' }),
          tf('b6-tr-3', 'Phloem carries manufactured food around the plant.', true, 'That movement is called translocation.'),
          mc('b6-tr-4', 'Stomata are opened and closed by…', ['root hairs', 'guard cells', 'xylem vessels', 'the cuticle'], 1, 'Two guard cells surround each stoma.'),
          mc('b6-tr-5', 'The instrument used to measure the rate of transpiration is the…', ['barometer', 'potometer', 'thermometer', 'hygrometer'], 1, 'A potometer measures water uptake by a shoot.'),
        ],
      },
      {
        id: 'b6-coordination',
        title: 'Nerves & hormones',
        icon: '🧠',
        teach: [
          teach('b6-co-t1', 'priya', 'Two control systems', [
            'The nervous system sends fast electrical impulses along neurones. The central nervous system is the brain and spinal cord.',
            'A reflex action is fast and automatic: stimulus → receptor → sensory neurone → relay neurone (in the spinal cord) → motor neurone → effector → response.',
            'The endocrine system releases hormones into the blood: slower but longer-lasting.',
            'Insulin (from the pancreas) lowers blood sugar. Adrenaline prepares the body for "fight or flight". Thyroxine controls metabolism.',
            'The cerebrum handles thinking and memory; the cerebellum balance and coordination; the medulla breathing and heartbeat.',
          ], { hook: { kind: 'memory', text: 'Cerebellum = balance (both have a double L).' } }),
        ],
        exercises: [
          order('b6-co-1', 'Order the reflex arc', ['Stimulus', 'Receptor', 'Sensory neurone', 'Relay neurone', 'Motor neurone', 'Effector'], 'Sense, carry in, relay, carry out, act.'),
          match('b6-co-2', 'Match the hormone to its job', [['Insulin', 'Lowers blood sugar'], ['Adrenaline', 'Fight or flight'], ['Thyroxine', 'Controls metabolism'], ['Oestrogen', 'Female sex characteristics']], 'Each hormone has one main job to remember.'),
          mc('b6-co-3', 'Which part of the brain controls balance?', ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'], 1, 'The cerebellum coordinates movement and balance.'),
          tf('b6-co-4', 'Hormonal responses are usually faster than nervous ones.', false, 'Nerves are fast and short; hormones are slower and longer-lasting.'),
          mc('b6-co-5', 'Insulin is produced by the…', ['liver', 'pancreas', 'thyroid', 'kidney'], 1, 'Islets of Langerhans in the pancreas.'),
        ],
      },
      {
        id: 'b6-evolution',
        title: 'Evolution',
        icon: '🦒',
        teach: [
          teach('b6-ev-t1', 'priya', 'How species change', [
            'Evolution is the gradual change in living things over many generations.',
            "Darwin's natural selection: organisms vary, many die young, those best suited survive and pass on their features.",
            "Lamarck's theory of use and disuse (giraffes stretching their necks) is rejected, because acquired traits are not inherited.",
            'Evidence for evolution: fossils, comparative anatomy (homologous structures such as the pentadactyl limb), embryology and molecular biology.',
          ], { hook: { kind: 'memory', text: 'Darwin: Diversity, Death, Descendants. The best-suited leave the most children.' } }),
        ],
        exercises: [
          mc('b6-ev-1', 'Who proposed natural selection?', ['Lamarck', 'Darwin', 'Mendel', 'Pasteur'], 1, 'Charles Darwin, in On the Origin of Species (1859).'),
          tf('b6-ev-2', 'A bodybuilder\'s large muscles will be inherited by their children.', false, 'Acquired characteristics are not passed on. That was the flaw in Lamarck\'s idea.'),
          mc('b6-ev-3', 'The pentadactyl limb found in humans, bats and whales is evidence from…', ['fossils', 'comparative anatomy', 'blood groups', 'ecology'], 1, 'The same five-digit plan adapted for different uses: homologous structures.'),
          mc('b6-ev-4', 'Which is NOT evidence for evolution?', ['Fossil records', 'Similar embryos', 'Similar DNA', 'Muscles growing with exercise'], 3, 'That is an acquired change in one lifetime.'),
        ],
      },
      {
        id: 'b6-ecology',
        title: 'Ecology in depth',
        icon: '🌍',
        teach: [
          teach('b6-eco-t1', 'priya', 'Energy and cycles', [
            'Only about 10% of the energy at one trophic level passes to the next. The rest is lost as heat, movement and waste.',
            'That is why food chains rarely have more than four or five links, and pyramids of energy are always upright.',
            'Carbon cycle: photosynthesis removes CO₂; respiration, decay and burning return it.',
            'Nitrogen cycle: nitrogen-fixing bacteria (in root nodules of legumes) make nitrates; denitrifying bacteria return nitrogen to the air.',
            'Symbiosis (mutualism) benefits both partners; parasitism benefits one and harms the other.',
          ], { example: ['Grass 10 000 kJ → grasshopper 1000 kJ → frog 100 kJ → snake 10 kJ'], hook: { kind: 'shortcut', text: 'Energy shrinks ten times at every arrow.' } }),
        ],
        exercises: [
          energyGen,
          mc('b6-eco-1', 'Nitrogen-fixing bacteria are found in the root nodules of…', ['maize', 'legumes such as beans', 'cassava', 'grasses'], 1, 'Legumes host Rhizobium bacteria.'),
          energyGen,
          match('b6-eco-2', 'Match the relationship', [['Mutualism', 'Both benefit'], ['Parasitism', 'One benefits, one is harmed'], ['Commensalism', 'One benefits, the other is unaffected']], 'Ask who gains and who loses.'),
          tf('b6-eco-3', 'Burning fossil fuels adds carbon dioxide to the air.', true, 'Combustion releases carbon stored for millions of years.'),
          energyGen,
        ],
      },
    ],
  },
];
