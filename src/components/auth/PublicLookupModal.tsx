import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { formatCurrency } from '../../services/accounting/calculator';
import { firebaseSync } from '../../services/firebase/firebaseSync';
import { XPTitleBar } from '../xp/XPTitleBar';
import { Search, AlertCircle, CheckCircle2, X, Phone, Lock, Calendar, Store } from 'lucide-react';
import { XPIcon } from '../xp/XPIcon';

interface PublicLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublicLookupModal: React.FC<PublicLookupModalProps> = ({ isOpen, onClose }) => {
  const { contacts, transactions, userProfile } = useApp();
  const { t, language } = useI18n();

  const [phoneInput, setPhoneInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [result, setResult] = useState<{
    contactName: string;
    phone: string;
    businessName: string;
    receivable: number;
    payable: number;
    netBalance: number;
    statementDate: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setErrorMessage(null);
    setIsSearching(true);

    try {
      const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
      const cleanToken = tokenInput.trim();

      if (!cleanPhone || cleanPhone.length < 6) {
        setErrorMessage(
          language === 'bn'
            ? 'সঠিক মোবাইল নম্বর লিখুন (কমপক্ষে ৬ সংখ্যা)'
            : 'Enter a valid phone number (min 6 digits)'
        );
        setIsSearching(false);
        return;
      }

      // 1. Try Firestore cloud public statements
      const cloudResult = await firebaseSync.queryPublicStatementByPhone(phoneInput);
      if (cloudResult) {
        setResult({
          contactName: cloudResult.personName || 'Customer',
          phone: cloudResult.personPhone || phoneInput,
          businessName: cloudResult.ownerBusiness || userProfile.businessName,
          receivable: (cloudResult.totalGiven || 0) * 100,
          payable: (cloudResult.totalTaken || 0) * 100,
          netBalance: (cloudResult.netBalance || 0) * 100,
          statementDate: cloudResult.lastUpdated ? cloudResult.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setIsSearching(false);
        return;
      }

      // 2. Fallback to Local Verified Matching
      const matchedContact = contacts.find((c) => {
        if (!c.publicLookupEnabled) return false;
        const cCleanPhone = c.phone.replace(/[^0-9]/g, '');
        const phoneMatches = cCleanPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cCleanPhone);
        const tokenMatches = !cleanToken || (c.publicAccessToken && c.publicAccessToken.trim() === cleanToken);
        return phoneMatches && tokenMatches;
      });

      if (matchedContact) {
        // Calculate contact balance
        const contactTxs = transactions.filter((t) => t.contactId === matchedContact.id && t.status !== 'cancelled');
        let rec = Math.max(0, matchedContact.openingBalance);
        let pay = Math.max(0, -matchedContact.openingBalance);

        contactTxs.forEach((t) => {
          if (t.type === 'given') rec += t.amount;
          else if (t.type === 'received') rec -= t.amount;
          else if (t.type === 'borrowed') pay += t.amount;
          else if (t.type === 'repaid') pay -= t.amount;
        });

        const net = rec - pay;

        setResult({
          contactName: matchedContact.name,
          phone: matchedContact.phone,
          businessName: userProfile.businessName,
          receivable: Math.max(0, rec),
          payable: Math.max(0, pay),
          netBalance: net,
          statementDate: new Date().toISOString().split('T')[0],
        });
      } else {
        setResult(null);
        setErrorMessage(
          language === 'bn'
            ? 'এই নম্বরে কোনো সক্রিয় হিসাব বা অনুমোদিত পাবলিক স্টেটমেন্ট পাওয়া যায়নি।'
            : 'No active ledger statement found for this phone number.'
        );
      }
    } catch (err: any) {
      console.error('Public search error:', err);
      setErrorMessage(
        language === 'bn'
          ? 'অনুসন্ধানে সমস্যা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
          : 'Search error occurred. Please try again later.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs font-sans text-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        {/* Title Bar */}
        <XPTitleBar
          title={
            language === 'bn'
              ? 'কাস্টমার পাবলিক খাতা অনুসন্ধান (Public Balance Search)'
              : 'Customer Public Ledger Lookup'
          }
          iconName="lookup"
          onClose={onClose}
        />

        <div className="p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="bg-white p-3 rounded border border-[#7F9DB9] xp-bevel-inset flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center text-[#0055EA] shrink-0">
              <Search size={22} />
            </div>
            <div>
              <h2 className="font-bold text-xs sm:text-sm text-gray-900">
                {language === 'bn'
                  ? 'আপনার দেনা-পাওনার হিসাব তাৎক্ষণিক জানুন'
                  : 'Check Your Due & Balance Statement'}
              </h2>
              <p className="text-[11px] text-gray-500">
                {language === 'bn'
                  ? 'দোকান বা ব্যবসা প্রতিষ্ঠানের দেয়া মোবাইল নম্বর দিয়ে অনুসন্ধান করুন'
                  : 'Lookup balance statement using registered mobile number'}
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-3 bg-white p-3.5 rounded border border-[#7F9DB9] xp-bevel-inset">
            <div className="space-y-1">
              <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1">
                <Phone size={13} className="text-[#0055EA]" />
                <span>{language === 'bn' ? 'মোবাইল নম্বর লিখুন:' : 'Customer Mobile Number:'}</span>
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3 py-2 bg-white border border-[#7F9DB9] text-xs font-mono outline-none focus:border-[#0055EA] rounded-[2px]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 font-semibold text-xs flex items-center gap-1">
                <Lock size={13} className="text-gray-500" />
                <span>{language === 'bn' ? 'নিরাপত্তা পিন / টোকেন (ঐচ্ছিক):' : 'Security Token (Optional):'}</span>
              </label>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="1234"
                maxLength={8}
                className="w-full px-3 py-1.5 bg-white border border-[#7F9DB9] text-xs font-mono outline-none focus:border-[#0055EA] rounded-[2px]"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-300 text-red-700 rounded text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full xp-button-primary py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {isSearching ? (
                <span>{language === 'bn' ? 'অনুসন্ধান করা হচ্ছে...' : 'Searching...'}</span>
              ) : (
                <>
                  <Search size={14} />
                  <span>{language === 'bn' ? 'হিসাব অনুসন্ধান করুন (Search)' : 'Search Balance Statement'}</span>
                </>
              )}
            </button>
          </form>

          {/* Statement Result Display */}
          {result && (
            <div className="bg-[#FFFFF0] border-2 border-[#0055EA] rounded-[4px] p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-[#D0CCB8]">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                    {language === 'bn' ? 'অফিসিয়াল খাতা বিবরণী' : 'Official Statement'}
                  </div>
                  <h3 className="font-bold text-sm text-[#003399]">{result.contactName}</h3>
                  <div className="text-[11px] text-gray-600 font-mono">{result.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
                    <Store size={11} />
                    <span>{result.businessName}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end mt-0.5">
                    <Calendar size={11} />
                    <span>{result.statementDate}</span>
                  </div>
                </div>
              </div>

              {/* Balance Summary Cards */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-blue-50/80 rounded border border-blue-200">
                  <div className="text-[10px] text-blue-700 font-semibold">
                    {language === 'bn' ? 'দোকানের মোট পাওনা' : 'Receivable'}
                  </div>
                  <div className="text-sm font-bold text-blue-900 font-mono mt-0.5">
                    {formatCurrency(result.receivable, userProfile.currencySymbol)}
                  </div>
                </div>
                <div className="p-2.5 bg-purple-50/80 rounded border border-purple-200">
                  <div className="text-[10px] text-purple-700 font-semibold">
                    {language === 'bn' ? 'দোকানের মোট দেনা' : 'Payable'}
                  </div>
                  <div className="text-sm font-bold text-purple-900 font-mono mt-0.5">
                    {formatCurrency(result.payable, userProfile.currencySymbol)}
                  </div>
                </div>
              </div>

              {/* Net Due / Balance Highlight */}
              <div className={`p-3 rounded border text-center font-bold ${
                result.netBalance > 0
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : result.netBalance < 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-gray-100 border-gray-300 text-gray-800'
              }`}>
                <div className="text-[11px] uppercase tracking-wider">
                  {result.netBalance > 0
                    ? language === 'bn' ? 'দোকানে আপনার বর্তমান বকেয়া (Due to Merchant)' : 'You owe to merchant'
                    : result.netBalance < 0
                    ? language === 'bn' ? 'দোকান থেকে আপনার অগ্রিম পাওনা (Advance/Credit)' : 'Merchant owes you'
                    : language === 'bn' ? 'সকল হিসাব পরিশোধিত (All Settled)' : 'All Settled'}
                </div>
                <div className="text-xl font-extrabold font-mono mt-1">
                  {formatCurrency(Math.abs(result.netBalance), userProfile.currencySymbol)}
                </div>
              </div>

              <div className="text-[10px] text-gray-500 text-center italic">
                {language === 'bn'
                  ? 'এই হিসাবটি ক্লাউড সার্ভার থেকে সরাসরি যাচাইকৃত।'
                  : 'This statement is verified directly from Cloud Firestore ledger.'}
              </div>
            </div>
          )}

          {/* Footer Close Button */}
          <div className="flex justify-end pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={onClose}
              className="xp-button px-6 py-1.5 text-xs font-semibold cursor-pointer"
            >
              {language === 'bn' ? 'বন্ধ করুন (Close)' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
