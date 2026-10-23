import { useState } from 'react';
import { HabitCheckin } from '../components/HabitCheckin';
import { Bar, Empty, Field, Sheet } from '../components/ui';
import { addDays, formatDuration, today } from '../lib/dates';
import { bestStreak, consistency, currentStreak, logFor, missReasons, recoveryPlan } from '../lib/habits';
import { uid, useStore } from '../lib/store';
import { AREA_LABELS, type Area, type Habit } from '../lib/types';

export function Habits() {
  const { state } = useStore();
  const date = today();
  const [editing, setEditing] = useState<Habit | 'new' | null>(null);
  const habits = state.habits.filter((h) => !h.archived);
  const reasons = missReasons(state.habitLogs).slice(0, 3);

  return (
    <>
      <div className="row between" style={{ marginTop: 4 }}>
        <h1>Habits</h1>
        <button className="btn primary sm" onClick={() => setEditing('new')}>
          + Habit
        </button>
      </div>
      <p className="muted small" style={{ marginTop: 0 }}>
        {state.settings.disciplineMode === 'strict'
          ? 'Strict mode: any missed day resets the streak.'
          : 'Never miss twice: one missed day is forgiven, two in a row reset the streak. Consistency keeps the long view.'}
      </p>

      {habits.length === 0 && (
        <div className="card">
          <Empty>
            Start with one habit tied to your biggest goal.
            <br />
            Give it a time and a minimum version for hard days.
          </Empty>
        </div>
      )}

      {habits.map((h) => {
        const streak = currentStreak(h, state.habitLogs, date, state.settings.disciplineMode);
        const week = consistency(h, state.habitLogs, date, 7);
        const month = consistency(h, state.habitLogs, date, 30);
        const recovery = recoveryPlan(h, state.habitLogs, date);
        return (
          <div key={h.id} className="card">
            <div className="row">
              <div className="grow" onClick={() => setEditing(h)} style={{ cursor: 'pointer' }}>
                <h3 style={{ margin: 0 }}>{h.title}</h3>
                <div className="muted small">
                  {AREA_LABELS[h.area]} · {h.time} · {formatDuration(h.minutes)} · min: {h.minimum}
                </div>
              </div>
              <HabitCheckin habit={h} date={date} />
            </div>
            <div className="dots" style={{ margin: '12px 0' }} aria-label="Last 14 days">
              {Array.from({ length: 14 }, (_, i) => {
                const d = addDays(date, i - 13);
                return <i key={d} className={logFor(state.habitLogs, h.id, d)?.status ?? ''} title={d} />;
              })}
            </div>
            <div className="grid2 small">
              <div>
                <div className="muted">Streak</div>
                <b>🔥 {streak}</b> <span className="muted">(best {bestStreak(h, state.habitLogs, date)})</span>
              </div>
              <div>
                <div className="muted">Consistency 7d / 30d</div>
                <b>{Math.round(week * 100)}%</b> / <b>{Math.round(month * 100)}%</b>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <Bar value={month} tone="good" />
            </div>
            {recovery && <p className="small" style={{ color: 'var(--warn)', marginBottom: 0 }}>{recovery}</p>}
          </div>
        );
      })}

      {reasons.length > 0 && (
        <div className="card">
          <h2>Why you miss</h2>
          <ul className="list small">
            {reasons.map((r) => (
              <li key={r.reason} className="row between">
                <span style={{ textTransform: 'capitalize' }}>{r.reason}</span>
                <span className="muted">×{r.count}</span>
              </li>
            ))}
          </ul>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Fix the top reason, not your willpower: move the time, shrink the minimum, or prepare the night before.
          </p>
        </div>
      )}

      {editing && <HabitForm habit={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function HabitForm({ habit, onClose }: { habit?: Habit; onClose: () => void }) {
  const { state, update } = useStore();
  const [draft, setDraft] = useState<Habit>(
    habit ?? {
      id: uid(),
      title: '',
      area: 'education',
      minimum: '',
      time: '07:00',
      minutes: 45,
      createdAt: today(),
      archived: false,
    },
  );
  const [goalId, setGoalId] = useState(state.goals.find((g) => g.habitIds.includes(draft.id))?.id ?? '');
  const set = <K extends keyof Habit>(k: K, v: Habit[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const valid = draft.title.trim() && draft.minimum.trim();

  const save = () => {
    if (!valid) return;
    update((s) => ({
      ...s,
      habits: habit ? s.habits.map((h) => (h.id === habit.id ? draft : h)) : [...s.habits, draft],
      goals: s.goals.map((g) => {
        const without = g.habitIds.filter((id) => id !== draft.id);
        return { ...g, habitIds: g.id === goalId ? [...without, draft.id] : without };
      }),
    }));
    onClose();
  };

  const archive = () => {
    update((s) => ({ ...s, habits: s.habits.map((h) => (h.id === draft.id ? { ...h, archived: true } : h)) }));
    onClose();
  };

  return (
    <Sheet title={habit ? 'Edit habit' : 'New habit'} onClose={onClose}>
      <Field label="Clear action">
        <input autoFocus value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Study mathematics" />
      </Field>
      <Field label="Minimum version (for hard days)">
        <input value={draft.minimum} onChange={(e) => set('minimum', e.target.value)} placeholder="Solve one past question" />
      </Field>
      <div className="grid2">
        <Field label="Time">
          <input type="time" value={draft.time} onChange={(e) => set('time', e.target.value || '07:00')} />
        </Field>
        <Field label="Minutes">
          <input type="number" min={5} step={5} value={draft.minutes} onChange={(e) => set('minutes', Math.max(5, Number(e.target.value) || 5))} />
        </Field>
      </div>
      <Field label="Area">
        <select value={draft.area} onChange={(e) => set('area', e.target.value as Area)}>
          {Object.entries(AREA_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Moves which goal?">
        <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
          <option value="">— none —</option>
          {state.goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </Field>
      <div className="row" style={{ marginTop: 8 }}>
        {habit && (
          <button className="btn danger" onClick={archive}>
            Archive
          </button>
        )}
        <button className="btn primary grow" onClick={save} disabled={!valid}>
          Save
        </button>
      </div>
    </Sheet>
  );
}
