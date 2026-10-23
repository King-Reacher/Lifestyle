import { CURRENCY } from '../config';
import { clockOf } from '../lib/dates';
import { AREAS, MOODS, TYPES, type Entry } from '../lib/ledger';

export function formatAmount(n: number) {
  return `${CURRENCY}${Math.round(n).toLocaleString()}`;
}

export function EntryItem({ entry, onOpen, showDate }: { entry: Entry; onOpen?: (e: Entry) => void; showDate?: boolean }) {
  const t = TYPES[entry.type];
  return (
    <div className="entry" onClick={() => onOpen?.(entry)} style={{ cursor: onOpen ? 'pointer' : 'default' }}>
      <div className="ico" aria-hidden>
        {t.icon}
      </div>
      <div className="grow">
        <div className="text">{entry.text}</div>
        <div className="row wrap small muted" style={{ gap: 6, marginTop: 2 }}>
          <span>
            {showDate && `${entry.date} · `}
            {clockOf(entry.at)}
          </span>
          <span className="tag">{AREAS[entry.area]}</span>
          {entry.amount != null && (
            <b style={{ color: entry.type === 'money-in' ? 'var(--good)' : 'var(--text)' }}>
              {entry.type === 'money-in' ? '+' : '−'}
              {formatAmount(entry.amount)}
            </b>
          )}
          {entry.minutes != null && <span>{entry.minutes} min</span>}
          {entry.mood != null && <span>{MOODS[entry.mood - 1]}</span>}
        </div>
        {entry.outcome && <div className="outcome">→ {entry.outcome}</div>}
      </div>
    </div>
  );
}
