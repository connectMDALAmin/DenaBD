/**
 * Domain types for DenaPawna Accounting Engine
 */

export type TransactionType = 'given' | 'received' | 'borrowed' | 'repaid';

export type ContactCategory = 'customer' | 'supplier' | 'friend_family' | 'employee' | 'other';

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'bank_transfer' | 'card' | 'other';

export type TransactionStatus = 'active' | 'cancelled' | 'reversed';

export interface Installment {
  id: string;
  transactionId: string;
  dueDate: string; // YYYY-MM-DD
  amount: number; // In minor units (paisa)
  paidAmount: number; // In minor units (paisa)
  status: 'pending' | 'partially_paid' | 'paid' | 'overdue';
  paidDate?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  contactId: string;
  type: TransactionType;
  amount: number; // Integer minor currency units (e.g., 50000 = 500.00 BDT)
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  dueDate?: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  category: string;
  notes?: string;
  referenceNumber?: string;
  receiptUrl?: string; // Base64 data URL or uploaded URL
  status: TransactionStatus;
  installments?: Installment[];
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  category: ContactCategory;
  tags?: string[];
  notes?: string;
  openingBalance: number; // In minor units (positive: they owe user, negative: user owes them)
  publicLookupEnabled: boolean;
  publicAccessToken?: string; // Expiring or static token for public verification
  reminderPreference?: 'whatsapp' | 'sms' | 'both' | 'none';
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending' | 'error';
}

export interface ContactSummary {
  contact: Contact;
  receivable: number; // Contact owes user (in minor units)
  payable: number; // User owes contact (in minor units)
  netBalance: number; // receivable - payable
  transactionCount: number;
  lastTransactionDate?: string;
  overdueAmount: number; // In minor units
  isOverdue: boolean;
}

export interface LedgerSummary {
  totalReceivable: number; // Contact owes user (minor units)
  totalPayable: number; // User owes contact (minor units)
  netPosition: number; // totalReceivable - totalPayable
  totalOverdueReceivable: number;
  totalOverduePayable: number;
  totalInflowLast30Days: number; // Received + Borrowed cash coming in
  totalOutflowLast30Days: number; // Given + Repaid cash going out
  contactCount: number;
  activeTransactionCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
  phone?: string;
  address?: string;
  currency: string; // 'BDT' | 'USD' | 'EUR' | 'INR'
  currencySymbol: string; // '৳', '$', etc.
  language: 'bn' | 'en';
  theme: 'luna-blue' | 'luna-silver' | 'luna-olive';
  pinEnabled: boolean;
  pinHash?: string;
  pinSalt?: string;
  lockTimeoutMinutes: number; // 0 for disabled
  backupReminderDays: number;
  createdAt: string;
  updatedAt: string;
  onboardingCompleted?: boolean;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  user: UserProfile;
  contacts: Contact[];
  transactions: Transaction[];
  metadata: {
    app: string;
    totalContacts: number;
    totalTransactions: number;
  };
}
