import React, { useState, useRef } from 'react';
import { Contact, ContactCategory } from '../../types/accounting';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { calculateContactBalance, formatCurrency } from '../../services/accounting/calculator';
import { UserPlus, Search, Filter, Phone, ArrowRight, AlertCircle, FileSpreadsheet, Upload, Download, CheckCircle2 } from 'lucide-react';
import { exportContactsToCsv, exportContactsToJson, parseContactsFromFile } from '../../services/export/csvExport';
import { XPIcon } from '../../components/xp/XPIcon';
import { soundService } from '../../services/sound/soundService';

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
  const { contacts, transactions, saveContact } = useApp();
  const { t, language } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadMessage, setUploadMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter contacts by query and category with enhanced name and phone matching
  const filteredContacts = contacts.filter((c) => {
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const digitsOnlyQ = q.replace(/[^0-9]/g, '');
    const digitsOnlyPhone = c.phone.replace(/[^0-9]/g, '');

    const matchesName = c.name.toLowerCase().includes(q);
    const matchesPhone =
      c.phone.toLowerCase().includes(q) ||
      (digitsOnlyQ.length > 0 && digitsOnlyPhone.includes(digitsOnlyQ));
    const matchesAddress = c.address ? c.address.toLowerCase().includes(q) : false;
    const matchesNotes = c.notes ? c.notes.toLowerCase().includes(q) : false;

    return matchesCategory && (matchesName || matchesPhone || matchesAddress || matchesNotes);
  });

  const handleExportCsv = () => {
    soundService.playClick();
    exportContactsToCsv(contacts);
  };

  const handleExportJson = () => {
    soundService.playClick();
    exportContactsToJson(contacts);
  };

  const handleTriggerUpload = () => {
    soundService.playClick();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseContactsFromFile(text, file.name);
        if (parsed.length === 0) {
          setUploadMessage({
            type: 'error',
            text: language === 'bn' ? 'ফাইল থেকে কোনো কন্ট্যাক্ট পড়া যায়নি। অনুগ্রহ করে CSV বা JSON ফরম্যাট নিশ্চিত করুন।' : 'No contacts found in file. Ensure valid CSV or JSON format.',
          });
          return;
        }

        let addedCount = 0;
        parsed.forEach((c) => {
          saveContact(c);
          addedCount++;
        });

        soundService.playClick();
        setUploadMessage({
          type: 'success',
          text: language === 'bn' ? `সফলভাবে ${addedCount} টি কন্ট্যাক্ট আপলোড করা হয়েছে!` : `Successfully uploaded ${addedCount} contacts!`,
        });

        setTimeout(() => setUploadMessage(null), 5000);
      } catch (err) {
        setUploadMessage({
          type: 'error',
          text: language === 'bn' ? 'ফাইল প্রসেসিং এ ত্রুটি হয়েছে।' : 'Error parsing uploaded file.',
        });
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Upload Notification Message */}
      {uploadMessage && (
        <div
          className={`p-2.5 rounded text-xs flex items-center gap-2 border animate-in fade-in duration-150 ${
            uploadMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {uploadMessage.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{uploadMessage.text}</span>
        </div>
      )}

      {/* Primary Top Search & Quick Filter Input Field */}
      <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Live Search Input with Quick Clear Button */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0055EA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'নাম বা ফোন নম্বর দিয়ে কন্ট্যাক্ট খুঁজুন... (যেমন: রফিক, 017...)'
                  : 'Quick search contacts by name or phone number... (e.g. John, 017...)'
              }
              className="w-full pl-8 pr-8 py-1.5 bg-[#F9F9F9] focus:bg-white border border-[#7F9DB9] rounded-[2px] text-xs outline-none focus:ring-1 focus:ring-[#0055EA] placeholder:text-gray-400 font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setSearchQuery('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold p-0.5 cursor-pointer"
                title={language === 'bn' ? 'অনুসন্ধান মুছুন' : 'Clear search'}
              >
                ✕
              </button>
            )}
          </div>

          {/* Contact Count & Results Badge */}
          <div className="flex items-center gap-2 shrink-0 text-xs justify-end">
            <span className="font-mono text-[11px] font-bold px-2 py-1 rounded bg-[#EBF3FF] border border-[#B8D7FF] text-[#0047BA]">
              {language === 'bn'
                ? `${contacts.length} টির মধ্যে ${filteredContacts.length} টি কন্ট্যাক্ট`
                : `${filteredContacts.length} of ${contacts.length} Contacts`}
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1 border-t border-gray-100">
          <span className="text-[11px] font-semibold text-gray-500 mr-1 flex items-center gap-1">
            <Filter size={12} className="text-gray-400" />
            <span>{language === 'bn' ? 'ক্যাটাগরি:' : 'Filter:'}</span>
          </span>
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
              onClick={() => {
                soundService.playClick();
                setSelectedCategory(cat.id);
              }}
              className={`px-2 py-0.5 rounded-[2px] transition cursor-pointer text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-[#0055EA] text-white font-bold shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="ml-auto text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'ফিল্টার রিসেট' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#ECE9D8] border border-[#7F9DB9] rounded-[4px] xp-bevel-outset">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Add Contact */}
          <button
            type="button"
            onClick={onOpenNewContact}
            className="xp-button-primary px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <UserPlus size={15} />
            <span>{t('addContact')}</span>
          </button>

          {/* Upload Contacts (CSV / JSON) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleTriggerUpload}
            title={language === 'bn' ? 'CSV বা JSON ফাইল থেকে কন্ট্যাক্ট আপলোড করুন' : 'Upload contacts from CSV or JSON file'}
            className="xp-button px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-blue-900 font-semibold cursor-pointer"
          >
            <Upload size={14} className="text-blue-700" />
            <span>{language === 'bn' ? 'কন্ট্যাক্ট আপলোড' : 'Upload Contacts'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Export contacts to CSV"
            className="xp-button px-2.5 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-green-700" />
            <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            title="Export contacts to JSON"
            className="xp-button px-2 py-1.5 flex items-center gap-1 text-xs text-gray-700 cursor-pointer"
          >
            <Download size={13} className="text-amber-700" />
            <span>JSON</span>
          </button>
        </div>
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
                  <td colSpan={7} className="py-10 text-center text-gray-500 italic">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={22} className="text-gray-400" />
                      <p className="text-xs">
                        {searchQuery
                          ? language === 'bn'
                            ? `"${searchQuery}" এর সাথে মিলে এমন কোনো কন্ট্যাক্ট পাওয়া যায়নি।`
                            : `No contacts found matching "${searchQuery}".`
                          : language === 'bn'
                          ? 'কোনো কন্ট্যাক্ট পাওয়া যায়নি।'
                          : 'No contacts found.'}
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            soundService.playClick();
                            setSearchQuery('');
                          }}
                          className="xp-button px-2.5 py-1 text-xs text-blue-700 font-semibold cursor-pointer"
                        >
                          {language === 'bn' ? 'অনুসন্ধান রিসেট করুন' : 'Clear search filter'}
                        </button>
                      )}
                    </div>
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
