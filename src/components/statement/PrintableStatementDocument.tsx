import React from 'react';
import { Contact, Transaction, UserProfile } from '../../types/accounting';
import { calculateContactBalance, calculateLedgerSummary, fromMinorUnits } from '../../services/accounting/calculator';

interface PrintableStatementDocumentProps {
  userProfile: UserProfile;
  contacts: Contact[];
  transactions: Transaction[];
  targetContactId?: string | null;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export const PrintableStatementDocument: React.FC<PrintableStatementDocumentProps> = ({
  userProfile,
  contacts,
  transactions,
  targetContactId,
  dateRange,
}) => {
  const targetContact = targetContactId
    ? contacts.find((c) => c.id === targetContactId)
    : null;

  // Filter transactions
  let filteredTxs = transactions.filter((t) => t.status === 'active');
  if (targetContact) {
    filteredTxs = filteredTxs.filter((t) => t.contactId === targetContact.id);
  }
  if (dateRange?.startDate) {
    filteredTxs = filteredTxs.filter((t) => t.date >= dateRange.startDate!);
  }
  if (dateRange?.endDate) {
    filteredTxs = filteredTxs.filter((t) => t.date <= dateRange.endDate!);
  }

  // Sort chronological
  filteredTxs.sort((a, b) => (a.date > b.date ? 1 : -1));

  const contactMap = new Map<string, string>();
  contacts.forEach((c) => contactMap.set(c.id, c.name));

  const nowDhakaStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date());

  // Balance calculation
  const contactSummary = targetContact ? calculateContactBalance(targetContact, transactions) : null;
  const ledgerSummary = calculateLedgerSummary(contacts, transactions);

  let runningBalance = 0;

