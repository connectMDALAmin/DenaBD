import React, { useState, useEffect } from 'react';
import { Contact, ContactCategory } from '../../types/accounting';
import { useI18n } from '../../i18n/I18nContext';
import { toMinorUnits, fromMinorUnits } from '../../services/accounting/calculator';
import { XPTitleBar } from '../../components/xp/XPTitleBar';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialContact?: Contact | null;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContact,
}) => {
  const { t, language } = useI18n();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<ContactCategory>('customer');
  const [openingBalanceVal, setOpeningBalanceVal] = useState<string>('0');
  const [balanceDirection, setBalanceDirection] = useState<'receivable' | 'payable'>('receivable');
  const [publicLookupEnabled, setPublicLookupEnabled] = useState(true);
  const [publicAccessToken, setPublicAccessToken] = useState('');
  const [reminderPreference, setReminderPreference] = useState<'whatsapp' | 'sms' | 'both' | 'none'>('whatsapp');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name);
      setPhone(initialContact.phone);
      setEmail(initialContact.email || '');
      setAddress(initialContact.address || '');
      setCategory(initialContact.category);
      const rawDec = fromMinorUnits(Math.abs(initialContact.openingBalance));
      setOpeningBalanceVal(rawDec ? String(rawDec) : '0');
      setBalanceDirection(initialContact.openingBalance < 0 ? 'payable' : 'receivable');
      setPublicLookupEnabled(initialContact.publicLookupEnabled);
      setPublicAccessToken(initialContact.publicAccessToken || '');
      setReminderPreference(initialContact.reminderPreference || 'whatsapp');
      setNotes(initialContact.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setCategory('customer');
      setOpeningBalanceVal('0');
      setBalanceDirection('receivable');
      setPublicLookupEnabled(true);
      // Auto-generate a 4-digit token
      setPublicAccessToken(String(Math.floor(1000 + Math.random() * 9000)));
      setReminderPreference('whatsapp');
      setNotes('');
    }
  }, [initialContact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কন্ট্যাক্টের নাম লিখুন' : 'Please enter contact name');
      return;
    }
    if (!phone.trim()) {
      alert(language === 'bn' ? 'মোবাইল নম্বর আবশ্যক' : 'Phone number is required');
      return;
    }

    const decVal = parseFloat(openingBalanceVal) || 0;
    const minorUnits = toMinorUnits(decVal);
    const signedBalance = balanceDirection === 'payable' ? -minorUnits : minorUnits;

    onSave({
      id: initialContact?.id,
      userId: initialContact?.userId || 'user_main_01',
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      category,
      openingBalance: signedBalance,
      publicLookupEnabled,
      publicAccessToken: publicAccessToken.trim() || undefined,
      reminderPreference,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs">
        {/* Title Bar */}
        <XPTitleBar
          title={initialContact ? t('editContact') : t('addContact')}
          iconName="contact"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('contactName')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. মোঃ করিম হোসেন"
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none focus:ring-1 focus:ring-[#0055EA]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('contactPhone')} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8801XXXXXXXXX"
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs font-mono outline-none focus:ring-1 focus:ring-[#0055EA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ContactCategory)}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              >
                <option value="customer">{t('categoryCustomer')}</option>
                <option value="supplier">{t('categorySupplier')}</option>
                <option value="friend_family">{t('categoryFriendFamily')}</option>
                <option value="employee">{t('categoryEmployee')}</option>
                <option value="other">{t('categoryOther')}</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('contactEmail')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="optional@email.com"
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('contactAddress')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. চকবাজার, ঢাকা"
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
            />
          </div>

          {/* Opening Balance */}
          <div className="p-2.5 bg-white border border-[#7F9DB9] rounded-[3px] xp-bevel-inset">
            <span className="font-semibold text-gray-800 block mb-1">
              {t('openingBalance')} (৳)
            </span>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={openingBalanceVal}
                onChange={(e) => setOpeningBalanceVal(e.target.value)}
                className="w-1/2 px-2 py-1 bg-white border border-gray-300 text-xs font-mono tabular-nums"
              />
              <select
                value={balanceDirection}
                onChange={(e) => setBalanceDirection(e.target.value as any)}
                className="w-1/2 px-2 py-1 bg-gray-50 border border-gray-300 text-xs font-medium"
              >
                <option value="receivable">
                  {language === 'bn' ? 'পাওনা (সে দেবে)' : 'Receivable (They owe you)'}
                </option>
                <option value="payable">
                  {language === 'bn' ? 'দেনা (আপনি দেবেন)' : 'Payable (You owe them)'}
                </option>
              </select>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{t('openingBalanceHelp')}</p>
          </div>

          {/* Public Lookup & Security Token */}
          <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-[3px]">
            <div className="flex items-center gap-2 mb-1.5">
              <input
                type="checkbox"
                id="publicLookupEnabled"
                checked={publicLookupEnabled}
                onChange={(e) => setPublicLookupEnabled(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-[#0055EA]"
              />
              <label htmlFor="publicLookupEnabled" className="font-semibold text-blue-900 cursor-pointer">
                {t('publicLookupAllowed')}
              </label>
            </div>
            {publicLookupEnabled && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-gray-600">Access PIN / Token:</span>
                <input
                  type="text"
                  maxLength={6}
                  value={publicAccessToken}
                  onChange={(e) => setPublicAccessToken(e.target.value)}
                  className="w-24 px-2 py-1 bg-white border border-blue-300 font-mono font-bold tracking-widest text-center"
                />
                <button
                  type="button"
                  onClick={() => setPublicAccessToken(String(Math.floor(1000 + Math.random() * 9000)))}
                  className="px-2 py-1 bg-white border border-gray-300 text-[10px] rounded hover:bg-gray-100 cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('notes')}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              placeholder="Additional contact details or terms..."
            />
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={onClose}
              className="xp-button px-4 py-1.5 text-xs text-gray-800 cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="xp-button-primary px-5 py-1.5 text-xs cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
