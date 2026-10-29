import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { calculateContactBalance, formatCurrency } from '../../services/accounting/calculator';
import { Search, ShieldCheck, Printer, ArrowLeft, AlertCircle, Lock } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';
import { firebaseSync } from '../../services/firebase/firebaseSync';

export const PublicLookupView: React.FC = () => {
  const { contacts, transactions, userProfile } = useApp();
  const { t, language } = useI18n();

  const [phoneInput, setPhoneInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [lookupResult, setLookupResult] = useState<{
    contactName: string;
    phone: string;
    receivable: number;
    payable: number;
    netBalance: number;
    statementDate: string;
    recentTransactions: {
      date: string;
      category: string;
      amount: number;
      type: string;
    }[];
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setErrorMessage(null);

    // Rate limiting: 5 attempts max
    if (attempts >= 5) {
      setErrorMessage(
        language === 'bn'
          ? 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে স্থগিত। কিছুক্ষণ পর চেষ্টা করুন।'
          : 'Too many attempts. Please try again in a few minutes.'
      );
      return;
    }

    setAttempts((prev) => prev + 1);

    // Normalize phone
    const cleanPhone = phoneInput.replace(/[^0-9]/g, '');
    const cleanToken = tokenInput.trim();

    // 1. Try querying Firestore live public statements collection
    const firestoreResult = await firebaseSync.queryPublicStatementByPhone(phoneInput);
    if (firestoreResult) {
      setLookupResult({
        contactName: firestoreResult.personName || 'Customer',
        phone: firestoreResult.personPhone || phoneInput,
        receivable: (firestoreResult.totalGiven || 0) * 100,
        payable: (firestoreResult.totalTaken || 0) * 100,
        netBalance: (firestoreResult.netBalance || 0) * 100,
        statementDate: firestoreResult.lastUpdated ? firestoreResult.lastUpdated.split('T')[0] : new Date().toISOString().split('T')[0],
        recentTransactions: [
          {
            date: new Date().toISOString().split('T')[0],
            category: 'Firestore Cloud Statement',
            amount: Math.abs((firestoreResult.netBalance || 0) * 100),
            type: firestoreResult.status === 'due_to_me' ? 'given' : 'borrowed',
          },
        ],
      });
      return;
    }

    // 2. Fallback to Local Verified Matching
    const matchedContact = contacts.find((c) => {
      if (!c.publicLookupEnabled) return false;
      const cCleanPhone = c.phone.replace(/[^0-9]/g, '');
      const phoneMatches =
        cCleanPhone.endsWith(cleanPhone) || cleanPhone.endsWith(cCleanPhone);
      const tokenMatches =
        c.publicAccessToken && c.publicAccessToken.trim() === cleanToken;
      return phoneMatches && tokenMatches;
    });

    if (!matchedContact) {
      // Generic response for privacy / anti-enumeration
      setLookupResult(null);
      setErrorMessage(t('lookupNotFound'));
      return;
    }

    // Success! Prepare authorized minimal data
    const summary = calculateContactBalance(matchedContact, transactions);
    const authorizedTxs = transactions
      .filter((tx) => tx.contactId === matchedContact.id && tx.status === 'active')
      .slice(0, 5)
      .map((tx) => ({
        date: tx.date,
        category: tx.category,
        amount: tx.amount,
        type: tx.type,
      }));

    setLookupResult({
      contactName: matchedContact.name,
      phone: matchedContact.phone,
      receivable: summary.receivable,
      payable: summary.payable,
      netBalance: summary.netBalance,
      statementDate: new Date().toISOString().split('T')[0],
      recentTransactions: authorizedTxs,
    });
  };

  const handleReset = () => {
    setPhoneInput('');
    setTokenInput('');
    setHasSearched(false);
    setLookupResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header Info */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center text-[#0055EA]">
          <XPIcon name="lookup" size={32} />
        </div>
        <h2 className="text-base font-bold text-gray-900">{t('publicLookupTitle')}</h2>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          {t('publicLookupDesc')}
        </p>
      </div>

      {/* Lookup Form */}
      {!lookupResult ? (
        <div className="bg-white p-5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
          <form onSubmit={handleLookup} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('enterPhone')} *
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. 01811223344"
                className="w-full px-3 py-2 bg-white border border-[#7F9DB9] text-sm font-mono outline-none focus:ring-1 focus:ring-[#0055EA]"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('enterToken')} *
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full pl-8 pr-3 py-2 bg-white border border-[#7F9DB9] text-sm font-mono tracking-widest outline-none focus:ring-1 focus:ring-[#0055EA]"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                {language === 'bn'
                  ? 'দোকানদার কর্তৃক প্রদত্ত ৪-ডিজিট গোপন এক্সেস পিন বা টোকেন।'
                  : 'The 4-digit security token provided by the business owner.'}
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full xp-button-primary py-2 text-sm font-bold cursor-pointer"
              >
                {t('checkBalance')}
              </button>
            </div>

            <div className="text-[11px] text-gray-500 bg-gray-50 p-2.5 rounded border border-gray-200">
              <ShieldCheck size={14} className="inline mr-1 text-green-700" />
              {t('lookupDisclaimer')}
            </div>
          </form>
        </div>
      ) : (
        /* Verified Authorized Balance Statement */
        <div className="bg-white p-6 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-gray-200">
            <div>
              <h3 className="text-base font-bold text-gray-900">{userProfile.businessName}</h3>
              <div className="text-xs text-gray-500">
                {userProfile.address || 'Dhaka, Bangladesh'} • {userProfile.phone}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="xp-button px-3 py-1 flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="xp-button px-3 py-1 text-xs text-gray-700 cursor-pointer"
              >
                New Search
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded text-xs flex items-center justify-between">
            <div>
              <span className="text-gray-600 block">Statement For:</span>
              <span className="font-bold text-sm text-gray-900">{lookupResult.contactName}</span>
              <span className="text-gray-500 font-mono block">{lookupResult.phone}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-600 block text-[11px]">As of Date:</span>
              <span className="font-mono font-semibold">{lookupResult.statementDate}</span>
            </div>
          </div>

          {/* Statement Balance */}
          <div className="p-4 bg-gray-50 border border-gray-300 rounded text-center">
            <span className="text-xs text-gray-600 font-medium block">
              {lookupResult.netBalance > 0
                ? `${userProfile.businessName} ${language === 'bn' ? 'আপনার নিকট পাবে' : 'is owed by you'}`
                : lookupResult.netBalance < 0
                ? `${language === 'bn' ? 'আপনি দোকান থেকে পাবেন' : 'You are owed by business'}`
                : t('settled')}
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                lookupResult.netBalance > 0
                  ? 'text-[#0055EA]'
                  : lookupResult.netBalance < 0
                  ? 'text-[#2E7D32]'
                  : 'text-gray-700'
              }`}
            >
              {formatCurrency(Math.abs(lookupResult.netBalance))}
            </div>
          </div>

          {/* Authorized Recent Transactions */}
          <div>
            <h4 className="font-bold text-xs text-gray-800 mb-2">
              {language === 'bn' ? 'সাম্প্রতিক অনুমোদিত লেনদেন' : 'Recent Authorized Entries'}
            </h4>
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="py-1.5 px-3">Date</th>
                    <th className="py-1.5 px-3">Description</th>
                    <th className="py-1.5 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {lookupResult.recentTransactions.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-mono text-gray-600">{tx.date}</td>
                      <td className="py-2 px-3 text-gray-800">{tx.category}</td>
                      <td
                        className={`py-2 px-3 text-right font-mono font-bold ${
                          tx.type === 'given' ? 'text-blue-700' : 'text-green-700'
                        }`}
                      >
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
