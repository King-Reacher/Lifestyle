import type { Check } from '../../code/runner';
import type { CodeEx, Course, Exercise, Lesson, Rng, Tip } from '../types';
import { choice, int, match, mc, order, teach, tf } from '../util';

function code(id: string, prompt: string, spec: { starter: string; solution: string; output?: string[]; checks?: Check[]; explain: string; tip?: Tip }): CodeEx {
  return { kind: 'code', id, prompt, ...spec };
}

/* Unit 1: How computers work */

const whatIsProgram: Lesson = {
  id: 'cs1-program',
  title: 'What is a program?',
  icon: '💻',
  teach: [
    teach('cs1-prog-t1', 'zara', 'A computer only follows instructions', [
      'A program is a list of precise instructions. The computer does exactly what you write, not what you meant.',
      'CPU: the processor that runs instructions, billions per second.',
      'Memory (RAM): fast, temporary storage for what is running now. Storage (SSD, disk): keeps files when the power is off.',
      'Input (keyboard, touch) → processing (CPU) → output (screen, sound).',
      'A programming language (JavaScript, Python…) lets humans write instructions. An interpreter or compiler turns them into something the machine runs.',
    ], { hook: { kind: 'memory', text: 'Kitchen picture: the recipe is the program, the cook is the CPU, the worktop is RAM, the cupboard is storage.' } }),
  ],
  exercises: [
    match('cs1-prog-1', 'Match the part to its job', [['CPU', 'Runs instructions'], ['RAM', 'Holds what is running now'], ['SSD', 'Keeps files when off'], ['Keyboard', 'Input']], 'Processor, memory, storage, input.'),
    order('cs1-prog-2', 'Order the flow of a program', ['Input', 'Processing', 'Output'], 'Data comes in, gets processed, results go out.'),
    tf('cs1-prog-3', 'A computer can guess what you meant if your instructions are slightly wrong.', false, 'It does exactly what you wrote. That is why precision matters in code.'),
    mc('cs1-prog-4', 'Which is a programming language?', ['HTTP', 'JavaScript', 'Wi-Fi', 'Chrome'], 1, 'JavaScript is a language. HTTP is a protocol, Wi-Fi is a network, Chrome is a browser.'),
  ],
};

const binaryGen = (rng: Rng): Exercise => {
  const n = int(rng, 3, 31);
  const bits = n.toString(2);
  const parts = bits.split('').map((b, i) => (b === '1' ? 2 ** (bits.length - 1 - i) : 0)).filter(Boolean);
  return { kind: 'input', id: 'cs1-bin', prompt: `Binary ${bits} in decimal?`, answers: [String(n)], explain: `Each 1 is a power of two: ${parts.join(' + ')} = ${n}.`, tip: { kind: 'shortcut', text: 'Read the place values from the right: 1, 2, 4, 8, 16. Add the ones that have a 1.' } };
};

const toBinaryGen = (rng: Rng): Exercise => {
  const n = int(rng, 3, 31);
  const right = n.toString(2);
  return choice(rng, { id: 'cs1-tobin', prompt: `${n} in binary?`, explain: `${n} = ${right} in binary. Check: ${right.split('').map((b, i) => (b === '1' ? 2 ** (right.length - 1 - i) : 0)).filter(Boolean).join(' + ')}.`, tip: { kind: 'eliminate', text: 'Odd numbers end in 1 in binary, even numbers end in 0.' } }, right, [(n + 1).toString(2), (n - 1).toString(2), right.split('').reverse().join(''), (n * 2).toString(2)]);
};

const binary: Lesson = {
  id: 'cs1-binary',
  title: 'Binary & data',
  icon: '0️⃣',
  teach: [
    teach('cs1-bin-t1', 'zara', 'Everything is ones and zeros', [
      'A bit is a single 0 or 1. Eight bits make a byte.',
      'Binary counts in powers of two. Place values from the right: 1, 2, 4, 8, 16, 32…',
      'Text, images and sound are all stored as numbers, and numbers as bits.',
    ], { example: ['1011 = 8 + 0 + 2 + 1 = 11', '10100 = 16 + 4 = 20'], hook: { kind: 'memory', text: '1 KB ≈ 1000 bytes, 1 MB ≈ 1000 KB, 1 GB ≈ 1000 MB.' } }),
  ],
  exercises: [binaryGen, toBinaryGen, tf('cs1-bin-1', 'A byte is 8 bits.', true, 'Eight bits make one byte.'), binaryGen, toBinaryGen],
};

