import { useState } from 'react';
import { Character, Say, type Who } from '../../components/Character';
import { today } from '../../lib/dates';
import { uid, useStore } from '../../lib/store';
import { haptic } from '../../lib/telegram';
import { COURSES } from '../courses';
import { buildLesson, DAILY_GOAL, dueReviews, lessonStatus, recordLesson, reviewResult, studyStreak, type Item } from '../engine';
import type { Course, Lesson } from '../types';
import { ExamHall } from './ExamHall';
import { Player, type PlayerResult } from './Player';

const REVIEW_XP = 5;
const EXAM_TAB = 'exam';

type Playing = { kind: 'lesson'; course: Course; lesson: Lesson; items: Item[]; host: Who } | { kind: 'review'; items: Item[] };

export function Learn() {
  const { data, update, cheer } = useStore();
  const [tab, setTab] = useState('maths');
  const [playing, setPlaying] = useState<Playing | null>(null);
  const date = today();
  const learn = data.learn;
  const due = dueReviews(learn.review, date);
  const xpToday = learn.xpByDay[date] ?? 0;
  const streak = studyStreak(learn, date);
  const info = COURSES.find((c) => c.course.id === tab);

  const start = (course: Course, lesson: Lesson, host: Who) => {
    haptic();
    setPlaying({ kind: 'lesson', course, lesson, items: buildLesson(lesson, Date.now() % 100000), host });
  };

  const finishLesson = (course: Course, lesson: Lesson, host: Who, r: PlayerResult) => {
    setPlaying(null);
    if (!r.completed) return;
    const first = !learn.lessons[lesson.id];
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
          area: course.id === 'academy' ? 'academy' : 'jamb',
          text: `${course.title}: ${lesson.title}, ${r.session.firstTry.length}/${r.session.graded} right first try`,
          minutes: r.minutes,
        },
      ],
    }));
    cheer(first ? { who: 'blaze', text: 'New lesson unlocked! The path goes on. 🔥' } : { who: host, text: 'Practice makes it automatic. Good.' });
  };

  const finishReview = (r: PlayerResult) => {
    setPlaying(null);
    if (!r.completed) return;
    update((d) => ({ ...d, learn: { ...d.learn, xpByDay: { ...d.learn.xpByDay, [date]: (d.learn.xpByDay[date] ?? 0) + REVIEW_XP } } }));
    cheer({ who: 'greta', text: 'Review done. That is how memory becomes permanent.' });
  };

  if (playing?.kind === 'lesson') {
    const p = playing;
    return <Player title={p.lesson.title} items={p.items} host={p.host} onExit={(r) => finishLesson(p.course, p.lesson, p.host, r)} />;
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
        {COURSES.map(({ course }) => (
          <button key={course.id} className={`chip ${tab === course.id ? 'selected' : ''}`} onClick={() => (haptic(), setTab(course.id))}>
            {course.icon} {course.title}
          </button>
        ))}
        <button className={`chip ${tab === EXAM_TAB ? 'selected' : ''}`} onClick={() => (haptic(), setTab(EXAM_TAB))}>
          🏆 Exam hall
        </button>
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

      {due.length > 0 && tab !== EXAM_TAB && (
        <div className="card glow">
          <Say who="greta" text={`${due.length} question${due.length > 1 ? 's' : ''} you missed before ${due.length > 1 ? 'are' : 'is'} due. Reviewing at the right time is how memory sticks.`} size={64}>
            <button className="btn primary sm" onClick={() => setPlaying({ kind: 'review', items: due.slice(0, 10).map((r) => r.ex) })}>
              Review now
            </button>
          </Say>
        </div>
      )}

      {tab === EXAM_TAB ? <ExamHall /> : info && <CoursePath course={info.course} onStart={start} />}
    </>
  );
}

function CoursePath({ course, onStart }: { course: Course; onStart: (c: Course, l: Lesson, host: Who) => void }) {
  const { data } = useStore();
  const status = lessonStatus(course, data.learn);
  const done = [...status.values()].filter((s) => s === 'done').length;

  return (
    <>
      <div className="small muted" style={{ marginTop: 10, fontWeight: 800 }}>
        {course.title}: {done}/{status.size} lessons done
      </div>
      {course.units.map((unit, ui) => (
        <section key={unit.id}>
          <div className="unit-banner" style={{ ['--unit' as string]: unit.color }}>
            <div className="grow">
              <div className="eyebrow">{course.id === 'academy' ? 'School' : `Unit ${ui + 1}`}</div>
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
                <div key={l.id} className={`lesson-stop ${st}`} style={{ transform: `translateX(${offset * 38}px)` }}>
                  {st === 'current' && <div className="start-bubble">START</div>}
                  <button
                    className={`lesson-node ${st}`}
                    style={{ ['--unit' as string]: unit.color }}
                    disabled={st === 'locked'}
                    onClick={() => onStart(course, l, unit.who)}
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
        <div className="eyebrow">Coming next in {course.title}</div>
        <div className="chips" style={{ flexWrap: 'wrap', marginTop: 8 }}>
          {course.upcoming.map((u) => (
            <span key={u} className="chip">
              🔒 {u}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
