import type { Exercise, Rng, Unit } from '../types';
import { dec, int, match, mc, order, pickOne, teach, tf } from '../util';

/* Physics: projectiles and circular motion */

const projectileGen = (rng: Rng): Exercise => {
  const kind = int(rng, 0, 2);
  if (kind === 0) {
    const t = int(rng, 1, 4);
    const h = 5 * t * t;
    const u = int(rng, 2, 15);
    return { kind: 'input', id: 'p9-range', prompt: `A ball is thrown horizontally at ${u} m/s from a cliff ${h} m high. How far from the foot of the cliff does it land (m)? (g = 10 m/s²)`, answers: [String(u * t)], explain: `Time to fall: h = ½gt², so t² = 2h ÷ g = ${2 * h} ÷ 10 = ${t * t}. t = √${t * t} = ${t} s. Horizontal distance = speed × time = ${u} × ${t} = ${u * t} m.`, tip: { kind: 'shortcut', text: 'Horizontal and vertical motion are separate. Gravity decides the time; the horizontal speed then decides the distance.' } };
  }
  const u = 10 * int(rng, 1, 4);
  if (kind === 1) return { kind: 'input', id: 'p9-max-height', prompt: `A stone is thrown straight up at ${u} m/s. Maximum height (m)? (g = 10 m/s²)`, answers: [String((u * u) / 20)], explain: `At the top the ball stops for an instant. H = u² ÷ 2g = ${u * u} ÷ 20 = ${(u * u) / 20} m.`, tip: { kind: 'formula', text: 'Maximum height H = u² / 2g. Time to the top = u / g.' } };
  return { kind: 'input', id: 'p9-time-up', prompt: `A ball is thrown straight up at ${u} m/s. How long until it comes back down to the thrower (s)? (g = 10 m/s²)`, answers: [String((2 * u) / 10)], explain: `Time to the top: t = u ÷ g = ${u} ÷ 10 = ${u / 10} s. Up and down take equal time: total = 2 × ${u / 10} = ${(2 * u) / 10} s.`, tip: { kind: 'shortcut', text: 'Total time of flight = 2u / g. Going up and coming down take the same time.' } };
};

const circularGen = (rng: Rng): Exercise => {
  const m = int(rng, 1, 10);
  const v = int(rng, 2, 10);
  const r = pickOne(rng, [1, 2, 4, 5] as const);
  const f = (m * v * v) / r;
  return { kind: 'input', id: 'p9-centripetal', prompt: `A ${m} kg mass moves in a circle of radius ${r} m at ${v} m/s. Centripetal force (N)?`, answers: [dec(f)], explain: `F = mv² ÷ r. v² = ${v} × ${v} = ${v * v}. F = ${m} × ${v * v} ÷ ${r} = ${dec(f)} N.`, tip: { kind: 'formula', text: 'Centripetal force F = mv²/r, always towards the centre.' } };
};

/* Physics: gravitation */

const gravityGen = (rng: Rng): Exercise => {
  const f = pickOne(rng, [36, 72, 144, 288, 900] as const);
  const k = pickOne(rng, [2, 3] as const);
  const farther = rng() < 0.5;
  const out = farther ? f / (k * k) : f * k * k;
  return { kind: 'input', id: 'p10-inverse-square', prompt: `Two masses attract with a force of ${f} N. The distance between them is ${farther ? `multiplied by ${k}` : `divided by ${k}`}. New force (N)?`, answers: [dec(out)], explain: `Gravity follows the inverse square law: F ∝ 1/r². ${farther ? `${k} times the distance gives 1/${k * k} of the force` : `1/${k} of the distance gives ${k * k} times the force`}: ${f} ${farther ? '÷' : '×'} ${k * k} = ${dec(out)} N.`, tip: { kind: 'shortcut', text: 'Square the change and flip it: double the distance, a quarter of the force.' } };
};

/* Physics: simple harmonic motion and elasticity */

const shmGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const t = pickOne(rng, [0.1, 0.2, 0.25, 0.5, 2, 4] as const);
    return { kind: 'input', id: 'p11-frequency', prompt: `A pendulum has a period of ${t} s. Frequency (Hz)?`, answers: [dec(1 / t)], explain: `f = 1 ÷ T = 1 ÷ ${t} = ${dec(1 / t)} Hz.`, tip: { kind: 'formula', text: 'f = 1/T and T = 1/f.' } };
  }
  const n = int(rng, 5, 30);
  const t = int(rng, 1, 4);
  return { kind: 'input', id: 'p11-period', prompt: `A pendulum makes ${n} complete oscillations in ${n * t} s. Period (s)?`, answers: [String(t)], explain: `Period = time ÷ oscillations = ${n * t} ÷ ${n} = ${t} s.`, tip: { kind: 'formula', text: 'Period is the time for ONE complete oscillation.' } };
};

const hookeGen = (rng: Rng): Exercise => {
  const k = 10 * int(rng, 1, 20);
  const e = pickOne(rng, [0.1, 0.2, 0.3, 0.4, 0.5] as const);
  const f = k * e;
  if (rng() < 0.5) return { kind: 'input', id: 'p11-hooke', prompt: `A spring has a force constant of ${k} N/m. Force needed to stretch it ${e} m (N)?`, answers: [dec(f)], explain: `Hooke's law: F = ke = ${k} × ${e} = ${dec(f)} N.`, tip: { kind: 'formula', text: "Hooke's law: F = ke, up to the elastic limit." } };
  const w = (k * e * e) / 2;
  return { kind: 'input', id: 'p11-spring-energy', prompt: `A spring of force constant ${k} N/m is stretched ${e} m. Energy stored (J)?`, answers: [dec(w)], explain: `E = ½ke². e² = ${e} × ${e} = ${dec(e * e)}. E = ½ × ${k} × ${dec(e * e)} = ${dec(w)} J.`, tip: { kind: 'formula', text: 'Energy stored in a spring = ½ke² = ½Fe.' } };
};

/* Physics: fluids */

const fluidGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const h = int(rng, 2, 50);
    const rho = pickOne(rng, [1000, 800, 13600] as const);
    const liquid = { 1000: 'water', 800: 'oil', 13600: 'mercury' }[rho];
    return { kind: 'input', id: 'p12-liquid-pressure', prompt: `Pressure due to ${h} m of ${liquid} (density ${rho} kg/m³) in Pa? (g = 10 m/s²)`, answers: [String(rho * 10 * h)], explain: `P = ρgh = ${rho} × 10 × ${h} = ${rho * 10 * h} Pa.`, tip: { kind: 'formula', text: 'Pressure in a liquid P = ρgh: deeper and denser means more pressure.' } };
  }
  const w = int(rng, 10, 60);
  const loss = int(rng, 2, w - 2);
  return { kind: 'input', id: 'p12-upthrust', prompt: `An object weighs ${w} N in air and ${w - loss} N fully in water. Upthrust (N)?`, answers: [String(loss)], explain: `Upthrust = weight in air − weight in water = ${w} − ${w - loss} = ${loss} N. By Archimedes' principle it equals the weight of water displaced.`, tip: { kind: 'formula', text: "Archimedes: upthrust = weight of fluid displaced = loss in weight." } };
};

