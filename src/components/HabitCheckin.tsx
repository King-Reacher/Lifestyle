import { useState } from 'react';
import { logFor } from '../lib/habits';
import { useStore } from '../lib/store';
import type { Habit, HabitStatus, ISODate } from '../lib/types';
import { Field, Sheet } from './ui';

const COMMON_REASONS = ['No time', 'Too tired', 'Forgot', 'Unexpected event', 'Lost motivation', 'Phone / distraction'];

/** Done / minimum / missed buttons for one habit on one day. Misses ask for a reason. */
export function HabitCheckin({ habit, date }: { habit: Habit; date: ISODate }) {
  const { state, update } = useStore();
  const [askingReason, setAskingReason] = useState(false);
  const [reason, setReason] = useState('');
  const status = logFor(state.habitLogs, habit.id, date)?.status;

  const setStatus = (next: HabitStatus | null, why?: string) => {
    update((s) => ({
      ...s,
      habitLogs: [
        ...s.habitLogs.filter((l) => !(l.habitId === habit.id && l.date === date)),
        ...(next ? [{ habitId: habit.id, date, status: next, reason: why }] : []),
      ],
    }));
  };

  const toggle = (next: HabitStatus) => {
    if (status === next) return setStatus(null);
    if (next === 'missed') return setAskingReason(true);
    setStatus(next);
  };

  return (
    <>
      <div className="row" style={{ gap: 6 }}>
        <button className={`check ${status === 'done' ? 'on' : ''}`} onClick={() => toggle('done')} title="Done" aria-label={`Mark ${habit.title} done`}>
          {status === 'done' ? '✓' : ''}
        </button>
        <button
          className={`check ${status === 'minimum' ? 'half' : ''}`}
          onClick={() => toggle('minimum')}
          title={`Minimum: ${habit.minimum}`}
          aria-label={`Mark ${habit.title} minimum version`}
          style={{ fontSize: 11, fontWeight: 800, color: status === 'minimum' ? 'var(--text)' : 'var(--muted)' }}
        >
          min
        </button>
        <button
          className={`check ${status === 'missed' ? 'off' : ''}`}
          onClick={() => toggle('missed')}
          title="Missed"
          aria-label={`Mark ${habit.title} missed`}
          style={{ color: status === 'missed' ? 'var(--bad)' : 'var(--muted)' }}
        >
          ✕
        </button>
      </div>
      {askingReason && (
        <Sheet title="What got in the way?" onClose={() => setAskingReason(false)}>
          <p className="muted small">
            No judgement — the reason is data. Patterns in your reasons show what to fix.
          </p>
          <div className="row wrap" style={{ gap: 6 }}>
            {COMMON_REASONS.map((r) => (
              <button key={r} className={`btn sm ${reason === r ? 'primary' : ''}`} onClick={() => setReason(r)}>
                {r}
              </button>
            ))}
          </div>
          <Field label="Or in your words">
            <input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <p className="small">
            Before you mark it missed: could you do the minimum — <b>{habit.minimum}</b> — right now?
          </p>
          <div className="row">
            <button
              className="btn grow"
              onClick={() => {
                setStatus('minimum');
                setAskingReason(false);
              }}
            >
              I'll do the minimum
            </button>
            <button
              className="btn primary grow"
              onClick={() => {
                setStatus('missed', reason.trim() || undefined);
                setAskingReason(false);
                setReason('');
              }}
            >
              Mark missed
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}