  return (
    <div className="printable-statement bg-white text-black p-6 sm:p-10 font-sans text-xs max-w-4xl mx-auto">
      {/* Official Header */}
      <div className="border-b-2 border-[#0055EA] pb-4 mb-5 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#003399]">
            {userProfile.businessName || 'DenaPawna Digital Ledger'}
          </h1>
          <p className="text-sm font-semibold text-gray-800 mt-0.5">
            হিসাব বিবরণী ও আর্থিক লেজার বিবরণ (Financial Statement)
          </p>
          <div className="text-gray-600 text-xs mt-1 space-y-0.5">
            <div>
              <span className="font-semibold text-gray-700">Proprietor:</span> {userProfile.ownerName}
              {userProfile.phone && <span className="ml-3"><span className="font-semibold">Phone:</span> {userProfile.phone}</span>}
            </div>
            {userProfile.address && (
              <div>
                <span className="font-semibold text-gray-700">Address:</span> {userProfile.address}
              </div>
            )}
          </div>
        </div>

        <div className="text-right text-xs text-gray-600 bg-gray-50 border border-gray-200 p-2.5 rounded-[4px]">
          <div className="font-mono font-bold text-gray-800 text-[11px]">
            STATEMENT ID: DP-{Date.now().toString(36).toUpperCase()}
          </div>
          <div className="text-[11px] mt-0.5">
            <span className="font-medium text-gray-500">Generated:</span> {nowDhakaStr}
          </div>
          <div className="text-[10px] text-gray-500 font-medium">Timezone: Asia/Dhaka (GMT+6)</div>
        </div>
      </div>

      {/* Target Subject / Contact Information */}
      {targetContact ? (
        <div className="mb-5 p-3.5 bg-blue-50/60 border border-blue-200 rounded-[4px] flex flex-wrap justify-between items-center gap-3">
          <div>
            <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
              Customer / Beneficiary Profile
            </div>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {targetContact.name}
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-medium">Phone:</span> {targetContact.phone}
              {targetContact.address && <span className="ml-3"><span className="font-medium">Address:</span> {targetContact.address}</span>}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] font-semibold text-gray-500 uppercase">
              Current Net Balance
            </div>
            <div
              className={`text-lg font-bold font-mono ${
                (contactSummary?.netBalance ?? 0) > 0
                  ? 'text-red-600'
                  : (contactSummary?.netBalance ?? 0) < 0
                  ? 'text-emerald-700'
                  : 'text-gray-800'
              }`}
            >
              BDT {fromMinorUnits(Math.abs(contactSummary?.netBalance ?? 0)).toFixed(2)}
              <span className="text-xs font-normal ml-1">
                {(contactSummary?.netBalance ?? 0) > 0
                  ? '(দেনা / Receivable)'
                  : (contactSummary?.netBalance ?? 0) < 0
                  ? '(পাওনা / Payable)'
                  : '(হিসাব পরিশোধ / Settled)'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-3 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-[4px] text-center">
          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">
              Total Receivable (মোট পাওনা)
            </div>
            <div className="text-base font-bold text-emerald-900 font-mono mt-0.5">
              BDT {fromMinorUnits(ledgerSummary.totalReceivable).toFixed(2)}
            </div>
          </div>
          <div className="p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-[11px] font-bold text-red-800 uppercase">
              Total Payable (মোট দেনা)
            </div>
            <div className="text-base font-bold text-red-900 font-mono mt-0.5">
              BDT {fromMinorUnits(ledgerSummary.totalPayable).toFixed(2)}
            </div>
          </div>
          <div className="p-2 bg-blue-50 border border-blue-200 rounded">
            <div className="text-[11px] font-bold text-blue-800 uppercase">
              Net Balance (মোট ব্যালেন্স)
            </div>
            <div className="text-base font-bold text-blue-900 font-mono mt-0.5">
              BDT {fromMinorUnits(ledgerSummary.netPosition).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Records Table */}
      <div className="mb-6 overflow-hidden">
        <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
          <thead>
            <tr className="bg-[#0055EA] text-white font-bold text-[11px]">
              <th className="border border-blue-800 px-2.5 py-1.5 w-24">Date (তারিখ)</th>
              {!targetContact && (
                <th className="border border-blue-800 px-2.5 py-1.5">Party / Contact</th>
              )}
              <th className="border border-blue-800 px-2.5 py-1.5 w-24">Type (ধরণ)</th>
              <th className="border border-blue-800 px-2.5 py-1.5">Category / Note</th>
              <th className="border border-blue-800 px-2.5 py-1.5 w-20">Ref / Voucher</th>
              <th className="border border-blue-800 px-2.5 py-1.5 w-20">Method</th>
              <th className="border border-blue-800 px-2.5 py-1.5 text-right w-24">Amount (৳)</th>
              <th className="border border-blue-800 px-2.5 py-1.5 text-right w-24">Balance (৳)</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.length === 0 ? (
              <tr>
                <td
                  colSpan={targetContact ? 7 : 8}
                  className="border border-gray-300 p-6 text-center text-gray-500 italic"
                >
                  কোন লেনদেন তথ্য পাওয়া যায়নি (No active transactions found for this statement).
                </td>
              </tr>
            ) : (
              filteredTxs.map((tx, idx) => {
                const isDebit = tx.type === 'given' || tx.type === 'repaid';
                const isCredit = tx.type === 'received' || tx.type === 'borrowed';
                const numAmount = fromMinorUnits(tx.amount);
                if (isDebit) {
                  runningBalance += numAmount;
                } else if (isCredit) {
                  runningBalance -= numAmount;
                }

                return (
                  <tr
                    key={tx.id || idx}
                    className={`border-b border-gray-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/70'
                    }`}
                  >
                    <td className="border border-gray-300 px-2 py-1 font-mono whitespace-nowrap">
                      {tx.date}
                    </td>
                    {!targetContact && (
                      <td className="border border-gray-300 px-2 py-1 font-semibold text-gray-900">
                        {contactMap.get(tx.contactId) || '—'}
                      </td>
                    )}
                    <td className="border border-gray-300 px-2 py-1 font-medium">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isDebit
                            ? 'bg-red-100 text-red-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tx.type === 'given'
                          ? 'দেনা (Given)'
                          : tx.type === 'received'
                          ? 'আদায় (Received)'
                          : tx.type === 'borrowed'
                          ? 'ধার (Borrowed)'
                          : 'পরিশোধ (Repaid)'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-gray-700">
                      <div className="font-medium">{tx.category || 'General'}</div>
                      {tx.notes && <div className="text-[10px] text-gray-500 italic">{tx.notes}</div>}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 font-mono text-[10px] text-gray-600">
                      {tx.referenceNumber || '—'}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 uppercase text-[10px] text-gray-600">
                      {tx.paymentMethod || 'cash'}
                    </td>
                    <td
                      className={`border border-gray-300 px-2 py-1 text-right font-mono font-bold ${
                        isDebit ? 'text-red-700' : 'text-emerald-700'
                      }`}
                    >
                      {numAmount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right font-mono font-bold text-gray-900">
                      {runningBalance.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Official Signatures & Verification Stamp */}
      <div className="pt-10 mt-6 border-t border-gray-300 grid grid-cols-2 gap-10 text-center text-xs">
        <div>
          <div className="w-48 mx-auto border-b border-gray-400 mb-1" />
          <div className="font-bold text-gray-800">Authorized Signature & Seal</div>
          <div className="text-[10px] text-gray-500">{userProfile.businessName}</div>
        </div>

        <div>
          <div className="w-48 mx-auto border-b border-gray-400 mb-1" />
          <div className="font-bold text-gray-800">
            {targetContact ? 'Customer / Beneficiary Signature' : 'Accountant Verification'}
          </div>
          <div className="text-[10px] text-gray-500">Signature & Date</div>
        </div>
      </div>

      {/* System Footer Stamp */}
      <div className="mt-8 pt-3 border-t border-gray-200 flex flex-wrap justify-between items-center text-[10px] text-gray-500">
        <div>
          Computer Generated Financial Document • DenaPawna Khata Pro v2.5
        </div>
        <div>
          System Architect: <strong className="text-gray-700">AL-Amin Arnob</strong>
        </div>
      </div>
    </div>
  );
};
