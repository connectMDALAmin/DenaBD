import { Contact, Transaction } from '../../types/accounting';
import { fromMinorUnits, toMinorUnits } from '../accounting/calculator';

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

/**
 * Exports contacts to JSON file
 */
export function exportContactsToJson(
  contacts: Contact[],
  filename = 'DenaPawna_Contacts.json'
): void {
  const jsonContent = JSON.stringify(contacts, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
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
 * Parses contacts from uploaded CSV or JSON file
 */
export function parseContactsFromFile(
  fileContent: string,
  filename: string
): Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> {
  const isJson = filename.toLowerCase().endsWith('.json') || fileContent.trim().startsWith('[');
  if (isJson) {
    try {
      const data = JSON.parse(fileContent);
      if (Array.isArray(data)) {
        return data
          .filter((item) => item && typeof item === 'object' && (item.name || item.phone))
          .map((item) => ({
            userId: item.userId || '',
            name: String(item.name || item['নাম'] || 'Unnamed').trim(),
            phone: String(item.phone || item['মোবাইল'] || item['ফোন'] || '').trim(),
            email: item.email || item['ইমেইল'] || undefined,
            address: item.address || item['ঠিকানা'] || undefined,
            category: (item.category === 'supplier' || item.category === 'employee' || item.category === 'friend_family') ? item.category : 'customer',
            tags: Array.isArray(item.tags) ? item.tags : [],
            notes: item.notes || item['মন্তব্য'] || undefined,
            openingBalance: typeof item.openingBalance === 'number' ? item.openingBalance : toMinorUnits(item.openingBalance || 0),
            publicLookupEnabled: Boolean(item.publicLookupEnabled),
            publicAccessToken: item.publicAccessToken ? String(item.publicAccessToken) : undefined,
          }));
      }
    } catch (err) {
      console.error('Failed to parse contacts JSON', err);
    }
  }

  // Parse CSV
  const lines = fileContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse CSV row safely
  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const header = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('nam'));
  const phoneIdx = header.findIndex((h) => h.includes('phone') || h.includes('mobile'));
  const emailIdx = header.findIndex((h) => h.includes('email') || h.includes('mail'));
  const addressIdx = header.findIndex((h) => h.includes('address') || h.includes('addr'));
  const catIdx = header.findIndex((h) => h.includes('category') || h.includes('cat') || h.includes('type'));
  const balanceIdx = header.findIndex((h) => h.includes('balance') || h.includes('opening'));

  const parsed: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseRow(lines[i]);
    const name = (nameIdx >= 0 && cols[nameIdx]) ? cols[nameIdx] : (cols[1] || cols[0] || '').replace(/^"|"$/g, '');
    const phone = (phoneIdx >= 0 && cols[phoneIdx]) ? cols[phoneIdx] : (cols[2] || cols[1] || '').replace(/^"|"$/g, '');
    if (!name && !phone) continue;

    let cat: Contact['category'] = 'customer';
    const rawCat = (catIdx >= 0 ? cols[catIdx] : cols[5] || '').toLowerCase();
    if (rawCat.includes('supp') || rawCat.includes('পাইকার') || rawCat.includes('মহাজন')) cat = 'supplier';
    else if (rawCat.includes('emp') || rawCat.includes('কর্মচারী')) cat = 'employee';
    else if (rawCat.includes('friend') || rawCat.includes('বন্ধু') || rawCat.includes('family')) cat = 'friend_family';

    const rawBal = balanceIdx >= 0 ? cols[balanceIdx] : cols[6] || '0';
    const openingBalance = toMinorUnits(rawBal);

    parsed.push({
      userId: '',
      name: name || 'Unnamed Contact',
      phone: phone || '',
      email: emailIdx >= 0 ? cols[emailIdx] || undefined : undefined,
      address: addressIdx >= 0 ? cols[addressIdx] || undefined : undefined,
      category: cat,
      tags: [],
      notes: undefined,
      openingBalance,
      publicLookupEnabled: false,
    });
  }

  return parsed;
}

