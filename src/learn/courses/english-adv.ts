import type { Unit } from '../types';
import { match, mc, order, teach, tf } from '../util';

export const ENGLISH_ADV: Unit[] = [
  {
    id: 'e-u7',
    title: 'Sentence interpretation',
    description: 'What a sentence really means, and how it is built',
    who: 'maddie',
    color: '#f59e0b',
    lessons: [
      {
        id: 'e7-interpret',
        title: 'Interpreting sentences',
        icon: '🔍',
        teach: [
          teach('e7-int-t1', 'maddie', 'Read the meaning, not the words', [
            'JAMB gives a sentence and asks which option "best explains" it. Choose the option with the same meaning, even if it uses different words.',
            'Watch small words that flip meaning: hardly, barely, scarcely and seldom are negative; "only" changes meaning depending on where it sits.',
            '"No sooner had… than" and "Hardly had… when" both mean one thing happened right after another.',
            'A conditional with "had" ("Had I known…") means it did not happen.',
          ], { example: ['"Had she studied, she would have passed." means she did not study and did not pass.'], hook: { kind: 'eliminate', text: 'Cross out options that add information the sentence never gave.' } }),
        ],
        exercises: [
          mc('e7-i-1', '"Had Tunde left early, he would have caught the bus." This means Tunde…', ['caught the bus', 'left early', 'did not leave early and missed the bus', 'never takes the bus'], 2, '"Had… would have" describes something that did not happen.'),
          mc('e7-i-2', '"Hardly had the teacher entered when the students stood up." The students stood up…', ['before the teacher came', 'immediately after the teacher entered', 'long after the teacher left', 'without seeing the teacher'], 1, '"Hardly… when" means right after.'),
          mc('e7-i-3', '"She seldom eats rice." She…', ['eats rice every day', 'rarely eats rice', 'never eats anything', 'loves rice'], 1, 'Seldom means rarely.'),
          mc('e7-i-4', '"Only Ada passed the test." This means…', ['Ada only passed; she did not excel', 'Ada and nobody else passed', 'Ada passed only one test', 'Ada barely passed'], 1, '"Only" before Ada limits who passed.', { kind: 'shortcut', text: 'Ask what word "only" sits next to. That is the word it limits.' }),
          tf('e7-i-5', '"He could not have done it" means he probably did it.', false, 'It means it was impossible, or almost certainly not, that he did it.'),
          mc('e7-i-6', '"The manager gave the proposal the green light." The proposal was…', ['rejected', 'approved', 'painted', 'delayed'], 1, 'The green light means permission to go ahead.'),
        ],
      },
      {
        id: 'e7-clauses',
        title: 'Clauses & sentence types',
        icon: '🧱',
        teach: [
          teach('e7-cl-t1', 'maddie', 'Building blocks of sentences', [
            'A clause has a subject and a verb. A main clause can stand alone; a subordinate clause cannot.',
            'A simple sentence has one main clause. A compound sentence joins main clauses with and, but or so. A complex sentence has a main clause and at least one subordinate clause.',
            'A noun clause works as a noun ("What you said surprised me"). An adjectival clause describes a noun ("the boy who won"). An adverbial clause tells when, why, how or where ("because it rained").',
          ], { example: ['"I stayed home because it rained."', 'Main clause: I stayed home. Adverbial clause of reason: because it rained.'], hook: { kind: 'shortcut', text: 'Ask what the clause does: names (noun), describes a noun (adjectival), or tells how, when, why (adverbial).' } }),
        ],
        exercises: [
          mc('e7-c-1', 'Identify the underlined clause: "The girl WHO WON THE PRIZE is my cousin."', ['Noun clause', 'Adjectival clause', 'Adverbial clause of time', 'Main clause'], 1, 'It describes "the girl", a noun.'),
          mc('e7-c-2', 'Identify: "I will call you WHEN I ARRIVE."', ['Adverbial clause of time', 'Noun clause', 'Adjectival clause', 'Adverbial clause of place'], 0, '"When" tells us the time.'),
          mc('e7-c-3', 'Identify: "WHAT HE SAID was untrue."', ['Adjectival clause', 'Noun clause', 'Adverbial clause of reason', 'Phrase'], 1, 'It is the subject of the sentence, doing the job of a noun.'),
          mc('e7-c-4', 'Which is a complex sentence?', ['I ran and I won.', 'I ran fast.', 'Although I was tired, I ran.', 'Run!'], 2, '"Although I was tired" is a subordinate clause attached to a main clause.'),
          tf('e7-c-5', 'A phrase has a subject and a verb.', false, 'A phrase lacks a subject-verb pair, for example "in the morning".'),
        ],
      },
    ],
  },
  {
    id: 'e-u8',
    title: 'Literature in English',
    description: 'Figures of speech, poetry, drama and prose terms',
    who: 'maddie',
    color: '#be185d',
    lessons: [
      {
        id: 'e8-figures',
        title: 'Figures of speech',
        icon: '🎭',
        teach: [
          teach('e8-fig-t1', 'maddie', 'Language that paints pictures', [
            'Simile compares using "like" or "as": brave as a lion. Metaphor says one thing IS another: he is a lion in battle.',
            'Personification gives human qualities to things: the wind whispered.',
            'Hyperbole is deliberate exaggeration: I have told you a million times.',
            'Alliteration repeats the first consonant sound: Peter Piper picked. Onomatopoeia imitates sounds: buzz, bang.',
            'Oxymoron puts opposites together: bitter sweet, deafening silence. Irony is when words or events are the opposite of what is expected.',
            'Euphemism is a gentle way of saying something harsh: "passed away" for died.',
          ], { hook: { kind: 'shortcut', text: '"Like" or "as" in a comparison? Simile. No "like"? Metaphor.' } }),
        ],
        exercises: [
          match('e8-f-1', 'Match the line to its figure of speech', [['Her smile was as bright as the sun', 'Simile'], ['Time is a thief', 'Metaphor'], ['The trees danced in the wind', 'Personification'], ['I am so hungry I could eat a horse', 'Hyperbole']], 'Look for like/as, an "is" comparison, human actions, or exaggeration.'),
          mc('e8-f-2', '"The bees buzzed in the garden" contains…', ['oxymoron', 'onomatopoeia', 'euphemism', 'metaphor'], 1, '"Buzzed" imitates the sound.'),
          mc('e8-f-3', '"A deafening silence" is an example of…', ['alliteration', 'oxymoron', 'simile', 'hyperbole'], 1, 'Deafening and silence are opposites placed together.'),
          mc('e8-f-4', '"Sweet smell of success" mainly shows…', ['alliteration', 'irony', 'personification', 'euphemism'], 0, 'Repeated "s" sounds at the start of words.'),
          mc('e8-f-5', '"Grandpa passed away last year" uses…', ['hyperbole', 'euphemism', 'onomatopoeia', 'simile'], 1, 'A gentle way of saying he died.'),
          tf('e8-f-6', 'A fire station burning down is an example of irony.', true, 'It is the opposite of what you would expect.'),
        ],
      },
      {
        id: 'e8-genres',
        title: 'Poetry, drama & prose',
        icon: '📚',
        teach: [
          teach('e8-gen-t1', 'maddie', 'Literary terms', [
            'The three genres are poetry, drama and prose.',
            'Poetry: a stanza is a group of lines; rhyme scheme is written with letters (ABAB); a sonnet has 14 lines; an elegy mourns the dead; an ode praises.',
            'Drama: a tragedy ends in suffering or death for the hero; a comedy ends happily; a soliloquy is a character speaking their thoughts alone on stage; an aside is a quick remark to the audience.',
            'Prose: the plot is the sequence of events; the setting is where and when; the narrator can be first person ("I") or third person ("he, she, they").',
            'Theme is the main idea or message. Tone is the writer\'s attitude.',
          ], { hook: { kind: 'memory', text: 'Soliloquy: "solo" speech, alone on stage. Aside: a quick word aside to the audience.' } }),
        ],
        exercises: [
          mc('e8-g-1', 'A sonnet has…', ['10 lines', '12 lines', '14 lines', '16 lines'], 2, 'Fourteen lines, often with a strict rhyme scheme.'),
          mc('e8-g-2', 'A poem written to mourn the dead is…', ['an ode', 'an elegy', 'a ballad', 'an epic'], 1, 'An elegy is a lament.'),
          mc('e8-g-3', 'A character speaking their thoughts alone on stage is a…', ['dialogue', 'soliloquy', 'chorus', 'prologue'], 1, 'From Latin "solus", alone.'),
          mc('e8-g-4', 'A story told using "I" is in the…', ['first-person point of view', 'third-person point of view', 'omniscient chorus', 'epilogue'], 0, 'The narrator is a character in the story.'),
          match('e8-g-5', 'Match the term', [['Setting', 'Where and when'], ['Plot', 'Sequence of events'], ['Theme', 'Main message'], ['Tone', "Writer's attitude"]], 'These four come up in every prose question.'),
          tf('e8-g-6', 'A tragedy usually ends happily.', false, 'Tragedy ends in suffering or the downfall of the main character.'),
        ],
      },
    ],
  },
  {
    id: 'e-u9',
    title: 'Essay & letter writing',
    description: 'Formal and informal letters, essay types, paragraphs',
    who: 'maddie',
    color: '#0d9488',
    lessons: [
      {
        id: 'e9-letters',
        title: 'Letters',
        icon: '✉️',
        teach: [
          teach('e9-let-t1', 'maddie', 'Formal and informal letters', [
            "A formal letter has two addresses (yours, then the receiver's), the date, a salutation (Dear Sir/Madam), a title, the body and \"Yours faithfully\" with your full name.",
            'If you know the person\'s name in a formal letter ("Dear Mrs Bello"), close with "Yours sincerely".',
            'An informal letter (to a friend or relative) has only your address and the date, a friendly greeting, chatty paragraphs, and a close like "Your friend" with your first name.',
            'A semi-formal letter (to a teacher or a neighbour you know) is polite but warmer.',
          ], { hook: { kind: 'memory', text: 'Sir and Faithfully go together (two S/F letters); a Name goes with Sincerely.' } }),
        ],
        exercises: [
          mc('e9-l-1', 'A formal letter beginning "Dear Sir" should end with…', ['Yours sincerely', 'Yours faithfully', 'Your friend', 'Love'], 1, 'Unknown name: Yours faithfully.'),
          mc('e9-l-2', 'Which belongs only in a formal letter?', ["The receiver's address", 'The date', 'Paragraphs', 'A greeting'], 0, "Informal letters do not include the receiver's address."),
          order('e9-l-3', 'Order the parts of a formal letter', ["Writer's address", 'Date', "Receiver's address", 'Salutation', 'Title', 'Body', 'Closing'], 'Addresses and date first, then greeting, title, body, closing.'),
          tf('e9-l-4', 'An informal letter should have a title.', false, 'Titles belong in formal letters.'),
          mc('e9-l-5', 'A formal letter to "Dear Mr Okafor" ends with…', ['Yours faithfully', 'Yours sincerely', 'Cheers', 'Your loving son'], 1, 'When you name the person, use Yours sincerely.'),
        ],
      },
      {
        id: 'e9-essays',
        title: 'Essays & paragraphs',
        icon: '📝',
        teach: [
          teach('e9-ess-t1', 'maddie', 'Plan, then write', [
            'Narrative essays tell a story. Descriptive essays paint a picture of a person, place or thing. Argumentative essays take a side; expository essays explain.',
            'Every essay needs an introduction, a body of well-organised paragraphs, and a conclusion.',
            'Each paragraph has one main idea, usually in its topic sentence, supported by details.',
            'Spend five minutes planning: list your points, then order them. A plan stops you repeating yourself.',
          ], { hook: { kind: 'shortcut', text: 'Argumentative: pick a side and stay on it. Mention the other side only to answer it.' } }),
        ],
        exercises: [
          match('e9-e-1', 'Match the essay type to its job', [['Narrative', 'Tells a story'], ['Descriptive', 'Paints a picture'], ['Argumentative', 'Takes a side'], ['Expository', 'Explains how or why']], 'The question wording tells you the type.'),
          mc('e9-e-2', '"Write a story that ends with: and that was the last time I lied." This is a…', ['descriptive essay', 'narrative essay', 'formal letter', 'speech'], 1, 'It asks for a story.'),
          mc('e9-e-3', 'The main idea of a paragraph is usually in its…', ['last word', 'topic sentence', 'title', 'longest sentence'], 1, 'Often the first sentence.'),
          tf('e9-e-4', 'An argumentative essay should support both sides equally.', false, 'Choose one side; address the other only to rebut it.'),
          mc('e9-e-5', 'What should come before writing an essay?', ['A conclusion', 'A plan of the main points', 'A list of difficult words', 'A summary'], 1, 'Planning keeps the essay organised.'),
        ],
      },
    ],
  },
];
