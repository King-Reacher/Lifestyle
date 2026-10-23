import { useEffect, useRef, useState } from 'react';
import { Character, CAST, Say, type Who } from '../../components/Character';
import { pick } from '../../lib/lines';
import { confirmAction, getWebApp, haptic } from '../../lib/telegram';
import {
  accuracy,
  flagCard,
  answer,
  correctAnswer,
  current,
  HEARTS,
  isFailed,
  isFinished,
  isTeach,
  penalty,
  progress,
  startSession,
  xpFor,
  type Item,
  type Session,
} from '../engine';
import type { Exercise, Teach, Tip } from '../types';
import { today } from '../../lib/dates';
import type { Area } from '../../lib/ledger';
import { uid, useStore } from '../../lib/store';
import { ExerciseView, PROMPT_LABEL } from './Exercises';
import { UnderstandHelp } from './Understand';

const PRAISE: { who: Who; text: string }[] = [
  { who: 'tunde', text: "Correct! You're on fire!" },
  { who: 'mei', text: 'Exactly right. Clean work.' },
  { who: 'maddie', text: 'Nailed it! 🙌' },
  { who: 'priya', text: 'Beautiful. Keep that rhythm.' },
  { who: 'greta', text: 'Precisely. Well reasoned.' },
  { who: 'zara', text: 'Correct, and logged in your brain.' },
];

const TIP_ICON: Record<Tip['kind'], string> = { shortcut: '⚡ Shortcut', eliminate: '🎯 Eliminate', formula: '📐 Formula', memory: '🧠 Memory' };

export function TipBox({ tip }: { tip: Tip }) {
  return (
    <div className={`tip tip-${tip.kind}`}>
      <b>{TIP_ICON[tip.kind]}</b> {tip.text}
    </div>
  );
}

export function TeachView({ card }: { card: Teach }) {
  return (
    <div className="teach">
      <Say who={card.who} text={card.title} size={84} />
      <div className="card" style={{ marginTop: 0 }}>
        {card.body.map((p) => (
          <p key={p} className="teach-line">
            {p}
          </p>
        ))}
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
      </div>
      {card.hook && <TipBox tip={card.hook} />}
    </div>
  );
}

export interface PlayerResult {
  session: Session;
  completed: boolean;
  minutes: number;
}

/**
 * Plays a list of teaching cards and exercises, Duolingo style: hearts,
 * progress bar, check → feedback → continue, wrong answers come back.
 */
