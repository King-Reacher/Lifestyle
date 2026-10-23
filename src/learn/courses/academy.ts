import type { Course, Exercise, Lesson, Rng } from '../types';
import { int, match, mc, order, pickOne, teach, tf } from '../util';

/* School 1: Observation and deduction */

const factsAssumptions: Lesson = {
  id: 'a1-facts',
  title: 'Facts vs assumptions',
  icon: '🔍',
  teach: [
    teach('a1-facts-t1', 'zara', 'Observe before you conclude', [
      'A fact is something you directly observed or can check. An assumption is something you filled in.',
      'Example: "His shoes are muddy" is a fact. "He walked through the farm" is an assumption: he might have stepped in a puddle in town.',
      'Good deduction: list the facts, offer more than one explanation, then look for the detail that rules some out.',
      'When new evidence appears, update your conclusion. Being wrong quickly is better than being wrong for long.',
    ], { hook: { kind: 'memory', text: 'Say it in your head: "What do I SEE? What am I GUESSING?" Two columns, every time.' } }),
  ],
  exercises: [
    mc('a1-facts-1', 'Which is a fact, not an assumption?', ['She is angry with me', 'She did not reply to my message', 'She is ignoring me', 'She is busy'], 1, 'Only "did not reply" is observed. The rest are explanations you filled in.', { kind: 'eliminate', text: 'Remove anything that describes thoughts or feelings you cannot see.' }),
    tf('a1-facts-2', 'Seeing someone yawn proves they are bored.', false, 'They might be tired, hungry or simply yawning. One observation fits many explanations.'),
    order('a1-facts-3', 'Order the steps of good deduction', ['Observe the details', 'Separate facts from assumptions', 'List possible explanations', 'Find evidence that rules some out', 'Conclude, and stay open to update'], 'Observe, separate, explain, test, conclude.'),
    mc('a1-facts-4', 'A classmate says they studied all night, but their textbook still has its plastic wrapping. Best conclusion?', ['They definitely lied', 'They may have studied from another source; ask', 'Plastic wrapping means nothing', 'They studied that book'], 1, "The detail is inconsistent with the claim, but there are other explanations. Note it and check, don't accuse."),
  ],
};

const inconsistencies: Lesson = {
  id: 'a1-inconsistent',
  title: 'Spotting inconsistencies',
  icon: '🕵️',
  teach: [
    teach('a1-incon-t1', 'zara', "Details that don't fit", [
      'Stories have shape: time, place, people, sequence. Lies and mistakes usually break one of them.',
      'Check timelines ("you left at 5 but arrived at 4:30?"), quantities, and who could know what.',
      'Inconsistency is a signal to ask a calm question, not proof of lying. Memory is imperfect for everyone.',
    ], { example: ['"I left home at 5pm and got to school at 4:30pm." The times are impossible.', '"I was alone all day, and my friend said hi." Who said hi, then?'], hook: { kind: 'memory', text: 'Check the four Ws: When, Where, Who, What order. Most inconsistencies hide in one of them.' } }),
  ],
  exercises: [
    mc('a1-incon-1', '"I was home all day yesterday," he says, then mentions the traffic on the way back from the market. What is inconsistent?', ['Nothing', 'He mentioned traffic', 'Being home all day vs. coming back from the market', 'The market is closed on Sundays'], 2, 'He could not be home all day and also travel back from the market.'),
    tf('a1-incon-2', 'A small inconsistency in a story always means the person is lying.', false, 'People misremember details all the time. It means "ask", not "accuse".'),
    mc('a1-incon-3', 'A seller says the phone is "brand new, never used", but the screen has fingerprints and the box has no seal. Best move?', ['Buy it anyway', "Ask why the box is unsealed and check the phone's history", 'Shout at the seller', 'Ignore the details'], 1, 'Two details clash with the claim. Ask and verify before money changes hands.'),
  ],
};

/* School 2: Memory and learning science */

