import React, { useState, useEffect } from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { XPIcon } from './XPIcon';
import { Volume2, VolumeX, Wifi, WifiOff, RefreshCw, Shield } from 'lucide-react';
import { XPStartMenu } from './XPStartMenu';
import { soundService } from '../../services/sound/soundService';

interface TabItem {
  id: ActiveTab;
  labelKey: 'navDashboard' | 'navContacts' | 'navLedger' | 'navReminders' | 'navAnalytics' | 'navPublicLookup' | 'navBackup' | 'navSettings' | 'navAndroidBuild';
  icon: React.ComponentProps<typeof XPIcon>['name'];
}

const TABS: TabItem[] = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: 'ledger' },
  { id: 'contacts', labelKey: 'navContacts', icon: 'contact' },
  { id: 'ledger', labelKey: 'navLedger', icon: 'money' },
  { id: 'reminders', labelKey: 'navReminders', icon: 'reminders' },
  { id: 'analytics', labelKey: 'navAnalytics', icon: 'analytics' },
  { id: 'publicLookup', labelKey: 'navPublicLookup', icon: 'lookup' },
  { id: 'backup', labelKey: 'navBackup', icon: 'backup' },
  { id: 'settings', labelKey: 'navSettings', icon: 'settings' },
  { id: 'androidGuide', labelKey: 'navAndroidBuild', icon: 'android' },
];

interface XPTaskbarProps {
  onOpenDeveloperInfo?: () => void;
  onOpenLogOff?: () => void;
}

