import type { Course, Exercise, Lesson, Rng } from '../types';
import { choice, dec, int, match, mc, order, pickOne, teach, tf } from '../util';

/* Units and measurement */

const convertGen = (rng: Rng): Exercise => {
  const kind = pickOne(rng, ['km', 'cm', 'g', 'min', 'mm'] as const);
  const n = int(rng, 2, 95);
  const spec = {
    km: { q: `${dec(n / 10)} km to metres`, a: n * 100, how: `1 km = 1000 m, so ${dec(n / 10)} × 1000 = ${n * 100} m.` },
    cm: { q: `${n * 10} cm to metres`, a: n / 10, how: `100 cm = 1 m, so ${n * 10} ÷ 100 = ${dec(n / 10)} m.` },
    g: { q: `${n * 100} g to kilograms`, a: n / 10, how: `1000 g = 1 kg, so ${n * 100} ÷ 1000 = ${dec(n / 10)} kg.` },
    min: { q: `${n} minutes to seconds`, a: n * 60, how: `1 min = 60 s, so ${n} × 60 = ${n * 60} s.` },
    mm: { q: `${n * 100} mm to metres`, a: n / 10, how: `1000 mm = 1 m, so ${n * 100} ÷ 1000 = ${dec(n / 10)} m.` },
  }[kind];
  return { kind: 'input', id: 'p1-convert', prompt: `Convert ${spec.q}`, answers: [dec(spec.a)], explain: spec.how, tip: { kind: 'shortcut', text: 'Bigger unit to smaller unit: multiply. Smaller to bigger: divide.' } };
};

const units: Lesson = {
  id: 'p1-units',
  title: 'Units & measurement',
  icon: '📏',
  teach: [
    teach('p1-units-t1', 'greta', 'Physics starts with measuring', [
      'Every measurement is a number and a unit. "5" means nothing; "5 m" is a length.',
      'The SI base quantities and units: length (metre, m), mass (kilogram, kg), time (second, s), temperature (kelvin, K), electric current (ampere, A), amount of substance (mole, mol), luminous intensity (candela, cd).',
      'Every other unit is built from these. Force: newton, N = kg·m/s².',
    ]),
    teach(
      'p1-units-t2',
      'greta',
      'Prefixes scale the unit',
      ['mega (M) = 1 000 000', 'kilo (k) = 1000', 'centi (c) = 1/100', 'milli (m) = 1/1000', 'micro (µ) = 1/1 000 000'],
      { example: ['3.2 km = 3200 m', '450 g = 0.45 kg', '25 cm = 0.25 m'], hook: { kind: 'memory', text: 'Seven base units, one sentence: "My Kind Son Knows A Mole Can" (metre, kilogram, second, kelvin, ampere, mole, candela).' } },
    ),
  ],
  exercises: [
    match('p1-units-1', 'Match each quantity to its SI unit', [['Length', 'metre'], ['Mass', 'kilogram'], ['Time', 'second'], ['Temperature', 'kelvin'], ['Current', 'ampere']], 'These are five of the seven SI base units.'),
    mc('p1-units-2', 'Which is NOT a base quantity?', ['Mass', 'Force', 'Time', 'Length'], 1, 'Force is derived: newton = kg·m/s².', { kind: 'eliminate', text: 'If its unit is built from other units, it is derived, not base.' }),
    tf('p1-units-3', 'The SI unit of mass is the gram.', false, 'It is the kilogram. The gram is just a smaller unit.'),
    convertGen,
    order('p1-units-4', 'Order the prefixes from smallest to biggest', ['micro', 'milli', 'centi', 'kilo', 'mega'], 'µ (10⁻⁶) < m (10⁻³) < c (10⁻²) < k (10³) < M (10⁶).'),
    convertGen,
    mc('p1-units-5', 'The newton (N) is the same as…', ['kg·m/s²', 'kg·m/s', 'kg/m²', 'm/s²'], 0, 'F = ma, so N = kg × m/s².', { kind: 'formula', text: 'Get any derived unit from its formula.' }),
    convertGen,
  ],
};

/* Scalars and vectors */

const resultantGen = (rng: Rng): Exercise => {
  const a = int(rng, 2, 15);
  const b = int(rng, 1, a - 1);
  const same = rng() < 0.5;
  return {
    kind: 'input',
    id: 'p1-resultant',
    prompt: `Forces of ${a} N and ${b} N act ${same ? 'in the same direction' : 'in opposite directions'}. Resultant (N)?`,
    answers: [String(same ? a + b : a - b)],
    explain: same ? `Same direction: add. ${a} + ${b} = ${a + b} N.` : `Opposite directions: subtract. ${a} − ${b} = ${a - b} N, in the direction of the ${a} N force.`,
  };
};