/* Unit 2: JavaScript first steps */

const firstCode: Lesson = {
  id: 'cs2-first',
  title: 'Your first code',
  icon: '👋',
  teach: [
    teach('cs2-first-t1', 'zara', 'console.log prints things', [
      'console.log(...) prints whatever is inside the brackets.',
      'Text goes inside quotes: "Hello". Numbers don\'t need quotes: 42.',
      'Each statement ends with a semicolon. Lines run from top to bottom.',
    ], { example: ['console.log("Hello, world!");', 'console.log(2 + 3); // prints 5'], hook: { kind: 'shortcut', text: 'Type "con" and tap ⇥ Accept: the editor completes console.log( for you.' } }),
  ],
  exercises: [
    code('cs2-first-1', 'Print exactly: Hello, world!', { starter: '// Print Hello, world!\n', solution: 'console.log("Hello, world!");', output: ['Hello, world!'], explain: 'console.log prints the text inside the quotes.' }),
    code('cs2-first-2', 'Print two lines: "I am learning to code" then "Day 1"', { starter: '// Two console.log lines\n', solution: 'console.log("I am learning to code");\nconsole.log("Day 1");', output: ['I am learning to code', 'Day 1'], explain: 'Each console.log prints one line, in order from top to bottom.' }),
    mc('cs2-first-3', 'What does console.log(2 + 3) print?', ['2 + 3', '5', '"5"', '23'], 1, 'Without quotes, 2 + 3 is maths, so it prints 5.'),
  ],
};

const variables: Lesson = {
  id: 'cs2-vars',
  title: 'Variables & types',
  icon: '📦',
  teach: [
    teach('cs2-vars-t1', 'zara', 'Boxes with names', [
      'A variable is a named box that holds a value.',
      "const: the box can't be given a new value. let: it can.",
      'Main types: number (280), string ("Lagos"), boolean (true / false). Use typeof to check.',
      'Use const by default; use let only when the value must change.',
    ], { example: ['const target = 300;', 'let streak = 0;', 'streak = streak + 1;  // now 1'] }),
  ],
  exercises: [
    code('cs2-vars-1', 'Make a const called score set to 280, then print it.', { starter: '// const score = ...\n', solution: 'const score = 280;\nconsole.log(score);', output: ['280'], checks: [{ call: 'score', expect: 280 }], explain: 'const score = 280; creates the box. console.log(score) prints what is inside.' }),
    code('cs2-vars-2', 'count starts at 1. Add 1 to it, then print it.', { starter: 'let count = 1;\n// Add 1 to count, then print it\n', solution: 'let count = 1;\ncount = count + 1;\nconsole.log(count);', output: ['2'], checks: [{ call: 'count', expect: 2 }], explain: 'count = count + 1 reads the old value, adds 1 and stores the result back.' }),
    tf('cs2-vars-3', 'A const variable can be given a new value later.', false, 'That is what let is for. Reassigning a const throws an error.'),
    mc('cs2-vars-4', 'What is typeof "5"?', ['"number"', '"string"', '"boolean"', '"five"'], 1, 'Anything in quotes is a string, even if it looks like a number.'),
  ],
};

