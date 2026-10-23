/** Plain-English meanings for the hard words used in lessons, found automatically in any explanation. */
export const GLOSSARY: Record<string, string> = {
  // Maths
  integer: 'a whole number that can be negative, zero or positive, like −3, 0 or 7',
  'natural number': 'a counting number: 1, 2, 3 and so on',
  'whole number': 'a counting number or zero: 0, 1, 2, 3…',
  rational: 'can be written as one whole number over another, like 3/4',
  irrational: 'cannot be written as a fraction; its decimals go on forever without repeating, like π',
  numerator: 'the top number of a fraction: how many parts you have',
  denominator: 'the bottom number of a fraction: how many equal parts the whole is cut into',
  factor: 'a number that divides into another exactly, like 3 is a factor of 12',
  multiple: 'what you get when you multiply a number, like 12 and 24 are multiples of 12',
  prime: 'a number with exactly two factors, 1 and itself, like 2, 3, 5, 7',
  hcf: 'highest common factor: the biggest number that divides into all of them',
  lcm: 'lowest common multiple: the smallest number all of them divide into',
  remainder: 'what is left over after dividing',
  percentage: 'a part out of 100',
  decimal: 'a number written with a point, like 0.75',
  bodmas: 'the order to do operations: Brackets, Orders (powers), Division and Multiplication, Addition and Subtraction',
  power: 'how many times a number is multiplied by itself, like 2³ = 2 × 2 × 2',
  equivalent: 'equal in value even though it looks different, like 1/2 and 2/4',
  estimate: 'a quick, rough answer used to check the real one',
  // Physics
  'si unit': 'the standard unit scientists agree on, like metres for length',
  scalar: 'a quantity with size only, like 5 kg',
  vector: 'a quantity with size and direction, like 5 m/s north',
  magnitude: 'size, or how much',
  displacement: 'distance in a straight line from start to finish, with direction',
  velocity: 'speed in a particular direction',
  acceleration: 'how quickly velocity changes each second',
  resultant: 'the single force that has the same effect as all the forces together',
  inertia: 'the tendency of things to keep doing what they are doing',
  density: 'how much mass is packed into each bit of space',
  pressure: 'force spread over an area',
  newton: 'the unit of force',
  weight: 'the pull of gravity on a mass, measured in newtons',
  mass: 'how much matter something contains, measured in kilograms',
  // Chemistry
  matter: 'anything that has mass and takes up space',
  element: 'a substance made of only one kind of atom',
  compound: 'two or more elements chemically joined in a fixed ratio',
  mixture: 'substances mixed together but not chemically joined',
  sublimation: 'a solid turning straight into a gas without melting',
  proton: 'a positive particle in the nucleus',
  neutron: 'a particle with no charge in the nucleus',
  electron: 'a tiny negative particle moving around the nucleus',
  nucleus: 'the centre (of an atom or a cell)',
  isotope: 'atoms of the same element with different numbers of neutrons',
  'atomic number': 'the number of protons in an atom',
  'mass number': 'protons plus neutrons in an atom',
  valency: 'how many bonds an atom or ion can form',
  ion: 'an atom that has gained or lost electrons, so it has a charge',
  mole: 'a counting unit: 6.02 × 10²³ particles',
  'molar mass': 'the mass of one mole of a substance, in grams',
  // English
  noun: 'a naming word: person, place, thing or idea',
  pronoun: 'a word that stands in for a noun, like she or they',
  verb: 'a doing or being word',
  adjective: 'a word that describes a noun',
  adverb: 'a word that describes a verb, adjective or another adverb',
  preposition: 'a word that shows position or relation, like under or after',
  conjunction: 'a joining word, like and, but, because',
  subject: 'who or what the sentence is about',
  synonym: 'a word with the same meaning',
  antonym: 'a word with the opposite meaning',
  tense: 'the form of a verb that shows when something happens',
  'question tag': 'a short question added to the end of a statement, like "isn\'t it?"',
  statement: 'a sentence that tells you something rather than asking',
  'past participle': 'the verb form used after has/have, like gone or written',
  // Biology
  organism: 'a living thing',
  cell: 'the smallest unit of life',
  organelle: 'a tiny part inside a cell with its own job',
  mitochondria: 'parts of a cell that release energy',
  chloroplast: 'part of a plant cell where photosynthesis happens',
  photosynthesis: 'how plants make food from light, water and carbon dioxide',
  respiration: 'releasing energy from food inside cells',
  excretion: "getting rid of waste made by the body's chemical reactions",
  tissue: 'a group of similar cells doing the same job',
  organ: 'different tissues working together, like the heart',
  producer: 'a living thing that makes its own food, like a plant',
  consumer: 'a living thing that eats others for food',
  decomposer: 'a living thing that breaks down dead matter',
  kingdom: 'the biggest group in the classification of living things',
  species: 'the smallest group: living things that can breed together',
  // Coding
  program: 'a list of instructions for a computer',
  cpu: 'the processor: the part of a computer that runs instructions',
  ram: 'fast, temporary memory for what is running now',
  binary: 'counting with only 0 and 1',
  bit: 'a single 0 or 1',
  byte: '8 bits',
  variable: 'a named box that stores a value',
  string: 'text, written inside quotes',
  boolean: 'a value that is either true or false',
  operator: 'a symbol that does something with values, like + or ===',
  function: 'a named, reusable set of instructions',
  parameter: 'the input a function receives',
  return: 'sends a value back out of a function',
  loop: 'code that repeats',
  array: 'a list of values in order',
  index: 'the position of an item in a list, counting from 0',
  object: 'a group of named values, like { name: "Vin" }',
  property: 'one named value inside an object',
  algorithm: 'a step-by-step method for solving a problem',
  pseudocode: 'the steps of a program written in plain words',
  'big o': 'a way to describe how the work grows as the input gets bigger',
  // Money and thinking
  asset: 'something that puts money in your pocket',
  liability: 'something that takes money out of your pocket',
  inflation: 'prices rising over time, so money buys less',
  'compound interest': 'interest that also earns interest',
  'opportunity cost': 'the best thing you give up when you choose something',
  bias: 'a habit of thinking that pulls you away from the truth',
  assumption: 'something you believe without checking it',
  deduction: 'reaching a conclusion from evidence',
};

