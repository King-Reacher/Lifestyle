import { useState } from 'react';
import { Bar, Field } from '../components/ui';
import { addDays, diffDays, formatDuration, today, weekStart } from '../lib/dates';
import { consistency, missReasons } from '../lib/habits';
import { formatMoney, inRange } from '../lib/money';
import { deferTask } from '../lib/planner';
import { dayScore } from '../lib/score';
import { activeHabits, planFor } from '../lib/selectors';
import { useStore } from '../lib/store';
import type { DayReview } from '../lib/types';

export function Review() {
  const [tab, setTab] = useState<'day' | 'week'>('day');
  return (
    <>
      <h1 style={{ marginTop: 4 }}>Review</h1>
      <div className="row" style={{ gap: 6 }}>
        <button className={`btn sm ${tab === 'day' ? 'primary' : ''}`} onClick={() => setTab('day')}>
          Tonight
        </button>
        <button className={`btn sm ${tab === 'week' ? 'primary' : ''}`} onClick={() => setTab('week')}>
          This week
        </button>
      </div>
      {tab === 'day' ? <DayReviewView /> : <WeekReviewView />}
    </>
  );
}

function DayReviewView() {
  const { state, update } = useStore();
  const date = today();
  const tomorrow = addDays(date, 1);
  const existing = state.reviews.find((r) => r.date === date);
  const tasks = state.tasks.filter((t) => t.date === date);
  const unfinished = tasks.filter((t) => !t.done);
  const distractions = state.distractions.filter((d) => d.date === date);
  const spent = inRange(state.transactions, date, date).filter((t) => t.kind === 'essential' || t.kind === 'discretionary');
  const [draft, setDraft] = useState<DayReview>(
    existing ?? {
      date,
      wins: tasks.filter((t) => t.done).map((t) => t.title).join(', '),
      missed: unfinished.map((t) => t.title).join(', '),
      lessons: '',
      energy: 3,
    },
  );
  const [saved, setSaved] = useState(!!existing);
  const score = dayScore(state, date);
  const set = <K extends keyof DayReview>(k: K, v: DayReview[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const save = () => {
    const ids = new Set(unfinished.map((t) => t.id));
    update((s) => ({
      ...s,
      reviews: [...s.reviews.filter((r) => r.date !== date), draft],
      tasks: s.tasks.map((t) => (ids.has(t.id) ? deferTask(t) : t)),
    }));
    setSaved(true);
  };

  if (saved) {
    const plan = planFor(state, tomorrow);
    return (
      <>
        <div className="card accent">
          <h2>Day closed ✓</h2>
          <p className="muted small" style={{ marginTop: 0 }}>
            Score {dayScore(state, date).score}. Unfinished work moved to tomorrow. Here’s the draft:
          </p>
        </div>
        <div className="card">
          <h2>Tomorrow’s draft</h2>
          {plan.slots.length === 0 ? (
            <p className="muted small">Empty. Add tomorrow’s must-dos in Plan.</p>
          ) : (
            <ul className="list small">
              {plan.slots.map((s) => (
                <li key={`${s.kind}:${s.id}`} className="row">
                  <span className="timeline-time">{s.start}</span>
                  <span className="grow">{s.title}</span>
                  <span className="muted">{formatDuration(s.minutes)}</span>
                </li>
              ))}
            </ul>
          )}
          {plan.overflow.length > 0 && (
            <p className="small" style={{ color: 'var(--warn)' }}>
              {plan.overflow.length} item(s) won’t fit tomorrow — trim them in Plan.
            </p>
          )}
        </div>
        <button className="btn block" onClick={() => setSaved(false)}>
          Edit tonight’s review
        </button>
      </>
    );
  }

  return (
    <>
      <div className="card">
        <div className="grid2 small">
          <div>
            <div className="muted">Score so far</div>
            <b>{score.score}</b>
          </div>
          <div>
            <div className="muted">Tasks done</div>
            <b>
              {tasks.length - unfinished.length}/{tasks.length}
            </b>
          </div>
          <div>
            <div className="muted">Distractions logged</div>
            <b>{distractions.length}</b>
          </div>
          <div>
            <div className="muted">Spent today</div>
            <b>{formatMoney(spent.reduce((s, t) => s + t.amount, 0), state.settings.currency)}</b>
          </div>
        </div>
        {distractions.length > 0 && (
          <p className="muted small" style={{ marginBottom: 0 }}>
            Distractions: {distractions.map((d) => `${d.time} ${d.note}`).join(' · ')}
          </p>
        )}
      </div>
      <Field label="What went well?">
        <textarea value={draft.wins} onChange={(e) => set('wins', e.target.value)} />
      </Field>
      <Field label="What was missed, and why?">
        <textarea value={draft.missed} onChange={(e) => set('missed', e.target.value)} />
      </Field>
      <Field label="Lesson for tomorrow">
        <textarea value={draft.lessons} onChange={(e) => set('lessons', e.target.value)} placeholder="One sentence you'll act on." />
      </Field>
      <Field label="Energy today">
        <div className="row" style={{ gap: 6 }}>
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button key={n} className={`btn grow ${draft.energy === n ? 'primary' : ''}`} onClick={() => set('energy', n)} type="button">
              {n}
            </button>
          ))}
        </div>
      </Field>
      {unfinished.length > 0 && (
        <p className="muted small">Saving moves {unfinished.length} unfinished task(s) to tomorrow.</p>
      )}
      <button className="btn primary block" onClick={save} style={{ marginBottom: 12 }}>
        Close the day & draft tomorrow
      </button>
    </>
  );
}