export const XPTaskbar: React.FC<XPTaskbarProps> = ({
  onOpenDeveloperInfo,
  onOpenLogOff,
}) => {
  const { activeTab, setActiveTab, syncState, triggerSync, lastSyncTime, isAdmin, firebaseUser } = useApp();
  const { t, language } = useI18n();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => !soundService.isSoundEnabled());

  // Live Date & Time formatted for Asia/Dhaka timezone
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          timeZone: 'Asia/Dhaka',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleVolume = () => {
    const nextMuted = soundService.toggleSound();
    setIsMuted(!nextMuted);
    try {
      localStorage.setItem('xp_audio_muted', String(!nextMuted));
    } catch {
      // Safe fallback
    }
  };

  // Only the currently active application window is shown on the taskbar
  const activeTabItem = activeTab === 'admin'
    ? {
        label: language === 'bn' ? 'অ্যাডমিন' : 'Admin',
        icon: 'shield' as React.ComponentProps<typeof XPIcon>['name'],
      }
    : TABS.find((tab) => tab.id === activeTab)
      ? {
          label: t(TABS.find((tab) => tab.id === activeTab)!.labelKey),
          icon: TABS.find((tab) => tab.id === activeTab)!.icon,
        }
      : null;

  return (
    <>
      <XPStartMenu
        isOpen={startMenuOpen}
        onClose={() => setStartMenuOpen(false)}
        onOpenDeveloperInfo={onOpenDeveloperInfo}
        onOpenLogOff={onOpenLogOff}
      />

      <footer className="fixed bottom-0 left-0 right-0 h-[32px] xp-taskbar z-50 flex items-center justify-between select-none shadow-lg border-t border-[#3169DB]">
        {/* Left: Start Button & Quick Launch */}
        <div className="flex items-center h-full">
          {/* Authentic XP Start Button */}
          <button
            type="button"
            onClick={() => setStartMenuOpen((prev) => !prev)}
            className="h-full px-4 rounded-r-[12px] xp-start-btn flex items-center gap-1.5 font-bold italic text-white text-[14px] cursor-pointer"
          >
            {/* Windows 4-Color Flag */}
            <span className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5 transform -rotate-12">
              <span className="bg-[#EB4128] rounded-tl-sm" />
              <span className="bg-[#43A047] rounded-tr-sm" />
              <span className="bg-[#1E88E5] rounded-bl-sm" />
              <span className="bg-[#FFB300] rounded-br-sm" />
            </span>
            <span className="tracking-wide">{t('startMenu')}</span>
          </button>

          {/* Quick Launch separator and icons */}
          <div className="hidden md:flex items-center gap-1 px-2 border-r border-[#1941A5]/60 h-[22px]">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              title="Show Desktop / Overview"
              className="p-1 hover:bg-white/20 rounded cursor-pointer transition"
            >
              <XPIcon name="ledger" size={16} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              title="Ledger"
              className="p-1 hover:bg-white/20 rounded cursor-pointer transition"
            >
              <XPIcon name="money" size={16} />
            </button>
            <button
              type="button"
              onClick={() => triggerSync()}
              title="Sync Now"
              className="p-1 hover:bg-white/20 rounded cursor-pointer transition"
            >
              <RefreshCw size={13} className="text-white" />
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                title="Admin Control Panel"
                className="p-1 hover:bg-white/20 rounded cursor-pointer transition text-amber-300"
              >
                <Shield size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenDeveloperInfo?.()}
              title={language === 'bn' ? 'ডেভেলপার পরিচিতি' : 'Developer Info'}
              className="px-1 py-0.5 hover:bg-white/20 rounded cursor-pointer transition text-xs"
            >
              👨‍💻
            </button>
          </div>

          {/* Taskbar Button: Show ONLY the currently active application/window */}
          <div className="flex items-center px-2 min-w-0">
            {activeTabItem && (
              <button
                type="button"
                className="h-[24px] px-3 max-w-[220px] truncate rounded-[2px] flex items-center gap-1.5 text-[11px] font-semibold transition cursor-pointer select-none bg-[#1E52B7] text-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.6)] border border-[#113888]"
                title={activeTabItem.label}
              >
                <XPIcon name={activeTabItem.icon} size={14} className="shrink-0" />
                <span className="truncate">{activeTabItem.label}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: XP System Tray */}
        <div className="h-full px-2.5 xp-systray flex items-center gap-2 text-white text-[11px] shrink-0">
          {/* User Email Indicator */}
          {firebaseUser && (
            <span className="hidden lg:inline-block text-[10px] text-blue-100 max-w-[130px] truncate opacity-90">
              {firebaseUser.email}
            </span>
          )}

          {/* Online/Sync Status Indicator */}
          <button
            type="button"
            onClick={() => triggerSync()}
            title={`Status: ${syncState.toUpperCase()} (Last synced: ${new Date(lastSyncTime).toLocaleTimeString()})`}
            className="flex items-center gap-1 hover:opacity-80 cursor-pointer"
          >
            {syncState === 'syncing' ? (
              <RefreshCw size={13} className="animate-spin text-amber-300" />
            ) : syncState === 'offline' ? (
              <WifiOff size={13} className="text-red-300" />
            ) : (
              <Wifi size={13} className="text-emerald-300" />
            )}
            <span className="hidden xl:inline text-[10px] uppercase font-mono tracking-tight">
              {syncState}
            </span>
          </button>

          {/* Functional Volume Control Button (Toggles mute/unmute with visual icon & state) */}
          <button
            type="button"
            onClick={handleToggleVolume}
            title={
              isMuted
                ? language === 'bn'
                  ? 'ভলিউম বন্ধ (মিউট) — ক্লিক করে আনমিউট করুন'
                  : 'Volume Muted (Click to unmute)'
                : language === 'bn'
                  ? 'ভলিউম চালু — ক্লিক করে মিউট করুন'
                  : 'Volume Active (Click to mute)'
            }
            aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
            className={`p-1 rounded cursor-pointer transition flex items-center justify-center ${
              isMuted
                ? 'bg-red-900/60 text-red-200 border border-red-400/50 hover:bg-red-800/80 shadow-inner'
                : 'hover:bg-white/20 active:bg-black/20 text-white'
            }`}
          >
            {isMuted ? (
              <VolumeX size={14} className="text-red-300 drop-shadow" />
            ) : (
              <Volume2 size={14} className="text-white opacity-95 drop-shadow" />
            )}
          </button>

          {/* Clock: Displays both current date and live time in Asia/Dhaka timezone */}
          <div
            className="flex flex-col items-end justify-center px-1 text-right select-none leading-none font-sans ml-1 cursor-default"
            title={`Asia/Dhaka: ${dateStr} ${timeStr}`}
          >
            <span className="font-semibold text-[11px] text-white tracking-tight leading-none">
              {timeStr || '12:00:00 PM'}
            </span>
            <span className="text-[9px] text-blue-100 font-medium tracking-tight mt-0.5 leading-none opacity-90">
              {dateStr}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};
