import { describe, expect, it } from 'vitest';
import { checkAccess } from './access';
import { addDays } from './dates';
import { groupByDay, keywords, loggingStreak, prompts, search, similarPast, summarize, type Entry } from './ledger';
import { parseData } from './storage';
import type { TelegramWebApp } from './telegram';

const DAY = '2026-10-23';
let n = 0;
const entry = (over: Partial<Entry>): Entry => {
  const date = over.date ?? DAY;
  return { id: `e${n++}`, at: `${date}T12:00:00.000Z`, date, type: 'did', area: 'personal', text: 'something', ...over };
};

describe('logging streak', () => {
  it('counts consecutive days with entries', () => {
    const es = [0, 1, 2].map((i) => entry({ date: addDays(DAY, -i) }));
    expect(loggingStreak(es, DAY)).toBe(3);
  });

  it('does not break because nothing is logged yet today', () => {
    const es = [1, 2].map((i) => entry({ date: addDays(DAY, -i) }));
    expect(loggingStreak(es, DAY)).toBe(2);
  });

  it('stops at a gap', () => {
    const es = [0, 1, 3].map((i) => entry({ date: addDays(DAY, -i) }));
    expect(loggingStreak(es, DAY)).toBe(2);
  });

  it('is zero with nothing logged', () => {
    expect(loggingStreak([], DAY)).toBe(0);
  });
});

describe('memory', () => {
  const es = [
    entry({ type: 'decision', text: 'Stopped buying snacks after school to save money', outcome: 'Saved ₦6,000 in two weeks', date: addDays(DAY, -20) }),
    entry({ type: 'money-out', text: 'Transport to tutorial', amount: 800 }),
    entry({ type: 'study', text: 'Maths: fractions and BODMAS', minutes: 45 }),
  ];

  it('searches text, outcomes and labels with every word required', () => {
    expect(search(es, 'snacks').map((e) => e.type)).toEqual(['decision']);
    expect(search(es, 'saved two weeks')).toHaveLength(1);
    expect(search(es, 'maths bodmas')).toHaveLength(1);
    expect(search(es, 'maths transport')).toHaveLength(0);
  });

  it('recalls similar past decisions from shared keywords', () => {
    const r = similarPast(es, 'Should I buy snacks today?', { type: 'decision' });
    expect(r[0].entry.outcome).toMatch(/Saved/);
    expect(similarPast(es, 'the and of')).toEqual([]);
  });

  it('ignores filler words when extracting keywords', () => {
    expect(keywords('I decided to stop buying the snacks')).toEqual(['decided', 'stop', 'buying', 'snacks']);
  });

  it('groups newest day first', () => {
    expect(groupByDay(es).map((g) => g.date)).toEqual([DAY, addDays(DAY, -20)]);
  });

  it('summarizes a day', () => {
    expect(summarize(es, DAY)).toMatchObject({ entries: 2, studyMinutes: 45, spent: 800, earned: 0 });
  });
});

describe('ledger questions', () => {
  it('asks how an old decision turned out, but not a fresh one', () => {
    const old = entry({ type: 'decision', text: 'Join the coding club', date: addDays(DAY, -3) });
    const fresh = entry({ type: 'decision', text: 'Sleep by 11', date: DAY });
    const ps = prompts([old, fresh], DAY, 9);
    expect(ps).toHaveLength(1);
    expect(ps[0]).toMatchObject({ kind: 'outcome', entry: { id: old.id } });
  });

  it('checks in after a rough day', () => {
    const ps = prompts([entry({ type: 'feeling', mood: 1, date: addDays(DAY, -1) })], DAY, 9);
    expect(ps.map((p) => p.kind)).toEqual(['mood-check']);
  });

  it('nudges in the evening if nothing is logged', () => {
    expect(prompts([], DAY, 19).map((p) => p.kind)).toEqual(['empty-day']);
    expect(prompts([], DAY, 10)).toEqual([]);
  });
});

describe('private access', () => {
  const wa = (id?: number) => ({ initData: 'x', initDataUnsafe: { user: id ? { id, first_name: 'Vin' } : undefined } }) as TelegramWebApp;

  it('lets only the owner in', () => {
    expect(checkAccess('123', wa(123), 'app.example').status).toBe('ok');
    expect(checkAccess('123', wa(999), 'app.example').status).toBe('denied');
    expect(checkAccess('123', wa(), 'app.example').status).toBe('denied');
  });

  it('shows your ID for setup before an owner is set', () => {
    expect(checkAccess(undefined, wa(555), 'app.example')).toEqual({ status: 'setup', userId: 555 });
  });

  it('refuses plain browsers except on your own machine', () => {
    expect(checkAccess('123', null, 'app.example').status).toBe('outside-telegram');
    expect(checkAccess('123', null, 'localhost').status).toBe('ok');
  });
});

describe('backup parsing', () => {
  it('restores valid backups and drops broken entries', () => {
    const good = entry({});
    const text = JSON.stringify({ version: 1, createdAt: '2026-01-01', entries: [good, { id: 1 }, null] });
    expect(parseData(text)?.entries).toEqual([good]);
  });

  it('rejects junk', () => {
    expect(parseData('hello')).toBeNull();
    expect(parseData('{"entries": 5}')).toBeNull();
    expect(parseData(null)).toBeNull();
  });
});
