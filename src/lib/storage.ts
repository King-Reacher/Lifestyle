import { emptyLearn, type LearnState } from '../learn/engine';
import { emptyMoney, type MoneyState } from './money';

/** Code lab scratchpad and ticked career milestones. */
export interface CodeState {
  scratch: string;
  career: Record<string, boolean>;
}

export const emptyCode = (): CodeState => ({ scratch: '', career: {} });
import type { Entry } from './ledger';
import { getWebApp } from './telegram';

const KEY = 'ledger:v1';

export interface AppData {
  version: 1;
  entries: Entry[];
  learn: LearnState;
  money: MoneyState;
  code: CodeState;
  createdAt: string;
}

export function emptyData(): AppData {
  return { version: 1, entries: [], learn: emptyLearn(), money: emptyMoney(), code: emptyCode(), createdAt: new Date().toISOString() };
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
    const l = raw.learn ?? {};
    const learn: LearnState = {
      lessons: l.lessons && typeof l.lessons === 'object' ? l.lessons : {},
      xpByDay: l.xpByDay && typeof l.xpByDay === 'object' ? l.xpByDay : {},
      review: Array.isArray(l.review) ? l.review.filter((r: { ex?: unknown; due?: unknown }) => r && r.ex && typeof r.due === 'string') : [],
      exams: Array.isArray(l.exams) ? l.exams : [],
    };
    const m = raw.money ?? {};
    const base = emptyMoney();
    const money: MoneyState = {
      goals: Array.isArray(m.goals) ? m.goals : [],
      wants: Array.isArray(m.wants) ? m.wants : [],
      contributions: Array.isArray(m.contributions) ? m.contributions : [],
      split: m.split && typeof m.split.save === 'number' ? m.split : base.split,
      checkins: Array.isArray(m.checkins) ? m.checkins : [],
    };
    const c = raw.code ?? {};
    const code: CodeState = { scratch: typeof c.scratch === 'string' ? c.scratch : '', career: c.career && typeof c.career === 'object' ? c.career : {} };
    return { version: 1, entries, learn, money, code, createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString() };
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
  const size = (d: AppData) => d.entries.length + Object.keys(d.learn.lessons).length + d.money.goals.length + d.money.wants.length;
  const best = [fromDevice, fromLocal].filter((d): d is AppData => !!d).sort((a, b) => size(b) - size(a))[0];
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
