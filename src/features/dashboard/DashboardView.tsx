import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency, calculateContactBalance } from '../../services/accounting/calculator';
import { PlusCircle, UserPlus, BellRing, ArrowUpRight, ArrowDownLeft, AlertCircle, Clock } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

interface DashboardViewProps {
  onOpenNewTransaction: () => void;
  onOpenNewContact: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
  onOpenNewContact,
}) => {
  const { ledgerSummary, contacts, transactions, setActiveTab, setSelectedContactId } = useApp();
  const { t, language } = useI18n();

  // Top Debtors (Customers who owe user most)
  const contactSummaries = contacts.map((c) => calculateContactBalance(c, transactions));
  const topDebtors = [...contactSummaries]
    .filter((s) => s.receivable > 0)
    .sort((a, b) => b.receivable - a.receivable)
    .slice(0, 4);

  // Top Creditors (Suppliers user owes most)
  const topCreditors = [...contactSummaries]
    .filter((s) => s.payable > 0)
    .sort((a, b) => b.payable - a.payable)
    .slice(0, 4);

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, 5);

  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  return (
    <div className="space-y-4">
      {/* Quick Action XP Ribbon */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <button
          type="button"
          onClick={onOpenNewTransaction}
          className="xp-button-primary px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <PlusCircle size={15} />
          <span>{t('addTransaction')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenNewContact}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 font-semibold cursor-pointer"
        >
          <UserPlus size={15} />
          <span>{t('addContact')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reminders')}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-amber-900 font-semibold cursor-pointer"
        >
          <BellRing size={15} className="text-amber-600" />
          <span>{t('navReminders')}</span>
          {ledgerSummary.totalOverdueReceivable > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-600" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 font-semibold cursor-pointer ml-auto"
        >
          <XPIcon name="analytics" size={15} />
          <span>{t('navAnalytics')}</span>
        </button>
      </div>

      {/* Overdue Warning Alert if any */}
      {ledgerSummary.totalOverdueReceivable > 0 && (
        <div className="bg-[#FFF4E5] border border-[#FFB74D] rounded-[4px] p-3 flex items-center justify-between text-xs text-[#E65100]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0 text-[#F57C00]" />
            <span>
              <strong>{t('overdueReceivable')}:</strong>{' '}
              {formatCurrency(ledgerSummary.totalOverdueReceivable)} {t('overdueDays')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className="xp-button px-2.5 py-1 text-xs text-[#E65100] font-bold cursor-pointer"
          >
            {t('sendWhatsApp')}
          </button>
        </div>
      )}

      {/* 4 Key Accounting Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Receivables Card */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600 font-medium">{t('receivables')}</span>
            <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-700">
              <ArrowDownLeft size={15} />
            </div>
          </div>
          <div className="text-xl font-bold text-[#0055EA] font-mono tabular-nums mt-1">
            {formatCurrency(ledgerSummary.totalReceivable)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {t('theyOweYou')} ({topDebtors.length} {language === 'bn' ? 'গ্রাহক' : 'clients'})
          </div>
        </div>

        {/* Payables Card */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600 font-medium">{t('payables')}</span>
            <div className="w-6 h-6 rounded bg-red-100 flex items-center justify-center text-red-700">
              <ArrowUpRight size={15} />
            </div>
          </div>
          <div className="text-xl font-bold text-[#D32F2F] font-mono tabular-nums mt-1">
            {formatCurrency(ledgerSummary.totalPayable)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {t('youOweThem')} ({topCreditors.length} {language === 'bn' ? 'মহাজন' : 'vendors'})
          </div>
        </div>

        {/* Net Position Card */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600 font-medium">{t('netPosition')}</span>
            <div
              className={`w-6 h-6 rounded flex items-center justify-center ${
                ledgerSummary.netPosition >= 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}
            >
              <XPIcon name="money" size={15} />
            </div>
          </div>
          <div
            className={`text-xl font-bold font-mono tabular-nums mt-1 ${
              ledgerSummary.netPosition >= 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'
            }`}
          >
            {formatCurrency(ledgerSummary.netPosition)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {ledgerSummary.netPosition >= 0
              ? language === 'bn'
                ? 'পাওনার পাল্লা ভারী'
                : 'Net Surplus'
              : language === 'bn'
                ? 'দেনার পাল্লা ভারী'
                : 'Net Payable'}
          </div>
        </div>

        {/* 30 Days Cash Inflow */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-600 font-medium">{t('cashInflow')}</span>
            <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-700">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-xl font-bold text-[#6A1B9A] font-mono tabular-nums mt-1">
            {formatCurrency(ledgerSummary.totalInflowLast30Days)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            {t('cashOutflow')}: {formatCurrency(ledgerSummary.totalOutflowLast30Days)}
          </div>
        </div>
      </div>

      {/* Two-Column Split: Top Debtors vs Top Creditors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Debtors */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
            <div className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
              <XPIcon name="contact" size={16} />
              <span>{language === 'bn' ? 'শীর্ষ বাকিদার / দেনাদার (Debtors)' : 'Top Debtors (Receivables)'}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className="text-[11px] text-[#0055EA] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'সব দেখুন →' : 'View All →'}
            </button>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {topDebtors.length === 0 ? (
              <div className="text-center py-4 text-gray-400 italic">
                {language === 'bn' ? 'কোনো বাকিদার নেই' : 'No outstanding debtors'}
              </div>
            ) : (
              topDebtors.map((item) => (
                <div
                  key={item.contact.id}
                  onClick={() => {
                    setSelectedContactId(item.contact.id);
                    setActiveTab('contacts');
                  }}
                  className="py-2 flex items-center justify-between hover:bg-blue-50 px-1 rounded cursor-pointer transition"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{item.contact.name}</div>
                    <div className="text-[11px] text-gray-500">{item.contact.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#0055EA] font-mono tabular-nums">
                      {formatCurrency(item.receivable)}
                    </div>
                    {item.isOverdue && (
                      <span className="text-[10px] text-red-600 font-bold">
                        {language === 'bn' ? 'মেয়াদ শেষ' : 'Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Creditors */}
        <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
            <div className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
              <XPIcon name="contact" size={16} />
              <span>{language === 'bn' ? 'শীর্ষ পাওনাদার / মহাজন (Creditors)' : 'Top Creditors (Payables)'}</span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className="text-[11px] text-[#0055EA] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'সব দেখুন →' : 'View All →'}
            </button>
          </div>
          <div className="divide-y divide-gray-100 text-xs">
            {topCreditors.length === 0 ? (
              <div className="text-center py-4 text-gray-400 italic">
                {language === 'bn' ? 'কোনো মহাজন বাকি নেই' : 'No outstanding payables'}
              </div>
            ) : (
              topCreditors.map((item) => (
                <div
                  key={item.contact.id}
                  onClick={() => {
                    setSelectedContactId(item.contact.id);
                    setActiveTab('contacts');
                  }}
                  className="py-2 flex items-center justify-between hover:bg-red-50 px-1 rounded cursor-pointer transition"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{item.contact.name}</div>
                    <div className="text-[11px] text-gray-500">{item.contact.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#D32F2F] font-mono tabular-nums">
                      {formatCurrency(item.payable)}
                    </div>
                    <div className="text-[10px] text-gray-500">{item.contact.category}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Register */}
      <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
          <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
            <XPIcon name="money" size={16} />
            <span>{t('transactionHistory')}</span>
          </h3>
          <button
            type="button"
            onClick={() => setActiveTab('ledger')}
            className="text-[11px] text-[#0055EA] hover:underline cursor-pointer"
          >
            {language === 'bn' ? 'পুরো খাতা দেখুন →' : 'View Full Ledger →'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#ECE9D8] text-gray-700 border-b border-[#7F9DB9]">
              <tr>
                <th className="py-1.5 px-2 font-semibold">{t('date')}</th>
                <th className="py-1.5 px-2 font-semibold">{t('contactName')}</th>
                <th className="py-1.5 px-2 font-semibold">{t('category')}</th>
                <th className="py-1.5 px-2 font-semibold">{t('paymentMethod')}</th>
                <th className="py-1.5 px-2 font-semibold text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((tx) => {
                const contact = contactMap.get(tx.contactId);
                const isPositiveForUser = tx.type === 'received' || tx.type === 'borrowed';
                return (
                  <tr key={tx.id} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 font-mono whitespace-nowrap text-gray-600">
                      {tx.date}
                    </td>
                    <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap">
                      {contact?.name || 'Unknown Contact'}
                    </td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 border border-gray-300">
                        {tx.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`py-2 px-2 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                        tx.type === 'given'
                          ? 'text-[#0055EA]'
                          : tx.type === 'received'
                          ? 'text-[#2E7D32]'
                          : tx.type === 'borrowed'
                          ? 'text-[#E65100]'
                          : 'text-[#C62828]'
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                      <span className="text-[10px] font-normal ml-1 opacity-75">
                        ({t(`label${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}` as any)})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
