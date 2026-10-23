import { useEffect, useRef, useState } from 'react';
import { Say } from '../../components/Character';
import { coverage, keyIdeas, termsIn } from '../glossary';
import { correctAnswer } from '../engine';
import type { Exercise, Teach } from '../types';
import { TipBox } from './Player';

type Mode = 'menu' | 'simpler' | 'steps' | 'example' | 'explain';

const cardText = (c: Teach) => [c.title, ...c.body, ...(c.example ?? []), c.hook?.text ?? ''].join(' ');

/**
 * What happens after "No, not yet": simpler words, one idea at a time, a
 * worked example, or explaining it back in your own words.
 */
export function UnderstandHelp({ card, worked, onUnderstood, onFlag, onSaveExplanation }: {
  card: Teach;
  /** The lesson's next exercise, shown as a worked example. */
  worked?: Exercise;
  onUnderstood: () => void;
  onFlag: (note?: string) => void;
  onSaveExplanation: (text: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('menu');
  const [tries, setTries] = useState(0);
  const [step, setStep] = useState(0);
  const [mine, setMine] = useState('');
  const [checked, setChecked] = useState<{ covered: string[]; missing: string[] } | null>(null);
  const terms = termsIn(cardText(card));
  const top = useRef<HTMLDivElement>(null);

  // The help appears below the explanation, so bring it into view whenever it changes.
  useEffect(() => {
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [mode, step]);

  const notYet = () => {
    setTries((t) => t + 1);
    setMode('menu');
    setStep(0);
  };

  const askAgain = (
    <div className="understand-again">
      <div className="eyebrow">Do you understand now?</div>
      <div className="row" style={{ gap: 10, marginTop: 8 }}>
        <button className="btn grow" onClick={notYet}>
          Not yet
        </button>
        <button className="btn go grow" onClick={onUnderstood}>
          Yes, I get it
        </button>
      </div>
    </div>
  );

  if (mode === 'menu') {
    return (
      <div className="understand" ref={top}>
        <Say
          who={card.who}
          text={tries === 0 ? "No problem at all. Asking is how you learn. What would help most?" : "Let's try another way. Which one?"}
          size={60}
        />
        <div className="options">
          <button className="option" onClick={() => setMode('simpler')}>
            🍼 Make it simpler
          </button>
          <button className="option" onClick={() => setMode('steps')}>
            🪜 Break it down, one idea at a time
          </button>
          {(card.example || worked) && (
            <button className="option" onClick={() => setMode('example')}>
              🧪 Show me an example
            </button>
          )}
          <button className="option" onClick={() => setMode('explain')}>
            ✍️ Let me type what I think it means
          </button>
        </div>
        {tries >= 2 && (
          <div className="card" style={{ marginTop: 12 }}>
            <p className="small" style={{ marginTop: 0, fontWeight: 700 }}>
              Still unclear? That's okay. Flag it and keep going. It will wait for you under "To revisit" in Learn, and the practice questions often make it click.
            </p>
            <button className="btn primary block" onClick={() => onFlag()}>
              📌 Flag it and continue
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'simpler') {
    return (
      <div className="understand" ref={top}>
        <Say who={card.who} text="Here it is in plain words." size={56} />
        {terms.length > 0 && (
          <div className="card">
            <div className="eyebrow">The hard words, in plain English</div>
            {terms.map((t) => (
              <p key={t.term} className="small" style={{ margin: '8px 0 0' }}>
                <b style={{ textTransform: 'capitalize' }}>{t.term}</b>: {t.meaning}.
              </p>
            ))}
          </div>
        )}
        <div className="card">
          <div className="eyebrow">The main idea</div>
          <p style={{ margin: '6px 0 0', fontWeight: 800 }}>{card.title}</p>
          <p className="small" style={{ margin: '6px 0 0' }}>
            {card.body[0]}
          </p>
        </div>
        {card.hook && <TipBox tip={card.hook} />}
        {card.example && (
          <div className="example">
            <div className="eyebrow">Example</div>
            {card.example.map((e) => (
              <div key={e} className="mono">
                {e}
              </div>
            ))}
          </div>
        )}
        {askAgain}
      </div>
    );
  }

  if (mode === 'steps') {
    const last = step >= card.body.length - 1;
    const line = card.body[step];
    const lineTerms = termsIn(line);
    return (
      <div className="understand" ref={top}>
        <div className="eyebrow">
          Idea {step + 1} of {card.body.length}
        </div>
        <div className="steps-bar">
          {card.body.map((_, i) => (
            <i key={i} className={i <= step ? 'on' : ''} />
          ))}
        </div>
        <Say key={step} who={card.who} text={line} size={56} />
        {lineTerms.length > 0 && (
          <div className="small muted" style={{ fontWeight: 700 }}>
            {lineTerms.map((t) => (
              <div key={t.term}>
                <b style={{ textTransform: 'capitalize' }}>{t.term}</b> means {t.meaning}.
              </div>
            ))}
          </div>
        )}
        {last ? (
          askAgain
        ) : (
          <div className="row" style={{ gap: 10, marginTop: 12 }}>
            <button className="btn grow" onClick={() => onFlag(`Stuck on: ${line}`)}>
              📌 Stuck here
            </button>
            <button className="btn go grow" onClick={() => setStep(step + 1)}>
              Got it →
            </button>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'example') {
    return (
      <div className="understand" ref={top}>
        <Say who={card.who} text="Watch it work, then it's your turn." size={56} />
        {card.example && (
          <div className="example">
            <div className="eyebrow">Example</div>
            {card.example.map((e) => (
              <div key={e} className="mono">
                {e}
              </div>
            ))}
          </div>
        )}
        {worked && (
          <div className="card">
            <div className="eyebrow">Worked question</div>
            <p style={{ fontWeight: 800, margin: '6px 0' }}>{worked.prompt}</p>
            {worked.kind === 'code' ? <pre className="solution-code">{worked.solution}</pre> : <p className="small" style={{ color: 'var(--green)', fontWeight: 800, margin: 0 }}>Answer: {correctAnswer(worked)}</p>}
            <p className="small" style={{ margin: '6px 0 0' }}>
              {worked.explain}
            </p>
          </div>
        )}
        {askAgain}
      </div>
    );
  }

  const ideas = keyIdeas(cardText(card));
  return (
    <div className="understand" ref={top}>
      <Say who={card.who} text="Explain it in your own words, as if teaching a friend. Teaching is the fastest way to find the gap." size={56} />
      <textarea value={mine} onChange={(e) => setMine(e.target.value)} placeholder="I think it means…" />
      {!checked ? (
        <button
          className="btn primary block"
          style={{ marginTop: 10 }}
          disabled={mine.trim().length < 8}
          onClick={() => {
            setChecked(coverage(ideas, mine));
            onSaveExplanation(mine.trim());
          }}
        >
          Check my explanation
        </button>
      ) : (
        <>
          <div className="card">
            {checked.covered.length > 0 && (
              <p className="small" style={{ marginTop: 0, fontWeight: 700, color: 'var(--green)' }}>
                ✓ You covered: {checked.covered.join(', ')}
              </p>
            )}
            {checked.missing.length > 0 ? (
              <p className="small" style={{ margin: 0, fontWeight: 700 }}>
                Look again at: <span style={{ color: 'var(--gold)' }}>{checked.missing.join(', ')}</span>. Find where the explanation uses those words and say how they fit.
              </p>
            ) : (
              <p className="small" style={{ margin: 0, fontWeight: 700 }}>
                You touched every key idea. Strong.
              </p>
            )}
            <p className="small muted" style={{ marginBottom: 0 }}>
              I check for the key ideas, not exact meaning, so trust your own judgement too. Your explanation is saved in your ledger.
            </p>
          </div>
          {askAgain}
        </>
      )}
    </div>
  );
}
