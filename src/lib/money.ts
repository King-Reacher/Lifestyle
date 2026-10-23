import { addDays, diffDays, fromISODate } from './dates';
import type { ISODate, SavingsGoal, Transaction } from './types';

const DAYS_PER_MONTH = 365.25 / 12;

export function remaining(goal: SavingsGoal): number {
  return Math.max(0, goal.target - goal.saved);
}

/** Calendar months left until the deadline, fractional; 0 if the deadline has passed. */
export function monthsLeft(goal: SavingsGoal, day: ISODate): number {
  const a = fromISODate(day);
  const b = fromISODate(goal.deadline);
  const daysInMonth = new Date(b.getFullYear(), b.getMonth() + 1, 0).getDate();
  const months =
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + (b.getDate() - a.getDate()) / daysInMonth;
  return Math.max(0, months);
}

/**
 * Monthly saving = Remaining / Months left.
 * Less than one month left means the whole remainder is due now.
 * Returns null when the deadline has passed and money is still owed.
 */
export function requiredMonthly(goal: SavingsGoal, day: ISODate): number | null {
  const rem = remaining(goal);
  if (rem === 0) return 0;
  const months = monthsLeft(goal, day);
  if (months <= 0) return null;
  return rem / Math.max(1, months);
}

export function sumBy(txs: Transaction[], kind: Transaction['kind']): number {
  return txs.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0);
}

export function inRange(txs: Transaction[], from: ISODate, to: ISODate): Transaction[] {
  return txs.filter((t) => diffDays(from, t.date) >= 0 && diffDays(t.date, to) >= 0);
}

/** Average monthly income over the last 90 days (irregular income is smoothed out). */
export function averageMonthlyIncome(txs: Transaction[], day: ISODate): number {
  const recent = inRange(txs, addDays(day, -89), day);
  return (sumBy(recent, 'income') / 90) * DAYS_PER_MONTH;
}

export interface Feasibility {
  requiredPerMonth: number;
  available: number;
  realistic: boolean;
  message: string;
}

/** Check whether all savings targets fit inside income after essentials. */
export function checkFeasibility(
  goals: SavingsGoal[],
  txs: Transaction[],
  monthlyEssentials: number,
  day: ISODate,
): Feasibility {
  let required = 0;
  let overdue = 0;
  for (const g of goals) {
    const r = requiredMonthly(g, day);
    if (r === null) overdue++;
    else required += r;
  }
  const income = averageMonthlyIncome(txs, day);
  const available = Math.max(0, income - monthlyEssentials);
  let message: string;
  let realistic = true;
  if (overdue) {
    realistic = false;
    message = `${overdue} goal${overdue > 1 ? 's are' : ' is'} past the deadline. Extend the date or lower the target — don't borrow to hit it.`;
  } else if (income === 0) {
    realistic = required === 0;
    message = 'Log your income to check whether these targets are realistic.';
  } else if (required > available) {
    realistic = false;
    message = 'Targets need more than you have after essentials. Extend a deadline, lower a target, or raise income first.';
  } else if (required > available * 0.7) {
    message = 'Tight but possible — almost all spare money goes to savings. Keep discretionary spending small.';
  } else {
    message = 'Realistic. Your targets fit comfortably after essentials.';
  }
  return { requiredPerMonth: required, available, realistic, message };
}

export interface Allocation {
  essentials: number;
  savings: { goalId: string; title: string; amount: number }[];
  discretionary: number;
}

/**
 * Split a new amount of income: essentials first (what's still unpaid this month),
 * then savings goals by deadline urgency up to their monthly need, then the rest is free.
 */
export function allocateIncome(
  amount: number,
  essentialsStillNeeded: number,
  goals: SavingsGoal[],
  day: ISODate,
): Allocation {
  let left = amount;
  const essentials = Math.min(left, Math.max(0, essentialsStillNeeded));
  left -= essentials;

  const savings: Allocation['savings'] = [];
  const byUrgency = [...goals]
    .filter((g) => remaining(g) > 0)
    .sort((a, b) => diffDays(b.deadline, a.deadline));
  for (const g of byUrgency) {
    if (left <= 0) break;
    const need = requiredMonthly(g, day) ?? remaining(g);
    const put = Math.min(left, Math.ceil(need), remaining(g));
    if (put > 0) {
      savings.push({ goalId: g.id, title: g.title, amount: put });
      left -= put;
    }
  }
  return { essentials, savings, discretionary: left };
}

export function formatMoney(n: number, currency: string): string {
  return `${currency}${Math.round(n).toLocaleString()}`;
}
