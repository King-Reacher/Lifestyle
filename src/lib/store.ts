import { createContext, useContext } from 'react';
import { today } from './dates';
import { rollOverUnfinished } from './planner';
import type { AppState } from './types';

const STORAGE_KEY = 'diox-life-os:v1';

export function defaultState(): AppState {
  return {
    version: 1,
    settings: {
      name: '',
      disciplineMode: 'firm',
      coachMode: 'both',
      currency: '₦',
      dayStart: '06:00',
      dayEnd: '22:00',
      monthlyEssentials: 0,
      remindersEnabled: false,
      onboarded: false,
    },
    habits: [],
    habitLogs: [],
    goals: [],
    tasks: [],
    savingsGoals: [],
    transactions: [],
    reviews: [],
    weeklyReviews: [],
    distractions: [],
    decisions: [],
    reducedDays: [],
  };
}

/** Fill in any fields missing from older or hand-edited data. */
export function normalize(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  return {
    ...base,
    ...r,
    version: 1,
    settings: { ...base.settings, ...(r.settings ?? {}) },
  };
}

export function loadState(): AppState {
  let state = defaultState();
  try {
    const text = localStorage.getItem(STORAGE_KEY);
    if (text) state = normalize(JSON.parse(text));
  } catch {
    // Unreadable storage: start fresh rather than crash.
  }
  return { ...state, tasks: rollOverUnfinished(state.tasks, today()) };
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked; the in-memory state keeps working.
  }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export type Updater = (fn: (s: AppState) => AppState) => void;

export const StoreContext = createContext<{ state: AppState; update: Updater } | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreContext');
  return ctx;
}
