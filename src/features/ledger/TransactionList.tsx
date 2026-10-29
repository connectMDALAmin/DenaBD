import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types/accounting';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency, fromMinorUnits } from '../../services/accounting/calculator';
import { exportTransactionsToCsv } from '../../services/export/csvExport';
import { PlusCircle, Search, FileSpreadsheet, Printer, Filter } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

interface TransactionListProps {
  onOpenNewTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onSelectContact: (contactId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  onOpenNewTransaction,
  onEditTransaction,
  onSelectContact,
}) => {
  const { transactions, contacts, cancelTransaction, openPrintModal } = useApp();
  const { t, language } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_month'>('all');

  const contactMap = new Map(contacts.map((c) => [c.id, c]));

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const filteredTransactions = transactions
    .filter((tx) => {
      const matchesType = selectedType === 'all' || tx.type === selectedType;

      let matchesDate = true;
      if (dateFilter === 'today') {
        matchesDate = tx.date === todayStr;
      } else if (dateFilter === 'this_month') {
        matchesDate = tx.date.startsWith(thisMonthStr);
      }

      const contact = contactMap.get(tx.contactId);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (contact && contact.name.toLowerCase().includes(q)) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.referenceNumber && tx.referenceNumber.toLowerCase().includes(q)) ||
        (tx.notes && tx.notes.toLowerCase().includes(q));

      return matchesType && matchesDate && matchesSearch;
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  const handleExportCsv = () => {
    exportTransactionsToCsv(filteredTransactions, contacts);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="xp-button-primary px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>{t('addTransaction')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-green-700" />
            <span>{t('exportCSV')}</span>
          </button>

          <button
            type="button"
            onClick={() => openPrintModal()}
            className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer"
          >
            <Printer size={15} />
            <span>{t('printStatement')}</span>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative min-w-[200px] sm:min-w-[260px]">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full pl-8 pr-3 py-1 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none focus:ring-1 focus:ring-[#0055EA]"
          />
        </div>
      </div>

      {/* Filter Segmented Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#ECE9D8] p-1.5 rounded-[3px] border border-[#7F9DB9] text-xs">
        <div className="flex items-center gap-1">
          {[
            { id: 'all', label: language === 'bn' ? 'সকল লেনদেন' : 'All Entries' },
            { id: 'given', label: t('labelGiven') },
            { id: 'received', label: t('labelReceived') },
            { id: 'borrowed', label: t('labelBorrowed') },
            { id: 'repaid', label: t('labelRepaid') },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedType(item.id)}
              className={`px-2.5 py-1 rounded-[2px] transition cursor-pointer text-xs ${
                selectedType === item.id
                  ? 'bg-[#0055EA] text-white font-bold shadow-xs'
                  : 'text-gray-800 hover:bg-white/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDateFilter('all')}
            className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
              dateFilter === 'all' ? 'bg-white font-bold border border-gray-400' : 'text-gray-600'
            }`}
          >
            All Dates
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('today')}
            className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
              dateFilter === 'today' ? 'bg-white font-bold border border-gray-400' : 'text-gray-600'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDateFilter('this_month')}
            className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
              dateFilter === 'this_month' ? 'bg-white font-bold border border-gray-400' : 'text-gray-600'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Transactions Register Table */}
      <div className="bg-white rounded-[4px] border border-[#7F9DB9] xp-bevel-inset overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#ECE9D8] text-gray-800 border-b border-[#7F9DB9]">
              <tr>
                <th className="py-2 px-3 font-semibold">{t('date')}</th>
                <th className="py-2 px-3 font-semibold">{t('contactName')}</th>
                <th className="py-2 px-3 font-semibold">{t('category')}</th>
                <th className="py-2 px-3 font-semibold">{t('paymentMethod')}</th>
                <th className="py-2 px-3 font-semibold">{t('dueDate')}</th>
                <th className="py-2 px-3 font-semibold text-right">{t('amount')}</th>
                <th className="py-2 px-3 font-semibold text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 italic">
                    {language === 'bn'
                      ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি।'
                      : 'No ledger transactions match this criteria.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const contact = contactMap.get(tx.contactId);
                  const isCancelled = tx.status === 'cancelled';
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-blue-50 transition ${
                        isCancelled ? 'opacity-40 line-through bg-gray-50' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap text-gray-700">
                        {tx.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectContact(tx.contactId)}
                          className="font-bold text-[#0055EA] hover:underline text-left cursor-pointer"
                        >
                          {contact?.name || 'Unknown Contact'}
                        </button>
                        {tx.referenceNumber && (
                          <div className="text-[10px] text-gray-500 font-mono">
                            Ref: {tx.referenceNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">
                        {tx.category}
                        {tx.notes && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[180px]">
                            {tx.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 border border-gray-300">
                          {tx.paymentMethod.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono text-gray-600">
                        {tx.dueDate ? (
                          <span
                            className={
                              tx.dueDate < todayStr && !isCancelled ? 'text-red-600 font-bold' : ''
                            }
                          >
                            {tx.dueDate}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
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
                        <span className="block text-[10px] font-normal opacity-75">
                          {t(`label${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}` as any)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditTransaction(tx)}
                            className="text-[11px] text-blue-700 hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Cancel this ledger entry?')) {
                                  cancelTransaction(tx.id);
                                }
                              }}
                              className="text-[11px] text-red-600 hover:underline cursor-pointer"
                            >
                              Void
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
