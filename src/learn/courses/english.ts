import type { Course, Lesson } from '../types';
import { match, mc, order, teach, tf } from '../util';

const partsOfSpeech: Lesson = {
  id: 'e1-parts',
  title: 'Parts of speech',
  icon: '🧱',
  teach: [
    teach('e1-parts-t1', 'maddie', 'Every word has a job', [
      'Noun: a person, place, thing or idea (Lagos, happiness, book).',
      'Pronoun: stands in for a noun (she, they, it).',
      'Verb: an action or state (run, is, became).',
      'Adjective: describes a noun (tall, careful).',
      'Adverb: describes a verb, adjective or another adverb (quickly, very).',
      'Preposition: shows position or relation (under, between, after).',
      'Conjunction: joins words or clauses (and, but, because).',
    ], { hook: { kind: 'memory', text: 'Most adverbs answer "how?" and many end in -ly. But not every -ly word is an adverb: "friendly" and "lovely" are adjectives.' } }),
  ],
  exercises: [
    match('e1-parts-1', 'Match each word to its part of speech', [['quickly', 'Adverb'], ['happiness', 'Noun'], ['beautiful', 'Adjective'], ['under', 'Preposition'], ['because', 'Conjunction']], 'Ask what job the word does in a sentence.'),
    mc('e1-parts-2', 'In "She sings beautifully", "beautifully" is…', ['an adjective', 'an adverb', 'a noun', 'a verb'], 1, 'It describes how she sings, so it modifies the verb: an adverb.'),
    mc('e1-parts-3', 'In "The friendly dog barked", "friendly" is…', ['an adverb', 'a verb', 'an adjective', 'a preposition'], 2, 'It describes the dog (a noun), so it is an adjective, even though it ends in -ly.', { kind: 'eliminate', text: 'Find what the word describes. Describes a noun: adjective. Describes a verb: adverb.' }),
    tf('e1-parts-4', 'In "I will run tomorrow", "tomorrow" is an adverb.', true, 'It tells us when the running happens, so it modifies the verb.'),
    mc('e1-parts-5', 'Which word is a pronoun?', ['They', 'Table', 'Quickly', 'Above'], 0, '"They" stands in for a plural noun.'),
  ],
};

const concord: Lesson = {
  id: 'e1-concord',
  title: 'Subject-verb agreement',
  icon: '🤝',
  teach: [
    teach('e1-concord-t1', 'maddie', 'Singular subject, singular verb', [
      'A singular subject takes a singular verb: "The boy runs." A plural subject takes a plural verb: "The boys run."',
      '"Each", "every", "either", "neither", "one of" are singular: "Each of the students has a book."',
      'With "either… or" and "neither… nor", the verb agrees with the nearer subject: "Neither the boys nor the girl is here."',
      'Some nouns look plural but are singular: news, physics, mathematics, economics.',
    ], { hook: { kind: 'eliminate', text: 'Cross out the words between the subject and the verb. "The box of pencils (is/are)" becomes "The box is".' } }),
  ],
  exercises: [
    mc('e1-concord-1', 'Each of the students ___ a textbook.', ['have', 'has', 'are having', 'were having'], 1, '"Each" is singular, so "has".'),
    mc('e1-concord-2', 'Neither the teachers nor the principal ___ in the office.', ['are', 'were', 'is', 'have been'], 2, 'With "neither… nor", the verb agrees with the nearer subject, "the principal": singular "is".'),
    mc('e1-concord-3', 'The news ___ very encouraging.', ['are', 'were', 'is', 'have been'], 2, '"News" is singular despite the -s.'),
    mc('e1-concord-4', 'One of the boys ___ absent today.', ['is', 'are', 'were', 'have been'], 0, 'The subject is "one", which is singular.', { kind: 'eliminate', text: 'Cross out "of the boys". "One (is/are) absent" is obvious.' }),
    tf('e1-concord-5', '"Mathematics are my favourite subject" is correct.', false, 'Mathematics is singular: "Mathematics is my favourite subject."'),
    mc('e1-concord-6', 'The box of pencils ___ on the table.', ['are', 'is', 'were', 'have been'], 1, 'The subject is "box" (singular). "Of pencils" just describes it.'),
  ],
};

