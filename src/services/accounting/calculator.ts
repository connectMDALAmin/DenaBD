/**
 * DenaPawna Financial Accounting Engine
 * Pure mathematical functions using safe integer minor currency units.
 */

import { Contact, Transaction, ContactSummary, LedgerSummary } from '../../types/accounting';

/**
 * Converts a decimal monetary amount (e.g., 150.50) to integer minor currency units (e.g., 15050)
 */
export function toMinorUnits(amount: number | string): number {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0;
  }
  return Math.round(amount * 100);
}

/**
 * Converts integer minor currency units (e.g., 15050) to decimal number (150.50)
 */
export function fromMinorUnits(minor: number): number {
  return (minor || 0) / 100;
}

/**
 * Formats minor units into locale-aware currency representation
 */
export function formatCurrency(
  minor: number,
  currencySymbol = '৳',
  locale = 'bn-BD'
): string {
  const decimal = fromMinorUnits(minor);
  const formattedNumber = Math.abs(decimal).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = minor < 0 ? '-' : '';
  return `${sign}${currencySymbol}${formattedNumber}`;
}

/**
 * Formats Bangla digits for numeric display if needed
 */
export function toBanglaDigits(num: number | string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => banglaDigits[parseInt(d, 10)]);
}

/**
 * Calculates receivable and payable balances for a specific contact
 */
export function calculateContactBalance(
  contact: Contact,
  transactions: Transaction[],
  currentDate = new Date().toISOString().split('T')[0]
): ContactSummary {
  const contactTxs = transactions.filter(
    (t) => t.contactId === contact.id && t.status === 'active'
  );

  // Initial balances from contact opening balance
  let receivable = 0;
  let payable = 0;

  if (contact.openingBalance > 0) {
    receivable += contact.openingBalance;
  } else if (contact.openingBalance < 0) {
    payable += Math.abs(contact.openingBalance);
  }

  let overdueAmount = 0;
  let lastTransactionDate: string | undefined = undefined;

  // Process all active transactions sorted by date
  contactTxs.forEach((tx) => {
    if (!lastTransactionDate || tx.date > lastTransactionDate) {
      lastTransactionDate = tx.date;
    }

    switch (tx.type) {
      case 'given':
        // User gave money to contact -> Contact owes user (Receivable increases)
        receivable += tx.amount;
        if (tx.dueDate && tx.dueDate < currentDate) {
          overdueAmount += tx.amount;
        }
        break;

      case 'received':
        // User received money from contact -> Contact debt reduced
        receivable = Math.max(0, receivable - tx.amount);
        break;

      case 'borrowed':
        // User borrowed money from contact -> User owes contact (Payable increases)
        payable += tx.amount;
        break;

      case 'repaid':
        // User repaid money to contact -> User payable reduced
        payable = Math.max(0, payable - tx.amount);
        break;
    }

    // Check overdue installments if present
    if (tx.installments && tx.installments.length > 0) {
      tx.installments.forEach((inst) => {
        if (inst.dueDate < currentDate && inst.status !== 'paid') {
          const remaining = inst.amount - (inst.paidAmount || 0);
          if (remaining > 0) {
            overdueAmount = Math.max(overdueAmount, remaining);
          }
        }
      });
    }
  });

  const netBalance = receivable - payable;
  const isOverdue = overdueAmount > 0 && receivable > 0;

  return {
    contact,
    receivable,
    payable,
    netBalance,
    transactionCount: contactTxs.length,
    lastTransactionDate,
    overdueAmount,
    isOverdue,
  };
}

/**
 * Calculates global ledger metrics across all contacts and transactions
 */
export function calculateLedgerSummary(
  contacts: Contact[],
  transactions: Transaction[],
  currentDate = new Date().toISOString().split('T')[0]
): LedgerSummary {
  let totalReceivable = 0;
  let totalPayable = 0;
  let totalOverdueReceivable = 0;
  let totalOverduePayable = 0;

  // Calculate thirty days ago string
  const thirtyDaysAgoDate = new Date();
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30);
  const thirtyDaysAgo = thirtyDaysAgoDate.toISOString().split('T')[0];

  let totalInflowLast30Days = 0;
  let totalOutflowLast30Days = 0;

  // Compute contact level totals
  contacts.forEach((contact) => {
    const summary = calculateContactBalance(contact, transactions, currentDate);
    totalReceivable += summary.receivable;
    totalPayable += summary.payable;
    if (summary.isOverdue) {
      totalOverdueReceivable += summary.overdueAmount;
    }
  });

  // Compute 30-day cash flows
  const activeTxs = transactions.filter((t) => t.status === 'active');
  activeTxs.forEach((tx) => {
    if (tx.date >= thirtyDaysAgo && tx.date <= currentDate) {
      if (tx.type === 'received' || tx.type === 'borrowed') {
        // Cash coming into user's hand
        totalInflowLast30Days += tx.amount;
      } else if (tx.type === 'given' || tx.type === 'repaid') {
        // Cash going out of user's hand
        totalOutflowLast30Days += tx.amount;
      }
    }
  });

  return {
    totalReceivable,
    totalPayable,
    netPosition: totalReceivable - totalPayable,
    totalOverdueReceivable,
    totalOverduePayable,
    totalInflowLast30Days,
    totalOutflowLast30Days,
    contactCount: contacts.length,
    activeTransactionCount: activeTxs.length,
  };
}

/**
 * Computes monthly trend data for Recharts
 */
export function computeMonthlyCashFlowTrends(transactions: Transaction[]) {
  const monthsMap: Record<string, { month: string; inflow: number; outflow: number; given: number; received: number }> = {};
  
  // Last 6 months
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    monthsMap[key] = { month: monthName, inflow: 0, outflow: 0, given: 0, received: 0 };
  }

  transactions
    .filter((tx) => tx.status === 'active')
    .forEach((tx) => {
      const monthKey = tx.date.substring(0, 7);
      if (monthsMap[monthKey]) {
        const val = fromMinorUnits(tx.amount);
        if (tx.type === 'received' || tx.type === 'borrowed') {
          monthsMap[monthKey].inflow += val;
        } else {
          monthsMap[monthKey].outflow += val;
        }

        if (tx.type === 'given') monthsMap[monthKey].given += val;
        if (tx.type === 'received') monthsMap[monthKey].received += val;
      }
    });

  return Object.values(monthsMap);
}
