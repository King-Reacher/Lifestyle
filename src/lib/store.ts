import { createContext, useContext } from 'react';
import type { AppData } from './storage';

export type Updater = (fn: (d: AppData) => AppData) => void;

export const StoreContext = createContext<{ data: AppData; update: Updater } | null>(null);

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreContext');
  return ctx;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
