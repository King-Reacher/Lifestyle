import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { getWebApp, initTelegram } from './lib/telegram';
import './styles.css';

initTelegram();
// Inside Telegram, its theme colours win over the browser's dark-mode fallback.
if (getWebApp()) document.documentElement.setAttribute('data-tg', '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
