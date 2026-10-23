import type { Unit } from '../types';
import { match, mc, teach, tf } from '../util';

export const ENGLISH_MORE: Unit[] = [
  {
    id: 'e-u3',
    title: 'Idioms, prepositions & vocabulary',
    description: 'Figurative expressions, the right preposition, more synonyms and antonyms',
    who: 'maddie',
    color: '#a78bfa',
    lessons: [
      {
        id: 'e3-idioms',
        title: 'Idioms',
        icon: '🗣️',
        teach: [
          teach('e3-idioms-t1', 'maddie', "Phrases that don't mean what they say", [
            'An idiom is a group of words whose meaning is different from the meanings of the separate words.',
            'JAMB asks for "the meaning of the underlined expression". Read the whole sentence, then pick the meaning that fits the situation.',
            'Never choose the literal meaning unless the sentence is clearly literal.',
          ], { example: ['"The exam was a piece of cake" means it was very easy, not that it was food.'], hook: { kind: 'eliminate', text: 'The literal option is almost always the trap. Cross it out first.' } }),
        ],
        exercises: [
          match('e3-idioms-1', 'Match the idiom to its meaning', [['A piece of cake', 'Very easy'], ['Burn the midnight oil', 'Study late into the night'], ['Let the cat out of the bag', 'Reveal a secret'], ['Once in a blue moon', 'Very rarely'], ['Break the ice', 'Start a conversation']], 'Idioms are learned as whole units.'),
          mc('e3-idioms-2', '"Your answer hit the nail on the head." This means the answer was…', ['violent', 'exactly right', 'too loud', 'about building'], 1, 'To hit the nail on the head is to describe something exactly.', { kind: 'eliminate', text: 'Violent and building are literal readings. Out.' }),
          mc('e3-idioms-3', '"He decided to bury the hatchet with his brother." He decided to…', ['hide a weapon', 'make peace', 'start a fight', 'dig a garden'], 1, 'Bury the hatchet means stop arguing and make peace.'),
          mc('e3-idioms-4', '"She is the apple of her father\'s eye." She is…', ['his favourite', 'unhealthy', 'always hungry', 'very short'], 0, "The apple of someone's eye is the person they love most."),
          tf('e3-idioms-5', '"To cost an arm and a leg" means to be very expensive.', true, 'It describes something that costs a great deal.'),
          mc('e3-idioms-6', '"The new rule is a double-edged sword." It…', ['has good and bad effects', 'is very sharp', 'is illegal', 'is only good'], 0, 'A double-edged sword helps and harms at the same time.'),
        ],
      },
      {
        id: 'e3-prepositions',
        title: 'The right preposition',
        icon: '📍',
        teach: [
          teach('e3-prep-t1', 'maddie', 'Some words always take the same partner', [
            'Many verbs and adjectives take a fixed preposition. These must be memorised.',
            'different from, interested in, good at, aware of, comply with, congratulate on, prefer … to, accuse … of, depend on, insist on.',
            'A common error: "discuss about". It is just "discuss the matter".',
          ], { hook: { kind: 'memory', text: 'Learn the pair, not the word: "interested-in", "good-at", "aware-of". Say them as one word.' } }),
        ],
        exercises: [
          mc('e3-prep-1', 'This phone is different ___ mine.', ['than', 'from', 'to', 'with'], 1, 'Standard: different from.'),
          mc('e3-prep-2', 'We congratulated her ___ her success.', ['for', 'on', 'about', 'at'], 1, 'Congratulate someone on something.'),
          mc('e3-prep-3', 'All students must comply ___ the rules.', ['to', 'with', 'by', 'on'], 1, 'Comply with.'),
          mc('e3-prep-4', 'He is very good ___ mathematics.', ['in', 'on', 'at', 'for'], 2, 'Good at a subject or skill.'),
          tf('e3-prep-5', '"We discussed about the plan" is correct.', false, 'Discuss takes no preposition: "We discussed the plan."'),
          mc('e3-prep-6', 'I prefer rice ___ beans.', ['than', 'to', 'over than', 'from'], 1, 'Prefer one thing to another.'),
        ],
      },
      {
        id: 'e3-vocab',
        title: 'Vocabulary builder',
        icon: '📖',
        teach: [
          teach('e3-vocab-t1', 'maddie', 'More words, more marks', [
            'A strong vocabulary helps every part of the English paper: comprehension, lexis and summary.',
            'Learn words in pairs (word and synonym, word and antonym) and in a sentence.',
            'Use each new word in a sentence of your own today. That moves it from reading memory into speaking memory.',
          ], { hook: { kind: 'memory', text: 'Make it vivid: "ADAMANT" sounds like "a diamond", hard and unbending. An adamant person won\'t change their mind.' } }),
        ],
        exercises: [
          match('e3-vocab-1', 'Match each word to its synonym', [['adamant', 'unyielding'], ['meticulous', 'careful'], ['ambiguous', 'unclear'], ['ephemeral', 'short-lived'], ['prudent', 'wise']], 'Say each pair out loud twice.'),
          match('e3-vocab-2', 'Match each word to its antonym', [['generous', 'stingy'], ['optimistic', 'pessimistic'], ['ancient', 'modern'], ['reluctant', 'eager']], 'Opposites.'),
          mc('e3-vocab-3', 'Choose the option NEAREST in meaning: "The politician gave an evasive answer."', ['direct', 'avoiding', 'honest', 'long'], 1, 'Evasive means avoiding giving a clear answer.'),
          mc('e3-vocab-4', 'Choose the option OPPOSITE in meaning: "The weather was hostile."', ['friendly', 'harsh', 'cold', 'stormy'], 0, 'Hostile means unfriendly; the opposite is friendly.', { kind: 'eliminate', text: 'Harsh, cold and stormy are close to hostile. They cannot be its opposite.' }),
          mc('e3-vocab-5', 'Choose the option NEAREST in meaning: "Her success was inevitable."', ['unlikely', 'certain', 'sudden', 'small'], 1, 'Inevitable means certain to happen.'),
          mc('e3-vocab-6', 'Choose the option OPPOSITE in meaning: "He was frugal with money."', ['careful', 'wasteful', 'thrifty', 'poor'], 1, 'Frugal means careful and thrifty; the opposite is wasteful.'),
        ],
      },
    ],
  },
];
