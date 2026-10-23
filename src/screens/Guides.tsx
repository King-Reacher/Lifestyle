import { useState } from 'react';
import { Say } from '../components/Character';
import { EntryItem } from '../components/EntryItem';
import { TipBox } from '../learn/ui/Player';
import { today } from '../lib/dates';
import { answerText, GUIDES, STEP_LABELS, type Answers, type Guide } from '../lib/guides';
import { similarPast } from '../lib/ledger';
import { uid, useStore } from '../lib/store';
import { haptic } from '../lib/telegram';

export function Guides({ onBack }: { onBack: () => void }) {
  const { data, update, cheer } = useStore();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const pick = (g: Guide) => {
    haptic();
    setGuide(g);
    setStep(0);
    setAnswers({});
  };

  if (!guide) {
    return (
      <>
        <button className="btn sm ghost" onClick={onBack}>
          ← Home
        </button>
        <Say who="zara" text="What's happening? Pick the closest one. We'll think it through together, and I'll check what happened last time." size={80} />
        {GUIDES.map((g) => (
          <button key={g.id} className="option" style={{ marginBottom: 10 }} onClick={() => pick(g)}>
            <span style={{ fontSize: 24 }}>{g.icon}</span>
            {g.label}
          </button>
        ))}
        <p className="small muted" style={{ textAlign: 'center' }}>
          The goal is to train your judgment. Over time, try answering before you open a guide.
        </p>
      </>
    );
  }

  const done = step >= guide.questions.length;

  if (!done) {
    const q = guide.questions[step];
    const value = answers[q.id] ?? '';
    const next = () => {
      haptic();
      setStep(step + 1);
    };
    return (
      <>
        <button className="btn sm ghost" onClick={() => (step ? setStep(step - 1) : setGuide(null))}>
          ← Back
        </button>
        <div className="steps-bar">
          {guide.questions.map((x, i) => (
            <i key={x.id} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        <div className="eyebrow" style={{ margin: '6px 0' }}>
          {STEP_LABELS[q.step]}
        </div>
        <Say key={q.id} who={guide.who} text={q.prompt} size={80} />
        {q.type === 'choice' ? (
          <div className="options">
            {q.options!.map((o) => (
              <button
                key={o}
                className={`option ${value === o ? 'selected' : ''}`}
                onClick={() => {
                  setAnswers((a) => ({ ...a, [q.id]: o }));
                  haptic();
                }}
              >
                {o}
              </button>
            ))}
          </div>
        ) : (
          <textarea autoFocus value={value} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} placeholder="Type it out. Writing it down already helps." />
        )}
        <button className="btn go block" style={{ marginTop: 14 }} disabled={q.type === 'choice' && !value} onClick={next}>
          {step === guide.questions.length - 1 ? 'What should I do?' : 'Next'}
        </button>
      </>
    );
  }

  const advice = guide.advise(answers);
  const recall = similarPast(data.entries, answerText(guide, answers), { limit: 3 });

  const save = () => {
    update((d) => ({
      ...d,
      entries: [...d.entries, { id: uid(), at: new Date().toISOString(), date: today(), type: 'decision', area: guide.area, text: `${guide.label}: ${advice.action}` }],
    }));
    cheer({ who: 'ada', text: "Decision saved. In two days I'll ask how it turned out." });
    setGuide(null);
    onBack();
  };

  return (
    <>
      <button className="btn sm ghost" onClick={() => setStep(guide.questions.length - 1)}>
        ← Change answers
      </button>
      <Say who={guide.who} text={advice.action} size={88} />
      <div className="card">
        <div className="eyebrow">Why</div>
        <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{advice.why}</p>
      </div>
      <TipBox tip={{ kind: 'memory', text: `Principle: ${advice.principle}` }} />
      {advice.note && (
        <p className="small" style={{ color: 'var(--gold)', fontWeight: 800 }}>
          {advice.note}
        </p>
      )}
      {recall.length > 0 && (
        <div className="recall">
          <div className="eyebrow" style={{ marginBottom: 4 }}>
            From your ledger: last time
          </div>
          {recall.map(({ entry }) => (
            <EntryItem key={entry.id} entry={entry} showDate />
          ))}
        </div>
      )}
      <button className="btn primary block" style={{ marginTop: 14 }} onClick={save}>
        I'll do it. Save the decision
      </button>
      <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => setGuide(null)}>
        Not now
      </button>
    </>
  );
}
