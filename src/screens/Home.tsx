import { useState } from 'react';
import { EntryForm } from '../components/EntryForm';
import { EntryItem, formatAmount } from '../components/EntryItem';
import { Empty } from '../components/ui';
import { formatLongDate, today } from '../lib/dates';
import { loggingStreak, prompts, summarize, TYPES, type Entry, type EntryType, type Prompt } from '../lib/ledger';
import { useStore } from '../lib/store';

const QUICK: EntryType[] = ['study', 'did', 'money-out', 'money-in', 'decision', 'feeling', 'learned', 'note'];

const COMING = [
  'JAMB lessons, Duolingo-style — Maths first, from the foundations',
  'Physics, Chemistry, English and Biology tracks',
  'Money discipline with a strict savings streak',
  'Academy schools and “what should I do?” guides',
  'Mock exams and Post-UTME mode',
];

export function Home({ name }: { name: string }) {
  const { data } = useStore();
  const date = today();
  const [form, setForm] = useState<{ entry?: Entry; type?: EntryType } | null>(null);
  const streak = loggingStreak(data.entries, date);
  const sum = summarize(data.entries, date);
  const asks = prompts(data.entries, date, new Date().getHours());
  const todays = data.entries.filter((e) => e.date === date).sort((a, b) => b.at.localeCompare(a.at));

  const answer = (p: Prompt) => {
    if (p.kind === 'outcome') setForm({ entry: p.entry });
    else setForm({ type: p.kind === 'mood-check' ? 'feeling' : 'did' });
  };

  return (
    <>
      <div className="eyebrow">{formatLongDate(date)}</div>
      <h1>{name ? `Hey ${name}.` : 'Hey.'} What happened today?</h1>

      <div className="card streak">
        <div className="flame" aria-hidden>
          🔥
        </div>
        <div className="grow">
          <div className="num">{streak}</div>
          <div className="small muted">
            {streak === 0
              ? 'Log one thing today to start your streak.'
              : sum.entries
                ? `day${streak > 1 ? 's' : ''} in a row. Today is counted.`
                : `day${streak > 1 ? 's' : ''} in a row. Log something to keep it alive.`}
          </div>
        </div>
      </div>

      {asks.map((p) => (
        <div key={p.kind === 'outcome' ? p.entry.id : p.kind} className="card prompt">
          <div className="eyebrow">Your ledger asks</div>
          <p style={{ margin: '6px 0 10px' }}>{p.question}</p>
          <button className="btn primary sm" onClick={() => answer(p)}>
            Answer
          </button>
        </div>
      ))}

      <div className="card">
        <div className="stats">
          <div>
            <div className="stat">{sum.entries}</div>
            <div className="small muted">logged</div>
          </div>
          <div>
            <div className="stat">{sum.studyMinutes}</div>
            <div className="small muted">study min</div>
          </div>
          <div>
            <div className="stat">{formatAmount(sum.spent)}</div>
            <div className="small muted">spent</div>
          </div>
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
        <div className="eyebrow">Being built next</div>
        <ol className="small muted" style={{ paddingLeft: 18, margin: '6px 0 0' }}>
          {COMING.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </div>

      <button className="fab" onClick={() => setForm({})} aria-label="Log something">
        +
      </button>
      {form && <EntryForm entry={form.entry} initialType={form.type} onClose={() => setForm(null)} />}
    </>
  );
}
