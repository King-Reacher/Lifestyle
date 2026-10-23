import { useState } from 'react';
import { FocusTimer } from '../components/FocusTimer';
import { TaskForm } from '../components/TaskForm';
import { Bar, Empty } from '../components/ui';
import { addDays, formatDuration, formatLongDate, nowClock, today, toMinutes } from '../lib/dates';
import { deferTask } from '../lib/planner';
import { planFor } from '../lib/selectors';
import { useStore } from '../lib/store';
import type { Task } from '../lib/types';

const PRIORITY = { 1: 'Must', 2: 'Should', 3: 'Could' } as const;

export function Plan() {
  const { state, update } = useStore();
  const [offset, setOffset] = useState(0);
  const date = addDays(today(), offset);
  const plan = planFor(state, date);
  const reduced = state.reducedDays.includes(date);
  const [editing, setEditing] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [focus, setFocus] = useState<Task | null>(null);
  const now = offset === 0 ? toMinutes(nowClock()) : -1;

  const taskById = (id: string) => state.tasks.find((t) => t.id === id);

  const toggle = (id: string) =>
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }));

  const defer = (id: string) => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? deferTask(t) : t)) }));

  const deferAllOverflow = () => {
    const ids = new Set(plan.overflow.filter((o) => o.kind === 'task').map((o) => o.id));
    update((s) => ({ ...s, tasks: s.tasks.map((t) => (ids.has(t.id) ? deferTask(t) : t)) }));
  };

  const setReduced = (on: boolean) =>
    update((s) => ({
      ...s,
      reducedDays: on ? [...new Set([...s.reducedDays, date])] : s.reducedDays.filter((d) => d !== date),
    }));

  const load = plan.plannedMinutes / Math.max(1, plan.availableMinutes);

  return (
    <>
      <div className="row between" style={{ marginTop: 4 }}>
        <h1>Plan</h1>
        <button className="btn primary sm" onClick={() => setAdding(true)}>
          + Task
        </button>
      </div>
      <div className="row" style={{ gap: 6 }}>
        {['Today', 'Tomorrow', '+2 days'].map((l, i) => (
          <button key={l} className={`btn sm ${offset === i ? 'primary' : ''}`} onClick={() => setOffset(i)}>
            {l}
          </button>
        ))}
      </div>
      <p className="muted small">
        {formatLongDate(date)} · {state.settings.dayStart}–{state.settings.dayEnd}
      </p>

      <div className="card">
        <div className="row between small">
          <span>
            {formatDuration(plan.plannedMinutes)} of {formatDuration(plan.availableMinutes)}
          </span>
          <span className={load > 0.85 ? 'chip warn' : 'chip good'}>{load > 0.85 ? 'Packed — leave a buffer' : 'Has breathing room'}</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <Bar value={load} />
        </div>
        <label className="row small" style={{ marginTop: 12 }}>
          <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
          <span>Recovery plan — habits shrink to their minimum, “could do” tasks step aside</span>
        </label>
      </div>

      {plan.overflow.length > 0 && (
        <div className="card bad">
          <h2>Doesn’t fit ({plan.overflow.length})</h2>
          <p className="muted small" style={{ marginTop: 0 }}>
            The planner never books more time than you have. Move these, shorten them, or drop them.
          </p>
          <ul className="list">
            {plan.overflow.map((o) => (
              <li key={o.id} className="row">
                <span className="grow">
                  {o.title} <span className="muted small">· {formatDuration(o.minutes)}</span>
                </span>
                {o.kind === 'task' && (
                  <>
                    <button className="btn sm" onClick={() => setEditing(taskById(o.id) ?? null)}>
                      Edit
                    </button>
                    <button className="btn sm" onClick={() => defer(o.id)}>
                      Tomorrow
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
          {plan.overflow.some((o) => o.kind === 'task') && (
            <button className="btn block" style={{ marginTop: 8 }} onClick={deferAllOverflow}>
              Move all to tomorrow
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h2>Schedule</h2>
        {plan.slots.length === 0 ? (
          <Empty>Nothing scheduled. Add your must-dos first.</Empty>
        ) : (
          <ul className="list">
            {plan.slots.map((s) => {
              const task = s.kind === 'task' ? taskById(s.id) : undefined;
              const live = now >= toMinutes(s.start) && now < toMinutes(s.end) && !s.done;
              return (
                <li key={`${s.kind}:${s.id}`} className="row">
                  <span className="timeline-time">{s.start}</span>
                  {live && <span className="now-dot" title="Now" />}
                  <div className="grow" onClick={() => task && setEditing(task)} style={{ cursor: task ? 'pointer' : 'default' }}>
                    <div className={s.done ? 'done-text' : ''}>
                      {s.top && '★ '}
                      {s.title}
                    </div>
                    <div className="muted small">
                      {s.kind === 'habit' ? 'Habit' : PRIORITY[task?.priority ?? 2]} · {formatDuration(s.minutes)}
                      {!s.fixed && ' · auto-placed'}
                      {task && task.rolledOver > 0 && ` · rolled ×${task.rolledOver}`}
                    </div>
                  </div>
                  {task && (
                    <>
                      {!task.done && offset === 0 && (
                        <button className="btn sm" onClick={() => setFocus(task)} aria-label="Focus">
                          ▶
                        </button>
                      )}
                      <button className={`check ${task.done ? 'on' : ''}`} onClick={() => toggle(task.id)} aria-label="Toggle done">
                        {task.done ? '✓' : ''}
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {adding && <TaskForm defaults={{ date }} onClose={() => setAdding(false)} />}
      {editing && <TaskForm task={editing} onClose={() => setEditing(null)} />}
      {focus && (
        <FocusTimer
          title={focus.title}
          minutes={focus.minutes}
          onComplete={() => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === focus.id ? { ...t, done: true } : t)) }))}
          onClose={() => setFocus(null)}
        />
      )}
    </>
  );
}
