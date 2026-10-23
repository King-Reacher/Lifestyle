import { useState } from 'react';
import { Say } from '../components/Character';
import { ConsoleView } from '../learn/ui/Exercises';
import { useStore } from '../lib/store';
import { haptic } from '../lib/telegram';
import { CodeEditor } from './CodeEditor';
import { InventChallenge, InventList } from './Invent';
import { run, type RunResult } from './runner';

const EXAMPLES: { label: string; code: string }[] = [
  { label: 'Hello', code: 'const name = "Vin";\nconsole.log(`Hello, ${name}! Ready to build?`);\n' },
  {
    label: 'FizzBuzz',
    code: '// The classic interview warm-up\nfor (let i = 1; i <= 15; i++) {\n  if (i % 15 === 0) {\n    console.log("FizzBuzz");\n  } else if (i % 3 === 0) {\n    console.log("Fizz");\n  } else if (i % 5 === 0) {\n    console.log("Buzz");\n  } else {\n    console.log(i);\n  }\n}\n',
  },
  {
    label: 'Savings plan',
    code: '// How long until the goal, saving a fixed amount each week?\nconst goal = 50000;\nconst perWeek = 3500;\nlet saved = 0;\nlet weeks = 0;\nwhile (saved < goal) {\n  saved += perWeek;\n  weeks++;\n}\nconsole.log(`Goal reached in ${weeks} weeks`);\n',
  },
  {
    label: 'Grade report',
    code: 'const scores = { english: 72, maths: 85, physics: 64, chemistry: 70 };\nlet total = 0;\nfor (const subject of Object.keys(scores)) {\n  total += scores[subject];\n  console.log(subject, scores[subject]);\n}\nconsole.log("Total:", total, "/ 400");\n',
  },
];

/** A free playground. Your code is saved on this device as you type. */
export function CodeLab({ onBack }: { onBack: () => void }) {
  const { data, update } = useStore();
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'play' | 'invent'>('invent');
  const [challenge, setChallenge] = useState<string | null>(null);
  const code = data.code.scratch || EXAMPLES[0].code;

  const setCode = (scratch: string) => update((d) => ({ ...d, code: { ...d.code, scratch } }));

  const go = async () => {
    haptic();
    setRunning(true);
    setResult(await run(code));
    setRunning(false);
  };

  if (mode === 'invent' && challenge) return <InventChallenge id={challenge} onBack={() => setChallenge(null)} />;

  const tabs = (
    <div className="row" style={{ gap: 8, margin: '6px 0 10px' }}>
      <button className={`btn sm grow ${mode === 'invent' ? 'primary' : ''}`} onClick={() => setMode('invent')}>
        💡 Invent
      </button>
      <button className={`btn sm grow ${mode === 'play' ? 'primary' : ''}`} onClick={() => setMode('play')}>
        🧪 Playground
      </button>
    </div>
  );

  if (mode === 'invent') {
    return (
      <>
        <button className="btn sm ghost" onClick={onBack}>
          ← Coding
        </button>
        {tabs}
        <InventList onOpen={setChallenge} />
      </>
    );
  }

  return (
    <>
      <button className="btn sm ghost" onClick={onBack}>
        ← Coding
      </button>
      {tabs}
      <Say who="zara" text="Your lab. Write anything, run it, break it, fix it. That's how engineers are made." size={72} />
      <div className="chips" style={{ margin: '6px 0 10px' }}>
        {EXAMPLES.map((ex) => (
          <button key={ex.label} className="chip" onClick={() => (setCode(ex.code), setResult(null))}>
            {ex.label}
          </button>
        ))}
        <button className="chip" onClick={() => (setCode('\n'), setResult(null))}>
          Clear
        </button>
      </div>
      <CodeEditor value={code} onChange={setCode} minRows={12} />
      <button className="btn go block" style={{ marginTop: 10 }} onClick={go} disabled={running}>
        {running ? 'Running…' : '▶ Run'}
      </button>
      <ConsoleView result={result} />
    </>
  );
}
