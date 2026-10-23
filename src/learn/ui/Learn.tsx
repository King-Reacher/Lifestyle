import { useState } from 'react';
import { Character, Say, type Who } from '../../components/Character';
import { today } from '../../lib/dates';
import { uid, useStore } from '../../lib/store';
import { haptic } from '../../lib/telegram';
import { buildLesson, DAILY_GOAL, dueReviews, lessonStatus, recordLesson, reviewResult, studyStreak, type Item } from '../engine';
import { MATHS } from '../maths';
import type { Lesson } from '../types';
import { Player, type PlayerResult } from './Player';

const COURSES: { id: string; title: string; icon: string; who: Who; ready: boolean }[] = [
  { id: 'maths', title: 'Maths', icon: '➗', who: 'mei', ready: true },
  { id: 'physics', title: 'Physics', icon: '⚛️', who: 'greta', ready: false },
  { id: 'chemistry', title: 'Chemistry', icon: '🧪', who: 'greta', ready: false },
  { id: 'english', title: 'English', icon: '📖', who: 'maddie', ready: false },
  { id: 'biology', title: 'Biology', icon: '🧬', who: 'priya', ready: false },
];

const REVIEW_XP = 5;

type Playing = { kind: 'lesson'; lesson: Lesson; items: Item[]; host: Who } | { kind: 'review'; items: Item[] };

export function Learn() {
  const { data, update, cheer } = useStore();
  const [course, setCourse] = useState('maths');
  const [playing, setPlaying] = useState<Playing | null>(null);
  const date = today();
  const learn = data.learn;
  const status = lessonStatus(MATHS, learn);
  const due = dueReviews(learn.review, date);
  const xpToday = learn.xpByDay[date] ?? 0;
  const streak = studyStreak(learn, date);
  const selected = COURSES.find((c) => c.id === course)!;

  const start = (lesson: Lesson, host: Who) => {
    haptic();
    setPlaying({ kind: 'lesson', lesson, items: buildLesson(lesson, Date.now() % 100000), host });
  };

  const finishLesson = (lesson: Lesson, r: PlayerResult) => {
    setPlaying(null);
    if (!r.completed) return;
    const first = !learn.lessons[lesson.id];
    const correctFirst = r.session.firstTry.length;
    update((d) => ({
      ...d,
      learn: recordLesson(d.learn, lesson.id, r.session, date),
      // Every lesson lands in the ledger too, so it becomes part of your memory.
      entries: [
        ...d.entries,
        {
          id: uid(),
          at: new Date().toISOString(),
          date,
          type: 'study',
          area: 'jamb',
          text: `Maths: ${lesson.title}, ${correctFirst}/${r.session.graded} right first try`,
          minutes: r.minutes,
        },
      ],
    }));
    cheer(first ? { who: 'blaze', text: 'New lesson unlocked! The path goes on. 🔥' } : { who: 'mei', text: 'Practice makes it automatic. Good.' });
  };

  const finishReview = (r: PlayerResult) => {
    setPlaying(null);
    if (!r.completed) return;
    update((d) => ({ ...d, learn: { ...d.learn, xpByDay: { ...d.learn.xpByDay, [date]: (d.learn.xpByDay[date] ?? 0) + REVIEW_XP } } }));
    cheer({ who: 'greta', text: 'Review done. That is how memory becomes permanent.' });
  };

  if (playing?.kind === 'lesson') {
    return <Player title={playing.lesson.title} items={playing.items} host={playing.host} onExit={(r) => finishLesson(playing.lesson, r)} />;
  }
  if (playing?.kind === 'review') {
    return (
      <Player
        title="Mistake review"
        items={playing.items}
        host="greta"
        onAnswer={(ex, ok) => update((d) => ({ ...d, learn: { ...d.learn, review: reviewResult(d.learn.review, ex.id, ok, date) } }))}
        onExit={finishReview}
      />
    );
  }

  return (
    <>
      <div className="chips course-chips">
        {COURSES.map((c) => (
          <button key={c.id} className={`chip ${course === c.id ? 'selected' : ''}`} onClick={() => (haptic(), setCourse(c.id))}>
            {c.icon} {c.title}
            {!c.ready && ' 🔒'}
          </button>
        ))}
      </div>

      <div className="learn-stats">
        <span className="pill fire">🔥 {streak}</span>
        <span className="pill gold">
          ⚡ {xpToday}/{DAILY_GOAL} XP
        </span>
        <span className="pill">🧠 {due.length} to review</span>
      </div>
      <div className="goal-bar">
        <div style={{ width: `${Math.min(1, xpToday / DAILY_GOAL) * 100}%` }} />
      </div>

      {!selected.ready ? (
        <div className="card" style={{ marginTop: 18 }}>
          <Say who={selected.who} text={`${selected.title} is being prepared from the very foundations. Finish Maths Unit 1 meanwhile. It trains the skills every subject uses.`} size={80} />
        </div>
      ) : (
        <>
          {due.length > 0 && (
            <div className="card glow">
              <Say who="greta" text={`${due.length} question${due.length > 1 ? 's' : ''} you missed before ${due.length > 1 ? 'are' : 'is'} due. Reviewing at the right time is how memory sticks.`} size={64}>
                <button className="btn primary sm" onClick={() => setPlaying({ kind: 'review', items: due.slice(0, 10).map((r) => r.ex) })}>
                  Review now
                </button>
              </Say>
            </div>
          )}

          {MATHS.units.map((unit, ui) => (
            <section key={unit.id}>
              <div className="unit-banner" style={{ ['--unit' as string]: unit.color }}>
                <div className="grow">
                  <div className="eyebrow">Unit {ui + 1}</div>
                  <h2 style={{ margin: '2px 0 4px' }}>{unit.title}</h2>
                  <div className="small">{unit.description}</div>
                </div>
                <Character who={unit.who} size={64} />
              </div>
              <div className="lesson-path">
                {unit.lessons.map((l, li) => {
                  const st = status.get(l.id)!;
                  const offset = [0, -1, -1.6, -1, 0, 1, 1.6, 1][li % 8];
                  return (
                    <div key={l.id} className="lesson-stop" style={{ transform: `translateX(${offset * 38}px)` }}>
                      {st === 'current' && <div className="start-bubble">START</div>}
                      <button
                        className={`lesson-node ${st}`}
                        style={{ ['--unit' as string]: unit.color }}
                        disabled={st === 'locked'}
                        onClick={() => start(l, unit.who)}
                        aria-label={`${l.title}${st === 'locked' ? ' (locked)' : ''}`}
                      >
                        {st === 'done' ? '✓' : st === 'locked' ? '🔒' : l.icon}
                      </button>
                      <div className={`lesson-title ${st}`}>{l.title}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="card">
            <div className="eyebrow">Coming next in Maths</div>
            <div className="chips" style={{ flexWrap: 'wrap', marginTop: 8 }}>
              {MATHS.upcoming.map((u) => (
                <span key={u} className="chip">
                  🔒 {u}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
