import type { Course, Lesson } from '../types';
import { match, mc, order, teach, tf } from '../util';

const living: Lesson = {
  id: 'b1-living',
  title: 'Characteristics of living things',
  icon: '🌱',
  teach: [
    teach('b1-living-t1', 'priya', 'What makes something alive?', [
      'All living things share seven characteristics: Movement, Respiration, Sensitivity (irritability), Growth, Reproduction, Excretion and Nutrition.',
      'Non-living things may show one or two (a crystal "grows", a car "moves"), but never all seven.',
    ], { hook: { kind: 'memory', text: 'MRS GREN: Movement, Respiration, Sensitivity, Growth, Reproduction, Excretion, Nutrition. Picture Mrs Gren, a green-skinned teacher, doing all seven at once.' } }),
  ],
  exercises: [
    order('b1-living-1', 'Spell out MRS GREN', ['Movement', 'Respiration', 'Sensitivity', 'Growth', 'Reproduction', 'Excretion', 'Nutrition'], 'M-R-S G-R-E-N.'),
    tf('b1-living-2', 'A crystal that grows in a solution is a living thing.', false, 'Growth alone is not enough. A crystal does not respire, reproduce, feed or excrete.'),
    mc('b1-living-3', "The removal of waste made by the body's own chemical reactions is…", ['Egestion', 'Excretion', 'Digestion', 'Secretion'], 1, 'Excretion removes metabolic waste (like CO₂ and urea). Egestion just passes out undigested food.', { kind: 'eliminate', text: 'Egestion vs excretion is a favourite trap: egestion is undigested food, never metabolic waste.' }),
    mc('b1-living-4', 'A plant bending towards light shows…', ['Respiration', 'Sensitivity', 'Excretion', 'Nutrition'], 1, 'Responding to a stimulus (light) is sensitivity, also called irritability.'),
  ],
};

const cell: Lesson = {
  id: 'b1-cell',
  title: 'The cell',
  icon: '🔬',
  teach: [
    teach('b1-cell-t1', 'priya', 'The unit of life', [
      'The cell is the basic structural and functional unit of life. Robert Hooke named cells in 1665 after looking at cork.',
      "Nucleus: controls the cell's activities and holds the genetic material.",
      'Cytoplasm: where most chemical reactions happen.',
      'Cell membrane: controls what enters and leaves.',
      'Mitochondria: release energy by respiration.',
      'Ribosomes: make proteins.',
      'Plant cells also have a cell wall (cellulose, for support), chloroplasts (photosynthesis) and a large vacuole.',
    ], { hook: { kind: 'memory', text: 'Mitochondria are the power stations. Picture a tiny generator humming inside every cell.' } }),
  ],
  exercises: [
    match('b1-cell-1', 'Match the organelle to its job', [['Nucleus', 'Controls the cell'], ['Mitochondrion', 'Releases energy'], ['Ribosome', 'Makes proteins'], ['Chloroplast', 'Photosynthesis'], ['Cell membrane', 'Controls entry and exit']], 'Each organelle has one main job.'),
    mc('b1-cell-2', 'Which is found in plant cells but NOT animal cells?', ['Nucleus', 'Cell membrane', 'Cell wall', 'Mitochondria'], 2, 'Only plant cells have a cellulose cell wall (and chloroplasts).', { kind: 'eliminate', text: 'Anything both cells need to stay alive (nucleus, membrane, mitochondria) is in both.' }),
    tf('b1-cell-3', 'Animal cells contain chloroplasts.', false, 'Only cells that photosynthesise, mostly plant cells, have chloroplasts.'),
    mc('b1-cell-4', 'Who first named the cell?', ['Charles Darwin', 'Robert Hooke', 'Gregor Mendel', 'Louis Pasteur'], 1, 'Robert Hooke, in 1665, from cork under a microscope.'),
  ],
};

const organisation: Lesson = {
  id: 'b1-organisation',
  title: 'Levels of organisation',
  icon: '🏗️',
  teach: [
    teach('b1-org-t1', 'priya', 'From cell to organism', [
      'Cells of the same kind form a tissue (muscle tissue).',
      'Different tissues working together form an organ (the heart).',
      'Organs working together form a system (the circulatory system).',
      'Systems together make the organism (you).',
    ], { hook: { kind: 'memory', text: 'Cells Tie Our Systems Onto: Cell, Tissue, Organ, System, Organism.' } }),
  ],
  exercises: [
    order('b1-org-1', 'Order from simplest to most complex', ['Cell', 'Tissue', 'Organ', 'System', 'Organism'], 'Cell → tissue → organ → system → organism.'),
    mc('b1-org-2', 'The heart is an example of…', ['a cell', 'a tissue', 'an organ', 'a system'], 2, 'It is made of several tissues working together: an organ.'),
    match('b1-org-3', 'Match each example to its level', [['Red blood cell', 'Cell'], ['Muscle', 'Tissue'], ['Stomach', 'Organ'], ['Digestive system', 'System']], 'Count how many kinds of thing it is made of.'),
    tf('b1-org-4', 'Unicellular organisms like Amoeba have organs.', false, 'Their single cell does every job; they have no tissues or organs.'),
  ],
};