export function Player({
  title,
  items,
  host,
  onAnswer,
  onExit,
  area = 'jamb',
}: {
  title: string;
  items: Item[];
  host: Who;
  /** Called for every graded answer (used by review mode). */
  onAnswer?: (ex: Exercise, correct: boolean) => void;
  onExit: (r: PlayerResult) => void;
  /** Ledger area for explanations you write in your own words. */
  area?: Area;
}) {
  const { update } = useStore();
  const [help, setHelp] = useState(false);
  const [session, setSession] = useState(() => startSession(items));
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [ready, setReady] = useState(false);
  const [correct, setCorrect] = useState(false);
  // Remount exercise views when the same exercise comes back.
  const [turn, setTurn] = useState(0);
  const answerRef = useRef(false);

  const item = current(session);
  const finished = isFinished(session);
  const failed = isFailed(session);
  const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));

  const quit = async () => {
    if (finished || failed || (await confirmAction('Quit this lesson? Progress in it will be lost.'))) {
      onExit({ session, completed: finished && !failed, minutes });
    }
  };

  // Telegram's back button quits too.
  const quitRef = useRef(quit);
  quitRef.current = quit;
  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    const h = () => quitRef.current();
    wa.BackButton.show();
    wa.BackButton.onClick(h);
    return () => {
      wa.BackButton.offClick(h);
      wa.BackButton.hide();
    };
  }, []);

  const check = () => {
    if (!item || isTeach(item)) return;
    const ok = answerRef.current;
    setCorrect(ok);
    setPhase('feedback');
    haptic(ok ? 'success' : 'error');
    onAnswer?.(item, ok);
  };

  const next = () => {
    haptic();
    setHelp(false);
    setSession((s) => answer(s, item && !isTeach(item) ? correct : true));
    setPhase('answering');
    setReady(false);
    answerRef.current = false;
    setTurn((t) => t + 1);
  };

  if (failed) {
    return (
      <div className="player center">
        <Character who="ada" size={140} mood="talking" />
        <h1>Out of hearts</h1>
        <p className="muted">No shame in it, my child. Mistakes are where the learning is. Try again, slower this time.</p>
        <button className="btn primary block" onClick={() => onExit({ session, completed: false, minutes })}>
          Back to path
        </button>
      </div>
    );
  }

  if (finished) {
    const acc = Math.round(accuracy(session) * 100);
    return (
      <div className="player center">
        <Character who={host} size={150} mood="cheer" />
        <h1 className="gold">Lesson complete!</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          {title}
        </p>
        <div className="result-tiles">
          <div className="result gold-tile">
            <div className="eyebrow">Total XP</div>
            <div className="stat">⚡ {xpFor(session)}</div>
          </div>
          <div className="result green-tile">
            <div className="eyebrow">Accuracy</div>
            <div className="stat">🎯 {acc}%</div>
          </div>
          <div className="result blue-tile">
            <div className="eyebrow">Time</div>
            <div className="stat">⏱ {minutes}m</div>
          </div>
        </div>
        <p className="small muted">{acc === 100 ? 'Perfect lesson. Bonus XP earned!' : `${session.mistakes.length} to review later. They'll come back until they stick.`}</p>
        <button className="btn go block" onClick={() => onExit({ session, completed: true, minutes })}>
          Continue
        </button>
      </div>
    );
  }

  const isCard = item && isTeach(item);
  const ex = item && !isTeach(item) ? item : null;
  const praise = pick(PRAISE, `${session.index}-${turn}`);
  // The heart is lost the moment the answer is marked wrong, not on "continue".
  const lostHeart = phase === 'feedback' && !correct && !!ex;
  const hearts = session.hearts - (lostHeart ? 1 : 0);

  return (
    <div className="player">
      <div className="player-top">
        <button className="btn sm ghost x" onClick={quit} aria-label="Quit lesson">
          ✕
        </button>
        <div className="progress">
          <div style={{ width: `${progress(session) * 100}%` }} />
        </div>
        <span className={`hearts ${lostHeart ? 'shake' : ''}`} aria-label={`${hearts} of ${HEARTS} hearts`}>
          ❤️ {hearts}
        </span>
      </div>

      <div className="player-body" key={turn}>
        {isCard && <TeachView card={item as Teach} />}
        {isCard && help && (
          <UnderstandHelp
            card={item as Teach}
            worked={session.queue.slice(session.index + 1).find((i): i is Exercise => !isTeach(i))}
            onUnderstood={next}
            onFlag={(note) => {
              update((d) => ({ ...d, learn: flagCard(d.learn, item as Teach, note) }));
              next();
            }}
            onSaveExplanation={(text) =>
              update((d) => ({
                ...d,
                entries: [...d.entries, { id: uid(), at: new Date().toISOString(), date: today(), type: 'learned', area, text: `In my own words, ${(item as Teach).title}: ${text}` }],
              }))
            }
          />
        )}
        {ex && (
          <>
            <div className="eyebrow" style={{ color: CAST[host].color }}>
              {PROMPT_LABEL[ex.kind]}
            </div>
            <h2 className="prompt">{ex.prompt}</h2>
            <ExerciseView
              ex={ex}
              locked={phase === 'feedback'}
              onChange={(r, ok) => {
                setReady(r);
                answerRef.current = ok;
              }}
              onPenalty={() => setSession((s) => penalty(s))}
              onSolved={() => {
                answerRef.current = true;
                setCorrect(true);
                setPhase('feedback');
                haptic('success');
                onAnswer?.(ex, true);
              }}
            />
          </>
        )}
      </div>

      {phase === 'feedback' && ex ? (
        <div className={`feedback ${correct ? 'ok' : 'bad'}`}>
          {correct ? (
            <div className="row">
              <Character who={praise.who} size={56} mood="cheer" />
              <div className="grow">
                <div className="fb-title">{praise.text}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="fb-title">{ex.kind === 'code' ? 'Not yet. One way to write it:' : 'Not quite. Correct answer:'}</div>
              {ex.kind === 'code' ? (
                <pre className="solution-code">{ex.solution}</pre>
              ) : (
                <div className="fb-answer">{correctAnswer(ex)}</div>
              )}
              <p className="fb-explain">{ex.explain}</p>
            </>
          )}
          {ex.tip && <TipBox tip={ex.tip} />}
          <button className={`btn block ${correct ? 'go' : 'danger-solid'}`} onClick={next}>
            {correct ? 'Continue' : 'Got it'}
          </button>
        </div>
      ) : (
        <div className="player-bottom">
          {isCard && help ? null : isCard ? (
            <>
              <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 8 }}>
                Do you understand?
              </div>
              <div className="row" style={{ gap: 10 }}>
                <button className="btn grow" onClick={() => (haptic(), setHelp(true))}>
                  No, not yet
                </button>
                <button className="btn go grow" onClick={next}>
                  Yes, I get it
                </button>
              </div>
            </>
          ) : ex?.kind === 'match' ? (
            <div className="small muted" style={{ textAlign: 'center' }}>
              Tap a left item, then its partner on the right
            </div>
          ) : (
            <button className="btn go block" disabled={!ready} onClick={check}>
              Check
            </button>
          )}
        </div>
      )}
    </div>
  );
}
