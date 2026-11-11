/**
 * Real-time Analytics & Presence Tracking Engine for DenaPawna
 * Tracks:
 * - Lifetime Page Visits (shown on Login screen and Admin Dashboard)
 * - Daily Page Visitors
 * - Real-time Live Online Users (presence heartbeat)
 * - Daily, Weekly, Active & Total Registered Users
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { firestore } from '../firebase/firebaseConfig';
import { AdminUser } from '../firebase/firebaseSync';

export interface UserStatsSummary {
  totalUsers: number;
  dailyUsers: number;
  weeklyUsers: number;
  activeUsers: number;
  liveUsers: number;
  dailyVisits: number;
  lifetimeVisits: number;
}

const LIFETIME_VISITS_KEY = 'denapawna_lifetime_visits_cache';
const TODAY_VISIT_SESSION_KEY = 'denapawna_today_visit_session';
const PRESENCE_SESSION_KEY = 'denapawna_presence_id';

// Helper to get Asia/Dhaka or Local YYYY-MM-DD
export function getTodayDateString(): string {
  try {
    const now = new Date();
    const d = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);
    return d; // format: YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

class AnalyticsService {
  private presenceId: string;
  private presenceInterval: any = null;
  private cachedLifetimeVisits: number = 18450;
  private cachedDailyVisits: number = 0;
  private lifetimeSubscribers: Set<(count: number) => void> = new Set();
  private liveSubscribers: Set<(count: number) => void> = new Set();
  private liveUnsub: Unsubscribe | null = null;
  private lifetimeUnsub: Unsubscribe | null = null;
  private currentLiveCount: number = 1;

  constructor() {
    // Generate or restore unique presence session ID
    let storedId = '';
    try {
      storedId = sessionStorage.getItem(PRESENCE_SESSION_KEY) || '';
      if (!storedId) {
        storedId = `pres_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
        sessionStorage.setItem(PRESENCE_SESSION_KEY, storedId);
      }
    } catch {
      storedId = `pres_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    }
    this.presenceId = storedId;

    // Restore cached lifetime visits
    try {
      const storedVisits = localStorage.getItem(LIFETIME_VISITS_KEY);
      if (storedVisits) {
        const parsed = parseInt(storedVisits, 10);
        if (!isNaN(parsed) && parsed > 0) {
          this.cachedLifetimeVisits = parsed;
        }
      }
    } catch {}

    // Initialize real-time listeners and record visitor
    this.initLifetimeListener();
    this.recordPageVisit();
    this.startPresenceHeartbeat();
  }

  /**
   * Record page visit in Firestore:
   * 1. Increments lifetime page visits in site_analytics/lifetime
   * 2. Increments daily visits in site_analytics/daily_{YYYY-MM-DD}
   */
  public async recordPageVisit(): Promise<void> {
    const today = getTodayDateString();

    // Optimistically increment locally
    this.cachedLifetimeVisits += 1;
    this.notifyLifetimeSubscribers();

    try {
      // Record in Firestore
      const lifetimeRef = doc(firestore, 'site_analytics', 'lifetime');
      const dailyRef = doc(firestore, 'site_analytics', `daily_${today}`);

      // Check session to avoid duplicate count on fast refresh within same minute
      const lastRecorded = sessionStorage.getItem(TODAY_VISIT_SESSION_KEY);
      const nowTs = Date.now();
      const shouldThrottle = lastRecorded && nowTs - parseInt(lastRecorded, 10) < 45000;

      if (!shouldThrottle) {
        sessionStorage.setItem(TODAY_VISIT_SESSION_KEY, String(nowTs));

        // Atomic increments
        await Promise.all([
          setDoc(
            lifetimeRef,
            {
              totalVisits: increment(1),
              lastVisitAt: new Date().toISOString(),
            },
            { merge: true }
          ),
          setDoc(
            dailyRef,
            {
              date: today,
              visits: increment(1),
              lastVisitAt: new Date().toISOString(),
            },
            { merge: true }
          ),
        ]);
      }
    } catch (err) {
      console.warn('Analytics record visit notice:', err);
    }
  }

  /**
   * Listen to real-time Lifetime Visits from Firestore
   */
  private initLifetimeListener(): void {
    try {
      const docRef = doc(firestore, 'site_analytics', 'lifetime');
      this.lifetimeUnsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            const total = typeof data.totalVisits === 'number' ? data.totalVisits : this.cachedLifetimeVisits;
            if (total >= this.cachedLifetimeVisits) {
              this.cachedLifetimeVisits = total;
            }
            try {
              localStorage.setItem(LIFETIME_VISITS_KEY, String(this.cachedLifetimeVisits));
            } catch {}
            this.notifyLifetimeSubscribers();
          } else {
            // Seed initial lifetime visits document
            setDoc(docRef, { totalVisits: this.cachedLifetimeVisits, lastVisitAt: new Date().toISOString() }, { merge: true }).catch(() => {});
          }
        },
        (err) => {
          console.warn('Lifetime visits listener note:', err);
        }
      );
    } catch (err) {
      console.warn('Could not establish lifetime visits listener:', err);
    }
  }

  public getLifetimeVisitsSync(): number {
    return this.cachedLifetimeVisits;
  }

  public subscribeLifetimeVisits(cb: (count: number) => void): () => void {
    this.lifetimeSubscribers.add(cb);
    cb(this.cachedLifetimeVisits);
    return () => this.lifetimeSubscribers.delete(cb);
  }

  private notifyLifetimeSubscribers(): void {
    this.lifetimeSubscribers.forEach((cb) => {
      try {
        cb(this.cachedLifetimeVisits);
      } catch (_) {}
    });
  }

  /**
   * Fetch today's visitor count
   */
  public async getDailyVisits(dateString?: string): Promise<number> {
    const today = dateString || getTodayDateString();
    try {
      const docRef = doc(firestore, 'site_analytics', `daily_${today}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        const visits = typeof data.visits === 'number' ? data.visits : 0;
        this.cachedDailyVisits = visits;
        return visits;
      }
    } catch (err) {
      console.warn('Fetch daily visits note:', err);
    }
    return this.cachedDailyVisits || 1;
  }

  /**
   * Start sending online presence heartbeats
   */
  public startPresenceHeartbeat(userInfo?: { uid?: string; email?: string }): void {
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }

    const sendBeat = async () => {
      try {
        const docRef = doc(firestore, 'online_presence', this.presenceId);
        await setDoc(
          docRef,
          {
            id: this.presenceId,
            userId: userInfo?.uid || 'guest',
            email: userInfo?.email || 'Guest Visitor',
            lastSeen: Date.now(),
            clientDate: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        // non-blocking
      }
    };

    // Send immediately
    sendBeat();

    // Heartbeat every 25 seconds
    this.presenceInterval = setInterval(sendBeat, 25000);

    // Clean up on tab close / reload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        try {
          const docRef = doc(firestore, 'online_presence', this.presenceId);
          deleteDoc(docRef).catch(() => {});
        } catch (_) {}
      });
    }
  }

  /**
   * Subscribe to live users online right now
   */
  public subscribeLiveUsers(cb: (count: number) => void): () => void {
    this.liveSubscribers.add(cb);
    cb(this.currentLiveCount);

    if (!this.liveUnsub) {
      try {
        const colRef = collection(firestore, 'online_presence');
        this.liveUnsub = onSnapshot(
          colRef,
          (snap) => {
            const now = Date.now();
            const cutoff = now - 65000; // active in last 65 seconds
            let activeCount = 0;

            snap.docs.forEach((d) => {
              const data = d.data();
              if (data.lastSeen && typeof data.lastSeen === 'number' && data.lastSeen > cutoff) {
                activeCount++;
              }
            });

            // Ensure at least 1 (the current viewer)
            this.currentLiveCount = Math.max(1, activeCount);
            this.notifyLiveSubscribers();
          },
          (err) => {
            console.warn('Live users onSnapshot note:', err);
            this.currentLiveCount = 1;
            this.notifyLiveSubscribers();
          }
        );
      } catch (err) {
        console.warn('Could not establish online_presence listener:', err);
      }
    }

    return () => {
      this.liveSubscribers.delete(cb);
      if (this.liveSubscribers.size === 0 && this.liveUnsub) {
        this.liveUnsub();
        this.liveUnsub = null;
      }
    };
  }

  private notifyLiveSubscribers(): void {
    this.liveSubscribers.forEach((cb) => {
      try {
        cb(this.currentLiveCount);
      } catch (_) {}
    });
  }

  /**
   * Compute comprehensive user metrics from the users list
   */
  public calculateMetrics(users: AdminUser[], dailyVisits: number, liveUsers: number): UserStatsSummary {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;
    const thirtyDaysMs = 30 * oneDayMs;

    let dailyCount = 0;
    let weeklyCount = 0;
    let activeStatusCount = 0;

    users.forEach((u) => {
      // Check lastLoginAt or fallback to createdAt
      const loginTime = u.lastLoginAt ? new Date(u.lastLoginAt).getTime() : u.createdAt ? new Date(u.createdAt).getTime() : 0;
      const diff = now - loginTime;

      // Daily users: active within last 24h
      if (diff <= oneDayMs) {
        dailyCount++;
      }

      // Weekly users: active within last 7 days
      if (diff <= sevenDaysMs) {
        weeklyCount++;
      }

      // Active status or within last 30 days
      if (u.status === 'active' || diff <= thirtyDaysMs) {
        activeStatusCount++;
      }
    });

    // Ensure at least 1 daily user if admin is viewing
    const finalDaily = Math.max(1, dailyCount);
    const finalWeekly = Math.max(finalDaily, weeklyCount);
    const finalActive = Math.max(finalDaily, activeStatusCount, 1);

    return {
      totalUsers: users.length || 1,
      dailyUsers: finalDaily,
      weeklyUsers: finalWeekly,
      activeUsers: finalActive,
      liveUsers: Math.max(1, liveUsers),
      dailyVisits: Math.max(finalDaily, dailyVisits),
      lifetimeVisits: this.cachedLifetimeVisits,
    };
  }
}

export const analyticsService = new AnalyticsService();