const operators: Lesson = {
  id: 'cs2-ops',
  title: 'Operators & strings',
  icon: '➕',
  teach: [
    teach('cs2-ops-t1', 'zara', 'Doing things with values', [
      'Maths: + − * / and % (remainder). 17 % 5 is 2.',
      'Joining strings: "Hi " + "Vin" gives "Hi Vin".',
      'Template literals use backticks and ${ }: `Score: ${score}`.',
      'Careful: "2" + "3" is "23" (joining text), but 2 + 3 is 5.',
    ], { hook: { kind: 'memory', text: '% is the remainder after dividing. Even numbers have n % 2 === 0.' } }),
  ],
  exercises: [
    code('cs2-ops-1', 'Print the remainder when 17 is divided by 5.', { starter: '// Use the % operator\n', solution: 'console.log(17 % 5);', output: ['2'], explain: '17 = 3 × 5 + 2, so 17 % 5 is 2.' }),
    code('cs2-ops-2', 'name is "Ada". Print: Hello, Ada! using a template literal.', { starter: 'const name = "Ada";\n// Print Hello, Ada!\n', solution: 'const name = "Ada";\nconsole.log(`Hello, ${name}!`);', output: ['Hello, Ada!'], explain: 'Backticks with ${name} put the value of name inside the text.' }),
    mc('cs2-ops-3', 'What is "2" + "3" in JavaScript?', ['5', '"23"', '6', 'An error'], 1, 'Both are strings, so + joins them: "23".', { kind: 'eliminate', text: 'Quotes mean text. Text joined with text is never a number.' }),
    mc('cs2-ops-4', 'What is 10 % 3?', ['3', '1', '0', '3.33'], 1, '10 = 3 × 3 + 1. The remainder is 1.'),
  ],
};

/* Unit 3: Decisions and loops */

const conditions: Lesson = {
  id: 'cs3-if',
  title: 'if / else decisions',
  icon: '🔀',
  teach: [
    teach('cs3-if-t1', 'zara', 'Code that chooses', [
      'if (condition) { … } runs only when the condition is true. else { … } runs otherwise.',
      'Compare with === (equal), !== (not equal), <, >, <=, >=.',
      'Combine with && (and), || (or), ! (not).',
      'Always use === not ==. It compares type too, so "5" === 5 is false.',
    ], { example: ['if (score >= 50) {', '  console.log("pass");', '} else {', '  console.log("fail");', '}'] }),
  ],
  exercises: [
    code('cs3-if-1', 'Finish grade(score): return "pass" if score is 50 or more, otherwise "fail".', {
      starter: 'function grade(score) {\n  // your code here\n}\n',
      solution: 'function grade(score) {\n  if (score >= 50) {\n    return "pass";\n  } else {\n    return "fail";\n  }\n}',
      checks: [
        { call: 'grade(70)', expect: 'pass' },
        { call: 'grade(50)', expect: 'pass' },
        { call: 'grade(49)', expect: 'fail' },
      ],
      explain: '>= includes 50 itself. Test the edge: 50 must pass and 49 must fail.',
      tip: { kind: 'eliminate', text: 'Always test the boundary value. Most bugs live right at the edge.' },
    }),
    code('cs3-if-2', 'Write canVote(age): true if age is 18 or more, else false.', {
      starter: 'function canVote(age) {\n  \n}\n',
      solution: 'function canVote(age) {\n  return age >= 18;\n}',
      checks: [
        { call: 'canVote(18)', expect: true },
        { call: 'canVote(17)', expect: false },
        { call: 'canVote(40)', expect: true },
      ],
      explain: 'age >= 18 is already true or false, so you can return it directly.',
      tip: { kind: 'shortcut', text: 'if (x) { return true } else { return false } is just return x.' },
    }),
    mc('cs3-if-3', 'What is "5" === 5?', ['true', 'false', 'An error', '"5"'], 1, '=== checks type too: a string is not a number.'),
    tf('cs3-if-4', 'true && false is true.', false, '&& needs both sides true.'),
  ],
};

