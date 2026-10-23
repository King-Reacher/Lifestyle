import { useState } from 'react';
import { Character, Say } from '../components/Character';
import { Empty, Field, Sheet } from '../components/ui';
import { addDays, diffDays, today } from '../lib/dates';
import {
  allocateSavings,
  brokeToday,
  canBuy,
  coolingHoursLeft,
  delayDays,
  focusGoal,
  MIN_SAVE_PERCENT,
  monthSummary,
  moneyStreak,
  naira,
  notWasted,
  perDayNeeded,
  remaining,
  SPLIT_PRESETS,
  splitIncome,
  type SavingsGoal,
  type Split,
  type Want,
} from '../lib/money';
import { uid, useStore } from '../lib/store';
import { confirmAction, haptic } from '../lib/telegram';

type Open = 'earn' | 'spend' | 'goal' | 'want' | 'split' | { save: SavingsGoal } | null;

export function Money() {
  const { data, update, cheer } = useStore();
  const date = today();
  const money = data.money;
  const [open, setOpen] = useState<Open>(null);
  const sum = monthSummary(data.entries, money, date);
  const streak = moneyStreak(data.entries, money, date);
  const broke = brokeToday(data.entries, date);
  const loggedToday = money.checkins.includes(date) || data.entries.some((e) => e.date === date && (e.type === 'money-in' || e.type === 'money-out'));
  const focus = focusGoal(money.goals);
  const waiting = money.wants.filter((w) => w.status === 'waiting' || w.status === 'approved');
  const saved = notWasted(money);

  const checkIn = () => {
    haptic('success');
    update((d) => ({ ...d, money: { ...d.money, checkins: [...d.money.checkins, date] } }));
    cheer({ who: 'ada', text: 'Good. A day where money obeyed you, not the other way round.' });
  };

  const decideWant = (w: Want, status: 'bought' | 'dropped') => {
    update((d) => ({
      ...d,
      money: { ...d.money, wants: d.money.wants.map((x) => (x.id === w.id ? { ...x, status, decidedAt: new Date().toISOString() } : x)) },
      entries:
        status === 'bought'
          ? [...d.entries, { id: uid(), at: new Date().toISOString(), date, type: 'money-out', area: 'money', text: w.title, amount: w.price, spend: 'planned' }]
          : [...d.entries, { id: uid(), at: new Date().toISOString(), date, type: 'decision', area: 'money', text: `Decided not to buy ${w.title} (${naira(w.price)})` }],
    }));
    cheer(status === 'dropped' ? { who: 'ada', text: `${naira(w.price)} saved from impulse. That is discipline, my child.` } : { who: 'tunde', text: 'Planned, waited, paid from fun money. That is how it is done.' });
  };

  const adaLine = broke
    ? 'You spent on something unplanned today. The streak is broken. No drama: log it honestly and start again tomorrow.'
    : focus
      ? `Your focus: ${focus.title}. ${naira(remaining(focus))} to go. Every naira needs a job before you spend it.`
      : 'Set a savings goal first. Money without a target always finds a way to disappear.';

  return (
    <>
      <Say who="ada" text={adaLine} size={84} />

      <div className="card glow">
        <div className="row">
          <Character who="blaze" size={70} mood={broke ? 'talking' : 'idle'} />
          <div className="grow">
            <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
              <span className="streak-num">{streak}</span>
              <span className="eyebrow">day money streak</span>
            </div>
            <div className="small" style={{ fontWeight: 700 }}>
              {broke ? 'Broken today by an unplanned spend.' : loggedToday ? 'Today is counted. Stay on plan.' : 'Log money or check in to keep it.'}
            </div>
          </div>
        </div>
        {!loggedToday && !broke && (
          <button className="btn go block" style={{ marginTop: 12 }} onClick={checkIn}>
            I stuck to my plan today
          </button>
        )}
      </div>

      <div className="row money-actions" style={{ gap: 8 }}>
        <button className="btn primary grow" onClick={() => setOpen('earn')}>
          💰 I earned
        </button>
        <button className="btn grow" onClick={() => setOpen('spend')}>
          💸 I spent
        </button>
        <button className="btn grow" onClick={() => setOpen('want')}>
          🛍️ I want
        </button>
      </div>

      <div className="card">
        <div className="row between">
          <h2 style={{ margin: 0 }}>This month</h2>
          <button className="btn sm ghost" onClick={() => setOpen('split')}>
            Split {money.split.needs}/{money.split.save}/{money.split.fun}
          </button>
        </div>
        <div className="stats" style={{ marginTop: 10 }}>
          <div className="stat-tile">
            <div className="stat" style={{ color: 'var(--green)', fontSize: 18 }}>
              {naira(sum.income)}
            </div>
            <div className="small muted">earned</div>
          </div>
          <div className="stat-tile">
            <div className="stat" style={{ color: 'var(--gold)', fontSize: 18 }}>
              {naira(sum.saved)}
            </div>
            <div className="small muted">saved</div>
          </div>
          <div className="stat-tile">
            <div className="stat" style={{ fontSize: 18 }}>{naira(sum.needs)}</div>
            <div className="small muted">on needs</div>
          </div>
        </div>
        <div className="row between small" style={{ marginTop: 12, fontWeight: 800 }}>
          <span>Fun money</span>
          <span>
            {naira(Math.max(0, sum.funLeft))} left of {naira(sum.funBudget)}
          </span>
        </div>
        <div className="goal-bar">
          <div style={{ width: `${sum.funBudget ? Math.min(100, (sum.wants / sum.funBudget) * 100) : 0}%`, background: sum.funLeft < 0 ? 'var(--red)' : undefined }} />
        </div>
        {saved > 0 && (
          <p className="small" style={{ marginBottom: 0, fontWeight: 800, color: 'var(--green)' }}>
            🛡️ {naira(saved)} not wasted on impulses so far.
          </p>
        )}
      </div>

      <div className="row between">
        <h2 className="section-title">Savings goals</h2>
        <button className="btn sm" onClick={() => setOpen('goal')}>
          + Goal
        </button>
      </div>
      {money.goals.length === 0 && (
        <div className="card">
          <Empty>Start with an emergency fund. Even ₦20,000 changes how emergencies feel.</Empty>
        </div>
      )}
      {money.goals.map((g) => {
        const per = perDayNeeded(g, date);
        const pct = g.target ? Math.min(100, (g.saved / g.target) * 100) : 0;
        return (
          <div key={g.id} className="card">
            <div className="row between">
              <h2 style={{ margin: 0 }}>{g.title}</h2>
              <span className="small muted">{diffDays(date, g.deadline)} days left</span>
            </div>
            <div className="small" style={{ margin: '6px 0', fontWeight: 700 }}>
              {naira(g.saved)} of {naira(g.target)}
            </div>
            <div className="goal-bar">
              <div style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--green), #5ee69a)' }} />
            </div>
            <div className="row between" style={{ marginTop: 10 }}>
              <span className="small" style={{ fontWeight: 700 }}>
                {per === 0 ? '✅ Reached!' : per === null ? "⚠️ Deadline passed. Extend it, don't borrow." : `Needs ${naira(per * 7)} a week`}
              </span>
              {remaining(g) > 0 && (
                <button className="btn sm primary" onClick={() => setOpen({ save: g })}>
                  + Save
                </button>
              )}
            </div>
          </div>
        );
      })}

      <h2 className="section-title">Wants (strict)</h2>
      {waiting.length === 0 ? (
        <div className="card">
          <Empty>Want to buy something? Add it here first. It waits {48} hours before you can buy it.</Empty>
        </div>
      ) : (
        waiting.map((w) => {
          const check = canBuy(w, sum.funLeft);
          const hours = coolingHoursLeft(w);
          const delay = focus ? delayDays(w.price, focus, money, date) : 0;
          return (
            <div key={w.id} className="card">
              <div className="row between">
                <h2 style={{ margin: 0 }}>{w.title}</h2>
                <b>{naira(w.price)}</b>
              </div>
              {focus && delay > 0 && (
                <p className="small" style={{ margin: '6px 0', fontWeight: 700, color: 'var(--gold)' }}>
                  Delays "{focus.title}" by about {delay} day{delay === 1 ? '' : 's'}.
                </p>
              )}
              {hours > 0 ? (
                <>
                  <div className="small muted" style={{ fontWeight: 800 }}>
                    ⏳ Cooling off: {Math.ceil(hours)}h left
                  </div>
                  <div className="goal-bar">
                    <div style={{ width: `${(1 - hours / 48) * 100}%` }} />
                  </div>
                  <button className="btn sm block" style={{ marginTop: 10 }} onClick={() => decideWant(w, 'dropped')}>
                    I don't need it anymore
                  </button>
                </>
              ) : (
                <>
                  <p className="small" style={{ fontWeight: 800, margin: '6px 0' }}>
                    48 hours passed. Do you still want it?
                  </p>
                  {!check.ok && <p className="small" style={{ color: 'var(--red)', fontWeight: 800, margin: '4px 0' }}>{check.reason}</p>}
                  <div className="row">
                    <button className="btn grow" onClick={() => decideWant(w, 'dropped')}>
                      Drop it
                    </button>
                    <button className="btn go grow" disabled={!check.ok} onClick={() => decideWant(w, 'bought')}>
                      Buy it
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}

      {open === 'earn' && <EarnSheet onClose={() => setOpen(null)} />}
      {open === 'spend' && <SpendSheet onClose={() => setOpen(null)} />}
      {open === 'goal' && <GoalSheet onClose={() => setOpen(null)} />}
      {open === 'want' && <WantSheet onClose={() => setOpen(null)} />}
      {open === 'split' && <SplitSheet onClose={() => setOpen(null)} />}
      {open && typeof open === 'object' && <SaveSheet goal={open.save} onClose={() => setOpen(null)} />}
    </>
  );
}

function amountOf(s: string) {
  return Math.max(0, Math.round(Number(s.replace(/[^0-9.]/g, '')) || 0));
}

function EarnSheet({ onClose }: { onClose: () => void }) {
  const { data, update, cheer } = useStore();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [logged, setLogged] = useState<number | null>(null);
  const date = today();

  const log = () => {
    const n = amountOf(amount);
    if (!n) return;
    update((d) => ({ ...d, entries: [...d.entries, { id: uid(), at: new Date().toISOString(), date, type: 'money-in', area: 'money', text: source.trim() || 'Income', amount: n }] }));
    haptic('success');
    setLogged(n);
  };

  if (logged !== null) {
    const parts = splitIncome(logged, data.money.split);
    const plan = allocateSavings(parts.save, data.money.goals);
    const saveNow = () => {
      update((d) => ({
        ...d,
        money: {
          ...d.money,
          goals: d.money.goals.map((g) => ({ ...g, saved: g.saved + (plan.find((p) => p.goalId === g.id)?.amount ?? 0) })),
          contributions: [...d.money.contributions, ...plan.map((p) => ({ date, goalId: p.goalId, amount: p.amount }))],
        },
      }));
      cheer({ who: 'ada', text: `${naira(parts.save)} saved before you could spend it. Pay yourself first, always.` });
      onClose();
    };
    return (
      <Sheet title="Give every naira a job" onClose={onClose}>
        <Say who="ada" text={`${naira(logged)} came in. Before anything else, here is the plan.`} size={64} />
        <div className="split-rows">
          <div className="row between">
            <span>🏠 Needs ({data.money.split.needs}%)</span>
            <b>{naira(parts.needs)}</b>
          </div>
          <div className="row between">
            <span>🏦 Save ({data.money.split.save}%)</span>
            <b style={{ color: 'var(--gold)' }}>{naira(parts.save)}</b>
          </div>
          <div className="row between">
            <span>🎉 Fun ({data.money.split.fun}%)</span>
            <b>{naira(parts.fun)}</b>
          </div>
        </div>
        {plan.length > 0 ? (
          <>
            <p className="small muted">
              Savings go to:{' '}
              {plan.map((p) => `${data.money.goals.find((g) => g.id === p.goalId)?.title} ${naira(p.amount)}`).join(', ')}
            </p>
            <button className="btn primary block" onClick={saveNow}>
              Save {naira(parts.save)} now
            </button>
          </>
        ) : (
          <p className="small muted">Add a savings goal so this money has somewhere to go.</p>
        )}
        <button className="btn block ghost" style={{ marginTop: 8 }} onClick={onClose}>
          Later
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet title="Money came in" onClose={onClose}>
      <Field label="Amount (₦)">
        <input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 15000" />
      </Field>
      <Field label="From where?">
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Pocket money, design job" />
      </Field>
      <button className="btn go block" disabled={!amountOf(amount)} onClick={log}>
        Log it and plan it
      </button>
    </Sheet>
  );
}

function SpendSheet({ onClose }: { onClose: () => void }) {
  const { update, cheer } = useStore();
  const [amount, setAmount] = useState('');
  const [what, setWhat] = useState('');
  const [kind, setKind] = useState<'need' | 'unplanned'>('need');
  const date = today();

  const log = async () => {
    const n = amountOf(amount);
    if (!n || !what.trim()) return;
    if (kind === 'unplanned' && !(await confirmAction('An unplanned want breaks your money streak today. Log it honestly anyway?'))) return;
    update((d) => ({ ...d, entries: [...d.entries, { id: uid(), at: new Date().toISOString(), date, type: 'money-out', area: 'money', text: what.trim(), amount: n, spend: kind }] }));
    cheer(kind === 'need' ? { who: 'zara', text: 'Need logged. The ledger remembers.' } : { who: 'ada', text: 'Honest is better than perfect. Tomorrow we use the wants list first.' });
    onClose();
  };

  return (
    <Sheet title="Money went out" onClose={onClose}>
      <Field label="What for?">
        <input autoFocus value={what} onChange={(e) => setWhat(e.target.value)} placeholder="e.g. Transport, data, food" />
      </Field>
      <Field label="Amount (₦)">
        <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <Field label="Be honest: was it…">
        <div className="row" style={{ gap: 8 }}>
          <button className={`btn grow ${kind === 'need' ? 'primary' : ''}`} onClick={() => setKind('need')} type="button">
            A real need
          </button>
          <button className={`btn grow ${kind === 'unplanned' ? 'danger-solid' : ''}`} onClick={() => setKind('unplanned')} type="button">
            An unplanned want
          </button>
        </div>
      </Field>
      <p className="small muted">Planned wants are bought from the wants list after the 48-hour wait.</p>
      <button className="btn go block" disabled={!amountOf(amount) || !what.trim()} onClick={log}>
        Log it
      </button>
    </Sheet>
  );
}

function WantSheet({ onClose }: { onClose: () => void }) {
  const { data, update } = useStore();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const date = today();
  const focus = focusGoal(data.money.goals);
  const n = amountOf(price);
  const delay = focus && n ? delayDays(n, focus, data.money, date) : 0;

  const add = () => {
    if (!title.trim() || !n) return;
    const want: Want = { id: uid(), title: title.trim(), price: n, addedAt: new Date().toISOString(), status: 'waiting' };
    update((d) => ({ ...d, money: { ...d.money, wants: [...d.money.wants, want] } }));
    onClose();
  };

  return (
    <Sheet title="I want to buy…" onClose={onClose}>
      <Field label="What?">
        <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New sneakers" />
      </Field>
      <Field label="Price (₦)">
        <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} />
      </Field>
      {n > 0 && (
        <Say
          who="ada"
          text={focus && delay > 0 ? `This pushes "${focus.title}" back about ${delay} day${delay === 1 ? '' : 's'}. It waits 48 hours. If you still want it then, and it fits your fun money, you may.` : 'It waits 48 hours first. Most wants disappear on their own.'}
          size={56}
        />
      )}
      <button className="btn primary block" disabled={!title.trim() || !n} onClick={add}>
        Start the 48-hour wait
      </button>
    </Sheet>
  );
}

function GoalSheet({ onClose }: { onClose: () => void }) {
  const { update } = useStore();
  const [title, setTitle] = useState('Emergency fund');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');
  const [deadline, setDeadline] = useState(addDays(today(), 120));

  const add = () => {
    const t = amountOf(target);
    if (!title.trim() || !t) return;
    const g: SavingsGoal = { id: uid(), title: title.trim(), target: t, saved: amountOf(saved), deadline, createdAt: today() };
    update((d) => ({ ...d, money: { ...d.money, goals: [...d.money.goals, g] } }));
    onClose();
  };

  return (
    <Sheet title="New savings goal" onClose={onClose}>
      <Field label="Goal">
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Target (₦)">
        <input inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g. 50000" />
      </Field>
      <Field label="Already saved (₦)">
        <input inputMode="numeric" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" />
      </Field>
      <Field label="Deadline">
        <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value || deadline)} />
      </Field>
      <button className="btn primary block" disabled={!amountOf(target)} onClick={add}>
        Create goal
      </button>
    </Sheet>
  );
}

function SaveSheet({ goal, onClose }: { goal: SavingsGoal; onClose: () => void }) {
  const { update, cheer } = useStore();
  const [amount, setAmount] = useState('');
  const save = () => {
    const n = Math.min(amountOf(amount), remaining(goal));
    if (!n) return;
    update((d) => ({
      ...d,
      money: {
        ...d.money,
        goals: d.money.goals.map((g) => (g.id === goal.id ? { ...g, saved: g.saved + n } : g)),
        contributions: [...d.money.contributions, { date: today(), goalId: goal.id, amount: n }],
      },
    }));
    cheer({ who: 'blaze', text: `${naira(n)} into ${goal.title}. Watch it grow! 🔥` });
    onClose();
  };
  return (
    <Sheet title={`Save into ${goal.title}`} onClose={onClose}>
      <Field label={`Amount (₦), ${naira(remaining(goal))} to go`}>
        <input autoFocus inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      <button className="btn primary block" disabled={!amountOf(amount)} onClick={save}>
        Save it
      </button>
    </Sheet>
  );
}

function SplitSheet({ onClose }: { onClose: () => void }) {
  const { data, update } = useStore();
  const [split, setSplit] = useState<Split>(data.money.split);
  return (
    <Sheet title="How every income is split" onClose={onClose}>
      <p className="small muted">Needs / Save / Fun. Strict rule: at least {MIN_SAVE_PERCENT}% always goes to savings.</p>
      <div className="chips" style={{ flexWrap: 'wrap' }}>
        {SPLIT_PRESETS.map((p) => (
          <button key={p.label} className={`chip ${p.split.save === split.save && p.split.needs === split.needs ? 'selected' : ''}`} onClick={() => setSplit(p.split)}>
            {p.label}
          </button>
        ))}
      </div>
      <button
        className="btn primary block"
        style={{ marginTop: 14 }}
        onClick={() => {
          update((d) => ({ ...d, money: { ...d.money, split } }));
          onClose();
        }}
      >
        Use {split.needs}/{split.save}/{split.fun}
      </button>
    </Sheet>
  );
}