const memoryScience: Lesson = {
  id: 'a2-memory',
  title: 'How memory really works',
  icon: '🧠',
  teach: [
    teach('a2-mem-t1', 'greta', 'Rereading feels good. Recall works.', [
      'Active recall: test yourself without looking. Pulling information out strengthens it far more than reading it again.',
      "Spaced repetition: review just before you forget (1 day, then 2, 4, 7, 15…). This app's review queue does exactly that.",
      'Interleaving: mix topics in one session. It feels harder but builds stronger memory.',
      'Sleep: memories are consolidated while you sleep. All-night cramming works against you.',
    ], { hook: { kind: 'memory', text: 'The forgetting curve: without review you lose most new information within days. Each well-timed review flattens the curve.' } }),
    teach('a2-mem-t2', 'mei', 'The memory palace', [
      'Choose a place you know well: your house, your mental mansion.',
      'Walk a fixed route through it: door, sitting room, kitchen…',
      'Place a vivid, strange image of each item at each spot. The weirder and more alive, the better.',
      'To recall, walk the route again and "see" each image.',
    ], { example: ['To remember Na, Mg, Al: a giant sodium-salt mountain blocking the door, a magnesium flare blinding you in the sitting room, aluminium foil wrapped round the fridge.'] }),
  ],
  exercises: [
    mc('a2-mem-1', 'Which study method builds the strongest memory?', ['Rereading notes three times', 'Highlighting the textbook', 'Testing yourself without looking', 'Copying notes neatly'], 2, 'Active recall beats rereading and highlighting by a wide margin.'),
    tf('a2-mem-2', 'Cramming all night before an exam is the most effective way to remember.', false, 'Sleep is when memories are consolidated. Spaced practice beats cramming.'),
    match('a2-mem-3', 'Match the technique to what it means', [['Active recall', 'Test yourself from memory'], ['Spaced repetition', 'Review at growing intervals'], ['Interleaving', 'Mix topics in one session'], ['Memory palace', 'Place images along a route']], 'These four are the backbone of every lesson here.'),
    mc('a2-mem-4', 'In a memory palace, the images should be…', ['plain and realistic', 'vivid, strange and active', 'written as words', 'all in one room'], 1, 'The brain remembers the unusual. Make images exaggerated, funny or shocking.'),
  ],
};

/* School 3: Psychology and human behaviour */

const biases: Lesson = {
  id: 'a3-biases',
  title: 'Thinking traps (cognitive biases)',
  icon: '🪤',
  teach: [
    teach('a3-bias-t1', 'priya', 'Your brain takes shortcuts', [
      'Confirmation bias: noticing only what supports what you already believe.',
      'Anchoring: the first number you hear pulls your judgement towards it.',
      'Sunk cost fallacy: continuing something because of what you already spent, not because it is still worth it.',
      'Availability bias: judging how likely something is by how easily examples come to mind.',
      'Social proof: doing something because others are doing it.',
    ], { hook: { kind: 'memory', text: 'Spotting the trap is half the escape. Name it out loud: "This is sunk cost talking."' } }),
  ],
  exercises: [
    match('a3-bias-1', 'Match the situation to the bias', [['"I already paid, so I must finish this boring course"', 'Sunk cost'], ['Only reading news that agrees with you', 'Confirmation bias'], ['A seller starts at ₦50,000 so ₦30,000 feels cheap', 'Anchoring'], ['Buying because everyone at school has one', 'Social proof']], 'Each trap has a signature. Learn to hear it.'),
    tf('a3-bias-2', 'After a plane crash is in the news, people overestimate the danger of flying. This is availability bias.', true, 'Vivid, recent examples feel more common than they are.'),
    mc('a3-bias-3', 'Best defence against confirmation bias?', ['Read only trusted sources', 'Actively look for evidence that would prove you wrong', 'Trust your first instinct', 'Ask friends who agree with you'], 1, 'Seek out the strongest case against your view.'),
  ],
};

/* School 4: Strategy and decision-making */

