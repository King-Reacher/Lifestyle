import { useEffect, useMemo, useState } from 'react';
import { haptic } from '../../lib/telegram';
import { checkInput } from '../engine';
import { CodeEditor } from '../../code/CodeEditor';
import { passed, run, type RunResult } from '../../code/runner';
import type { ChoiceEx, CodeEx, Exercise, InputEx, MatchEx, OrderEx, TrueFalseEx } from '../types';
import { seeded, shuffle } from '../util';

/** Reports whether an answer is ready, whether it's right, and the raw answer so exam mode can restore it. */
export type OnChange = (ready: boolean, correct: boolean, raw: unknown) => void;

interface ViewProps<E> {
  ex: E;
  locked: boolean;
  onChange: OnChange;
  initial?: unknown;
}

/** A stable seed per exercise, so shuffles don't jump around between renders. */
const seedOf = (id: string) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

function ChoiceView({ ex, locked, onChange, initial }: ViewProps<ChoiceEx>) {
  const [sel, setSel] = useState<number | null>(typeof initial === 'number' ? initial : null);
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
            onChange(true, i === ex.answer, i);
          }}
        >
          <span className="key">{i + 1}</span>
          {o}
        </button>
      ))}
    </div>
  );
}

function TrueFalseView({ ex, locked, onChange, initial }: ViewProps<TrueFalseEx>) {
  const [sel, setSel] = useState<boolean | null>(typeof initial === 'boolean' ? initial : null);
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
            onChange(true, v === ex.answer, v);
          }}
        >
          {v ? '✓ True' : '✕ False'}
        </button>
      ))}
    </div>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '.', '/', '␣', '⌫'];

function InputView({ ex, locked, onChange, initial }: ViewProps<InputEx>) {
  const [value, setValue] = useState(typeof initial === 'string' ? initial : '');

  const press = (k: string) => {
    if (locked) return;
    haptic();
    const v = value;
    const next = k === '⌫' ? v.slice(0, -1) : k === '␣' ? (v && !v.endsWith(' ') ? `${v} ` : v) : v.length < 14 ? v + k : v;
    setValue(next);
    onChange(next.trim().length > 0, checkInput(ex, next), next);
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
    onChange(next.length === ex.tiles.length, next.every((i, pos) => ex.tiles[i] === ex.tiles[pos]), next);
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

/** A prompt may start with a reading passage, separated from the question by a blank line. */
export function Prompt({ text }: { text: string }) {
  const cut = text.lastIndexOf('\n\n');
  if (cut < 0) return <h2 className="prompt">{text}</h2>;
  return (
    <>
      <div className="passage">{text.slice(0, cut)}</div>
      <h2 className="prompt">{text.slice(cut + 2)}</h2>
    </>
  );
}

export function ConsoleView({ result, expected }: { result: RunResult | null; expected?: string[] }) {
  if (!result) return null;
  return (
    <div className="console">
      {result.output.length === 0 && !result.error && <div className="dim">(no output)</div>}
      {result.output.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {result.error && <div className="err">✕ {result.error}</div>}
      {expected && (
        <div className="dim" style={{ marginTop: 6 }}>
          Expected output: {expected.join(' ⏎ ')}
        </div>
      )}
      {result.results.map((r) => (
        <div key={r.call} className={r.ok ? 'ok' : 'bad'}>
          {r.ok ? '✓' : '✕'} {r.call} → {r.got}
          {!r.ok && <span className="dim"> (expected {r.expect})</span>}
        </div>
      ))}
    </div>
  );
}

function CodeView({ ex, locked, onChange, initial }: ViewProps<CodeEx>) {
  const [code, setCode] = useState(typeof initial === 'string' ? initial : ex.starter);
  const [result, setResult] = useState<RunResult | null>(null);
  const [guide, setGuide] = useState(true);
  const [running, setRunning] = useState(false);

  const edit = (next: string) => {
    setCode(next);
    setResult(null);
    // A changed program must be run again before it can be checked.
    onChange(false, false, next);
  };

  const go = async () => {
    setRunning(true);
    const r = await run(code, ex.checks);
    setRunning(false);
    setResult(r);
    const ok = passed(r, ex.output);
    haptic(ok ? 'success' : 'error');
    onChange(true, ok, code);
  };

  return (
    <>
      <div className="row between" style={{ marginBottom: 4 }}>
        <label className="row small" style={{ gap: 6, fontWeight: 800 }}>
          <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} />
          Guide me (ghost text)
        </label>
        <button className="btn sm primary" onClick={go} disabled={locked || running}>
          {running ? 'Running…' : '▶ Run'}
        </button>
      </div>
      <CodeEditor value={code} onChange={locked ? () => {} : edit} solution={guide ? ex.solution : undefined} />
      <ConsoleView result={result} expected={result && !passed(result, ex.output) ? ex.output : undefined} />
      {!result && <p className="small muted">Run your code, then press Check. Tap ⇥ Accept to take a ghost suggestion.</p>}
    </>
  );
}

export function ExerciseView({
  ex,
  locked,
  onChange,
  onPenalty,
  onSolved,
  initial,
}: {
  ex: Exercise;
  locked: boolean;
  onChange: OnChange;
  onPenalty: () => void;
  onSolved: () => void;
  initial?: unknown;
}) {
  switch (ex.kind) {
    case 'choice':
      return <ChoiceView ex={ex} locked={locked} onChange={onChange} initial={initial} />;
    case 'truefalse':
      return <TrueFalseView ex={ex} locked={locked} onChange={onChange} initial={initial} />;
    case 'input':
      return <InputView ex={ex} locked={locked} onChange={onChange} initial={initial} />;
    case 'order':
      return <OrderView ex={ex} locked={locked} onChange={onChange} />;
    case 'match':
      return <MatchView ex={ex} onPenalty={onPenalty} onSolved={onSolved} />;
    case 'code':
      return <CodeView ex={ex} locked={locked} onChange={onChange} initial={initial} />;
  }
}

export const PROMPT_LABEL: Record<Exercise['kind'], string> = {
  choice: 'Select the correct answer',
  truefalse: 'True or false?',
  input: 'Type the answer',
  order: 'Put it in order',
  match: 'Tap the matching pairs',
  code: 'Write the code',
};