const classification: Lesson = {
  id: 'b1-classification',
  title: 'Classification',
  icon: '🗂️',
  teach: [
    teach('b1-class-t1', 'priya', 'Sorting all life', [
      'Five kingdoms: Monera (bacteria), Protista (e.g. Amoeba), Fungi (mushrooms, moulds), Plantae, Animalia.',
      'Ranks from broad to narrow: Kingdom, Phylum, Class, Order, Family, Genus, Species.',
      "Binomial nomenclature (Linnaeus): every species gets two names, Genus then species. The genus starts with a capital, the species doesn't, and both are italicised or underlined: Homo sapiens.",
    ], { hook: { kind: 'memory', text: 'King Philip Came Over For Good Soup: Kingdom, Phylum, Class, Order, Family, Genus, Species.' } }),
  ],
  exercises: [
    order('b1-class-1', 'Order the ranks from broadest to narrowest', ['Kingdom', 'Phylum', 'Class', 'Order', 'Family', 'Genus', 'Species'], 'King Philip Came Over For Good Soup.'),
    mc('b1-class-2', 'Which is written correctly?', ['homo sapiens', 'Homo Sapiens', 'Homo sapiens', 'HOMO SAPIENS'], 2, 'Genus capitalised, species lower case.'),
    mc('b1-class-3', 'Mushrooms belong to the kingdom…', ['Plantae', 'Fungi', 'Monera', 'Protista'], 1, 'Mushrooms cannot photosynthesise; they are fungi.', { kind: 'eliminate', text: 'No chlorophyll, so not a plant. Many cells, so not Monera or most Protista.' }),
    tf('b1-class-4', 'Bacteria belong to the kingdom Monera.', true, 'Monera holds the prokaryotes: cells with no true nucleus.'),
  ],
};

const nutrition: Lesson = {
  id: 'b1-nutrition',
  title: 'Nutrition & food tests',
  icon: '🍽️',
  teach: [
    teach('b1-nut-t1', 'priya', 'How organisms feed', [
      'Plants make food by photosynthesis: carbon dioxide + water → glucose + oxygen, using light energy and chlorophyll.',
      '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
      'Seven classes of food: carbohydrates, proteins, fats and oils, vitamins, mineral salts, water and roughage.',
    ]),
    teach('b1-nut-t2', 'priya', 'Food tests', [
      'Starch: iodine solution turns blue-black.',
      "Reducing sugar (glucose): Benedict's solution, heated, turns brick-red.",
      'Protein: Biuret test turns violet (purple).',
      'Fat: grease spot on paper, or ethanol emulsion test turns cloudy white.',
    ], { hook: { kind: 'memory', text: 'Iodine is a Black-Belt in starch; Benedict blushes Brick-red at sugar; Biuret is Violet for proteins.' } }),
  ],
  exercises: [
    match('b1-nut-1', 'Match the test to its positive result', [['Iodine (starch)', 'Blue-black'], ["Benedict's (sugar)", 'Brick-red'], ['Biuret (protein)', 'Violet'], ['Paper (fat)', 'Translucent spot']], 'These four colours come up again and again in exams.'),
    mc('b1-nut-2', 'Which gas do plants release in photosynthesis?', ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'], 2, 'Oxygen is a by-product; carbon dioxide is taken in.'),
    tf('b1-nut-3', 'Chlorophyll is needed for photosynthesis.', true, 'Chlorophyll absorbs the light energy.'),
    mc('b1-nut-4', 'Which food class mainly gives energy?', ['Vitamins', 'Carbohydrates', 'Water', 'Roughage'], 1, 'Carbohydrates are the main energy source (fats give even more per gram).'),
  ],
};

const ecology: Lesson = {
  id: 'b1-ecology',
  title: 'Food chains & ecology',
  icon: '🌍',
  teach: [
    teach('b1-eco-t1', 'priya', 'Who eats whom', [
      'Producers (green plants) make their own food.',
      'Primary consumers (herbivores) eat producers; secondary consumers eat herbivores; tertiary consumers eat those.',
      'Decomposers (bacteria, fungi) break down dead matter and return nutrients to the soil.',
      'Only about 10% of energy passes from one level to the next, so food chains are short.',
    ], { example: ['Grass → grasshopper → frog → snake → hawk'], hook: { kind: 'formula', text: 'Energy at the next level ≈ 10% of this level. 10 000 kJ in grass → about 1000 kJ in grasshoppers.' } }),
  ],
  exercises: [
    order('b1-eco-1', 'Put this food chain in order', ['Grass', 'Grasshopper', 'Frog', 'Snake'], 'Start with the producer; arrows show the direction energy flows.'),
    mc('b1-eco-2', 'In "grass → goat → lion", the goat is…', ['a producer', 'a primary consumer', 'a secondary consumer', 'a decomposer'], 1, 'It eats the producer, so it is a primary consumer.'),
    mc('b1-eco-3', 'If grass holds 10 000 kJ, about how much reaches the goat?', ['10 000 kJ', '5000 kJ', '1000 kJ', '10 kJ'], 2, 'About 10% passes on: 1000 kJ.', { kind: 'shortcut', text: 'Each step: divide by 10.' }),
    tf('b1-eco-4', 'Fungi are decomposers.', true, 'They break down dead matter and recycle nutrients.'),
  ],
};

export const BIOLOGY: Course = {
  id: 'biology',
  title: 'Biology',
  icon: '🧬',
  units: [
    { id: 'b-u1', title: 'Life & the cell', description: 'Living things, cells, organisation, classification', who: 'priya', color: '#10b981', lessons: [living, cell, organisation, classification] },
    { id: 'b-u2', title: 'Feeding & ecology', description: 'Nutrition, food tests and food chains', who: 'priya', color: '#f59e0b', lessons: [nutrition, ecology] },
  ],
  upcoming: ['Transport in plants & animals', 'Respiration', 'Excretion', 'Reproduction', 'Genetics & variation', 'Evolution', 'Ecology in depth'],
};
