import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface DangerConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  itemCountInfo?: string;
  confirmPhrase: string;
  alternativePhrase?: string;
  confirmButtonText: string;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const DangerConfirmModal: React.FC<DangerConfirmModalProps> = ({
  isOpen,
  title,
  description,
  itemCountInfo,
  confirmPhrase,
  alternativePhrase,
  confirmButtonText,
  onConfirm,
  onClose,
}) => {
  const [typedValue, setTypedValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedValue('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedInput = typedValue.trim().toUpperCase();
  const normalizedConfirm = confirmPhrase.trim().toUpperCase();
  const normalizedAlt = alternativePhrase?.trim().toUpperCase();

  const isMatch =
    normalizedInput === normalizedConfirm || (normalizedAlt && normalizedInput === normalizedAlt);

  const handleConfirm = async () => {
    if (!isMatch || isDeleting) return;
    setIsDeleting(true);
    soundService.playClick();
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/50 flex items-center justify-center p-4 select-none font-sans">
      <div className="relative w-full max-w-md bg-[#ECE9D8] border-[3px] border-[#A91B0D] rounded-[8px] xp-window-shadow overflow-hidden text-[#222222] animate-in zoom-in-95 duration-100">
        {/* Title Bar */}
        <div className="h-[30px] px-2.5 flex items-center justify-between select-none bg-gradient-to-r from-[#C00000] via-[#E02020] to-[#990000] text-white font-bold text-[13px]">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300">⚠️</span>
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="xp-win-btn xp-win-close leading-none hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-[4px] bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle size={26} className="text-red-600" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
              <p className="text-xs text-gray-700 leading-relaxed">{description}</p>
              {itemCountInfo && (
                <div className="inline-block font-mono text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded mt-1">
                  {itemCountInfo}
                </div>
              )}
            </div>
          </div>

          {/* Typing Double Confirmation Instructions */}
          <div className="bg-white p-3 rounded-[3px] border border-[#7F9DB9] xp-bevel-inset space-y-2 text-xs">
            <label className="block text-gray-800 font-semibold text-[11px]">
              নিশ্চিত করতে নিচে হুবহু লিখুন (Type to confirm):
            </label>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-red-800 bg-red-50 p-1.5 border border-red-200 rounded select-all">
              <span>👉</span>
              <span>{confirmPhrase}</span>
            </div>
            <input
              type="text"
              autoFocus
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={`Type "${confirmPhrase}" here`}
              className="w-full px-2.5 py-1.5 bg-white border border-[#7F9DB9] outline-none font-mono text-xs focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                onClose();
              }}
              className="xp-button px-4 py-1.5 text-xs font-semibold cursor-pointer text-gray-800"
            >
              Cancel (বাতিল)
            </button>

            <button
              type="button"
              disabled={!isMatch || isDeleting}
              onClick={handleConfirm}
              className={`px-4 py-1.5 text-xs font-bold rounded-[3px] flex items-center gap-1.5 cursor-pointer transition ${
                isMatch && !isDeleting
                  ? 'bg-[#D32F2F] hover:bg-[#B71C1C] text-white border-2 border-[#8E0000] shadow-md'
                  : 'bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Trash2 size={13} />
              <span>{isDeleting ? 'Deleting...' : confirmButtonText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
