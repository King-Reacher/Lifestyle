import { addDays, diffDays, type ISODate } from './dates';
import type { Entry } from './ledger';

export interface SavingsGoal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: ISODate;
  createdAt: ISODate;
}

export type WantStatus = 'waiting' | 'approved' | 'bought' | 'dropped';

/** Something you want to buy. It waits out a cooling-off period before it can be approved. */
export interface Want {
  id: string;
  title: string;
  price: number;
  addedAt: string;
  status: WantStatus;
  decidedAt?: string;
}

export interface Contribution {
  date: ISODate;
  goalId: string;
  amount: number;
}

/** Percentages of every income: needs, savings, fun. They add up to 100. */
export interface Split {
  needs: number;
  save: number;
  fun: number;
}

export interface MoneyState {
  goals: SavingsGoal[];
  wants: Want[];
  contributions: Contribution[];
  split: Split;
  /** Days you confirmed you stuck to the plan without logging any money. */
  checkins: ISODate[];
}

export const COOLING_HOURS = 48;
export const MIN_SAVE_PERCENT = 20;

export const emptyMoney = (): MoneyState => ({ goals: [], wants: [], contributions: [], split: { needs: 50, save: 30, fun: 20 }, checkins: [] });

export const SPLIT_PRESETS: { label: string; split: Split }[] = [
  { label: '50 / 30 / 20', split: { needs: 50, save: 30, fun: 20 } },
  { label: '60 / 30 / 10', split: { needs: 60, save: 30, fun: 10 } },
  { label: '40 / 40 / 20', split: { needs: 40, save: 40, fun: 20 } },
  { label: '50 / 40 / 10', split: { needs: 50, save: 40, fun: 10 } },
];

/** Whole naira for each bucket; rounding leftovers go to savings, never to fun. */
export function splitIncome(amount: number, split: Split): Split {
  const needs = Math.floor((amount * split.needs) / 100);
  const fun = Math.floor((amount * split.fun) / 100);
  return { needs, fun, save: amount - needs - fun };
}

export const monthStart = (day: ISODate) => `${day.slice(0, 8)}01`;

const inMonth = (d: ISODate, day: ISODate) => d >= monthStart(day) && d <= day;

export interface MonthSummary {
  income: number;
  needs: number;
  wants: number;
  saved: number;
  funBudget: number;
  funLeft: number;
}

export function monthSummary(entries: Entry[], money: MoneyState, day: ISODate): MonthSummary {
  const month = entries.filter((e) => inMonth(e.date, day));
  const income = month.filter((e) => e.type === 'money-in').reduce((s, e) => s + (e.amount ?? 0), 0);
  const out = month.filter((e) => e.type === 'money-out');
  const needs = out.filter((e) => (e.spend ?? 'need') === 'need').reduce((s, e) => s + (e.amount ?? 0), 0);
  const wants = out.filter((e) => e.spend === 'planned' || e.spend === 'unplanned').reduce((s, e) => s + (e.amount ?? 0), 0);
  const saved = money.contributions.filter((c) => inMonth(c.date, day)).reduce((s, c) => s + c.amount, 0);
  const funBudget = Math.floor((income * money.split.fun) / 100);
  return { income, needs, wants, saved, funBudget, funLeft: funBudget - wants };
}

export const remaining = (g: SavingsGoal) => Math.max(0, g.target - g.saved);

/** Naira per day needed from today to hit the goal on time; null once the deadline has passed. */
export function perDayNeeded(g: SavingsGoal, day: ISODate): number | null {
  const days = diffDays(day, g.deadline);
  if (remaining(g) === 0) return 0;
  return days > 0 ? remaining(g) / days : null;
}

/** Average saved per day over the last 30 days. */
export function savingRate(money: MoneyState, day: ISODate): number {
  const from = addDays(day, -29);
  return money.contributions.filter((c) => c.date >= from && c.date <= day).reduce((s, c) => s + c.amount, 0) / 30;
}

/**
 * How many days later a goal is reached if this money is spent instead of saved.
 * Uses your real saving pace, or the pace the goal needs if you haven't saved yet.
 */
export function delayDays(price: number, goal: SavingsGoal, money: MoneyState, day: ISODate): number {
  const rate = savingRate(money, day) || perDayNeeded(goal, day) || 0;
  if (rate <= 0) return 0;
  return Math.ceil(price / rate);
}

/** The goal that needs attention first: the nearest deadline that isn't reached yet. */
export function focusGoal(goals: SavingsGoal[]): SavingsGoal | undefined {
  return [...goals].filter((g) => remaining(g) > 0).sort((a, b) => a.deadline.localeCompare(b.deadline))[0];
}

/** Put savings into goals by nearest deadline, never more than a goal still needs. */
export function allocateSavings(amount: number, goals: SavingsGoal[]): { goalId: string; amount: number }[] {
  let left = amount;
  const out: { goalId: string; amount: number }[] = [];
  for (const g of [...goals].filter((x) => remaining(x) > 0).sort((a, b) => a.deadline.localeCompare(b.deadline))) {
    if (left <= 0) break;
    const put = Math.min(left, remaining(g));
    out.push({ goalId: g.id, amount: put });
    left -= put;
  }
  return out;
}

export function coolingHoursLeft(want: Want, now = Date.now()): number {
  return Math.max(0, COOLING_HOURS - (now - Date.parse(want.addedAt)) / 3_600_000);
}

export type BuyCheck = { ok: true } | { ok: false; reason: string };

/** Strict rules: wait out the cooling-off, and it must fit this month's fun money. */
export function canBuy(want: Want, funLeft: number, now = Date.now()): BuyCheck {
  const h = coolingHoursLeft(want, now);
  if (h > 0) return { ok: false, reason: `Cooling off: ${Math.ceil(h)} more hour${Math.ceil(h) === 1 ? '' : 's'}.` };
  if (want.price > funLeft) return { ok: false, reason: `Only ₦${Math.max(0, funLeft).toLocaleString()} fun money left this month. Wait, or drop it.` };
  return { ok: true };
}

/**
 * A day keeps the money streak when you logged money or checked in, and spent
 * nothing unplanned. Today only counts once it is kept.
 */
export function moneyStreak(entries: Entry[], money: MoneyState, day: ISODate): number {
  const active = new Set([...money.checkins, ...entries.filter((e) => e.type === 'money-in' || e.type === 'money-out').map((e) => e.date)]);
  const broken = new Set(entries.filter((e) => e.spend === 'unplanned').map((e) => e.date));
  const kept = (d: ISODate) => active.has(d) && !broken.has(d);
  let d = kept(day) ? day : addDays(day, -1);
  let n = 0;
  while (kept(d)) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export const brokeToday = (entries: Entry[], day: ISODate) => entries.some((e) => e.date === day && e.spend === 'unplanned');

/** Total of wants you talked yourself out of. */
export const notWasted = (money: MoneyState) => money.wants.filter((w) => w.status === 'dropped').reduce((s, w) => s + w.price, 0);

export const naira = (n: number) => `₦${Math.round(n).toLocaleString()}`;
