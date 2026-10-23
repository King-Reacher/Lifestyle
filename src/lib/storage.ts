import type { Entry } from './ledger';
import { getWebApp } from './telegram';

const KEY = 'ledger:v1';

export interface AppData {
  version: 1;
  entries: Entry[];
  createdAt: string;
}

export function emptyData(): AppData {
  return { version: 1, entries: [], createdAt: new Date().toISOString() };
}

/** Accept anything that looks like our data; drop malformed entries instead of crashing. */
export function parseData(text: string | null | undefined): AppData | null {
  if (!text) return null;
  try {
    const raw = JSON.parse(text);
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.entries)) return null;
    const entries = (raw.entries as Entry[]).filter(
      (e) => e && typeof e.id === 'string' && typeof e.at === 'string' && typeof e.date === 'string' && typeof e.text === 'string',
    );
    return { version: 1, entries, createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString() };
  } catch {
    return null;
  }
}

/** Telegram's on-device storage (Bot API 9.0+). Survives better than the webview's localStorage. */
function deviceStorage() {
  const wa = getWebApp();
  return wa?.DeviceStorage && wa.isVersionAtLeast('9.0') ? wa.DeviceStorage : null;
}

function readDevice(): Promise<string | null> {
  const ds = deviceStorage();
  if (!ds) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      ds.getItem(KEY, (err, value) => resolve(err ? null : (value ?? null)));
    } catch {
      resolve(null);
    }
  });
}

function readLocal(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export async function loadData(): Promise<AppData> {
  const fromDevice = parseData(await readDevice());
  const fromLocal = parseData(readLocal());
  // Prefer whichever copy holds more; they only differ if one store was wiped.
  const best = [fromDevice, fromLocal]
    .filter((d): d is AppData => !!d)
    .sort((a, b) => b.entries.length - a.entries.length)[0];
  return best ?? emptyData();
}

/** Write to every available store so one being cleared doesn't lose your ledger. */
export function saveData(data: AppData): void {
  const text = JSON.stringify(data);
  try {
    localStorage.setItem(KEY, text);
  } catch {
    // Blocked or full; Telegram's device storage below may still work.
  }
  try {
    deviceStorage()?.setItem(KEY, text);
  } catch {
    // Older Telegram clients; localStorage already has it.
  }
}
