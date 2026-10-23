import type { TelegramWebApp } from './telegram';

export type Access =
  | { status: 'ok'; userId: number | null; name: string }
  | { status: 'setup'; userId: number }
  | { status: 'denied' }
  | { status: 'outside-telegram' };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Decide who may open the app. Only the owner's Telegram account gets in.
 *
 * This gate is about the screen, not the data: everything is stored on the
 * owner's own device, so anyone else who opens the link sees nothing of yours.
 * Any future server feature must verify `initData` with the bot token instead
 * of trusting this check.
 */
export function checkAccess(ownerId: string | undefined, wa: TelegramWebApp | null, hostname: string): Access {
  if (!wa) {
    // Plain browser on your own machine: allow, so the app can be developed and tested.
    return LOCAL_HOSTS.has(hostname) ? { status: 'ok', userId: null, name: '' } : { status: 'outside-telegram' };
  }
  const user = wa.initDataUnsafe.user;
  if (!user) return { status: 'denied' };
  if (!ownerId) return { status: 'setup', userId: user.id };
  if (String(user.id) !== ownerId.trim()) return { status: 'denied' };
  return { status: 'ok', userId: user.id, name: user.first_name };
}
