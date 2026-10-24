import type { Unit } from '../types';
import { match, mc, teach, tf } from '../util';

/** An original passage, so comprehension practice is not copied from any past paper. */
const PASSAGE = [
  'Every evening, when the generator in the compound finally went quiet, Tolu climbed to the flat roof with a torch and a notebook.',
  'Her neighbours thought she was wasting batteries. She was in fact counting stars, square by square, the way her physics teacher had shown her, and writing down how many she saw on each clear night.',
  'After three months the numbers told a story nobody expected: on nights when the new factory near the river was working, she saw almost half as many stars.',
  'She took the notebook to the local council. The officials laughed at first, but they stopped laughing when she showed them the dates.',
].join(' ');

export const ENGLISH_NEXT: Unit[] = [
  {
    id: 'e-u5',
    title: 'Oral English',
    description: 'Vowels, consonants, silent letters, stress and intonation',
    who: 'maddie',
    color: '#14b8a6',
    lessons: [
      {
        id: 'e5-sounds',
        title: 'Vowels & consonants',
        icon: '👄',
        teach: [
          teach('e5-sounds-t1', 'maddie', 'Sounds, not spellings', [
            'English has 44 sounds: 12 pure vowels, 8 diphthongs and 24 consonants.',
            'A diphthong is a gliding vowel, two sounds joined: the "ay" in day, the "igh" in high, the "oy" in boy.',
            'JAMB tests sounds, not letters. The same spelling can make different sounds: "ough" in though, through, cough and tough.',
            'Say each option aloud, quietly, before you choose.',
          ], { example: ['seat and seen share a long /iː/; sit has a short /ɪ/', 'cough rhymes with off; tough rhymes with stuff'], hook: { kind: 'eliminate', text: 'Ignore the spelling and listen. Words that look alike are often the trap.' } }),
        ],
        exercises: [
          mc('e5-s-1', 'Which word has the same vowel sound as "seat"?', ['sit', 'seen', 'set', 'sat'], 1, 'Seat and seen both have the long /iː/.'),
          mc('e5-s-2', 'Which word rhymes with "height"?', ['weight', 'kite', 'eight', 'freight'], 1, 'Height /haɪt/ rhymes with kite. Weight, eight and freight have /eɪ/.', { kind: 'eliminate', text: 'Three options share "eigh" with /eɪ/. The odd one out is the answer.' }),
          mc('e5-s-3', 'Which word rhymes with "through"?', ['though', 'tough', 'blue', 'cough'], 2, 'Through /θruː/ rhymes with blue.'),
          match('e5-s-4', 'Match the word to how its "-ed" ending sounds', [['walked', '/t/'], ['played', '/d/'], ['wanted', '/ɪd/']], 'After t or d it is /ɪd/; after voiceless sounds (k, p, s) it is /t/; otherwise /d/.'),
          mc('e5-s-5', 'In which word is "ch" pronounced /k/?', ['church', 'machine', 'chemistry', 'cheap'], 2, 'Chemistry, chorus and character use /k/. Machine uses /ʃ/.'),
          tf('e5-s-6', 'The vowel in "boy" is a diphthong.', true, '/ɔɪ/ glides from one vowel to another.'),
          mc('e5-s-7', 'Which word has the same vowel sound as "bird"?', ['beard', 'word', 'bad', 'bead'], 1, 'Bird and word share /ɜː/.'),
        ],
      },
      {
        id: 'e5-silent',
        title: 'Silent letters & "th"',
        icon: '🤫',
        teach: [
          teach('e5-silent-t1', 'maddie', 'Letters you do not say', [
            'Many words keep letters that are no longer spoken: the k in knee, the p in psalm, the h in honest, the b in debt.',
            '"th" has two sounds. Voiceless /θ/ as in thin, think, bath. Voiced /ð/ as in this, mother, father.',
            'Touch your throat: it buzzes for /ð/ and stays still for /θ/.',
          ], { hook: { kind: 'memory', text: '"Knights knit gnomes": k and g before n are silent.' } }),
        ],
        exercises: [
          match('e5-sil-1', 'Match the word to its silent letter', [['knee', 'k'], ['psalm', 'p'], ['honest', 'h'], ['debt', 'b'], ['island', 's']], 'Say each word aloud; the silent letter makes no sound.'),
          mc('e5-sil-2', 'Which word has the voiced "th" /ð/?', ['thin', 'think', 'father', 'bath'], 2, 'Father has the buzzing /ð/. The others are voiceless /θ/.', { kind: 'shortcut', text: 'Touch your throat. It buzzes for /ð/.' }),
          mc('e5-sil-3', 'Which word has a silent "w"?', ['window', 'wrist', 'away', 'swim'], 1, 'Wrist, write, wrong: w before r is silent.'),
          tf('e5-sil-4', 'The "h" in "hour" is pronounced.', false, 'Hour sounds like "our". That is why we say "an hour".'),
          mc('e5-sil-5', 'Which word has a silent "b"?', ['bubble', 'climb', 'about', 'number'], 1, 'Climb, thumb, comb, lamb: b after m at the end is silent.'),
        ],
      },
      {
        id: 'e5-stress',
        title: 'Stress & intonation',
        icon: '🎵',
        teach: [
          teach('e5-stress-t1', 'maddie', 'Where the beat falls', [
            'Word stress is the syllable said louder and longer. JAMB writes it in capitals: PHOtograph.',
            'Some words change stress with their job: REcord and IMport are nouns; reCORD and imPORT are verbs.',
            'Words ending in -tion and -ic usually stress the syllable just before: eduCAtion, ecoNOMic.',
            'Intonation is the rise and fall of the voice. Statements and wh-questions fall; yes/no questions rise.',
          ], { example: ['PHOtograph, phoTOgraphy, photoGRAPHic', 'Where do you live? ↘', 'Do you live here? ↗'], hook: { kind: 'shortcut', text: 'NOUNS stress the front, VERBS stress the end: an IMport, to imPORT.' } }),
        ],
        exercises: [
          mc('e5-st-1', 'Choose the correct stress for the noun "record"', ['REcord', 'reCORD', 'both are fine', 'neither'], 0, 'As a noun, stress the first syllable: a REcord.'),
          mc('e5-st-2', 'Choose the correct stress', ['EDucation', 'eDUcation', 'eduCAtion', 'educaTION'], 2, 'Before -tion: eduCAtion.', { kind: 'shortcut', text: 'Stress the syllable before -tion.' }),
          mc('e5-st-3', 'Choose the correct stress', ['PHOtography', 'phoTOgraphy', 'photoGRAphy', 'photograPHY'], 1, 'phoTOgraphy. Compare PHOtograph and photoGRAPHic.'),
          tf('e5-st-4', 'A yes/no question usually ends with a rising tone.', true, '"Are you ready? ↗"'),
          mc('e5-st-5', 'Which has a falling tone?', ['Is it raining?', 'Where is my bag?', 'Are you sure?', 'Can I come?'], 1, 'Wh-questions (where, what, who) fall. The others are yes/no questions, which rise.', { kind: 'eliminate', text: 'Cross out every question that can be answered "yes" or "no".' }),
          mc('e5-st-6', 'Choose the correct stress', ['ENgineer', 'enGIneer', 'engiNEER', 'all are fine'], 2, 'engiNEER: words ending in -eer stress that ending.'),
          mc('e5-st-7', 'How many syllables does "banana" have?', ['2', '3', '4', '1'], 1, 'ba-na-na: three syllables.'),
        ],
      },
    ],
  },
  {
    id: 'e-u6',
    title: 'Comprehension & summary',
    description: 'Reading for meaning, inference and summary',
    who: 'maddie',
    color: '#6366f1',
    lessons: [
      {
        id: 'e6-comprehension',
        title: 'Reading a passage',
        icon: '📖',
        teach: [
          teach('e6-comp-t1', 'maddie', 'Read the questions first', [
            'Skim the questions before the passage, so you know what you are looking for.',
            'Answer from the passage, not from your own opinion. The right option is supported by a line you can point to.',
            'Inference questions ("the writer suggests…") want what the passage implies, not what it says word for word.',
            'Vocabulary questions: replace the word with each option and reread the sentence.',
          ], { hook: { kind: 'eliminate', text: 'An option that is true in real life but not in the passage is wrong.' } }),
        ],
        exercises: [
          mc('e6-c-1', `${PASSAGE}\n\nWhy did Tolu go to the roof?`, ['To charge her torch', 'To count stars', 'To escape the generator noise', 'To watch the factory'], 1, 'She "was in fact counting stars, square by square".'),
          mc('e6-c-2', `${PASSAGE}\n\nWhat did her neighbours think?`, ['She was clever', 'She was wasting batteries', 'She was spying on them', 'She was studying for an exam'], 1, 'The passage says so directly.'),
          mc('e6-c-3', `${PASSAGE}\n\nThe passage suggests the factory…`, ['was closed at night', 'made the night sky harder to see', 'was owned by the council', 'used solar power'], 1, 'On nights the factory worked she saw about half as many stars: it was polluting the sky.', { kind: 'eliminate', text: 'Inference: what do the numbers imply? Only one option follows from them.' }),
          mc('e6-c-4', `${PASSAGE}\n\nWhy did the officials stop laughing?`, ['Tolu cried', 'The dates matched the factory working', 'Her teacher came with her', 'The generator came back on'], 1, 'She "showed them the dates", which linked the dark nights to the factory.'),
          mc('e6-c-5', `${PASSAGE}\n\nWhich word best describes Tolu?`, ['careless', 'patient and observant', 'lazy', 'boastful'], 1, 'Three months of careful counting shows patience and observation.'),
        ],
      },
      {
        id: 'e6-summary',
        title: 'Summary skills',
        icon: '✂️',
        teach: [
          teach('e6-sum-t1', 'maddie', 'Say more with less', [
            'A summary keeps the main points and drops examples, repetition and description.',
            'Write each point as one clear sentence in your own words.',
            'The topic sentence of a paragraph (often the first) usually holds its main idea.',
          ], { example: ['Long: "She went to the shop, and at the shop she bought bread, milk and sugar."', 'Summary: "She bought groceries."'] }),
        ],
        exercises: [
          mc('e6-s-1', 'Which sentence best summarises: "Despite heavy rain, broken roads and a late bus, Ada reached the exam hall on time."', ['Ada likes rain.', 'Ada arrived on time despite many obstacles.', 'The bus was late.', 'Roads are bad.'], 1, 'The main idea is that she made it in spite of problems.', { kind: 'eliminate', text: 'Options about just one detail are too narrow.' }),
          tf('e6-s-2', 'A good summary includes the examples from the passage.', false, 'Examples support a point; the summary keeps only the point.'),
          mc('e6-s-3', 'The main idea of a paragraph is most often found in its…', ['last word', 'topic sentence', 'longest word', 'title only'], 1, 'Usually the first sentence.'),
          mc('e6-s-4', `${PASSAGE}\n\nChoose the best one-sentence summary.`, ['Tolu liked stars.', "A girl's careful star counts showed a factory was darkening the sky.", 'The council laughed at a girl.', 'Generators are noisy.'], 1, 'It keeps the who, what she did, and what it proved.'),
        ],
      },
    ],
  },
];
