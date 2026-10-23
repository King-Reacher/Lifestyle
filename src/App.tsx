import { useCallback, useEffect, useMemo, useState } from 'react';
import { APP_NAME, OWNER_ID } from './config';
import { checkAccess } from './lib/access';
import { loadData, saveData, type AppData } from './lib/storage';
import { StoreContext, type Updater } from './lib/store';
import { getWebApp, haptic } from './lib/telegram';
import { Home } from './screens/Home';
import { Ledger } from './screens/Ledger';
import { You } from './screens/You';

type Tab = 'home' | 'ledger' | 'you';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'ledger', label: 'Ledger', icon: '📒' },
  { id: 'you', label: 'You', icon: '🔒' },
];

export function App() {
  const access = useMemo(() => checkAccess(OWNER_ID, getWebApp(), window.location.hostname), []);
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('home');

  useEffect(() => {
    if (access.status === 'ok') loadData().then(setData);
  }, [access.status]);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  const update: Updater = useCallback((fn) => setData((d) => (d ? fn(d) : d)), []);

  if (access.status === 'outside-telegram') {
    return (
      <div className="app gate">
        <div className="big">📱</div>
        <h1>Open this in Telegram</h1>
        <p className="muted">{APP_NAME} is a private Telegram mini app. Open it from your bot.</p>
      </div>
    );
  }
  if (access.status === 'denied') {
    return (
      <div className="app gate">
        <div className="big">🔒</div>
        <h1>This app is private</h1>
        <p className="muted">It only opens for its owner.</p>
      </div>
    );
  }
  if (access.status === 'setup') {
    return (
      <div className="app gate">
        <div className="big">🛠️</div>
        <h1>One setup step</h1>
        <p className="muted">Lock the app to your account. Your Telegram ID is:</p>
        <p style={{ fontSize: 22 }}>
          <code>{access.userId}</code>
        </p>
        <p className="small muted">
          Set <code>VITE_OWNER_ID</code> to this number where the app is hosted, then redeploy. Until then, nobody can use it.
        </p>
      </div>
    );
  }
  if (!data) return <div className="app gate muted">Loading…</div>;

  const go = (t: Tab) => {
    haptic();
    setTab(t);
    window.scrollTo(0, 0);
  };

  return (
    <StoreContext.Provider value={{ data, update }}>
      <div className="app">
        {tab === 'home' && <Home name={access.name} />}
        {tab === 'ledger' && <Ledger />}
        {tab === 'you' && <You userId={access.userId} />}
      </div>
      <div className="tabbar">
        <nav>
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => go(t.id)}>
              <span className="ico">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </StoreContext.Provider>
  );
}
