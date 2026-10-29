import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { verifyPin } from '../../services/security/pinService';
import { XPTitleBar } from '../../components/xp/XPTitleBar';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

export const PinLockModal: React.FC = () => {
  const { userProfile, isLocked, setIsLocked, resetPin, firebaseUser, logout } = useApp();
  const { t, language } = useI18n();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isLocked || !userProfile.pinEnabled || !userProfile.pinHash || !userProfile.pinSalt) {
    return null;
  }

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError(language === 'bn' ? '৪-সংখ্যার পিন লিখুন' : 'Enter 4-digit PIN');
      return;
    }

    setIsVerifying(true);
    setError(null);

    const result = await verifyPin(pin, userProfile.pinHash!, userProfile.pinSalt!);
    setIsVerifying(false);

    if (result.success) {
      setIsLocked(false);
      setPin('');
      setError(null);
    } else {
      setError(result.error || (language === 'bn' ? 'ভুল পিন কোড!' : 'Incorrect PIN'));
      setPin('');
    }
  };

  const handleConfirmResetPin = () => {
    resetPin();
    setResetSuccess(true);
    setTimeout(() => {
      setShowResetConfirm(false);
      setResetSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#004E98]/90 flex items-center justify-center p-4 backdrop-blur-md select-none">
      <div className="w-full max-w-sm bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs">
        {/* Title Bar */}
        <XPTitleBar title="DenaPawna Windows XP Security" iconName="shield" />

        <div className="p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-[6px] bg-white border-2 border-[#0055EA] shadow-md flex items-center justify-center text-[#0055EA]">
            <XPIcon name="shield" size={40} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-gray-900">{userProfile.businessName}</h2>
            <p className="text-xs text-gray-600 mt-1">
              {language === 'bn'
                ? 'অ্যাপটি পিন লক দ্বারা সুরক্ষিত। আনলক করতে পিন কোড লিখুন।'
                : 'Application is locked. Enter your 4-digit PIN to continue.'}
            </p>
          </div>

          {!showResetConfirm ? (
            <>
              <form onSubmit={handleUnlock} className="space-y-3">
                <div className="flex justify-center">
                  <input
                    type="password"
                    maxLength={4}
                    autoFocus
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-36 text-center tracking-[0.5em] text-2xl font-mono py-2 bg-white border border-[#7F9DB9] xp-bevel-inset outline-none focus:ring-2 focus:ring-[#0055EA]"
                  />
                </div>

                {error && (
                  <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[11px] flex items-center gap-1.5 justify-center">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full xp-button-primary py-2 text-xs font-bold cursor-pointer"
                >
                  {isVerifying ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...') : t('unlock')}
                </button>
              </form>

              {/* Forgot / Reset PIN Link */}
              <div className="pt-2 flex flex-col gap-1.5 items-center">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-[11px] text-[#0055EA] hover:underline cursor-pointer font-semibold flex items-center gap-1"
                >
                  <KeyRound size={12} />
                  <span>{language === 'bn' ? 'পিন ভুলে গেছেন? রিসেট করুন' : 'Forgot PIN? Reset PIN'}</span>
                </button>
              </div>
            </>
          ) : (
            /* PIN Reset Confirmation Box */
            <div className="bg-white p-3.5 rounded border border-[#0055EA] text-left space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-xs">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>{language === 'bn' ? 'নিরাপত্তা পিন রিসেট' : 'Reset Security PIN'}</span>
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                {language === 'bn'
                  ? `আপনার লগইনকৃত একাউন্ট (${firebaseUser?.email || 'User'}) দ্বারা নিরাপত্তা নিশ্চিত করে পিন লকটি নিষ্ক্রিয় করা হবে।`
                  : `Your security PIN will be cleared and unlocked via your active account (${firebaseUser?.email || 'User'}).`}
              </p>

              {resetSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[11px] font-semibold text-center">
                  {language === 'bn' ? 'পিন সফলভাবে রিসেট ও আনলক হয়েছে!' : 'PIN successfully reset & unlocked!'}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmResetPin}
                  className="flex-1 xp-button px-2 py-1.5 text-xs text-red-700 font-bold hover:bg-red-50 border-red-300 cursor-pointer"
                >
                  {language === 'bn' ? 'হ্যাঁ, পিন রিসেট করুন' : 'Yes, Reset PIN'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 xp-button px-2 py-1.5 text-xs text-gray-700 font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          <div className="text-[10px] text-gray-500 pt-2 border-t border-[#D0CCB8] flex items-center justify-between">
            <span>{userProfile.ownerName}</span>
            <button
              type="button"
              onClick={() => logout()}
              className="text-[#D83B01] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'লগ অফ করুন' : 'Log Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
