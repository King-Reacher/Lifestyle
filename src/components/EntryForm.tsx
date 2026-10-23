import { useState } from 'react';
import { CURRENCY } from '../config';
import { today } from '../lib/dates';
import { AREAS, DEFAULT_AREA, MOODS, TYPES, similarPast, type Area, type Entry, type EntryType } from '../lib/ledger';
import { CHEERS, SAVED_DECISION, SAVED_SPEND, pick } from '../lib/lines';
import { uid, useStore } from '../lib/store';
import { confirmAction, haptic } from '../lib/telegram';
import { Character } from './Character';
import { EntryItem } from './EntryItem';
import { Field, Sheet } from './ui';

const PLACEHOLDER: Record<EntryType, string> = {
  did: 'e.g. Cleaned my room and planned tomorrow',
  study: 'e.g. Maths — fractions and BODMAS',
  'money-in': 'e.g. Paid for a design job',
  'money-out': 'e.g. Transport to school',
  decision: 'e.g. Decided to stop buying snacks daily and save the money',
  feeling: 'e.g. Tired but focused',
  learned: 'e.g. Studying in the morning works better than at night',
  note: 'Anything worth remembering',
};

/** Add a new ledger entry, or edit one (including a decision's outcome). */
export function EntryForm({ entry, initialType, onClose }: { entry?: Entry; initialType?: EntryType; onClose: () => void }) {
  const { data, update, cheer } = useStore();
  const [draft, setDraft] = useState<Entry>(() => {
    if (entry) return entry;
    const type = initialType ?? 'did';
    const now = new Date();
    return { id: uid(), at: now.toISOString(), date: today(), type, area: DEFAULT_AREA[type], text: '' };
  });
  const set = <K extends keyof Entry>(k: K, v: Entry[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const setType = (type: EntryType) => {
    haptic();
    setDraft((d) => ({
      ...d,
      type,
      area: entry ? d.area : DEFAULT_AREA[type],
      amount: type === 'money-in' || type === 'money-out' ? d.amount : undefined,
      minutes: type === 'study' ? d.minutes : undefined,
      mood: type === 'feeling' ? d.mood : undefined,
    }));
  };

  const isMoney = draft.type === 'money-in' || draft.type === 'money-out';
  const valid = draft.text.trim().length > 0 && (!isMoney || (draft.amount ?? 0) > 0);

  // "Last time": your own history on the same thing — the ledger's memory.
  const recall =
    draft.type === 'decision' || draft.type === 'money-out'
      ? similarPast(data.entries, draft.text, { excludeId: draft.id, limit: 2 })
      : [];

  const save = () => {
    if (!valid) return;
    const clean: Entry = {
      ...draft,
      text: draft.text.trim(),
      outcome: draft.outcome?.trim() || undefined,
      outcomeAt: draft.outcome?.trim() ? (draft.outcomeAt ?? new Date().toISOString()) : undefined,
    };
    update((d) => ({
      ...d,
      entries: entry ? d.entries.map((e) => (e.id === entry.id ? clean : e)) : [...d.entries, clean],
    }));
    haptic('success');
    if (entry && clean.outcome && !entry.outcome) cheer({ who: 'ada', text: 'Good. That lesson is part of your memory now.' });
    else if (!entry) cheer(clean.type === 'decision' ? SAVED_DECISION : clean.type === 'money-out' ? SAVED_SPEND : pick(CHEERS, clean.id));
    onClose();
  };

  const remove = async () => {
    if (!entry || !(await confirmAction('Delete this entry? This cannot be undone.'))) return;
    update((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== entry.id) }));
    onClose();
  };

  return (
    <Sheet title={entry ? 'Edit entry' : 'Log it'} onClose={onClose}>
      <div className="type-grid" style={{ marginTop: 12 }}>
        {(Object.keys(TYPES) as EntryType[]).map((t) => (
          <button key={t} className={`type-btn ${draft.type === t ? 'selected' : ''}`} onClick={() => setType(t)} type="button">
            <span className="ico">{TYPES[t].icon}</span>
            {TYPES[t].label}
          </button>
        ))}
      </div>

      <Field label={TYPES[draft.type].hint}>
        <textarea autoFocus={!entry} value={draft.text} onChange={(e) => set('text', e.target.value)} placeholder={PLACEHOLDER[draft.type]} />
      </Field>

      {isMoney && (
        <Field label={`Amount (${CURRENCY})`}>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={draft.amount ?? ''}
            onChange={(e) => set('amount', e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)))}
          />
        </Field>
      )}

      {draft.type === 'study' && (
        <Field label="Minutes">
          <div className="chips">
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <button key={m} type="button" className={`chip ${draft.minutes === m ? 'selected' : ''}`} onClick={() => set('minutes', m)}>
                {m}
              </button>
            ))}
          </div>
        </Field>
      )}

      {draft.type === 'feeling' && (
        <Field label="Mood">
          <div className="row" style={{ gap: 6 }}>
            {MOODS.map((m, i) => (
              <button
                key={m}
                type="button"
                className={`btn grow ${draft.mood === i + 1 ? 'primary' : ''}`}
                style={{ fontSize: 22, padding: 6 }}
                onClick={() => set('mood', i + 1)}
                aria-label={`Mood ${i + 1} of 5`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Area of life">
        <div className="chips">
          {(Object.keys(AREAS) as Area[]).map((a) => (
            <button key={a} type="button" className={`chip ${draft.area === a ? 'selected' : ''}`} onClick={() => set('area', a)}>
              {AREAS[a]}
            </button>
          ))}
        </div>
      </Field>

      {entry && draft.type === 'decision' && (
        <Field label="How did it turn out? What would you do differently?">
          <textarea value={draft.outcome ?? ''} onChange={(e) => set('outcome', e.target.value)} />
        </Field>
      )}

      {recall.length > 0 && (
        <div className="recall">
          <div className="row" style={{ gap: 8, marginBottom: 2 }}>
            <Character who="ada" size={36} />
            <span className="eyebrow">Mama Ada remembers — last time</span>
          </div>
          {recall.map(({ entry: past }) => (
            <EntryItem key={past.id} entry={past} showDate />
          ))}
        </div>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        {entry && (
          <button className="btn danger" onClick={remove} type="button">
            Delete
          </button>
        )}
        <button className="btn primary grow" onClick={save} disabled={!valid} type="button">
          Save
        </button>
      </div>
    </Sheet>
  );
}
