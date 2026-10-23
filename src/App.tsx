import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Character, Say, type Who } from './components/Character';
import { APP_NAME, OWNER_ID } from './config';
import { checkAccess } from './lib/access';
import { today } from './lib/dates';
import { loggingStreak } from './lib/ledger';
import { loadData, saveData, type AppData } from './lib/storage';
import { StoreContext, type Cheer, type Updater } from './lib/store';
import { getWebApp, haptic } from './lib/telegram';
import { Learn } from './learn/ui/Learn';
import { Guides } from './screens/Guides';
import { Home } from './screens/Home';
import { Money } from './screens/Money';
import { Ledger } from './screens/Ledger';
import { You } from './screens/You';

type Tab = 'home' | 'learn' | 'money' | 'ledger' | 'you' | 'guides';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'learn', label: 'Learn', icon: '🎓' },
  { id: 'money', label: 'Money', icon: '💰' },
  { id: 'ledger', label: 'Ledger', icon: '📒' },
  { id: 'you', label: 'You', icon: '🔒' },
];

function Gate({ who, title, children }: { who: Who; title: string; children: ReactNode }) {
  return (
    <div className="app gate">
      <Character who={who} size={130} />
      {title && <h1>{title}</h1>}
      {children}
    </div>
  );
}

export function App() {
  const access = useMemo(() => checkAccess(OWNER_ID, getWebApp(), window.location.hostname), []);
  const [data, setData] = useState<AppData | null>(null);
  const [tab, setTab] = useState<Tab>('home');
  const [toast, setToast] = useState<{ who: Who; text: string; key: number } | null>(null);

  useEffect(() => {
    if (access.status === 'ok') loadData().then(setData);
  }, [access.status]);

  useEffect(() => {
    if (data) saveData(data);
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const update: Updater = useCallback((fn) => setData((d) => (d ? fn(d) : d)), []);
  const cheer: Cheer = useCallback((line) => setToast({ ...line, key: Date.now() }), []);

  if (access.status === 'outside-telegram') {
    return (
      <Gate who="zara" title="Open me in Telegram">
        <p className="muted">{APP_NAME} is a private Telegram mini app. Open it from your bot.</p>
      </Gate>
    );
  }
  if (access.status === 'denied') {
    return (
      <Gate who="ada" title="This one is private">
        <p className="muted">Sorry, my dear. This app only opens for its owner.</p>
      </Gate>
    );
  }
  if (access.status === 'setup') {
    return (
      <Gate who="blaze" title="One setup step">
        <p className="muted">Lock the app to your account. Your Telegram ID is:</p>
        <p style={{ fontSize: 24, fontWeight: 900 }}>
          <code>{access.userId}</code>
        </p>
        <p className="small muted">
          Set <code>VITE_OWNER_ID</code> to this number where the app is hosted, then redeploy. Until then, nobody can use it.
        </p>
      </Gate>
    );
  }
  if (!data) {
    return (
      <Gate who="blaze" title="">
        <p className="muted">Lighting up…</p>
      </Gate>
    );
  }

  const go = (t: Tab) => {
    haptic();
    setTab(t);
    window.scrollTo(0, 0);
  };

  const streak = loggingStreak(data.entries, today());

  return (
    <StoreContext.Provider value={{ data, update, cheer }}>
      <div className="app">
        <header className="topbar">
          <div className="brand">
            {APP_NAME.toUpperCase()} <span>●</span>
          </div>
          <span className="pill fire" title="Logging streak">
            🔥 {streak}
          </span>
        </header>
        {tab === 'home' && <Home name={access.name} onLearn={() => go('learn')} onGuide={() => go('guides')} onMoney={() => go('money')} />}
        {tab === 'money' && <Money />}
        {tab === 'guides' && <Guides onBack={() => go('home')} />}
        {tab === 'learn' && <Learn />}
        {tab === 'ledger' && <Ledger />}
        {tab === 'you' && <You userId={access.userId} />}
      </div>
      {toast && (
        <div className="toast" key={toast.key} onClick={() => setToast(null)}>
          <Say who={toast.who} text={toast.text} size={60} mood="cheer" />
        </div>
      )}
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
