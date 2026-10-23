#!/usr/bin/env node
// Fails when source files contain typographic dashes, curly quotes or
// decorative comment dividers. Run with --fix to replace the characters
// automatically (dividers and wording still need a human).
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const ROOTS = ['src', 'scripts', 'index.html', 'README.md', 'CLAUDE.md', '.github'];
const EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.css', '.html', '.md', '.yml', '.json']);

const RULES = [
  { name: 'em dash', re: /\u2014/g, fix: (s) => s.replace(/ \u2014 /g, ', ').replace(/\u2014/g, '-') },
  { name: 'en dash', re: /\u2013/g, fix: (s) => s.replace(/\u2013/g, '-') },
  { name: 'curly quote', re: /[\u2018\u2019\u201c\u201d]/g, fix: (s) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"') },
  { name: 'divider comment', re: /(\/\*|\/\/|<!--)\s*[-=*#]{3,}/g },
];

function files(path) {
  let st;
  try {
    st = statSync(path);
  } catch {
    return [];
  }
  if (st.isDirectory()) return readdirSync(path).flatMap((f) => files(join(path, f)));
  return EXTS.has(extname(path)) ? [path] : [];
}

const fix = process.argv.includes('--fix');
let problems = 0;

for (const file of ROOTS.flatMap(files)) {
  let text = readFileSync(file, 'utf8');
  if (fix) {
    const fixed = RULES.reduce((s, r) => (r.fix ? r.fix(s) : s), text);
    if (fixed !== text) {
      writeFileSync(file, fixed);
      console.log(`fixed ${file}`);
      text = fixed;
    }
  }
  text.split('\n').forEach((line, i) => {
    for (const r of RULES) {
      if (line.match(r.re)) {
        problems++;
        console.log(`${file}:${i + 1}: ${r.name}: ${line.trim().slice(0, 100)}`);
      }
    }
  });
}

if (problems) {
  console.log(`\n${problems} style problem(s). Run "npm run style:fix" for dashes and quotes; rewrite dividers by hand.`);
  process.exit(1);
}
console.log('Style check passed: no em/en dashes, curly quotes or divider comments.');
