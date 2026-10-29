/**
 * Date and timezone utilities for DenaPawna (Dhaka Asia/Dhaka Timezone)
 */

export function getDhakaDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date); // Format: YYYY-MM-DD
  } catch (e) {
    // Fallback if Intl fails
    const d = new Date(date.getTime() + (6 * 60 + date.getTimezoneOffset()) * 60000);
    return d.toISOString().split('T')[0];
  }
}

export function getDhakaFormattedTime(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch (e) {
    return date.toLocaleString();
  }
}

const memoryStorage = new Map<string, string>();

function getStoredItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch (_) {}
  return memoryStorage.get(key) || null;
}

function setStoredItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch (_) {}
  memoryStorage.set(key, value);
}

export function shouldShowDailyIslamicQuote(userId: string): boolean {
  if (!userId) return false;
  const todayDhaka = getDhakaDateString();
  const storageKey = `denapawna_quote_shown_${userId}`;
  const lastShownDate = getStoredItem(storageKey);
  return lastShownDate !== todayDhaka;
}

export function markDailyIslamicQuoteShown(userId: string): void {
  if (!userId) return;
  const todayDhaka = getDhakaDateString();
  const storageKey = `denapawna_quote_shown_${userId}`;
  setStoredItem(storageKey, todayDhaka);
}
