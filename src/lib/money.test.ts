import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import type { Entry } from './ledger';
import { allocateSavings, canBuy, delayDays, emptyMoney, monthSummary, moneyStreak, notWasted, perDayNeeded, splitIncome, type SavingsGoal, type Want } from './money';

const DAY = '2026-10-23';
let n = 0;
const entry = (over: Partial<Entry>): Entry => ({ id: `m${n++}`, at: `${over.date ?? DAY}T10:00:00Z`, date: DAY, type: 'money-out', area: 'money', text: 'x', ...over });
const goal = (over: Partial<SavingsGoal> = {}): SavingsGoal => ({ id: 'g', title: 'Laptop', target: 120_000, saved: 30_000, deadline: addDays(DAY, 90), createdAt: DAY, ...over });

describe('income split', () => {
  it('splits by percentage and gives rounding leftovers to savings', () => {
    expect(splitIncome(10_000, { needs: 50, save: 30, fun: 20 })).toEqual({ needs: 5000, save: 3000, fun: 2000 });
    const s = splitIncome(999, { needs: 50, save: 30, fun: 20 });
    expect(s.needs + s.save + s.fun).toBe(999);
    expect(s.save).toBeGreaterThanOrEqual(299);
  });
});

describe('month summary', () => {
  it('separates needs from wants and computes the fun budget from income', () => {
    const entries = [
      entry({ type: 'money-in', amount: 20_000 }),
      entry({ amount: 3000, spend: 'need' }),
      entry({ amount: 1500, spend: 'planned' }),
      entry({ amount: 500, spend: 'unplanned' }),
      entry({ amount: 999, date: '2026-09-30' }),
    ];
    const s = monthSummary(entries, emptyMoney(), DAY);
    expect(s).toMatchObject({ income: 20_000, needs: 3000, wants: 2000, funBudget: 4000, funLeft: 2000 });
  });
});

describe('goals', () => {
  it('works out the daily amount needed', () => {
    expect(perDayNeeded(goal(), DAY)).toBe(1000);
    expect(perDayNeeded(goal({ deadline: addDays(DAY, -1) }), DAY)).toBeNull();
    expect(perDayNeeded(goal({ saved: 120_000 }), DAY)).toBe(0);
  });

  it('shows how many days a purchase delays the goal', () => {
    expect(delayDays(5000, goal(), emptyMoney(), DAY)).toBe(5);
    const money = { ...emptyMoney(), contributions: [{ date: DAY, goalId: 'g', amount: 15_000 }] };
    expect(delayDays(5000, goal(), money, DAY)).toBe(10);
  });

  it('fills the nearest deadline first and never overfills', () => {
    const a = goal({ id: 'a', target: 10_000, saved: 8000, deadline: addDays(DAY, 10) });
    const b = goal({ id: 'b', deadline: addDays(DAY, 60) });
    expect(allocateSavings(5000, [b, a])).toEqual([
      { goalId: 'a', amount: 2000 },
      { goalId: 'b', amount: 3000 },
    ]);
  });
});

describe('strict wants', () => {
  const now = Date.parse(`${DAY}T12:00:00Z`);
  const want = (hoursAgo: number, price = 3000): Want => ({ id: 'w', title: 'Sneakers', price, status: 'waiting', addedAt: new Date(now - hoursAgo * 3_600_000).toISOString() });

  it('blocks buying during the 48-hour cooling-off', () => {
    const r = canBuy(want(10), 10_000, now);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.reason).toMatch(/38 more hours/);
  });

  it('blocks buying when fun money has run out', () => {
    const r = canBuy(want(50, 3000), 2000, now);
    expect(r.ok).toBe(false);
  });

  it('allows it after cooling off when it fits the fun budget', () => {
    expect(canBuy(want(50, 3000), 5000, now).ok).toBe(true);
  });

  it('counts money you chose not to waste', () => {
    expect(notWasted({ ...emptyMoney(), wants: [{ ...want(50), status: 'dropped' }, { ...want(50, 9000), status: 'bought' }] })).toBe(3000);
  });
});

describe('money streak', () => {
  it('counts days you logged money or checked in', () => {
    const entries = [entry({ date: addDays(DAY, -1), spend: 'need', amount: 100 }), entry({ date: addDays(DAY, -2), type: 'money-in', amount: 5000 })];
    const money = { ...emptyMoney(), checkins: [DAY] };
    expect(moneyStreak(entries, money, DAY)).toBe(3);
  });

  it('breaks on any unplanned spend', () => {
    const entries = [entry({ date: addDays(DAY, -1), spend: 'unplanned', amount: 800 }), entry({ date: addDays(DAY, -2), spend: 'need', amount: 100 })];
    expect(moneyStreak(entries, { ...emptyMoney(), checkins: [DAY] }, DAY)).toBe(1);
  });

  it('does not break because today is not logged yet', () => {
    const entries = [entry({ date: addDays(DAY, -1), spend: 'need', amount: 100 })];
    expect(moneyStreak(entries, emptyMoney(), DAY)).toBe(1);
  });
});
