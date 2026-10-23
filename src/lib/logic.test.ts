import { describe, expect, it } from 'vitest';
import { SITUATIONS, shouldAsk } from './coach';
import { addDays, diffDays, weekStart } from './dates';
import { consistency, currentStreak, recoveryPlan } from './habits';
import { allocateIncome, checkFeasibility, requiredMonthly } from './money';
import { currentOrNext, planDay, rollOverUnfinished } from './planner';
import { dayScore } from './score';
import { defaultState } from './store';
import type { Habit, HabitLog, HabitStatus, SavingsGoal, Task } from './types';

const DAY = '2026-10-23';

const habit: Habit = {
  id: 'h1',
  title: 'Study mathematics',
  area: 'education',
  minimum: 'Solve one problem',
  time: '07:00',
  minutes: 60,
  createdAt: '2026-10-01',
  archived: false,
};

/** Build logs from a string read oldest→newest ending on `end`: d=done m=minimum x=missed .=unlogged */
function logs(pattern: string, end = DAY): HabitLog[] {
  const map: Record<string, HabitStatus> = { d: 'done', m: 'minimum', x: 'missed' };
  return [...pattern].flatMap((c, i) => {
    const date = addDays(end, i - pattern.length + 1);
    return map[c] ? [{ habitId: 'h1', date, status: map[c] }] : [];
  });
}

const task = (over: Partial<Task>): Task => ({
  id: Math.random().toString(36),
  title: 't',
  date: DAY,
  minutes: 60,
  priority: 2,
  done: false,
  top: false,
  rolledOver: 0,
  ...over,
});

describe('dates', () => {
  it('handles month boundaries and week start', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(diffDays('2026-10-01', '2026-10-23')).toBe(22);
    expect(weekStart('2026-10-23')).toBe('2026-10-19'); // Friday → Monday
  });
});