const tenses: Lesson = {
  id: 'e1-tenses',
  title: 'Tenses & conditionals',
  icon: '⏳',
  teach: [
    teach('e1-tenses-t1', 'maddie', 'Time lives in the verb', [
      'Simple past for a finished time: "I saw him yesterday."',
      'Present perfect for no fixed time, or up to now: "I have seen that film."',
      'Never mix the present perfect with a finished time word: "I have seen him yesterday" is wrong.',
      'Future perfect, finished before a future point: "By next year, she will have graduated."',
      'Unreal conditions use "were" for every subject: "If I were you, I would study."',
    ]),
  ],
  exercises: [
    mc('e1-tenses-1', 'If I ___ you, I would accept the offer.', ['am', 'was', 'were', 'will be'], 2, 'Unreal (imagined) condition: "If I were you".'),
    mc('e1-tenses-2', 'By this time next year, she ___ her degree.', ['completes', 'will have completed', 'has completed', 'completed'], 1, '"By this time next year" points to something finished before a future time: future perfect.'),
    tf('e1-tenses-3', '"I have seen him yesterday" is correct.', false, '"Yesterday" is a finished time, so use the simple past: "I saw him yesterday."'),
    mc('e1-tenses-4', 'He has ___ to school already.', ['go', 'went', 'gone', 'going'], 2, '"Has" takes the past participle: gone.'),
    mc('e1-tenses-5', 'If it rains tomorrow, we ___ indoors.', ['would stay', 'will stay', 'stayed', 'had stayed'], 1, 'A real, possible future condition: if + present, will + verb.'),
  ],
};

const lexis: Lesson = {
  id: 'e1-lexis',
  title: 'Synonyms & antonyms',
  icon: '📚',
  teach: [
    teach('e1-lexis-t1', 'maddie', 'Nearest in meaning, opposite in meaning', [
      'JAMB asks for the word "nearest in meaning" (synonym) or "opposite in meaning" (antonym) to a word in a sentence.',
      'Read the whole sentence first. Context decides the meaning.',
      'Read the question twice: many students lose marks by picking a synonym when it asked for an antonym.',
    ], { hook: { kind: 'eliminate', text: 'For "opposite in meaning", first cross out any option that means the SAME. Examiners always plant one.' } }),
  ],
  exercises: [
    match('e1-lexis-1', 'Match each word to its synonym', [['benevolent', 'kind'], ['diligent', 'hardworking'], ['candid', 'frank'], ['frugal', 'thrifty'], ['obsolete', 'outdated']], 'Learn words in pairs; it doubles your vocabulary.'),
    match('e1-lexis-2', 'Match each word to its antonym', [['scarce', 'abundant'], ['timid', 'bold'], ['transparent', 'opaque'], ['humble', 'arrogant']], 'Antonyms are opposites.'),
    mc('e1-lexis-3', 'Choose the option OPPOSITE in meaning: "The manager was lenient with latecomers."', ['kind', 'strict', 'tolerant', 'gentle'], 1, 'Lenient means not strict. Its opposite is strict.', { kind: 'eliminate', text: 'Kind, tolerant and gentle all mean nearly the same as lenient, so they cannot be the opposite.' }),
    mc('e1-lexis-4', 'Choose the option NEAREST in meaning: "His explanation was lucid."', ['confusing', 'clear', 'long', 'loud'], 1, 'Lucid means clear and easy to understand.'),
    mc('e1-lexis-5', 'Choose the option NEAREST in meaning: "She gave a terse reply."', ['brief', 'friendly', 'detailed', 'late'], 0, 'Terse means brief, often abrupt.'),
  ],
};

