import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { LogOut, Users, X, RefreshCw } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface XPLogOffDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XPLogOffDialog: React.FC<XPLogOffDialogProps> = ({ isOpen, onClose }) => {
  const { logout, firebaseUser } = useApp();
  const { language } = useI18n();
  const [isLoggingOff, setIsLoggingOff] = useState(false);

  if (!isOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOff(true);
      // Play authentic Windows XP Logoff chime
      soundService.playLogoff();
      // Brief pause to allow the sound to initiate smoothly
      await new Promise((resolve) => setTimeout(resolve, 300));
      await logout();
      onClose();
    } catch (e) {
      console.error('Logout error:', e);
      setIsLoggingOff(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] bg-[#ECE9D8] rounded-[8px] overflow-hidden shadow-2xl border-2 border-[#0055EA] font-sans text-gray-900"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Windows XP Classic Gradient Titlebar */}
        <div className="h-9 px-3 bg-gradient-to-r from-[#0055EA] via-[#0A64F2] to-[#0055EA] flex items-center justify-between text-white font-bold text-sm shadow-inner">
          <div className="flex items-center gap-2">
            {/* Windows 4-color flag */}
            <span className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 transform -rotate-12">
              <span className="bg-[#EB4128] rounded-tl-sm" />
              <span className="bg-[#43A047] rounded-tr-sm" />
              <span className="bg-[#1E88E5] rounded-bl-sm" />
              <span className="bg-[#FFB300] rounded-br-sm" />
            </span>
            <span className="drop-shadow-sm">
              {language === 'bn' ? 'উইন্ডোজ লগ অফ করুন (Log Off Windows)' : 'Log Off Windows'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOff}
            className="w-5 h-5 rounded-xs bg-[#E81123] hover:bg-[#F1707A] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white/50 cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X size={12} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* User info line */}
          <div className="flex items-center justify-between text-xs text-gray-700 bg-white/70 px-3 py-2 rounded border border-[#D8D4C0]">
            <div>
              <span className="font-semibold">{language === 'bn' ? 'বর্তমান একাউন্ট:' : 'Current Account:'}</span>{' '}
              <span className="font-mono text-blue-900 font-bold">{firebaseUser?.email || firebaseUser?.displayName || 'User'}</span>
            </div>
            {firebaseUser?.uid && (
              <span className="text-[10px] text-gray-500 font-mono">UID: {firebaseUser.uid.substring(0, 8)}...</span>
            )}
          </div>

          <p className="text-xs text-gray-700 font-medium text-center">
            {language === 'bn'
              ? 'আপনি কি নিশ্চিতভাবে এই সেশন থেকে লগ অফ করতে চান?'
              : 'What would you like to do with your current session?'}
          </p>

          {/* Action Cards: Switch User & Log Off */}
          <div className="grid grid-cols-2 gap-3">
            {/* Switch User Card */}
            <button
              type="button"
              disabled={isLoggingOff}
              onClick={handleConfirmLogout}
              className="flex flex-col items-center text-center p-3.5 rounded-[6px] border border-gray-300 hover:border-[#0055EA] bg-white hover:bg-blue-50/70 shadow-xs cursor-pointer transition active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 text-[#0055EA] flex items-center justify-center mb-2 shadow-inner transition">
                <Users size={24} />
              </div>
              <div className="font-bold text-xs text-gray-900 group-hover:text-[#0055EA]">
                {language === 'bn' ? 'ইউজার পরিবর্তন' : 'Switch User'}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                {language === 'bn'
                  ? 'অন্য একাউন্টে লগইন করুন'
                  : 'Log in with another account'}
              </div>
            </button>

            {/* Log Off Card */}
            <button
              type="button"
              disabled={isLoggingOff}
              onClick={handleConfirmLogout}
              className="flex flex-col items-center text-center p-3.5 rounded-[6px] border border-gray-300 hover:border-[#D83B01] bg-white hover:bg-amber-50/70 shadow-xs cursor-pointer transition active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 text-[#D83B01] flex items-center justify-center mb-2 shadow-inner transition">
                <LogOut size={24} />
              </div>
              <div className="font-bold text-xs text-gray-900 group-hover:text-[#D83B01]">
                {language === 'bn' ? 'লগ অফ করুন' : 'Log Off'}
              </div>
              <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                {language === 'bn'
                  ? 'লগঅন স্ক্রিনে ফিরে যান'
                  : 'End session and return to logon'}
              </div>
            </button>
          </div>

          {/* Logging off loader if clicked */}
          {isLoggingOff && (
            <div className="flex items-center justify-center gap-2 py-1 text-xs text-blue-700 font-semibold animate-pulse">
              <RefreshCw size={14} className="animate-spin" />
              <span>{language === 'bn' ? 'লগ অফ হচ্ছে...' : 'Logging off...'}</span>
            </div>
          )}

          {/* Bottom Cancel Button */}
          <div className="pt-2 border-t border-[#D8D4C0] flex justify-end">
            <button
              type="button"
              disabled={isLoggingOff}
              onClick={onClose}
              className="xp-button px-6 py-1 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {language === 'bn' ? 'বাতিল (Cancel)' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