const TERMS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length);

/** Glossary terms that appear in a piece of text, longest first, without repeats. */
export function termsIn(text: string): { term: string; meaning: string }[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const t of TERMS) {
    const re = new RegExp(`(^|[^a-z])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?([^a-z]|$)`);
    if (re.test(lower) && !found.some((f) => f.includes(t))) found.push(t);
  }
  return found.map((term) => ({ term, meaning: GLOSSARY[term] }));
}

const STOP = new Set(
  'the a an and or but if then so to of in on at for with from by about as is are was were be been it its this that these those you your we our they their can not no yes what when how why which who will would should could do does did has have had more most less than very just also each every any all only one two use used uses like same into out up down over under than'.split(' '),
);

/**
 * The ideas that matter in an explanation: glossary terms plus its most
 * repeated meaningful words. Used to check a learner's own explanation.
 */
export function keyIdeas(text: string, max = 6): string[] {
  const terms = termsIn(text).map((t) => t.term);
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length < 4 || STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const frequent = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([w]) => w);
  return [...new Set([...terms, ...frequent])].slice(0, max);
}

/** Which key ideas a learner's explanation mentions (a word stem match is enough). */
export function coverage(ideas: string[], explanation: string): { covered: string[]; missing: string[] } {
  const said = explanation.toLowerCase();
  const stem = (w: string) => w.split(' ').map((p) => p.slice(0, Math.max(4, p.length - 2)));
  const covered = ideas.filter((idea) => stem(idea).every((s) => said.includes(s)));
  return { covered, missing: ideas.filter((i) => !covered.includes(i)) };
}
