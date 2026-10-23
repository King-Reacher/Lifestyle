import { useEffect, useRef, useState } from 'react';
import { nowClock, today } from '../lib/dates';
import { uid, useStore } from '../lib/store';
import { Sheet } from './ui';

/** Countdown focus session with a one-tap distraction log. */
export function FocusTimer({ title, minutes, onClose, onComplete }: {
  title: string;
  minutes: number;
  onClose: () => void;
  onComplete?: () => void;
}) {
  const { update } = useStore();
  const [left, setLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(true);
  const [note, setNote] = useState('');
  const [logged, setLogged] = useState(0);
  const endAt = useRef(Date.now() + minutes * 60_000);

  useEffect(() => {
    if (!running) return;
    endAt.current = Date.now() + left * 1000;
    const id = setInterval(() => {
      const s = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        setRunning(false);
        if ('vibrate' in navigator) navigator.vibrate?.([200, 100, 200]);
      }
    }, 500);
    return () => clearInterval(id);
    // Only restart the interval when pausing/resuming.
  }, [running]);

  const logDistraction = () => {
    const text = note.trim() || 'Got distracted';
    update((s) => ({
      ...s,
      distractions: [...s.distractions, { id: uid(), date: today(), time: nowClock(), note: text }],
    }));
    setNote('');
    setLogged((n) => n + 1);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');

  return (
    <Sheet title="Focus" onClose={onClose}>
      <p className="muted" style={{ marginBottom: 0 }}>{title}</p>
      <div className="timer">
        {mm}:{ss}
      </div>
      {left === 0 ? (
        <>
          <p style={{ textAlign: 'center' }}>Session complete. Well done.</p>
          {onComplete && (
            <button
              className="btn primary block"
              onClick={() => {
                onComplete();
                onClose();
              }}
            >
              Mark as done
            </button>
          )}
        </>
      ) : (
        <div className="row">
          <button className="btn grow" onClick={() => setRunning((r) => !r)}>
            {running ? 'Pause' : 'Resume'}
          </button>
          {onComplete && (
            <button
              className="btn primary grow"
              onClick={() => {
                onComplete();
                onClose();
              }}
            >
              Finished early
            </button>
          )}
        </div>
      )}
      <hr />
      <h3>Distracted?</h3>
      <p className="muted small" style={{ marginTop: 0 }}>
        Write it down and get back to work. Patterns show up in your evening review.
      </p>
      <div className="row">
        <input
          className="grow"
          placeholder="e.g. checked WhatsApp"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && logDistraction()}
        />
        <button className="btn" onClick={logDistraction}>
          Log
        </button>
      </div>
      {logged > 0 && <p className="muted small">{logged} distraction{logged > 1 ? 's' : ''} logged this session.</p>}
    </Sheet>
  );
}
