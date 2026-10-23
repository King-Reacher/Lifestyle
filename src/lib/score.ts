import { logFor } from './habits';
import type { AppState, ISODate } from './types';

export interface DayScore {
  /** 0–100 */
  score: number;
  topDone: number;
  topTotal: number;
  habitsKept: number;
  habitsTotal: number;
  reviewed: boolean;
}

/**
 * Daily accountability score: did I keep my promises to myself?
 * Top outcomes 45%, habits 40%, evening review 15%. In strict mode a minimum-version
 * habit counts for half; otherwise showing up at all counts in full.
 */
export function dayScore(state: AppState, date: ISODate): DayScore {
  const tasks = state.tasks.filter((t) => t.date === date);
  const top = tasks.filter((t) => t.top);
  const scored = top.length ? top : tasks.filter((t) => t.priority === 1);
  const topDone = scored.filter((t) => t.done).length;

  const habits = state.habits.filter((h) => !h.archived && h.createdAt <= date);
  let habitPoints = 0;
  let habitsKept = 0;
  for (const h of habits) {
    const s = logFor(state.habitLogs, h.id, date)?.status;
    if (s === 'done') {
      habitPoints += 1;
      habitsKept++;
    } else if (s === 'minimum') {
      habitPoints += state.settings.disciplineMode === 'strict' ? 0.5 : 1;
      habitsKept++;
    }
  }
  const reviewed = state.reviews.some((r) => r.date === date);

  const parts: [number, number][] = [];
  if (scored.length) parts.push([topDone / scored.length, 45]);
  if (habits.length) parts.push([habitPoints / habits.length, 40]);
  parts.push([reviewed ? 1 : 0, 15]);
  const weight = parts.reduce((s, [, w]) => s + w, 0);
  const score = Math.round((parts.reduce((s, [v, w]) => s + v * w, 0) / weight) * 100);

  return { score, topDone, topTotal: scored.length, habitsKept, habitsTotal: habits.length, reviewed };
}
