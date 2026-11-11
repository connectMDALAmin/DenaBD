import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { XPIcon } from './XPIcon';
import { HardDrive, Database, Cpu, Wifi, Server, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface MyComputerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyComputerModal: React.FC<MyComputerModalProps> = ({ isOpen, onClose }) => {
  const { language } = useI18n();
  const { syncState, contacts, transactions, userProfile, firebaseUser, lastSyncTime } = useApp();

  if (!isOpen) return null;

  // Estimate localStorage usage
  let storageUsageKb = 0;
  try {
    let totalLen = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalLen += (localStorage[key].length + key.length) * 2;
      }
    }
    storageUsageKb = Math.round(totalLen / 1024);
  } catch {}

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-2 sm:p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[6px] xp-window-shadow overflow-hidden text-xs select-none">
        {/* Title Bar */}
        <div className="xp-titlebar-blue px-3 py-1.5 flex items-center justify-between text-white font-bold select-none cursor-default">
          <div className="flex items-center gap-2">
            <XPIcon name="computer" size={16} />
            <span className="text-sm">
              {language === 'bn' ? 'আমার কম্পিউটার (My Computer)' : 'My Computer'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="w-5 h-5 bg-[#D83B01] hover:bg-[#E81123] active:bg-[#B71C1C] border border-[#FFFFFF]/80 rounded-[3px] flex items-center justify-center text-white cursor-pointer shadow-xs"
          >
            <X size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[#ECE9D8] border-b border-[#D0CCB8] px-2 py-1 flex items-center gap-2 text-[11px] text-[#444]">
          <span className="font-semibold text-gray-700">Address:</span>
          <div className="flex-1 bg-white border border-[#7F9DB9] px-2 py-0.5 rounded-[2px] flex items-center gap-1.5 xp-bevel-inset text-black font-mono">
            <XPIcon name="computer" size={12} />
            <span>C:\My Computer</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 bg-white max-h-[75vh] overflow-y-auto space-y-4">
          {/* Section 1: Hard Disk Drives */}
          <div>
            <h3 className="font-bold text-[#003399] border-b border-blue-200 pb-1 mb-2 flex items-center gap-1.5">
              <HardDrive size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'হার্ড ডিস্ক ড্রাইভ (Local Storage)' : 'Hard Disk Drives'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 transition cursor-default">
                <div className="w-10 h-10 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[#0055EA] shrink-0">
                  <HardDrive size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-xs">Local Disk (C:)</div>
                  <div className="text-[10.5px] text-gray-600 mt-0.5">
                    {storageUsageKb} KB used • 5.0 MB Free
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5">
                    <div
                      className="bg-[#0055EA] h-full rounded-full"
                      style={{ width: `${Math.max(5, Math.min(100, (storageUsageKb / 5120) * 100))}%` }}
                    />
                  </div>
                  <div className="text-[9.5px] text-emerald-700 font-semibold mt-1">
                    ✓ {contacts.length} Contacts • {transactions.length} Ledger Records
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 transition cursor-default">
                <div className="w-10 h-10 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0">
                  <Database size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 text-xs">Cloud Firestore (D:)</div>
                  <div className="text-[10.5px] text-gray-600 mt-0.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Status: {syncState.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1 truncate">
                    ID: ai-studio-pawna-cbcff...
                  </div>
                  <div className="text-[9.5px] text-blue-700 font-semibold mt-0.5">
                    Last Sync: {new Date(lastSyncTime).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: System Specifications */}
          <div>
            <h3 className="font-bold text-[#003399] border-b border-blue-200 pb-1 mb-2 flex items-center gap-1.5">
              <Cpu size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'সিস্টেম প্রোপার্টিজ (System Information)' : 'System Properties'}</span>
            </h3>
            <div className="bg-[#F9F9F6] border border-[#D0CCB8] p-3 rounded-[4px] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700">
              <div>
                <strong>Operating System:</strong> Windows XP Luna Edition
              </div>
              <div>
                <strong>Application:</strong> DenaPawna Khata Pro v2.5
              </div>
              <div>
                <strong>Engine:</strong> React 19 + TypeScript + Vite
              </div>
              <div>
                <strong>Architecture:</strong> Zero Floating-Point (Minor Units)
              </div>
              <div>
                <strong>Business:</strong> {userProfile.businessName || 'আমার ব্যবসা'}
              </div>
              <div>
                <strong>Owner:</strong> {userProfile.ownerName || 'Business Owner'}
              </div>
              <div>
                <strong>Authentication:</strong> {firebaseUser?.email || 'Local Session'}
              </div>
              <div>
                <strong>Security:</strong> SHA-256 WebCrypto Active
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] border-t border-[#D0CCB8] px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-600 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>100% Offline Ready with Cloud Backup</span>
          </span>
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="xp-button px-4 py-1 text-xs font-semibold text-gray-800"
          >
            {language === 'bn' ? 'ঠিক আছে' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
};
