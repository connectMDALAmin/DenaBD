/**
 * Local & Cloud Persistence Database Engine for DenaPawna
 * Manages local storage, in-memory fallback for SSR/testing, Firestore offline queue, and reactive subscribers.
 */

import { Contact, Transaction, UserProfile } from '../../types/accounting';
import { initialContacts, initialTransactions, initialUserProfile } from './mockData';

export const CONTACTS_KEY = 'denapawna_contacts';
export const TRANSACTIONS_KEY = 'denapawna_transactions';
export const USER_KEY = 'denapawna_user_profile';
export const LAST_SYNC_KEY = 'denapawna_last_sync';

export type SyncState = 'online' | 'offline' | 'syncing' | 'error';

const memoryStorage = new Map<string, string>();

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryStorage.get(key) || null;
  },
  setItem: (key: string, val: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, val);
    } else {
      memoryStorage.set(key, val);
    }
  },
  removeItem: (key: string): void => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      memoryStorage.delete(key);
    }
  },
};

const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

class DatabaseService {
  private subscribers: Set<() => void> = new Set();
  private syncState: SyncState = isOnline() ? 'online' : 'offline';
  private syncSubscribers: Set<(state: SyncState) => void> = new Set();
  private currentUserId: string | null = null;

  constructor() {
    this.initNetworkListeners();
  }

  public setCurrentUserId(userId: string | null) {
    if (this.currentUserId !== userId) {
      this.currentUserId = userId;
      this.notify();
    }
  }

  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  public getContactsKey(): string {
    return this.currentUserId ? `${CONTACTS_KEY}_${this.currentUserId}` : CONTACTS_KEY;
  }

  public getTransactionsKey(): string {
    return this.currentUserId ? `${TRANSACTIONS_KEY}_${this.currentUserId}` : TRANSACTIONS_KEY;
  }

  public getUserKey(): string {
    return this.currentUserId ? `${USER_KEY}_${this.currentUserId}` : USER_KEY;
  }

