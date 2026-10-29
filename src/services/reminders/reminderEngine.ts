import { Contact, Transaction } from '../../types/accounting';
import { calculateContactBalance, formatCurrency, fromMinorUnits } from '../accounting/calculator';

export interface DueReminderItem {
  id: string;
  contact: Contact;
  type: 'transaction' | 'installment';
  transactionId: string;
  installmentId?: string;
  dueDate: string;
  amount: number; // In minor units
  daysDifference: number; // Negative = overdue, 0 = due today, positive = days left
  status: 'overdue' | 'due_today' | 'upcoming';
  category: string;
}

/**
 * Scans transactions and installments to produce structured reminder items
 */
export function getDueReminderItems(
  contacts: Contact[],
  transactions: Transaction[],
  currentDate = new Date().toISOString().split('T')[0]
): DueReminderItem[] {
  const contactMap = new Map(contacts.map((c) => [c.id, c]));
  const items: DueReminderItem[] = [];

  const todayTime = new Date(currentDate).getTime();

  transactions
    .filter((tx) => tx.status === 'active' && tx.type === 'given') // Only money owed TO user (receivables)
    .forEach((tx) => {
      const contact = contactMap.get(tx.contactId);
      if (!contact) return;

      // Check installments first
      if (tx.installments && tx.installments.length > 0) {
        tx.installments.forEach((inst) => {
          if (inst.status !== 'paid') {
            const dueTime = new Date(inst.dueDate).getTime();
            const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));
            const remaining = inst.amount - (inst.paidAmount || 0);

            if (remaining > 0) {
              items.push({
                id: `due_inst_${inst.id}`,
                contact,
                type: 'installment',
                transactionId: tx.id,
                installmentId: inst.id,
                dueDate: inst.dueDate,
                amount: remaining,
                daysDifference: diffDays,
                status: diffDays < 0 ? 'overdue' : diffDays === 0 ? 'due_today' : 'upcoming',
                category: tx.category,
              });
            }
          }
        });
      } else if (tx.dueDate) {
        // Direct transaction due date
        const dueTime = new Date(tx.dueDate).getTime();
        const diffDays = Math.round((dueTime - todayTime) / (1000 * 60 * 60 * 24));

        // Get current contact summary to make sure debt is still outstanding
        const summary = calculateContactBalance(contact, transactions, currentDate);
        if (summary.receivable > 0) {
          const reminderAmount = Math.min(tx.amount, summary.receivable);
          items.push({
            id: `due_tx_${tx.id}`,
            contact,
            type: 'transaction',
            transactionId: tx.id,
            dueDate: tx.dueDate,
            amount: reminderAmount,
            daysDifference: diffDays,
            status: diffDays < 0 ? 'overdue' : diffDays === 0 ? 'due_today' : 'upcoming',
            category: tx.category,
          });
        }
      }
    });

  // Sort: overdue first (most days overdue), then due today, then upcoming
  return items.sort((a, b) => a.daysDifference - b.daysDifference);
}

/**
 * Generates WhatsApp click-to-chat URL with pre-filled encoded text
 */
export function buildWhatsAppLink(
  contact: Contact,
  amountMinor: number,
  dueDate: string,
  businessName: string,
  lang: 'bn' | 'en'
): string {
  // Normalize phone number (strip whitespace, hyphens, ensure country code)
  let phone = contact.phone.replace(/[^0-9+]/g, '');
  if (phone.startsWith('01')) {
    phone = '88' + phone; // Default Bangladesh country code if missing
  }
  if (phone.startsWith('+')) {
    phone = phone.substring(1);
  }

  const formattedAmount = formatCurrency(amountMinor, '৳', lang);

  let text = '';
  if (lang === 'bn') {
    text = `আসসালামু আলাইকুম ${contact.name} ভাই/ম্যাম, ${businessName} থেকে জানানো যাচ্ছে আপনার বর্তমান বকেয়া হিসাব অনুযায়ী ${formattedAmount} পরিশোধের নির্ধারিত তারিখ ছিল ${dueDate}। অনুগ্রহ করে দ্রুত পরিশোধের ব্যবস্থা করার অনুরোধ করা হচ্ছে। ধন্যবাদ।`;
  } else {
    text = `Hello ${contact.name}, greeting from ${businessName}. A reminder that an outstanding amount of ${formattedAmount} is due (${dueDate}). Kindly arrange payment at your earliest convenience. Thank you.`;
  }

  return `https://api.whatsapp.com/send?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}`;
}

/**
 * Generates SMS URI for native device SMS app
 */
export function buildSmsLink(
  contact: Contact,
  amountMinor: number,
  dueDate: string,
  businessName: string,
  lang: 'bn' | 'en'
): string {
  const phone = contact.phone.replace(/[^0-9+]/g, '');
  const formattedAmount = formatCurrency(amountMinor, '৳', lang);

  let text = '';
  if (lang === 'bn') {
    text = `${businessName}: প্রিয় ${contact.name}, আপনার বকেয়া ${formattedAmount} ${dueDate} তারিখের মধ্যে পরিশোধের বিনীত অনুরোধ জানাচ্ছি।`;
  } else {
    text = `${businessName}: Dear ${contact.name}, your due payment of ${formattedAmount} is pending (due date: ${dueDate}). Please settle soon.`;
  }

  // Capacitor / mobile SMS scheme compatibility
  return `sms:${phone}?body=${encodeURIComponent(text)}`;
}
