import { useState } from 'react';
import { TaskForm } from '../components/TaskForm';
import { Bar, Empty, Field, Sheet } from '../components/ui';
import { diffDays, today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import { AREA_LABELS, type Area, type Goal } from '../lib/types';

const AREA_HINTS: Record<Area, string> = {
  education: 'JAMB, admission, topics mastered, practice scores',
  money: 'Emergency fund, savings targets (track amounts in Money)',
  career: 'Primary path, skill roadmap, projects, applications',
  personal: 'Reading, communication, exercise, sleep, reflection',
};

export function Goals() {
  const { state } = useStore();
  const [editing, setEditing] = useState<Goal | 'new' | null>(null);
  const [taskFor, setTaskFor] = useState<Goal | null>(null);

  return (
    <>
      <div className="row between" style={{ marginTop: 4 }}>
        <h1>Goals</h1>
        <button className="btn primary sm" onClick={() => setEditing('new')}>
          + Goal
        </button>
      </div>
      <p className="muted small" style={{ marginTop: 0 }}>
        Every goal needs a daily action — a linked habit or a scheduled task. Otherwise it’s just a wish.
      </p>

      {(Object.keys(AREA_LABELS) as Area[]).map((area) => {
        const goals = state.goals.filter((g) => g.area === area);
        return (
          <div key={area}>
            <h2 className="section-title">{AREA_LABELS[area]}</h2>
            {goals.length === 0 && (
              <div className="card">
                <Empty>{AREA_HINTS[area]}</Empty>
              </div>
            )}
            {goals.map((g) => {
              const done = g.milestones.filter((m) => m.done).length;
              const habits = state.habits.filter((h) => g.habitIds.includes(h.id) && !h.archived);
              const openTasks = state.tasks.filter((t) => t.goalId === g.id && !t.done);
              const connected = habits.length > 0 || openTasks.length > 0;
              const daysLeft = g.deadline ? diffDays(today(), g.deadline) : null;
              return (
                <div key={g.id} className={`card ${connected ? '' : 'warn'}`}>
                  <div onClick={() => setEditing(g)} style={{ cursor: 'pointer' }}>
                    <div className="row between">
                      <h3 style={{ margin: 0 }}>{g.title}</h3>
                      {daysLeft !== null && (
                        <span className={`chip ${daysLeft < 0 ? 'bad' : daysLeft < 30 ? 'warn' : ''}`}>
                          {daysLeft < 0 ? `${-daysLeft}d overdue` : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                    {g.why && <p className="muted small" style={{ margin: '4px 0' }}>Why: {g.why}</p>}
                  </div>
                  {g.milestones.length > 0 && (
                    <>
                      <MilestoneList goal={g} />
                      <Bar value={done / g.milestones.length} tone="good" />
                    </>
                  )}
                  <div className="small" style={{ marginTop: 10 }}>
                    {connected ? (
                      <span className="muted">
                        Daily action: {[...habits.map((h) => h.title), ...openTasks.slice(0, 2).map((t) => t.title)].join(' · ')}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--warn)' }}>Not connected to any daily action yet.</span>
                    )}
                  </div>
                  <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setTaskFor(g)}>
                    + Next action
                  </button>
                </div>
              );
            })}
          </div>
        );
      })}

      {editing && <GoalForm goal={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
      {taskFor && <TaskForm defaults={{ goalId: taskFor.id, priority: 1 }} onClose={() => setTaskFor(null)} />}
    </>
  );
}

function MilestoneList({ goal }: { goal: Goal }) {
  const { update } = useStore();
  const toggle = (id: string) =>
    update((s) => ({
      ...s,
      goals: s.goals.map((g) =>
        g.id === goal.id ? { ...g, milestones: g.milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m)) } : g,
      ),
    }));
  return (
    <ul className="list" style={{ margin: '6px 0 10px' }}>
      {goal.milestones.map((m) => (
        <li key={m.id} className="row" style={{ padding: '8px 0' }}>
          <button className={`check ${m.done ? 'on' : ''}`} onClick={() => toggle(m.id)} aria-label="Toggle milestone">
            {m.done ? '✓' : ''}
          </button>
          <span className={`small ${m.done ? 'done-text' : ''}`}>{m.title}</span>
        </li>
      ))}
    </ul>
  );
}

function GoalForm({ goal, onClose }: { goal?: Goal; onClose: () => void }) {
  const { update } = useStore();
  const [draft, setDraft] = useState<Goal>(
    goal ?? { id: uid(), title: '', area: 'education', why: '', milestones: [], habitIds: [], createdAt: today() },
  );
  const [milestone, setMilestone] = useState('');
  const set = <K extends keyof Goal>(k: K, v: Goal[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addMilestone = () => {
    if (!milestone.trim()) return;
    set('milestones', [...draft.milestones, { id: uid(), title: milestone.trim(), done: false }]);
    setMilestone('');
  };

  const save = () => {
    if (!draft.title.trim()) return;
    update((s) => ({ ...s, goals: goal ? s.goals.map((g) => (g.id === goal.id ? draft : g)) : [...s.goals, draft] }));
    onClose();
  };

  const remove = () => {
    update((s) => ({
      ...s,
      goals: s.goals.filter((g) => g.id !== draft.id),
      tasks: s.tasks.map((t) => (t.goalId === draft.id ? { ...t, goalId: undefined } : t)),
    }));
    onClose();
  };

  return (
    <Sheet title={goal ? 'Edit goal' : 'New goal'} onClose={onClose}>
      <Field label="Goal">
        <input autoFocus value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="Score 280+ in JAMB" />
      </Field>
      <div className="grid2">
        <Field label="Area">
          <select value={draft.area} onChange={(e) => set('area', e.target.value as Area)}>
            {Object.entries(AREA_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deadline">
          <input type="date" value={draft.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || undefined)} />
        </Field>
      </div>
      <Field label="Why does it matter?">
        <textarea value={draft.why} onChange={(e) => set('why', e.target.value)} placeholder="Read this on the days you don't feel like it." />
      </Field>
      <Field label="Milestones — break it into monthly/weekly deliverables">
        <div className="row">
          <input
            className="grow"
            value={milestone}
            onChange={(e) => setMilestone(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMilestone())}
            placeholder="Finish algebra past questions"
          />
          <button className="btn" onClick={addMilestone} type="button">
            Add
          </button>
        </div>
      </Field>
      <ul className="list small">
        {draft.milestones.map((m) => (
          <li key={m.id} className="row between">
            <span>{m.title}</span>
            <button className="btn sm ghost" onClick={() => set('milestones', draft.milestones.filter((x) => x.id !== m.id))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <p className="muted small">Link habits from the Habits tab (“Moves which goal?”).</p>
      <div className="row">
        {goal && (
          <button className="btn danger" onClick={remove}>
            Delete
          </button>
        )}
        <button className="btn primary grow" onClick={save} disabled={!draft.title.trim()}>
          Save
        </button>
      </div>
    </Sheet>
  );
}
