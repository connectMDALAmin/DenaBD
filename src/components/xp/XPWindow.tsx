import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { XPTitleBar } from './XPTitleBar';
import { XPIcon } from './XPIcon';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';

interface XPWindowProps {
  title: string;
  iconName?: React.ComponentProps<typeof XPIcon>['name'];
  children: React.ReactNode;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  onOpenIslamicQuote?: () => void;
  onOpenDeveloperInfo?: () => void;
  isMaximized?: boolean;
  className?: string;
}

export const XPWindow: React.FC<XPWindowProps> = ({
  title,
  iconName = 'ledger',
  children,
  onMinimize,
  onMaximize,
  onClose,
  onOpenIslamicQuote,
  onOpenDeveloperInfo,
  isMaximized = true,
  className = '',
}) => {
  const { t, language, setLanguage } = useI18n();
  const { triggerSync, userProfile, openPrintModal } = useApp();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileButtonRef = React.useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Update position whenever File Menu is opened
  const handleToggleFileMenu = () => {
    if (activeMenu === 'file') {
      setActiveMenu(null);
    } else {
      if (fileButtonRef.current) {
        const rect = fileButtonRef.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + 1,
          left: rect.left,
        });
      }
      setActiveMenu('file');
    }
  };

  // Close on Escape or reposition on window resize/scroll
  React.useEffect(() => {
    if (activeMenu !== 'file') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveMenu(null);
    };
    const handleReposition = () => {
      if (fileButtonRef.current) {
        const rect = fileButtonRef.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + 1,
          left: rect.left,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [activeMenu]);

  return (
    <div
      className={`flex flex-col bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[8px] xp-window-shadow overflow-hidden ${
        isMaximized
          ? 'w-full h-full'
          : 'w-full max-w-5xl max-h-[90vh] my-auto mx-auto shadow-2xl'
      } ${className}`}
    >
      {/* Title Bar */}
      <XPTitleBar
        title={title}
        iconName={iconName}
        theme={userProfile.theme}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        isMaximized={isMaximized}
      />

      {/* Classic Menu Bar */}
      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 bg-[#ECE9D8] border-b border-[#D0CCB8] text-[11px] sm:text-[12px] text-[#222222] select-none relative z-30 whitespace-nowrap overflow-x-auto no-scrollbar">
        {/* File Menu Button */}
        <div className="relative shrink-0">
          <button
            ref={fileButtonRef}
            type="button"
            onClick={handleToggleFileMenu}
            className={`px-2 py-0.5 rounded-[2px] hover:bg-[#316AC5] hover:text-white cursor-pointer transition select-none ${
              activeMenu === 'file' ? 'bg-[#316AC5] text-white shadow-xs' : ''
            }`}
          >
            File
          </button>

          {/* File Menu Dropdown via React Portal to document.body: Prevents all container overflow & clipping */}
          {activeMenu === 'file' &&
            typeof document !== 'undefined' &&
            ReactDOM.createPortal(
              <>
                {/* Click-outside backdrop to dismiss */}
                <div
                  className="fixed inset-0 z-[99998] bg-transparent"
                  onClick={() => setActiveMenu(null)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveMenu(null);
                  }}
                />
                {/* Dropdown Menu Container */}
                <div
                  className="fixed z-[99999] w-52 bg-[#FFFFFF] border-2 border-[#0055EA] rounded-[2px] shadow-2xl py-1 text-[12px] text-black font-sans select-none animate-in fade-in duration-75 xp-bevel-outset"
                  style={{
                    top: `${menuPos.top}px`,
                    left: `${menuPos.left}px`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      triggerSync();
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <XPIcon name="sync" size={15} />
                    <span className="font-medium">Sync with Cloud</span>
                  </button>
                  <div className="border-t border-[#E0E0E0] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu(null);
                      openPrintModal();
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <XPIcon name="print" size={15} />
                    <span className="font-medium">Print Statement</span>
                  </button>
                </div>
              </>,
              document.body
            )}
        </div>

        {/* Direct Language Toggle (Immediately switches between Bangla & English) */}
        <button
          type="button"
          onClick={() => {
            setActiveMenu(null);
            setLanguage(language === 'bn' ? 'en' : 'bn');
          }}
          className="px-2 py-0.5 rounded-[2px] hover:bg-[#316AC5] hover:text-white cursor-pointer shrink-0 transition flex items-center gap-1.5 font-medium select-none"
          title={
            language === 'bn'
              ? 'Click to switch language to English'
              : 'বাংলা ভাষায় পরিবর্তন করতে ক্লিক করুন'
          }
        >
          <span>🌐</span>
          <span>Language: {language === 'bn' ? 'বাংলা' : 'English'}</span>
        </button>
      </div>

      {/* Main Window Client Area with Inset Bevel */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-[#F5F4EC]">
        {children}
      </div>

      {/* Classic Window Status Bar */}
      <div className="h-6 px-3 bg-[#ECE9D8] border-t border-[#D0CCB8] flex items-center justify-between text-[11px] text-[#444444] select-none shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#388E3C] inline-block" />
          Ready
        </span>
        <span className="hidden sm:inline font-mono">
          Security: Active • 100% Offline Ready
        </span>
      </div>
    </div>
  );
};
