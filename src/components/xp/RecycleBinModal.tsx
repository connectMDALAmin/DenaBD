import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { XPIcon } from './XPIcon';
import { Trash2, AlertCircle, CheckCircle2, RotateCcw, X, ShieldAlert } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface RecycleBinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecycleBinModal: React.FC<RecycleBinModalProps> = ({ isOpen, onClose }) => {
  const { language } = useI18n();
  const { setActiveTab } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-2 sm:p-4 bg-black/35 backdrop-blur-[1px] animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[6px] xp-window-shadow overflow-hidden text-xs select-none">
        {/* Title Bar */}
        <div className="xp-titlebar-blue px-3 py-1.5 flex items-center justify-between text-white font-bold select-none cursor-default">
          <div className="flex items-center gap-2">
            <XPIcon name="recyclebin" size={16} />
            <span className="text-sm">
              {language === 'bn' ? 'রিসাইকেল বিন (Recycle Bin)' : 'Recycle Bin'}
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
            <XPIcon name="recyclebin" size={12} />
            <span>Recycle Bin</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 bg-white min-h-[180px] flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
            <XPIcon name="recyclebin" size={36} />
          </div>

          <div className="space-y-1 max-w-xs">
            <h4 className="font-bold text-gray-900 text-sm">
              {language === 'bn' ? 'রিসাইকেল বিন খালি (The Recycle Bin is empty)' : 'The Recycle Bin is empty'}
            </h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              {language === 'bn'
                ? 'বর্তমানে কোনো মুছে ফেলা আইটেম বা পেন্ডিং ফাইল নেই। মুছে ফেলা কোনো লেনদেন বা কন্ট্যাক্ট স্থায়ীভাবে সিস্টেম ডাটাবেজে অডিট ট্রেইলে সংরক্ষিত থাকে।'
                : 'There are no deleted items or pending temporary files in the Recycle Bin. System security logs all removals in Firestore.'}
            </p>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                onClose();
                setActiveTab('backup');
              }}
              className="xp-button px-3 py-1 text-xs text-gray-800 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>{language === 'bn' ? 'ডাটা ব্যাকআপ ও হিস্টোরি দেখুন' : 'View Data Backup & History'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#ECE9D8] border-t border-[#D0CCB8] px-3 py-2 flex items-center justify-between text-[11px] text-gray-600">
          <span>0 items</span>
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
