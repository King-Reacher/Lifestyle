import { addDays, diffDays, type ISODate } from './dates';

/** What kind of thing happened. */
export type EntryType = 'did' | 'study' | 'money-in' | 'money-out' | 'decision' | 'feeling' | 'learned' | 'note';

/** Which part of life it belongs to. */
export type Area = 'jamb' | 'academy' | 'money' | 'health' | 'people' | 'career' | 'personal';

export const TYPES: Record<EntryType, { label: string; icon: string; hint: string }> = {
  did: { label: 'Did', icon: '✅', hint: 'Something you did' },
  study: { label: 'Studied', icon: '📚', hint: 'What you studied and for how long' },
  'money-in': { label: 'Earned', icon: '💰', hint: 'Money that came in' },
  'money-out': { label: 'Spent', icon: '💸', hint: 'Money that went out' },
  decision: { label: 'Decided', icon: '🧭', hint: 'A choice you made and why' },
  feeling: { label: 'Felt', icon: '🫀', hint: 'How you feel right now' },
  learned: { label: 'Learned', icon: '💡', hint: 'A lesson worth keeping' },
  note: { label: 'Note', icon: '📝', hint: 'Anything else' },
};

export const AREAS: Record<Area, string> = {
  jamb: 'JAMB',
  academy: 'Academy',
  money: 'Money',
  health: 'Health',
  people: 'People',
  career: 'Career',
  personal: 'Personal',
};

/** Sensible default area for each entry type, so logging is one tap less. */
export const DEFAULT_AREA: Record<EntryType, Area> = {
  did: 'personal',
  study: 'jamb',
  'money-in': 'money',
  'money-out': 'money',
  decision: 'personal',
  feeling: 'personal',
  learned: 'personal',
  note: 'personal',
};

export interface Entry {
  id: string;
  /** Full timestamp, ISO 8601. */
  at: string;
  /** Local calendar day, for grouping and streaks. */
  date: ISODate;
  type: EntryType;
  area: Area;
  text: string;
  amount?: number;
  minutes?: number;
  /** 1 (awful) to 5 (great) */
  mood?: number;
  /** For decisions: how it turned out, filled in later. */
  outcome?: string;
  outcomeAt?: string;
}

export const MOODS = ['😞', '😕', '😐', '🙂', '😄'];

/**
 * Consecutive days with at least one entry. Today only counts once something
 * is logged, so an empty morning never breaks the streak.
 */
export function loggingStreak(entries: Entry[], day: ISODate): number {
  const days = new Set(entries.map((e) => e.date));
  let d = days.has(day) ? day : addDays(day, -1);
  let streak = 0;
  while (days.has(d)) {
    streak++;
    d = addDays(d, -1);
  }
  return streak;
}

/** Newest first, grouped by day. */
export function groupByDay(entries: Entry[]): { date: ISODate; entries: Entry[] }[] {
  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));
  const groups: { date: ISODate; entries: Entry[] }[] = [];
  for (const e of sorted) {
    const last = groups[groups.length - 1];
    if (last?.date === e.date) last.entries.push(e);
    else groups.push({ date: e.date, entries: [e] });
  }
  return groups;
}

const STOPWORDS = new Set(
  'a an the and or but if then so to of in on at for with from by about as is am are was were be been i me my we our you your it its this that these those do did done have has had not no yes what when how why which who will would should could can just very really today yesterday tomorrow'.split(
    ' ',
  ),
);

export function keywords(text: string): string[] {
  return [
    ...new Set(
      text
        .toLowerCase()
        .split(/[^a-z0-9₦]+/)
        .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
    ),
  ];
}

/** Every word of the query must appear somewhere in the entry. */
export function search(entries: Entry[], query: string): Entry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return entries
    .filter((e) => {
      const hay = `${e.text} ${e.outcome ?? ''} ${TYPES[e.type].label} ${AREAS[e.area]}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}

/**
 * Past entries most like the given text, by shared keywords. This is how the
 * ledger answers "what happened last time?" without any AI: your own history.
 */
export function similarPast(entries: Entry[], text: string, opts: { type?: EntryType; excludeId?: string; limit?: number } = {}) {
  const want = keywords(text);
  if (!want.length) return [];
  return entries
    .filter((e) => e.id !== opts.excludeId && (!opts.type || e.type === opts.type))
    .map((e) => {
      const have = new Set(keywords(`${e.text} ${e.outcome ?? ''}`));
      return { entry: e, score: want.filter((w) => have.has(w)).length };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.at.localeCompare(a.entry.at))
    .slice(0, opts.limit ?? 3);
}

export type Prompt =
  | { kind: 'outcome'; entry: Entry; question: string }
  | { kind: 'empty-day'; question: string }
  | { kind: 'mood-check'; question: string };

/**
 * Questions the ledger asks you, from simple rules over what you've logged.
 * `hour` is the current local hour, 0 to 23.
 */
export function prompts(entries: Entry[], day: ISODate, hour: number): Prompt[] {
  const out: Prompt[] = [];

  const openDecisions = entries
    .filter((e) => e.type === 'decision' && !e.outcome && diffDays(e.date, day) >= 2)
    .sort((a, b) => a.at.localeCompare(b.at));
  for (const e of openDecisions.slice(0, 3)) {
    out.push({ kind: 'outcome', entry: e, question: `How did this turn out? "${e.text}"` });
  }

  const yesterdayMoods = entries.filter((e) => e.type === 'feeling' && e.date === addDays(day, -1) && e.mood);
  const todayFeelings = entries.some((e) => e.type === 'feeling' && e.date === day);
  if (!todayFeelings && yesterdayMoods.length && Math.min(...yesterdayMoods.map((e) => e.mood!)) <= 2) {
    out.push({ kind: 'mood-check', question: 'Yesterday was rough. How are you today?' });
  }

  if (hour >= 18 && !entries.some((e) => e.date === day)) {
    out.push({ kind: 'empty-day', question: 'Nothing logged today yet. What did you get done?' });
  }
  return out;
}

export interface DaySummary {
  entries: number;
  studyMinutes: number;
  earned: number;
  spent: number;
  decisions: number;
}

export function summarize(entries: Entry[], day: ISODate): DaySummary {
  const list = entries.filter((e) => e.date === day);
  const sum = (t: EntryType, f: (e: Entry) => number) => list.filter((e) => e.type === t).reduce((s, e) => s + f(e), 0);
  return {
    entries: list.length,
    studyMinutes: sum('study', (e) => e.minutes ?? 0),
    earned: sum('money-in', (e) => e.amount ?? 0),
    spent: sum('money-out', (e) => e.amount ?? 0),
    decisions: list.filter((e) => e.type === 'decision').length,
  };
}
