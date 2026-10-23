import { useState } from 'react';
import { Character, Say } from '../components/Character';
import { ConsoleView } from '../learn/ui/Exercises';
import { today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import { haptic } from '../lib/telegram';
import { CHALLENGES, outputOk, scaffold, type Challenge } from './challenges';
import { CodeEditor } from './CodeEditor';
import { passed, run, type RunResult } from './runner';

const LEVEL = ['', 'Starter', 'Builder', 'Inventor'];
const OWN = 'own';

export function InventList({ onOpen }: { onOpen: (id: string) => void }) {
  const { data } = useStore();
  const done = CHALLENGES.filter((c) => data.code.invented[c.id]?.done).length;
  return (
    <>
      <Say who="zara" text="No model answer here. You invent the code. I give hints on how to think, and the checks accept any way that works." size={72} />
      <div className="small muted" style={{ fontWeight: 800, margin: '8px 0' }}>
        {done}/{CHALLENGES.length} invented
      </div>
      {CHALLENGES.map((c) => (
        <button key={c.id} className="option" style={{ marginBottom: 10 }} onClick={() => (haptic(), onOpen(c.id))}>
          <span style={{ fontSize: 24 }}>{c.icon}</span>
          <span className="grow">
            {c.title}
            <span className="small muted" style={{ display: 'block', fontWeight: 700 }}>
              {LEVEL[c.level]}
            </span>
          </span>
          {data.code.invented[c.id]?.done && <span className="pill" style={{ color: 'var(--green)' }}>✓</span>}
        </button>
      ))}
      <button className="option" style={{ borderStyle: 'dashed' }} onClick={() => onOpen(OWN)}>
        <span style={{ fontSize: 24 }}>💡</span>
        <span className="grow">
          My own idea
          <span className="small muted" style={{ display: 'block', fontWeight: 700 }}>
            Describe it, get a plan, build it
          </span>
        </span>
      </button>
    </>
  );
}

export function InventChallenge({ id, onBack }: { id: string; onBack: () => void }) {
  const challenge = CHALLENGES.find((c) => c.id === id);
  return challenge ? <ChallengeView challenge={challenge} onBack={onBack} /> : <OwnIdea onBack={onBack} />;
}

function ChallengeView({ challenge, onBack }: { challenge: Challenge; onBack: () => void }) {
  const { data, update, cheer } = useStore();
  const saved = data.code.invented[challenge.id];
  const [code, setCode] = useState(saved?.code ?? `// ${challenge.title}\n// Your design, your code.\n\n`);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<RunResult | null>(null);
  const [ok, setOk] = useState(false);

  const save = (next: string, done = saved?.done ?? false) => update((d) => ({ ...d, code: { ...d.code, invented: { ...d.code.invented, [challenge.id]: { code: next, done } } } }));

  const go = async () => {
    haptic();
    const r = await run(code, challenge.checks);
    setResult(r);
    const good = passed(r) && outputOk(r.output, challenge.outputMatches);
    setOk(good);
    if (good && !saved?.done) {
      save(code, true);
      const total = CHALLENGES.filter((c) => c.id === challenge.id || data.code.invented[c.id]?.done).length;
      update((d) => ({
        ...d,
        entries: [...d.entries, { id: uid(), at: new Date().toISOString(), date: today(), type: 'did', area: 'career', text: `Invented my own code: ${challenge.title}` }],
        // Five inventions completes the "write your own programs" career milestone.
        code: total >= 5 ? { ...d.code, career: { ...d.code.career, 's1-lab': true } } : d.code,
      }));
      cheer({ who: challenge.who, text: 'It works, and you invented it yourself. That is real engineering. 🔥' });
    } else if (!good) haptic('error');
  };

  return (
    <>
      <button className="btn sm ghost" onClick={onBack}>
        ← Invent
      </button>
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <Character who={challenge.who} size={64} />
        <div className="card grow" style={{ margin: '0 0 10px' }}>
          <div className="eyebrow">
            {challenge.icon} {challenge.title} · {LEVEL[challenge.level]}
          </div>
          <p style={{ margin: '6px 0 0', fontWeight: 800 }}>{challenge.brief}</p>
        </div>
      </div>

      {challenge.hints.slice(0, hints).map((h, i) => (
        <div key={h} className="tip tip-memory">
          <b>Hint {i + 1}:</b> {h}
        </div>
      ))}
      {hints < challenge.hints.length && (
        <button className="btn sm ghost" style={{ marginTop: 6 }} onClick={() => setHints(hints + 1)}>
          {hints === 0 ? '💭 How should I think about this?' : '💭 Another hint'}
        </button>
      )}

      <CodeEditor
        value={code}
        onChange={(v) => {
          setCode(v);
          setResult(null);
          save(v);
        }}
        minRows={10}
      />
      <button className="btn go block" style={{ marginTop: 10 }} onClick={go}>
        ▶ Run & test
      </button>
      <ConsoleView result={result} />
      {result && challenge.outputMatches && !outputOk(result.output, challenge.outputMatches) && (
        <p className="small" style={{ color: 'var(--red)', fontWeight: 800 }}>
          The output doesn't match the brief yet. Read the format in the brief again, character by character.
        </p>
      )}
      {(ok || saved?.done) && (
        <div className="card glow">
          <div className="eyebrow">Stretch it further</div>
          {challenge.stretch.map((s) => (
            <p key={s} className="small" style={{ margin: '6px 0 0', fontWeight: 700 }}>
              ⭐ {s}
            </p>
          ))}
        </div>
      )}
    </>
  );
}

function OwnIdea({ onBack }: { onBack: () => void }) {
  const { data, update } = useStore();
  const saved = data.code.invented[OWN];
  const [idea, setIdea] = useState('');
  const [code, setCode] = useState(saved?.code ?? '');
  const [result, setResult] = useState<RunResult | null>(null);

  const setAndSave = (v: string) => {
    setCode(v);
    update((d) => ({ ...d, code: { ...d.code, invented: { ...d.code.invented, [OWN]: { code: v, done: false } } } }));
  };

  return (
    <>
      <button className="btn sm ghost" onClick={onBack}>
        ← Invent
      </button>
      <Say who="greta" text="Every app you use started as a sentence. Describe yours, and I'll give you a plan to code under." size={72} />
      {!code && (
        <>
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. A program that tells me how many days until JAMB" />
          <button className="btn primary block" style={{ marginTop: 10 }} disabled={idea.trim().length < 4} onClick={() => setAndSave(scaffold(idea))}>
            Give me a plan
          </button>
        </>
      )}
      {code && (
        <>
          <CodeEditor value={code} onChange={(v) => (setAndSave(v), setResult(null))} minRows={14} />
          <div className="row" style={{ gap: 10, marginTop: 10 }}>
            <button className="btn grow" onClick={() => (setAndSave(''), setResult(null), setIdea(''))}>
              New idea
            </button>
            <button className="btn go grow" onClick={async () => setResult(await run(code))}>
              ▶ Run
            </button>
          </div>
          <ConsoleView result={result} />
        </>
      )}
    </>
  );
}