const loops: Lesson = {
  id: 'cs3-loops',
  title: 'Loops',
  icon: '🔁',
  teach: [
    teach('cs3-loops-t1', 'zara', 'Repeat without copying', [
      'for (let i = 1; i <= 5; i++) { … } runs with i = 1, 2, 3, 4, 5.',
      'The three parts: start (let i = 1), keep going while (i <= 5), step (i++ adds 1).',
      'while (condition) { … } repeats as long as the condition is true. Make sure it eventually becomes false.',
    ], { hook: { kind: 'memory', text: 'An accumulator pattern: start a total at 0, add to it inside the loop, use it after.' } }),
  ],
  exercises: [
    code('cs3-loops-1', 'Print the numbers 1 to 5, one per line, using a for loop.', { starter: '// for (let i = ...\n', solution: 'for (let i = 1; i <= 5; i++) {\n  console.log(i);\n}', output: ['1', '2', '3', '4', '5'], explain: 'Start at 1, keep going while i <= 5, add 1 each time.' }),
    code('cs3-loops-2', 'Write sumTo(n): add up every whole number from 1 to n.', {
      starter: 'function sumTo(n) {\n  let total = 0;\n  // loop and add\n  return total;\n}\n',
      solution: 'function sumTo(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}',
      checks: [
        { call: 'sumTo(100)', expect: 5050 },
        { call: 'sumTo(1)', expect: 1 },
        { call: 'sumTo(0)', expect: 0 },
      ],
      explain: 'The accumulator total grows by i on every pass. 1 + 2 + … + 100 = 5050.',
      tip: { kind: 'formula', text: 'Gauss: 1 + 2 + … + n = n(n + 1) / 2. Loops and formulas should agree; use one to check the other.' },
    }),
    mc('cs3-loops-3', 'How many times does for (let i = 0; i < 3; i++) run?', ['2', '3', '4', 'Forever'], 1, 'i = 0, 1, 2. At 3 the condition i < 3 is false.'),
  ],
};

/* Unit 4: Functions, arrays and objects */

const functions: Lesson = {
  id: 'cs4-functions',
  title: 'Functions',
  icon: '🧩',
  teach: [
    teach('cs4-fn-t1', 'zara', 'Name a job once, use it forever', [
      'function square(n) { return n * n; } defines a function with one parameter, n.',
      'square(4) calls it with 4 and gives back 16.',
      'return sends a value back and ends the function. Without return, you get undefined.',
      'Good functions do one job and have a clear name.',
    ]),
  ],
  exercises: [
    code('cs4-fn-1', 'Write square(n) that returns n times n.', {
      starter: 'function square(n) {\n  \n}\n',
      solution: 'function square(n) {\n  return n * n;\n}',
      checks: [
        { call: 'square(4)', expect: 16 },
        { call: 'square(-3)', expect: 9 },
        { call: 'square(0)', expect: 0 },
      ],
      explain: 'return n * n; sends the result back to whoever called the function.',
    }),
    code('cs4-fn-2', 'Write max2(a, b) that returns the bigger number (without Math.max).', {
      starter: 'function max2(a, b) {\n  \n}\n',
      solution: 'function max2(a, b) {\n  if (a > b) {\n    return a;\n  }\n  return b;\n}',
      checks: [
        { call: 'max2(3, 7)', expect: 7 },
        { call: 'max2(9, 2)', expect: 9 },
        { call: 'max2(5, 5)', expect: 5 },
      ],
      explain: 'If a is bigger return it; otherwise b is at least as big. Equal values work either way.',
    }),
    tf('cs4-fn-3', 'A function without a return statement gives back undefined.', true, 'No return means the result is undefined.'),
  ],
};

const arrays: Lesson = {
  id: 'cs4-arrays',
  title: 'Arrays',
  icon: '📚',
  teach: [
    teach('cs4-arr-t1', 'zara', 'Lists of values', [
      'const scores = [70, 85, 60]; is an array.',
      'Positions start at 0: scores[0] is 70, scores[2] is 60.',
      'scores.length is 3. scores.push(90) adds to the end.',
      'for (const s of scores) { … } visits each value.',
    ], { hook: { kind: 'memory', text: 'Off-by-one: the last item is at length − 1, not length.' } }),
  ],
  exercises: [
    code('cs4-arr-1', 'Write total(nums): the sum of all numbers in the array.', {
      starter: 'function total(nums) {\n  \n}\n',
      solution: 'function total(nums) {\n  let sum = 0;\n  for (const n of nums) {\n    sum += n;\n  }\n  return sum;\n}',
      checks: [
        { call: 'total([1, 2, 3])', expect: 6 },
        { call: 'total([])', expect: 0 },
        { call: 'total([10, -4])', expect: 6 },
      ],
      explain: 'Accumulator again: start at 0, add every value.',
    }),
    code('cs4-arr-2', 'Write largest(nums): the biggest number in a non-empty array.', {
      starter: 'function largest(nums) {\n  \n}\n',
      solution: 'function largest(nums) {\n  let best = nums[0];\n  for (const n of nums) {\n    if (n > best) {\n      best = n;\n    }\n  }\n  return best;\n}',
      checks: [
        { call: 'largest([3, 9, 2])', expect: 9 },
        { call: 'largest([-5, -1, -7])', expect: -1 },
        { call: 'largest([4])', expect: 4 },
      ],
      explain: 'Start with the first item, not 0, or all-negative arrays break.',
      tip: { kind: 'eliminate', text: 'Starting best at 0 fails for [-5, -1, -7]. Test negative numbers.' },
    }),
    mc('cs4-arr-3', 'const a = [4, 8, 15]. What is a[1]?', ['4', '8', '15', 'undefined'], 1, 'Indexes start at 0, so a[1] is the second item.'),
  ],
};

