import type { Unit } from '../types';
import { match, mc, teach, tf } from '../util';

export const ENGLISH_FINAL: Unit[] = [
  {
    id: 'e-u10',
    title: 'Punctuation, concord & sound contrasts',
    description: 'Commas and apostrophes, tricky agreement rules, vowel pairs',
    who: 'maddie',
    color: '#ea580c',
    lessons: [
      {
        id: 'e10-punctuation',
        title: 'Punctuation',
        icon: '✒️',
        teach: [
          teach('e10-pun-t1', 'maddie', 'Small marks, big meaning', [
            "Apostrophe for possession: the boy's bag (one boy), the boys' bags (more than one). Plurals that don't end in s add 's: the children's toys.",
            "Its means belonging to it; it's means it is.",
            'A comma separates items in a list and an introductory phrase: "After the exam, we went home."',
            'A semicolon joins two complete sentences that are closely linked. A colon introduces a list or an explanation.',
            'Question marks end direct questions only: "He asked where I lived." needs a full stop.',
          ], { hook: { kind: 'shortcut', text: 'Test its/it\'s: say "it is". If that works, use it\'s.' } }),
        ],
        exercises: [
          mc('e10-p-1', 'Choose the correctly punctuated option.', ["The students' hostel is full.", "The student's' hostel is full.", 'The students hostel is full.', "The studen'ts hostel is full."], 0, 'One hostel belonging to many students: students\'.'),
          mc('e10-p-2', 'Choose the correct sentence.', ["The company raised it's prices.", 'The company raised its prices.', "The company raised its' prices.", 'The company raised it prices.'], 1, 'Possessive its has no apostrophe.'),
          mc('e10-p-3', 'Which needs a question mark?', ['He asked if I was ready', 'Are you ready', 'I wonder whether he is ready', 'She said she was ready'], 1, 'Only a direct question takes a question mark.'),
          mc('e10-p-4', "Choose the correct option: the ___ toys were everywhere.", ["childrens'", "children's", 'childrens', "childs'"], 1, "Children is already plural, so add 's."),
          tf('e10-p-5', 'A semicolon can join two complete, closely linked sentences.', true, 'For example: "It rained; we stayed in."'),
        ],
      },
      {
        id: 'e10-concord',
        title: 'Concord in depth',
        icon: '🤝',
        teach: [
          teach('e10-con-t1', 'maddie', 'Tricky agreement rules', [
            'Either/neither…or/nor: the verb agrees with the nearer subject. "Neither the teacher nor the students were late."',
            'Collective nouns (committee, team) take a singular verb when acting as one unit.',
            '"The number of" is singular; "a number of" is plural.',
            'Words like everyone, each, nobody and either are singular.',
            '"As well as" and "together with" do not change the subject: "The man, as well as his sons, is here."',
            'Two subjects joined by "and" take a plural verb, unless they are one idea: "Bread and butter is my breakfast."',
          ], { hook: { kind: 'eliminate', text: 'Cross out "as well as…" and "together with…" phrases, then make the verb agree with what is left.' } }),
        ],
        exercises: [
          mc('e10-c-1', 'Neither the manager nor the workers ___ present.', ['was', 'were', 'is', 'has been'], 1, 'The verb agrees with the nearer subject, "workers".'),
          mc('e10-c-2', 'The number of students ___ increasing.', ['are', 'is', 'were', 'have been'], 1, '"The number of" is singular.'),
          mc('e10-c-3', 'A number of students ___ absent.', ['is', 'was', 'were', 'has been'], 2, '"A number of" means several: plural.'),
          mc('e10-c-4', 'The principal, together with the teachers, ___ coming.', ['are', 'is', 'were', 'have been'], 1, 'The subject is "the principal".', { kind: 'eliminate', text: 'Ignore the "together with" phrase.' }),
          mc('e10-c-5', 'Everyone ___ to bring a pen.', ['have', 'has', 'are', 'were'], 1, 'Everyone is singular.'),
          tf('e10-c-6', '"Bread and butter is my favourite breakfast" is correct.', true, 'Bread and butter is treated as one dish.'),
        ],
      },
      {
        id: 'e10-contrasts',
        title: 'Vowel contrasts drill',
        icon: '🎧',
        teach: [
          teach('e10-vc-t1', 'maddie', 'Pairs that sound close', [
            'Long /iː/ (sheep, seat) vs short /ɪ/ (ship, sit).',
            'Long /uː/ (fool, pool) vs short /ʊ/ (full, pull).',
            '/æ/ (cat, bad) vs long /ɑː/ (cart, bard).',
            'Short /ɒ/ (cot, not) vs long /ɔː/ (caught, short).',
            '/ʌ/ (cup, luck) vs /ɑː/ (carp, lark).',
          ], { hook: { kind: 'shortcut', text: 'Say both words slowly. Long vowels take more time and your mouth often stays more tense.' } }),
        ],
        exercises: [
          match('e10-v-1', 'Match each word to the word with the same vowel sound', [['sheep', 'seat'], ['ship', 'sit'], ['fool', 'pool'], ['full', 'pull']], 'Long with long, short with short.'),
          mc('e10-v-2', 'Which word has the same vowel sound as "cart"?', ['cat', 'heart', 'cut', 'hat'], 1, 'Cart and heart share /ɑː/.'),
          mc('e10-v-3', 'Which word has a different vowel sound from the others?', ['caught', 'short', 'port', 'cot'], 3, 'Cot has short /ɒ/; the others have long /ɔː/.', { kind: 'eliminate', text: 'Three share a sound. Find the odd one out by saying them aloud.' }),
          mc('e10-v-4', 'Which word has the same vowel sound as "cup"?', ['cop', 'cap', 'luck', 'cope'], 2, 'Cup and luck share /ʌ/.'),
          mc('e10-v-5', 'Which word has the same vowel sound as "pull"?', ['pool', 'book', 'boot', 'rule'], 1, 'Pull and book share short /ʊ/.'),
        ],
      },
    ],
  },
];
