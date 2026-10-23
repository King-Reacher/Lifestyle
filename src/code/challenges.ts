import type { Who } from '../components/Character';
import type { Check } from './runner';

/**
 * An open brief: there is no model solution and no line-by-line guide. Hints
 * teach how to think; checks accept any working approach.
 */
export interface Challenge {
  id: string;
  title: string;
  icon: string;
  who: Who;
  level: 1 | 2 | 3;
  brief: string;
  /** Revealed one at a time, from "how to think" to "almost there". */
  hints: string[];
  checks: Check[];
  /** Regular expressions the console output must match, when the brief is about printing. */
  outputMatches?: string[];
  stretch: string[];
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'tip',
    title: 'Tip calculator',
    icon: '🧾',
    who: 'zara',
    level: 1,
    brief: 'Write tip(bill, percent) that returns how much to tip. tip(1000, 10) should give 100.',
    hints: [
      'What goes in? Two numbers. What comes out? One number.',
      'Work one by hand: 10% of 1000. How did you get 100?',
      'Percent means "out of 100". So 10% of 1000 is 1000 × 10 ÷ 100.',
      'Write it as a function that returns bill * percent / 100.',
    ],
    checks: [
      { call: 'tip(1000, 10)', expect: 100 },
      { call: 'tip(2500, 20)', expect: 500 },
      { call: 'tip(800, 0)', expect: 0 },
    ],
    stretch: ['Round the tip to the nearest ₦10.', 'Add split(bill, people) that shares the total, tip included.'],
  },
  {
    id: 'grade',
    title: 'Letter grades',
    icon: '🅰️',
    who: 'mei',
    level: 1,
    brief: 'Write letter(score): "A" for 70 and above, "B" for 60 to 69, "C" for 50 to 59, "D" for 45 to 49, otherwise "F".',
    hints: [
      'This is a chain of decisions. Which check should come first?',
      'Start from the top grade: if the score is at least 70, you are done.',
      'Use if / else if / else. Each else if only runs when the ones above failed.',
      'Test the edges: 70, 69, 50, 49, 45, 44.',
    ],
    checks: [
      { call: 'letter(85)', expect: 'A' },
      { call: 'letter(70)', expect: 'A' },
      { call: 'letter(69)', expect: 'B' },
      { call: 'letter(50)', expect: 'C' },
      { call: 'letter(45)', expect: 'D' },
      { call: 'letter(44)', expect: 'F' },
    ],
    stretch: ['Make it return "Invalid" for scores below 0 or above 100.', 'Write report(scores) that returns the letter for each score in an array.'],
  },
  {
    id: 'table',
    title: 'Times table printer',
    icon: '✖️',
    who: 'tunde',
    level: 1,
    brief: 'Print the 7 times table from 7 x 1 = 7 to 7 x 10 = 70, one line each, in exactly that format.',
    hints: [
      'Ten lines that look almost the same: that is a loop.',
      'What changes on each line? Only the second number (1 to 10) and the answer.',
      'A template literal builds each line: `7 x ${i} = ${7 * i}`.',
      'Put console.log inside a for loop from 1 to 10.',
    ],
    checks: [],
    outputMatches: ['^7 x 1 = 7$', '^7 x 5 = 35$', '^7 x 10 = 70$'],
    stretch: ['Put it in a function table(n) that prints any times table.', 'Print a full 1 to 12 grid.'],
  },
  {
    id: 'weeks',
    title: 'Savings countdown',
    icon: '🏦',
    who: 'ada',
    level: 2,
    brief: 'Write weeksToGoal(goal, perWeek): how many whole weeks of saving to reach the goal. weeksToGoal(50000, 3500) is 15.',
    hints: [
      'By hand: after 14 weeks you have 49,000, not enough. Week 15 gets you there.',
      'Two ways to invent this: keep adding perWeek in a loop and count, or divide and round up.',
      'Rounding up is Math.ceil.',
      'What if the goal is 0? Zero weeks.',
    ],
    checks: [
      { call: 'weeksToGoal(50000, 3500)', expect: 15 },
      { call: 'weeksToGoal(10000, 2500)', expect: 4 },
      { call: 'weeksToGoal(0, 1000)', expect: 0 },
    ],
    stretch: ['Return a message like "15 weeks, about 4 months".', 'Add a starting amount already saved.'],
  },
  {
    id: 'password',
    title: 'Password checker',
    icon: '🔐',
    who: 'greta',
    level: 2,
    brief: 'Write isStrong(password): true only if it has at least 8 characters AND at least one digit.',
    hints: [
      'Two rules joined by AND. Write each rule on its own first.',
      'Length is easy: password.length >= 8.',
      'For a digit, you could loop over each character and check if it is between "0" and "9".',
      'Or test each character with "0123456789".includes(ch). Combine both rules with &&.',
    ],
    checks: [
      { call: 'isStrong("abc12345")', expect: true },
      { call: 'isStrong("abcdefgh")', expect: false },
      { call: 'isStrong("a1")', expect: false },
      { call: 'isStrong("12345678")', expect: true },
    ],
    stretch: ['Also require a capital letter.', 'Return a list of what is missing instead of true/false.'],
  },
  {
    id: 'words',
    title: 'Word counter',
    icon: '📝',
    who: 'maddie',
    level: 2,
    brief: 'Write countWords(text): how many words it contains. Extra spaces should not count as words.',
    hints: [
      'What separates words? Spaces.',
      'text.split(" ") gives you pieces, but double spaces create empty pieces.',
      'Count only pieces that are not empty, or use text.trim().split(/\\s+/).',
      'An empty string should give 0.',
    ],
    checks: [
      { call: 'countWords("I will pass JAMB")', expect: 4 },
      { call: 'countWords("  lots   of   space ")', expect: 3 },
      { call: 'countWords("")', expect: 0 },
    ],
    stretch: ['Find the longest word.', 'Count how many times each word appears.'],
  },
  {
    id: 'aggregate',
    title: 'Admission checker',
    icon: '🎓',
    who: 'priya',
    level: 3,
    brief: 'Write canApply(scores, cutoff): scores is an array of 4 JAMB subject scores. Return true if their total is at least the cut-off and every subject is at least 40.',
    hints: [
      'Two conditions again. What do you need to compute first? The total.',
      'You already know how to total an array (accumulator pattern).',
      'For "every subject is at least 40", loop and return false as soon as one fails, or use scores.every(...).',
      'Return total >= cutoff && allPassed.',
    ],
    checks: [
      { call: 'canApply([70, 65, 60, 55], 200)', expect: true },
      { call: 'canApply([90, 90, 90, 35], 200)', expect: false },
      { call: 'canApply([50, 50, 50, 49], 200)', expect: false },
    ],
    stretch: ['Return how many marks short the student is.', 'Accept an object like { english: 70, maths: 65, ... } instead.'],
  },
  {
    id: 'fizz',
    title: 'Design your own FizzBuzz',
    icon: '🥁',
    who: 'zara',
    level: 3,
    brief: 'For 1 to 15, print "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for both, otherwise the number.',
    hints: [
      'Which check must come first, and why? Think about 15.',
      'Multiple of 3 means i % 3 === 0.',
      'Check the "both" case first, then 3, then 5, then the number.',
      'One console.log per number, inside a loop from 1 to 15.',
    ],
    checks: [],
    outputMatches: ['^1$', '^Fizz$', '^Buzz$', '^FizzBuzz$', '^14$'],
    stretch: ['Add "Jazz" for multiples of 7.', 'Make it a function that takes the range and the rules as inputs.'],
  },
];

/** A planning outline for your own idea, written as comments to code under. */
export function scaffold(idea: string): string {
  const name = idea.trim() || 'my program';
  return [
    `// My idea: ${name}`,
    '//',
    '// 1. What goes in? (the inputs)',
    '//',
    '// 2. What should come out? (the output)',
    '//',
    '// 3. Work one example by hand. What steps did you do?',
    '//',
    '// 4. Turn each step into a line of code below. Run often.',
    '',
    '',
  ].join('\n');
}

/** Output checks: every pattern must match at least one printed line. */
export function outputOk(output: string[], patterns: string[] = []): boolean {
  return patterns.every((p) => output.some((line) => new RegExp(p).test(line.trim())));
}
