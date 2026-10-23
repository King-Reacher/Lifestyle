import { useState } from 'react';
import { addDays, today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import type { Priority, Task } from '../lib/types';
import { Field, Sheet } from './ui';

export function TaskForm({ task, defaults, onClose }: {
  task?: Task;
  defaults?: Partial<Task>;
  onClose: () => void;
}) {
  const { state, update } = useStore();
  const [draft, setDraft] = useState<Task>(
    task ?? {
      id: uid(),
      title: '',
      date: today(),
      minutes: 30,
      priority: 2,
      done: false,
      top: false,
      rolledOver: 0,
      source: 'manual',
      ...defaults,
    },
  );
  const set = <K extends keyof Task>(k: K, v: Task[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const topCount = state.tasks.filter((t) => t.date === draft.date && t.top && t.id !== draft.id).length;

  const save = () => {
    if (!draft.title.trim()) return;
    update((s) => ({
      ...s,
      tasks: task ? s.tasks.map((t) => (t.id === task.id ? draft : t)) : [...s.tasks, draft],
    }));
    onClose();
  };

  const remove = () => {
    update((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== draft.id) }));
    onClose();
  };

  return (
    <Sheet title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <Field label="What exactly will you do?">
        <input autoFocus value={draft.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 20 JAMB maths past questions" />
      </Field>
      <div className="grid2">
        <Field label="Day">
          <select value={draft.date} onChange={(e) => set('date', e.target.value)}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const d = addDays(today(), i);
              return (
                <option key={d} value={d}>
                  {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d}
                </option>
              );
            })}
            {!([0, 1, 2, 3, 4, 5, 6].map((i) => addDays(today(), i)).includes(draft.date)) && (
              <option value={draft.date}>{draft.date}</option>
            )}
          </select>
        </Field>
        <Field label="Minutes">
          <input type="number" min={5} step={5} value={draft.minutes} onChange={(e) => set('minutes', Math.max(5, Number(e.target.value) || 5))} />
        </Field>
        <Field label="Fixed time (optional)">
          <input type="time" value={draft.start ?? ''} onChange={(e) => set('start', e.target.value || undefined)} />
        </Field>
        <Field label="Priority">
          <select value={draft.priority} onChange={(e) => set('priority', Number(e.target.value) as Priority)}>
            <option value={1}>Must do</option>
            <option value={2}>Should do</option>
            <option value={3}>Could do</option>
          </select>
        </Field>
      </div>
      <Field label="Moves which goal?">
        <select value={draft.goalId ?? ''} onChange={(e) => set('goalId', e.target.value || undefined)}>
          <option value="">— none —</option>
          {state.goals.map((g) => (
            <option key={g.id} value={g.id}>
              {g.title}
            </option>
          ))}
        </select>
      </Field>
      <label className="row" style={{ margin: '12px 0' }}>
        <input type="checkbox" checked={draft.top} disabled={!draft.top && topCount >= 3} onChange={(e) => set('top', e.target.checked)} />
        <span>
          One of the day's 3 most important outcomes
          {!draft.top && topCount >= 3 && <span className="muted small"> (already 3 chosen)</span>}
        </span>
      </label>
      <div className="row">
        {task && (
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
