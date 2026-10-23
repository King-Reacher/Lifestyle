import type { Who } from '../components/Character';

/** Pick a line that stays the same for the whole day, so the cast doesn't flicker between renders. */
export function pick<T>(lines: T[], seed: string): T {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return lines[h % lines.length];
}

export function greeting(name: string, hour: number, day: string): { who: Who; text: string } {
  const n = name || 'champ';
  if (hour < 12)
    return pick(
      [
        { who: 'tunde', text: `Good morning, ${n}! New day, clean slate. What's the first win?` },
        { who: 'ada', text: `Morning, my child. Plan the day before the day plans you.` },
        { who: 'tunde', text: `Rise and grind, ${n}! Log your first move and the streak stays hot.` },
      ],
      day,
    );
  if (hour < 17)
    return pick(
      [
        { who: 'zara', text: `Afternoon check, ${n}. What have you done so far? I'll keep the record.` },
        { who: 'tunde', text: `Halfway through the day! Don't let it slip — what's next?` },
        { who: 'ada', text: `The afternoon decides the day, ${n}. Keep going.` },
      ],
      day,
    );
  return pick(
    [
      { who: 'ada', text: `Evening, ${n}. Before you rest — what did today teach you?` },
      { who: 'zara', text: `Night shift. Log what happened today so tomorrow-you remembers.` },
      { who: 'tunde', text: `Close it out strong, ${n}! One more entry and today counts.` },
    ],
    day,
  );
}

export function streakLine(streak: number, loggedToday: boolean): string {
  if (streak === 0) return "I'm just a spark. Log one thing and I'll come alive!";
  if (!loggedToday) return `${streak} days! Feed me one entry today or I go out. 😰`;
  if (streak >= 30) return `${streak} days. You're not trying anymore — this is who you are.`;
  if (streak >= 7) return `${streak} days straight! I'm burning bright. 🔥`;
  return `${streak} day${streak > 1 ? 's' : ''} and counting. Keep me lit!`;
}

export const CHEERS: { who: Who; text: string }[] = [
  { who: 'blaze', text: 'Logged! The fire grows. 🔥' },
  { who: 'tunde', text: "That's how it's done! 💪" },
  { who: 'zara', text: 'Saved to your ledger. Future-you says thanks.' },
  { who: 'ada', text: 'Good. Small records make big lives.' },
];

export const SAVED_DECISION = { who: 'ada' as Who, text: "Noted. In two days I'll ask how it turned out." };
export const SAVED_SPEND = { who: 'ada' as Who, text: 'Recorded. Every naira should have a job.' };
