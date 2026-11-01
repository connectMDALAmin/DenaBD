import { Contact, Transaction, UserProfile } from '../../types/accounting';

export const initialUserProfile: UserProfile = {
  id: 'user_main_01',
  email: '',
  businessName: 'আমার ব্যবসা',
  ownerName: 'ব্যবহারকারী',
  phone: '',
  address: '',
  currency: 'BDT',
  currencySymbol: '৳',
  language: 'bn',
  theme: 'luna-blue',
  pinEnabled: false,
  lockTimeoutMinutes: 15,
  backupReminderDays: 7,
  createdAt: '2026-01-01T08:00:00.000Z',
  updatedAt: '2026-01-01T08:00:00.000Z',
};

export const initialContacts: Contact[] = [];

export const initialTransactions: Transaction[] = [];