const vectors: Lesson = {
  id: 'p1-vectors',
  title: 'Scalars & vectors',
  icon: '➡️',
  teach: [
    teach('p1-vec-t1', 'greta', 'Size only, or size and direction?', [
      'A scalar has magnitude (size) only: distance, speed, mass, time, energy, temperature.',
      'A vector has magnitude AND direction: displacement, velocity, acceleration, force, momentum, weight.',
      'Vectors in the same direction add. In opposite directions, subtract.',
      'At right angles, use Pythagoras: R = √(a² + b²).',
    ], { example: ['3 N east + 4 N north → √(9 + 16) = 5 N'], hook: { kind: 'memory', text: 'Pairs to remember: distance (scalar) vs displacement (vector), speed (scalar) vs velocity (vector).' } }),
  ],
  exercises: [
    mc('p1-vec-1', 'Which is a vector?', ['Speed', 'Mass', 'Displacement', 'Energy'], 2, 'Displacement has direction; the others do not.'),
    tf('p1-vec-2', 'Speed is a vector quantity.', false, 'Speed has no direction. Velocity is the vector version.'),
    resultantGen,
    mc('p1-vec-3', 'Forces of 6 N and 8 N act at right angles. The resultant is…', ['14 N', '2 N', '10 N', '48 N'], 2, '√(36 + 64) = √100 = 10 N.', { kind: 'eliminate', text: 'At right angles the answer is between the difference (2) and the sum (14), never equal to either.' }),
    match('p1-vec-4', 'Match the scalar to its vector partner', [['Distance', 'Displacement'], ['Speed', 'Velocity'], ['Mass', 'Weight']], 'Each vector adds direction (or, for weight, the pull of gravity) to its scalar partner.'),
    resultantGen,
  ],
};

/* Motion */

const speedGen = (rng: Rng): Exercise => {
  const v = int(rng, 2, 30);
  const t = int(rng, 2, 20);
  const ask = pickOne(rng, ['v', 'd', 't'] as const);
  const d = v * t;
  if (ask === 'v') return { kind: 'input', id: 'p1-speed-v', prompt: `A runner covers ${d} m in ${t} s. Speed (m/s)?`, answers: [String(v)], explain: `v = d ÷ t = ${d} ÷ ${t} = ${v} m/s.`, tip: { kind: 'formula', text: 'v = d / t' } };
  if (ask === 'd') return { kind: 'input', id: 'p1-speed-d', prompt: `A car moves at ${v} m/s for ${t} s. Distance (m)?`, answers: [String(d)], explain: `d = v × t = ${v} × ${t} = ${d} m.`, tip: { kind: 'formula', text: 'd = v × t' } };
  return { kind: 'input', id: 'p1-speed-t', prompt: `How long (s) to cover ${d} m at ${v} m/s?`, answers: [String(t)], explain: `t = d ÷ v = ${d} ÷ ${v} = ${t} s.`, tip: { kind: 'formula', text: 'Cover the one you want in the d/v·t triangle: t = d / v' } };
};

const kmhGen = (rng: Rng): Exercise => {
  const k = int(rng, 1, 8);
  return {
    kind: 'input',
    id: 'p1-kmh',
    prompt: `${k * 18} km/h in m/s?`,
    answers: [String(k * 5)],
    explain: `km/h × 5/18 = m/s: ${k * 18} × 5 ÷ 18 = ${k * 5} m/s.`,
    tip: { kind: 'shortcut', text: 'km/h to m/s: × 5/18. m/s to km/h: × 18/5. (1000 m ÷ 3600 s = 5/18.)' },
  };
};

const accelGen = (rng: Rng): Exercise => {
  const a = int(rng, 1, 6);
  const t = int(rng, 2, 10);
  const u = int(rng, 0, 15);
  const v = u + a * t;
  return { kind: 'input', id: 'p1-accel', prompt: `Velocity rises from ${u} m/s to ${v} m/s in ${t} s. Acceleration (m/s²)?`, answers: [String(a)], explain: `a = (v − u) ÷ t = (${v} − ${u}) ÷ ${t} = ${a} m/s².`, tip: { kind: 'formula', text: 'a = (v − u) / t' } };
};

const motion: Lesson = {
  id: 'p1-motion',
  title: 'Speed, velocity & acceleration',
  icon: '🏃',
  teach: [
    teach('p1-motion-t1', 'greta', 'How fast, and how fast it changes', [
      'Speed = distance ÷ time (m/s).',
      'Velocity = displacement ÷ time: speed in a stated direction.',
      'Acceleration = change in velocity ÷ time: a = (v − u) / t, in m/s². u is the starting velocity, v the final one.',
      'Negative acceleration (slowing down) is called deceleration or retardation.',
    ], { example: ['From 4 m/s to 16 m/s in 3 s → a = 12 ÷ 3 = 4 m/s²'], hook: { kind: 'shortcut', text: 'km/h × 5/18 = m/s. So 72 km/h = 20 m/s and 36 km/h = 10 m/s.' } }),
  ],
  exercises: [speedGen, kmhGen, accelGen, tf('p1-motion-1', 'A car moving in a circle at constant speed has constant velocity.', false, 'Its direction keeps changing, so its velocity keeps changing.'), speedGen, accelGen, kmhGen],
};

