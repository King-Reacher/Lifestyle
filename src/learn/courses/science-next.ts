import type { Exercise, Rng, Unit } from '../types';
import { choice, dec, frac, gcd, int, match, mc, num, order, pickOne, simplify, teach, tf } from '../util';

/** "an 8 Ω", "a 6 Ω": the article follows the spoken number. */
const an = (n: number) => (/^(8|11|18)$|^8\d$/.test(String(n)) ? `an ${n}` : `a ${n}`);

/* Physics: electricity */

const ohmGen = (rng: Rng): Exercise => {
  const i = int(rng, 1, 10);
  const r = int(rng, 2, 20);
  const v = i * r;
  const ask = pickOne(rng, ['V', 'I', 'R'] as const);
  const tip = { kind: 'formula' as const, text: 'V = IR. Cover the one you want in the triangle V over I × R.' };
  if (ask === 'V') return { kind: 'input', id: 'p4-ohm-v', prompt: `A current of ${i} A flows through ${an(r)} Ω resistor. Voltage across it (V)?`, answers: [String(v)], explain: `V = IR = ${i} × ${r} = ${v} V.`, tip };
  if (ask === 'I') return { kind: 'input', id: 'p4-ohm-i', prompt: `${v} V is applied across ${an(r)} Ω resistor. Current (A)?`, answers: [String(i)], explain: `I = V ÷ R = ${v} ÷ ${r} = ${i} A.`, tip };
  return { kind: 'input', id: 'p4-ohm-r', prompt: `${an(v).replace(/^a/, 'A')} V supply drives ${i} A through a resistor. Resistance (Ω)?`, answers: [String(r)], explain: `R = V ÷ I = ${v} ÷ ${i} = ${r} Ω.`, tip };
};

/** Pairs whose parallel combination is a whole number. */
const PARALLEL: [number, number][] = [[3, 6], [4, 4], [6, 12], [10, 15], [12, 4], [20, 5], [6, 6], [10, 40], [12, 24], [30, 60]];

const resistorsGen = (rng: Rng): Exercise => {
  if (rng() < 0.5) {
    const rs = [int(rng, 1, 12), int(rng, 1, 12), int(rng, 1, 12)];
    const total = rs[0] + rs[1] + rs[2];
    return { kind: 'input', id: 'p4-series', prompt: `Resistors of ${rs.join(' Ω, ')} Ω are joined in series. Total resistance (Ω)?`, answers: [String(total)], explain: `In series, just add: ${rs.join(' + ')} = ${total} Ω.`, tip: { kind: 'formula', text: 'Series: R = R₁ + R₂ + R₃' } };
  }
  const [a, b] = pickOne(rng, PARALLEL);
  const total = (a * b) / (a + b);
  return { kind: 'input', id: 'p4-parallel', prompt: `A ${a} Ω and a ${b} Ω resistor are joined in parallel. Total resistance (Ω)?`, answers: [String(total)], explain: `For two in parallel: product over sum = (${a} × ${b}) ÷ (${a} + ${b}) = ${a * b} ÷ ${a + b} = ${total} Ω.`, tip: { kind: 'eliminate', text: 'The parallel total is always smaller than the smallest resistor. Cross out anything bigger.' } };
};

const costGen = (rng: Rng): Exercise => {
  const p = pickOne(rng, [100, 200, 500, 1000, 1500, 2000] as const);
  const h = int(rng, 1, 10);
  const rate = pickOne(rng, [50, 60, 80, 100] as const);
  const kwh = (p * h) / 1000;
  const cost = (p * h * rate) / 1000;
  return { kind: 'input', id: 'p4-cost', prompt: `A ${p} W appliance runs for ${h} hour${h === 1 ? '' : 's'}. Electricity costs ₦${rate} per kWh. Cost?`, prefix: '₦', answers: [String(cost)], explain: `Energy = ${p / 1000} kW × ${h} h = ${dec(kwh)} kWh. Cost = ${dec(kwh)} × ₦${rate} = ₦${cost}.`, tip: { kind: 'shortcut', text: 'Turn watts into kilowatts first (÷ 1000), then kW × hours = kWh.' } };
};

