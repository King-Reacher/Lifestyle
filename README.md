# DIOX LIFE OS

**Discipline. Direction. Decisions. Execution.**

A private, mobile-first life operating system: it plans your day, trains your judgment, tracks habits and money, and helps you recover when you fall behind. It installs to your Android home screen as a PWA and keeps all data on your device.

## What's in v0.1

| Area | What it does |
| --- | --- |
| **Today** | Accountability score, "right now" task with focus timer, today's 3 outcomes, habit check-ins, *what needs to change*, day capacity, evening-review prompt. |
| **Plan** | Places fixed-time items first, fills gaps by importance, and **never books more time than the day has**: anything that doesn't fit is listed so you can move it or make it smaller. Recovery plan (habits shrink to their minimum, "could do" tasks step aside). Unfinished work rolls forward automatically, and every rollover is counted. |
| **Habits** | Clear action, time, minimum version. Done / minimum / missed, with a reason asked for each miss. Streak, best streak, 7- and 30-day consistency, 14-day history, recovery suggestions, "why you miss" patterns. |
| **Coach** | Six situations (procrastinating, money, career, emotional, fallen behind, other), worked through as Understand → Clarify → Evaluate → Decide → Execute → Review. Each answer becomes a task with a deadline, and later asks "did it work?" Every answer comes with a principle you can learn and reuse. Rules-based; works offline. |
| **Goals** | Education / Money / Career / Personal. Milestones, the reason behind the goal, deadlines, linked habits. Flags any goal that isn't tied to a daily action. |
| **Money** | Income, essential, discretionary and savings transactions; savings goals using `Monthly = (Target − Saved) / Months left`; a reality check against income after essentials; "give this money a job" split each time income arrives. No bank connection. |
| **Review** | Evening: wins, misses, lessons and energy; moves unfinished work forward and shows tomorrow's draft. Weekly: consistency, bottlenecks from your own data, one adjustment for the coming week. |

### Discipline modes
- **Firm but realistic** (default): you can miss one day without losing your streak, but two missed days in a row reset it.
- **Strict**: missing any day resets the streak, and a minimum-version day counts as half in the score.
- **Adaptive**: like firm, and suggests the recovery plan after a low-energy day.

### Coach modes
**Both** (default) gives a quick answer for everyday situations and asks questions first for major decisions. **Suggest** always answers straight away. **Ask** always walks through the questions.

## Run it

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests for streaks, planner, money, coach, scoring
npm run build      # production build in dist/
```

Deploy `dist/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Then open it in Chrome on Android and choose **Add to Home screen**.

## Privacy & limits
- All data lives in this browser's local storage. Use **Settings → Export backup** regularly, because clearing your browser data erases it.
- Reminders only fire while the app is open or was used recently. Browsers don't let web apps run reliably in the background.

## Next
1. Supabase sign-in and sync, so data is backed up across devices.
2. An optional AI coach for open-ended decisions and reviews, used only when you turn it on.
3. Server-sent push reminders.
4. Progress charts.