const suvatGen = (rng: Rng): Exercise => {
  const kind = pickOne(rng, ['v', 's', 'v2'] as const);
  if (kind === 'v') {
    const u = int(rng, 0, 12);
    const a = int(rng, 1, 5);
    const t = int(rng, 2, 8);
    return { kind: 'input', id: 'p1-suvat-v', prompt: `u = ${u} m/s, a = ${a} m/s², t = ${t} s. Final velocity v (m/s)?`, answers: [String(u + a * t)], explain: `v = u + at = ${u} + ${a} × ${t} = ${u + a * t} m/s.`, tip: { kind: 'formula', text: 'v = u + at' } };
  }
  if (kind === 's') {
    const u = int(rng, 0, 10);
    const a = 2 * int(rng, 1, 3);
    const t = int(rng, 2, 6);
    const s = u * t + (a * t * t) / 2;
    return { kind: 'input', id: 'p1-suvat-s', prompt: `From u = ${u} m/s with a = ${a} m/s² for ${t} s. Distance s (m)?`, answers: [String(s)], explain: `s = ut + ½at² = ${u}×${t} + ½×${a}×${t}² = ${u * t} + ${(a * t * t) / 2} = ${s} m.`, tip: { kind: 'formula', text: 's = ut + ½at²' } };
  }
  const a = 2;
  const u = int(rng, 0, 8);
  const v = u + 2 * int(rng, 1, 5);
  const s = (v * v - u * u) / (2 * a);
  return { kind: 'input', id: 'p1-suvat-v2', prompt: `u = ${u} m/s, a = ${a} m/s², s = ${s} m. Final velocity v (m/s)?`, answers: [String(v)], explain: `v² = u² + 2as = ${u * u} + 2×${a}×${s} = ${v * v}, so v = ${v} m/s.`, tip: { kind: 'formula', text: 'v² = u² + 2as' } };
};

const equations: Lesson = {
  id: 'p1-suvat',
  title: 'Equations of motion',
  icon: '📐',
  teach: [
    teach('p1-suvat-t1', 'greta', 'Three equations for constant acceleration', [
      '1. v = u + at',
      '2. s = ut + ½at²',
      '3. v² = u² + 2as',
      'Pick the one that has the three things you know and the one you want. Starting from rest means u = 0.',
    ], { hook: { kind: 'formula', text: 'Rearranging is a skill: from v = u + at you get t = (v − u)/a and u = v − at. Do the same operation to both sides.' } }),
  ],
  exercises: [
    suvatGen,
    mc('p1-suvat-1', 'From v = u + at, make t the subject.', ['t = (v − u)/a', 't = (v + u)/a', 't = a/(v − u)', 't = v − u − a'], 0, 'Subtract u from both sides: v − u = at. Divide both sides by a: t = (v − u)/a.', { kind: 'formula', text: 'Undo operations in reverse order: first the +u, then the ×a.' }),
    suvatGen,
    mc('p1-suvat-2', 'A stone is dropped from rest. Its initial velocity u is…', ['9.8 m/s', '10 m/s', '0 m/s', 'Unknown'], 2, '"From rest" always means u = 0.'),
    suvatGen,
    suvatGen,
  ],
};

/* Density and pressure */

const densityGen = (rng: Rng): Exercise => {
  const r = pickOne(rng, [800, 1000, 2700, 7800, 500] as const);
  const v = pickOne(rng, [0.5, 2, 3, 0.25, 4] as const);
  const m = r * v;
  return { kind: 'input', id: 'p1-density', prompt: `A block has mass ${m} kg and volume ${v} m³. Density (kg/m³)?`, answers: [String(r)], explain: `ρ = m ÷ V = ${m} ÷ ${v} = ${r} kg/m³.`, tip: { kind: 'formula', text: 'ρ = m / V' } };
};

const pressureGen = (rng: Rng): Exercise => {
  const a = pickOne(rng, [0.5, 2, 4, 5, 0.2] as const);
  const p = 10 * int(rng, 2, 60);
  const f = p * a;
  return { kind: 'input', id: 'p1-pressure', prompt: `A force of ${dec(f)} N acts on ${a} m². Pressure (Pa)?`, answers: [String(p)], explain: `P = F ÷ A = ${dec(f)} ÷ ${a} = ${p} Pa.`, tip: { kind: 'formula', text: 'P = F / A. Same force on a smaller area gives more pressure (that is why knives are sharp).' } };
};

