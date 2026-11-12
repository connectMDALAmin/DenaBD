import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency, calculateContactBalance, calculateExpenseSummary } from '../../services/accounting/calculator';
import {
  getExpenseCategoryLabel,
  getExpenseCategoryIcon,
  getExpenseCategoryColor,
} from '../../services/expenses/expenseCategories';
import { PlusCircle, UserPlus, BellRing, ArrowUpRight, ArrowDownLeft, AlertCircle, Clock, Wallet, TrendingDown, Layers, ChevronRight } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

interface DashboardViewProps {
  onOpenNewTransaction: (defaultType?: any) => void;
  onOpenNewContact: () => void;
  onOpenNewExpense?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewTransaction,
  onOpenNewContact,
  onOpenNewExpense,
}) => {
  const { ledgerSummary, contacts, transactions, setActiveTab, setSelectedContactId, appSettings } = useApp();
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

  // Personal Expense Summary calculation
  const expenseSummary = useMemo(() => {
    return calculateExpenseSummary(transactions, new Date(), language === 'bn' ? 'bn' : 'en');
  }, [transactions, language]);

  return (
    <div className="space-y-4">
      {/* Admin Global Announcement & Advertisement Banner on Dashboard (Real-time synced across all users) */}
      {appSettings?.announcementBanner && appSettings?.announcementText?.trim() && (
        <div className="bg-gradient-to-r from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] border-2 border-[#D97706] rounded-[4px] p-2.5 sm:p-3 xp-bevel-outset shadow-xs flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-600/40 flex items-center justify-center text-amber-800 shrink-0">
            <span className="text-base animate-pulse">📢</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="bg-[#B45309] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-2xs uppercase tracking-wide">
                {language === 'bn' ? 'বিজ্ঞাপন ও নোটিশ' : 'Announcement & Ads'}
              </span>
              <span className="text-[10px] text-amber-900 font-semibold">
                {language === 'bn' ? 'অ্যাডমিন সম্প্রচার' : 'Admin Broadcast'}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-[#78350F] font-bold leading-relaxed break-words">
              {appSettings.announcementText}
            </p>
          </div>
        </div>
      )}

      {/* Quick Action XP Ribbon */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <button
          type="button"
          onClick={() => onOpenNewTransaction()}
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
          onClick={() => {
            if (onOpenNewExpense) {
              onOpenNewExpense();
            } else {
              onOpenNewTransaction('expense');
            }
          }}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-red-700 font-semibold cursor-pointer"
        >
          <XPIcon name="expense" size={15} />
          <span>{language === 'bn' ? 'ব্যক্তিগত খরচ' : 'Add Expense'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('expenses')}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 font-semibold cursor-pointer"
        >
          <Wallet size={15} className="text-purple-600" />
          <span>{language === 'bn' ? 'খরচের খাতা' : 'Expenses'}</span>
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

      {/* Personal Expense Summary Section */}
      <div className="bg-white p-3 sm:p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-gray-200 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-50 text-red-600 rounded border border-red-200 shadow-2xs">
              <XPIcon name="expense" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-[#002570] flex items-center gap-1.5">
                <span>{language === 'bn' ? 'ব্যক্তিগত খরচের সারসংক্ষেপ' : 'Personal Expense Summary'}</span>
                <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.2 rounded-xs border border-red-300">
                  {language === 'bn' ? 'ব্যক্তিগত' : 'Personal'}
                </span>
              </h3>
              <p className="text-[11px] text-gray-500">
                {language === 'bn'
                  ? 'আজকের, চলতি মাসের ও সর্বমোট ব্যক্তিগত খরচ — খাতার দেনাপাওনার সাথে সম্পূর্ণ সম্পর্কহীন'
                  : "Today's, monthly, and yearly personal expenses (strictly isolated from customer ledger)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenNewExpense) onOpenNewExpense();
                else onOpenNewTransaction('expense');
              }}
              className="px-2.5 py-1 bg-gradient-to-b from-[#22C55E] to-[#16A34A] text-white rounded text-[11px] font-bold hover:brightness-105 cursor-pointer shadow-xs border border-green-800"
            >
              + {language === 'bn' ? 'খরচ লিখুন' : 'New Expense'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('expenses')}
              className="text-xs text-[#0055EA] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সম্পূর্ণ খরচের খাতা' : 'Full Expense Ledger'}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* 4 Expense Metric Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <div className="bg-[#FFF8F8] border border-red-200 p-2.5 rounded shadow-2xs">
            <div className="text-[11px] text-gray-600 font-medium">{language === 'bn' ? 'আজকের খরচ' : "Today's Expense"}</div>
            <div className="text-lg font-bold text-red-600 font-mono mt-0.5">
              {formatCurrency(expenseSummary.todayTotal)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{language === 'bn' ? 'আজকের দিনে' : 'Today'}</div>
          </div>

          <div className="bg-[#FFF8F8] border border-red-200 p-2.5 rounded shadow-2xs">
            <div className="text-[11px] text-gray-600 font-medium">{language === 'bn' ? 'চলতি মাসের খরচ' : "This Month's Expense"}</div>
            <div className="text-lg font-bold text-red-600 font-mono mt-0.5">
              {formatCurrency(expenseSummary.thisMonthTotal)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{language === 'bn' ? 'এই মাসে' : 'This Month'}</div>
          </div>

          <div className="bg-[#FFF8F8] border border-red-200 p-2.5 rounded shadow-2xs">
            <div className="text-[11px] text-gray-600 font-medium">{language === 'bn' ? 'চলতি বছরের খরচ' : "This Year's Expense"}</div>
            <div className="text-lg font-bold text-red-600 font-mono mt-0.5">
              {formatCurrency(expenseSummary.thisYearTotal)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{language === 'bn' ? 'এই বছরে' : 'This Year'}</div>
          </div>

          <div className="bg-[#FFF8F8] border border-red-200 p-2.5 rounded shadow-2xs">
            <div className="text-[11px] text-gray-600 font-medium">{language === 'bn' ? 'সর্বমোট খরচ' : 'All-Time Expense'}</div>
            <div className="text-lg font-bold text-gray-900 font-mono mt-0.5">
              {formatCurrency(expenseSummary.allTimeTotal)}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">{expenseSummary.recentExpenses.length} {language === 'bn' ? 'টি এন্ট্রি' : 'entries'}</div>
          </div>
        </div>

        {/* Sub-section: Top Spending Categories + Recent Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Top Spending Categories */}
          <div className="bg-[#FAFAFA] border border-gray-200 rounded p-2.5">
            <div className="text-xs font-bold text-gray-700 flex items-center justify-between pb-1.5 mb-2 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <Layers size={13} className="text-purple-600" />
                <span>{language === 'bn' ? 'শীর্ষ ব্যয়ের খাতসমূহ' : 'Top Spending Categories'}</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">
                {expenseSummary.categoryTotals.length} {language === 'bn' ? 'টি খাত' : 'categories'}
              </span>
            </div>
            {expenseSummary.categoryTotals.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-xs italic">
                {language === 'bn' ? 'এখনো কোনো খরচ রেকর্ড করা হয়নি' : 'No expenses recorded yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {expenseSummary.categoryTotals.slice(0, 4).map((cat) => (
                  <div key={cat.categoryId} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1 text-gray-800 font-medium">
                        <span>{cat.icon}</span>
                        <span className="truncate max-w-[140px] sm:max-w-[180px]">{cat.categoryLabel}</span>
                      </span>
                      <span className="font-mono font-bold text-gray-700">
                        {formatCurrency(cat.total)} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: cat.color || '#D32F2F',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Expenses List */}
          <div className="bg-[#FAFAFA] border border-gray-200 rounded p-2.5">
            <div className="text-xs font-bold text-gray-700 flex items-center justify-between pb-1.5 mb-2 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <TrendingDown size={13} className="text-red-600" />
                <span>{language === 'bn' ? 'সর্বশেষ ব্যক্তিগত খরচ' : 'Recent Expenses'}</span>
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('expenses')}
                className="text-[10px] text-blue-600 hover:underline cursor-pointer"
              >
                {language === 'bn' ? 'সব দেখুন →' : 'View all →'}
              </button>
            </div>
            {expenseSummary.recentExpenses.length === 0 ? (
              <div className="text-center py-4 text-gray-400 text-xs italic">
                {language === 'bn' ? 'কোনো সাম্প্রতিক খরচ নেই' : 'No recent expenses'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 text-xs space-y-1">
                {expenseSummary.recentExpenses.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="pt-1.5 first:pt-0 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        <span>{getExpenseCategoryIcon(tx.category || '')}</span>
                        <span>{getExpenseCategoryLabel(tx.category || '', language)}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {tx.date} • {tx.paymentMethod?.toUpperCase() || 'CASH'}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-red-600">
                      -{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                const contact = tx.contactId ? contactMap.get(tx.contactId) : undefined;
                const isExpense = tx.type === 'expense';
                const contactName = isExpense
                  ? language === 'bn'
                    ? 'ব্যক্তিগত খরচ (নিজ)'
                    : 'Personal Expense (Self)'
                  : contact?.name || 'Unknown Contact';

                const categoryDisplay = isExpense
                  ? getExpenseCategoryLabel(tx.category || '', language)
                  : tx.category;

                return (
                  <tr key={tx.id} className="hover:bg-blue-50 transition">
                    <td className="py-2 px-2 font-mono whitespace-nowrap text-gray-600">
                      {tx.date}
                    </td>
                    <td className="py-2 px-2 font-medium text-gray-900 whitespace-nowrap flex items-center gap-1.5">
                      {isExpense && (
                        <span className="text-red-500">
                          {getExpenseCategoryIcon(tx.category || '')}
                        </span>
                      )}
                      <span>{contactName}</span>
                    </td>
                    <td className="py-2 px-2 text-gray-600 whitespace-nowrap">
                      {categoryDisplay}
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
                          : 'text-[#D32F2F]'
                      }`}
                    >
                      {isExpense ? `-${formatCurrency(tx.amount)}` : formatCurrency(tx.amount)}
                      <span className="text-[10px] font-normal ml-1 opacity-75">
                        {isExpense
                          ? language === 'bn'
                            ? '(খরচ)'
                            : '(Expense)'
                          : `(${t(`label${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}` as any)})`}
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
