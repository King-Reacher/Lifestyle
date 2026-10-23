# Ledger (working name)

A private Telegram mini app: one ledger of your life, plus JAMB and Academy lessons, money discipline and streaks, all built on top of it. No AI, no server, and your data stays on your phone.

## Build plan

1. **Mini app shell, private access, ledger** ✅
2. **JAMB lesson engine (Duolingo-style), starting with Maths from the foundations** ✅
3. Physics, Chemistry, English and Biology tracks
4. Money discipline with a strict savings streak
5. Academy schools and "what should I do?" guides
6. Mock exams and Post-UTME mode

## What step 1 does

- **Ledger:** log what you did, studied, earned, spent, decided, felt and learned, each tagged by area of life.
- **Memory:** search everything you've logged. When you log a decision or a spend, it shows "Last time…" with similar past entries and how they turned out.
- **Asks you questions:** "How did this decision turn out?" after 2 days, a check-in after a rough day, and an evening nudge if you haven't logged anything.
- **Daily streak:** for logging at least one thing a day.
- **Private:** only your Telegram account can open it. Data is saved on your device (Telegram DeviceStorage plus local storage). You can back it up by copying it into your Saved Messages and restore it by pasting it back.

## What step 2 does

- **Learn tab** with a Duolingo-style path. Lessons unlock strictly in order, and the current one pulses with START.
- **Lessons:** teaching cards (understand → memory hook) followed by exercises: tap the answer, a number keypad (accepts fractions like `3/4`, mixed numbers like `1 1/2`, and decimals), true/false, tap tiles into order, and match pairs.
- **5 hearts:** a wrong answer costs one and the question comes back at the end of the lesson. Lose all five and you retry.
- **XP and daily goal:** 10 XP a lesson, plus 5 for a perfect one. The daily goal is 30 XP, and there's a study streak.
- **Spaced repetition:** every missed question goes into review the next day, then after 2, 4, 7 and 15 days, until it's retired. Getting it wrong sends it back to the start.
- **Ledger link:** every finished lesson is logged as a study entry automatically.
- **Maths, from the foundations (16 lessons):**
  - *Number foundations:* types of numbers, negatives, signs, BODMAS, factors and primes, HCF and LCM.
  - *Fractions, decimals and percentages:* equivalence, adding, multiplying and dividing (KCF), decimals, percentages, percentage change.
  - *Speed maths:* × 5/25/50, × 11, squares ending in 5, estimate and eliminate.
- **Generated numbers:** most questions are generated, so every replay has new numbers. Tests check 200 versions of every lesson, confirming each question is well formed and accepts its own answer.
- **Cast:** Mei (Maths, China), Prof. Greta (science, Germany), Maddie (English, USA), Priya (Biology, India), Mama Ada, Tunde, Zara and Blaze.

## Put it on Telegram

1. **Create the bot.** In Telegram, open [@BotFather](https://t.me/BotFather) and send `/newbot`.
2. **Host the app** (free, on GitHub Pages):
   - Repo → Settings → Pages → Source: **GitHub Actions**.
   - Repo → Settings → Secrets and variables → Actions → **Variables** → add `OWNER_ID` (you get the number in step 4).
   - Merge to `main`. The workflow tests, builds and deploys the app to `https://<user>.github.io/<repo>/`.
   - GitHub Pages on a private repo needs a paid GitHub plan. Netlify or Vercel work for free: build with `npm run build`, publish `dist/`, and set the `VITE_OWNER_ID` environment variable.
3. **Connect the bot to the app.** In BotFather, run `/mybots` → your bot → Bot Settings → **Menu Button** → paste the app URL.
4. **Lock it to you.** Open the bot and tap the menu button. The app shows your Telegram ID. Put that number into `OWNER_ID`, re-run the deploy, and from then on it only opens for you.

## Develop

```bash
npm install
npm run dev     # opens in the browser on localhost, where the Telegram check is skipped
npm test
npm run build
```

To rename the app, change `APP_NAME` in `src/config.ts` and the `<title>` in `index.html`.
