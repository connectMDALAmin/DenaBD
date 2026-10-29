import React, { useState } from 'react';
import { XPTitleBar } from './XPTitleBar';
import { XPIcon } from './XPIcon';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { Code2, Mail, UserCheck, Cpu, Database, Smartphone, CheckCircle } from 'lucide-react';

interface DeveloperInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperInfoModal: React.FC<DeveloperInfoModalProps> = ({ isOpen, onClose }) => {
  const { language } = useI18n();
  const { syncState, lastSyncTime, contacts, transactions } = useApp();
  const [emailCopied, setEmailCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('AR2x7AR@gmail.com');
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <XPTitleBar
          title={language === 'bn' ? 'ডেভেলপার পরিচিতি ও সিস্টেম তথ্য' : 'About DenaPawna & Developer Info'}
          iconName="settings"
          onClose={onClose}
        />

        <div className="p-4 sm:p-5 space-y-4">
          {/* Windows XP Header Banner */}
          <div className="flex items-center gap-3.5 pb-3 border-b border-[#D0CCB8]">
            <div className="w-12 h-12 rounded-[4px] bg-white border border-[#7F9DB9] xp-bevel-outset flex items-center justify-center shadow-xs">
              <span className="grid grid-cols-2 gap-0.5 w-7 h-7 transform -rotate-6">
                <span className="bg-[#EB4128] rounded-tl-xs shadow-xs" />
                <span className="bg-[#43A047] rounded-tr-xs shadow-xs" />
                <span className="bg-[#1E88E5] rounded-bl-xs shadow-xs" />
                <span className="bg-[#FFB300] rounded-br-xs shadow-xs" />
              </span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 tracking-wide">
                DenaPawna (দেনাপাওনা)
              </h2>
              <div className="text-[11px] text-gray-600 font-medium">
                DenaPawna App @PoweredBY-AL Amin Arnob
              </div>
              <div className="text-[10px] text-gray-500">
                Copyright © 2026 DenaPawna Digital Ledger. All rights reserved.
              </div>
            </div>
          </div>

          {/* Developer Credentials Card */}
          <div className="p-3 bg-white border border-[#7F9DB9] rounded-[4px] xp-bevel-inset space-y-2.5">
            <div className="font-bold text-xs text-[#002570] flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <Code2 size={15} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'সফটওয়্যার ডেভেলপার তথ্য' : 'Developer Information'}</span>
            </div>

            <div className="space-y-1.5 text-xs text-gray-800">
              <div className="flex items-start gap-2">
                <UserCheck size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 block text-[10px]">{language === 'bn' ? 'প্রধান প্রকৌশলী ও স্থপতি' : 'Lead Engineer & Architect'}</span>
                  <span className="font-bold text-gray-900">AL-Amin Arnob</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-gray-500 block text-[10px]">{language === 'bn' ? 'যোগাযোগ ইমেইল' : 'Contact Email'}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="mailto:AR2x7AR@gmail.com"
                      className="font-mono text-blue-700 hover:underline font-medium"
                    >
                      AR2x7AR@gmail.com
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 cursor-pointer"
                    >
                      {emailCopied ? (language === 'bn' ? '✓ কপি হয়েছে' : '✓ Copied') : (language === 'bn' ? 'কপি' : 'Copy')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Cpu size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 block text-[10px]">{language === 'bn' ? 'প্রযুক্তি কাঠামো' : 'Tech Architecture'}</span>
                  <span className="font-mono text-[11px] text-gray-700">
                    React 19 • TypeScript • Tailwind CSS • Capacitor 6 • Web Crypto
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Database size={14} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-500 block text-[10px]">{language === 'bn' ? 'ক্লাউড ডেটাবেজ' : 'Cloud Database'}</span>
                  <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block truncate max-w-[280px]">
                    ai-studio-pawna-cbcff9c8-de63-455d-9cbe-7e53a42a98e3
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* System Environment Summary */}
          <div className="p-2.5 bg-[#F5F8FF] border border-[#7F9DB9] rounded-[4px] text-[11px] space-y-1">
            <div className="flex items-center justify-between text-gray-600">
              <span>Platform Target:</span>
              <span className="font-bold text-blue-900 font-mono">Web SPA & Android Native (APK)</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Data Records:</span>
              <span className="font-mono text-gray-800">{contacts.length} Contacts, {transactions.length} Ledger Txs</span>
            </div>
            <div className="flex items-center justify-between text-gray-600">
              <span>Sync Status:</span>
              <span className="font-bold text-emerald-700 uppercase font-mono">{syncState}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={onClose}
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
