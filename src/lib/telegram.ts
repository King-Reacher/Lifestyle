/**
 * The small part of the Telegram Mini App API this app uses.
 * Full reference: https://core.telegram.org/bots/webapps
 */
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

type Callback<T> = (error: string | null, value?: T) => void;

interface KeyValueStorage {
  setItem(key: string, value: string, cb?: Callback<boolean>): void;
  getItem(key: string, cb: Callback<string | null>): void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  ready(): void;
  expand(): void;
  close(): void;
  isVersionAtLeast(version: string): boolean;
  disableVerticalSwipes?(): void;
  setHeaderColor?(color: string): void;
  setBackgroundColor?(color: string): void;
  onEvent(event: string, handler: () => void): void;
  offEvent(event: string, handler: () => void): void;
  BackButton: { show(): void; hide(): void; onClick(cb: () => void): void; offClick(cb: () => void): void };
  HapticFeedback?: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  DeviceStorage?: KeyValueStorage;
  showConfirm?(message: string, cb: (ok: boolean) => void): void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

/** The Telegram WebApp object, only when actually running inside Telegram. */
export function getWebApp(): TelegramWebApp | null {
  const wa = window.Telegram?.WebApp;
  // The script defines WebApp everywhere; initData is only filled in by Telegram.
  return wa && wa.initData ? wa : null;
}

export function haptic(kind: 'tap' | 'success' | 'warning' | 'error' = 'tap') {
  const h = getWebApp()?.HapticFeedback;
  if (!h) return;
  if (kind === 'tap') h.impactOccurred('light');
  else h.notificationOccurred(kind);
}

/** Ask Telegram for a yes/no, falling back to the browser dialog. */
export function confirmAction(message: string): Promise<boolean> {
  const wa = getWebApp();
  if (wa?.showConfirm && wa.isVersionAtLeast('6.2')) return new Promise((resolve) => wa.showConfirm!(message, resolve));
  return Promise.resolve(window.confirm(message));
}

export function initTelegram() {
  const wa = getWebApp();
  if (!wa) return;
  wa.ready();
  wa.expand();
  // Stop a downward swipe inside a sheet from closing the whole app.
  if (wa.isVersionAtLeast('7.7')) wa.disableVerticalSwipes?.();
  // Blend Telegram's header into the app's own dark theme.
  if (wa.isVersionAtLeast('6.1')) {
    wa.setHeaderColor?.('#0a1020');
    wa.setBackgroundColor?.('#0a1020');
  }
}
