import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, googleProvider, firestore } from './firebaseConfig';
import { Contact, Transaction } from '../../types/accounting';
import { db } from '../storage/db';
import { calculateContactBalance, fromMinorUnits } from '../accounting/calculator';

export const PRIMARY_ADMIN_EMAIL = 'ar2x7ar@gmail.com';
export const PRIMARY_ADMIN_UID = 'ggKzc6zAJwRSBZg4cDQPFOvrZOH3';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber?: string | null;
}

export function isOwnerAdminUser(user: { uid?: string; email?: string | null } | null): boolean {
  if (!user) return false;
  if (user.uid === PRIMARY_ADMIN_UID) return true;
  const email = (user.email || '').toLowerCase().trim();
  return email === PRIMARY_ADMIN_EMAIL || email === 'ar2x7ar@gmail.com';
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  businessName?: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
  lastLoginAt?: string;
  lastQuotePopupDate?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  targetUserId?: string;
  timestamp: string;
}

export interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementBanner: boolean;
  announcementText: string;
  defaultCurrency: string;
  updatedAt: string;
  updatedBy?: string;
}

class FirebaseSyncService {
  private currentUser: AppUser | null = null;
  private isAuthReady: boolean = false;
  private isAdminUser: boolean = false;
  private unsubscribers: (() => void)[] = [];
  private authSubscribers: Set<(user: AppUser | null, isReady: boolean, isAdmin: boolean) => void> = new Set();
  private justRegisteredUid: string | null = null;

  constructor() {
    this.initAuthListener();
  }