function WeekReviewView() {
  const { state, update } = useStore();
  const date = today();
  const start = weekStart(date);
  const days = diffDays(start, date) + 1;
  const existing = state.weeklyReviews.find((w) => w.weekStart === start);
  const lastWeek = state.weeklyReviews.find((w) => w.weekStart === addDays(start, -7));
  const [bottleneck, setBottleneck] = useState(existing?.bottleneck ?? '');
  const [adjustment, setAdjustment] = useState(existing?.adjustment ?? '');
  const [saved, setSaved] = useState(false);

  const weekTasks = state.tasks.filter((t) => diffDays(start, t.date) >= 0 && diffDays(t.date, date) >= 0);
  const scores = Array.from({ length: days }, (_, i) => dayScore(state, addDays(start, i)).score);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const weekLogs = state.habitLogs.filter((l) => diffDays(start, l.date) >= 0);
  const reasons = missReasons(weekLogs).slice(0, 3);
  const distractions = state.distractions.filter((d) => diffDays(start, d.date) >= 0);
  const topDistraction = Object.entries(
    distractions.reduce<Record<string, number>>((m, d) => ({ ...m, [d.note.toLowerCase()]: (m[d.note.toLowerCase()] ?? 0) + 1 }), {}),
  ).sort((a, b) => b[1] - a[1])[0];
  const chronic = state.tasks.filter((t) => !t.done && t.rolledOver >= 2);

  return (
    <>
      <div className="card">
        <div className="eyebrow">Week of {start}</div>
        <div className="grid2 small" style={{ marginTop: 8 }}>
          <div>
            <div className="muted">Average score</div>
            <b>{avg}</b>
          </div>
          <div>
            <div className="muted">Tasks done</div>
            <b>
              {weekTasks.filter((t) => t.done).length}/{weekTasks.length}
            </b>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Habit consistency this week</h2>
        {activeHabits(state, date).map((h) => {
          const c = consistency(h, state.habitLogs, date, days);
          return (
            <div key={h.id} style={{ margin: '10px 0' }}>
              <div className="row between small">
                <span>{h.title}</span>
                <b>{Math.round(c * 100)}%</b>
              </div>
              <Bar value={c} tone="good" />
            </div>
          );
        })}
      </div>

      {(reasons.length > 0 || topDistraction || chronic.length > 0) && (
        <div className="card warn">
          <h2>Bottlenecks the data shows</h2>
          <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>
            {reasons.map((r) => (
              <li key={r.reason}>
                Missed habits because “{r.reason}” ×{r.count}
              </li>
            ))}
            {topDistraction && (
              <li>
                Top distraction: “{topDistraction[0]}” ×{topDistraction[1]}
              </li>
            )}
            {chronic.slice(0, 3).map((t) => (
              <li key={t.id}>
                “{t.title}” keeps getting pushed (×{t.rolledOver})
              </li>
            ))}
          </ul>
        </div>
      )}

      {lastWeek?.adjustment && (
        <div className="card">
          <div className="eyebrow">Last week you decided</div>
          <p style={{ margin: '6px 0 0' }}>{lastWeek.adjustment}</p>
          <p className="muted small" style={{ marginBottom: 0 }}>Did you do it?</p>
        </div>
      )}

      <Field label="Biggest bottleneck this week">
        <textarea value={bottleneck} onChange={(e) => setBottleneck(e.target.value)} />
      </Field>
      <Field label="One adjustment for next week">
        <textarea value={adjustment} onChange={(e) => setAdjustment(e.target.value)} placeholder="e.g. Study maths at 6am before my phone is on" />
      </Field>
      <button
        className="btn primary block"
        style={{ marginBottom: 12 }}
        disabled={!adjustment.trim()}
        onClick={() => {
          update((s) => ({
            ...s,
            weeklyReviews: [...s.weeklyReviews.filter((w) => w.weekStart !== start), { weekStart: start, bottleneck, adjustment }],
          }));
          setSaved(true);
        }}
      >
        {saved ? 'Saved ✓' : 'Save recalibration'}
      </button>
    </>
  );
}