const decisions: Lesson = {
  id: 'a4-decisions',
  title: 'Deciding like a strategist',
  icon: '♟️',
  teach: [
    teach('a4-dec-t1', 'ada', 'Slow down the big ones, speed up the small ones', [
      'Opportunity cost: the real cost of a choice is the best thing you give up for it.',
      'Reversible decisions (two-way doors): decide fast, learn by trying.',
      'Irreversible decisions (one-way doors): slow down, list options, ask someone experienced.',
      'First principles: strip a problem to what is definitely true, then rebuild the answer from there instead of copying what everyone does.',
      'Second-order thinking: ask "and then what?" at least twice.',
    ], { hook: { kind: 'memory', text: "Before any big choice, ask Mama Ada's three questions: What do I give up? Can I undo it? And then what?" } }),
  ],
  exercises: [
    mc('a4-dec-1', 'You spend Saturday at a party instead of studying for 4 hours. The opportunity cost is…', ['The transport fare', 'The 4 hours of study', 'Nothing, it was fun', 'The party itself'], 1, 'Opportunity cost is the best alternative given up.'),
    mc('a4-dec-2', 'Which is a "one-way door" decision?', ['Trying a new study timetable for a week', 'Choosing your university course after admission', 'Picking what to eat tonight', 'Testing a new app'], 1, 'Changing course later is hard and costly, so slow down.', { kind: 'eliminate', text: 'Anything you could undo next week is a two-way door.' }),
    tf('a4-dec-3', 'Second-order thinking means asking "and then what?" about the consequences of a choice.', true, 'First-order: what happens now. Second-order: what that leads to.'),
    order('a4-dec-4', 'Order a careful decision', ['Define the outcome you want', 'List the options', 'Weigh risks and opportunity cost', 'Decide and act', 'Review the result later'], 'Clarify, list, evaluate, decide, review.'),
  ],
};

/* School 6: Communication */

const communication: Lesson = {
  id: 'a6-communication',
  title: 'Clear, calm communication',
  icon: '🎙️',
  teach: [
    teach('a6-comm-t1', 'maddie', 'Say less, mean more', [
      'Lead with the point, then the reason, then an example (Point, Reason, Example).',
      'Short sentences and plain words beat big words. Clarity is respect for the listener.',
      'Listen to understand, not to reply. Repeat back what you heard before disagreeing.',
      'Ask open questions ("What happened?") to learn, closed ones ("Did you finish?") to confirm.',
    ], { example: ['Point: "Can I submit on Friday?"', 'Reason: "I was ill on Tuesday."', 'Example: "Here is the doctor\'s note."'], hook: { kind: 'memory', text: 'PRE: Point, Reason, Example. Say the point in the first sentence.' } }),
  ],
  exercises: [
    mc('a6-comm-1', 'Which opening is clearest for a request to your teacher?', ["Good morning sir, I was thinking that maybe, if it's okay, perhaps…", 'Sir, may I submit the assignment on Friday? I was ill on Tuesday and Wednesday.', 'Sir, I have a problem.', "Please sir, it's not my fault."], 1, 'Point first (the request), then the reason. Short and respectful.'),
    match('a6-comm-2', 'Open or closed question?', [['What made you choose that course?', 'Open'], ['Did you pay the fee?', 'Closed']], 'Open questions invite explanation; closed ones get yes or no.'),
    tf('a6-comm-3', 'Using difficult words makes you sound more intelligent and persuasive.', false, 'Clear, simple language persuades better. Use precise words, not big ones.'),
  ],
};

/* School 9: Financial intelligence */

const compoundGen = (rng: Rng): Exercise => {
  const p = 1000 * int(rng, 1, 20);
  const r = pickOne(rng, [10, 20] as const);
  const n = int(rng, 1, 3);
  const amount = Math.round(p * (1 + r / 100) ** n);
  return {
    kind: 'input',
    id: 'a9-compound',
    prompt: `₦${p.toLocaleString()} saved at ${r}% compound interest per year. Amount after ${n} year${n > 1 ? 's' : ''}?`,
    prefix: '₦',
    answers: [String(amount)],
    explain: `A = P(1 + r)ⁿ = ${p} × ${1 + r / 100}${n > 1 ? `^${n}` : ''} = ₦${amount.toLocaleString()}.`,
    tip: { kind: 'formula', text: 'A = P(1 + r/100)ⁿ. Interest earns interest.' },
  };
};

