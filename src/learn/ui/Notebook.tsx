import { useMemo, useState } from 'react';
import { Character, Say, type Who } from '../../components/Character';
import { uid, useStore } from '../../lib/store';
import { haptic } from '../../lib/telegram';
import { checkLine } from '../calc';
import { COURSES } from '../courses';
import { checkInput, correctAnswer, lessonStatus, type NoteLine, type NotePage } from '../engine';
import { checkStep, practiceKinds, regenerate, sample, stepsFor, type Step } from '../steps';
import type { Exercise } from '../types';
import { ExerciseView, Prompt } from './Exercises';
import { TipBox } from './Player';

/** Rough work where every line is checked: "7 × 8" shows 56, "625 − 576 = 59" is marked wrong. */
export function RoughWork({ value, onChange, rows = 4, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  const results = value.split('\n').map((line) => ({ line, r: checkLine(line) }));
  return (
    <div className="rough">
      <textarea
        className="rough-input"
        rows={rows}
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        placeholder={placeholder ?? 'Rough work. Type a sum like 7 × 8, or check one like 625 − 576 = 49'}
        onChange={(e) => onChange(e.target.value)}
      />
      {results.some(({ r }) => r.kind !== 'note') && (
        <div className="rough-results">
          {results.map(({ line, r }, i) =>
            r.kind === 'note' ? null : (
              <div key={i} className={`rough-line ${r.kind === 'check' ? (r.ok ? 'ok' : 'bad') : ''}`}>
                <span className="mono">{line.trim()}</span>
                <b>{r.text}</b>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function StepCard({ step, state, n }: { step: Step; state: 'shown' | 'ok' | 'helped'; n: number }) {
  return (
    <div className={`step-card ${state}`}>
      <span className="step-n">{n}</span>
      <span className="grow">{step.text}</span>
      {state === 'ok' && <span aria-label="right first time">✓</span>}
      {state === 'helped' && <span aria-label="needed help">💡</span>}
    </div>
  );
}

const lines = (steps: Step[]) => steps.map((s) => s.text);

/**
 * Go deeper on one question: watch it solved step by step, then solve one
 * with new numbers yourself, one step at a time, with every step checked.
 */
export function DeepDive({ ex, host = 'mei', onClose }: { ex: Exercise; host?: Who; onClose: () => void }) {
  const { update, cheer } = useStore();
  const exampleSteps = useMemo(() => stepsFor(ex), [ex]);
  const [phase, setPhase] = useState<'watch' | 'try' | 'done'>('watch');
  const [shown, setShown] = useState(1);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const trying = phase !== 'watch';
  const mine = useMemo(() => (trying ? (regenerate(ex, seed) ?? ex) : null), [ex, seed, trying]);
  const mySteps = useMemo(() => (mine ? stepsFor(mine) : []), [mine]);
  const [at, setAt] = useState(0);
  const [typed, setTyped] = useState('');
  const [misses, setMisses] = useState(0);
  const [record, setRecord] = useState<NoteLine[]>([]);
  const [finalReady, setFinalReady] = useState(false);
  const [finalOk, setFinalOk] = useState<boolean | null>(null);
  const [finalRaw, setFinalRaw] = useState(false);
  const [rough, setRough] = useState('');
  const [saved, setSaved] = useState(false);

  const fresh = mine !== null && mine !== ex;
  const step = mySteps[at];
  // When the last worked step already gives the answer to an input question, no extra final check is needed.
  const lastAnswered = [...mySteps].reverse().find((s) => s.answer !== undefined);
  const finalByStep = !!mine && mine.kind === 'input' && !!lastAnswered && checkInput(mine, lastAnswered.answer!);
  const stepsDone = at >= mySteps.length;

  const startTry = (newSeed = seed) => {
    haptic();
    setSeed(newSeed);
    setPhase('try');
    setAt(0);
    setTyped('');
    setMisses(0);
    setRecord([]);
    setFinalReady(false);
    setFinalOk(null);
    setSaved(false);
  };

  const advance = (line?: NoteLine) => {
    if (line) setRecord((r) => [...r, line]);
    setAt((i) => i + 1);
    setTyped('');
    setMisses(0);
  };

  const submit = () => {
    if (!step || step.answer === undefined || !typed.trim()) return;
    if (checkStep(step, typed)) {
      haptic('success');
      advance({ ask: step.ask!, typed: typed.trim(), ok: misses === 0 });
    } else {
      haptic('error');
      setMisses((m) => m + 1);
    }
  };

  const firstTry = record.filter((r) => r.ok).length;
  const total = record.length;

  const finish = () => {
    setPhase('done');
    if (total && firstTry === total) cheer({ who: host, text: 'Every step right first time. You really own this now.' });
  };

  const save = () => {
    if (!mine) return;
    haptic('success');
    const page: NotePage = {
      id: uid(),
      at: new Date().toISOString(),
      title: ex.prompt.split('\n\n').pop()!.slice(0, 80),
      example: { prompt: ex.prompt, lines: lines(exampleSteps), answer: correctAnswer(ex) },
      mine: { prompt: mine.prompt, lines: record, answer: correctAnswer(mine), firstTry, total },
      rough: rough.trim() || undefined,
    };
    update((d) => ({ ...d, learn: { ...d.learn, notebook: { ...d.learn.notebook, pages: [page, ...d.learn.notebook.pages] } } }));
    setSaved(true);
  };

  return (
    <div className="player deep">
      <div className="player-top">
        <button className="btn sm ghost x" onClick={onClose} aria-label="Close notebook">
          ✕
        </button>
        <div className="grow eyebrow" style={{ textAlign: 'center' }}>
          📓 {phase === 'watch' ? 'Watch me solve it' : phase === 'try' ? 'Your turn' : 'Done'}
        </div>
        <span style={{ width: 40 }} />
      </div>

      <div className="player-body deep-body">
        {phase === 'watch' && (
          <>
            <Say who={host} text="Watch each step. Then you will do one yourself." size={60} />
            <div className="card notebook-q">
              <Prompt text={ex.prompt} />
            </div>
            {exampleSteps.slice(0, shown).map((s, i) => (
              <StepCard key={i} step={s} state="shown" n={i + 1} />
            ))}
            {shown >= exampleSteps.length && (
              <>
                <div className="final-answer">
                  Answer: <b>{correctAnswer(ex)}</b>
                </div>
                {ex.tip && <TipBox tip={ex.tip} />}
              </>
            )}
          </>
        )}

        {phase !== 'watch' && mine && (
          <>
            <div className="card notebook-q">
              {fresh && <div className="eyebrow">Same kind of question, new numbers</div>}
              <Prompt text={mine.prompt} />
            </div>
            {mySteps.slice(0, at).map((s, i) => {
              const r = record.find((x) => x.ask === s.ask);
              return <StepCard key={i} step={s} state={s.answer === undefined ? 'shown' : r?.ok ? 'ok' : 'helped'} n={i + 1} />;
            })}

            {phase === 'try' && step && (
              <div className="step-card current">
                <span className="step-n">{at + 1}</span>
                <div className="grow">
                  {step.answer === undefined ? (
                    <div>{step.text}</div>
                  ) : (
                    <>
                      <div className="mono step-ask">{step.ask}</div>
                      <div className="row" style={{ gap: 8, marginTop: 8 }}>
                        <input
                          className="step-input"
                          value={typed}
                          autoFocus
                          autoComplete="off"
                          placeholder="?"
                          onChange={(e) => setTyped(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && submit()}
                        />
                        <button className="btn primary sm" disabled={!typed.trim()} onClick={submit}>
                          Check
                        </button>
                      </div>
                      {misses > 0 && (
                        <div className="step-help">
                          <b>Not yet.</b> {exampleSteps[at]?.text ? <>Here is how I did this step: <span className="mono">{exampleSteps[at].text}</span></> : 'Work it out in the rough box below.'}
                          {misses >= 2 && (
                            <div style={{ marginTop: 6 }}>
                              It is <b>{step.answer}{step.unit ? ` ${step.unit}` : ''}</b>.{' '}
                              <button className="btn sm" onClick={() => advance({ ask: step.ask!, typed: typed.trim(), ok: false })}>
                                Got it, next step
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {phase === 'try' && stepsDone && !finalByStep && (
              <div className="card">
                <div className="eyebrow">Now give the final answer</div>
                <ExerciseView
                  ex={mine}
                  locked={finalOk !== null}
                  onChange={(ready, ok) => {
                    setFinalReady(ready);
                    setFinalRaw(ok);
                  }}
                  onPenalty={() => undefined}
                  onSolved={() => setFinalOk(true)}
                />
                {finalOk === false && (
                  <p className="small">
                    The answer is <b>{correctAnswer(mine)}</b>. Look back at your steps above to see where it comes from.
                  </p>
                )}
              </div>
            )}

            {phase === 'done' && (
              <div className="card center">
                <Character who={host} size={90} mood={total && firstTry === total ? 'cheer' : 'talking'} />
                <h2 style={{ margin: '6px 0' }}>
                  {total ? `${firstTry} of ${total} steps right first time` : 'Worked through'}
                </h2>
                <p className="small muted">{total && firstTry === total ? 'Clean. Try one more to make it automatic.' : 'Steps marked 💡 are the ones to practise. Do another one.'}</p>
              </div>
            )}

            <div className="eyebrow" style={{ marginTop: 14 }}>
              Rough work
            </div>
            <RoughWork value={rough} onChange={setRough} rows={3} />
          </>
        )}
      </div>

      <div className="player-bottom">
        {phase === 'watch' &&
          (shown < exampleSteps.length ? (
            <div className="row" style={{ gap: 10 }}>
              <button className="btn grow" onClick={() => (haptic(), setShown(exampleSteps.length))}>
                Show all
              </button>
              <button className="btn go grow" onClick={() => (haptic(), setShown((n) => n + 1))}>
                Next step
              </button>
            </div>
          ) : (
            <button className="btn go block" onClick={() => startTry()}>
              ✍️ My turn
            </button>
          ))}
        {phase === 'try' && step && step.answer === undefined && (
          <button className="btn go block" onClick={() => (haptic(), advance())}>
            Next
          </button>
        )}
        {phase === 'try' && stepsDone && (finalByStep || finalOk !== null) && (
          <button className="btn go block" onClick={finish}>
            Finish
          </button>
        )}
        {phase === 'try' && stepsDone && !finalByStep && finalOk === null && (
          <button className="btn go block" disabled={!finalReady} onClick={() => (haptic(finalRaw ? 'success' : 'error'), setFinalOk(finalRaw))}>
            Check answer
          </button>
        )}
        {phase === 'done' && (
          <div className="row" style={{ gap: 10 }}>
            <button className="btn grow" disabled={saved} onClick={save}>
              {saved ? 'Saved ✓' : '💾 Save page'}
            </button>
            <button className="btn go grow" onClick={() => startTry(seed + 1)}>
              {fresh ? 'Another one' : 'Again'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PageView({ page, onBack, onDelete }: { page: NotePage; onBack: () => void; onDelete: () => void }) {
  return (
    <>
      <button className="btn sm ghost" onClick={onBack}>
        ← Notebook
      </button>
      <div className="small muted" style={{ marginTop: 8 }}>
        {new Date(page.at).toLocaleString()}
      </div>
      <div className="card">
        <div className="eyebrow">Worked example</div>
        <p style={{ fontWeight: 800, whiteSpace: 'pre-wrap' }}>{page.example.prompt}</p>
        {page.example.lines.map((l, i) => (
          <div key={i} className="step-card shown">
            <span className="step-n">{i + 1}</span>
            <span className="grow">{l}</span>
          </div>
        ))}
        <div className="final-answer">
          Answer: <b>{page.example.answer}</b>
        </div>
      </div>
      {page.mine && (
        <div className="card">
          <div className="eyebrow">
            My attempt: {page.mine.firstTry}/{page.mine.total} first time
          </div>
          <p style={{ fontWeight: 800, whiteSpace: 'pre-wrap' }}>{page.mine.prompt}</p>
          {page.mine.lines.map((l, i) => (
            <div key={i} className={`step-card ${l.ok ? 'ok' : 'helped'}`}>
              <span className="step-n">{i + 1}</span>
              <span className="grow mono">{l.ask.replace('?', l.typed)}</span>
              <span>{l.ok ? '✓' : '💡'}</span>
            </div>
          ))}
          <div className="final-answer">
            Answer: <b>{page.mine.answer}</b>
          </div>
        </div>
      )}
      {page.rough && (
        <div className="card">
          <div className="eyebrow">Rough work</div>
          <pre className="mono" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
            {page.rough}
          </pre>
        </div>
      )}
      <button className="btn ghost block" onClick={onDelete}>
        Delete this page
      </button>
    </>
  );
}

/** The notebook: practise any topic step by step, saved pages, and a scratch pad. */
export function NotebookHome() {
  const { data, update } = useStore();
  const [course, setCourse] = useState('maths');
  const [open, setOpen] = useState<{ ex: Exercise; host: Who } | null>(null);
  const [page, setPage] = useState<NotePage | null>(null);
  const nb = data.learn.notebook;
  const info = COURSES.find((c) => c.course.id === course)!;
  const status = lessonStatus(info.course, data.learn);

  // Only lessons you have reached, so the notebook never jumps ahead of the path.
  const lessons = useMemo(
    () =>
      info.course.units
        .flatMap((u) => u.lessons)
        .filter((l) => status.get(l.id) !== 'locked')
        .map((l) => ({ lesson: l, kinds: practiceKinds(l) }))
        .filter((x) => x.kinds.length)
        // Newest topics first: they are the ones you are working on.
        .reverse(),
    [info, status],
  );

  const practise = (kinds: string[]) => {
    haptic();
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const ex = sample(kind, Date.now() % 100000);
    if (ex) setOpen({ ex, host: info.who });
  };

  if (open) return <DeepDive ex={open.ex} host={open.host} onClose={() => setOpen(null)} />;
  if (page)
    return (
      <PageView
        page={page}
        onBack={() => setPage(null)}
        onDelete={() => {
          update((d) => ({ ...d, learn: { ...d.learn, notebook: { ...d.learn.notebook, pages: d.learn.notebook.pages.filter((p) => p.id !== page.id) } } }));
          setPage(null);
        }}
      />
    );

  return (
    <>
      <Say who="mei" text="Your notebook. I solve one step by step, then you solve one with new numbers. Every step gets checked." size={72} />

      <h2 style={{ marginTop: 16 }}>Practise step by step</h2>
      <div className="chips">
        {COURSES.filter((c) => c.jamb || c.course.id === 'academy').map(({ course: c }) => (
          <button key={c.id} className={`chip ${course === c.id ? 'selected' : ''}`} onClick={() => (haptic(), setCourse(c.id))}>
            {c.icon} {c.title}
          </button>
        ))}
      </div>
      {lessons.length === 0 ? (
        <p className="small muted">Reach a lesson with calculations in {info.course.title} and it shows up here.</p>
      ) : (
        <div className="notebook-topics">
          {lessons.map(({ lesson, kinds }) => (
            <button key={lesson.id} className="option" onClick={() => practise(kinds)}>
              <span>{lesson.icon}</span> {lesson.title}
              <span className="small muted" style={{ marginLeft: 'auto' }}>
                {status.get(lesson.id) === 'done' ? '✓' : 'current'}
              </span>
            </button>
          ))}
        </div>
      )}

      <h2 style={{ marginTop: 18 }}>Scratch pad</h2>
      <RoughWork
        value={nb.scratch}
        rows={6}
        onChange={(scratch) => update((d) => ({ ...d, learn: { ...d.learn, notebook: { ...d.learn.notebook, scratch } } }))}
        placeholder={'Work anything out here. Each line is checked:\n12 × 15\n625 − 576 = 49\n(37 − 7) ÷ 6'}
      />

      <h2 style={{ marginTop: 18 }}>Saved pages ({nb.pages.length})</h2>
      {nb.pages.length === 0 ? (
        <p className="small muted">Tap "📓 Go deeper" after any question, work through it, then save the page. It lands here.</p>
      ) : (
        nb.pages.map((p) => (
          <button key={p.id} className="option" onClick={() => (haptic(), setPage(p))}>
            <span className="grow" style={{ textAlign: 'left' }}>
              {p.title}
              <div className="small muted">
                {new Date(p.at).toLocaleDateString()}
                {p.mine ? ` · ${p.mine.firstTry}/${p.mine.total} first time` : ''}
              </div>
            </span>
          </button>
        ))
      )}
    </>
  );
}