const powerGen = (rng: Rng): Exercise => {
  const i = int(rng, 1, 10);
  const v = pickOne(rng, [6, 12, 24, 120, 220, 240] as const);
  return { kind: 'input', id: 'p4-power', prompt: `A device takes ${i} A from a ${v} V supply. Power (W)?`, answers: [String(i * v)], explain: `P = IV = ${i} × ${v} = ${i * v} W.`, tip: { kind: 'formula', text: 'P = IV = I²R = V²/R. Pick the one that uses the values you are given.' } };
};

/* Physics: heat and waves */

const C = [
  { name: 'water', c: 4200 },
  { name: 'aluminium', c: 900 },
  { name: 'copper', c: 400 },
  { name: 'iron', c: 450 },
] as const;

const heatGen = (rng: Rng): Exercise => {
  const s = pickOne(rng, C);
  const m = int(rng, 1, 5);
  const dt = int(rng, 2, 8) * 5;
  const q = m * s.c * dt;
  return { kind: 'input', id: 'p5-heat', prompt: `Heat (J) needed to warm ${m} kg of ${s.name} by ${dt} °C? (c = ${s.c} J/kg°C)`, answers: [String(q)], explain: `Q = mcΔθ = ${m} × ${s.c} × ${dt} = ${q} J.`, tip: { kind: 'formula', text: 'Q = mcΔθ. "Mc Theta": mass, specific heat capacity, temperature change.' } };
};

const kelvinGen = (rng: Rng): Exercise => {
  const c = int(rng, -50, 150);
  return rng() < 0.5
    ? { kind: 'input', id: 'p5-to-kelvin', prompt: `Convert ${num(c)} °C to kelvin`, suffix: 'K', answers: [String(c + 273)], explain: `K = °C + 273 = ${num(c)} + 273 = ${c + 273} K.`, tip: { kind: 'formula', text: 'K = °C + 273. Kelvin never goes below 0.' } }
    : { kind: 'input', id: 'p5-to-celsius', prompt: `Convert ${c + 273} K to °C`, suffix: '°C', answers: [String(c)], explain: `°C = K − 273 = ${c + 273} − 273 = ${num(c)} °C.`, tip: { kind: 'formula', text: '°C = K − 273' } };
};

const waveGen = (rng: Rng): Exercise => {
  const f = int(rng, 2, 50);
  const l = int(rng, 1, 20);
  const v = f * l;
  const tip = { kind: 'formula' as const, text: 'v = fλ. Speed = frequency × wavelength.' };
  const ask = pickOne(rng, ['v', 'f', 'l'] as const);
  if (ask === 'v') return { kind: 'input', id: 'p5-wave-v', prompt: `A wave has frequency ${f} Hz and wavelength ${l} m. Speed (m/s)?`, answers: [String(v)], explain: `v = fλ = ${f} × ${l} = ${v} m/s.`, tip };
  if (ask === 'f') return { kind: 'input', id: 'p5-wave-f', prompt: `A wave travels at ${v} m/s with wavelength ${l} m. Frequency (Hz)?`, answers: [String(f)], explain: `f = v ÷ λ = ${v} ÷ ${l} = ${f} Hz.`, tip };
  return { kind: 'input', id: 'p5-wave-l', prompt: `A wave travels at ${v} m/s with frequency ${f} Hz. Wavelength (m)?`, answers: [String(l)], explain: `λ = v ÷ f = ${v} ÷ ${f} = ${l} m.`, tip };
};