const density: Lesson = {
  id: 'p1-density',
  title: 'Density & pressure',
  icon: '🧊',
  teach: [
    teach('p1-density-t1', 'greta', 'How packed, and how pressed', [
      'Density = mass ÷ volume. Unit: kg/m³. Water is 1000 kg/m³ (= 1 g/cm³).',
      'An object floats in water if its density is less than 1000 kg/m³.',
      'Pressure = force ÷ area. Unit: pascal, Pa = N/m².',
    ], { hook: { kind: 'memory', text: 'Converting: 1 g/cm³ = 1000 kg/m³. Multiply g/cm³ by 1000.' } }),
  ],
  exercises: [
    densityGen,
    pressureGen,
    mc('p1-density-1', 'Which will float in water (density 1000 kg/m³)?', ['Iron, 7800 kg/m³', 'Cork, 240 kg/m³', 'Aluminium, 2700 kg/m³', 'Glass, 2500 kg/m³'], 1, 'Only cork is less dense than water.'),
    tf('p1-density-2', '2.7 g/cm³ is the same as 2700 kg/m³.', true, 'Multiply g/cm³ by 1000 to get kg/m³.'),
    densityGen,
    pressureGen,
  ],
};

/* Newton's laws */

const forceGen = (rng: Rng): Exercise => {
  const m = int(rng, 2, 20);
  const a = int(rng, 1, 8);
  return rng() < 0.5
    ? { kind: 'input', id: 'p1-fma', prompt: `Force needed to accelerate ${m} kg at ${a} m/s² (N)?`, answers: [String(m * a)], explain: `F = ma = ${m} × ${a} = ${m * a} N.`, tip: { kind: 'formula', text: 'F = ma' } }
    : { kind: 'input', id: 'p1-weight', prompt: `Weight of a ${m} kg mass (g = 10 m/s²), in N?`, answers: [String(m * 10)], explain: `W = mg = ${m} × 10 = ${m * 10} N.`, tip: { kind: 'formula', text: 'W = mg. JAMB usually takes g = 10 m/s².' } };
};

const newton: Lesson = {
  id: 'p1-newton',
  title: "Newton's laws & weight",
  icon: '🍎',
  teach: [
    teach('p1-newton-t1', 'greta', 'Three laws that run the world', [
      '1st law (inertia): an object stays at rest or keeps moving in a straight line unless a resultant force acts on it.',
      '2nd law: F = ma. Bigger force, bigger acceleration; bigger mass, smaller acceleration.',
      '3rd law: every action has an equal and opposite reaction, acting on a different body.',
      'Weight is a force: W = mg. Mass stays the same everywhere; weight changes with gravity.',
    ]),
  ],
  exercises: [
    match('p1-newton-1', 'Match each law to an example', [['1st law', 'Passengers jerk forward when a bus brakes'], ['2nd law', 'A harder kick makes the ball speed up more'], ['3rd law', 'A gun recoils when fired']], 'Inertia, F = ma, action and reaction.'),
    forceGen,
    tf('p1-newton-2', 'Your mass on the Moon is less than on Earth.', false, 'Mass is the same everywhere. Your weight is less, because the Moon pulls less.'),
    forceGen,
    mc('p1-newton-3', 'The tendency of a body to resist a change in its motion is…', ['Momentum', 'Inertia', 'Friction', 'Weight'], 1, 'That is inertia, the idea behind the first law.'),
    forceGen,
    choiceGenWeight,
  ],
};

function choiceGenWeight(rng: Rng): Exercise {
  const m = int(rng, 2, 12);
  return choice(rng, { id: 'p1-moon', prompt: `A ${m} kg object on the Moon (g = 1.6 m/s²) weighs…`, explain: `W = mg = ${m} × 1.6 = ${dec(m * 1.6)} N.`, tip: { kind: 'eliminate', text: 'Weight is in newtons and smaller than on Earth (m × 10).' } }, `${dec(m * 1.6)} N`, [`${m} N`, `${m * 10} N`, `${dec(m * 1.6)} kg`]);
}

export const PHYSICS: Course = {
  id: 'physics',
  title: 'Physics',
  icon: '⚛️',
  units: [
    { id: 'p-u1', title: 'Measurement & motion', description: 'Units, vectors, speed, acceleration, equations of motion', who: 'greta', color: '#60a5fa', lessons: [units, vectors, motion, equations] },
    { id: 'p-u2', title: 'Matter & forces', description: "Density, pressure and Newton's laws", who: 'greta', color: '#a78bfa', lessons: [density, newton] },
  ],
  upcoming: ['Work, energy & power', 'Heat & temperature', 'Waves & sound', 'Light & optics', 'Electricity', 'Magnetism', 'Modern physics'],
};
