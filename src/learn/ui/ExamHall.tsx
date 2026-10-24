import { useEffect, useMemo, useRef, useState } from 'react';
import { Character, Say, type Who } from '../../components/Character';
import { today } from '../../lib/dates';
import { uid, useStore } from '../../lib/store';
import { confirmAction, getWebApp, haptic } from '../../lib/telegram';
import { courseById } from '../courses';
import { addMistakes, correctAnswer } from '../engine';
import { buildExam, FORMATS, scoreExam, type ExamFormat, type ExamQuestion, type ExamRecord } from '../exam';
import { ExerciseView, Prompt } from './Exercises';
import { DeepDive } from './Notebook';
import { TipBox } from './Player';

const OPTIONAL = ['maths', 'physics', 'chemistry', 'biology'];
const SHORT: Record<string, string> = { english: 'ENG', maths: 'MTH', physics: 'PHY', chemistry: 'CHM', biology: 'BIO' };

type Phase = { kind: 'setup' } | { kind: 'running'; format: ExamFormat; questions: ExamQuestion[]; endsAt: number; startedAt: number } | { kind: 'done'; record: ExamRecord; questions: ExamQuestion[]; results: Record<number, boolean> };

export function ExamHall() {
  const { data, update, cheer } = useStore();
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' });
  const [format, setFormat] = useState<ExamFormat>('quick');
  const [picked, setPicked] = useState<string[]>(['maths', 'physics', 'chemistry']);
  const exams = data.learn.exams;
  const best = exams.filter((e) => e.max === 400).reduce((m, e) => Math.max(m, e.total), 0);

  const toggle = (id: string) => {
    haptic();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 3 ? [...p, id] : p));
  };

  const start = () => {
    const courses = ['english', ...picked].map(courseById);
    const questions = buildExam(courses, format, Date.now() % 1_000_000);
    const now = Date.now();
    setPhase({ kind: 'running', format, questions, startedAt: now, endsAt: now + FORMATS[format].minutes * 60_000 });
  };

  const finish = (questions: ExamQuestion[], results: Record<number, boolean>, fmt: ExamFormat, startedAt: number) => {
    const s = scoreExam(questions, results);
    const record: ExamRecord = { at: new Date().toISOString(), format: fmt, ...s, minutes: Math.max(1, Math.round((Date.now() - startedAt) / 60000)) };
    const wrong = questions.filter((_, i) => !results[i]).map((q) => q.ex);
    const date = today();
    update((d) => ({
      ...d,
      learn: { ...d.learn, exams: [...d.learn.exams, record], review: addMistakes(d.learn.review, wrong.slice(0, 30), date) },
      entries: [
        ...d.entries,
        {
          id: uid(),
          at: record.at,
          date,
          type: 'study',
          area: 'jamb',
          text: `${FORMATS[fmt].title}: ${record.total}/${record.max} (${record.subjects.map((x) => `${SHORT[x.subject]} ${x.score}`).join(', ')})`,
          minutes: record.minutes,
        },
      ],
    }));
    setPhase({ kind: 'done', record, questions, results });
  };

  if (phase.kind === 'running') {
    return <ExamRunner phase={phase} onFinish={(results) => finish(phase.questions, results, phase.format, phase.startedAt)} />;
  }
  if (phase.kind === 'done') {
    return (
      <ExamResults
        {...phase}
        onClose={() => {
          setPhase({ kind: 'setup' });
          cheer({ who: 'blaze', text: 'Exam logged. Your mistakes are now in review. 🔥' });
        }}
      />
    );
  }

  return (
    <>
      <Say who="greta" text="Welcome to the exam hall. Real timing, no hints, results at the end. Treat it like the real thing." size={80} />

      <div className="card">
        <h2>Format</h2>
        {(Object.keys(FORMATS) as ExamFormat[]).map((f) => (
          <button key={f} className={`option ${format === f ? 'selected' : ''}`} style={{ marginBottom: 10, display: 'block' }} onClick={() => (haptic(), setFormat(f))}>
            <div>{FORMATS[f].title}</div>
            <div className="small muted" style={{ fontWeight: 700 }}>
              {FORMATS[f].blurb}
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Subjects</h2>
        <p className="small muted" style={{ marginTop: 0 }}>
          Use of English is compulsory. Pick three more.
        </p>
        <div className="chips" style={{ flexWrap: 'wrap' }}>
          <span className="chip selected">📖 English</span>
          {OPTIONAL.map((id) => (
            <button key={id} className={`chip ${picked.includes(id) ? 'selected' : ''}`} onClick={() => toggle(id)}>
              {courseById(id).icon} {courseById(id).title}
            </button>
          ))}
        </div>
      </div>

      <button className="btn go block" disabled={picked.length !== 3} onClick={start}>
        Start {FORMATS[format].title}
      </button>

      {exams.length > 0 && (
        <div className="card">
          <div className="row between">
            <h2 style={{ margin: 0 }}>Past results</h2>
            {best > 0 && <span className="pill gold">Best {best}/400</span>}
          </div>
          {exams
            .slice(-6)
            .reverse()
            .map((e) => (
              <div key={e.at} className="entry">
                <div className="ico">🏆</div>
                <div className="grow">
                  <div className="text">
                    {FORMATS[e.format].title}: {e.total}/{e.max}
                  </div>
                  <div className="small muted">
                    {e.at.slice(0, 10)} · {e.subjects.map((s) => `${SHORT[s.subject]} ${s.score}`).join(' · ')} · {e.minutes} min
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </>
  );
}

function ExamRunner({ phase, onFinish }: { phase: Extract<Phase, { kind: 'running' }>; onFinish: (results: Record<number, boolean>) => void }) {
  const { questions, endsAt } = phase;
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { raw: unknown; correct: boolean }>>({});
  const [now, setNow] = useState(Date.now());
  const [grid, setGrid] = useState(false);
  const finished = useRef(false);

  const submit = () => {
    if (finished.current) return;
    finished.current = true;
    haptic('success');
    onFinish(Object.fromEntries(Object.entries(answers).map(([i, a]) => [i, a.correct])));
  };
  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= endsAt) submitRef.current();
    }, 500);
    return () => clearInterval(t);
  }, [endsAt]);

  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    const h = async () => {
      if (await confirmAction('Submit the exam now?')) submitRef.current();
    };
    wa.BackButton.show();
    wa.BackButton.onClick(h);
    return () => {
      wa.BackButton.offClick(h);
      wa.BackButton.hide();
    };
  }, []);

  const left = Math.max(0, Math.round((endsAt - now) / 1000));
  const q = questions[index];
  const answered = Object.keys(answers).length;
  const subjects = useMemo(() => [...new Set(questions.map((x) => x.subject))], [questions]);

  if (!q) return null;

  return (
    <div className="player">
      <div className="player-top">
        <span className={`pill ${left < 300 ? 'fire' : ''}`}>
          ⏱ {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
        </span>
        <div className="progress">
          <div style={{ width: `${(answered / questions.length) * 100}%` }} />
        </div>
        <button className="btn sm" onClick={() => setGrid((g) => !g)}>
          {index + 1}/{questions.length}
        </button>
      </div>

      <div className="chips" style={{ marginTop: 10 }}>
        {subjects.map((s) => {
          const first = questions.findIndex((x) => x.subject === s);
          return (
            <button key={s} className={`chip ${q.subject === s ? 'selected' : ''}`} onClick={() => setIndex(first)}>
              {SHORT[s]} {questions.filter((x, i) => x.subject === s && answers[i]).length}/{questions.filter((x) => x.subject === s).length}
            </button>
          );
        })}
      </div>

      {grid ? (
        <div className="player-body">
          <div className="q-grid">
            {questions.map((x, i) => (
              <button
                key={x.ex.id}
                className={`q-cell ${answers[i] ? 'answered' : ''} ${i === index ? 'current' : ''}`}
                onClick={() => {
                  setIndex(i);
                  setGrid(false);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="player-body" key={index}>
          <div className="eyebrow">
            {courseById(q.subject).title} · Question {index + 1}
          </div>
          <Prompt text={q.ex.prompt} />
          <ExerciseView
            ex={q.ex}
            locked={false}
            initial={answers[index]?.raw}
            onChange={(ready, correct, raw) =>
              setAnswers((a) => {
                if (!ready) {
                  const { [index]: _, ...rest } = a;
                  return rest;
                }
                return { ...a, [index]: { raw, correct } };
              })
            }
            onPenalty={() => {}}
            onSolved={() => {}}
          />
        </div>
      )}

      <div className="player-bottom row">
        <button className="btn grow" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          ← Prev
        </button>
        {index < questions.length - 1 ? (
          <button className="btn primary grow" onClick={() => setIndex(index + 1)}>
            Next →
          </button>
        ) : (
          <button
            className="btn go grow"
            onClick={async () => {
              if (await confirmAction(`Submit? ${questions.length - answered} question(s) unanswered.`)) submit();
            }}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

function ExamResults({ record, questions, results, onClose }: { record: ExamRecord; questions: ExamQuestion[]; results: Record<number, boolean>; onClose: () => void }) {
  const ratio = record.total / record.max;
  const host: Who = ratio >= 0.75 ? 'tunde' : ratio >= 0.5 ? 'mei' : 'ada';
  const line =
    ratio >= 0.75
      ? `${record.total}/${record.max}! That is admission territory. Keep this level every week.`
      : ratio >= 0.5
        ? `${record.total}/${record.max}. Solid base. Your review queue now holds every miss, clear it before the next mock.`
        : `${record.total}/${record.max}. This is where the work starts, my child. Every wrong answer is now in your review. We go again.`;
  const wrong = questions.map((q, i) => ({ q, i })).filter(({ i }) => !results[i]);
  const [deep, setDeep] = useState<ExamQuestion | null>(null);
  if (deep) return <DeepDive ex={deep.ex} onClose={() => setDeep(null)} />;
  const expected = record.subjects.reduce((n, s) => n + FORMATS[record.format].perSubject(s.subject === 'english'), 0);
  const short = questions.length < expected;

  return (
    <div className="player" style={{ overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', paddingTop: 10 }}>
        <Character who={host} size={130} mood="cheer" />
        <div className="streak-num" style={{ fontSize: 56 }}>
          {record.total}
          <span className="muted" style={{ fontSize: 22 }}>
            /{record.max}
          </span>
        </div>
      </div>
      <p className="card" style={{ fontWeight: 700 }}>
        {line}
      </p>
      {record.subjects.map((s) => (
        <div key={s.subject} style={{ margin: '10px 0' }}>
          <div className="row between small" style={{ fontWeight: 800 }}>
            <span>{courseById(s.subject).title}</span>
            <span>
              {s.score}/100 · {s.correct}/{s.total} right
            </span>
          </div>
          <div className="goal-bar">
            <div style={{ width: `${s.score}%` }} />
          </div>
        </div>
      ))}
      {short && <p className="small muted">Some subjects had fewer questions than the real exam because their banks are still growing. Scores are still out of 100 per subject.</p>}

      {wrong.length > 0 && (
        <>
          <h2 className="section-title">Review your mistakes</h2>
          {wrong.slice(0, 25).map(({ q, i }) => (
            <div key={q.ex.id} className="card" style={{ margin: '10px 0' }}>
              <div className="eyebrow">
                {courseById(q.subject).title} · Q{i + 1}
              </div>
              <div style={{ fontWeight: 800, margin: '4px 0' }}>{q.ex.prompt}</div>
              <div className="small" style={{ color: 'var(--green)', fontWeight: 800 }}>
                Answer: {correctAnswer(q.ex)}
              </div>
              <div className="small" style={{ marginTop: 4 }}>
                {q.ex.explain}
              </div>
              {q.ex.tip && <TipBox tip={q.ex.tip} />}
              <button className="btn sm deeper" style={{ marginTop: 8 }} onClick={() => (haptic(), setDeep(q))}>
                📓 Go deeper
              </button>
            </div>
          ))}
        </>
      )}
      <button className="btn go block" style={{ margin: '12px 0 20px' }} onClick={onClose}>
        Done
      </button>
    </div>
  );
}