export const PHYSICS_NEXT: Unit[] = [
  {
    id: 'p-u4',
    title: 'Electricity',
    description: "Current, voltage, resistance, Ohm's law, circuits, power and cost",
    who: 'greta',
    color: '#eab308',
    lessons: [
      {
        id: 'p4-ohm',
        title: "Ohm's law",
        icon: '⚡',
        teach: [
          teach('p4-ohm-t1', 'greta', 'Current, voltage and resistance', [
            'Electric current (I) is the flow of charge, measured in amperes (A) with an ammeter connected in series.',
            'Voltage (V), or potential difference, is the push that drives the current, measured in volts with a voltmeter connected in parallel.',
            'Resistance (R) opposes the current, measured in ohms (Ω).',
            "Ohm's law: V = IR, as long as the temperature stays the same.",
          ], { example: ['2 A through a 6 Ω resistor: V = 2 × 6 = 12 V'], hook: { kind: 'memory', text: 'Water in a pipe: voltage is the pressure, current is the flow, resistance is a narrow pipe.' } }),
        ],
        exercises: [ohmGen, ohmGen, mc('p4-ohm-1', 'A voltmeter is connected…', ['in series', 'in parallel', 'either way', 'only to the battery'], 1, 'A voltmeter measures the difference across a component, so it goes in parallel with it.', { kind: 'memory', text: 'Ammeter in series, voltmeter in parallel. "A-S, V-P".' }), ohmGen, tf('p4-ohm-2', 'The unit of resistance is the ohm.', true, 'Resistance is measured in ohms (Ω).'), ohmGen],
      },
      {
        id: 'p4-circuits',
        title: 'Series & parallel',
        icon: '🔌',
        teach: [
          teach('p4-circ-t1', 'greta', 'Two ways to connect', [
            'In a series circuit there is one path. The same current flows through everything, and resistances add: R = R₁ + R₂.',
            'In a parallel circuit there are branches. Each branch has the same voltage, and 1/R = 1/R₁ + 1/R₂.',
            'For two resistors in parallel, R = (R₁ × R₂) ÷ (R₁ + R₂): product over sum.',
            'Houses are wired in parallel, so one bulb blowing does not switch off the rest.',
          ], { example: ['3 Ω and 6 Ω in series: 9 Ω', '3 Ω and 6 Ω in parallel: 18 ÷ 9 = 2 Ω'], hook: { kind: 'shortcut', text: 'Two equal resistors in parallel give exactly half of one.' } }),
        ],
        exercises: [resistorsGen, resistorsGen, tf('p4-circ-1', 'Adding resistors in parallel lowers the total resistance.', true, 'Each new branch gives the current another path.'), resistorsGen, resistorsGen],
      },
      {
        id: 'p4-power',
        title: 'Electrical power & cost',
        icon: '💡',
        teach: [
          teach('p4-pow-t1', 'greta', 'Paying for electricity', [
            'Electrical power: P = IV, in watts.',
            'Energy used = power × time. The electricity company counts it in kilowatt-hours (kWh).',
            '1 kWh is a 1000 W appliance running for 1 hour.',
            'Cost = kWh × price per kWh.',
          ], { example: ['A 2000 W iron for 3 hours: 2 kW × 3 h = 6 kWh', 'At ₦60 per kWh: 6 × 60 = ₦360'] }),
        ],
        exercises: [powerGen, costGen, costGen, mc('p4-pow-1', 'The kilowatt-hour is a unit of…', ['power', 'energy', 'current', 'charge'], 1, 'kW × h is power × time, which is energy.', { kind: 'eliminate', text: 'A unit that multiplies by time cannot be power.' }), powerGen, costGen],
      },
    ],
  },
  {
    id: 'p-u5',
    title: 'Heat & waves',
    description: 'Temperature, specific heat capacity, wave speed, sound and light',
    who: 'greta',
    color: '#ef4444',
    lessons: [
      {
        id: 'p5-heat',
        title: 'Heat & temperature',
        icon: '🌡️',
        teach: [
          teach('p5-heat-t1', 'greta', 'Heat is energy, temperature is hotness', [
            'Temperature is measured in °C or kelvin (K). K = °C + 273. 0 K is absolute zero, the coldest possible.',
            'Specific heat capacity (c) is the heat needed to warm 1 kg of a substance by 1 °C.',
            'Heat needed: Q = mcΔθ, where Δθ is the temperature change.',
            'Heat travels by conduction (through solids), convection (by moving fluids) and radiation (as waves, even through a vacuum).',
          ], { example: ['Warming 2 kg of water by 10 °C: Q = 2 × 4200 × 10 = 84 000 J'], hook: { kind: 'memory', text: 'Water has a huge c (4200). That is why the sea stays cool on a hot day.' } }),
        ],
        exercises: [
          heatGen,
          kelvinGen,
          match('p5-heat-1', 'Match the heat transfer to the example', [['Conduction', 'A metal spoon getting hot in tea'], ['Convection', 'Hot air rising from a stove'], ['Radiation', "The sun's heat reaching Earth"]], 'Solid contact, moving fluid, waves.'),
          heatGen,
          kelvinGen,
          tf('p5-heat-2', 'Heat can travel through a vacuum by convection.', false, 'Convection needs a fluid. Only radiation crosses a vacuum.'),
          heatGen,
        ],
      },
      {
        id: 'p5-waves',
        title: 'Waves, sound & light',
        icon: '🌊',
        teach: [
          teach('p5-wave-t1', 'greta', 'Waves carry energy', [
            'Frequency (f) is the number of waves each second, in hertz (Hz). Wavelength (λ) is the length of one wave.',
            'Wave speed: v = fλ.',
            'Transverse waves vibrate across the direction of travel (light, water waves). Longitudinal waves vibrate along it (sound).',
            'Sound needs a medium and cannot travel through a vacuum. Light can.',
            'Amplitude is the height of a wave: bigger amplitude means louder sound or brighter light.',
          ], { example: ['A 50 Hz wave with wavelength 4 m: v = 50 × 4 = 200 m/s'], hook: { kind: 'memory', text: 'Light is fast and needs nothing. Sound is slow and needs something to travel through.' } }),
        ],
        exercises: [
          waveGen,
          waveGen,
          mc('p5-wave-1', 'Sound waves are…', ['transverse', 'longitudinal', 'electromagnetic', 'stationary only'], 1, 'Sound is a longitudinal wave of compressions and rarefactions.'),
          order('p5-wave-2', 'Order the electromagnetic spectrum from longest wavelength', ['Radio waves', 'Microwaves', 'Infrared', 'Visible light', 'Ultraviolet', 'X-rays', 'Gamma rays'], 'Remember "Raging Martians Invaded Venus Using X-ray Guns".'),
          waveGen,
          tf('p5-wave-3', 'Sound travels faster than light.', false, 'Light is about 300 000 000 m/s; sound in air is about 340 m/s. That is why you see lightning before you hear thunder.'),
          waveGen,
        ],
      },
    ],
  },
];

