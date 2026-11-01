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
  isAppMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const XPTaskbar: React.FC<XPTaskbarProps> = ({
  onOpenDeveloperInfo,
  onOpenLogOff,
  isAppMinimized = false,
  onToggleMinimize,
}) => {
  const { activeTab, setActiveTab, syncState, triggerSync, lastSyncTime, isAdmin, firebaseUser } = useApp();
  const { t, language } = useI18n();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(() => !soundService.isSoundEnabled());
  const [volumeLevel, setVolumeLevel] = useState<number>(() => Math.round(soundService.getVolume() * 100));
  const [volumePopupOpen, setVolumePopupOpen] = useState<boolean>(false);

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

  const handleToggleVolumePopup = () => {
    setVolumePopupOpen((prev) => !prev);
    soundService.playClick();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolumeLevel(val);
    soundService.setVolume(val / 100);
    if (val > 0 && isMuted) {
      soundService.setSoundEnabled(true);
      setIsMuted(false);
    }
  };

  const handleToggleMuteCheckbox = () => {
    const nextMuted = soundService.toggleSound();
    setIsMuted(!nextMuted);
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

      {/* Volume Control XP Popup Dialog */}
      {volumePopupOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setVolumePopupOpen(false)}
          />
          <div
            className="fixed bottom-[34px] right-6 w-48 bg-[#ECE9D8] border-2 border-[#0055EA] rounded-[3px] shadow-2xl p-2 z-50 text-gray-900 select-none animate-in fade-in duration-75 xp-bevel-outset font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Titlebar */}
            <div className="flex items-center justify-between px-1.5 py-0.5 bg-gradient-to-r from-[#0055EA] to-[#3A80F2] text-white text-[11px] font-bold rounded-xs mb-2">
              <span>{language === 'bn' ? 'ভলিউম কন্ট্রোল' : 'Volume Control'}</span>
              <button
                type="button"
                onClick={() => setVolumePopupOpen(false)}
                className="w-3.5 h-3.5 bg-[#D83B01] hover:bg-[#B32E00] text-white rounded-2xs flex items-center justify-center text-[10px] leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Master Volume Slider */}
            <div className="flex flex-col items-center gap-1.5 px-2.5 py-2 bg-white border border-[#7F9DB9] xp-bevel-inset rounded-xs">
              <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                Master Volume
              </div>
              <div className="flex items-center justify-between w-full text-[9px] text-gray-500 font-mono">
                <span>0%</span>
                <span className="font-bold text-blue-700">{isMuted ? 'Muted' : `${volumeLevel}%`}</span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volumeLevel}
                onChange={handleSliderChange}
                className="w-full accent-[#0055EA] cursor-pointer"
              />
              <div className="w-full flex items-center justify-between pt-1.5 border-t border-gray-200 mt-1">
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isMuted}
                    onChange={handleToggleMuteCheckbox}
                    className="accent-[#0055EA] cursor-pointer"
                  />
                  <span className="font-semibold text-gray-800">
                    {language === 'bn' ? 'মিউট (Mute)' : 'Mute'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => soundService.playClick()}
                  title="Test sound click"
                  className="text-[10px] text-blue-700 hover:underline cursor-pointer font-medium"
                >
                  {language === 'bn' ? 'সাউন্ড টেস্ট' : 'Test'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

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

          {/* Quick Launch: ONLY Show Desktop / Overview */}
          <div className="flex items-center px-2 border-r border-[#1941A5]/60 h-[22px]">
            <button
              type="button"
              onClick={() => {
                onToggleMinimize?.();
                soundService.playClick();
              }}
              title={
                isAppMinimized
                  ? (language === 'bn' ? 'উইন্ডো ফিরিয়ে আনুন (Restore Window)' : 'Restore Window')
                  : (language === 'bn' ? 'ডেস্কটপ ও সার্বিক চিত্র প্রদর্শন (Show Desktop / Overview)' : 'Show Desktop / Overview')
              }
              className="p-1 hover:bg-white/20 active:bg-black/30 rounded cursor-pointer transition flex items-center justify-center text-white"
            >
              {/* Authentic Windows XP Show Desktop Icon: blue blotter / desk */}
              <div className="w-4 h-4 bg-gradient-to-b from-[#2A74E8] to-[#124294] border border-[#B3D4FF] rounded-[2px] flex items-center justify-center shadow-xs">
                <div className="w-2.5 h-2 bg-[#FEEB83] border border-[#8C6D1F] rounded-[1px] shadow-2xs" />
              </div>
            </button>
          </div>

          {/* Taskbar Button: Show ONLY the currently active application/window */}
          <div className="flex items-center px-2 min-w-0">
            {activeTabItem && (
              <button
                type="button"
                onClick={() => {
                  onToggleMinimize?.();
                  soundService.playClick();
                }}
                className={`h-[24px] px-3 max-w-[220px] truncate rounded-[2px] flex items-center gap-1.5 text-[11px] font-semibold transition cursor-pointer select-none ${
                  isAppMinimized
                    ? 'bg-[#2A6CEB] hover:bg-[#3B7BF2] text-white/90 border border-[#1752D8]'
                    : 'bg-[#1E52B7] text-white shadow-[inset_1px_1px_2px_rgba(0,0,0,0.6)] border border-[#113888]'
                }`}
                title={`${activeTabItem.label} — ${isAppMinimized ? 'Click to restore' : 'Click to minimize'}`}
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

          {/* Volume Control Button: Opens Master Volume Slider Popup */}
          <button
            type="button"
            onClick={handleToggleVolumePopup}
            title={
              isMuted
                ? language === 'bn'
                  ? 'ভলিউম বন্ধ (মিউট) — ভলিউম স্লাইডার খুলতে ক্লিক করুন'
                  : 'Volume Muted — Click to open Volume Slider'
                : language === 'bn'
                  ? `ভলিউম: ${volumeLevel}% — ভলিউম স্লাইডার খুলতে ক্লিক করুন`
                  : `Volume: ${volumeLevel}% — Click to open Volume Slider`
            }
            aria-label="Volume Control"
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
