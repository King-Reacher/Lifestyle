import { Character, Say } from '../../components/Character';
import { useStore } from '../../lib/store';
import { haptic } from '../../lib/telegram';
import { allMilestones, CAREER } from '../career';
import { allLessons, CODING } from '../courses';

export function CareerPath({ onBack }: { onBack: () => void }) {
  const { data, update, cheer } = useStore();
  const ticked = data.code.career;
  const done = allMilestones.filter((m) => ticked[m.id]).length;
  const codingLessons = allLessons(CODING);
  const codingDone = codingLessons.filter((l) => data.learn.lessons[l.id]).length;

  const toggle = (id: string) => {
    haptic('success');
    const on = !ticked[id];
    update((d) => ({ ...d, code: { ...d.code, career: { ...d.code.career, [id]: on } } }));
    if (on) cheer({ who: 'tunde', text: 'Milestone done. That goes on your portfolio, not just your streak! 💪' });
  };

  return (
    <>
      <button className="btn sm ghost" onClick={onBack}>
        ← Coding
      </button>
      <Say who="greta" text="Six stages from first line of code to engineer people trust. Projects prove skill. Tick them off honestly." size={80} />
      <div className="card glow">
        <div className="row between small" style={{ fontWeight: 800 }}>
          <span>Career milestones</span>
          <span>
            {done}/{allMilestones.length}
          </span>
        </div>
        <div className="goal-bar">
          <div style={{ width: `${(done / allMilestones.length) * 100}%` }} />
        </div>
      </div>

      {CAREER.map((stage) => (
        <div key={stage.id} className="card">
          <div className="row">
            <Character who={stage.who} size={56} />
            <div className="grow">
              <h2 style={{ margin: 0 }}>{stage.title}</h2>
              <div className="small muted" style={{ fontWeight: 700 }}>
                {stage.goal}
              </div>
            </div>
          </div>
          <div className="chips" style={{ flexWrap: 'wrap', margin: '10px 0' }}>
            {stage.skills.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
          {stage.inApp && (
            <p className="small" style={{ fontWeight: 800, color: 'var(--gold)', margin: '0 0 6px' }}>
              In this app: {stage.inApp}, {codingDone}/{codingLessons.length} lessons done
            </p>
          )}
          {stage.milestones.map((m) => (
            <label key={m.id} className="milestone">
              <input type="checkbox" checked={!!ticked[m.id]} onChange={() => toggle(m.id)} />
              <span className={ticked[m.id] ? 'done' : ''}>{m.text}</span>
            </label>
          ))}
        </div>
      ))}
    </>
  );
}