/* Chemistry: gas laws */

const boyleGen = (rng: Rng): Exercise => {
  const p1 = int(rng, 2, 10);
  const v1 = int(rng, 2, 12);
  const k = p1 * v1;
  const divisors = Array.from({ length: k }, (_, i) => i + 1).filter((d) => k % d === 0 && d !== p1 && d >= 2 && d <= 60);
  const p2 = divisors.length ? pickOne(rng, divisors) : p1 * 2;
  const v2 = k / p2;
  return { kind: 'input', id: 'c4-boyle', prompt: `A gas occupies ${v1} dm³ at ${p1} atm. Find its volume (dm³) at ${p2} atm, at constant temperature.`, answers: [dec(v2)], explain: `Boyle's law: P₁V₁ = P₂V₂, so V₂ = ${p1} × ${v1} ÷ ${p2} = ${dec(v2)} dm³.`, tip: { kind: 'eliminate', text: 'More pressure means less volume. If the pressure went up, any bigger volume is wrong.' } };
};

const KELVIN = [300, 400, 500, 600] as const;

const charlesGen = (rng: Rng): Exercise => {
  const t1 = pickOne(rng, KELVIN);
  let t2: number = pickOne(rng, KELVIN);
  if (t2 === t1) t2 = t1 === 600 ? 300 : t1 + 100;
  const g = gcd(t1, t2);
  const v1 = int(rng, 1, 5) * (t1 / g);
  const v2 = (v1 * t2) / t1;
  return { kind: 'input', id: 'c4-charles', prompt: `A gas has volume ${v1} cm³ at ${t1 - 273} °C. Find its volume (cm³) at ${t2 - 273} °C, at constant pressure.`, answers: [String(v2)], explain: `Change to kelvin first: ${t1 - 273} °C = ${t1} K, ${t2 - 273} °C = ${t2} K. Charles's law: V₁/T₁ = V₂/T₂, so V₂ = ${v1} × ${t2} ÷ ${t1} = ${v2} cm³.`, tip: { kind: 'formula', text: 'Gas laws always use kelvin. Add 273 before anything else.' } };
};

/* Chemistry: organic */

