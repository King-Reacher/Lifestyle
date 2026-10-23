import { useState } from 'react';
import { Field } from '../components/ui';
import { emptyData, parseData } from '../lib/storage';
import { useStore } from '../lib/store';
import { confirmAction, haptic } from '../lib/telegram';

export function You({ userId }: { userId: number | null }) {
  const { data, update } = useStore();
  const [restoreText, setRestoreText] = useState('');
  const [msg, setMsg] = useState('');

  const backup = JSON.stringify(data);

  const copyBackup = async () => {
    try {
      await navigator.clipboard.writeText(backup);
      haptic('success');
      setMsg('Backup copied. Paste it into your Telegram “Saved Messages” to keep it safe.');
    } catch {
      setMsg('Couldn’t copy automatically. Long-press the box below and copy it.');
    }
  };

  const restore = async () => {
    const parsed = parseData(restoreText);
    if (!parsed) {
      haptic('error');
      setMsg('That doesn’t look like a backup. Paste the whole text you copied.');
      return;
    }
    if (!(await confirmAction(`Replace your ledger with this backup (${parsed.entries.length} entries)?`))) return;
    update(() => parsed);
    setRestoreText('');
    haptic('success');
    setMsg('Backup restored.');
  };

  const erase = async () => {
    if (!(await confirmAction('Erase your whole ledger on this device? This cannot be undone.'))) return;
    update(() => emptyData());
    setMsg('Ledger erased.');
  };

  return (
    <>
      <h1>You</h1>

      <div className="card">
        <h2>🔒 Private</h2>
        <ul className="small" style={{ paddingLeft: 18, margin: 0 }}>
          <li>Only your Telegram account can open this app.</li>
          <li>Your ledger is stored on this phone only. No server, no AI, nobody else reads it.</li>
          <li>Changing phones or clearing Telegram data can wipe it, so keep a backup.</li>
        </ul>
        {userId && (
          <p className="small muted" style={{ marginBottom: 0 }}>
            Your Telegram ID: <code>{userId}</code>
          </p>
        )}
      </div>

      <div className="card">
        <h2>Backup</h2>
        <p className="small muted" style={{ marginTop: 0 }}>
          {data.entries.length} entries since {data.createdAt.slice(0, 10)}.
        </p>
        <button className="btn primary block" onClick={copyBackup}>
          Copy backup
        </button>
        <Field label="Restore — paste a backup here">
          <textarea value={restoreText} onChange={(e) => setRestoreText(e.target.value)} />
        </Field>
        <button className="btn block" onClick={restore} disabled={!restoreText.trim()}>
          Restore backup
        </button>
        {msg && <p className="small">{msg}</p>}
      </div>

      <button className="btn danger block" onClick={erase} style={{ marginBottom: 16 }}>
        Erase everything
      </button>
    </>
  );
}
