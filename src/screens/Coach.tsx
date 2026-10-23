import { useState } from 'react';
import { Field } from '../components/ui';
import { STEP_LABELS, SITUATIONS, shouldAsk, type Answers, type Recommendation, type Situation } from '../lib/coach';
import { addDays, formatDuration, today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import type { Screen } from '../App';

type Phase = { kind: 'pick' } | { kind: 'ask'; situation: Situation; index: number } | { kind: 'decide'; situation: Situation; rec: Recommendation; asked: boolean } | { kind: 'executed'; action: string; due: string };

export function Coach({ go }: { go: (s: Screen) => void }) {
  const { state, update } = useStore();
  const [phase, setPhase] = useState<Phase>({ kind: 'pick' });
  const [answers, setAnswers] = useState<Answers>({});

  const start = (situation: Situation) => {
    setAnswers({});
    if (shouldAsk(state.settings.coachMode, situation)) setPhase({ kind: 'ask', situation, index: 0 });
    else setPhase({ kind: 'decide', situation, rec: situation.quick, asked: false });
  };

  const execute = (situation: Situation, rec: Recommendation) => {
    const date = addDays(today(), rec.dueInDays);
    const taskId = uid();
    update((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { id: taskId, title: rec.action, date, minutes: rec.minutes, priority: 1, done: false, top: false, rolledOver: 0, source: 'coach' },
      ],
      decisions: [
        ...s.decisions,
        { id: uid(), date: today(), situation: situation.label, answers, action: rec.action, taskId },
      ],
      reducedDays: rec.reducePlan && !s.reducedDays.includes(today()) ? [...s.reducedDays, today()] : s.reducedDays,
    }));
    setPhase({ kind: 'executed', action: rec.action, due: rec.dueInDays === 0 ? 'today' : rec.dueInDays === 1 ? 'tomorrow' : `in ${rec.dueInDays} days` });
  };

  const pendingReviews = state.decisions.filter((d) => !d.outcome && d.date < today()).slice(-3).reverse();
  const learned = [...new Set(state.decisions.filter((d) => d.outcome).map((d) => d.outcome!))].slice(-3);

  if (phase.kind === 'ask') {
    const { situation, index } = phase;
    const q = situation.questions[index];
    const value = answers[q.id] ?? '';
    const last = index === situation.questions.length - 1;
    const next = () => {
      if (last) setPhase({ kind: 'decide', situation, rec: situation.recommend(answers), asked: true });
      else setPhase({ kind: 'ask', situation, index: index + 1 });
    };
    return (
      <>
        <button className="btn sm ghost" style={{ marginTop: 12 }} onClick={() => setPhase({ kind: 'pick' })}>
          ← Back
        </button>
        <div className="eyebrow" style={{ marginTop: 12 }}>
          {situation.label}
        </div>
        <div className="steps">
          {situation.questions.map((_, i) => (
            <i key={i} className={i <= index ? 'on' : ''} />
          ))}
        </div>
        <div className="card">
          <div className="eyebrow">{STEP_LABELS[q.step]}</div>
          <h2 style={{ marginTop: 8 }}>{q.prompt}</h2>
          {q.type === 'choice' ? (
            q.options!.map((o) => (
              <button
                key={o}
                className={`btn choice ${value === o ? 'selected' : ''}`}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))}
              >
                {o}
              </button>
            ))
          ) : (
            <textarea autoFocus value={value} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
          )}
          <div className="row" style={{ marginTop: 12 }}>
            {index > 0 && (
              <button className="btn" onClick={() => setPhase({ kind: 'ask', situation, index: index - 1 })}>
                Previous
              </button>
            )}
            <button className="btn primary grow" onClick={next} disabled={q.type === 'choice' && !value}>
              {last ? 'Decide' : 'Next'}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (phase.kind === 'decide') {
    const { situation, rec, asked } = phase;
    return (
      <>
        <button className="btn sm ghost" style={{ marginTop: 12 }} onClick={() => setPhase({ kind: 'pick' })}>
          ← Back
        </button>
        <div className="eyebrow" style={{ marginTop: 12 }}>
          {situation.label}
        </div>
        <div className="card accent">
          <div className="eyebrow">{STEP_LABELS.decide}</div>
          <h2 style={{ marginTop: 8 }}>{rec.action}</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            {rec.why}
          </p>
          <div className="chip">
            ⏱ {formatDuration(rec.minutes)} · due {rec.dueInDays === 0 ? 'today' : rec.dueInDays === 1 ? 'tomorrow' : `in ${rec.dueInDays} days`}
          </div>
          {rec.reducePlan && (
            <p className="small" style={{ color: 'var(--warn)' }}>
              This also switches today to the recovery plan.
            </p>
          )}
          {rec.note && <p className="small" style={{ color: 'var(--warn)' }}>{rec.note}</p>}
        </div>
        <div className="card">
          <div className="eyebrow">Principle to remember</div>
          <p style={{ margin: '6px 0 0', fontWeight: 600 }}>{rec.principle}</p>
          <p className="muted small" style={{ marginBottom: 0 }}>
            Next time, try answering it yourself before opening the coach.
          </p>
        </div>
        <button className="btn primary block" onClick={() => execute(situation, rec)}>
          Make it a task
        </button>
        {!asked && (
          <button
            className="btn block ghost"
            style={{ marginTop: 8 }}
            onClick={() => {
              setAnswers({});
              setPhase({ kind: 'ask', situation, index: 0 });
            }}
          >
            This doesn’t fit — ask me questions instead
          </button>
        )}
      </>
    );
  }

  if (phase.kind === 'executed') {
    return (
      <>
        <h1 style={{ marginTop: 16 }}>Decided. Now execute.</h1>
        <div className="card accent">
          <p style={{ marginTop: 0 }}>{phase.action}</p>
          <span className="chip">Added to your plan · due {phase.due}</span>
        </div>
        <p className="muted small">You’ll be asked how it went in a later review — that’s how judgment improves.</p>
        <div className="row">
          <button className="btn grow" onClick={() => setPhase({ kind: 'pick' })}>
            Done
          </button>
          <button className="btn primary grow" onClick={() => go('today')}>
            Go to Today
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 style={{ marginTop: 4 }}>What should I do?</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Pick what’s happening. {state.settings.coachMode === 'both' && 'Routine moments get a fast answer; big decisions get questions first.'}
        {state.settings.coachMode === 'ask' && 'You’ll think it through step by step.'}
        {state.settings.coachMode === 'suggest' && 'You’ll get the best next action straight away.'}
      </p>
      {SITUATIONS.map((s) => (
        <button key={s.id} className="btn choice" style={{ padding: 16 }} onClick={() => start(s)}>
          {s.label}
        </button>
      ))}

      {pendingReviews.length > 0 && (
        <>
          <h2 className="section-title">Did it work?</h2>
          {pendingReviews.map((d) => (
            <OutcomeCard key={d.id} id={d.id} situation={d.situation} action={d.action} done={!!state.tasks.find((t) => t.id === d.taskId)?.done} />
          ))}
        </>
      )}

      {learned.length > 0 && (
        <div className="card">
          <h2>What you’ve learned</h2>
          <ul style={{ paddingLeft: 18, margin: 0 }} className="small">
            {learned.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">The process</div>
        <ol className="small" style={{ paddingLeft: 18, marginBottom: 0 }}>
          {Object.values(STEP_LABELS).map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ol>
      </div>
    </>
  );
}

function OutcomeCard({ id, situation, action, done }: { id: string; situation: string; action: string; done: boolean }) {
  const { update } = useStore();
  const [text, setText] = useState('');
  return (
    <div className="card">
      <div className="eyebrow">{situation}</div>
      <p style={{ margin: '6px 0' }}>{action}</p>
      <span className={`chip ${done ? 'good' : 'warn'}`}>{done ? 'Task completed' : 'Task not completed'}</span>
      <Field label="Did it work? What will you do differently?">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. The 10-minute start worked — use it every morning" />
      </Field>
      <button
        className="btn block"
        disabled={!text.trim()}
        onClick={() => update((s) => ({ ...s, decisions: s.decisions.map((d) => (d.id === id ? { ...d, outcome: text.trim() } : d)) }))}
      >
        Save lesson
      </button>
    </div>
  );
}