const PREFIX = ['meth', 'eth', 'prop', 'but', 'pent', 'hex', 'hept', 'oct'];
const SUBSCRIPT = '₀₁₂₃₄₅₆₇₈₉';
const subs = (n: number) => (n === 1 ? '' : String(n).replace(/\d/g, (d) => SUBSCRIPT[+d]));

const FAMILIES = [
  { name: 'alkane', end: 'ane', min: 1, h: (n: number) => 2 * n + 2, rule: 'CₙH₂ₙ₊₂' },
  { name: 'alkene', end: 'ene', min: 2, h: (n: number) => 2 * n, rule: 'CₙH₂ₙ' },
  { name: 'alkyne', end: 'yne', min: 2, h: (n: number) => 2 * n - 2, rule: 'CₙH₂ₙ₋₂' },
] as const;

const formula = (n: number, h: number) => `C${subs(n)}H${subs(h)}`;

const organicGen = (rng: Rng): Exercise => {
  const fam = pickOne(rng, FAMILIES);
  const n = int(rng, fam.min, 8);
  const name = PREFIX[n - 1] + fam.end;
  const right = formula(n, fam.h(n));
  const tip = { kind: 'formula' as const, text: `${fam.name}s: ${fam.rule}. Prefix gives the carbons: meth 1, eth 2, prop 3, but 4, pent 5, hex 6.` };
  if (rng() < 0.5)
    return choice(rng, { id: 'c5-formula', prompt: `What is the formula of ${name}?`, explain: `"${PREFIX[n - 1]}" means ${n} carbon${n > 1 ? 's' : ''}; it is an ${fam.name}, ${fam.rule}: ${right}.`, tip }, right, FAMILIES.filter((f) => f !== fam && n >= f.min).map((f) => formula(n, f.h(n))).concat([formula(n + 1, fam.h(n + 1)), formula(n, fam.h(n) + 1)]));
  const others = FAMILIES.filter((f) => f !== fam && n >= f.min).map((f) => PREFIX[n - 1] + f.end);
  return choice(rng, { id: 'c5-name', prompt: `Name the hydrocarbon ${right}`, explain: `${n} carbon${n > 1 ? 's' : ''} → "${PREFIX[n - 1]}". H = ${fam.h(n)} fits ${fam.rule}, so it is an ${fam.name}: ${name}.`, tip }, name, others.concat([PREFIX[n % 8] + fam.end, PREFIX[(n + 6) % 8] + fam.end]));
};

