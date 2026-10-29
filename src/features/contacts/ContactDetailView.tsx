import React, { useState } from 'react';
import { Contact, Transaction } from '../../types/accounting';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { calculateContactBalance, formatCurrency, fromMinorUnits } from '../../services/accounting/calculator';
import { buildWhatsAppLink, buildSmsLink } from '../../services/reminders/reminderEngine';
import { exportContactPdfStatement } from '../../services/export/pdfExport';
import { PlusCircle, MessageSquare, PhoneCall, Printer, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

interface ContactDetailViewProps {
  contact: Contact;
  onBack: () => void;
  onEdit: () => void;
  onAddTransaction: (preselectedContactId: string) => void;
}

export const ContactDetailView: React.FC<ContactDetailViewProps> = ({
  contact,
  onBack,
  onEdit,
  onAddTransaction,
}) => {
  const { transactions, userProfile, deleteContact, cancelTransaction, openPrintModal } = useApp();
  const { t, language } = useI18n();
  const [filterType, setFilterType] = useState<string>('all');

  const summary = calculateContactBalance(contact, transactions);
  const contactTransactions = transactions
    .filter((tx) => tx.contactId === contact.id)
    .sort((a, b) => (b.date > a.date ? 1 : -1));

  const filteredTransactions =
    filterType === 'all'
      ? contactTransactions
      : contactTransactions.filter((tx) => tx.type === filterType);

  const handleDelete = () => {
    if (
      confirm(
        language === 'bn'
          ? `আপনি কি নিশ্চিতভাবে "${contact.name}" কন্ট্যাক্টটি মুছতে চান?`
          : `Are you sure you want to delete contact "${contact.name}"?`
      )
    ) {
      deleteContact(contact.id);
      onBack();
    }
  };

  const handlePrint = () => {
    openPrintModal(contact.id);
  };

  const whatsAppLink = buildWhatsAppLink(
    contact,
    summary.receivable > 0 ? summary.receivable : 0,
    summary.lastTransactionDate || new Date().toISOString().split('T')[0],
    userProfile.businessName,
    language
  );

  const smsLink = buildSmsLink(
    contact,
    summary.receivable > 0 ? summary.receivable : 0,
    summary.lastTransactionDate || new Date().toISOString().split('T')[0],
    userProfile.businessName,
    language
  );

  return (
    <div className="space-y-4">
      {/* Top Header with Back Button and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <button
          type="button"
          onClick={onBack}
          className="xp-button px-3 py-1 flex items-center gap-1.5 text-xs text-gray-800 font-semibold cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>{language === 'bn' ? 'কন্ট্যাক্ট তালিকায় ফিরে যান' : 'Back to Contacts'}</span>
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => onAddTransaction(contact.id)}
            className="xp-button-primary px-3 py-1 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>{t('addTransaction')}</span>
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="xp-button px-2.5 py-1 flex items-center gap-1 text-xs text-gray-700 cursor-pointer"
          >
            <Edit size={13} />
            <span>{t('edit')}</span>
          </button>

          <button
            type="button"
            onClick={() => exportContactPdfStatement(contact, transactions, userProfile)}
            className="xp-button px-2.5 py-1 flex items-center gap-1 text-xs text-blue-900 font-semibold cursor-pointer"
            title="Download PDF Statement"
          >
            <Printer size={13} className="text-blue-600" />
            <span>PDF</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="xp-button px-2.5 py-1 flex items-center gap-1 text-xs text-gray-700 cursor-pointer"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">{t('printStatement')}</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="xp-button px-2 py-1 text-xs text-red-600 cursor-pointer hover:bg-red-100"
            title="Delete Contact"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Contact Profile Summary Card */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-[4px] bg-[#E5F0FF] border border-[#7F9DB9] flex items-center justify-center shrink-0">
              <XPIcon name="contact" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">{contact.name}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 border border-blue-200">
                  {contact.category.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-600 font-mono mt-0.5">
                📞 {contact.phone} {contact.email && `• ✉️ ${contact.email}`}
              </div>
              {contact.address && (
                <div className="text-xs text-gray-500 mt-0.5">📍 {contact.address}</div>
              )}
            </div>
          </div>

          {/* Balance Spotlight */}
          <div className="p-3 rounded-[4px] bg-[#F5F8FF] border border-[#7F9DB9] text-right min-w-[200px]">
            <span className="text-[11px] text-gray-600 font-medium block">
              {summary.netBalance > 0
                ? t('theyOweYou')
                : summary.netBalance < 0
                ? t('youOweThem')
                : t('settled')}
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                summary.netBalance > 0
                  ? 'text-[#0055EA]'
                  : summary.netBalance < 0
                  ? 'text-[#D32F2F]'
                  : 'text-gray-700'
              }`}
            >
              {formatCurrency(Math.abs(summary.netBalance))}
            </div>
            {summary.isOverdue && (
              <span className="text-[11px] text-red-600 font-bold block mt-0.5">
                ⚠️ {formatCurrency(summary.overdueAmount)} {t('overdueDays')}
              </span>
            )}
          </div>
        </div>

        {/* Quick Reminder Dispatch Strip */}
        {summary.receivable > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-600 font-medium mr-1">
              {language === 'bn' ? 'তাকিদা পাঠান:' : 'Send Reminders:'}
            </span>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="xp-button px-3 py-1 flex items-center gap-1.5 text-[#1B5E20] font-semibold bg-green-50 hover:bg-green-100 border-green-600 cursor-pointer"
            >
              <MessageSquare size={14} className="text-green-600" />
              <span>{t('sendWhatsApp')}</span>
            </a>
            <a
              href={smsLink}
              className="xp-button px-3 py-1 flex items-center gap-1.5 text-blue-900 font-semibold cursor-pointer"
            >
              <PhoneCall size={14} className="text-blue-600" />
              <span>{t('sendSMS')}</span>
            </a>
          </div>
        )}
      </div>

      {/* Filter Tabs for Transactions */}
      <div className="flex items-center gap-1 bg-[#ECE9D8] p-1 rounded-[3px] border border-[#7F9DB9] text-xs">
        {['all', 'given', 'received', 'borrowed', 'repaid'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFilterType(type)}
            className={`px-3 py-1 rounded-[2px] transition cursor-pointer ${
              filterType === type
                ? 'bg-[#0055EA] text-white font-bold shadow-xs'
                : 'text-gray-800 hover:bg-white/50'
            }`}
          >
            {type === 'all'
              ? language === 'bn'
                ? 'সকল হিসাব'
                : 'All Entries'
              : t(`type${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
          </button>
        ))}
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white rounded-[4px] border border-[#7F9DB9] xp-bevel-inset overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#ECE9D8] text-gray-800 border-b border-[#7F9DB9]">
              <tr>
                <th className="py-2 px-3 font-semibold">{t('date')}</th>
                <th className="py-2 px-3 font-semibold">{t('category')}</th>
                <th className="py-2 px-3 font-semibold">{t('notes')}</th>
                <th className="py-2 px-3 font-semibold">{t('dueDate')}</th>
                <th className="py-2 px-3 font-semibold">{t('paymentMethod')}</th>
                <th className="py-2 px-3 font-semibold text-right">{t('amount')}</th>
                <th className="py-2 px-3 font-semibold text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 italic">
                    {language === 'bn'
                      ? 'এই ক্যাটাগরিতে কোনো লেনদেন পাওয়া যায়নি।'
                      : 'No transactions found for this selection.'}
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-blue-50 transition ${
                      tx.status === 'cancelled' ? 'opacity-40 line-through bg-gray-50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono whitespace-nowrap text-gray-700">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-medium text-gray-900">
                      {tx.category}
                      {tx.referenceNumber && (
                        <span className="block text-[10px] text-gray-500 font-mono">
                          Ref: {tx.referenceNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 max-w-[200px] truncate">
                      {tx.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-gray-600 font-mono">
                      {tx.dueDate ? (
                        <span
                          className={
                            tx.dueDate < new Date().toISOString().split('T')[0] && tx.status === 'active'
                              ? 'text-red-600 font-bold'
                              : ''
                          }
                        >
                          {tx.dueDate}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 border border-gray-300">
                        {tx.paymentMethod.toUpperCase()}
                      </span>
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
                      {tx.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Cancel / Void this transaction?')) {
                              cancelTransaction(tx.id);
                            }
                          }}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