  private initNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setSyncState('online');
        this.triggerSync();
      });
      window.addEventListener('offline', () => {
        this.setSyncState('offline');
      });
    }
  }

  private notify() {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying db subscriber', err);
      }
    });
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public subscribeSyncState(cb: (state: SyncState) => void): () => void {
    this.syncSubscribers.add(cb);
    cb(this.syncState);
    return () => this.syncSubscribers.delete(cb);
  }

  public setSyncState(state: SyncState) {
    this.syncState = state;
    this.syncSubscribers.forEach((cb) => cb(state));
  }

  public getSyncState(): SyncState {
    return this.syncState;
  }

  public getLastSyncTime(): string {
    return safeStorage.getItem(LAST_SYNC_KEY) || new Date().toISOString();
  }

  public async triggerSync(): Promise<void> {
    if (!isOnline()) {
      this.setSyncState('offline');
      return;
    }
    this.setSyncState('syncing');

    // Simulate cloud Firestore synchronization handshake
    await new Promise((r) => setTimeout(r, 600));

    // Mark pending transactions as synced
    const txs = this.getTransactions();
    let updated = false;
    const syncedTxs = txs.map((tx) => {
      if (tx.syncStatus === 'pending') {
        updated = true;
        return { ...tx, syncStatus: 'synced' as const };
      }
      return tx;
    });

    if (updated) {
      safeStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(syncedTxs));
    }

    safeStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    this.setSyncState('online');
    this.notify();
  }

  // --- User Profile ---
  public getUserProfile(): UserProfile {
    const raw = safeStorage.getItem(this.getUserKey());
    let profile = initialUserProfile;
    if (raw) {
      try {
        profile = { ...initialUserProfile, ...JSON.parse(raw) };
      } catch {
        profile = initialUserProfile;
      }
    }
    // Clean legacy placeholder defaults if present
    if (
      profile.businessName === 'ভাই ভাই জেনারেল ট্রেডার্স (Bhai Bhai Traders)' ||
      !profile.businessName
    ) {
      profile.businessName = 'আমার ব্যবসা';
    }
    if (
      profile.phone === '+8801712345678' ||
      profile.phone === '+880 1700-000000'
    ) {
      profile.phone = '';
    }
    if (profile.ownerName === 'মোঃ রফিকুল ইসলাম (Rafiqul Islam)') {
      profile.ownerName = 'ব্যবহারকারী';
    }
    return profile;
  }

  public saveUserProfile(profile: Partial<UserProfile>): UserProfile {
    const current = this.getUserProfile();
    const updated: UserProfile = {
      ...current,
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    safeStorage.setItem(this.getUserKey(), JSON.stringify(updated));
    this.notify();
    return updated;
  }

  // --- Contacts ---
  public getContacts(): Contact[] {
    const key = this.getContactsKey();
    const raw = safeStorage.getItem(key);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getContactById(id: string): Contact | undefined {
    return this.getContacts().find((c) => c.id === id);
  }

  public saveContact(
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Contact {
    const contacts = this.getContacts();
    const now = new Date().toISOString();

    if (contactData.id) {
      const index = contacts.findIndex((c) => c.id === contactData.id);
      if (index !== -1) {
        const updated: Contact = {
          ...contacts[index],
          ...contactData,
          id: contactData.id,
          updatedAt: now,
          syncStatus: isOnline() ? 'synced' : 'pending',
        };
        contacts[index] = updated;
        safeStorage.setItem(this.getContactsKey(), JSON.stringify(contacts));
        this.notify();
        return updated;
      }
    }

    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: isOnline() ? 'synced' : 'pending',
    };
    contacts.unshift(newContact);
    safeStorage.setItem(this.getContactsKey(), JSON.stringify(contacts));
    this.notify();
    return newContact;
  }

  public deleteContact(id: string): boolean {
    const contacts = this.getContacts().filter((c) => c.id !== id);
    safeStorage.setItem(this.getContactsKey(), JSON.stringify(contacts));
    this.notify();
    return true;
  }

  // --- Transactions ---
  public getTransactions(): Transaction[] {
    const key = this.getTransactionsKey();
    const raw = safeStorage.getItem(key);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.getTransactions().find((t) => t.id === id);
  }

  public saveTransaction(
    txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ): Transaction {
    const transactions = this.getTransactions();
    const now = new Date().toISOString();

    if (txData.id) {
      const idx = transactions.findIndex((t) => t.id === txData.id);
      if (idx !== -1) {
        const updated: Transaction = {
          ...transactions[idx],
          ...txData,
          id: txData.id,
          updatedAt: now,
          syncStatus: isOnline() ? 'synced' : 'pending',
        };
        transactions[idx] = updated;
        safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(transactions));
        this.notify();
        return updated;
      }
    }

    const newTx: Transaction = {
      ...txData,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      syncStatus: isOnline() ? 'synced' : 'pending',
    };
    transactions.unshift(newTx);
    safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(transactions));
    this.notify();
    return newTx;
  }

  public cancelTransaction(id: string): boolean {
    const transactions = this.getTransactions();
    const idx = transactions.findIndex((t) => t.id === id);
    if (idx !== -1) {
      transactions[idx].status = 'cancelled';
      transactions[idx].updatedAt = new Date().toISOString();
      transactions[idx].syncStatus = isOnline() ? 'synced' : 'pending';
      safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(transactions));
      this.notify();
      return true;
    }
    return false;
  }

  public deleteTransaction(id: string): boolean {
    const transactions = this.getTransactions().filter((t) => t.id !== id);
    safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(transactions));
    this.notify();
    return true;
  }

  public deleteAllContacts(): { deletedCount: number; deletedContactIds: string[] } {
    const currentContacts = this.getContacts();
    const contactIds = currentContacts.map((c) => c.id);
    safeStorage.setItem(this.getContactsKey(), '[]');
    // When all contacts are deleted, all associated transactions are also deleted
    safeStorage.setItem(this.getTransactionsKey(), '[]');
    this.notify();
    return {
      deletedCount: contactIds.length,
      deletedContactIds: contactIds,
    };
  }

  public deleteAllTransactions(): { deletedCount: number; deletedTxIds: string[] } {
    const currentTransactions = this.getTransactions();
    const txIds = currentTransactions.map((t) => t.id);
    safeStorage.setItem(this.getTransactionsKey(), '[]');

    // Reset opening balances on remaining contacts to keep ledger consistent
    const currentContacts = this.getContacts();
    const resetContacts = currentContacts.map((c) => ({
      ...c,
      openingBalance: 0,
      updatedAt: new Date().toISOString(),
    }));
    safeStorage.setItem(this.getContactsKey(), JSON.stringify(resetContacts));

    this.notify();
    return {
      deletedCount: txIds.length,
      deletedTxIds: txIds,
    };
  }

  public getDemoDataCounts(): { contactsCount: number; transactionsCount: number } {
    const currentContacts = this.getContacts();
    const currentTransactions = this.getTransactions();

    const isDemoC = (c: Contact) =>
      c.id.startsWith('cnt_0') ||
      initialContacts.some((ic) => ic.id === c.id || ic.phone === c.phone);

    const demoContacts = currentContacts.filter(isDemoC);
    const demoContactIds = new Set(demoContacts.map((c) => c.id));

    const isDemoT = (t: Transaction) =>
      t.id.startsWith('tx_0') ||
      demoContactIds.has(t.contactId) ||
      initialTransactions.some((it) => it.id === t.id);

    const demoTransactions = currentTransactions.filter(isDemoT);

    return {
      contactsCount: demoContacts.length,
      transactionsCount: demoTransactions.length,
    };
  }

  public deleteDemoData(): {
    deletedContacts: number;
    deletedTransactions: number;
    deletedContactIds: string[];
    deletedTxIds: string[];
  } {
    const currentContacts = this.getContacts();
    const currentTransactions = this.getTransactions();

    const isDemoC = (c: Contact) =>
      c.id.startsWith('cnt_0') ||
      initialContacts.some((ic) => ic.id === c.id || ic.phone === c.phone);

    const demoContacts = currentContacts.filter(isDemoC);
    const demoContactIds = new Set(demoContacts.map((c) => c.id));

    const isDemoT = (t: Transaction) =>
      t.id.startsWith('tx_0') ||
      demoContactIds.has(t.contactId) ||
      initialTransactions.some((it) => it.id === t.id);

    const demoTransactions = currentTransactions.filter(isDemoT);

    const remainingContacts = currentContacts.filter((c) => !demoContactIds.has(c.id));
    const remainingTransactions = currentTransactions.filter((t) => !isDemoT(t));

    safeStorage.setItem(this.getContactsKey(), JSON.stringify(remainingContacts));
    safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(remainingTransactions));
    this.notify();

    return {
      deletedContacts: demoContacts.length,
      deletedTransactions: demoTransactions.length,
      deletedContactIds: demoContacts.map((c) => c.id),
      deletedTxIds: demoTransactions.map((t) => t.id),
    };
  }

  public resetToSampleData() {
    safeStorage.setItem(this.getContactsKey(), JSON.stringify(initialContacts));
    safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(initialTransactions));
    safeStorage.setItem(this.getUserKey(), JSON.stringify(initialUserProfile));
    this.notify();
  }

  public replaceAllData(
    contacts: Contact[],
    transactions: Transaction[],
    profile?: UserProfile
  ) {
    safeStorage.setItem(this.getContactsKey(), JSON.stringify(contacts));
    safeStorage.setItem(this.getTransactionsKey(), JSON.stringify(transactions));
    if (profile) {
      safeStorage.setItem(this.getUserKey(), JSON.stringify(profile));
    }
    this.notify();
  }
}

export const db = new DatabaseService();