const objects: Lesson = {
  id: 'cs4-objects',
  title: 'Objects',
  icon: '🗂️',
  teach: [
    teach('cs4-obj-t1', 'zara', 'Things with named properties', [
      'const student = { name: "Vin", score: 280 }; groups related values.',
      'Read a property with a dot: student.score is 280.',
      'Arrays of objects are how real apps store data: a list of students, transactions, lessons.',
    ]),
  ],
  exercises: [
    code('cs4-obj-1', 'Write fullName(person) that returns first and last name with a space.', {
      starter: 'function fullName(person) {\n  \n}\n',
      solution: 'function fullName(person) {\n  return person.first + " " + person.last;\n}',
      checks: [
        { call: 'fullName({ first: "Ada", last: "Obi" })', expect: 'Ada Obi' },
        { call: 'fullName({ first: "Mei", last: "Lin" })', expect: 'Mei Lin' },
      ],
      explain: 'person.first and person.last joined with a space in between.',
    }),
    code('cs4-obj-2', 'Make a const student with name "Vin" and score 280. Print the score.', {
      starter: '// const student = { ... }\n',
      solution: 'const student = { name: "Vin", score: 280 };\nconsole.log(student.score);',
      output: ['280'],
      checks: [{ call: 'student.name', expect: 'Vin' }],
      explain: 'Curly braces create the object; student.score reads one property.',
    }),
    mc('cs4-obj-3', 'How do you read the score property of student?', ['student.score', 'score.student', 'student->score', 'student(score)'], 0, 'Dot notation: object.property. student["score"] also works.'),
  ],
};

/* Unit 5: Problem solving and algorithms */

const problemSolving: Lesson = {
  id: 'cs5-solving',
  title: 'Thinking like an engineer',
  icon: '🧠',
  teach: [
    teach('cs5-solve-t1', 'zara', 'Solve the problem before writing code', [
      '1. Understand: restate the problem and work one example by hand.',
      '2. Break it down into small steps (decomposition).',
      '3. Write the steps in plain words first (pseudocode).',
      '4. Code one step at a time and run it often.',
      '5. Test normal cases and edge cases: empty input, zero, negatives, one item.',
    ], { hook: { kind: 'memory', text: 'Engineers are not people who never get errors. They are people who read errors calmly.' } }),
  ],
  exercises: [
    order('cs5-solve-1', 'Order the problem-solving steps', ['Understand the problem', 'Break it into steps', 'Write pseudocode', 'Code and run often', 'Test edge cases'], 'Thinking first saves hours of debugging.'),
    code('cs5-solve-2', 'Write isEven(n): true if n is even.', {
      starter: 'function isEven(n) {\n  \n}\n',
      solution: 'function isEven(n) {\n  return n % 2 === 0;\n}',
      checks: [
        { call: 'isEven(4)', expect: true },
        { call: 'isEven(7)', expect: false },
        { call: 'isEven(0)', expect: true },
      ],
      explain: 'Even numbers leave no remainder when divided by 2.',
    }),
    code('cs5-solve-3', 'Write reverse(text): the text backwards.', {
      starter: 'function reverse(text) {\n  \n}\n',
      solution: 'function reverse(text) {\n  return text.split("").reverse().join("");\n}',
      checks: [
        { call: 'reverse("code")', expect: 'edoc' },
        { call: 'reverse("")', expect: '' },
      ],
      explain: 'split("") makes an array of letters, reverse() flips it, join("") glues it back.',
    }),
    code('cs5-solve-4', 'Write countVowels(text): how many a, e, i, o, u it contains (any case).', {
      starter: 'function countVowels(text) {\n  \n}\n',
      solution: 'function countVowels(text) {\n  let count = 0;\n  for (const ch of text.toLowerCase()) {\n    if ("aeiou".includes(ch)) {\n      count++;\n    }\n  }\n  return count;\n}',
      checks: [
        { call: 'countVowels("Lagos")', expect: 2 },
        { call: 'countVowels("JAMB")', expect: 1 },
        { call: 'countVowels("rhythm")', expect: 0 },
      ],
      explain: 'Lower-case first so "A" counts, then check each character.',
    }),
  ],
};

