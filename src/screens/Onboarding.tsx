import { useState } from 'react';
import { Field } from '../components/ui';
import { today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import type { AppState, CoachMode, DisciplineMode } from '../lib/types';
import { COACH_OPTIONS, DISCIPLINE_OPTIONS } from './Settings';

export function Onboarding() {
  const { update } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<DisciplineMode>('firm');
  const [coach, setCoach] = useState<CoachMode>('both');
  const [dayStart, setDayStart] = useState('06:00');
  const [dayEnd, setDayEnd] = useState('22:00');
  const [goal, setGoal] = useState('');
  const [habit, setHabit] = useState('');
  const [minimum, setMinimum] = useState('');
  const [habitTime, setHabitTime] = useState('07:00');

  const finish = () =>
    update((s): AppState => {
      const goalId = uid();
      const habitId = uid();
      const date = today();
      return {
        ...s,
        settings: { ...s.settings, name: name.trim(), disciplineMode: discipline, coachMode: coach, dayStart, dayEnd, onboarded: true },
        goals: goal.trim()
          ? [...s.goals, { id: goalId, title: goal.trim(), area: 'education', why: '', milestones: [], habitIds: habit.trim() ? [habitId] : [], createdAt: date }]
          : s.goals,
        habits: habit.trim()
          ? [
              ...s.habits,
              { id: habitId, title: habit.trim(), area: 'education', minimum: minimum.trim() || '10 minutes', time: habitTime, minutes: 45, createdAt: date, archived: false },
            ]
          : s.habits,
      };
    });

  const steps = [
    <>
      <div className="brand" style={{ fontSize: 15 }}>
        DIOX <span>LIFE OS</span>
      </div>
      <h1 style={{ marginTop: 12 }}>Discipline. Direction. Decisions. Execution.</h1>
      <p className="muted">Your private system for designing your future and executing it one day at a time.</p>
      <Field label="What should I call you?">
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <p className="muted small">Private by default — your data stays on this device.</p>
    </>,
    <>
      <h1>How should discipline work?</h1>
      {DISCIPLINE_OPTIONS.map((o) => (
        <button key={o.value} className={`btn choice ${discipline === o.value ? 'selected' : ''}`} onClick={() => setDiscipline(o.value)}>
          <div>{o.label}</div>
          <div className="muted small" style={{ fontWeight: 400 }}>
            {o.hint}
          </div>
        </button>
      ))}
    </>,
    <>
      <h1>How should the coach guide you?</h1>
      {COACH_OPTIONS.map((o) => (
        <button key={o.value} className={`btn choice ${coach === o.value ? 'selected' : ''}`} onClick={() => setCoach(o.value)}>
          <div>{o.label}</div>
          <div className="muted small" style={{ fontWeight: 400 }}>
            {o.hint}
          </div>
        </button>
      ))}
    </>,
    <>
      <h1>Your real day</h1>
      <p className="muted">The planner never schedules more hours than you actually have.</p>
      <div className="grid2">
        <Field label="I start at">
          <input type="time" value={dayStart} onChange={(e) => setDayStart(e.target.value || dayStart)} />
        </Field>
        <Field label="I finish at">
          <input type="time" value={dayEnd} onChange={(e) => setDayEnd(e.target.value || dayEnd)} />
        </Field>
      </div>
    </>,
    <>
      <h1>One goal, one daily action</h1>
      <p className="muted">Start small. You can add more later.</p>
      <Field label="A goal that matters this year">
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Get admitted to study Computer Science" />
      </Field>
      <Field label="The daily habit that moves it">
        <input value={habit} onChange={(e) => setHabit(e.target.value)} placeholder="Study mathematics" />
      </Field>
      <div className="grid2">
        <Field label="Minimum version">
          <input value={minimum} onChange={(e) => setMinimum(e.target.value)} placeholder="One past question" />
        </Field>
        <Field label="Time">
          <input type="time" value={habitTime} onChange={(e) => setHabitTime(e.target.value || habitTime)} />
        </Field>
      </div>
    </>,
  ];

  const last = step === steps.length - 1;
  return (
    <div style={{ paddingTop: 24 }}>
      <div className="steps">
        {steps.map((_, i) => (
          <i key={i} className={i <= step ? 'on' : ''} />
        ))}
      </div>
      {steps[step]}
      <div className="row" style={{ marginTop: 20 }}>
        {step > 0 && (
          <button className="btn" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        <button className="btn primary grow" onClick={() => (last ? finish() : setStep(step + 1))}>
          {last ? 'Build my DIOX LIFE OS' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