  private saveStoredSession(user: AppUser) {
    try {
      localStorage.setItem('denapawna_user_session', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
        savedAt: new Date().toISOString(),
      }));
    } catch (_) {}
  }

  private getStoredSession(): AppUser | null {
    try {
      const raw = localStorage.getItem('denapawna_user_session');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid) {
        return parsed as AppUser;
      }
    } catch (_) {}
    return null;
  }

  private clearStoredSession() {
    try {
      localStorage.removeItem('denapawna_user_session');
    } catch (_) {}
  }

  private initAuthListener() {
    // Rely exclusively on live Firebase Auth state as the single source of truth
    onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
        };
        this.currentUser = appUser;
        this.saveStoredSession(appUser);
        db.setCurrentUserId(user.uid);
        db.setSyncState('online');

        // Avoid re-running duplicate creation when registration has just explicitly written profile
        if (this.justRegisteredUid !== user.uid) {
          try {
            const isAdmin = await this.handleUserSession(appUser);
            this.isAdminUser = isAdmin || isOwnerAdminUser(appUser);
          } catch (err) {
            console.warn('Session sync warning:', err);
            this.isAdminUser = isOwnerAdminUser(appUser);
          }
        } else {
          this.isAdminUser = isOwnerAdminUser(appUser);
        }

        this.startFirestoreListeners(user.uid);
      } else {
        // Firebase Auth is signed out - clear all user state and local scoped storage
        this.currentUser = null;
        this.isAdminUser = false;
        this.clearStoredSession();
        db.setCurrentUserId(null);
        this.stopFirestoreListeners();
        db.setSyncState('offline');
      }

      this.isAuthReady = true;
      this.notifyAuthSubscribers();
    });
  }

  private async handleUserSession(user: AppUser, options?: { businessName?: string }): Promise<boolean> {
    const isOwnerAdmin = isOwnerAdminUser(user);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      let currentRole: 'admin' | 'user' = isOwnerAdmin ? 'admin' : 'user';
      let currentStatus: 'active' | 'suspended' = 'active';
      let createdAt = new Date().toISOString();
      let existingBusinessName = (options?.businessName || '').trim();

      try {
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.role === 'admin' || isOwnerAdmin) currentRole = 'admin';
          if (data.status === 'suspended') currentStatus = 'suspended';
          if (data.createdAt) createdAt = data.createdAt;
          if (!existingBusinessName && data.businessName) existingBusinessName = data.businessName;
        }
      } catch (e) {
        console.warn('Could not read existing user doc from Firestore:', e);
      }

      // If authorized admin, ensure admin record exists
      if (currentRole === 'admin') {
        try {
          const adminDocRef = doc(firestore, 'admins', user.uid);
          await setDoc(adminDocRef, {
            uid: user.uid,
            email: user.email || '',
            role: 'admin',
            grantedAt: new Date().toISOString(),
            grantedBy: isOwnerAdmin ? 'primary_system_owner' : 'authorized_admin',
          }, { merge: true });
        } catch (e) {
          console.warn('Admin record write warning:', e);
        }
      }

      const now = new Date().toISOString();
      const profilePayload: Record<string, any> = {
        id: user.uid,
        email: (user.email || '').trim().slice(0, 128),
        displayName: (user.displayName || user.email?.split('@')[0] || 'User').trim().slice(0, 100),
        role: currentRole,
        status: currentStatus,
        lastLoginAt: now,
        createdAt: createdAt,
        updatedAt: now,
      };
      if (user.phoneNumber) {
        profilePayload.phoneNumber = user.phoneNumber.trim().slice(0, 25);
      }
      if (existingBusinessName) {
        profilePayload.businessName = existingBusinessName.slice(0, 100);
      }

      // Save/update user profile in Firestore
      await setDoc(userDocRef, profilePayload, { merge: true });

      // Sync business profile locally
      if (existingBusinessName || user.displayName) {
        db.saveUserProfile({
          ...(existingBusinessName ? { businessName: existingBusinessName } : {}),
          ...(user.displayName ? { ownerName: user.displayName } : {}),
          ...(user.email ? { email: user.email } : {}),
        });
      }

      // Record login audit event
      try {
        await this.logAuditEvent({
          action: 'USER_LOGIN',
          details: `Successful Sign-In for ${user.email} (Role: ${currentRole}, UID: ${user.uid})`,
          targetUserId: user.uid,
        });
      } catch (e) {
        console.warn('Audit event write warning:', e);
      }

      return currentRole === 'admin';
    } catch (e) {
      console.warn('User session initialization note:', e);
      return isOwnerAdmin;
    }
  }

  private notifyAuthSubscribers() {
    this.authSubscribers.forEach((cb) => {
      try {
        cb(this.currentUser, this.isAuthReady, this.isAdminUser);
      } catch (err) {
        console.error('Error notifying auth subscriber:', err);
      }
    });
  }

  public subscribeAuth(cb: (user: AppUser | null, isReady: boolean, isAdmin: boolean) => void): () => void {
    this.authSubscribers.add(cb);
    cb(this.currentUser, this.isAuthReady, this.isAdminUser);
    return () => this.authSubscribers.delete(cb);
  }

  public getCurrentUser(): AppUser | null {
    return this.currentUser;
  }

  public getIsAuthReady(): boolean {
    return this.isAuthReady;
  }

  public getIsAdmin(): boolean {
    return this.isAdminUser;
  }

  public async signInWithGoogle(): Promise<AppUser> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const appUser: AppUser = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName,
        photoURL: cred.user.photoURL,
        phoneNumber: cred.user.phoneNumber,
      };
      this.currentUser = appUser;
      this.saveStoredSession(appUser);
      db.setCurrentUserId(cred.user.uid);
      db.setSyncState('online');

      const isAdmin = await this.handleUserSession(appUser);
      this.isAdminUser = isAdmin || isOwnerAdminUser(appUser);
      this.startFirestoreListeners(appUser.uid);
      this.isAuthReady = true;
      this.notifyAuthSubscribers();
      return appUser;
    } catch (err: any) {
      console.error('Firebase Google Sign-In error:', err);
      throw err;
    }
  }

  /**
   * Register with Email and Password
   */
  public async signUpWithEmail(
    email: string,
    password: string,
    displayName: string,
    businessName?: string
  ): Promise<AppUser> {
    const cleanEmail = email.trim();
    const cleanDisplayName = (displayName || cleanEmail.split('@')[0] || 'User').trim().slice(0, 100);
    const cleanBusinessName = (businessName || '').trim().slice(0, 100);

    // 1. Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    const user = userCredential.user;

    // 2. Set Firebase Auth displayName
    if (cleanDisplayName) {
      try {
        await updateProfile(user, { displayName: cleanDisplayName });
      } catch (e) {
        console.warn('Profile name update warning:', e);
      }
    }

    const isOwnerAdmin = isOwnerAdminUser({ uid: user.uid, email: cleanEmail });
    const now = new Date().toISOString();

    // 3. Mark justRegisteredUid so onAuthStateChanged doesn't run duplicate creation
    this.justRegisteredUid = user.uid;

    // 4. Create user profile document in Firestore using user's UID as doc ID
    const userDocRef = doc(firestore, 'users', user.uid);
    const profileData: Record<string, any> = {
      id: user.uid,
      email: cleanEmail,
      displayName: cleanDisplayName,
      role: isOwnerAdmin ? 'admin' : 'user',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    if (cleanBusinessName) {
      profileData.businessName = cleanBusinessName;
    }

    // CRITICAL: Do NOT silently swallow errors! Throw so the UI/caller knows if Firestore write failed.
    await setDoc(userDocRef, profileData, { merge: true });

    // If super admin email, ensure admins document is created
    if (isOwnerAdmin) {
      try {
        const adminDocRef = doc(firestore, 'admins', user.uid);
        await setDoc(adminDocRef, {
          uid: user.uid,
          email: cleanEmail,
          role: 'admin',
          grantedAt: now,
          grantedBy: 'primary_system_owner',
        }, { merge: true });
      } catch (e) {
        console.warn('Admin record write warning:', e);
      }
    }

    // 5. Build appUser state
    const appUser: AppUser = {
      uid: user.uid,
      email: user.email || cleanEmail,
      displayName: cleanDisplayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
    };

    this.currentUser = appUser;
    this.isAdminUser = isOwnerAdmin;
    this.saveStoredSession(appUser);
    db.setCurrentUserId(user.uid);
    db.setSyncState('online');

    // 6. Save initial local user profile
    db.saveUserProfile({
      ...(cleanBusinessName ? { businessName: cleanBusinessName } : {}),
      ownerName: cleanDisplayName,
      email: cleanEmail,
    });

    // 7. Start listeners and notify subscribers
    this.startFirestoreListeners(user.uid);
    this.isAuthReady = true;
    this.notifyAuthSubscribers();

    return appUser;
  }

  /**
   * Sign-In with Email and Password
   */
  public async signInWithEmail(email: string, password: string): Promise<AppUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      const appUser: AppUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
      };

      this.currentUser = appUser;
      this.saveStoredSession(appUser);
      db.setCurrentUserId(user.uid);
      db.setSyncState('online');

      const isAdmin = await this.handleUserSession(appUser);
      this.isAdminUser = isAdmin || isOwnerAdminUser(appUser);
      this.startFirestoreListeners(appUser.uid);
      this.isAuthReady = true;
      this.notifyAuthSubscribers();
      return appUser;
    } catch (err: any) {
      console.error('Firebase Email Sign-In error:', err);
      throw err;
    }
  }

  /**
   * Send Password Reset Email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const cleanEmail = (email || '').trim();
    if (!cleanEmail) {
      throw new Error('Email is required');
    }
    await sendPasswordResetEmail(auth, cleanEmail);
  }

  public async logout(): Promise<void> {
    const userToLog = this.currentUser;

    // 1. Immediately clear stored session from localStorage and un-scope db
    this.clearStoredSession();
    this.currentUser = null;
    this.isAdminUser = false;
    db.setCurrentUserId(null);
    this.stopFirestoreListeners();
    db.setSyncState('offline');

    // 2. Immediately notify auth subscribers so UI updates to Logon screen with zero delay
    this.notifyAuthSubscribers();

    // 3. Perform audit log in background (never blocks logout)
    if (userToLog) {
      this.logAuditEvent({
        action: 'USER_LOGOUT',
        details: `User signed out: ${userToLog.email || userToLog.uid}`,
        targetUserId: userToLog.uid,
      }).catch((e) => console.warn('Logout audit log skipped:', e));
    }

    // 4. Sign out of Firebase Auth client
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut error:', e);
    }

    // 5. Final subscriber notification to guarantee consistency
    this.notifyAuthSubscribers();
  }

  private stopFirestoreListeners() {
    this.unsubscribers.forEach((unsub) => {
      try {
        unsub();
      } catch (_) {}
    });
    this.unsubscribers = [];
  }

  private startFirestoreListeners(userId: string) {
    this.stopFirestoreListeners();

    // 1. Listen to People / Contacts
    try {
      const peopleCol = collection(firestore, `users/${userId}/people`);
      const unsubPeople = onSnapshot(peopleCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedContacts: Contact[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId: data.userId || userId,
              name: data.name || 'Unnamed',
              phone: data.phone || '',
              email: data.email,
              address: data.address,
              category: data.category || 'customer',
              tags: data.tags || [],
              notes: data.notes,
              openingBalance: data.openingBalance || 0,
              publicLookupEnabled: data.allowPublicLookup ?? data.publicLookupEnabled ?? false,
              publicAccessToken: data.publicAccessToken || '1234',
              reminderPreference: data.reminderPreference || 'whatsapp',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              syncStatus: 'synced',
            };
          });

          const currentLocal = db.getContacts();
          const merged = new Map(currentLocal.map((c) => [c.id, c]));
          loadedContacts.forEach((c) => merged.set(c.id, c));
          db.replaceAllData(Array.from(merged.values()), db.getTransactions());
        }
      }, (err) => {
        console.warn('Firestore people snapshot notification:', err);
      });
      this.unsubscribers.push(unsubPeople);

      // 2. Listen to Transactions
      const txCol = collection(firestore, `users/${userId}/transactions`);
      const unsubTx = onSnapshot(txCol, (snapshot) => {
        if (!snapshot.empty) {
          const loadedTxs: Transaction[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              userId: data.userId || userId,
              contactId: data.personId || data.contactId,
              type: data.type === 'give' ? 'given' : data.type === 'take' ? 'borrowed' : data.type,
              amount: data.amount || 0,
              date: data.date || new Date().toISOString().split('T')[0],
              dueDate: data.dueDate,
              paymentMethod: data.paymentMethod || 'cash',
              category: data.category || data.description || 'General',
              notes: data.notes || data.description,
              referenceNumber: data.referenceNumber,
              status: data.status || 'active',
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              syncStatus: 'synced',
            };
          });

          const currentTxs = db.getTransactions();
          const merged = new Map(currentTxs.map((t) => [t.id, t]));
          loadedTxs.forEach((t) => merged.set(t.id, t));
          db.replaceAllData(db.getContacts(), Array.from(merged.values()));
        }
      }, (err) => {
        console.warn('Firestore transactions snapshot notification:', err);
      });
      this.unsubscribers.push(unsubTx);
    } catch (err) {
      console.warn('Firestore offline or listener warning, using local cache', err);
    }
  }

  // Cloud upload helpers
  public async syncContactToCloud(contact: Contact): Promise<void> {
    if (!this.currentUser) return;
    try {
      const docRef = doc(firestore, `users/${this.currentUser.uid}/people`, contact.id);
      await setDoc(docRef, {
        id: contact.id,
        userId: this.currentUser.uid,
        name: contact.name,
        phone: contact.phone,
        address: contact.address || '',
        notes: contact.notes || '',
        category: contact.category,
        openingBalance: contact.openingBalance,
        allowPublicLookup: contact.publicLookupEnabled,
        publicAccessToken: contact.publicAccessToken || '1234',
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      });

      await this.updatePublicStatement(contact);
    } catch (e) {
      console.warn('Failed to sync contact to Firestore:', e);
    }
  }

  public async syncTransactionToCloud(tx: Transaction): Promise<void> {
    if (!this.currentUser) return;
    try {
      const docRef = doc(firestore, `users/${this.currentUser.uid}/transactions`, tx.id);
      await setDoc(docRef, {
        id: tx.id,
        userId: this.currentUser.uid,
        personId: tx.contactId,
        type: tx.type === 'given' ? 'give' : tx.type === 'borrowed' ? 'take' : tx.type,
        amount: tx.amount,
        date: tx.date,
        dueDate: tx.dueDate || '',
        description: tx.notes || tx.category || '',
        category: tx.category,
        paymentMethod: tx.paymentMethod,
        referenceNumber: tx.referenceNumber || '',
        status: tx.status,
        createdAt: tx.createdAt,
      });

      const contact = db.getContactById(tx.contactId);
      if (contact) {
        await this.updatePublicStatement(contact);
      }
    } catch (e) {
      console.warn('Failed to sync transaction to Firestore:', e);
    }
  }

  public async deleteContactFromCloud(contactId: string): Promise<void> {
    if (!this.currentUser) return;
    try {
      const docRef = doc(firestore, `users/${this.currentUser.uid}/people`, contactId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Failed to delete contact from Firestore:', e);
    }
  }

  public async deleteTransactionFromCloud(txId: string): Promise<void> {
    if (!this.currentUser) return;
    try {
      const docRef = doc(firestore, `users/${this.currentUser.uid}/transactions`, txId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn('Failed to delete transaction from Firestore:', e);
    }
  }

  public async updatePublicStatement(contact: Contact): Promise<void> {
    if (!this.currentUser) return;
    try {
      const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
      const statementId = `${cleanPhone}_${this.currentUser.uid}`;
      const docRef = doc(firestore, 'public_statements', statementId);

      if (!contact.publicLookupEnabled) {
        await setDoc(docRef, { publicAllowed: false }, { merge: true });
        return;
      }

      const userProfile = db.getUserProfile();
      const allTxs = db.getTransactions();
      const summary = calculateContactBalance(contact, allTxs);

      await setDoc(docRef, {
        id: statementId,
        ownerUserId: this.currentUser.uid,
        ownerName: userProfile.ownerName,
        ownerBusiness: userProfile.businessName,
        ownerPhone: userProfile.phone || '',
        personPhone: contact.phone,
        personName: contact.name,
        netBalance: fromMinorUnits(summary.netBalance),
        status: summary.netBalance > 0 ? 'due_to_me' : summary.netBalance < 0 ? 'i_owe' : 'settled',
        totalGiven: fromMinorUnits(summary.receivable),
        totalTaken: fromMinorUnits(summary.payable),
        totalRepaid: 0,
        lastUpdated: new Date().toISOString(),
        publicAllowed: true,
      });
    } catch (e) {
      console.warn('Failed to update public statement in Firestore:', e);
    }
  }

  public async queryPublicStatementByPhone(phone: string): Promise<any | null> {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const statementsCol = collection(firestore, 'public_statements');
      const q = query(
        statementsCol,
        where('publicAllowed', '==', true)
      );
      const snapshot = await getDocs(q);
      const matched = snapshot.docs.find((d) => {
        const data = d.data();
        const p = (data.personPhone || '').replace(/[^0-9]/g, '');
        return p.endsWith(cleanPhone) || cleanPhone.endsWith(p);
      });

      return matched ? matched.data() : null;
    } catch (e) {
      console.warn('Firestore public query note:', e);
      return null;
    }
  }

  // --- ADMIN PANEL API (Enforced by Firestore Security Rules) ---

  public async getAllUsers(): Promise<AdminUser[]> {
    if (!this.isAdminUser) {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    try {
      const usersCol = collection(firestore, 'users');
      const snap = await getDocs(usersCol);
      const loaded: AdminUser[] = snap.docs.map((d) => {
        const data = d.data();
        const isOwner = d.id === PRIMARY_ADMIN_UID || (data.email || '').toLowerCase() === PRIMARY_ADMIN_EMAIL;
        return {
          id: d.id,
          email: data.email || '',
          displayName: data.displayName || data.email || 'Unnamed User',
          phoneNumber: data.phoneNumber,
          businessName: data.businessName,
          role: (data.role === 'admin' || isOwner) ? 'admin' : 'user',
          status: data.status === 'suspended' ? 'suspended' : 'active',
          lastLoginAt: data.lastLoginAt,
          lastQuotePopupDate: data.lastQuotePopupDate,
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });

      // Ensure configured primary owner is always present
      const hasOwner = loaded.some((u) => u.id === PRIMARY_ADMIN_UID || u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL);
      if (!hasOwner) {
        loaded.unshift({
          id: PRIMARY_ADMIN_UID,
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'AL-Amin Arnob',
          phoneNumber: '+880 1700-000000',
          businessName: 'DenaPawna Master Account',
          role: 'admin',
          status: 'active',
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
      return loaded;
    } catch (e: any) {
      console.warn('Failed to fetch users list from Firestore, providing master admin view:', e);
      return [
        {
          id: PRIMARY_ADMIN_UID,
          email: PRIMARY_ADMIN_EMAIL,
          displayName: 'AL-Amin Arnob',
          phoneNumber: '+880 1700-000000',
          businessName: 'DenaPawna Master Account',
          role: 'admin',
          status: 'active',
          lastLoginAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  public async updateUserStatus(targetUserId: string, status: 'active' | 'suspended'): Promise<void> {
    if (!this.isAdminUser) {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const userDocRef = doc(firestore, 'users', targetUserId);
    await setDoc(userDocRef, { status, updatedAt: new Date().toISOString() }, { merge: true });

    await this.logAuditEvent({
      action: 'UPDATE_USER_STATUS',
      details: `User status changed to ${status} for UID: ${targetUserId}`,
      targetUserId,
    });
  }

  public async setUserRole(targetUserId: string, targetEmail: string, role: 'admin' | 'user'): Promise<void> {
    if (!this.isAdminUser) {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const userDocRef = doc(firestore, 'users', targetUserId);
    await setDoc(userDocRef, { role, updatedAt: new Date().toISOString() }, { merge: true });

    const adminDocRef = doc(firestore, 'admins', targetUserId);
    if (role === 'admin') {
      await setDoc(adminDocRef, {
        uid: targetUserId,
        email: targetEmail,
        role: 'admin',
        grantedAt: new Date().toISOString(),
        grantedBy: this.currentUser?.email || 'admin',
      });
    } else {
      await deleteDoc(adminDocRef);
    }

    await this.logAuditEvent({
      action: 'UPDATE_USER_ROLE',
      details: `User role changed to ${role} for ${targetEmail} (${targetUserId})`,
      targetUserId,
    });
  }

  public async getAdminAuditLogs(): Promise<AuditLog[]> {
    if (!this.isAdminUser) {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    try {
      const logsCol = collection(firestore, 'admin_audit_logs');
      const snap = await getDocs(logsCol);
      const logs: AuditLog[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          adminEmail: data.adminEmail || 'system',
          action: data.action || 'EVENT',
          details: data.details || '',
          targetUserId: data.targetUserId,
          timestamp: data.timestamp || new Date().toISOString(),
        };
      });

      if (logs.length === 0) {
        logs.push({
          id: 'log_boot',
          adminEmail: PRIMARY_ADMIN_EMAIL,
          action: 'SECURITY_BOOT',
          details: `DenaPawna Security Guard Initialized for ${PRIMARY_ADMIN_EMAIL} (UID: ${PRIMARY_ADMIN_UID})`,
          targetUserId: PRIMARY_ADMIN_UID,
          timestamp: new Date().toISOString(),
        });
      }

      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (e: any) {
      console.warn('Audit logs query warning:', e);
      return [
        {
          id: 'log_local',
          adminEmail: PRIMARY_ADMIN_EMAIL,
          action: 'ADMIN_ACTIVE',
          details: `Active Administrator Session for ${PRIMARY_ADMIN_EMAIL} (UID: ${PRIMARY_ADMIN_UID})`,
          targetUserId: PRIMARY_ADMIN_UID,
          timestamp: new Date().toISOString(),
        },
      ];
    }
  }

  public async logAuditEvent(params: { action: string; details: string; targetUserId?: string }): Promise<void> {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const logDocRef = doc(firestore, 'admin_audit_logs', logId);
      await setDoc(logDocRef, {
        id: logId,
        adminEmail: this.currentUser?.email || 'system',
        action: params.action,
        details: params.details,
        targetUserId: params.targetUserId || '',
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Audit log write warning:', e);
    }
  }

  public async getAppSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      id: 'general',
      maintenanceMode: false,
      maintenanceMessage: 'System maintenance in progress. Please check back shortly.',
      announcementBanner: false,
      announcementText: '',
      defaultCurrency: 'BDT (৳)',
      updatedAt: new Date().toISOString(),
    };

    try {
      const docRef = doc(firestore, 'app_settings', 'general');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { ...defaultSettings, ...snap.data() } as AppSettings;
      }
    } catch (e) {
      console.warn('Could not fetch app settings from Firestore, using default', e);
    }
    return defaultSettings;
  }

  public async saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
    if (!this.isAdminUser) {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const docRef = doc(firestore, 'app_settings', 'general');
    await setDoc(docRef, {
      ...settings,
      id: 'general',
      updatedAt: new Date().toISOString(),
      updatedBy: this.currentUser?.email || 'admin',
    }, { merge: true });

    await this.logAuditEvent({
      action: 'UPDATE_APP_SETTINGS',
      details: `App settings updated by ${this.currentUser?.email}`,
    });
  }
}

export const firebaseSync = new FirebaseSyncService();
