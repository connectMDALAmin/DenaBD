import React, { useState, useEffect } from 'react';
import { XPTitleBar } from './XPTitleBar';
import { useI18n } from '../../i18n/I18nContext';
import { AlertTriangle, RotateCcw, ShieldAlert, Check } from 'lucide-react';

interface ResetDemoConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contactsCount: number;
  transactionsCount: number;
}

export const ResetDemoConfirmModal: React.FC<ResetDemoConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contactsCount,
  transactionsCount,
}) => {
  const { language } = useI18n();
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset local state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setHasConfirmedCheckbox(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExecuteReset = () => {
    if (!hasConfirmedCheckbox || isProcessing) return;
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm();
      setIsProcessing(false);
      onClose();
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150 no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Classic XP Title Bar */}
        <XPTitleBar
          title={
            language === 'bn'
              ? 'নিশ্চিতকরণ: নমুনা তথ্য রিসেট (Reset Demo Data)'
              : 'Confirm Ledger Reset — DenaPawna Khata'
          }
          iconName="settings"
          onClose={onClose}
        />

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Windows XP Exclamation Warning Banner */}
          <div className="flex items-start gap-3.5 pb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={26} className="text-amber-600 animate-pulse" />
            </div>
            <div>
              <h2 id="reset-modal-title" className="text-sm font-bold text-gray-900 tracking-wide">
                {language === 'bn'
                  ? 'আপনি কি নিশ্চিত যে ডেমো তথ্য রিলোড করতে চান?'
                  : 'Are you sure you want to reset to demo data?'}
              </h2>
              <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'এই প্রক্রিয়াটি আপনার বর্তমান সমস্ত কন্ট্যাক্ট এবং লেনদেনের হিসাব মুছে ফেলে প্রাথমিক নমুনা ডেটা দিয়ে প্রতিস্থাপন করবে।'
                  : 'This action will replace your active ledger contacts and transaction history with clean starter sample records.'}
              </p>
            </div>
          </div>

          {/* Impact Stats Box */}
          <div className="p-3 bg-white border border-[#7F9DB9] rounded-[4px] xp-bevel-inset space-y-2">
            <div className="font-semibold text-gray-700 flex items-center gap-1.5 text-[11px] text-red-800">
              <ShieldAlert size={14} className="text-red-600" />
              <span>
                {language === 'bn'
                  ? 'প্রভাবিত হতে যাওয়া বর্তমান ডেটা:'
                  : 'Current records that will be replaced:'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono">
              <div className="p-2 bg-red-50 border border-red-200 rounded-[3px]">
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'কন্ট্যাক্ট সংখ্যা' : 'Contacts'}
                </div>
                <div className="text-base font-bold text-red-700">{contactsCount}</div>
              </div>
              <div className="p-2 bg-red-50 border border-red-200 rounded-[3px]">
                <div className="text-xs text-gray-600">
                  {language === 'bn' ? 'মোট লেনদেন' : 'Transactions'}
                </div>
                <div className="text-base font-bold text-red-700">{transactionsCount}</div>
              </div>
            </div>
          </div>

          {/* Accidental Prevention Safety Checkbox */}
          <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-[4px] flex items-start gap-2.5">
            <input
              type="checkbox"
              id="confirm-reset-checkbox"
              checked={hasConfirmedCheckbox}
              onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-400 cursor-pointer accent-[#0055EA]"
            />
            <label
              htmlFor="confirm-reset-checkbox"
              className="text-[11px] text-gray-800 font-medium select-none cursor-pointer leading-tight"
            >
              {language === 'bn'
                ? 'আমি নিশ্চিত যে আমার বর্তমান সকল অপ্রয়োজনীয় খাতা তথ্য নমুনা ডেমো ডেটা দিয়ে প্রতিস্থাপিত হবে।'
                : 'I understand that all current ledger data will be overwritten with default sample data.'}
            </label>
          </div>

          {/* Action Buttons (Windows XP Dialog Standard) */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={onClose}
              className="xp-button px-4 py-1.5 text-xs font-semibold text-gray-800 cursor-pointer min-w-[75px]"
              autoFocus
            >
              {language === 'bn' ? 'বাতিল (Cancel)' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleExecuteReset}
              disabled={!hasConfirmedCheckbox || isProcessing}
              className={`px-4 py-1.5 text-xs font-bold rounded-[3px] border flex items-center gap-1.5 transition select-none ${
                hasConfirmedCheckbox && !isProcessing
                  ? 'bg-[#D83B01] hover:bg-[#B32E00] text-white border-[#8C2300] cursor-pointer shadow-sm active:translate-y-px'
                  : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
              }`}
            >
              <RotateCcw size={13} className={isProcessing ? 'animate-spin' : ''} />
              <span>
                {isProcessing
                  ? (language === 'bn' ? 'রিসেট হচ্ছে...' : 'Resetting...')
                  : (language === 'bn' ? 'হ্যাঁ, ডেটা রিসেট করুন' : 'Yes, Reset Demo')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
