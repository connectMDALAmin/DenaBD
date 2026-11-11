import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { XPIcon } from './XPIcon';
import { FileText, Download, Printer, HardDriveDownload, FileSpreadsheet, X, ArrowUpRight } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface MyDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrint: () => void;
  onOpenBackup: () => void;
}

export const MyDocumentsModal: React.FC<MyDocumentsModalProps> = ({
  isOpen,
  onClose,
  onOpenPrint,
  onOpenBackup,
}) => {
  const { language } = useI18n();
  const { contacts, transactions, userProfile } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-2 sm:p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-100">
      <div className="w-full max-w-xl bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[6px] xp-window-shadow overflow-hidden text-xs select-none">
        {/* Title Bar */}
        <div className="xp-titlebar-blue px-3 py-1.5 flex items-center justify-between text-white font-bold select-none cursor-default">
          <div className="flex items-center gap-2">
            <XPIcon name="documents" size={16} />
            <span className="text-sm">
              {language === 'bn' ? 'আমার ডকুমেন্টস (My Documents)' : 'My Documents'}
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

        {/* Address Bar */}
        <div className="bg-[#ECE9D8] border-b border-[#D0CCB8] px-2 py-1 flex items-center gap-2 text-[11px] text-[#444]">
          <span className="font-semibold text-gray-700">Address:</span>
          <div className="flex-1 bg-white border border-[#7F9DB9] px-2 py-0.5 rounded-[2px] flex items-center gap-1.5 xp-bevel-inset text-black font-mono">
            <XPIcon name="documents" size={12} />
            <span>C:\Documents and Settings\{userProfile.ownerName || 'User'}\My Documents</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 bg-white max-h-[75vh] overflow-y-auto space-y-4">
          <p className="text-[11px] text-gray-600">
            {language === 'bn'
              ? 'আপনার প্রতিষ্ঠানের তৈরি হওয়া সমস্ত চালান, ব্যালেন্স শিট, ব্যাকআপ এবং রিপোর্টের ফাইলসমূহ:'
              : 'Stored statements, financial export files, and system backup archives for your business:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Document Item 1: Printable Statements */}
            <div
              onClick={() => {
                soundService.playClick();
                onClose();
                onOpenPrint();
              }}
              className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                <Printer size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1">
                  <span>{language === 'bn' ? 'খাতা প্রিন্ট স্টেটমেন্ট (PDF)' : 'Print Statement (PDF)'}</span>
                  <ArrowUpRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  A4 Printable Voucher & Balance Sheet
                </div>
                <span className="inline-block mt-1 text-[9.5px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded border border-red-200">
                  Ready to Print
                </span>
              </div>
            </div>

            {/* Document Item 2: JSON Backup Archive */}
            <div
              onClick={() => {
                soundService.playClick();
                onClose();
                onOpenBackup();
              }}
              className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-[#0055EA] shrink-0 group-hover:scale-105 transition-transform">
                <HardDriveDownload size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1">
                  <span>{language === 'bn' ? 'সিস্টেম ব্যাকআপ ও রিস্টোর' : 'Backup & Restore Vault'}</span>
                  <ArrowUpRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Schema v2.5 JSON Snapshot Vault
                </div>
                <span className="inline-block mt-1 text-[9.5px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                  {contacts.length} Contacts Saved
                </span>
              </div>
            </div>

            {/* Document Item 3: CSV Spreadsheet Export */}
            <div
              onClick={() => {
                soundService.playClick();
                onClose();
                onOpenBackup();
              }}
              className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1">
                  <span>{language === 'bn' ? 'এক্সেল সিএসভি এক্সপোর্ট' : 'Excel CSV Reports'}</span>
                  <ArrowUpRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  UTF-8 BOM Encoded Bangla Sheet
                </div>
                <span className="inline-block mt-1 text-[9.5px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                  Excel Compatible
                </span>
              </div>
            </div>

            {/* Document Item 4: Customer Directory Sheet */}
            <div
              onClick={() => {
                soundService.playClick();
                onClose();
                onOpenBackup();
              }}
              className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-[4px] flex items-start gap-3 hover:bg-blue-50 cursor-pointer transition group"
            >
              <div className="w-10 h-10 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 text-xs flex items-center gap-1">
                  <span>{language === 'bn' ? 'কাস্টমার ডিরেক্টরি ফাইল' : 'Customer Contacts File'}</span>
                  <ArrowUpRight size={12} className="text-gray-400 group-hover:text-blue-600" />
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  Direct CSV Contact Export / Import
                </div>
                <span className="inline-block mt-1 text-[9.5px] bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                  {transactions.length} Transactions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] border-t border-[#D0CCB8] px-3 py-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              onClose();
            }}
            className="xp-button px-4 py-1 text-xs font-semibold text-gray-800"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
