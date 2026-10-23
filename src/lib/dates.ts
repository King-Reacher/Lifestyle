import type { ClockTime, ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISODate(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function today(): ISODate {
  return toISODate(new Date());
}

export function addDays(s: ISODate, days: number): ISODate {
  const d = fromISODate(s);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Whole calendar days from a to b (positive when b is later). */
export function diffDays(a: ISODate, b: ISODate): number {
  const ms = fromISODate(b).getTime() - fromISODate(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Monday of the week containing the date. */
export function weekStart(s: ISODate): ISODate {
  const dow = (fromISODate(s).getDay() + 6) % 7;
  return addDays(s, -dow);
}

export function toMinutes(t: ClockTime): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function toClock(mins: number): ClockTime {
  const m = Math.max(0, Math.min(24 * 60 - 1, Math.round(mins)));
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
}

export function nowClock(d = new Date()): ClockTime {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatLongDate(s: ISODate): string {
  return fromISODate(s).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
