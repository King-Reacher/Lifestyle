import { useRef, useState } from 'react';
import { Field } from '../components/ui';
import { today } from '../lib/dates';
import { requestNotificationPermission } from '../lib/reminders';
import { defaultState, normalize, useStore } from '../lib/store';
import type { CoachMode, DisciplineMode, Settings as SettingsT } from '../lib/types';

export const DISCIPLINE_OPTIONS: { value: DisciplineMode; label: string; hint: string }[] = [
  { value: 'firm', label: 'Firm but realistic', hint: 'Never miss twice. One slip is forgiven; recovery is built in.' },
  { value: 'strict', label: 'Strict', hint: 'Any miss resets the streak. Minimum versions count half in your score.' },
  { value: 'adaptive', label: 'Adaptive', hint: 'Like firm, and leans on minimum versions and the recovery plan on low-energy days.' },
];

export const COACH_OPTIONS: { value: CoachMode; label: string; hint: string }[] = [
  { value: 'both', label: 'Both', hint: 'Fast answers for routine moments, questions first for major decisions.' },
  { value: 'suggest', label: 'Suggest the next action', hint: 'Always give the best next step straight away.' },
  { value: 'ask', label: 'Ask me questions first', hint: 'Always walk through the decision process.' },
];

export function Settings() {
  const { state, update } = useStore();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const set = <K extends keyof SettingsT>(k: K, v: SettingsT[K]) => update((st) => ({ ...st, settings: { ...st.settings, [k]: v } }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `diox-life-os-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const next = normalize(JSON.parse(await file.text()));
      if (!confirm('Replace all current data with this backup?')) return;
      update(() => next);
      setMsg('Backup restored.');
    } catch {
      setMsg('That file is not a valid backup.');
    }
  };

  return (
    <>
      <h1 style={{ marginTop: 4 }}>Settings</h1>

      <div className="card">
        <Field label="Your name">
          <input value={s.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <div className="grid2">
          <Field label="Day starts">
            <input type="time" value={s.dayStart} onChange={(e) => set('dayStart', e.target.value || s.dayStart)} />
          </Field>
          <Field label="Day ends">
            <input type="time" value={s.dayEnd} onChange={(e) => set('dayEnd', e.target.value || s.dayEnd)} />
          </Field>
          <Field label="Currency symbol">
            <input value={s.currency} maxLength={4} onChange={(e) => set('currency', e.target.value)} />
          </Field>
          <Field label="Monthly essentials">
            <input type="number" min={0} value={s.monthlyEssentials || ''} onChange={(e) => set('monthlyEssentials', Number(e.target.value) || 0)} />
          </Field>
        </div>
      </div>

      <div className="card">
        <h2>Discipline</h2>
        {DISCIPLINE_OPTIONS.map((o) => (
          <button key={o.value} className={`btn choice ${s.disciplineMode === o.value ? 'selected' : ''}`} onClick={() => set('disciplineMode', o.value)}>
            <div>{o.label}</div>
            <div className="muted small" style={{ fontWeight: 400 }}>
              {o.hint}
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Coach</h2>
        {COACH_OPTIONS.map((o) => (
          <button key={o.value} className={`btn choice ${s.coachMode === o.value ? 'selected' : ''}`} onClick={() => set('coachMode', o.value)}>
            <div>{o.label}</div>
            <div className="muted small" style={{ fontWeight: 400 }}>
              {o.hint}
            </div>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>Reminders</h2>
        <label className="row">
          <input
            type="checkbox"
            checked={s.remindersEnabled}
            onChange={async (e) => {
              if (e.target.checked) {
                const ok = await requestNotificationPermission();
                set('remindersEnabled', ok);
                setMsg(ok ? 'Reminders on.' : 'Notifications were blocked by the browser. In-app banners still work.');
              } else set('remindersEnabled', false);
            }}
          />
          <span>Notify me when a planned item starts and at review time</span>
        </label>
        <p className="muted small" style={{ marginBottom: 0 }}>
          Works while the app is open or recently used. Browsers don’t let web apps run reliably in the background, so treat
          reminders as help, not a guarantee.
        </p>
      </div>

      <div className="card">
        <h2>Your data</h2>
        <p className="muted small" style={{ marginTop: 0 }}>
          Private by default: everything stays on this device. Nothing is sent anywhere. Back up regularly — clearing browser
          data erases it.
        </p>
        <div className="row wrap">
          <button className="btn grow" onClick={exportData}>
            Export backup
          </button>
          <button className="btn grow" onClick={() => fileRef.current?.click()}>
            Restore backup
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        <button
          className="btn danger block"
          style={{ marginTop: 10 }}
          onClick={() => {
            if (confirm('Erase all data on this device? This cannot be undone.')) update(() => defaultState());
          }}
        >
          Erase everything
        </button>
        {msg && <p className="small">{msg}</p>}
      </div>
    </>
  );
}
