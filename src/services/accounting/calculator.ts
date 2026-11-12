/**
 * DenaPawna Financial Accounting Engine
 * Pure mathematical functions using safe integer minor currency units.
 */

import { Contact, Transaction, ContactSummary, LedgerSummary, ExpenseSummary } from '../../types/accounting';
import {
  getExpenseCategoryLabel,
  getExpenseCategoryColor,
  getExpenseCategoryIcon,
} from '../expenses/expenseCategories';

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
 * using net double-entry accounting logic.
 * Positive net = Contact owes user (Receivable / পাওনা)
 * Negative net = User owes contact (Payable / দেনা)
 */
export function calculateContactBalance(
  contact: Contact,
  transactions: Transaction[],
  currentDate = new Date().toISOString().split('T')[0]
): ContactSummary {
  const contactTxs = transactions.filter(
    (t) => t.contactId === contact.id && t.status === 'active'
  );

  // Net algebraic balance initialized with openingBalance
  // positive = they owe us (receivable), negative = we owe them (payable)
  let net = contact.openingBalance || 0;
  let lastTransactionDate: string | undefined = undefined;

  // Process all active transactions sorted by date
  const sortedTxs = [...contactTxs].sort((a, b) => a.date.localeCompare(b.date));

  sortedTxs.forEach((tx) => {
    if (!lastTransactionDate || tx.date > lastTransactionDate) {
      lastTransactionDate = tx.date;
    }

    switch (tx.type) {
      case 'given':
        // User gave money/credit to contact -> increases what contact owes user
        net += tx.amount;
        break;

      case 'received':
        // User received money from contact -> reduces what contact owes user (or becomes advance)
        net -= tx.amount;
        break;

      case 'borrowed':
        // User borrowed money or took goods on credit from contact -> increases what user owes contact
        net -= tx.amount;
        break;

      case 'repaid':
        // User repaid money to contact -> reduces what user owes contact (or becomes advance)
        net += tx.amount;
        break;
    }
  });

  // Calculate receivable and payable from final net position
  let receivable = 0;
  let payable = 0;

  if (net > 0) {
    receivable = net;
    payable = 0;
  } else if (net < 0) {
    receivable = 0;
    payable = Math.abs(net);
  }

  // Calculate overdue amounts if customer owes user
  let overdueAmount = 0;
  if (receivable > 0) {
    sortedTxs.forEach((tx) => {
      if (tx.installments && tx.installments.length > 0) {
        tx.installments.forEach((inst) => {
          if (inst.dueDate < currentDate && inst.status !== 'paid') {
            const remaining = inst.amount - (inst.paidAmount || 0);
            if (remaining > 0) {
              overdueAmount += remaining;
            }
          }
        });
      } else if (tx.type === 'given' && tx.dueDate && tx.dueDate < currentDate) {
        overdueAmount += tx.amount;
      }
    });
    // Cap overdue at current total receivable
    overdueAmount = Math.min(overdueAmount, receivable);
  }

  const isOverdue = overdueAmount > 0 && receivable > 0;

  return {
    contact,
    receivable,
    payable,
    netBalance: net,
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
        } else if (tx.type === 'given' || tx.type === 'repaid') {
          monthsMap[monthKey].outflow += val;
        }

        if (tx.type === 'given') monthsMap[monthKey].given += val;
        if (tx.type === 'received') monthsMap[monthKey].received += val;
      }
    });

  return Object.values(monthsMap);
}

/**
 * Calculates complete Personal Expense metrics strictly isolated from customer ledger
 */
export function calculateExpenseSummary(
  transactions: Transaction[],
  date = new Date(),
  lang: 'en' | 'bn' = 'en'
): ExpenseSummary {
  const todayStr = date.toISOString().split('T')[0];
  const monthPrefix = todayStr.substring(0, 7); // YYYY-MM
  const yearPrefix = todayStr.substring(0, 4); // YYYY

  const expenseTxs = transactions.filter(
    (tx) => tx.type === 'expense' && tx.status !== 'cancelled'
  );

  let todayTotal = 0;
  let thisMonthTotal = 0;
  let thisYearTotal = 0;
  let allTimeTotal = 0;

  const catMap: Record<string, { total: number; count: number }> = {};
  const methodMap: Record<string, { total: number; count: number }> = {};

  expenseTxs.forEach((tx) => {
    const amt = tx.amount || 0;
    allTimeTotal += amt;

    if (tx.date === todayStr) {
      todayTotal += amt;
    }
    if (tx.date.startsWith(monthPrefix)) {
      thisMonthTotal += amt;
    }
    if (tx.date.startsWith(yearPrefix)) {
      thisYearTotal += amt;
    }

    const catKey = tx.category || 'other_expenses';
    if (!catMap[catKey]) {
      catMap[catKey] = { total: 0, count: 0 };
    }
    catMap[catKey].total += amt;
    catMap[catKey].count += 1;

    const method = tx.paymentMethod || 'cash';
    if (!methodMap[method]) {
      methodMap[method] = { total: 0, count: 0 };
    }
    methodMap[method].total += amt;
    methodMap[method].count += 1;
  });

  // Recent 10 expenses sorted by date desc, createdAt desc
  const recentExpenses = [...expenseTxs]
    .sort((a, b) => {
      const dComp = b.date.localeCompare(a.date);
      if (dComp !== 0) return dComp;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    })
    .slice(0, 10);

  // Category totals array with percentage
  const categoryTotals = Object.entries(catMap)
    .map(([catId, data]) => ({
      categoryId: catId,
      categoryLabel: getExpenseCategoryLabel(catId, lang),
      total: data.total,
      count: data.count,
      percentage: allTimeTotal > 0 ? Math.round((data.total / allTimeTotal) * 100) : 0,
      color: getExpenseCategoryColor(catId),
      icon: getExpenseCategoryIcon(catId),
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly summary for last 6 months
  const monthlySummary: { monthKey: string; monthLabel: string; total: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { month: 'short' });
    let mTotal = 0;
    let mCount = 0;
    expenseTxs.forEach((tx) => {
      if (tx.date.startsWith(key)) {
        mTotal += tx.amount;
        mCount += 1;
      }
    });
    monthlySummary.push({
      monthKey: key,
      monthLabel: label,
      total: mTotal,
      count: mCount,
    });
  }

  const paymentMethodTotals = Object.entries(methodMap).map(([method, data]) => ({
    method: method as any,
    total: data.total,
    count: data.count,
  }));

  return {
    todayTotal,
    thisMonthTotal,
    thisYearTotal,
    allTimeTotal,
    recentExpenses,
    categoryTotals,
    monthlySummary,
    paymentMethodTotals,
  };
}
