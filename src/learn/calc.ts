/**
 * A small calculator for the notebook. It understands the way lessons write
 * maths: × ÷ − ² ³ √ π, fractions, brackets and powers. No eval, so anything
 * it does not understand is simply "not a calculation".
 */

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-' };

function tokenize(src: string): string[] | null {
  const s = src
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻]+/g, (m) => `^(${[...m].map((c) => SUP[c]).join('')})`)
    .replace(/[\u2212\u2013]/g, '-')
    .replace(/[×*·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/,(?=\d{3}\b)/g, '')
    .replace(/½/g, '(1/2)')
    .replace(/⅓/g, '(1/3)');
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') {
      i++;
      continue;
    }
    const num = s.slice(i).match(/^\d+(\.\d+)?|^\.\d+/);
    if (num) {
      out.push(num[0]);
      i += num[0].length;
      continue;
    }
    if ('+-*/^()√π%'.includes(c)) {
      out.push(c);
      i++;
      continue;
    }
    return null;
  }
  return out;
}

/** Evaluates an arithmetic expression, or returns null if it is not one. */
export function calculate(src: string): number | null {
  const t = tokenize(src);
  if (!t || !t.length) return null;
  let p = 0;
  const peek = () => t[p];
  const take = () => t[p++];

  const primary = (): number => {
    const tok = take();
    if (tok === undefined) throw new Error('end');
    if (tok === '(') {
      const v = expr();
      if (take() !== ')') throw new Error('bracket');
      return v;
    }
    if (tok === '√') return Math.sqrt(factor());
    if (tok === 'π') return Math.PI;
    if (/^[\d.]/.test(tok)) return Number(tok);
    throw new Error(tok);
  };
  // A number directly before a bracket, √ or π multiplies it: 2(3 + 1), 2√3, 2π.
  const implicit = () => peek() === '(' || peek() === '√' || peek() === 'π';
  const postfix = (): number => {
    let v = primary();
    while (peek() === '%') {
      take();
      v /= 100;
    }
    return v;
  };
  const power = (): number => {
    const base = postfix();
    if (peek() === '^') {
      take();
      return base ** factor();
    }
    return base;
  };
  const factor = (): number => {
    if (peek() === '-') {
      take();
      return -factor();
    }
    if (peek() === '+') {
      take();
      return factor();
    }
    return power();
  };
  const term = (): number => {
    let v = factor();
    for (;;) {
      if (peek() === '*') (take(), (v *= factor()));
      else if (peek() === '/') (take(), (v /= factor()));
      else if (implicit()) v *= factor();
      else return v;
    }
  };
  const expr = (): number => {
    let v = term();
    for (;;) {
      if (peek() === '+') (take(), (v += term()));
      else if (peek() === '-') (take(), (v -= term()));
      else return v;
    }
  };

  try {
    const v = expr();
    if (p !== t.length || !Number.isFinite(v)) return null;
    return v;
  } catch {
    return null;
  }
}

export const close = (a: number, b: number) => Math.abs(a - b) <= 1e-9 + 1e-6 * Math.max(Math.abs(a), Math.abs(b));

/** Shows a result without float noise, plus a simple fraction when that is clearer. */
export function show(v: number): string {
  const r = String(Number(v.toFixed(8)));
  if (Number.isInteger(v)) return r;
  for (let d = 2; d <= 64; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9) return `${r}  (${n < 0 ? '−' : ''}${Math.abs(n)}/${d})`;
  }
  return r;
}

export interface LineResult {
  /** "value" shows what the line works out to; "check" says whether both sides of = agree. */
  kind: 'value' | 'check' | 'note';
  text: string;
  ok?: boolean;
}

/** What the notebook shows next to one line of rough work. */
export function checkLine(line: string): LineResult {
  const trimmed = line.trim();
  if (!trimmed) return { kind: 'note', text: '' };
  const sides = trimmed.split('=').map((s) => s.trim());
  if (sides.length > 1 && sides.every(Boolean)) {
    const values = sides.map(calculate);
    if (values.every((v): v is number => v !== null)) {
      const bad = values.findIndex((v, i) => i > 0 && !close(v, values[i - 1]));
      if (bad < 0) return { kind: 'check', ok: true, text: '✓ correct' };
      return { kind: 'check', ok: false, text: `✗ ${sides[bad - 1]} is ${show(values[bad - 1])}, not ${sides[bad]}` };
    }
    return { kind: 'note', text: '' };
  }
  const expr = trimmed.replace(/=\s*$/, '');
  const v = calculate(expr);
  return v === null || /^-?[\d.]+$/.test(expr.replace(/[\u2212\u2013]/g, '-')) ? { kind: 'note', text: '' } : { kind: 'value', text: `= ${show(v)}` };
}
