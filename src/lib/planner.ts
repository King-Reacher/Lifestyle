import { addDays, diffDays, toClock, toMinutes } from './dates';
import type { ClockTime, Habit, HabitLog, ISODate, Task } from './types';

export interface Slot {
  kind: 'task' | 'habit';
  id: string;
  title: string;
  start: ClockTime;
  end: ClockTime;
  minutes: number;
  done: boolean;
  top: boolean;
  /** Fixed slots were given a time; flexible ones were placed by the planner. */
  fixed: boolean;
}

export interface Overflow {
  kind: 'task' | 'habit';
  id: string;
  title: string;
  minutes: number;
}

export interface DayPlan {
  slots: Slot[];
  overflow: Overflow[];
  availableMinutes: number;
  plannedMinutes: number;
}

export interface PlanInput {
  date: ISODate;
  tasks: Task[];
  habits: Habit[];
  habitLogs: HabitLog[];
  dayStart: ClockTime;
  dayEnd: ClockTime;
  /** When planning today, nothing unfinished is placed before this time. */
  now?: ClockTime;
  /** Recovery mode: habits shrink to their minimum and "could do" tasks are dropped. */
  reduced?: boolean;
}

const MINIMUM_MINUTES = 10;

interface Item {
  kind: Slot['kind'];
  id: string;
  title: string;
  minutes: number;
  done: boolean;
  top: boolean;
  priority: number;
  start?: number;
}

/**
 * Lay the day out without ever booking more time than exists.
 * Fixed-time items go first (shifted later if they collide); flexible tasks fill the gaps
 * by importance. Anything that cannot fit is returned as overflow for you to move or shrink.
 */
export function planDay(input: PlanInput): DayPlan {
  const dayStart = toMinutes(input.dayStart);
  const dayEnd = toMinutes(input.dayEnd);
  const earliest = input.now ? Math.max(dayStart, toMinutes(input.now)) : dayStart;

  const items: Item[] = [];
  for (const h of input.habits) {
    if (h.archived || diffDays(h.createdAt, input.date) < 0) continue;
    const log = input.habitLogs.find((l) => l.habitId === h.id && l.date === input.date);
    if (log?.status === 'missed') continue;
    items.push({
      kind: 'habit',
      id: h.id,
      title: input.reduced ? `${h.title} (minimum: ${h.minimum})` : h.title,
      minutes: input.reduced ? Math.min(h.minutes, MINIMUM_MINUTES) : h.minutes,
      done: !!log,
      top: false,
      priority: 1,
      start: toMinutes(h.time),
    });
  }
  const overflow: Overflow[] = [];
  for (const t of input.tasks) {
    if (t.date !== input.date) continue;
    if (input.reduced && t.priority === 3 && !t.done) {
      overflow.push({ kind: 'task', id: t.id, title: t.title, minutes: t.minutes });
      continue;
    }
    items.push({
      kind: 'task',
      id: t.id,
      title: t.title,
      minutes: t.minutes,
      done: t.done,
      top: t.top,
      priority: t.priority,
      start: t.start ? toMinutes(t.start) : undefined,
    });
  }

  const busy: [number, number][] = [];
  const slots: Slot[] = [];
  const place = (it: Item, start: number, fixed: boolean) => {
    const end = start + it.minutes;
    busy.push([start, end]);
    busy.sort((a, b) => a[0] - b[0]);
    slots.push({
      kind: it.kind,
      id: it.id,
      title: it.title,
      start: toClock(start),
      end: toClock(end),
      minutes: it.minutes,
      done: it.done,
      top: it.top,
      fixed,
    });
  };

  /** First free start time at or after `from` with room for `len` minutes. */
  const findGap = (from: number, len: number): number | null => {
    let t = from;
    for (const [s, e] of busy) {
      if (e <= t) continue;
      if (s - t >= len) break;
      t = Math.max(t, e);
    }
    return t + len <= dayEnd ? t : null;
  };

  // Completed items keep their place in the record but don't need future time.
  const fixedItems = items.filter((i) => i.start !== undefined).sort((a, b) => a.start! - b.start!);
  for (const it of fixedItems) {
    const from = it.done ? it.start! : Math.max(it.start!, earliest);
    const at = it.done ? it.start! : findGap(from, it.minutes);
    if (at === null) overflow.push({ kind: it.kind, id: it.id, title: it.title, minutes: it.minutes });
    else place(it, at, at === it.start);
  }

  const flexible = items
    .filter((i) => i.start === undefined)
    .sort((a, b) => Number(b.done) - Number(a.done) || Number(b.top) - Number(a.top) || a.priority - b.priority);
  for (const it of flexible) {
    const at = findGap(it.done ? dayStart : earliest, it.minutes);
    if (at === null) overflow.push({ kind: it.kind, id: it.id, title: it.title, minutes: it.minutes });
    else place(it, at, false);
  }

  slots.sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  return {
    slots,
    overflow,
    availableMinutes: Math.max(0, dayEnd - dayStart),
    plannedMinutes: slots.reduce((s, x) => s + x.minutes, 0),
  };
}

/** The slot happening now, or else the next unfinished one. */
export function currentOrNext(plan: DayPlan, now: ClockTime): Slot | undefined {
  const n = toMinutes(now);
  const pending = plan.slots.filter((s) => !s.done);
  return (
    pending.find((s) => toMinutes(s.start) <= n && n < toMinutes(s.end)) ??
    pending.find((s) => toMinutes(s.start) >= n) ??
    pending[0]
  );
}

/**
 * Move unfinished tasks from before `day` onto `day`. Fixed times are cleared so the
 * planner can find room, and each move is counted so chronic rollovers stand out.
 */
export function rollOverUnfinished(tasks: Task[], day: ISODate): Task[] {
  return tasks.map((t) =>
    !t.done && diffDays(t.date, day) > 0
      ? { ...t, date: day, start: undefined, rolledOver: t.rolledOver + 1 }
      : t,
  );
}

/** Push a task to tomorrow (used by the recovery flow and overflow list). */
export function deferTask(task: Task): Task {
  return { ...task, date: addDays(task.date, 1), start: undefined, rolledOver: task.rolledOver + 1 };
}