export const PHYSICS_FINAL: Unit[] = [
  {
    id: 'p-u9',
    title: 'Motion in two dimensions & gravity',
    description: 'Projectiles, circular motion, gravitation',
    who: 'greta',
    color: '#0ea5e9',
    lessons: [
      {
        id: 'p9-projectiles',
        title: 'Projectiles & circles',
        icon: '🏀',
        teach: [
          teach('p9-proj-t1', 'greta', 'Two motions at once', [
            'A projectile moves horizontally at a steady speed while gravity pulls it down. Treat the two separately.',
            'Thrown straight up: time to the top t = u/g, maximum height H = u²/2g, total time 2u/g.',
            'Thrown horizontally from height h: time to fall t = √(2h/g), distance travelled = speed × t.',
            'Moving in a circle needs a force towards the centre: centripetal force F = mv²/r.',
          ], { example: ['Up at 20 m/s: top after 2 s, height 400 ÷ 20 = 20 m, back after 4 s'], hook: { kind: 'memory', text: 'A bullet dropped and a bullet fired level hit the ground at the same moment. Gravity does not care how fast you go sideways.' } }),
        ],
        exercises: [projectileGen, projectileGen, circularGen, tf('p9-proj-1', 'At the top of its flight, a ball thrown straight up has zero velocity.', true, 'It stops for an instant before falling. Its acceleration is still g.'), projectileGen, circularGen],
      },
      {
        id: 'p10-gravitation',
        title: 'Gravitation',
        icon: '🪐',
        teach: [
          teach('p10-grav-t1', 'greta', "Newton's law of gravitation", [
            'Every mass attracts every other mass: F = Gm₁m₂/r².',
            'Double the distance and the force falls to a quarter: the inverse square law.',
            'g on the surface of a planet depends on its mass and radius. On the Moon g is about 1.6 m/s².',
            'Escape velocity is the speed needed to leave a planet without further push; for Earth about 11 km/s.',
            'A geostationary satellite orbits once every 24 hours above the equator, so it stays over one spot.',
          ], { hook: { kind: 'shortcut', text: 'Inverse square: change distance by k, change force by 1/k².' } }),
        ],
        exercises: [gravityGen, gravityGen, mc('p10-grav-1', 'The period of a geostationary satellite is…', ['1 hour', '12 hours', '24 hours', '365 days'], 2, 'It turns with the Earth, once a day.'), gravityGen, tf('p10-grav-2', 'Your mass on the Moon is smaller than on Earth.', false, 'Mass stays the same; weight (mg) is smaller.'), gravityGen],
      },
    ],
  },
  {
    id: 'p-u10',
    title: 'Oscillations, elasticity & fluids',
    description: "Simple harmonic motion, Hooke's law, liquid pressure, Archimedes",
    who: 'greta',
    color: '#8b5cf6',
    lessons: [
      {
        id: 'p11-shm',
        title: 'Oscillations & springs',
        icon: '🪀',
        teach: [
          teach('p11-shm-t1', 'greta', 'Things that swing and stretch', [
            'Simple harmonic motion: the acceleration is always towards the middle and proportional to the distance from it. A pendulum and a mass on a spring do this.',
            'Period T is the time for one complete oscillation; frequency f = 1/T. Amplitude is the biggest distance from the middle.',
            'A pendulum\'s period depends on its length, not on the mass of the bob.',
            "Hooke's law: extension is proportional to force, F = ke, up to the elastic limit. Energy stored = ½ke².",
          ], { example: ['20 oscillations in 40 s: T = 2 s, f = 0.5 Hz'], hook: { kind: 'memory', text: 'Period is Per one: the time for one swing.' } }),
        ],
        exercises: [shmGen, hookeGen, shmGen, mc('p11-shm-1', 'The period of a simple pendulum depends on…', ['the mass of the bob', 'its length', 'the colour of the string', 'the amplitude only'], 1, 'T = 2π√(l/g): length and g, not mass.'), hookeGen, shmGen, hookeGen],
      },
      {
        id: 'p12-fluids',
        title: 'Fluids',
        icon: '🚢',
        teach: [
          teach('p12-flu-t1', 'greta', 'Pressure in liquids and floating', [
            'Pressure in a liquid P = ρgh. It acts equally in all directions and increases with depth.',
            "Archimedes' principle: an object in a fluid feels an upthrust equal to the weight of fluid it displaces.",
            'Law of flotation: a floating object displaces its own weight of fluid.',
            'A hydraulic press uses the fact that pressure is passed on equally through a liquid (Pascal\'s principle).',
          ], { hook: { kind: 'memory', text: 'Archimedes in the bath: the water he pushed aside pushed back up on him.' } }),
        ],
        exercises: [fluidGen, fluidGen, tf('p12-flu-1', 'A floating ship displaces its own weight of water.', true, 'That is the law of flotation.'), fluidGen, mc('p12-flu-2', 'A hydraulic jack works because pressure in a liquid is…', ['lost with depth', 'transmitted equally', 'zero at the top', 'only downwards'], 1, "Pascal's principle: pressure is passed on equally in all directions."), fluidGen],
      },
    ],
  },
];

/* Chemistry */

const bondEnergyGen = (rng: Rng): Exercise => {
  const broken = 10 * int(rng, 40, 300);
  const formed = 10 * int(rng, 40, 300);
  const dh = broken - formed;
  return { kind: 'input', id: 'c8-bond-energy', prompt: `Bonds broken need ${broken} kJ. Bonds formed release ${formed} kJ. ΔH (kJ)?`, answers: [String(dh)], explain: `ΔH = energy to break bonds − energy released making bonds = ${broken} − ${formed} = ${dh < 0 ? '−' : ''}${Math.abs(dh)} kJ. ${dh < 0 ? 'Negative: exothermic.' : dh > 0 ? 'Positive: endothermic.' : 'Zero overall.'}`, tip: { kind: 'formula', text: 'ΔH = bonds broken − bonds made. Negative ΔH means heat given out (exothermic).' } };
};

