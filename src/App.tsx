import { useCallback, useEffect, useState } from 'react';
import { useReminders } from './lib/reminders';
import { loadState, saveState, StoreContext, type Updater } from './lib/store';
import type { AppState } from './lib/types';
import { Coach } from './screens/Coach';
import { Goals } from './screens/Goals';
import { Habits } from './screens/Habits';
import { Money } from './screens/Money';
import { Onboarding } from './screens/Onboarding';
import { Plan } from './screens/Plan';
import { Review } from './screens/Review';
import { Settings } from './screens/Settings';
import { Today } from './screens/Today';

export type Screen = 'today' | 'plan' | 'habits' | 'coach' | 'goals' | 'money' | 'review' | 'settings';

const TABS: { id: Screen; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: '◉' },
  { id: 'plan', label: 'Plan', icon: '▤' },
  { id: 'habits', label: 'Habits', icon: '🔥' },
  { id: 'coach', label: 'Coach', icon: '🧭' },
  { id: 'goals', label: 'Goals', icon: '◎' },
  { id: 'money', label: 'Money', icon: '' },
];

export function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [screen, setScreen] = useState<Screen>('today');

  const update: Updater = useCallback((fn) => setState((s) => fn(s)), []);
  useEffect(() => saveState(state), [state]);

  const banner = useReminders(state);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  return (
    <StoreContext.Provider value={{ state, update }}>
      <div className="app">
        {!state.settings.onboarded ? (
          <Onboarding />
        ) : (
          <>
            <header className="topbar">
              <div className="brand" onClick={() => go('today')} style={{ cursor: 'pointer' }}>
                DIOX <span>LIFE OS</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <button className="icon-btn" onClick={() => go('review')} aria-label="Review" title="Review">
                  ☾
                </button>
                <button className="icon-btn" onClick={() => go('settings')} aria-label="Settings" title="Settings">
                  ⚙
                </button>
              </div>
            </header>
            {banner && (
              <div className="card accent small" role="status" onClick={() => go('today')}>
                🔔 {banner}
              </div>
            )}
            {screen === 'today' && <Today go={go} />}
            {screen === 'plan' && <Plan />}
            {screen === 'habits' && <Habits />}
            {screen === 'coach' && <Coach go={go} />}
            {screen === 'goals' && <Goals />}
            {screen === 'money' && <Money />}
            {screen === 'review' && <Review />}
            {screen === 'settings' && <Settings />}
          </>
        )}
      </div>
      {state.settings.onboarded && (
        <div className="tabbar">
          <nav>
            {TABS.map((t) => (
              <button key={t.id} className={screen === t.id ? 'active' : ''} onClick={() => go(t.id)}>
                <span className="ico">{t.id === 'money' ? state.settings.currency || '¤' : t.icon}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </StoreContext.Provider>
  );
}
