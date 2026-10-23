import type { Check } from '../../code/runner';
import type { CodeEx, Tip, Unit } from '../types';
import { mc, order, teach, tf } from '../util';

function code(id: string, prompt: string, spec: { starter: string; solution: string; output?: string[]; checks?: Check[]; explain: string; tip?: Tip }): CodeEx {
  return { kind: 'code', id, prompt, ...spec };
}

export const CODING_MORE: Unit[] = [
  {
    id: 'cs-u6',
    title: 'Array methods, recursion & sorting',
    description: 'map, filter, reduce, functions that call themselves, putting things in order',
    who: 'zara',
    color: '#f472b6',
    lessons: [
      {
        id: 'cs6-map-filter',
        title: 'map & filter',
        icon: '🪄',
        teach: [
          teach('cs6-mf-t1', 'zara', 'Transform and select without writing loops', [
            'Arrow functions are a short way to write a function: (n) => n * 2 means "take n, give back n × 2".',
            'map builds a NEW array by changing every item: [1, 2, 3].map((n) => n * 2) gives [2, 4, 6].',
            'filter builds a NEW array keeping only items that pass a test: [1, 2, 3, 4].filter((n) => n % 2 === 0) gives [2, 4].',
            'Neither changes the original array.',
          ], { hook: { kind: 'memory', text: 'map = same number of items, changed. filter = fewer items, unchanged.' } }),
        ],
        exercises: [
          code('cs6-mf-1', 'Write doubleAll(nums) that returns a new array with every number doubled. Use map.', {
            starter: 'function doubleAll(nums) {\n  \n}\n',
            solution: 'function doubleAll(nums) {\n  return nums.map((n) => n * 2);\n}',
            checks: [
              { call: 'doubleAll([1, 2, 3])', expect: [2, 4, 6] },
              { call: 'doubleAll([])', expect: [] },
            ],
            explain: 'map runs the arrow function on every item and collects the results.',
          }),
          code('cs6-mf-2', 'Write evens(nums) that keeps only the even numbers. Use filter.', {
            starter: 'function evens(nums) {\n  \n}\n',
            solution: 'function evens(nums) {\n  return nums.filter((n) => n % 2 === 0);\n}',
            checks: [
              { call: 'evens([1, 2, 3, 4, 6])', expect: [2, 4, 6] },
              { call: 'evens([1, 3])', expect: [] },
            ],
            explain: 'filter keeps the items where the test returns true.',
          }),
          mc('cs6-mf-3', 'What does [5, 10, 15].map((n) => n / 5) return?', ['[5, 10, 15]', '[1, 2, 3]', '30', '[1]'], 1, 'map divides every item by 5.'),
          tf('cs6-mf-4', 'filter changes the original array.', false, 'It returns a new array; the original is untouched.'),
        ],
      },
      {
        id: 'cs6-reduce',
        title: 'reduce',
        icon: '🧺',
        teach: [
          teach('cs6-red-t1', 'zara', 'Boil a list down to one value', [
            'reduce walks through the array carrying a running result, called the accumulator.',
            '[1, 2, 3].reduce((total, n) => total + n, 0) starts total at 0, then adds each n: 6.',
            'The last argument (0 here) is the starting value. Always give one.',
          ], { example: ['Start: total = 0', 'n = 1 → total = 1', 'n = 2 → total = 3', 'n = 3 → total = 6'] }),
        ],
        exercises: [
          code('cs6-red-1', 'Write sum(nums) using reduce.', {
            starter: 'function sum(nums) {\n  \n}\n',
            solution: 'function sum(nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}',
            checks: [
              { call: 'sum([1, 2, 3, 4])', expect: 10 },
              { call: 'sum([])', expect: 0 },
            ],
            explain: 'Start at 0 and add each number to the running total.',
          }),
          code('cs6-red-2', 'Write average(nums) for a non-empty array: the total divided by how many there are.', {
            starter: 'function average(nums) {\n  \n}\n',
            solution: 'function average(nums) {\n  const total = nums.reduce((t, n) => t + n, 0);\n  return total / nums.length;\n}',
            checks: [
              { call: 'average([70, 80, 90])', expect: 80 },
              { call: 'average([5])', expect: 5 },
            ],
            explain: 'Reuse the sum pattern, then divide by length.',
          }),
          mc('cs6-red-3', 'In reduce((acc, n) => acc + n, 0), what is 0?', ['The last item', 'The starting value of acc', 'The index', 'An error'], 1, 'It is the initial value of the accumulator.'),
        ],
      },
      {
        id: 'cs6-recursion',
        title: 'Recursion',
        icon: '🪞',
        teach: [
          teach('cs6-rec-t1', 'zara', 'A function that calls itself', [
            'A recursive function solves a big problem by solving a smaller copy of the same problem.',
            'It needs a base case: a simple input it answers directly, so it stops.',
            'factorial(n) = n × factorial(n − 1), and factorial(0) = 1 is the base case.',
            'Forget the base case and it never stops (the app will stop it after 2 seconds).',
          ], { example: ['factorial(3) = 3 × factorial(2)', '            = 3 × 2 × factorial(1)', '            = 3 × 2 × 1 × factorial(0) = 6'], hook: { kind: 'memory', text: 'Russian dolls: open one, there is a smaller one inside, until the smallest that does not open. That is the base case.' } }),
        ],
        exercises: [
          code('cs6-rec-1', 'Write factorial(n) recursively. factorial(0) is 1.', {
            starter: 'function factorial(n) {\n  // base case first\n}\n',
            solution: 'function factorial(n) {\n  if (n === 0) {\n    return 1;\n  }\n  return n * factorial(n - 1);\n}',
            checks: [
              { call: 'factorial(0)', expect: 1 },
              { call: 'factorial(5)', expect: 120 },
            ],
            explain: 'Base case 0 returns 1; every other n multiplies by the factorial of n − 1.',
          }),
          code('cs6-rec-2', 'Write countdown(n) that prints n, n − 1, … down to 1 using recursion. Call countdown(3) after it.', {
            starter: 'function countdown(n) {\n  \n}\n\ncountdown(3);\n',
            solution: 'function countdown(n) {\n  if (n === 0) {\n    return;\n  }\n  console.log(n);\n  countdown(n - 1);\n}\n\ncountdown(3);',
            output: ['3', '2', '1'],
            explain: 'Print, then hand the smaller problem to the same function. Stop at 0.',
          }),
          mc('cs6-rec-3', 'What happens if a recursive function has no base case?', ['It returns 0', 'It never stops', 'It runs once', 'It sorts the array'], 1, 'Without a base case it keeps calling itself forever.'),
        ],
      },
      {
        id: 'cs6-sorting',
        title: 'Sorting',
        icon: '📊',
        teach: [
          teach('cs6-sort-t1', 'zara', 'Putting things in order', [
            'Bubble sort: compare neighbours and swap if they are in the wrong order; repeat until no swaps. Simple but slow, O(n²).',
            'Real programs use faster sorts like merge sort, O(n log n).',
            'In JavaScript, nums.sort((a, b) => a - b) sorts numbers from smallest to biggest.',
            'Warning: without the (a, b) => a - b part, sort compares as TEXT: [10, 9, 1].sort() gives [1, 10, 9].',
          ], { hook: { kind: 'eliminate', text: 'If a sorted list of numbers looks "almost right", suspect a missing compare function.' } }),
        ],
        exercises: [
          code('cs6-sort-1', 'Write sortNumbers(nums) that returns the numbers from smallest to biggest.', {
            starter: 'function sortNumbers(nums) {\n  \n}\n',
            solution: 'function sortNumbers(nums) {\n  return [...nums].sort((a, b) => a - b);\n}',
            checks: [
              { call: 'sortNumbers([10, 9, 1, 25])', expect: [1, 9, 10, 25] },
              { call: 'sortNumbers([3, -2, 0])', expect: [-2, 0, 3] },
            ],
            explain: '[...nums] copies the array so the original is not changed; a - b sorts numerically.',
          }),
          mc('cs6-sort-2', 'What does [10, 9, 1].sort() give in JavaScript?', ['[1, 9, 10]', '[1, 10, 9]', '[10, 9, 1]', '[9, 10, 1]'], 1, 'Without a compare function, items are compared as text: "1" < "10" < "9".'),
          order('cs6-sort-3', 'One pass of bubble sort on [3, 1, 2]: order the steps', ['Compare 3 and 1, swap → [1, 3, 2]', 'Compare 3 and 2, swap → [1, 2, 3]', 'Next pass: no swaps, so it is sorted'], 'Neighbours are compared left to right; big values "bubble" to the end.'),
          mc('cs6-sort-4', 'Bubble sort is…', ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], 3, 'Nested passes over the list: about n × n comparisons.'),
        ],
      },
    ],
  },
];
