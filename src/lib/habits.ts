import { addDays, diffDays } from './dates';
import type { DisciplineMode, Habit, HabitLog, HabitStatus, ISODate } from './types';

export function logFor(logs: HabitLog[], habitId: string, date: ISODate): HabitLog | undefined {
  return logs.find((l) => l.habitId === habitId && l.date === date);
}

const kept = (s: HabitStatus | undefined) => s === 'done' || s === 'minimum';

/**
 * Current streak in days.
 *
 * Today only counts once it is logged, so an unfinished today never breaks the streak.
 * Unlogged past days count as missed. In strict mode any miss ends the streak; in firm
 * and adaptive mode the rule is "never miss twice": a single missed day is forgiven
 * (it adds nothing) but two misses in a row end the streak.
 */
export function currentStreak(
  habit: Habit,
  logs: HabitLog[],
  day: ISODate,
  mode: DisciplineMode,
): number {
  const status = (d: ISODate) => logFor(logs, habit.id, d)?.status;
  let streak = 0;
  let d = kept(status(day)) ? day : addDays(day, -1);
  let missRun = 0;
  const allowedMisses = mode === 'strict' ? 0 : 1;

  while (diffDays(habit.createdAt, d) >= 0) {
    if (kept(status(d))) {
      streak++;
      missRun = 0;
    } else {
      missRun++;
      if (missRun > allowedMisses) break;
    }
    d = addDays(d, -1);
  }
  return streak;
}

/** Longest run of kept days (strict rule), for the record books. */
export function bestStreak(habit: Habit, logs: HabitLog[], day: ISODate): number {
  let best = 0;
  let run = 0;
  for (let d = habit.createdAt; diffDays(d, day) >= 0; d = addDays(d, 1)) {
    if (kept(logFor(logs, habit.id, d)?.status)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

/**
 * Share of eligible days in the window (ending on `day`) that were kept, 0–1.
 * A minimum-version day counts as kept. Today is only eligible once logged.
 */
export function consistency(habit: Habit, logs: HabitLog[], day: ISODate, windowDays: number): number {
  let eligible = 0;
  let keptDays = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = addDays(day, -i);
    if (diffDays(habit.createdAt, d) < 0) break;
    const s = logFor(logs, habit.id, d)?.status;
    if (i === 0 && !s) continue;
    eligible++;
    if (kept(s)) keptDays++;
  }
  return eligible ? keptDays / eligible : 0;
}

/** Most frequent reasons given for missed days, newest first on ties. */
export function missReasons(logs: HabitLog[], habitId?: string): { reason: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const l of logs) {
    if (l.status !== 'missed' || !l.reason) continue;
    if (habitId && l.habitId !== habitId) continue;
    const key = l.reason.trim().toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

/** A concrete recovery suggestion after a missed day. */
export function recoveryPlan(habit: Habit, logs: HabitLog[], day: ISODate): string | null {
  const yesterday = logFor(logs, habit.id, addDays(day, -1));
  const missedYesterday = diffDays(habit.createdAt, addDays(day, -1)) >= 0 && !kept(yesterday?.status);
  if (!missedYesterday) return null;
  const twoAgo = logFor(logs, habit.id, addDays(day, -2));
  const missedTwice = diffDays(habit.createdAt, addDays(day, -2)) >= 0 && !kept(twoAgo?.status);
  if (missedTwice) {
    return `Two days missed. Reset small: do only the minimum today — "${habit.minimum}". Momentum first, volume later.`;
  }
  return `Yesterday slipped. Don't miss twice: the minimum ("${habit.minimum}") keeps the streak alive.`;
}
