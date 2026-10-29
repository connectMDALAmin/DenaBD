import React, { useState } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { XPIcon } from './XPIcon';
import { Lock, Smartphone, ShieldCheck, LogOut, Shield } from 'lucide-react';

interface XPStartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeveloperInfo?: () => void;
  onOpenLogOff?: () => void;
}

export const XPStartMenu: React.FC<XPStartMenuProps> = ({
  isOpen,
  onClose,
  onOpenDeveloperInfo,
  onOpenLogOff,
}) => {
  const { userProfile, activeTab, setActiveTab, setIsLocked, firebaseUser, isAdmin, logout } = useApp();
  const { t, language } = useI18n();

  if (!isOpen) return null;

  const handleNav = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  const handleLogout = () => {
    onClose();
    if (onOpenLogOff) {
      onOpenLogOff();
    } else {
      logout();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Start Menu Container */}
      <div className="fixed bottom-[32px] left-0 w-80 sm:w-96 bg-[#2B60DE] rounded-tr-[8px] xp-window-shadow border border-[#0A246A] z-50 flex flex-col overflow-hidden text-sm select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
        {/* User Profile Header */}
        <div className="h-16 px-4 bg-gradient-to-r from-[#1752D8] via-[#2A6CEB] to-[#1752D8] flex items-center gap-3 border-b border-[#4382F6]">
          <div className="w-11 h-11 rounded-[4px] border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden shrink-0">
            {firebaseUser?.photoURL ? (
              <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <XPIcon name="user" size={32} />
            )}
          </div>
          <div className="overflow-hidden text-white min-w-0">
            <div className="font-bold text-[14px] truncate drop-shadow flex items-center gap-1.5">
              <span>{firebaseUser?.displayName || userProfile.ownerName}</span>
              {isAdmin && (
                <span className="px-1 py-0.2 bg-amber-400 text-black text-[9px] font-extrabold rounded-xs uppercase">
                  Admin
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#A0C5FF] truncate">
              {firebaseUser?.email || userProfile.businessName}
            </div>
          </div>
        </div>

        {/* Two Column Menu Body */}
        <div className="flex bg-white">
          {/* Left Column: Frequently Used & Core Modules */}
          <div className="w-1/2 p-1.5 space-y-0.5 border-r border-[#96B8EA]">
            <button
              type="button"
              onClick={() => handleNav('dashboard')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="ledger" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navDashboard')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Overview</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('contacts')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'contacts' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="contact" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navContacts')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Khata People</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('ledger')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'ledger' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="money" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navLedger')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Transactions</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('reminders')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'reminders' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="reminders" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navReminders')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Due Dates</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('analytics')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="analytics" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navAnalytics')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Reports</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('publicLookup')}
              className={`w-full flex items-center gap-2.5 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer ${
                activeTab === 'publicLookup' ? 'bg-[#D3E5FA] font-bold text-[#003399]' : 'text-gray-800'
              }`}
            >
              <XPIcon name="lookup" size={24} />
              <div className="min-w-0">
                <div className="text-xs truncate">{t('navPublicLookup')}</div>
                <div className="text-[10px] text-gray-500 hover:text-white truncate">Phone Portal</div>
              </div>
            </button>
          </div>

          {/* Right Column: System Utilities, Admin, Settings & Tools */}
          <div className="w-1/2 p-2 bg-[#D3E5FA] space-y-1 text-gray-800">
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className={`w-full flex items-center gap-2 p-2 rounded text-left transition-colors cursor-pointer border ${
                  activeTab === 'admin'
                    ? 'bg-[#6B21A8] text-white border-[#581C87]'
                    : 'bg-purple-100/90 text-purple-900 border-purple-300 hover:bg-[#2F71CD] hover:text-white'
                }`}
              >
                <Shield size={18} className="text-purple-700 shrink-0" />
                <span className="text-xs font-bold truncate">
                  {language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Control'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNav('backup')}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer"
            >
              <XPIcon name="backup" size={20} />
              <span className="text-xs font-medium truncate">{t('navBackup')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('androidGuide')}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer"
            >
              <XPIcon name="android" size={20} />
              <span className="text-xs font-medium truncate">{t('navAndroidBuild')}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('settings')}
              className="w-full flex items-center gap-2 p-2 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer"
            >
              <XPIcon name="settings" size={20} />
              <span className="text-xs font-medium truncate">{t('navSettings')}</span>
            </button>

            <div className="border-t border-[#B4D0F4] my-1" />

            {/* Developer Info */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDeveloperInfo?.();
              }}
              className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-[#2F71CD] hover:text-white text-left transition-colors cursor-pointer text-[#003B99] bg-[#EBF4FD] border border-[#A0C5FF]"
            >
              <span className="text-sm">👨‍💻</span>
              <span className="text-xs font-semibold truncate">
                {language === 'bn' ? 'ডেভেলপার তথ্য' : 'Developer Info'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Taskbar Footer with Log Off and Lock buttons */}
        <div className="h-11 px-3 bg-gradient-to-r from-[#1752D8] via-[#2A6CEB] to-[#1752D8] border-t border-[#4382F6] flex items-center justify-between text-white text-xs">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#D83B01] hover:bg-[#B32E00] text-white font-bold transition cursor-pointer text-[11px] shadow-xs"
            title="Log off current Google session"
          >
            <LogOut size={13} />
            <span>{language === 'bn' ? 'লগ অফ (Log Off)' : 'Log Off'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setIsLocked(true);
                onClose();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold transition cursor-pointer text-[10px] shadow-xs"
            >
              <Lock size={12} />
              <span>PIN</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
