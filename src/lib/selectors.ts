import { nowClock, today } from './dates';
import { currentStreak } from './habits';
import { planDay } from './planner';
import type { AppState, ISODate } from './types';

export function planFor(state: AppState, date: ISODate) {
  return planDay({
    date,
    tasks: state.tasks,
    habits: state.habits,
    habitLogs: state.habitLogs,
    dayStart: state.settings.dayStart,
    dayEnd: state.settings.dayEnd,
    now: date === today() ? nowClock() : undefined,
    reduced: state.reducedDays.includes(date),
  });
}

export function activeHabits(state: AppState, date: ISODate) {
  return state.habits.filter((h) => !h.archived && h.createdAt <= date);
}

/** Longest current streak across habits — the headline number. */
export function topStreak(state: AppState, date: ISODate): number {
  return Math.max(0, ...activeHabits(state, date).map((h) => currentStreak(h, state.habitLogs, date, state.settings.disciplineMode)));
}

/** Goals with no habit and no open task: ambitions not yet connected to daily action. */
export function disconnectedGoals(state: AppState) {
  return state.goals.filter(
    (g) =>
      g.habitIds.filter((id) => state.habits.some((h) => h.id === id && !h.archived)).length === 0 &&
      !state.tasks.some((t) => t.goalId === g.id && !t.done) &&
      (g.milestones.length === 0 || g.milestones.some((m) => !m.done)),
  );
}