const tags: Lesson = {
  id: 'e1-tags',
  title: 'Question tags',
  icon: '❓',
  teach: [
    teach('e1-tags-t1', 'maddie', 'Positive statement, negative tag', [
      'A positive statement takes a negative tag: "She is coming, isn\'t she?"',
      'A negative statement takes a positive tag: "He didn\'t call, did he?"',
      'Words like "nobody", "never", "hardly" make the statement negative: "Nobody came, did they?"',
      'Special cases: "I am right, aren\'t I?" and "Let\'s go, shall we?"',
    ]),
  ],
  exercises: [
    mc('e1-tags-1', 'She is coming, ___?', ["isn't she", 'is she', "doesn't she", "wasn't she"], 0, 'Positive "is" takes the negative tag "isn\'t she".'),
    mc('e1-tags-2', "Let's start the meeting, ___?", ["don't we", 'shall we', 'will you', "won't we"], 1, '"Let\'s" always takes "shall we".'),
    mc('e1-tags-3', 'Nobody called, ___?', ['did they', "didn't they", 'did he', "didn't he"], 0, '"Nobody" makes the statement negative, so the tag is positive; we use "they" for nobody.'),
    mc('e1-tags-4', 'I am your friend, ___?', ["amn't I", "aren't I", 'am I', "isn't it"], 1, 'Standard English uses "aren\'t I".'),
    tf('e1-tags-5', '"He hardly studies, does he?" is correct.', true, '"Hardly" is negative in meaning, so the tag is positive.'),
  ],
};

const spelling: Lesson = {
  id: 'e1-spelling',
  title: 'Spelling & silent letters',
  icon: '✍️',
  teach: [
    teach('e1-spelling-t1', 'maddie', 'Words that catch everyone', [
      'Double letters: accommodation (cc, mm), embarrass (rr, ss), occurrence (cc, rr), committee (mm, tt, ee).',
      'Separate has "a rat" in the middle: sep-A-RAT-e.',
      'Necessary: one Collar, two Sleeves (one c, double s).',
      'Silent letters: k in knife, b in debt, p in psychology, s in island, w in wrong, h in honest.',
    ], { hook: { kind: 'memory', text: 'Picture a rat in the middle of the word "separate". You won\'t forget the a again.' } }),
  ],
  exercises: [
    mc('e1-spelling-1', 'Choose the correctly spelt word.', ['acommodation', 'accomodation', 'accommodation', 'acomodation'], 2, 'Accommodation: double c and double m.'),
    mc('e1-spelling-2', 'Choose the correctly spelt word.', ['seperate', 'separate', 'seperete', 'separete'], 1, 'There is "a rat" in separate.'),
    mc('e1-spelling-3', 'Which word has a silent letter?', ['plant', 'debt', 'stand', 'grip'], 1, 'The b in debt is silent.'),
    order('e1-spelling-4', 'Spell "necessary" in order', ['ne', 'ce', 'ss', 'ary'], 'One c, double s: ne-ce-ss-ary.'),
    mc('e1-spelling-5', 'Choose the correctly spelt word.', ['embarass', 'embarrass', 'embarras', 'emberrass'], 1, 'Embarrass: double r and double s.'),
    tf('e1-spelling-6', 'The p in "psychology" is pronounced.', false, 'It is silent: "sy-KOL-o-jee".'),
  ],
};

export const ENGLISH: Course = {
  id: 'english',
  title: 'English',
  icon: '📖',
  units: [
    { id: 'e-u1', title: 'Grammar foundations', description: 'Parts of speech, agreement, tenses and question tags', who: 'maddie', color: '#38bdf8', lessons: [partsOfSpeech, concord, tenses, tags] },
    { id: 'e-u2', title: 'Words', description: 'Synonyms, antonyms and spelling', who: 'maddie', color: '#f472b6', lessons: [lexis, spelling] },
  ],
  upcoming: ['Comprehension & summary', 'Idioms & figurative language', 'Oral English: vowels & consonants', 'Stress & intonation', 'Sentence interpretation', 'Prepositions & phrasal verbs'],
};
