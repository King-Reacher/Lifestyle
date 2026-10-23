import { useEffect, useRef, useState } from 'react';
import { nowClock, today, toMinutes } from './dates';
import { planDay } from './planner';
import type { AppState } from './types';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  return (await Notification.requestPermission()) === 'granted';
}

async function notify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) await reg.showNotification(title, { body, icon: 'icon.svg', tag: title });
    else new Notification(title, { body, icon: 'icon.svg' });
  } catch {
    // Some browsers refuse page-level notifications; the in-app banner still shows.
  }
}

/**
 * While the app is open, announce each planned item when it starts and nudge for the
 * evening review. Browsers can't reliably run this in the background, so it's a helper,
 * not a guarantee.
 */
export function useReminders(state: AppState): string | null {
  const [banner, setBanner] = useState<string | null>(null);
  const fired = useRef(new Set<string>());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const tick = () => {
      const s = stateRef.current;
      const date = today();
      const now = nowClock();
      const plan = planDay({
        date,
        tasks: s.tasks,
        habits: s.habits,
        habitLogs: s.habitLogs,
        dayStart: s.settings.dayStart,
        dayEnd: s.settings.dayEnd,
        reduced: s.reducedDays.includes(date),
      });
      const n = toMinutes(now);
      for (const slot of plan.slots) {
        const key = `${date}:${slot.id}:${slot.start}`;
        const start = toMinutes(slot.start);
        if (slot.done || fired.current.has(key) || n < start || n > start + 5) continue;
        fired.current.add(key);
        const msg = `${slot.start} — ${slot.title}`;
        setBanner(msg);
        if (s.settings.remindersEnabled) notify('Time to execute', msg);
      }
      const reviewKey = `${date}:review`;
      const reviewAt = toMinutes(s.settings.dayEnd) - 30;
      if (n >= reviewAt && !fired.current.has(reviewKey) && !s.reviews.some((r) => r.date === date)) {
        fired.current.add(reviewKey);
        setBanner('Evening review: 5 minutes to close the day and draft tomorrow.');
        if (s.settings.remindersEnabled) notify('Evening review', 'Close the day and draft tomorrow.');
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 12_000);
    return () => clearTimeout(id);
  }, [banner]);

  return banner;
}