export const CHEMISTRY_NEXT: Unit[] = [
  {
    id: 'c-u4',
    title: 'Gases & electrolysis',
    description: "Boyle's and Charles's laws, electrolysis",
    who: 'greta',
    color: '#06b6d4',
    lessons: [
      {
        id: 'c4-gas',
        title: 'Gas laws',
        icon: '🎈',
        teach: [
          teach('c4-gas-t1', 'greta', 'How gases behave', [
            "Boyle's law: at constant temperature, pressure × volume stays the same. P₁V₁ = P₂V₂. Squeeze a gas and its volume shrinks.",
            "Charles's law: at constant pressure, volume ÷ temperature stays the same. V₁/T₁ = V₂/T₂. Heat a gas and it expands.",
            'Temperatures in gas laws must be in kelvin: K = °C + 273.',
            'General gas law: P₁V₁/T₁ = P₂V₂/T₂.',
          ], { example: ['4 dm³ at 2 atm, squeezed to 8 atm: V₂ = 2 × 4 ÷ 8 = 1 dm³'], hook: { kind: 'memory', text: 'Boyle: Pressure and volume play see-saw. Charles: volume and temperature climb together.' } }),
        ],
        exercises: [boyleGen, charlesGen, tf('c4-gas-1', "In Charles's law you may use °C directly.", false, 'Gas laws need kelvin. 0 °C is not "no temperature"; 0 K is.'), boyleGen, charlesGen, mc('c4-gas-2', "Boyle's law holds at constant…", ['pressure', 'volume', 'temperature', 'mass and pressure'], 2, 'Boyle: temperature fixed, P and V change.'), boyleGen],
      },
      {
        id: 'c4-electrolysis',
        title: 'Electrolysis',
        icon: '🔋',
        teach: [
          teach('c4-elec-t1', 'greta', 'Splitting compounds with electricity', [
            'Electrolysis uses electricity to break down a compound that is melted or dissolved: the electrolyte.',
            'The cathode is the negative electrode; positive ions (cations) go to it and gain electrons (reduction).',
            'The anode is the positive electrode; negative ions (anions) go to it and lose electrons (oxidation).',
            'Electrolysis of brine (salt water) gives hydrogen at the cathode, chlorine at the anode, and sodium hydroxide left in solution.',
          ], { hook: { kind: 'memory', text: 'OIL RIG: Oxidation Is Loss, Reduction Is Gain (of electrons). And "An Ox, Red Cat": anode oxidation, reduction at the cathode.' } }),
        ],
        exercises: [
          mc('c4-elec-1', 'Positive ions move towards the…', ['anode', 'cathode', 'electrolyte', 'battery'], 1, 'Opposites attract: positive ions go to the negative cathode.'),
          mc('c4-elec-2', 'Oxidation happens at the…', ['cathode', 'anode', 'both electrodes', 'neither'], 1, 'An Ox: anode oxidation.', { kind: 'memory', text: 'An Ox, Red Cat.' }),
          match('c4-elec-3', 'Electrolysis of brine: match the product to where it forms', [['Hydrogen', 'Cathode'], ['Chlorine', 'Anode'], ['Sodium hydroxide', 'Left in the solution']], 'This is how chlorine and caustic soda are made in industry.'),
          tf('c4-elec-4', 'Solid sodium chloride conducts electricity.', false, 'Its ions cannot move in the solid. It conducts when molten or dissolved.'),
          mc('c4-elec-5', 'Reduction is…', ['loss of electrons', 'gain of electrons', 'gain of oxygen', 'loss of protons'], 1, 'OIL RIG: Reduction Is Gain.'),
        ],
      },
    ],
  },
  {
    id: 'c-u5',
    title: 'Organic chemistry',
    description: 'Hydrocarbons, homologous series, alkanols',
    who: 'greta',
    color: '#84cc16',
    lessons: [
      {
        id: 'c5-hydrocarbons',
        title: 'Alkanes, alkenes & alkynes',
        icon: '🛢️',
        teach: [
          teach('c5-hc-t1', 'greta', 'Families of carbon compounds', [
            'A hydrocarbon contains only carbon and hydrogen.',
            'A homologous series is a family with the same general formula, where each member has one more CH₂ than the last.',
            'Alkanes (CₙH₂ₙ₊₂) have only single bonds: they are saturated.',
            'Alkenes (CₙH₂ₙ) have a C=C double bond; alkynes (CₙH₂ₙ₋₂) a triple bond. They are unsaturated.',
            'Unsaturated compounds decolourise bromine water; alkanes do not.',
          ], { example: ['Propane: 3 carbons, C₃H₈', 'Ethene: 2 carbons, C₂H₄'], hook: { kind: 'memory', text: 'Monkeys Eat Peeled Bananas: meth 1, eth 2, prop 3, but 4.' } }),
        ],
        exercises: [organicGen, organicGen, tf('c5-hc-1', 'Ethene decolourises bromine water.', true, 'Its C=C double bond reacts with bromine.'), organicGen, organicGen, mc('c5-hc-2', 'Members of a homologous series differ by…', ['CH', 'CH₂', 'CH₃', 'C₂H₄'], 1, 'Each member adds one CH₂ unit.'), organicGen],
      },
      {
        id: 'c5-alkanols',
        title: 'Alkanols & reactions',
        icon: '🍶',
        teach: [
          teach('c5-ol-t1', 'greta', 'Functional groups', [
            'A functional group decides how an organic compound reacts.',
            'Alkanols (alcohols) have the −OH group and end in "-ol", like ethanol, C₂H₅OH.',
            'Alkanoic acids have the −COOH group and end in "-oic acid", like ethanoic acid (vinegar).',
            'Alkanol + alkanoic acid → ester + water. Esters smell fruity.',
            'Alkanes react by substitution; alkenes react by addition.',
          ], { hook: { kind: 'memory', text: 'Alcohol + acid makes an ester: the fruity smell in sweets and perfume.' } }),
        ],
        exercises: [
          match('c5-ol-1', 'Match the functional group to the family', [['−OH', 'Alkanols'], ['−COOH', 'Alkanoic acids'], ['C=C', 'Alkenes'], ['−COO−', 'Esters']], 'Learn the group and the ending together.'),
          mc('c5-ol-2', 'Ethanol + ethanoic acid gives…', ['an alkane', 'an ester and water', 'a salt and hydrogen', 'an alkene'], 1, 'This is esterification.'),
          mc('c5-ol-3', 'Alkenes typically undergo…', ['substitution', 'addition', 'neutralisation', 'decomposition only'], 1, 'The double bond opens up and atoms add on.', { kind: 'shortcut', text: 'Alkanes Substitute, alkEnes add: unsaturated means room to add.' }),
          tf('c5-ol-4', 'Vinegar contains ethanoic acid.', true, 'Vinegar is a dilute solution of ethanoic acid.'),
          mc('c5-ol-5', 'The fermentation of glucose by yeast produces…', ['methanol', 'ethanol', 'ethene', 'ethanoic acid'], 1, 'Glucose → ethanol + carbon dioxide.'),
        ],
      },
    ],
  },
];