const solubilityGen = (rng: Rng): Exercise => {
  const water = pickOne(rng, [20, 25, 50, 200] as const);
  const per100 = int(rng, 4, 60);
  const mass = (per100 * water) / 100;
  return { kind: 'input', id: 'c9-solubility', prompt: `${dec(mass)} g of a salt saturates ${water} g of water. Solubility in g per 100 g of water?`, answers: [String(per100)], explain: `Scale up to 100 g of water. Solubility = ${dec(mass)} × 100 ÷ ${water} = ${per100} g.`, tip: { kind: 'shortcut', text: 'Solubility is always quoted per 100 g of water. Scale whatever you are given to 100.' } };
};

export const CHEMISTRY_FINAL: Unit[] = [
  {
    id: 'c-u8',
    title: 'Bonding & energy',
    description: 'Ionic, covalent and metallic bonds; exothermic and endothermic reactions',
    who: 'greta',
    color: '#3b82f6',
    lessons: [
      {
        id: 'c8-bonding',
        title: 'Chemical bonding',
        icon: '🔗',
        teach: [
          teach('c8-bond-t1', 'greta', 'How atoms hold together', [
            'Ionic bonding: a metal gives electrons to a non-metal, making oppositely charged ions that attract (NaCl). High melting points; conduct when molten or dissolved.',
            'Covalent bonding: non-metals share pairs of electrons (H₂O, CH₄). Simple covalent substances have low melting points and do not conduct.',
            'Dative (coordinate) bond: both shared electrons come from one atom, as in NH₄⁺.',
            'Metallic bonding: positive ions in a sea of delocalised electrons, so metals conduct and bend.',
            'Atoms bond to reach a stable outer shell (the octet rule).',
          ], { hook: { kind: 'memory', text: 'IONic = give and take (I Owe Nothing). COvalent = CO-operate and share.' } }),
        ],
        exercises: [
          match('c8-bond-1', 'Match the substance to its bonding', [['Sodium chloride', 'Ionic'], ['Methane', 'Covalent'], ['Copper', 'Metallic'], ['Ammonium ion', 'Dative (coordinate)']], 'Metal + non-metal is ionic; non-metals only is covalent.'),
          mc('c8-bond-2', 'Which conducts electricity when molten but not when solid?', ['Copper', 'Sodium chloride', 'Sugar', 'Diamond'], 1, 'Its ions are fixed in the solid but free to move when molten.'),
          tf('c8-bond-3', 'Covalent bonds are formed by sharing electrons.', true, 'Each shared pair is one covalent bond.'),
          mc('c8-bond-4', 'How many covalent bonds does carbon form in methane, CH₄?', ['1', '2', '3', '4'], 3, 'Carbon has 4 outer electrons and shares one with each hydrogen.'),
          mc('c8-bond-5', 'Metals conduct electricity because of…', ['free ions in solution', 'delocalised electrons', 'shared electron pairs', 'protons moving'], 1, 'The sea of electrons can move through the structure.'),
        ],
      },
      {
        id: 'c8-energy',
        title: 'Energy changes',
        icon: '🔥',
        teach: [
          teach('c8-en-t1', 'greta', 'Heat in and heat out', [
            'Exothermic reactions give out heat; ΔH is negative. Burning and neutralisation are exothermic.',
            'Endothermic reactions take in heat; ΔH is positive. Dissolving ammonium nitrate and photosynthesis are endothermic.',
            'Breaking bonds takes in energy; making bonds gives it out.',
            'ΔH = energy needed to break bonds − energy released making new bonds.',
          ], { example: ['Break 1650 kJ, make 1860 kJ: ΔH = 1650 − 1860 = −210 kJ (exothermic)'], hook: { kind: 'memory', text: 'EXothermic: heat EXits. ENdothermic: heat ENters.' } }),
        ],
        exercises: [bondEnergyGen, bondEnergyGen, mc('c8-en-1', 'A reaction with ΔH = −57 kJ/mol is…', ['endothermic', 'exothermic', 'neither', 'impossible'], 1, 'Negative ΔH: heat given out.'), bondEnergyGen, tf('c8-en-2', 'Breaking bonds releases energy.', false, 'Breaking bonds always needs energy; making bonds releases it.'), bondEnergyGen],
      },
    ],
  },
  {
    id: 'c-u9',
    title: 'Water, non-metals & polymers',
    description: 'Solubility, nitrogen, sulphur, halogens, polymers and food chemistry',
    who: 'greta',
    color: '#06b6d4',
    lessons: [
      {
        id: 'c9-water',
        title: 'Water & solubility',
        icon: '💧',
        teach: [
          teach('c9-wat-t1', 'greta', 'Solutions', [
            'Solubility is the mass of solute that saturates 100 g of water at a given temperature.',
            'A saturated solution holds as much solute as it can at that temperature. Most solids dissolve more as temperature rises; gases dissolve less.',
            'Water is purified by coagulation (alum), sedimentation, filtration and chlorination.',
            'Efflorescent salts lose water to the air; deliquescent substances absorb so much water they dissolve; hygroscopic substances absorb water without dissolving.',
          ], { example: ['12 g saturates 40 g of water: 12 × 100 ÷ 40 = 30 g per 100 g'], hook: { kind: 'memory', text: 'Fizzy drinks go flat when warm: gases dissolve less in warm water.' } }),
        ],
        exercises: [solubilityGen, solubilityGen, match('c9-wat-1', 'Match the term', [['Efflorescent', 'Loses water to the air'], ['Deliquescent', 'Absorbs water until it dissolves'], ['Hygroscopic', 'Absorbs water but stays solid']], 'Three exam favourites. Learn them together.'), solubilityGen, mc('c9-wat-2', 'Chlorine is added to drinking water to…', ['soften it', 'kill germs', 'remove colour', 'add minerals'], 1, 'Chlorination sterilises water.')],
      },
      {
        id: 'c9-nonmetals',
        title: 'Nitrogen, sulphur & halogens',
        icon: '🧪',
        teach: [
          teach('c9-nm-t1', 'greta', 'Important non-metals', [
            'Nitrogen makes up about 78% of air. It is unreactive because of its strong triple bond. Ammonia (NH₃) is the only common alkaline gas.',
            'Sulphur burns with a blue flame to form sulphur dioxide, a cause of acid rain. Sulphuric acid is made by the Contact process.',
            'Halogens (group 7) get less reactive down the group: fluorine, chlorine, bromine, iodine.',
            'A more reactive halogen displaces a less reactive one from its salts.',
            'Chlorine bleaches damp litmus paper.',
          ], { hook: { kind: 'shortcut', text: 'Halogens are the opposite of group 1 metals: reactivity goes DOWN as you go down.' } }),
        ],
        exercises: [
          order('c9-nm-1', 'Order the halogens from most to least reactive', ['Fluorine', 'Chlorine', 'Bromine', 'Iodine'], 'Reactivity decreases down group 7.'),
          mc('c9-nm-2', 'Which gas turns damp red litmus blue?', ['Chlorine', 'Ammonia', 'Carbon dioxide', 'Sulphur dioxide'], 1, 'Ammonia is alkaline.'),
          mc('c9-nm-3', 'Chlorine + potassium bromide gives…', ['no reaction', 'potassium chloride + bromine', 'potassium + chlorine bromide', 'bromine chloride'], 1, 'Chlorine is more reactive, so it displaces bromine.'),
          tf('c9-nm-4', 'Nitrogen is very reactive.', false, 'Its triple bond is very strong, so it is quite unreactive.'),
          mc('c9-nm-5', 'Acid rain is mainly caused by…', ['oxygen and nitrogen', 'sulphur dioxide and nitrogen oxides', 'carbon monoxide', 'water vapour'], 1, 'They dissolve in rain to make acids.'),
        ],
      },
      {
        id: 'c9-polymers',
        title: 'Polymers & food chemistry',
        icon: '🧵',
        teach: [
          teach('c9-pol-t1', 'greta', 'Long chains', [
            'Polymers are long chains of repeating units (monomers).',
            'Addition polymers form from unsaturated monomers without losing anything: ethene → polythene.',
            'Condensation polymers lose a small molecule such as water as they join: nylon, proteins, starch.',
            'Proteins are made from amino acids, starch from glucose, fats from fatty acids and glycerol.',
            'Saponification: fat + alkali (NaOH) → soap + glycerol.',
          ], { hook: { kind: 'memory', text: 'Addition just adds. Condensation drips out water as it joins, like condensation on a cold glass.' } }),
        ],
        exercises: [
          match('c9-pol-1', 'Match the polymer to its monomer', [['Polythene', 'Ethene'], ['Starch', 'Glucose'], ['Protein', 'Amino acids'], ['PVC', 'Chloroethene']], 'Every polymer is built from one repeating unit.'),
          mc('c9-pol-2', 'Soap is made by boiling fat with…', ['hydrochloric acid', 'sodium hydroxide', 'ethanol', 'water only'], 1, 'Saponification uses an alkali.'),
          mc('c9-pol-3', 'Nylon is a…', ['natural addition polymer', 'condensation polymer', 'metal', 'monomer'], 1, 'Water is lost as its monomers join.'),
          tf('c9-pol-4', 'Polythene is made from ethane.', false, 'From ethene: it needs the double bond to add together.'),
        ],
      },
    ],
  },
];

