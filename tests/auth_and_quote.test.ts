import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDhakaDateString,
  shouldShowDailyIslamicQuote,
  markDailyIslamicQuoteShown,
} from '../src/utils/dateUtils';

describe('Asia/Dhaka Date & Daily Quote Logic', () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    // Setup mock localStorage on globalThis
    (globalThis as any).localStorage = {
      getItem: (key: string) => store.get(key) || null,
      setItem: (key: string, val: string) => store.set(key, val),
      clear: () => store.clear(),
      removeItem: (key: string) => store.delete(key),
    };
  });

  it('correctly formats Asia/Dhaka date as YYYY-MM-DD', () => {
    const dhakaDate = getDhakaDateString();
    expect(dhakaDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('shows daily quote on first login of the day for a user', () => {
    const userA = 'user_123';
    expect(shouldShowDailyIslamicQuote(userA)).toBe(true);

    markDailyIslamicQuoteShown(userA);
    // After marking, it should NOT show again on the same day
    expect(shouldShowDailyIslamicQuote(userA)).toBe(false);
  });

  it('differentiates daily quote status between different users', () => {
    const userA = 'user_123';
    const userB = 'user_456';

    markDailyIslamicQuoteShown(userA);
    expect(shouldShowDailyIslamicQuote(userA)).toBe(false);
    expect(shouldShowDailyIslamicQuote(userB)).toBe(true);
  });

  it('persists last quote shown date in localStorage with Asia/Dhaka date', () => {
    const userA = 'user_999';
    const todayDhaka = getDhakaDateString();

    markDailyIslamicQuoteShown(userA);
    expect(localStorage.getItem(`denapawna_quote_shown_${userA}`)).toBe(todayDhaka);
  });
});
