import { BackupData, Contact, Transaction, UserProfile } from '../../types/accounting';
import { db } from './db';

const BACKUP_SCHEMA_VERSION = '2.4.0';

export interface ImportPreview {
  valid: boolean;
  error?: string;
  version?: string;
  exportedAt?: string;
  businessName?: string;
  totalContacts: number;
  totalTransactions: number;
  contactsToMerge: number;
  transactionsToMerge: number;
  parsedData?: BackupData;
}

/**
 * Generates a full JSON backup file of all user data
 */
export function generateFullBackup(): BackupData {
  const user = db.getUserProfile();
  const contacts = db.getContacts();
  const transactions = db.getTransactions();

  return {
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    user,
    contacts,
    transactions,
    metadata: {
      app: 'DenaPawna (দেনাপাওনা)',
      totalContacts: contacts.length,
      totalTransactions: transactions.length,
    },
  };
}

/**
 * Downloads JSON / .pawna backup directly in browser
 */
export function downloadBackupFile(format: 'json' | 'pawna' = 'json'): void {
  const backup = generateFullBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `DenaPawna_Backup_${dateStr}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Validates and analyzes an imported backup JSON text before applying changes
 */
export function validateAndPreviewBackup(rawJson: string): ImportPreview {
  try {
    const data = JSON.parse(rawJson);

    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'File is not a valid JSON object.', totalContacts: 0, totalTransactions: 0, contactsToMerge: 0, transactionsToMerge: 0 };
    }

    if (!Array.isArray(data.contacts) || !Array.isArray(data.transactions)) {
      return {
        valid: false,
        error: 'Incompatible backup format: missing contacts or transactions arrays.',
        totalContacts: 0,
        totalTransactions: 0,
        contactsToMerge: 0,
        transactionsToMerge: 0,
      };
    }

    // Verify minimum fields
    const validContacts = data.contacts.filter(
      (c: Partial<Contact>) => c && typeof c.id === 'string' && typeof c.name === 'string'
    );
    const validTransactions = data.transactions.filter(
      (t: Partial<Transaction>) =>
        t && typeof t.id === 'string' && typeof t.amount === 'number' && typeof t.type === 'string'
    );

    const existingContacts = db.getContacts();
    const existingTransactions = db.getTransactions();

    const existingContactIds = new Set(existingContacts.map((c) => c.id));
    const existingTxIds = new Set(existingTransactions.map((t) => t.id));

    const newContactCount = validContacts.filter((c: Contact) => !existingContactIds.has(c.id)).length;
    const newTxCount = validTransactions.filter((t: Transaction) => !existingTxIds.has(t.id)).length;

    return {
      valid: true,
      version: data.version || '1.0.0',
      exportedAt: data.exportedAt,
      businessName: data.user?.businessName,
      totalContacts: validContacts.length,
      totalTransactions: validTransactions.length,
      contactsToMerge: newContactCount,
      transactionsToMerge: newTxCount,
      parsedData: {
        version: data.version || BACKUP_SCHEMA_VERSION,
        exportedAt: data.exportedAt || new Date().toISOString(),
        user: data.user || db.getUserProfile(),
        contacts: validContacts,
        transactions: validTransactions,
        metadata: data.metadata || { app: 'DenaPawna', totalContacts: validContacts.length, totalTransactions: validTransactions.length },
      },
    };
  } catch (err: unknown) {
    return {
      valid: false,
      error: `Syntax error: ${(err as Error).message}`,
      totalContacts: 0,
      totalTransactions: 0,
      contactsToMerge: 0,
      transactionsToMerge: 0,
    };
  }
}

/**
 * Restores data with either 'merge' (add new or update) or 'replace' mode
 */
export function executeRestore(data: BackupData, mode: 'merge' | 'replace'): void {
  if (mode === 'replace') {
    db.replaceAllData(data.contacts, data.transactions, data.user);
  } else {
    // Merge contacts
    const currentContacts = db.getContacts();
    const contactMap = new Map(currentContacts.map((c) => [c.id, c]));
    data.contacts.forEach((c) => contactMap.set(c.id, c));

    // Merge transactions
    const currentTxs = db.getTransactions();
    const txMap = new Map(currentTxs.map((t) => [t.id, t]));
    data.transactions.forEach((t) => txMap.set(t.id, t));

    db.replaceAllData(Array.from(contactMap.values()), Array.from(txMap.values()));
  }
}
