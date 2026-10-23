import type { Unit } from '../types';
import { mc, teach } from '../util';

export const ENGLISH_DRILLS: Unit = {
  id: 'e-u4',
  title: 'JAMB drills',
  description: 'Exam-style structure, lexis and interpretation questions',
  who: 'maddie',
  color: '#ef4444',
  lessons: [
    {
      id: 'e4-structure',
      title: 'Structure drill',
      icon: '🏗️',
      teach: [
        teach('e4-struct-t1', 'maddie', 'How to attack a "fill the gap" question', [
          'Read the whole sentence before looking at the options.',
          'Find the clue words: time words (yesterday, since, by next year), the real subject, and fixed partners like "insist on".',
          'Try each option in the gap and read the sentence in your head. The wrong ones usually sound wrong.',
        ], { hook: { kind: 'eliminate', text: 'Time words decide tense: "yesterday" means simple past, "since 2019" means present perfect.' } }),
      ],
      exercises: [
        mc('e4-s-1', 'The committee ___ its report yesterday.', ['submit', 'submits', 'submitted', 'has submit'], 2, '"Yesterday" is a finished time: simple past.'),
        mc('e4-s-2', 'Neither of the answers ___ correct.', ['are', 'is', 'were', 'have been'], 1, '"Neither" is singular.'),
        mc('e4-s-3', 'He is one of the students who ___ always punctual.', ['is', 'are', 'was', 'has been'], 1, '"Who" refers to "students" (plural), so "are".', { kind: 'eliminate', text: 'Ask what "who" points back to. Here it is the students, not "one".' }),
        mc('e4-s-4', 'Had I known, I ___ come earlier.', ['will', 'would', 'would have', 'had'], 2, 'Past unreal condition: had + past participle, then would have + past participle.'),
        mc('e4-s-5', 'The man ___ car was stolen went to the police.', ['who', "who's", 'whose', 'whom'], 2, '"Whose" shows possession: the man\'s car.'),
        mc('e4-s-6', 'She has been living here ___ 2019.', ['for', 'since', 'from', 'at'], 1, '"Since" with a point in time; "for" with a length of time.'),
        mc('e4-s-7', 'I look forward to ___ you.', ['see', 'seeing', 'saw', 'seen'], 1, '"Look forward to" is followed by the -ing form.'),
        mc('e4-s-8', 'The dog wagged ___ tail.', ["it's", 'its', 'its\'', 'it'], 1, '"Its" is possessive. "It\'s" means "it is".'),
        mc('e4-s-9', 'Scarcely had we arrived ___ it started to rain.', ['than', 'when', 'then', 'that'], 1, 'Scarcely… when. (No sooner… than.)'),
        mc('e4-s-10', 'Each of the boys brought ___ own book.', ['their', 'his', 'them', 'they'], 1, '"Each" is singular, so the pronoun is singular.'),
        mc('e4-s-11', 'He insisted ___ paying the bill.', ['in', 'on', 'at', 'for'], 1, 'Insist on.'),
        mc('e4-s-12', 'The book ___ on the table since morning.', ['has laid', 'has lain', 'has lied', 'has lay'], 1, 'Lie (rest) → lay → lain. Lay (put) → laid → laid. A book lies, so "has lain".'),
        mc('e4-s-13', 'Who ___ you think will win the election?', ['do', 'does', 'did', 'are'], 0, 'The verb agrees with "you": "do you think".'),
      ],
    },
    {
      id: 'e4-lexis',
      title: 'Lexis & interpretation drill',
      icon: '🔤',
      teach: [
        teach('e4-lex-t1', 'maddie', 'Nearest, opposite and interpretation', [
          'Underline whether the question wants the NEAREST meaning or the OPPOSITE. Many marks are lost right there.',
          'For interpretation questions, choose what the sentence means in real life, not word for word.',
        ], { hook: { kind: 'eliminate', text: 'For "opposite", first remove options that mean the same as the word.' } }),
      ],
      exercises: [
        mc('e4-l-1', 'Choose the option OPPOSITE in meaning: "The speech was verbose."', ['wordy', 'brief', 'loud', 'boring'], 1, 'Verbose means using too many words; the opposite is brief.'),
        mc('e4-l-2', 'Choose the option NEAREST in meaning: "The plan is feasible."', ['workable', 'expensive', 'foolish', 'secret'], 0, 'Feasible means possible to do.'),
        mc('e4-l-3', 'Choose the option NEAREST in meaning: "The child was obstinate."', ['quiet', 'stubborn', 'clever', 'tired'], 1, 'Obstinate means stubborn.'),
        mc('e4-l-4', 'Choose the option OPPOSITE in meaning: "The room was spacious."', ['large', 'cramped', 'airy', 'bright'], 1, 'Spacious means roomy; the opposite is cramped.'),
        mc('e4-l-5', 'Choose the option NEAREST in meaning: "His remarks were irrelevant."', ['unrelated', 'rude', 'important', 'funny'], 0, 'Irrelevant means not connected to the matter.'),
        mc('e4-l-6', 'Choose the option OPPOSITE in meaning: "The soldiers were valiant."', ['brave', 'cowardly', 'tired', 'strong'], 1, 'Valiant means brave; the opposite is cowardly.'),
        mc('e4-l-7', 'Choose the option NEAREST in meaning: "The meeting was postponed."', ['cancelled', 'put off', 'started', 'shortened'], 1, 'Postponed means moved to a later time.'),
        mc('e4-l-8', '"He took the news with a pinch of salt." This means he…', ['was angry', 'did not fully believe it', 'cooked with it', 'was very happy'], 1, 'To take something with a pinch of salt is to doubt it a little.'),
        mc('e4-l-9', '"When I told her the story, she was all ears." She was…', ['bored', 'listening eagerly', 'confused', 'asleep'], 1, 'All ears means listening with full attention.'),
        mc('e4-l-10', '"The project is still in the pipeline." The project is…', ['finished', 'being planned or prepared', 'cancelled', 'very expensive'], 1, 'In the pipeline means in progress, not yet ready.'),
      ],
    },
  ],
};