/* Biology: genetics and reproduction */

const TRAITS = [
  { letter: 'T', dom: 'tall', rec: 'short', ask: 'are short' },
  { letter: 'R', dom: 'red flowers', rec: 'white flowers', ask: 'have white flowers' },
  { letter: 'B', dom: 'black fur', rec: 'brown fur', ask: 'have brown fur' },
  { letter: 'G', dom: 'green seeds', rec: 'yellow seeds', ask: 'have yellow seeds' },
] as const;

const crossGen = (rng: Rng): Exercise => {
  const t = pickOne(rng, TRAITS);
  const [D, r] = [t.letter, t.letter.toLowerCase()];
  const genotypes = [D + D, D + r, r + r];
  // At least one parent carries both alleles, or every cross would be trivial.
  const p1 = D + r;
  const p2 = pickOne(rng, genotypes);
  const kids = [...p1].flatMap((a) => [...p2].map((b) => a + b));
  const recessive = kids.filter((k) => k === r + r).length;
  const [n, d] = simplify(recessive, 4);
  const grid = kids.map((k) => (k[0] === r && k[1] === D ? D + r : k)).join(', ');
  return {
    kind: 'input',
    id: 'b5-cross',
    prompt: `${D} (${t.dom}) is dominant over ${r} (${t.rec}). In a cross ${p1} × ${p2}, what fraction of the offspring ${t.ask}?`,
    rational: [n, d],
    explain: `Punnett square: ${grid}. Only ${r}${r} shows ${t.rec}: ${recessive} out of 4 = ${frac(n, d)}.`,
    tip: { kind: 'shortcut', text: 'The recessive trait only shows with two small letters. Aa × Aa always gives 1/4 recessive (a 3 : 1 ratio).' },
  };
};