describe('streaks', () => {
  it('counts consecutive kept days, minimum included', () => {
    expect(currentStreak(habit, logs('ddmdd'), DAY, 'firm')).toBe(5);
  });

  it('does not break because today is not logged yet', () => {
    expect(currentStreak(habit, logs('ddd.'), DAY, 'strict')).toBe(3);
  });

  it('forgives one missed day in firm mode but not two', () => {
    expect(currentStreak(habit, logs('ddxdd'), DAY, 'firm')).toBe(4);
    expect(currentStreak(habit, logs('ddxxdd'), DAY, 'firm')).toBe(2);
  });

  it('breaks on any miss in strict mode', () => {
    expect(currentStreak(habit, logs('ddxdd'), DAY, 'strict')).toBe(2);
  });

  it('never counts days before the habit existed', () => {
    const fresh = { ...habit, createdAt: addDays(DAY, -1) };
    expect(currentStreak(fresh, logs('dddd'), DAY, 'firm')).toBe(2);
  });

  it('keeps long-term consistency after a bad day', () => {
    const c = consistency(habit, logs('ddddddx'), DAY, 7);
    expect(c).toBeCloseTo(6 / 7);
  });

  it('suggests the minimum after a miss', () => {
    expect(recoveryPlan(habit, logs('ddx.'), DAY)).toMatch(/Don't miss twice/);
    expect(recoveryPlan(habit, logs('dxx.'), DAY)).toMatch(/Reset small/);
    expect(recoveryPlan(habit, logs('ddd.'), DAY)).toBeNull();
  });
});

describe('money', () => {
  const goal: SavingsGoal = {
    id: 'g',
    title: 'Laptop',
    target: 120_000,
    saved: 30_000,
    deadline: '2027-04-23',
    createdAt: DAY,
  };

  it('matches the worked example: ₦90,000 over six months is ₦15,000/month', () => {
    expect(requiredMonthly(goal, DAY)).toBeCloseTo(15_000, -2);
  });

  it('flags an overdue goal instead of dividing by zero', () => {
    expect(requiredMonthly({ ...goal, deadline: addDays(DAY, -1) }, DAY)).toBeNull();
    expect(requiredMonthly({ ...goal, saved: 120_000 }, DAY)).toBe(0);
  });

  it('warns when targets exceed income after essentials', () => {
    const txs = [{ id: '1', date: DAY, amount: 30_000, kind: 'income' as const, note: '' }];
    const f = checkFeasibility([goal], txs, 25_000, DAY);
    expect(f.realistic).toBe(false);
  });

  it('allocates essentials first, then savings, then free money', () => {
    const a = allocateIncome(50_000, 20_000, [goal], DAY);
    expect(a.essentials).toBe(20_000);
    expect(a.savings[0].amount).toBeGreaterThan(14_000);
    expect(a.essentials + a.savings[0].amount + a.discretionary).toBe(50_000);
  });
});

describe('planner', () => {
  const base = { date: DAY, habits: [], habitLogs: [], dayStart: '08:00', dayEnd: '12:00' };

  it('never schedules more time than the day has', () => {
    const tasks = [1, 2, 3, 4, 5].map((i) => task({ id: `t${i}`, minutes: 60 }));
    const plan = planDay({ ...base, tasks });
    expect(plan.slots).toHaveLength(4);
    expect(plan.overflow).toHaveLength(1);
    expect(plan.plannedMinutes).toBeLessThanOrEqual(plan.availableMinutes);
  });

  it('places fixed items first and fills gaps by importance', () => {
    const tasks = [
      task({ id: 'fixed', start: '09:00', minutes: 60 }),
      task({ id: 'could', priority: 3, minutes: 60 }),
      task({ id: 'top', top: true, minutes: 60 }),
    ];
    const plan = planDay({ ...base, tasks });
    const byId = Object.fromEntries(plan.slots.map((s) => [s.id, s.start]));
    expect(byId).toEqual({ top: '08:00', fixed: '09:00', could: '10:00' });
  });

  it('shifts colliding fixed items instead of double-booking', () => {
    const tasks = [task({ id: 'a', start: '09:00' }), task({ id: 'b', start: '09:30' })];
    const plan = planDay({ ...base, tasks });
    expect(plan.slots.map((s) => s.start)).toEqual(['09:00', '10:00']);
  });

  it('does not place unfinished work in the past', () => {
    const plan = planDay({ ...base, tasks: [task({ id: 'x' })], now: '10:15' });
    expect(plan.slots[0].start).toBe('10:15');
  });

  it('shrinks habits and drops could-dos in reduced mode', () => {
    const plan = planDay({
      ...base,
      habits: [{ ...habit, time: '08:00' }],
      tasks: [task({ id: 'could', priority: 3 })],
      reduced: true,
    });
    expect(plan.slots[0].minutes).toBe(10);
    expect(plan.overflow.map((o) => o.id)).toEqual(['could']);
  });

  it('finds the current or next task', () => {
    const plan = planDay({ ...base, tasks: [task({ id: 'a', start: '08:00' }), task({ id: 'b', start: '10:00' })] });
    expect(currentOrNext(plan, '08:30')?.id).toBe('a');
    expect(currentOrNext(plan, '09:15')?.id).toBe('b');
  });

  it('rolls unfinished past tasks forward and counts it', () => {
    const [t] = rollOverUnfinished([task({ date: addDays(DAY, -2), start: '09:00' })], DAY);
    expect(t).toMatchObject({ date: DAY, start: undefined, rolledOver: 1 });
  });
});

describe('coach', () => {
  it('asks questions only for major decisions in "both" mode', () => {
    const procrastinating = SITUATIONS.find((s) => s.id === 'procrastinating')!;
    const money = SITUATIONS.find((s) => s.id === 'money')!;
    expect(shouldAsk('both', procrastinating)).toBe(false);
    expect(shouldAsk('both', money)).toBe(true);
    expect(shouldAsk('suggest', money)).toBe(false);
  });

  it('never recommends borrowing for a want', () => {
    const money = SITUATIONS.find((s) => s.id === 'money')!;
    const r = money.recommend({ what: 'sneakers', kind: 'Useful want', borrow: 'No' });
    expect(r.action).toMatch(/Don't buy/);
  });

  it('every situation produces an action for empty answers', () => {
    for (const s of SITUATIONS) expect(s.recommend({}).action.length).toBeGreaterThan(10);
  });
});

describe('accountability score', () => {
  it('combines top outcomes, habits and review', () => {
    const s = defaultState();
    s.habits = [habit];
    s.habitLogs = [{ habitId: 'h1', date: DAY, status: 'done' }];
    s.tasks = [task({ top: true, done: true }), task({ top: true })];
    expect(dayScore(s, DAY).score).toBe(Math.round(((0.5 * 45 + 40) / 100) * 100));
  });
});