export const BIOLOGY_DRILLS: Unit = {
  id: 'b-u4',
  title: 'JAMB drills',
  description: 'Exam-style revision questions across the syllabus',
  who: 'priya',
  color: '#ef4444',
  lessons: [
    {
      id: 'b4-body',
      title: 'Body & health drill',
      icon: '🩺',
      teach: [
        teach('b4-body-t1', 'priya', 'Recall fast, then reason', [
          'Biology rewards precise facts. Read the key word in the question: "site of", "caused by", "functional unit".',
          'If two options look right, the more specific one usually wins.',
        ], { hook: { kind: 'memory', text: 'Make a fact vivid: the nephron is the kidney\'s tiny filter, a "neph-RUN" where blood runs through to be cleaned.' } }),
      ],
      exercises: [
        mc('b4-b-1', 'The functional unit of the kidney is the…', ['neuron', 'nephron', 'alveolus', 'villus'], 1, 'Each kidney has about a million nephrons that filter blood.'),
        mc('b4-b-2', 'Which blood cells fight infection?', ['Red blood cells', 'White blood cells', 'Platelets', 'Plasma'], 1, 'White blood cells defend the body.'),
        mc('b4-b-3', 'Red blood cells carry oxygen using…', ['haemoglobin', 'chlorophyll', 'insulin', 'keratin'], 0, 'Haemoglobin binds oxygen.'),
        mc('b4-b-4', 'Starch digestion begins in the mouth with…', ['pepsin', 'salivary amylase', 'lipase', 'bile'], 1, 'Salivary amylase (ptyalin) starts breaking down starch.'),
        mc('b4-b-5', 'Most digestion and absorption of food happens in the…', ['stomach', 'small intestine', 'large intestine', 'oesophagus'], 1, 'The small intestine (ileum) has villi for absorption.'),
        mc('b4-b-6', 'Gas exchange in the lungs takes place in the…', ['trachea', 'bronchi', 'alveoli', 'diaphragm'], 2, 'Alveoli are tiny air sacs with thin walls and many capillaries.'),
        mc('b4-b-7', 'Lack of vitamin C causes…', ['rickets', 'scurvy', 'goitre', 'night blindness'], 1, 'Scurvy: bleeding gums, poor healing.'),
        mc('b4-b-8', 'Goitre is caused by a lack of…', ['iron', 'iodine', 'calcium', 'vitamin A'], 1, 'Iodine is needed to make thyroid hormones.'),
        mc('b4-b-9', 'Malaria is caused by…', ['a virus', 'Plasmodium', 'a bacterium', 'a worm'], 1, 'Plasmodium, a protozoan, spread by the female Anopheles mosquito.'),
        mc('b4-b-10', 'The largest organ of the human body is the…', ['liver', 'brain', 'skin', 'heart'], 2, 'The skin covers the whole body.'),
      ],
    },
    {
      id: 'b4-plants',
      title: 'Plants & life drill',
      icon: '🌿',
      teach: [
        teach('b4-plants-t1', 'priya', 'Plants are exam favourites', [
          'Know the transport tissues: xylem carries water and minerals up; phloem carries food (sugars) around.',
          'Stomata are pores, mostly on the underside of leaves, for gas exchange and water loss (transpiration).',
          'A gene is a section of DNA that carries one instruction.',
        ], { hook: { kind: 'memory', text: 'Phloem carries Food; both start with an "f" sound. Xylem carries water.' } }),
      ],
      exercises: [
        mc('b4-p-1', 'Plants lose water vapour mainly through…', ['roots', 'stomata', 'xylem', 'flowers'], 1, 'Transpiration happens through stomata.'),
        mc('b4-p-2', 'Xylem transports…', ['food', 'water and minerals', 'hormones only', 'oxygen only'], 1, 'Xylem carries water and dissolved minerals from the roots.'),
        mc('b4-p-3', 'Phloem transports…', ['water', 'manufactured food', 'carbon dioxide', 'soil'], 1, 'Phloem carries sugars made in the leaves.'),
        mc('b4-p-4', 'The male reproductive part of a flower is the…', ['carpel', 'stamen', 'sepal', 'petal'], 1, 'The stamen (anther and filament) makes pollen.'),
        mc('b4-p-5', 'A gene is a section of…', ['a cell wall', 'DNA', 'a ribosome', 'a vacuole'], 1, 'Genes are stretches of DNA.'),
        mc('b4-p-6', 'Which of these is a vertebrate?', ['Earthworm', 'Frog', 'Snail', 'Spider'], 1, 'A frog has a backbone.'),
        mc('b4-p-7', 'Photosynthesis takes place mainly in the…', ['roots', 'leaves', 'stem', 'flowers'], 1, 'Leaves hold most of the chloroplasts.'),
        mc('b4-p-8', 'The process by which pollen is moved to the stigma is…', ['fertilisation', 'pollination', 'germination', 'transpiration'], 1, 'Pollination comes before fertilisation.'),
      ],
    },
  ],
};
