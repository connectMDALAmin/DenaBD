import React, { useState, useEffect } from 'react';
import { islamicQuotes, IslamicQuote } from '../../data/islamicQuotes';
import { XPTitleBar } from './XPTitleBar';
import { Moon, RefreshCw, Copy, Check, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

interface IslamicQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoOpened?: boolean;
}

export const IslamicQuoteModal: React.FC<IslamicQuoteModalProps> = ({
  isOpen,
  onClose,
  autoOpened = false,
}) => {
  const { language } = useI18n();

  // Pick deterministic quote of the day or randomize
  const [currentIndex, setCurrentIndex] = useState(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return dayOfYear % islamicQuotes.length;
  });

  const [dontShowToday, setDontShowToday] = useState(false);
  const [copied, setCopied] = useState(false);

  const quote: IslamicQuote = islamicQuotes[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % islamicQuotes.length);
    setCopied(false);
  };

  const handleCopy = () => {
    const text = `${quote.bangla}\n${quote.arabic ? quote.arabic + '\n' : ''}— ${quote.source}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (dontShowToday) {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem('denapawna_hide_quote_date', todayStr);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <XPTitleBar
          title={language === 'bn' ? 'প্রতিদিনের ইসলামিক নসিহত ও প্রজ্ঞা' : 'Daily Islamic Wisdom & Guidance'}
          iconName="help"
          onClose={handleClose}
        />

        <div className="p-4 sm:p-5 space-y-4">
          {/* Header Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-[#D0CCB8]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
                <Moon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {language === 'bn' ? 'ব্যবসায় সততা ও ঋণ সংক্রান্ত হাদিস' : 'Islamic Teachings on Debt & Trade'}
                </h3>
                <span className="text-[11px] text-emerald-800 font-medium">
                  {quote.source}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="xp-button px-2.5 py-1 flex items-center gap-1 text-[11px] text-gray-800 cursor-pointer"
              title="Next Quote"
            >
              <RefreshCw size={12} />
              <span>{language === 'bn' ? 'পরবর্তী বাণী' : 'Next'}</span>
            </button>
          </div>

          {/* Quote Card Inset */}
          <div className="p-4 bg-white border border-[#7F9DB9] rounded-[4px] xp-bevel-inset space-y-3">
            {quote.arabic && (
              <p
                dir="rtl"
                className="text-right text-base sm:text-lg font-serif text-emerald-950 leading-relaxed tracking-wide font-medium bg-emerald-50/50 p-2.5 rounded border border-emerald-100"
              >
                {quote.arabic}
              </p>
            )}

            <p className="text-sm font-semibold text-gray-900 leading-relaxed">
              {quote.bangla}
            </p>

            <p className="text-xs text-gray-600 italic border-t border-gray-100 pt-2">
              {quote.english}
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                {quote.category}
              </span>

              <button
                type="button"
                onClick={handleCopy}
                className="xp-button px-2 py-0.5 text-[10px] text-gray-700 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check size={11} className="text-green-600" /> : <Copy size={11} />}
                <span>{copied ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700">
              <input
                type="checkbox"
                checked={dontShowToday}
                onChange={(e) => setDontShowToday(e.target.checked)}
                className="w-4 h-4 accent-[#0055EA] cursor-pointer"
              />
              <span>{language === 'bn' ? 'আজ আর স্বয়ংক্রিয়ভাবে দেখাবেন না' : "Don't show automatically today"}</span>
            </label>

            <button
              type="button"
              onClick={handleClose}
              className="xp-button-primary px-6 py-1.5 text-xs font-bold cursor-pointer"
            >
              {language === 'bn' ? 'ঠিক আছে (OK)' : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
