import { useEffect, useMemo, useState } from 'react';
import { haptic } from '../../lib/telegram';
import { checkInput } from '../engine';
import type { ChoiceEx, Exercise, InputEx, MatchEx, OrderEx, TrueFalseEx } from '../types';
import { seeded, shuffle } from '../util';

/** Reports whether an answer is ready to check, and whether it's right. */
export type OnChange = (ready: boolean, correct: boolean) => void;

interface ViewProps<E> {
  ex: E;
  locked: boolean;
  onChange: OnChange;
}

/** A stable seed per exercise, so shuffles don't jump around between renders. */
const seedOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function ChoiceView({ ex, locked, onChange }: ViewProps<ChoiceEx>) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <div className="options">
      {ex.options.map((o, i) => (
        <button
          key={o}
          className={`option ${sel === i ? 'selected' : ''} ${locked && i === ex.answer ? 'right' : ''} ${locked && sel === i && i !== ex.answer ? 'wrong' : ''}`}
          disabled={locked}
          onClick={() => {
            haptic();
            setSel(i);
            onChange(true, i === ex.answer);
          }}
        >
          <span className="key">{i + 1}</span>
          {o}
        </button>
      ))}
    </div>
  );
}

function TrueFalseView({ ex, locked, onChange }: ViewProps<TrueFalseEx>) {
  const [sel, setSel] = useState<boolean | null>(null);
  return (
    <div className="tf">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          className={`option big ${sel === v ? 'selected' : ''} ${locked && v === ex.answer ? 'right' : ''} ${locked && sel === v && v !== ex.answer ? 'wrong' : ''}`}
          disabled={locked}
          onClick={() => {
            haptic();
            setSel(v);
            onChange(true, v === ex.answer);
          }}
        >
          {v ? '✓ True' : '✕ False'}
        </button>
      ))}
    </div>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '.', '/', '␣', '⌫'];

function InputView({ ex, locked, onChange }: ViewProps<InputEx>) {
  const [value, setValue] = useState('');

  const press = (k: string) => {
    if (locked) return;
    haptic();
    const v = value;
    const next = k === '⌫' ? v.slice(0, -1) : k === '␣' ? (v && !v.endsWith(' ') ? `${v} ` : v) : v.length < 14 ? v + k : v;
    setValue(next);
    onChange(next.trim().length > 0, checkInput(ex, next));
  };

  // Physical keyboards (desktop Telegram) type straight in.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') return;
      if (/^[0-9./]$/.test(e.key)) press(e.key);
      else if (e.key === '-') press('−');
      else if (e.key === ' ') press('␣');
      else if (e.key === 'Backspace') press('⌫');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <>
      <div className={`answer-box ${value ? '' : 'empty'}`}>
        {ex.prefix}
        {value || '?'}
        {ex.suffix}
      </div>
      {ex.rational && (
        <div className="small muted" style={{ textAlign: 'center', marginTop: 6 }}>
          Fractions like 3/4 · mixed numbers like 1 1/2 (use ␣)
        </div>
      )}
      <div className="keypad">
        {KEYS.map((k) => (
          <button key={k} className={`keycap ${k === '⌫' ? 'del' : ''}`} disabled={locked} onClick={() => press(k)}>
            {k}
          </button>
        ))}
      </div>
    </>
  );
}

function OrderView({ ex, locked, onChange }: ViewProps<OrderEx>) {
  const bank = useMemo(() => {
    let s = shuffle(seeded(seedOf(ex.id)), ex.tiles.map((t, i) => ({ t, i })));
    // Never start already solved.
    if (s.every((x, i) => x.i === i)) s = [...s.slice(1), s[0]];
    return s;
  }, [ex]);
  const [picked, setPicked] = useState<number[]>([]);

  const update = (next: number[]) => {
    haptic();
    setPicked(next);
    onChange(next.length === ex.tiles.length, next.every((i, pos) => ex.tiles[i] === ex.tiles[pos]));
  };

  return (
    <>
      <div className="order-line">
        {picked.length === 0 && <span className="muted small">Tap the tiles in the right order</span>}
        {picked.map((i) => (
          <button key={i} className="tile" disabled={locked} onClick={() => update(picked.filter((p) => p !== i))}>
            {ex.tiles[i]}
          </button>
        ))}
      </div>
      <div className="order-bank">
        {bank.map(({ t, i }) => (
          <button key={i} className={`tile ${picked.includes(i) ? 'used' : ''}`} disabled={locked || picked.includes(i)} onClick={() => update([...picked, i])}>
            {t}
          </button>
        ))}
      </div>
    </>
  );
}

function MatchView({ ex, onPenalty, onSolved }: { ex: MatchEx; onPenalty: () => void; onSolved: () => void }) {
  const right = useMemo(() => shuffle(seeded(seedOf(ex.id)), ex.pairs.map(([, b], i) => ({ b, i }))), [ex]);
  const left = useMemo(() => shuffle(seeded(seedOf(ex.id) + 1), ex.pairs.map(([a], i) => ({ a, i }))), [ex]);
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);

  const tapRight = (i: number) => {
    if (sel === null) return;
    if (i === sel) {
      haptic('success');
      const next = [...done, i];
      setDone(next);
      setSel(null);
      if (next.length === ex.pairs.length) onSolved();
    } else {
      haptic('error');
      setWrong(i);
      setTimeout(() => setWrong(null), 450);
      setSel(null);
      onPenalty();
    }
  };

  return (
    <div className="match">
      <div className="col">
        {left.map(({ a, i }) => (
          <button key={i} className={`option ${sel === i ? 'selected' : ''} ${done.includes(i) ? 'matched' : ''}`} disabled={done.includes(i)} onClick={() => (haptic(), setSel(i))}>
            {a}
          </button>
        ))}
      </div>
      <div className="col">
        {right.map(({ b, i }) => (
          <button key={i} className={`option ${done.includes(i) ? 'matched' : ''} ${wrong === i ? 'wrong shake' : ''}`} disabled={done.includes(i)} onClick={() => tapRight(i)}>
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ExerciseView({
  ex,
  locked,
  onChange,
  onPenalty,
  onSolved,
}: {
  ex: Exercise;
  locked: boolean;
  onChange: OnChange;
  onPenalty: () => void;
  onSolved: () => void;
}) {
  switch (ex.kind) {
    case 'choice':
      return <ChoiceView ex={ex} locked={locked} onChange={onChange} />;
    case 'truefalse':
      return <TrueFalseView ex={ex} locked={locked} onChange={onChange} />;
    case 'input':
      return <InputView ex={ex} locked={locked} onChange={onChange} />;
    case 'order':
      return <OrderView ex={ex} locked={locked} onChange={onChange} />;
    case 'match':
      return <MatchView ex={ex} onPenalty={onPenalty} onSolved={onSolved} />;
  }
}

export const PROMPT_LABEL: Record<Exercise['kind'], string> = {
  choice: 'Select the correct answer',
  truefalse: 'True or false?',
  input: 'Type the answer',
  order: 'Put it in order',
  match: 'Tap the matching pairs',
};
