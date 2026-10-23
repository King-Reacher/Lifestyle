/**
 * Ghost-text suggestions without AI. In a lesson the model solution guides you
 * line by line; anywhere else, keywords, snippets, common APIs and names you
 * already wrote are completed.
 */

const SNIPPETS: Record<string, string> = {
  for: 'for (let i = 0; i < 10; i++) {',
  while: 'while () {',
  if: 'if () {',
  else: 'else {',
  function: 'function name() {',
  return: 'return ',
  const: 'const ',
  let: 'let ',
  console: 'console.log(',
  log: 'console.log(',
};

const WORDS = [
  'console.log(',
  'const ',
  'let ',
  'function ',
  'return ',
  'for (',
  'while (',
  'if (',
  'else ',
  'true',
  'false',
  'null',
  'undefined',
  'typeof ',
  'Math.floor(',
  'Math.ceil(',
  'Math.round(',
  'Math.max(',
  'Math.min(',
  'Math.random()',
  'Math.sqrt(',
  'Math.abs(',
  'Number(',
  'String(',
  'Array.isArray(',
  'Object.keys(',
  'JSON.stringify(',
  'break;',
  'continue;',
];

const METHODS = ['length', 'push(', 'pop()', 'includes(', 'indexOf(', 'slice(', 'split(', 'join(', 'map(', 'filter(', 'reduce(', 'forEach(', 'toUpperCase()', 'toLowerCase()', 'trim()', 'reverse()', 'sort('];

/** Index in `solution` reached after matching the typed text, ignoring whitespace differences. */
function guidedIndex(typed: string, solution: string): number | null {
  let s = 0;
  for (const ch of typed) {
    if (/\s/.test(ch)) continue;
    while (s < solution.length && /\s/.test(solution[s])) s++;
    if (solution[s] !== ch) return null;
    s++;
  }
  if (/\s$/.test(typed)) while (s < solution.length && solution[s] === ' ') s++;
  return s;
}

/** Ghost text to show after the caret, or an empty string. */
export function suggest(code: string, caret: number, solution?: string): string {
  const before = code.slice(0, caret);
  const after = code.slice(caret);
  // Only suggest at the end of a line, so the ghost never covers what you wrote.
  if (after.split('\n')[0].trim() !== '') return '';

  if (solution) {
    // Hint comments from the starter code shouldn't stop the guide.
    const i = guidedIndex(before.replace(/\/\/[^\n]*/g, ''), solution);
    if (i !== null && i < solution.length) {
      // Typed up to a line break: show the next line, minus any indentation already typed.
      let rest = solution.slice(i);
      const lineStart = before.slice(before.lastIndexOf('\n') + 1);
      if (rest.startsWith('\n') && lineStart.trim() === '') rest = rest.slice(1).trimStart();
      const line = rest.split('\n')[0];
      if (line) return line;
    }
  }

  const member = before.match(/\.([A-Za-z]*)$/);
  if (member) {
    const m = METHODS.find((x) => x.startsWith(member[1]) && x.length > member[1].length);
    return m ? m.slice(member[1].length) : '';
  }

  const word = before.match(/[A-Za-z_$][\w$]*$/)?.[0] ?? '';
  if (word.length < 2) return '';
  if (SNIPPETS[word] && !before.endsWith(SNIPPETS[word])) {
    const s = SNIPPETS[word];
    if (s.startsWith(word)) return s.slice(word.length);
  }
  const names = [...new Set(code.match(/[A-Za-z_$][\w$]{2,}/g) ?? [])].filter((n) => n !== word);
  const candidate = [...WORDS, ...names].find((w) => w.startsWith(word) && w.length > word.length);
  return candidate ? candidate.slice(word.length) : '';
}

const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'true', 'false', 'null', 'undefined', 'new', 'typeof', 'of', 'in', 'class', 'this', 'switch', 'case', 'default']);

export type Token = { text: string; kind: 'kw' | 'str' | 'num' | 'com' | 'fn' | 'plain' };

/** A small tokenizer for syntax colouring. */
export function tokenize(code: string): Token[] {
  const re = /(\/\/[^\n]*)|('(?:[^'\\\n]|\\.)*'?|"(?:[^"\\\n]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g;
  const out: Token[] = [];
  let last = 0;
  for (const m of code.matchAll(re)) {
    if (m.index! > last) out.push({ text: code.slice(last, m.index), kind: 'plain' });
    const [text, com, str, num, fn, word] = m;
    out.push({ text, kind: com ? 'com' : str ? 'str' : num ? 'num' : fn && !KEYWORDS.has(fn) ? 'fn' : (fn || word) && KEYWORDS.has(fn || word) ? 'kw' : 'plain' });
    last = m.index! + text.length;
  }
  if (last < code.length) out.push({ text: code.slice(last), kind: 'plain' });
  return out;
}
