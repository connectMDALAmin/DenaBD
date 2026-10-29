import React, { useState } from 'react';
import { Contact, ContactCategory } from '../../types/accounting';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { calculateContactBalance, formatCurrency } from '../../services/accounting/calculator';
import { UserPlus, Search, Filter, Phone, ArrowRight, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { exportContactsToCsv } from '../../services/export/csvExport';
import { XPIcon } from '../../components/xp/XPIcon';

interface ContactListProps {
  onSelectContact: (contactId: string) => void;
  onOpenNewContact: () => void;
  onEditContact: (contact: Contact) => void;
  onAddTransaction: (contactId: string) => void;
}

export const ContactList: React.FC<ContactListProps> = ({
  onSelectContact,
  onOpenNewContact,
  onEditContact,
  onAddTransaction,
}) => {
  const { contacts, transactions } = useApp();
  const { t, language } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter contacts by query and category
  const filteredContacts = contacts.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const handleExportCsv = () => {
    exportContactsToCsv(contacts);
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenNewContact}
            className="xp-button-primary px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <UserPlus size={15} />
            <span>{t('addContact')}</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer"
          >
            <FileSpreadsheet size={15} className="text-green-700" />
            <span>{t('exportCSV')}</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[200px] sm:min-w-[280px]">
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

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1 bg-[#ECE9D8] p-1 rounded-[3px] border border-[#7F9DB9] text-xs">
        {[
          { id: 'all', label: language === 'bn' ? 'সকল' : 'All' },
          { id: 'customer', label: t('categoryCustomer') },
          { id: 'supplier', label: t('categorySupplier') },
          { id: 'friend_family', label: t('categoryFriendFamily') },
          { id: 'employee', label: t('categoryEmployee') },
          { id: 'other', label: t('categoryOther') },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-2.5 py-1 rounded-[2px] transition cursor-pointer text-xs ${
              selectedCategory === cat.id
                ? 'bg-[#0055EA] text-white font-bold'
                : 'text-gray-800 hover:bg-white/50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Contact Table */}
      <div className="bg-white rounded-[4px] border border-[#7F9DB9] xp-bevel-inset overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#ECE9D8] text-gray-800 border-b border-[#7F9DB9]">
              <tr>
                <th className="py-2 px-3 font-semibold">{t('contactName')}</th>
                <th className="py-2 px-3 font-semibold">{t('category')}</th>
                <th className="py-2 px-3 font-semibold">{t('contactPhone')}</th>
                <th className="py-2 px-3 font-semibold text-right">{t('receivables')}</th>
                <th className="py-2 px-3 font-semibold text-right">{t('payables')}</th>
                <th className="py-2 px-3 font-semibold text-right">{t('netPosition')}</th>
                <th className="py-2 px-3 font-semibold text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 italic">
                    {language === 'bn'
                      ? 'কোনো কন্ট্যাক্ট পাওয়া যায়নি।'
                      : 'No contacts found.'}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  const summary = calculateContactBalance(contact, transactions);
                  return (
                    <tr
                      key={contact.id}
                      onClick={() => onSelectContact(contact.id)}
                      className="hover:bg-blue-50 transition cursor-pointer"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-gray-900">{contact.name}</div>
                        {contact.address && (
                          <div className="text-[10px] text-gray-500 truncate max-w-[200px]">
                            {contact.address}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200">
                          {contact.category.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono whitespace-nowrap text-gray-700">
                        {contact.phone}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums text-[#0055EA]">
                        {summary.receivable > 0 ? formatCurrency(summary.receivable) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums text-[#D32F2F]">
                        {summary.payable > 0 ? formatCurrency(summary.payable) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums">
                        <span
                          className={
                            summary.netBalance > 0
                              ? 'text-[#0055EA]'
                              : summary.netBalance < 0
                              ? 'text-[#D32F2F]'
                              : 'text-gray-500'
                          }
                        >
                          {formatCurrency(Math.abs(summary.netBalance))}
                          {summary.netBalance > 0
                            ? ' (পাওনা)'
                            : summary.netBalance < 0
                            ? ' (দেনা)'
                            : ''}
                        </span>
                        {summary.isOverdue && (
                          <span className="block text-[10px] text-red-600 font-bold">
                            ⚠️ Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onAddTransaction(contact.id)}
                            className="xp-button px-2 py-0.5 text-[10px] text-[#0055EA] font-semibold cursor-pointer"
                            title="Add Entry"
                          >
                            + হিসাব
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectContact(contact.id)}
                            className="xp-button px-2 py-0.5 text-[10px] text-gray-800 cursor-pointer"
                            title="View Ledger"
                          >
                            বিস্তারিত →
                          </button>
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
