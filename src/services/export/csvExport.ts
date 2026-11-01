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
 * Robust CSV parser that handles quotes, escaped quotes, and multi-line fields
 */
function parseCsvRows(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  // Strip UTF-8 BOM if present
  const cleanContent = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

  for (let i = 0; i < cleanContent.length; i++) {
    const char = cleanContent[i];

    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < cleanContent.length && cleanContent[i + 1] === '"') {
          currentField += '"';
          i++; // skip escaped double quote
        } else {
          insideQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (i + 1 < cleanContent.length && cleanContent[i + 1] === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  // Flush trailing field and row
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parses contacts from uploaded CSV or JSON file (supports Google Contacts, Android, Outlook, and Custom CSV)
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

  // Parse CSV rows with full quote-aware tokenizer
  const rows = parseCsvRows(fileContent);
  if (rows.length < 2) return [];

  const rawHeaders = rows[0];
  const normalizedHeaders = rawHeaders.map((h) => h.toLowerCase().trim());

  // Detect column indices
  // 1. Google Contacts / Multi-part Names
  const firstNameIdx = normalizedHeaders.findIndex(
    (h) => h === 'first name' || h === 'firstname' || h === 'given name'
  );
  const middleNameIdx = normalizedHeaders.findIndex(
    (h) => h === 'middle name' || h === 'middlename'
  );
  const lastNameIdx = normalizedHeaders.findIndex(
    (h) => h === 'last name' || h === 'lastname' || h === 'surname' || h === 'family name'
  );
  const namePrefixIdx = normalizedHeaders.findIndex(
    (h) => h === 'name prefix' || h === 'prefix'
  );
  const nameSuffixIdx = normalizedHeaders.findIndex(
    (h) => h === 'name suffix' || h === 'suffix'
  );
  const nicknameIdx = normalizedHeaders.findIndex(
    (h) => h === 'nickname'
  );
  const fileAsIdx = normalizedHeaders.findIndex(
    (h) => h === 'file as' || h === 'fileas'
  );
  const orgNameIdx = normalizedHeaders.findIndex(
    (h) => h === 'organization name' || h === 'company' || h === 'organization'
  );
  const singleNameIdx = normalizedHeaders.findIndex(
    (h) =>
      h === 'name' ||
      h === 'full name' ||
      h === 'contact name' ||
      h === 'নাম' ||
      h === 'কন্ট্যাক্ট নাম' ||
      (h.includes('name') &&
        !h.includes('first') &&
        !h.includes('middle') &&
        !h.includes('last') &&
        !h.includes('phonetic') &&
        !h.includes('prefix') &&
        !h.includes('suffix') &&
        !h.includes('file') &&
        !h.includes('org'))
  );

  // 2. Phone Columns (CRITICAL: exclude columns with "label" or "type", e.g. "Phone 1 - Label")
  // Prioritize Google Contacts "Phone 1 - Value", "Phone 2 - Value", "Mobile Phone", etc.
  const phoneValueIndices: number[] = [];
  normalizedHeaders.forEach((h, idx) => {
    const isLabel = h.includes('label') || h.includes('type') || h.includes('format');
    if (isLabel) return;

    if (
      h.includes('phone') ||
      h.includes('mobile') ||
      h.includes('cell') ||
      h.includes('tel') ||
      h.includes('contact') ||
      h.includes('মোবাইল') ||
      h.includes('ফোন')
    ) {
      // Prioritize primary phone columns to the front of list
      if (h.includes('1 - value') || h.includes('1 value') || h === 'phone' || h === 'mobile' || h === 'mobile phone') {
        phoneValueIndices.unshift(idx);
      } else {
        phoneValueIndices.push(idx);
      }
    }
  });

  // 3. Email Columns (exclude label columns)
  const emailIndices: number[] = [];
  normalizedHeaders.forEach((h, idx) => {
    if (h.includes('label') || h.includes('type')) return;
    if (h.includes('email') || h.includes('e-mail') || h.includes('mail') || h.includes('ইমেইল')) {
      emailIndices.push(idx);
    }
  });

  // 4. Address Columns
  const addressIdx = normalizedHeaders.findIndex(
    (h) =>
      !h.includes('label') &&
      (h.includes('address 1 - formatted') ||
        h.includes('address') ||
        h.includes('street') ||
        h.includes('ঠিকানা'))
  );

  // 5. Category Columns
  const catIdx = normalizedHeaders.findIndex(
    (h) =>
      h.includes('category') ||
      h.includes('group') ||
      h.includes('labels') ||
      h.includes('ক্যাটেগরি') ||
      h.includes('টাইপ')
  );

  // 6. Balance Columns
  const balanceIdx = normalizedHeaders.findIndex(
    (h) =>
      h.includes('opening balance') ||
      h.includes('balance') ||
      h.includes('বকেয়া') ||
      h.includes('জের')
  );

  // 7. Notes Columns
  const notesIdx = normalizedHeaders.findIndex(
    (h) =>
      h.includes('note') ||
      h.includes('description') ||
      h.includes('মন্তব্য')
  );

  const parsed: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> = [];

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    if (cols.length === 0 || cols.every((c) => !c.trim())) continue;

    // --- Extract Name ---
    let name = '';
    const nameParts: string[] = [];
    if (namePrefixIdx >= 0 && cols[namePrefixIdx]) nameParts.push(cols[namePrefixIdx]);
    if (firstNameIdx >= 0 && cols[firstNameIdx]) nameParts.push(cols[firstNameIdx]);
    if (middleNameIdx >= 0 && cols[middleNameIdx]) nameParts.push(cols[middleNameIdx]);
    if (lastNameIdx >= 0 && cols[lastNameIdx]) nameParts.push(cols[lastNameIdx]);
    if (nameSuffixIdx >= 0 && cols[nameSuffixIdx]) nameParts.push(cols[nameSuffixIdx]);

    if (nameParts.length > 0) {
      name = nameParts.filter(Boolean).join(' ').trim();
    }

    if (!name && singleNameIdx >= 0 && cols[singleNameIdx]) {
      name = cols[singleNameIdx].trim();
    }
    if (!name && fileAsIdx >= 0 && cols[fileAsIdx]) {
      name = cols[fileAsIdx].trim();
    }
    if (!name && orgNameIdx >= 0 && cols[orgNameIdx]) {
      name = cols[orgNameIdx].trim();
    }
    if (!name && nicknameIdx >= 0 && cols[nicknameIdx]) {
      name = cols[nicknameIdx].trim();
    }

    // --- Extract Phone ---
    let phone = '';
    let altPhone = '';

    // Check detected phone value columns
    for (const pIdx of phoneValueIndices) {
      if (pIdx < cols.length) {
        const val = cols[pIdx].trim().replace(/^'|^"|"$|'$/g, '');
        const digits = val.replace(/[^0-9]/g, '');
        // Must contain at least 6 digits and not be a label like "Mobile" or "Home"
        if (digits.length >= 6) {
          if (!phone) {
            phone = val;
          } else if (!altPhone && val !== phone) {
            altPhone = val;
          }
        }
      }
    }

    // Fallback: If no phone found yet from mapped columns, scan all cells for phone digits
    if (!phone) {
      for (let c = 0; c < cols.length; c++) {
        const val = cols[c].trim().replace(/^'|^"|"$|'$/g, '');
        // Skip obvious URLs, emails, dates
        if (val.includes('http') || val.includes('@') || val.includes('.com') || val.includes('/')) {
          continue;
        }
        const digits = val.replace(/[^0-9]/g, '');
        if (digits.length >= 8 && digits.length <= 16) {
          if (val.startsWith('+') || val.startsWith('01') || val.startsWith('880') || val.includes('-') || digits.length >= 10) {
            phone = val;
            break;
          }
        }
      }
    }

    // If both name and phone are completely missing, skip this row
    if (!name && !phone) continue;

    // If name is missing but phone exists, provide a human-friendly fallback name
    if (!name && phone) {
      name = `Contact ${phone}`;
    }

    // --- Extract Email ---
    let email: string | undefined = undefined;
    for (const eIdx of emailIndices) {
      if (eIdx < cols.length && cols[eIdx].includes('@')) {
        email = cols[eIdx].trim();
        break;
      }
    }

    // --- Extract Address ---
    const address = addressIdx >= 0 && addressIdx < cols.length && cols[addressIdx].trim()
      ? cols[addressIdx].trim()
      : undefined;

    // --- Extract Category ---
    let cat: Contact['category'] = 'customer';
    const rawCat = (catIdx >= 0 && catIdx < cols.length ? cols[catIdx] : '').toLowerCase();
    if (rawCat.includes('supp') || rawCat.includes('পাইকার') || rawCat.includes('মহাজন') || rawCat.includes('vendor')) {
      cat = 'supplier';
    } else if (rawCat.includes('emp') || rawCat.includes('staff') || rawCat.includes('কর্মচারী') || rawCat.includes('worker')) {
      cat = 'employee';
    } else if (rawCat.includes('friend') || rawCat.includes('family') || rawCat.includes('বন্ধু') || rawCat.includes('আত্মীয়')) {
      cat = 'friend_family';
    }

    // --- Extract Opening Balance ---
    const rawBal = balanceIdx >= 0 && balanceIdx < cols.length ? cols[balanceIdx] : '0';
    const openingBalance = toMinorUnits(rawBal);

    // --- Notes & Alt Phone ---
    let combinedNotes: string | undefined = undefined;
    const rawNotes = notesIdx >= 0 && notesIdx < cols.length && cols[notesIdx].trim() ? cols[notesIdx].trim() : '';
    const noteParts: string[] = [];
    if (rawNotes) noteParts.push(rawNotes);
    if (altPhone) noteParts.push(`Alt Phone: ${altPhone}`);
    if (orgNameIdx >= 0 && cols[orgNameIdx] && !name.includes(cols[orgNameIdx])) {
      noteParts.push(`Org: ${cols[orgNameIdx].trim()}`);
    }
    if (noteParts.length > 0) {
      combinedNotes = noteParts.join(' | ');
    }

    parsed.push({
      userId: '',
      name,
      phone,
      email,
      address,
      category: cat,
      tags: [],
      notes: combinedNotes,
      openingBalance,
      publicLookupEnabled: false,
    });
  }

  return parsed;
}