/* Biology */

export const BIOLOGY_FINAL: Unit[] = [
  {
    id: 'b-u7',
    title: 'Support, senses, health & survival',
    description: 'Skeleton and movement, the eye and ear, disease and immunity, adaptation and conservation',
    who: 'priya',
    color: '#0d9488',
    lessons: [
      {
        id: 'b7-skeleton',
        title: 'Skeleton & movement',
        icon: '🦴',
        teach: [
          teach('b7-sk-t1', 'priya', 'Bones, joints and muscles', [
            'The skeleton supports, protects (the skull protects the brain), allows movement and makes blood cells in the bone marrow.',
            'Joints: ball and socket (hip, shoulder) moves in all directions; hinge (knee, elbow) in one plane; fixed joints (skull) do not move.',
            'Muscles work in antagonistic pairs: the biceps contracts to bend the arm, the triceps to straighten it.',
            'Ligaments join bone to bone; tendons join muscle to bone.',
            'Insects have an exoskeleton made of chitin; vertebrates have an endoskeleton.',
          ], { hook: { kind: 'memory', text: 'Ligaments link bones (L-L). Tendons tie muscle to bone.' } }),
        ],
        exercises: [
          match('b7-sk-1', 'Match the joint to an example', [['Ball and socket', 'Hip'], ['Hinge', 'Knee'], ['Fixed', 'Skull'], ['Pivot', 'Neck (top vertebrae)']], 'Think about how each one moves.'),
          mc('b7-sk-2', 'Tendons connect…', ['bone to bone', 'muscle to bone', 'muscle to muscle', 'nerve to muscle'], 1, 'Ligaments connect bone to bone.'),
          mc('b7-sk-3', 'To bend the arm at the elbow, the…', ['triceps contracts', 'biceps contracts', 'both relax', 'ligament contracts'], 1, 'The biceps pulls the forearm up; the triceps relaxes.'),
          tf('b7-sk-4', 'Red blood cells are made in bone marrow.', true, 'Red marrow in bones like the femur makes blood cells.'),
          mc('b7-sk-5', 'The exoskeleton of insects is made of…', ['keratin', 'chitin', 'cellulose', 'calcium phosphate'], 1, 'Chitin is light and tough.'),
        ],
      },
      {
        id: 'b7-senses',
        title: 'The eye & ear',
        icon: '👁️',
        teach: [
          teach('b7-se-t1', 'priya', 'How we see and hear', [
            'Eye: light passes through the cornea, pupil and lens and focuses on the retina. The iris controls the pupil size; the optic nerve carries signals to the brain.',
            'Rods work in dim light; cones detect colour.',
            'Short sight is corrected with a concave lens; long sight with a convex lens.',
            'Ear: sound travels through the ear canal, vibrates the eardrum, then the ossicles (hammer, anvil, stirrup), then the cochlea, then the auditory nerve.',
            'The semicircular canals control balance.',
          ], { hook: { kind: 'memory', text: 'Cones for Colour. Rods for Rough (dim) light.' } }),
        ],
        exercises: [
          order('b7-se-1', 'Order the path of sound in the ear', ['Ear canal', 'Eardrum', 'Ossicles', 'Cochlea', 'Auditory nerve'], 'Outer ear, middle ear, inner ear, then the brain.'),
          match('b7-se-2', 'Match the part of the eye to its job', [['Iris', 'Controls pupil size'], ['Lens', 'Focuses light'], ['Retina', 'Detects light'], ['Optic nerve', 'Carries signals to the brain']], 'Follow the light from front to back.'),
          mc('b7-se-3', 'Which cells detect colour?', ['Rods', 'Cones', 'Neurones', 'Ossicles'], 1, 'Cones need bright light and give colour vision.'),
          mc('b7-se-4', 'Balance is controlled by the…', ['cochlea', 'eardrum', 'semicircular canals', 'pinna'], 2, 'Fluid in the canals moves when the head moves.'),
        ],
      },
      {
        id: 'b7-disease',
        title: 'Diseases & immunity',
        icon: '🦠',
        teach: [
          teach('b7-di-t1', 'priya', 'Germs and defences', [
            'Pathogens cause disease: viruses (HIV, measles), bacteria (tuberculosis, cholera), protozoa (malaria) and fungi (ringworm).',
            'White blood cells defend us: phagocytes engulf germs; lymphocytes make antibodies.',
            'Vaccination gives a harmless form of a germ so the body makes memory cells: active immunity.',
            'Antibiotics kill bacteria but do not work against viruses.',
            'Malaria is spread by the female Anopheles mosquito; cholera through dirty water.',
          ], { hook: { kind: 'eliminate', text: 'If the question says "virus", any option involving antibiotics is wrong.' } }),
        ],
        exercises: [
          match('b7-di-1', 'Match the disease to its cause', [['Malaria', 'Protozoan (Plasmodium)'], ['Tuberculosis', 'Bacterium'], ['Measles', 'Virus'], ['Ringworm', 'Fungus']], 'Four kinds of pathogen, one example each.'),
          tf('b7-di-2', 'Antibiotics cure viral infections like the flu.', false, 'Antibiotics act on bacteria, not viruses.'),
          mc('b7-di-3', 'Vaccines work by…', ['killing all bacteria', 'making the body produce memory cells', 'replacing white blood cells', 'raising body temperature'], 1, 'Memory cells respond fast if the real germ arrives.'),
          mc('b7-di-4', 'Cholera is mainly spread through…', ['mosquito bites', 'contaminated water', 'coughing', 'touch only'], 1, 'Good sanitation and clean water prevent it.'),
          mc('b7-di-5', 'Which white blood cells make antibodies?', ['Phagocytes', 'Lymphocytes', 'Platelets', 'Red cells'], 1, 'Lymphocytes make antibodies; phagocytes engulf.'),
        ],
      },
      {
        id: 'b7-adaptation',
        title: 'Adaptation & conservation',
        icon: '🌵',
        teach: [
          teach('b7-ad-t1', 'priya', 'Fitting in and staying alive', [
            'Adaptations are features that help an organism survive where it lives.',
            'Xerophytes (desert plants) have thick cuticles, sunken stomata and spines to save water. Hydrophytes (water plants) have air spaces to float.',
            'Animals use camouflage, mimicry, hibernation and aestivation (dormancy in hot, dry seasons).',
            'Conservation protects species and habitats: game reserves, national parks, laws against poaching, afforestation.',
            'Deforestation causes soil erosion, loss of habitat and more carbon dioxide in the air.',
          ], { hook: { kind: 'memory', text: 'XEROphytes live where water is near ZERO.' } }),
        ],
        exercises: [
          mc('b7-ad-1', 'Sunken stomata and a thick cuticle are adaptations of…', ['hydrophytes', 'xerophytes', 'parasites', 'algae'], 1, 'They reduce water loss in dry places.'),
          match('b7-ad-2', 'Match the term', [['Camouflage', 'Blending in with the surroundings'], ['Hibernation', 'Dormancy in cold seasons'], ['Aestivation', 'Dormancy in hot, dry seasons'], ['Mimicry', 'Looking like another species']], 'Each helps an animal survive.'),
          tf('b7-ad-3', 'Afforestation means cutting down forests.', false, 'Afforestation is planting trees; deforestation is cutting them down.'),
          mc('b7-ad-4', 'Which helps conserve wildlife?', ['Bush burning', 'Game reserves', 'Overgrazing', 'Poaching'], 1, 'Reserves protect habitats and animals.', { kind: 'eliminate', text: 'Three of these harm wildlife. Pick the odd one out.' }),
        ],
      },
    ],
  },
];
