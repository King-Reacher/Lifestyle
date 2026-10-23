import { useState } from 'react';
import { Say } from '../components/Character';
import { EntryForm } from '../components/EntryForm';
import { EntryItem } from '../components/EntryItem';
import { formatDay } from '../lib/dates';
import { AREAS, groupByDay, search, TYPES, type Area, type Entry, type EntryType } from '../lib/ledger';
import { useStore } from '../lib/store';

export function Ledger() {
  const { data } = useStore();
  const [query, setQuery] = useState('');
  const [type, setType] = useState<EntryType | null>(null);
  const [area, setArea] = useState<Area | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);

  const base = query.trim() ? search(data.entries, query) : data.entries;
  const filtered = base.filter((e) => (!type || e.type === type) && (!area || e.area === area));
  const groups = groupByDay(filtered);

  return (
    <>
      <Say who="zara" text={data.entries.length ? `${data.entries.length} entries on record. Search it like your own memory.` : "Your ledger is empty. Log something and I'll keep it safe."} size={72} />
      <input type="search" placeholder="Search… e.g. transport, decided, maths" value={query} onChange={(e) => setQuery(e.target.value)} />
      <div className="chips" style={{ marginTop: 10 }}>
        <button className={`chip ${!type ? 'selected' : ''}`} onClick={() => setType(null)}>
          All
        </button>
        {(Object.keys(TYPES) as EntryType[]).map((t) => (
          <button key={t} className={`chip ${type === t ? 'selected' : ''}`} onClick={() => setType(type === t ? null : t)}>
            {TYPES[t].icon} {TYPES[t].label}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginTop: 6 }}>
        {(Object.keys(AREAS) as Area[]).map((a) => (
          <button key={a} className={`chip ${area === a ? 'selected' : ''}`} onClick={() => setArea(area === a ? null : a)}>
            {AREAS[a]}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        data.entries.length > 0 && <div className="card empty">Nothing matches that. Try fewer words.</div>
      ) : (
        groups.map((g) => (
          <div key={g.date} className="card">
            <div className="eyebrow">{formatDay(g.date)}</div>
            {g.entries.map((e) => (
              <EntryItem key={e.id} entry={e} onOpen={setEditing} />
            ))}
          </div>
        ))
      )}
      {editing && <EntryForm entry={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