const searching: Lesson = {
  id: 'cs5-search',
  title: 'Searching & speed (Big O)',
  icon: '🔎',
  teach: [
    teach('cs5-search-t1', 'zara', 'How fast does it grow?', [
      'Linear search checks items one by one: up to n steps for n items. That is O(n).',
      'Binary search on a SORTED list halves the range each step: about log₂(n) steps. That is O(log n).',
      'For 1,000,000 items: linear search may need 1,000,000 checks; binary search needs about 20.',
      'Big O describes how work grows with input size, not exact time.',
    ], { hook: { kind: 'memory', text: 'Binary search is how you find a word in a dictionary: open the middle, then throw away half.' } }),
  ],
  exercises: [
    code('cs5-search-1', 'Write linearSearch(arr, target): the index of target, or -1 if absent.', {
      starter: 'function linearSearch(arr, target) {\n  \n}\n',
      solution: 'function linearSearch(arr, target) {\n  for (let i = 0; i < arr.length; i++) {\n    if (arr[i] === target) {\n      return i;\n    }\n  }\n  return -1;\n}',
      checks: [
        { call: 'linearSearch([5, 8, 2], 2)', expect: 2 },
        { call: 'linearSearch([5, 8, 2], 7)', expect: -1 },
        { call: 'linearSearch([], 1)', expect: -1 },
      ],
      explain: 'Check each index; return as soon as it matches; only after the loop do you know it is missing.',
    }),
    mc('cs5-search-2', 'Binary search only works when the list is…', ['short', 'sorted', 'numbers only', 'unique'], 1, 'It relies on order to throw away half the list each step.'),
    mc('cs5-search-3', 'About how many steps does binary search need for 1,000,000 sorted items?', ['20', '1000', '500,000', '1,000,000'], 0, '2²⁰ ≈ 1,000,000, so about 20 halvings.', { kind: 'shortcut', text: 'Every 10 halvings divides by about 1000 (2¹⁰ = 1024).' }),
    tf('cs5-search-4', 'O(n) means the work grows in proportion to the input size.', true, 'Double the input, roughly double the work.'),
  ],
};

export const CODING: Course = {
  id: 'coding',
  title: 'Coding',
  icon: '💻',
  units: [
    { id: 'cs-u1', title: 'How computers work', description: 'Programs, hardware, binary and data', who: 'zara', color: '#ff7a45', lessons: [whatIsProgram, binary] },
    { id: 'cs-u2', title: 'JavaScript first steps', description: 'Printing, variables, types, operators', who: 'zara', color: '#f5b938', lessons: [firstCode, variables, operators] },
    { id: 'cs-u3', title: 'Decisions & loops', description: 'if / else, comparisons, for and while', who: 'zara', color: '#2fd27a', lessons: [conditions, loops] },
    { id: 'cs-u4', title: 'Functions, arrays & objects', description: 'Reusable code and real data', who: 'zara', color: '#4ea4ff', lessons: [functions, arrays, objects] },
    { id: 'cs-u5', title: 'Problem solving & algorithms', description: 'Engineer thinking, searching, Big O', who: 'greta', color: '#a78bfa', lessons: [problemSolving, searching] },
  ],
  upcoming: ['Strings & array methods (map, filter, reduce)', 'Recursion', 'Sorting algorithms', 'Data structures: stacks, queues, maps', 'HTML & CSS', 'The DOM & events', 'Git & GitHub', 'React', 'APIs & async', 'Databases & SQL', 'Node.js backends', 'Security & testing'],
};
