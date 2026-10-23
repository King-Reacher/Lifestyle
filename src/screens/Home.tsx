import { useState } from 'react';
import { Character, Say } from '../components/Character';
import { EntryForm } from '../components/EntryForm';
import { EntryItem, formatAmount } from '../components/EntryItem';
import { Empty } from '../components/ui';
import { addDays, fromISODate, today } from '../lib/dates';
import { greeting, streakLine } from '../lib/lines';
import { DAILY_GOAL, nextLesson } from '../learn/engine';
import { COURSES } from '../learn/courses';
import { loggingStreak, prompts, summarize, TYPES, type Entry, type EntryType, type Prompt } from '../lib/ledger';
import { focusGoal, monthSummary, moneyStreak, naira, remaining } from '../lib/money';
import { useStore } from '../lib/store';

const QUICK: EntryType[] = ['study', 'did', 'money-out', 'money-in', 'decision', 'feeling', 'learned', 'note'];

export function Home({ name, onLearn, onGuide, onMoney }: { name: string; onLearn: () => void; onGuide: () => void; onMoney: () => void }) {
  const { data } = useStore();
  const date = today();
  const hour = new Date().getHours();
  const [form, setForm] = useState<{ entry?: Entry; type?: EntryType } | null>(null);
  const streak = loggingStreak(data.entries, date);
  const sum = summarize(data.entries, date);
  const asks = prompts(data.entries, date, hour);
  const todays = data.entries.filter((e) => e.date === date).sort((a, b) => b.at.localeCompare(a.at));
  const hello = greeting(name, hour, date);
  const loggedDays = new Set(data.entries.map((e) => e.date));
  // Suggest the next lesson in the first subject that still has one, so every subject keeps moving.
  const nextUp = COURSES.map(({ course }) => ({ course, lesson: nextLesson(course, data.learn) })).find((x) => x.lesson);
  const next = nextUp?.lesson;
  const week = Array.from({ length: 7 }, (_, i) => addDays(date, i - 6));
  const month = monthSummary(data.entries, data.money, date);
  const goal = focusGoal(data.money.goals);
  const mStreak = moneyStreak(data.entries, data.money, date);

  const answer = (p: Prompt) => {
    if (p.kind === 'outcome') setForm({ entry: p.entry });
    else setForm({ type: p.kind === 'mood-check' ? 'feeling' : 'did' });
  };

  return (
    <>
      <Say who={hello.who} text={hello.text} size={84} />

      <div className="card glow">
        <div className="row">
          <Character who="blaze" size={84} mood={sum.entries ? 'idle' : 'talking'} />
          <div className="grow">
            <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
              <span className="streak-num">{streak}</span>
              <span className="eyebrow">day streak</span>
            </div>
            <div className="small" style={{ fontWeight: 700, marginTop: 4 }}>
              {streakLine(streak, sum.entries > 0)}
            </div>
          </div>
        </div>
        <div className="week">
          {week.map((d) => (
            <div key={d} className="day">
              <div className={`dot ${loggedDays.has(d) ? 'on' : ''} ${d === date ? 'today' : ''}`}>{loggedDays.has(d) ? '🔥' : ''}</div>
              {fromISODate(d).toLocaleDateString(undefined, { weekday: 'narrow' })}
            </div>
          ))}
        </div>
      </div>

      <div className="card glow">
        <div className="row">
          <Character who="mei" size={64} />
          <div className="grow">
            <div className="eyebrow">Today's lesson · {data.learn.xpByDay[date] ?? 0}/{DAILY_GOAL} XP</div>
            <div style={{ fontWeight: 900, fontSize: 17, margin: '2px 0 8px' }}>{nextUp && next ? `${nextUp.course.title}: ${next.title}` : 'All lessons done. Time for a mock exam'}</div>
            <button className="btn go sm" onClick={onLearn}>
              {next ? 'Start lesson' : 'Open Learn'}
            </button>
          </div>
        </div>
      </div>

      {asks.map((p) => (
        <div key={p.kind === 'outcome' ? p.entry.id : p.kind} className="card">
          <Say who={p.kind === 'empty-day' ? 'zara' : 'ada'} text={p.question} size={64}>
            <button className="btn go sm" onClick={() => answer(p)}>
              Answer
            </button>
          </Say>
        </div>
      ))}

      <div className="stats">
        <div className="stat-tile">
          <div className="stat">{sum.entries}</div>
          <div className="small muted">logged</div>
        </div>
        <div className="stat-tile">
          <div className="stat" style={{ color: 'var(--blue)' }}>
            {sum.studyMinutes}
          </div>
          <div className="small muted">study min</div>
        </div>
        <div className="stat-tile">
          <div className="stat" style={{ color: 'var(--gold)' }}>
            {formatAmount(sum.spent)}
          </div>
          <div className="small muted">spent</div>
        </div>
      </div>

      <div className="card">
        <h2>Quick log</h2>
        <div className="type-grid">
          {QUICK.map((t) => (
            <button key={t} className="type-btn" onClick={() => setForm({ type: t })}>
              <span className="ico">{TYPES[t].icon}</span>
              {TYPES[t].label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Today</h2>
        {todays.length === 0 ? (
          <Empty>Nothing yet. Everything you log becomes your memory.</Empty>
        ) : (
          todays.map((e) => <EntryItem key={e.id} entry={e} onOpen={(entry) => setForm({ entry })} />)
        )}
      </div>

      <div className="card">
        <Say who="zara" text="Facing a choice, a temptation or a bad day? Let's think it through." size={64}>
          <button className="btn primary sm" onClick={onGuide}>
            What should I do?
          </button>
        </Say>
      </div>

      <button className="card money-card" onClick={onMoney}>
        <div className="row between">
          <h2 style={{ margin: 0 }}>💰 Money</h2>
          <span className="pill fire">🔥 {mStreak}</span>
        </div>
        <div className="small" style={{ fontWeight: 700, marginTop: 6, textAlign: 'left' }}>
          {goal ? `${goal.title}: ${naira(remaining(goal))} to go` : 'No savings goal yet. Set one.'}
          {' · '}Fun money left: {naira(Math.max(0, month.funLeft))}
        </div>
      </button>

      <button className="fab" onClick={() => setForm({})} aria-label="Log something">
        +
      </button>
      {form && <EntryForm entry={form.entry} initialType={form.type} onClose={() => setForm(null)} />}
    </>
  );
}
