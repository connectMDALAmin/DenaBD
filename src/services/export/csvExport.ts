import { Contact, Transaction } from '../../types/accounting';
import { fromMinorUnits } from '../accounting/calculator';

/**
 * Escapes CSV field value safely
 */
function escapeCsv(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Exports transaction register to CSV with UTF-8 BOM for Bangla font Excel compatibility
 */
export function exportTransactionsToCsv(
  transactions: Transaction[],
  contacts: Contact[],
  filename = 'DenaPawna_Transactions.csv'
): void {
  const contactMap = new Map(contacts.map((c) => [c.id, c.name]));

  const headers = [
    'Transaction ID',
    'Date',
    'Contact Name',
    'Type',
    'Amount (BDT)',
    'Payment Method',
    'Category',
    'Due Date',
    'Reference / Invoice No',
    'Notes',
    'Status',
  ];

  const rows = transactions.map((t) => [
    escapeCsv(t.id),
    escapeCsv(t.date),
    escapeCsv(contactMap.get(t.contactId) || 'Unknown'),
    escapeCsv(t.type),
    escapeCsv(fromMinorUnits(t.amount).toFixed(2)),
    escapeCsv(t.paymentMethod),
    escapeCsv(t.category),
    escapeCsv(t.dueDate || ''),
    escapeCsv(t.referenceNumber || ''),
    escapeCsv(t.notes || ''),
    escapeCsv(t.status),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports contacts register with balances to CSV
 */
export function exportContactsToCsv(
  contacts: Contact[],
  filename = 'DenaPawna_Contacts.csv'
): void {
  const headers = [
    'Contact ID',
    'Name',
    'Phone',
    'Email',
    'Address',
    'Category',
    'Opening Balance (BDT)',
    'Public Lookup Enabled',
    'Created At',
  ];

  const rows = contacts.map((c) => [
    escapeCsv(c.id),
    escapeCsv(c.name),
    escapeCsv(c.phone),
    escapeCsv(c.email || ''),
    escapeCsv(c.address || ''),
    escapeCsv(c.category),
    escapeCsv(fromMinorUnits(c.openingBalance).toFixed(2)),
    escapeCsv(c.publicLookupEnabled ? 'Yes' : 'No'),
    escapeCsv(c.createdAt),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
