import { useState } from 'react';
import { Bar, Empty, Field, Sheet } from '../components/ui';
import { addDays, today } from '../lib/dates';
import { allocateIncome, checkFeasibility, formatMoney, inRange, remaining, requiredMonthly, sumBy, type Allocation } from '../lib/money';
import { uid, useStore } from '../lib/store';
import { TX_LABELS, type SavingsGoal, type Transaction, type TxKind } from '../lib/types';

const monthStart = (d: string) => `${d.slice(0, 8)}01`;

export function Money() {
  const { state, update } = useStore();
  const date = today();
  const cur = state.settings.currency;
  const fmt = (n: number) => formatMoney(n, cur);
  const [txOpen, setTxOpen] = useState<TxKind | null>(null);
  const [goalEdit, setGoalEdit] = useState<SavingsGoal | 'new' | null>(null);

  const month = inRange(state.transactions, monthStart(date), date);
  const income = sumBy(month, 'income');
  const essential = sumBy(month, 'essential');
  const discretionary = sumBy(month, 'discretionary');
  const saved = sumBy(month, 'saving');
  const feas = checkFeasibility(state.savingsGoals, state.transactions, state.settings.monthlyEssentials, date);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);

  const removeTx = (tx: Transaction) =>
    update((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== tx.id),
      savingsGoals: s.savingsGoals.map((g) => (g.id === tx.savingsGoalId ? { ...g, saved: Math.max(0, g.saved - tx.amount) } : g)),
    }));

  return (
    <>
      <h1 style={{ marginTop: 4 }}>Money</h1>
      <p className="muted small" style={{ marginTop: 0 }}>
        Make every amount serve a purpose: essentials first, savings second, wants last. No bank connection needed.
      </p>

      <div className="grid2">
        <div className="card">
          <div className="eyebrow">In this month</div>
          <div className="stat" style={{ color: 'var(--good)' }}>
            {fmt(income)}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Saved this month</div>
          <div className="stat">{fmt(saved)}</div>
        </div>
        <div className="card">
          <div className="eyebrow">Essentials</div>
          <div className="stat" style={{ fontSize: 20 }}>
            {fmt(essential)}
          </div>
        </div>
        <div className="card">
          <div className="eyebrow">Discretionary</div>
          <div className="stat" style={{ fontSize: 20 }}>
            {fmt(discretionary)}
          </div>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 6, margin: '12px 0' }}>
        {(Object.keys(TX_LABELS) as TxKind[]).map((k) => (
          <button key={k} className={`btn sm ${k === 'income' ? 'primary' : ''}`} onClick={() => setTxOpen(k)}>
            + {TX_LABELS[k]}
          </button>
        ))}
      </div>

      <div className="row between">
        <h2 className="section-title">Savings goals</h2>
        <button className="btn sm" onClick={() => setGoalEdit('new')}>
          + Goal
        </button>
      </div>
      {state.savingsGoals.length === 0 && (
        <div className="card">
          <Empty>Start with an emergency fund — even a small one changes how emergencies feel.</Empty>
        </div>
      )}
      {state.savingsGoals.map((g) => {
        const need = requiredMonthly(g, date);
        return (
          <div key={g.id} className="card" onClick={() => setGoalEdit(g)} style={{ cursor: 'pointer' }}>
            <div className="row between">
              <h3 style={{ margin: 0 }}>{g.title}</h3>
              <span className="small muted">by {g.deadline}</span>
            </div>
            <div className="small" style={{ margin: '6px 0' }}>
              {fmt(g.saved)} of {fmt(g.target)} · {fmt(remaining(g))} to go
            </div>
            <Bar value={g.saved / Math.max(1, g.target)} tone="good" />
            <div className="small" style={{ marginTop: 8 }}>
              {need === 0 ? (
                <span style={{ color: 'var(--good)' }}>Reached. Well done.</span>
              ) : need === null ? (
                <span style={{ color: 'var(--bad)' }}>Deadline passed — extend it or lower the target.</span>
              ) : (
                <>
                  Needs about <b>{fmt(need)}</b>/month
                </>
              )}
            </div>
          </div>
        );
      })}
      {state.savingsGoals.length > 0 && (
        <div className={`card ${feas.realistic ? '' : 'bad'}`}>
          <div className="eyebrow">Reality check</div>
          <p style={{ margin: '6px 0' }}>{feas.message}</p>
          <div className="muted small">
            Goals need {fmt(feas.requiredPerMonth)}/month · available after essentials ≈ {fmt(feas.available)}/month
            {state.settings.monthlyEssentials === 0 && ' (set your monthly essentials in Settings)'}
          </div>
        </div>
      )}

      <h2 className="section-title">Recent</h2>
      <div className="card">
        {recent.length === 0 ? (
          <Empty>Log money as it moves. Irregular income is fine — averages smooth it out.</Empty>
        ) : (
          <ul className="list small">
            {recent.map((t) => (
              <li key={t.id} className="row">
                <div className="grow">
                  <div>{t.note || TX_LABELS[t.kind]}</div>
                  <div className="muted">
                    {t.date} · {TX_LABELS[t.kind]}
                  </div>
                </div>
                <b style={{ color: t.kind === 'income' ? 'var(--good)' : undefined }}>
                  {t.kind === 'income' ? '+' : '−'}
                  {fmt(t.amount)}
                </b>
                <button className="btn sm ghost" onClick={() => removeTx(t)} aria-label="Delete">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {txOpen && <TxForm kind={txOpen} onClose={() => setTxOpen(null)} />}
      {goalEdit && <SavingsForm goal={goalEdit === 'new' ? undefined : goalEdit} onClose={() => setGoalEdit(null)} />}
    </>
  );
}

function TxForm({ kind: initialKind, onClose }: { kind: TxKind; onClose: () => void }) {
  const { state, update } = useStore();
  const cur = state.settings.currency;
  const [kind, setKind] = useState<TxKind>(initialKind);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [goalId, setGoalId] = useState(state.savingsGoals[0]?.id ?? '');
  const [allocation, setAllocation] = useState<Allocation | null>(null);
  const value = Number(amount) || 0;
  const date = today();

  const save = () => {
    if (value <= 0 || (kind === 'saving' && !goalId)) return;
    const tx: Transaction = { id: uid(), date, amount: value, kind, note: note.trim(), savingsGoalId: kind === 'saving' ? goalId : undefined };
    update((s) => ({
      ...s,
      transactions: [...s.transactions, tx],
      savingsGoals: kind === 'saving' ? s.savingsGoals.map((g) => (g.id === goalId ? { ...g, saved: g.saved + value } : g)) : s.savingsGoals,
    }));
    if (kind === 'income') {
      const spentEssentials = sumBy(inRange(state.transactions, monthStart(date), date), 'essential');
      setAllocation(allocateIncome(value, state.settings.monthlyEssentials - spentEssentials, state.savingsGoals, date));
    } else {
      onClose();
    }
  };

  if (allocation) {
    return (
      <Sheet title="Give this money a job" onClose={onClose}>
        <p className="muted small">Suggested split for {formatMoney(value, cur)}:</p>
        <ul className="list">
          <li className="row between">
            <span>Essentials still needed this month</span>
            <b>{formatMoney(allocation.essentials, cur)}</b>
          </li>
          {allocation.savings.map((a) => (
            <li key={a.goalId} className="row between">
              <span>Save → {a.title}</span>
              <b>{formatMoney(a.amount, cur)}</b>
            </li>
          ))}
          <li className="row between">
            <span>Free to spend or save extra</span>
            <b>{formatMoney(allocation.discretionary, cur)}</b>
          </li>
        </ul>
        {allocation.savings.length > 0 && (
          <button
            className="btn primary block"
            onClick={() => {
              update((s) => ({
                ...s,
                transactions: [
                  ...s.transactions,
                  ...allocation.savings.map((a) => ({ id: uid(), date, amount: a.amount, kind: 'saving' as const, note: a.title, savingsGoalId: a.goalId })),
                ],
                savingsGoals: s.savingsGoals.map((g) => {
                  const put = allocation.savings.find((a) => a.goalId === g.id)?.amount ?? 0;
                  return { ...g, saved: g.saved + put };
                }),
              }));
              onClose();
            }}
          >
            Save it now
          </button>
        )}
        <button className="btn block ghost" style={{ marginTop: 8 }} onClick={onClose}>
          Later
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet title={`Record ${TX_LABELS[kind].toLowerCase()}`} onClose={onClose}>
      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
        {(Object.keys(TX_LABELS) as TxKind[]).map((k) => (
          <button key={k} className={`btn sm ${kind === k ? 'primary' : ''}`} onClick={() => setKind(k)}>
            {TX_LABELS[k]}
          </button>
        ))}
      </div>
      <Field label={`Amount (${cur})`}>
        <input autoFocus type="number" inputMode="decimal" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
      </Field>
      {kind === 'saving' ? (
        <Field label="Towards">
          <select value={goalId} onChange={(e) => setGoalId(e.target.value)}>
            {state.savingsGoals.length === 0 && <option value="">Create a savings goal first</option>}
            {state.savingsGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Note">
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={kind === 'income' ? 'e.g. Tutoring' : 'e.g. Transport'} />
        </Field>
      )}
      <button className="btn primary block" onClick={save} disabled={value <= 0 || (kind === 'saving' && !goalId)}>
        Save
      </button>
    </Sheet>
  );
}

function SavingsForm({ goal, onClose }: { goal?: SavingsGoal; onClose: () => void }) {
  const { state, update } = useStore();
  const [draft, setDraft] = useState<SavingsGoal>(
    goal ?? { id: uid(), title: 'Emergency fund', target: 0, saved: 0, deadline: addDays(today(), 180), createdAt: today() },
  );
  const set = <K extends keyof SavingsGoal>(k: K, v: SavingsGoal[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const need = requiredMonthly(draft, today());
  const valid = draft.title.trim() && draft.target > 0;

  const save = () => {
    if (!valid) return;
    update((s) => ({ ...s, savingsGoals: goal ? s.savingsGoals.map((g) => (g.id === goal.id ? draft : g)) : [...s.savingsGoals, draft] }));
    onClose();
  };

  return (
    <Sheet title={goal ? 'Edit savings goal' : 'New savings goal'} onClose={onClose}>
      <Field label="Name">
        <input value={draft.title} onChange={(e) => set('title', e.target.value)} />
      </Field>
      <div className="grid2">
        <Field label={`Target (${state.settings.currency})`}>
          <input type="number" min={0} value={draft.target || ''} onChange={(e) => set('target', Number(e.target.value) || 0)} />
        </Field>
        <Field label={`Already saved (${state.settings.currency})`}>
          <input type="number" min={0} value={draft.saved || ''} onChange={(e) => set('saved', Number(e.target.value) || 0)} />
        </Field>
      </div>
      <Field label="Deadline">
        <input type="date" value={draft.deadline} onChange={(e) => set('deadline', e.target.value || draft.deadline)} />
      </Field>
      {draft.target > 0 && (
        <p className="small">
          Remaining = {formatMoney(remaining(draft), state.settings.currency)} ·{' '}
          {need === null ? 'deadline has passed' : <>Monthly saving ≈ <b>{formatMoney(need, state.settings.currency)}</b></>}
        </p>
      )}
      <div className="row">
        {goal && (
          <button
            className="btn danger"
            onClick={() => {
              update((s) => ({ ...s, savingsGoals: s.savingsGoals.filter((g) => g.id !== goal.id) }));
              onClose();
            }}
          >
            Delete
          </button>
        )}
        <button className="btn primary grow" onClick={save} disabled={!valid}>
          Save
        </button>
      </div>
    </Sheet>
  );
}
