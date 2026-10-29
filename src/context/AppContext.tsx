import React, { createContext, useContext, useState, useEffect } from 'react';
import { Contact, Transaction, UserProfile, LedgerSummary } from '../types/accounting';
import { db, SyncState } from '../services/storage/db';
import { calculateLedgerSummary } from '../services/accounting/calculator';
import { firebaseSync, AppUser } from '../services/firebase/firebaseSync';
import { soundService } from '../services/sound/soundService';

export type ActiveTab =
  | 'dashboard'
  | 'contacts'
  | 'ledger'
  | 'reminders'
  | 'analytics'
  | 'publicLookup'
  | 'backup'
  | 'settings'
  | 'androidGuide'
  | 'admin';

interface AppContextType {
  contacts: Contact[];
  transactions: Transaction[];
  userProfile: UserProfile;
  ledgerSummary: LedgerSummary;
  syncState: SyncState;
  lastSyncTime: string;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedContactId: string | null;
  setSelectedContactId: (id: string | null) => void;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  // Firebase Auth & Roles
  firebaseUser: AppUser | null;
  isAuthReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<AppUser>;
  signUpWithEmail: (email: string, password: string, displayName: string, businessName?: string) => Promise<AppUser>;
  signInWithEmail: (email: string, password: string) => Promise<AppUser>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPin: () => void;
  // Actions
  saveContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Contact;
  deleteContact: (id: string) => boolean;
  saveTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Transaction;
  cancelTransaction: (id: string) => boolean;
  deleteTransaction: (id: string) => boolean;
  saveUserProfile: (profile: Partial<UserProfile>) => UserProfile;
  triggerSync: () => Promise<void>;
  resetToSampleData: () => void;
  deleteDemoData: () => {
    deletedContacts: number;
    deletedTransactions: number;
    deletedContactIds: string[];
    deletedTxIds: string[];
  };
  getDemoDataCounts: () => { contactsCount: number; transactionsCount: number };
  // Accidental Prevention & Statement Printing Modals
  isResetModalOpen: boolean;
  setIsResetModalOpen: (open: boolean) => void;
  openResetModal: () => void;
  isPrintModalOpen: boolean;
  setIsPrintModalOpen: (open: boolean) => void;
  openPrintModal: (contactId?: string | null) => void;
  printContactId: string | null;
  setPrintContactId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(() => db.getContacts());
  const [transactions, setTransactions] = useState<Transaction[]>(() => db.getTransactions());
  const [userProfile, setUserProfile] = useState<UserProfile>(() => db.getUserProfile());
  const [syncState, setSyncState] = useState<SyncState>(() => db.getSyncState());
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => db.getLastSyncTime());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    const profile = db.getUserProfile();
    return !!(profile.pinEnabled && profile.pinHash);
  });
  const [firebaseUser, setFirebaseUser] = useState<AppUser | null>(() => firebaseSync.getCurrentUser());
  const [isAuthReady, setIsAuthReady] = useState<boolean>(() => firebaseSync.getIsAuthReady());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => firebaseSync.getIsAdmin());

  // Modal dialog states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printContactId, setPrintContactId] = useState<string | null>(null);

  const openResetModal = () => setIsResetModalOpen(true);
  const openPrintModal = (contactId?: string | null) => {
    setPrintContactId(contactId ?? null);
    setIsPrintModalOpen(true);
  };

  useEffect(() => {
    const unsubscribeDb = db.subscribe(() => {
      setContacts(db.getContacts());
      setTransactions(db.getTransactions());
      setUserProfile(db.getUserProfile());
      setLastSyncTime(db.getLastSyncTime());
    });

    const unsubscribeSync = db.subscribeSyncState((state) => {
      setSyncState(state);
    });

    const unsubscribeAuth = firebaseSync.subscribeAuth((u, ready, admin) => {
      setFirebaseUser(u);
      setIsAuthReady(ready);
      setIsAdmin(admin);
    });

    return () => {
      unsubscribeDb();
      unsubscribeSync();
      unsubscribeAuth();
    };
  }, []);

  const ledgerSummary = calculateLedgerSummary(contacts, transactions);

  const saveContact = (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const saved = db.saveContact(contact);
    firebaseSync.syncContactToCloud(saved);
    return saved;
  };

  const deleteContact = (id: string) => {
    return db.deleteContact(id);
  };

  const saveTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const saved = db.saveTransaction(tx);
    firebaseSync.syncTransactionToCloud(saved);
    return saved;
  };

  const cancelTransaction = (id: string) => {
    return db.cancelTransaction(id);
  };

  const deleteTransaction = (id: string) => {
    return db.deleteTransaction(id);
  };

  const saveUserProfile = (profile: Partial<UserProfile>) => {
    return db.saveUserProfile(profile);
  };

  const triggerSync = async () => {
    contacts.forEach((c) => firebaseSync.syncContactToCloud(c));
    transactions.forEach((t) => firebaseSync.syncTransactionToCloud(t));
    await db.triggerSync();
  };

  const resetToSampleData = () => {
    db.resetToSampleData();
  };

  const deleteDemoData = () => {
    const res = db.deleteDemoData();
    res.deletedContactIds.forEach((cId) => firebaseSync.deleteContactFromCloud(cId));
    res.deletedTxIds.forEach((tId) => firebaseSync.deleteTransactionFromCloud(tId));
    return res;
  };

  const getDemoDataCounts = () => db.getDemoDataCounts();

  const signInWithGoogle = () => firebaseSync.signInWithGoogle();
  const signUpWithEmail = (email: string, password: string, displayName: string, businessName?: string) =>
    firebaseSync.signUpWithEmail(email, password, displayName, businessName);
  const signInWithEmail = (email: string, password: string) =>
    firebaseSync.signInWithEmail(email, password);
  const sendPasswordReset = (email: string) =>
    firebaseSync.sendPasswordReset(email);
  const logout = async () => {
    soundService.playLogoff();
    await firebaseSync.logout();
  };

  const resetPin = () => {
    db.saveUserProfile({
      pinEnabled: false,
      pinHash: undefined,
      pinSalt: undefined,
    });
    setIsLocked(false);
  };

  return (
    <AppContext.Provider
      value={{
        contacts,
        transactions,
        userProfile,
        ledgerSummary,
        syncState,
        lastSyncTime,
        activeTab,
        setActiveTab,
        selectedContactId,
        setSelectedContactId,
        isLocked,
        setIsLocked,
        firebaseUser,
        isAuthReady,
        isAdmin,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        sendPasswordReset,
        logout,
        resetPin,
        saveContact,
        deleteContact,
        saveTransaction,
        cancelTransaction,
        deleteTransaction,
        saveUserProfile,
        triggerSync,
        resetToSampleData,
        deleteDemoData,
        getDemoDataCounts,
        isResetModalOpen,
        setIsResetModalOpen,
        openResetModal,
        isPrintModalOpen,
        setIsPrintModalOpen,
        openPrintModal,
        printContactId,
        setPrintContactId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
