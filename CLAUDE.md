# Project rules

Private Telegram mini app (Vite, React, TypeScript). No backend and no AI at runtime. Data lives on the device.

## Writing style in code

- No em dashes or en dashes anywhere in source, comments, UI text or docs. Use a comma, colon, full stop or the word "to".
- Straight quotes only (' and "), never curly ones. If a string needs an apostrophe, wrap it in double quotes.
- No decorative divider comments (a comment opener followed by a row of `=` or `-` characters). A plain `/* Section name */` is fine.
- Comments explain why, not what. Skip comments that restate the code.
- The Unicode minus sign (−) in maths content is intentional and allowed.

`npm run lint` enforces the first three rules and runs in CI before deploy. `npm run style:fix` repairs dashes and quotes automatically.

## Before committing

```bash
npm run lint
npm test
npm run build
```

## Content

- Lessons live in `src/learn/courses/` (one file per subject). Generated questions must stay correct for every seed; `src/learn/learn.test.ts` checks 200 seeds per lesson.
- Coding lessons live in `src/learn/courses/coding.ts`. Every code exercise needs a starter that fails and a solution that passes its checks; `src/code/code.test.ts` enforces both and replays the ghost-text guide.
- Characters are original. Do not copy existing anime or cartoon characters or their artwork into the app.