export const BIOLOGY_NEXT: Unit[] = [
  {
    id: 'b-u5',
    title: 'Genetics & reproduction',
    description: 'Mendel, crosses, blood groups, reproduction in plants and humans',
    who: 'priya',
    color: '#ec4899',
    lessons: [
      {
        id: 'b5-genetics',
        title: 'Genes & inheritance',
        icon: '🧬',
        teach: [
          teach('b5-gen-t1', 'priya', 'How traits are passed on', [
            'A gene is a section of DNA on a chromosome. Different versions of a gene are alleles.',
            'A dominant allele (capital letter) shows even with one copy. A recessive allele (small letter) shows only with two copies.',
            'The genotype is the allele pair (Tt). The phenotype is what you see (tall).',
            'Homozygous means two identical alleles (TT or tt); heterozygous means two different (Tt).',
            'A Punnett square shows every possible pairing from the two parents.',
          ], { example: ['Tt × Tt gives TT, Tt, Tt, tt', '3 tall : 1 short'], hook: { kind: 'memory', text: 'Genotype is the Gene code; Phenotype is the Physical look.' } }),
        ],
        exercises: [crossGen, crossGen, mc('b5-gen-1', 'An organism with genotype Tt is…', ['homozygous dominant', 'heterozygous', 'homozygous recessive', 'a mutant'], 1, 'Two different alleles: heterozygous.'), crossGen, tf('b5-gen-2', 'A recessive trait can appear in a child whose parents both show the dominant trait.', true, 'If both parents are heterozygous (Tt), 1 in 4 children is tt.'), crossGen, crossGen],
      },
      {
        id: 'b5-human',
        title: 'Blood groups & sex',
        icon: '🩸',
        teach: [
          teach('b5-human-t1', 'priya', 'Inheritance in humans', [
            'Sex is decided by chromosomes: females are XX, males are XY. The father decides the sex of the child.',
            'ABO blood groups: A and B are codominant, O is recessive. Group O people are universal donors; group AB are universal recipients.',
            'Sickle cell: AA is normal, AS is a carrier, SS has sickle cell anaemia. Two AS parents have a 1 in 4 chance of an SS child.',
            'Some conditions, like haemophilia and colour blindness, are sex-linked: carried on the X chromosome.',
          ], { hook: { kind: 'memory', text: 'O gives to all ("O for Open donor"), AB takes from all.' } }),
        ],
        exercises: [
          mc('b5-human-1', 'The universal blood donor group is…', ['A', 'B', 'AB', 'O'], 3, 'Group O red cells have no A or B antigens.'),
          mc('b5-human-2', 'Two AS parents. Chance their child is SS?', ['0', '1/4', '1/2', '3/4'], 1, 'AS × AS gives AA, AS, AS, SS: 1 in 4.', { kind: 'shortcut', text: 'It is the same cross as Tt × Tt: 1/4 of the double-recessive.' }),
          tf('b5-human-3', 'The mother decides the sex of the child.', false, 'Mothers always give X. The father gives X (girl) or Y (boy).'),
          mc('b5-human-4', 'A person with group AB can receive blood from…', ['AB only', 'A and B only', 'A, B, AB and O', 'O only'], 2, 'AB has no anti-A or anti-B antibodies: the universal recipient.'),
          mc('b5-human-5', 'Haemophilia is carried on the…', ['Y chromosome', 'X chromosome', 'mitochondria', 'ribosomes'], 1, 'It is sex-linked on the X, so it is more common in males.'),
        ],
      },
      {
        id: 'b5-reproduction',
        title: 'Reproduction',
        icon: '🌸',
        teach: [
          teach('b5-rep-t1', 'priya', 'Making new life', [
            'Asexual reproduction needs one parent; offspring are identical (budding, binary fission, vegetative propagation).',
            'Sexual reproduction joins a male and a female gamete in fertilisation, giving variety.',
            'Pollination moves pollen from anther to stigma. Self-pollination is within one plant; cross-pollination is between plants.',
            'Insect-pollinated flowers are bright and scented with sticky pollen. Wind-pollinated flowers are dull with light, abundant pollen.',
            'In humans, fertilisation happens in the oviduct (fallopian tube) and the embryo implants in the uterus.',
          ], { hook: { kind: 'memory', text: 'Pollination comes before fertilisation: "P before F", just like in the alphabet.' } }),
        ],
        exercises: [
          mc('b5-rep-1', 'In humans, fertilisation normally takes place in the…', ['uterus', 'oviduct', 'ovary', 'vagina'], 1, 'The egg meets the sperm in the oviduct (fallopian tube).'),
          match('b5-rep-2', 'Match the flower part to its job', [['Anther', 'Makes pollen'], ['Stigma', 'Receives pollen'], ['Ovary', 'Becomes the fruit'], ['Ovule', 'Becomes the seed']], 'After fertilisation the ovary becomes the fruit and the ovule becomes the seed.'),
          mc('b5-rep-3', 'Which is a feature of wind-pollinated flowers?', ['Bright petals', 'Nectar', 'Light, abundant pollen', 'Strong scent'], 2, 'Wind needs lots of light pollen; it does not care about colour.', { kind: 'eliminate', text: 'Bright, scented and nectar are all for attracting insects. Cross them out.' }),
          tf('b5-rep-4', 'Binary fission is a type of sexual reproduction.', false, 'One cell splits in two: asexual.'),
          order('b5-rep-5', 'Order these events in a flowering plant', ['Pollination', 'Pollen tube grows', 'Fertilisation', 'Seed and fruit form'], 'Pollen lands, grows a tube to the ovule, fertilises it, then the seed and fruit develop.'),
        ],
      },
    ],
  },
];
