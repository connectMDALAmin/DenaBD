import * as XLSX from 'xlsx';
import { Contact, Transaction, UserProfile } from '../../types/accounting';
import { calculateContactBalance, calculateLedgerSummary, fromMinorUnits } from '../accounting/calculator';

export function exportFullExcelReport(
  contacts: Contact[],
  transactions: Transaction[],
  userProfile: UserProfile,
  filename = 'DenaPawna_Full_Report.xlsx'
): void {
  const wb = XLSX.utils.book_new();
  const summary = calculateLedgerSummary(contacts, transactions);
  const nowStr = new Date().toLocaleString();

  // 1. Summary Sheet
  const summaryData = [
    ['DenaPawna Financial Report / দেনাপাওনা হিসাব বিবরণী'],
    ['Business Name / প্রতিষ্ঠানের নাম', userProfile.businessName],
    ['Owner / মালিক', userProfile.ownerName],
    ['Phone / মোবাইল', userProfile.phone || 'N/A'],
    ['Report Generated Date / রিপোর্ট তৈরির তারিখ', nowStr],
    [],
    ['Key Metric / মূল পরিসংখ্যান', 'Amount (BDT / টাকা)'],
    ['Total Receivables (মোট পাওনা / বাকি)', fromMinorUnits(summary.totalReceivable)],
    ['Total Payables (মোট দেনা / ঋণ)', fromMinorUnits(summary.totalPayable)],
    ['Net Position (নিট ব্যালেন্স)', fromMinorUnits(summary.netPosition)],
    ['Total Overdue Receivables (মেয়াদোত্তীর্ণ পাওনা)', fromMinorUnits(summary.totalOverdueReceivable)],
    ['30-Day Cash Inflow (৩০ দিনের নগদ জমা)', fromMinorUnits(summary.totalInflowLast30Days)],
    ['30-Day Cash Outflow (৩০ দিনের নগদ খরচ)', fromMinorUnits(summary.totalOutflowLast30Days)],
    ['Total Registered Contacts (মোট কন্ট্যাক্ট)', summary.contactCount],
    ['Total Active Transactions (মোট সক্রিয় লেনদেন)', summary.activeTransactionCount],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'সারসংক্ষেপ (Summary)');

  // 2. People & Balances Sheet
  const peopleData = [
    [
      'Contact Name / নাম',
      'Phone / মোবাইল',
      'Category / শ্রেণী',
      'Receivable / পাওনা (৳)',
      'Payable / দেনা (৳)',
      'Net Balance / ব্যালেন্স (৳)',
      'Status / অবস্থা',
      'Overdue / বকেয়া',
      'Last Transaction / শেষ লেনদেন',
    ],
  ];

  contacts.forEach((c) => {
    const s = calculateContactBalance(c, transactions);
    const statusText =
      s.netBalance > 0
        ? 'আপনি পাবেন (Receivable)'
        : s.netBalance < 0
        ? 'আপনাকে দিতে হবে (Payable)'
        : 'পরিশোধিত (Settled)';

    peopleData.push([
      c.name,
      c.phone,
      c.category,
      fromMinorUnits(s.receivable),
      fromMinorUnits(s.payable),
      fromMinorUnits(s.netBalance),
      statusText,
      s.isOverdue ? `বকেয়া: ৳${fromMinorUnits(s.overdueAmount)}` : 'নিয়মিত',
      s.lastTransactionDate || 'N/A',
    ] as any);
  });
  const wsPeople = XLSX.utils.aoa_to_sheet(peopleData);
  XLSX.utils.book_append_sheet(wb, wsPeople, 'ব্যক্তি ও ব্যালেন্স (People)');

  // 3. Transactions Sheet
  const txData = [
    [
      'Date / তারিখ',
      'Contact Name / ব্যক্তি',
      'Type / ধরণ',
      'Amount / পরিমাণ (৳)',
      'Payment Method / মাধ্যম',
      'Category / খাত',
      'Due Date / শেষ তারিখ',
      'Invoice / Ref No',
      'Notes / নোট',
      'Status / অবস্থা',
    ],
  ];

  const contactMap = new Map(contacts.map((c) => [c.id, c.name]));
  transactions.forEach((t) => {
    txData.push([
      t.date,
      contactMap.get(t.contactId) || 'Unknown',
      t.type,
      fromMinorUnits(t.amount),
      t.paymentMethod.toUpperCase(),
      t.category,
      t.dueDate || '—',
      t.referenceNumber || '—',
      t.notes || '—',
      t.status,
    ] as any);
  });
  const wsTx = XLSX.utils.aoa_to_sheet(txData);
  XLSX.utils.book_append_sheet(wb, wsTx, 'লেনদেনের খাতা (Ledger)');

  // 4. Repayments Sheet (Only received or repaid transactions)
  const repData = [
    [
      'Date / তারিখ',
      'Contact Name / ব্যক্তি',
      'Repayment Type / পরিশোধের ধরণ',
      'Amount / পরিমাণ (৳)',
      'Payment Method / মাধ্যম',
      'Notes / নোট',
    ],
  ];

  transactions
    .filter((t) => (t.type === 'received' || t.type === 'repaid') && t.status === 'active')
    .forEach((t) => {
      repData.push([
        t.date,
        contactMap.get(t.contactId) || 'Unknown',
        t.type === 'received' ? 'টাকা পাওয়া গেছে (Customer Repaid)' : 'টাকা ফেরত দেওয়া হয়েছে (Repaid to Supplier)',
        fromMinorUnits(t.amount),
        t.paymentMethod.toUpperCase(),
        t.notes || '—',
      ] as any);
    });
  const wsRep = XLSX.utils.aoa_to_sheet(repData);
  XLSX.utils.book_append_sheet(wb, wsRep, 'পরিশোধের ইতিহাস (Repayments)');

  // Write file
  XLSX.writeFile(wb, filename);
}