const money: Lesson = {
  id: 'a9-money',
  title: 'Assets, liabilities & compounding',
  icon: '💹',
  teach: [
    teach('a9-money-t1', 'ada', 'Money that works vs money that leaves', [
      'An asset puts money in your pocket (savings earning interest, a business, skills that raise your income).',
      'A liability takes money out (debt, things that cost you to keep).',
      'Compound growth: you earn returns on your returns. Time is the most powerful ingredient.',
      'Inflation: prices rise, so money sitting idle loses buying power every year.',
      'If something promises big returns with no risk, it is almost always a scam.',
    ], { hook: { kind: 'shortcut', text: 'Rule of 72: years to double ≈ 72 ÷ interest rate. At 12% a year, money doubles in about 6 years.' } }),
  ],
  exercises: [
    compoundGen,
    mc('a9-money-1', 'Which is an asset?', ['A loan for a new phone', 'A skill that lets you earn ₦20,000 a month', "A car you can't afford to fuel", 'Credit card debt'], 1, 'An asset puts money in your pocket. A valuable skill does.'),
    mc('a9-money-2', 'Using the rule of 72, how long to double money at 8% a year?', ['8 years', '9 years', '12 years', '72 years'], 1, '72 ÷ 8 = 9 years.', { kind: 'shortcut', text: '72 ÷ rate = years to double.' }),
    tf('a9-money-3', 'An investment promising "guaranteed 50% profit every month, zero risk" is a good opportunity.', false, 'Guaranteed high returns with no risk is the classic sign of a Ponzi scheme.'),
    compoundGen,
  ],
};

/* School 12: Self-mastery and execution */

const habits: Lesson = {
  id: 'a12-habits',
  title: 'How habits are built',
  icon: '🔁',
  teach: [
    teach('a12-hab-t1', 'tunde', 'Make it easy to start', [
      'The habit loop: cue → routine → reward. Change the cue or the reward and the habit changes.',
      'Implementation intention: "At 6am, after I brush my teeth, I will do one maths lesson." A time and a trigger beat motivation.',
      'Make good habits easy (book open on the desk) and bad ones hard (phone in another room).',
      'Never miss twice. Missing once is normal; missing twice starts a new habit of missing.',
    ], { hook: { kind: 'memory', text: 'Two-minute rule: shrink any habit until it takes two minutes to start. "Study maths" becomes "open the Learn tab".' } }),
  ],
  exercises: [
    order('a12-hab-1', 'Order the habit loop', ['Cue', 'Routine', 'Reward'], 'Cue triggers the routine, the reward makes you want to repeat it.'),
    mc('a12-hab-2', 'Which plan is most likely to stick?', ['I will study more this week', 'I will try to be disciplined', 'At 6am after brushing, I do one lesson', 'I will study when I feel motivated'], 2, 'A specific time and trigger (implementation intention) beats vague goals.'),
    tf('a12-hab-3', 'Missing one day means the habit is ruined.', false, 'Missing once is normal. The rule is: never miss twice.'),
    mc('a12-hab-4', 'Your phone keeps pulling you away from study. The strongest fix is…', ['More willpower', 'Phone in another room while studying', 'Studying with the phone face down', 'Only checking it every 5 minutes'], 1, 'Change the environment. Distance beats willpower.'),
  ],
};

export const ACADEMY: Course = {
  id: 'academy',
  title: 'Academy',
  icon: '🏛️',
  units: [
    { id: 'a-s1', title: 'School 1: Observation & deduction', description: 'Notice details, separate facts from assumptions', who: 'zara', color: '#ff7a45', lessons: [factsAssumptions, inconsistencies] },
    { id: 'a-s2', title: 'School 2: Memory & learning science', description: 'Active recall, spacing, the memory palace', who: 'greta', color: '#60a5fa', lessons: [memoryScience] },
    { id: 'a-s3', title: 'School 3: Psychology', description: 'Biases and how the mind decides', who: 'priya', color: '#10b981', lessons: [biases] },
    { id: 'a-s4', title: 'School 4: Strategy & decisions', description: 'Opportunity cost, one-way doors, first principles', who: 'ada', color: '#a78bfa', lessons: [decisions] },
    { id: 'a-s6', title: 'School 6: Communication', description: 'Point first, plain words, real listening', who: 'maddie', color: '#38bdf8', lessons: [communication] },
    { id: 'a-s9', title: 'School 9: Financial intelligence', description: 'Assets, liabilities, compounding, scams', who: 'ada', color: '#f5b938', lessons: [money] },
    { id: 'a-s12', title: 'School 12: Self-mastery', description: 'Habits that survive low-motivation days', who: 'tunde', color: '#2dd4bf', lessons: [habits] },
  ],
  upcoming: ['School 5: Character & composure', 'School 7: Software engineering', 'School 8: Systems & applied science', 'School 10: Trading & market intelligence', 'School 11: Entrepreneurship & product'],
};
