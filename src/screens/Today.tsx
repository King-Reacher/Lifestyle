import { useState } from 'react';
import { FocusTimer } from '../components/FocusTimer';
import { HabitCheckin } from '../components/HabitCheckin';
import { TaskForm } from '../components/TaskForm';
import { Bar, Ring } from '../components/ui';
import { addDays, formatDuration, formatLongDate, nowClock, today, toMinutes } from '../lib/dates';
import { currentStreak, recoveryPlan } from '../lib/habits';
import { currentOrNext } from '../lib/planner';
import { dayScore } from '../lib/score';
import { activeHabits, disconnectedGoals, planFor, topStreak } from '../lib/selectors';
import { useStore } from '../lib/store';
import type { Screen } from '../App';

export function Today({ go }: { go: (s: Screen) => void }) {
  const { state, update } = useStore();
  const date = today();
  const now = nowClock();
  const plan = planFor(state, date);
  const score = dayScore(state, date);
  const next = currentOrNext(plan, now);
  const habits = activeHabits(state, date);
  const tasks = state.tasks.filter((t) => t.date === date);
  const top = tasks.filter((t) => t.top);
  const reduced = state.reducedDays.includes(date);
  const [focus, setFocus] = useState<{ title: string; minutes: number; done?: () => void } | null>(null);
  const [adding, setAdding] = useState(false);

  const completeSlot = (kind: 'task' | 'habit', id: string) =>
    update((s) =>
      kind === 'task'
        ? { ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: true } : t)) }
        : {
            ...s,
            habitLogs: [...s.habitLogs.filter((l) => !(l.habitId === id && l.date === date)), { habitId: id, date, status: 'done' }],
          },
    );

  const toggleTask = (id: string) =>
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const setReduced = (on: boolean) =>
    update((s) => ({
      ...s,
      reducedDays: on ? [...new Set([...s.reducedDays, date])] : s.reducedDays.filter((d) => d !== date),
    }));

  // What needs to change: concrete warnings, not vague guilt.
  const warnings: string[] = [];
  if (plan.overflow.length)
    warnings.push(`${plan.overflow.length} item${plan.overflow.length > 1 ? 's don’t' : ' doesn’t'} fit in the time left today.`);
  const chronic = tasks.filter((t) => !t.done && t.rolledOver >= 3);
  if (chronic.length) warnings.push(`"${chronic[0].title}" has been pushed ${chronic[0].rolledOver} times. Shrink it, schedule it first, or drop it.`);
  const recoveries = habits.map((h) => recoveryPlan(h, state.habitLogs, date)).filter(Boolean) as string[];
  const lastNight = state.reviews.find((r) => r.date === addDays(date, -1));
  if (state.settings.disciplineMode === 'adaptive' && !reduced && lastNight && lastNight.energy <= 2)
    recoveries.push('Energy was low yesterday. Consider the recovery plan today: minimums and must-dos only.');
  const lost = disconnectedGoals(state);
  if (lost.length) warnings.push(`Goal "${lost[0].title}" has no daily action. Link a habit or add a task.`);
  const evening = toMinutes(now) >= toMinutes(state.settings.dayEnd) - 90;
  const reviewed = state.reviews.some((r) => r.date === date);

  const greeting = state.settings.name ? `, ${state.settings.name}` : '';

  return (
    <>
      <div className="eyebrow">{formatLongDate(date)}</div>
      <h1>Today, you execute{greeting}.</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        One day. One plan. Real progress.
      </p>

      <div className="card accent">
        <div className="row">
          <Ring value={score.score / 100} label={`${score.score}`} />
          <div className="grow">
            <div className="eyebrow">Accountability score</div>
            <div className="small" style={{ marginTop: 4 }}>
              Top outcomes {score.topDone}/{score.topTotal} · Habits {score.habitsKept}/{score.habitsTotal} · Review{' '}
              {score.reviewed ? '✓' : '—'}
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <span className="chip good">🔥 {topStreak(state, date)}-day streak</span>
              {reduced && <span className="chip warn">Recovery plan</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="eyebrow">Right now</div>
        {next ? (
          <>
            <h2 style={{ margin: '6px 0 2px' }}>{next.title}</h2>
            <div className="muted small">
              {next.start}–{next.end} · {formatDuration(next.minutes)}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="btn primary grow"
                onClick={() => setFocus({ title: next.title, minutes: next.minutes, done: () => completeSlot(next.kind, next.id) })}
              >
                Start focus
              </button>
              <button className="btn grow" onClick={() => completeSlot(next.kind, next.id)}>
                Mark done
              </button>
            </div>
          </>
        ) : plan.slots.length ? (
          <p>Everything planned for today is done. Rest, or get ahead on tomorrow.</p>
        ) : (
          <>
            <p className="muted">Nothing planned yet. What must happen today?</p>
            <button className="btn primary block" onClick={() => setAdding(true)}>
              Plan today
            </button>
          </>
        )}
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Today’s 3 outcomes</h2>
          <button className="btn sm" onClick={() => setAdding(true)}>
            + Add
          </button>
        </div>
        {top.length === 0 ? (
          <p className="muted small">
            Choose the three things that would make today a win. Mark tasks as “most important” when adding them.
          </p>
        ) : (
          <ul className="list">
            {top.map((t) => (
              <li key={t.id} className="row">
                <button className={`check ${t.done ? 'on' : ''}`} onClick={() => toggleTask(t.id)} aria-label="Toggle done">
                  {t.done ? '✓' : ''}
                </button>
                <span className={`grow ${t.done ? 'done-text' : ''}`}>{t.title}</span>
                <span className="muted small">{formatDuration(t.minutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>Habits</h2>
          <button className="btn sm ghost" onClick={() => go('habits')}>
            All →
          </button>
        </div>
        {habits.length === 0 ? (
          <p className="muted small">No habits yet. Add one that moves your biggest goal forward.</p>
        ) : (
          <ul className="list">
            {habits.map((h) => (
              <li key={h.id} className="row">
                <div className="grow">
                  <div>{h.title}</div>
                  <div className="muted small">
                    {h.time} · {reduced ? `minimum: ${h.minimum}` : formatDuration(h.minutes)} · 🔥{' '}
                    {currentStreak(h, state.habitLogs, date, state.settings.disciplineMode)}
                  </div>
                </div>
                <HabitCheckin habit={h} date={date} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {(warnings.length > 0 || recoveries.length > 0) && (
        <div className="card warn">
          <h2>What needs to change</h2>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {[...recoveries, ...warnings].map((w) => (
              <li key={w} className="small" style={{ marginBottom: 6 }}>
                {w}
              </li>
            ))}
          </ul>
          <div className="row" style={{ marginTop: 10 }}>
            {!reduced ? (
              <button className="btn primary grow" onClick={() => setReduced(true)}>
                Switch to recovery plan
              </button>
            ) : (
              <button className="btn grow" onClick={() => setReduced(false)}>
                Back to full plan
              </button>
            )}
            <button className="btn grow" onClick={() => go('plan')}>
              Open plan
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="row between">
          <div className="grow">
            <div className="eyebrow">Day capacity</div>
            <div className="small" style={{ margin: '4px 0 8px' }}>
              {formatDuration(plan.plannedMinutes)} planned of {formatDuration(plan.availableMinutes)} available
            </div>
            <Bar value={plan.plannedMinutes / Math.max(1, plan.availableMinutes)} />
          </div>
        </div>
      </div>

      {(evening || !reviewed) && (
        <div className={`card ${evening && !reviewed ? 'accent' : ''}`}>
          <h2>{reviewed ? 'Day reviewed ✓' : 'Evening review'}</h2>
          <p className="muted small" style={{ marginTop: 0 }}>
            {reviewed
              ? 'Tomorrow’s draft is ready in your plan.'
              : 'Record wins, spending, misses and lessons. Takes 5 minutes and drafts tomorrow.'}
          </p>
          <button className="btn block" onClick={() => go('review')}>
            {reviewed ? 'See review' : 'Close the day'}
          </button>
        </div>
      )}

      <button className="btn block ghost" onClick={() => go('coach')} style={{ marginBottom: 12 }}>
        Not sure what to do? Ask the coach →
      </button>

      {adding && <TaskForm defaults={{ top: top.length < 3, priority: 1 }} onClose={() => setAdding(false)} />}
      {focus && <FocusTimer title={focus.title} minutes={focus.minutes} onComplete={focus.done} onClose={() => setFocus(null)} />}
    </>
  );
}
