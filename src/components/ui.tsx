import { useEffect, useRef, type ReactNode } from 'react';
import { getWebApp } from '../lib/telegram';

/** Bottom sheet. Inside Telegram, the header back button closes it. */
export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    const handler = () => closeRef.current();
    wa.BackButton.show();
    wa.BackButton.onClick(handler);
    return () => {
      wa.BackButton.offClick(handler);
      wa.BackButton.hide();
    };
  }, []);

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}
