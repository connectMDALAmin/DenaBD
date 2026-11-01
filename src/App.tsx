/**
 * DenaPawna (দেনাপাওনা) — Windows XP Digital Ledger & Khata
 */

import React, { useState, useEffect } from 'react';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { AppProvider, useApp, ActiveTab } from './context/AppContext';
import { WindowProvider, useWindow } from './context/WindowContext';

import { XPTaskbar } from './components/xp/XPTaskbar';
import { XPWindow } from './components/xp/XPWindow';
import { XPDesktopIcon } from './components/xp/XPDesktopIcon';
import { MobileNavBar } from './components/navigation/MobileNavBar';
import { XPIcon } from './components/xp/XPIcon';
import { XPLogonScreen } from './components/auth/XPLogonScreen';

import { DashboardView } from './features/dashboard/DashboardView';
import { AnalyticsCharts } from './features/dashboard/AnalyticsCharts';
import { ContactList } from './features/contacts/ContactList';
import { ContactDetailView } from './features/contacts/ContactDetailView';
import { ContactModal } from './features/contacts/ContactModal';
import { TransactionList } from './features/ledger/TransactionList';
import { TransactionModal } from './features/ledger/TransactionModal';
import { RemindersView } from './features/reminders/RemindersView';
import { PublicLookupView } from './features/public-lookup/PublicLookupView';
import { BackupRestoreView } from './features/backup/BackupRestoreView';
import { SettingsView } from './features/settings/SettingsView';
import { PinLockModal } from './features/settings/PinLockModal';
import { AndroidBuildGuide } from './features/android-guide/AndroidBuildGuide';
import { AdminPanelView } from './features/admin/AdminPanelView';

import { Contact, Transaction } from './types/accounting';
import { IslamicQuoteModal } from './components/xp/IslamicQuoteModal';
import { DeveloperInfoModal } from './components/xp/DeveloperInfoModal';
import { XPLogOffDialog } from './components/xp/XPLogOffDialog';
import { PrintableStatementDocument } from './components/statement/PrintableStatementDocument';
import { PrintStatementModal } from './components/statement/PrintStatementModal';
import { GoogleBrowserWindow } from './components/xp/GoogleBrowserWindow';
import { DisplayPropertiesModal, WallpaperConfig } from './components/xp/DisplayPropertiesModal';
import { shouldShowDailyIslamicQuote, markDailyIslamicQuoteShown } from './utils/dateUtils';
import { soundService } from './services/sound/soundService';
import { XPMaintenanceScreen } from './components/xp/XPMaintenanceScreen';
import { XPNewUserSetupModal } from './components/xp/XPNewUserSetupModal';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedContactId,
    setSelectedContactId,
    contacts,
    transactions,
    saveContact,
    saveTransaction,
    userProfile,
    firebaseUser,
    isAuthReady,
    isAdmin,
    isPrintModalOpen,
    setIsPrintModalOpen,
    printContactId,
    appSettings,
    updateAppSettings,
  } = useApp();

  const { t, language } = useI18n();

  // Desktop minimize & window visibility state
  const [isAppMinimized, setIsAppMinimized] = useState(false);

  // Google Browser Window & Display Properties states
  const [isGoogleBrowserOpen, setIsGoogleBrowserOpen] = useState(false);
  const [isDisplayPropertiesOpen, setIsDisplayPropertiesOpen] = useState(false);

  // Desktop Wallpaper State (persisted in localStorage)
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig>(() => {
    try {
      const stored = localStorage.getItem('denapawna_wallpaper');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return { preset: 'bliss' };
  });

  // Desktop Right-Click Context Menu State
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [preselectedContactId, setPreselectedContactId] = useState<string | null>(null);

  // Islamic Quote (Daily login popup) & Developer Info Modals
  const [isIslamicQuoteOpen, setIsIslamicQuoteOpen] = useState(false);
  const [isDeveloperInfoOpen, setIsDeveloperInfoOpen] = useState(false);
  const [isLogOffModalOpen, setIsLogOffModalOpen] = useState(false);
  const [isNewUserSetupOpen, setIsNewUserSetupOpen] = useState(false);

  // New User Onboarding Setup Check:
  // Prompt business setup modal for new users who haven't completed onboarding or have missing business info
  useEffect(() => {
    if (!firebaseUser) return;
    const isProfileUnset =
      !userProfile.onboardingCompleted &&
      (!userProfile.phone || !userProfile.address || !userProfile.businessName || userProfile.businessName === 'আমার ব্যবসা');
    if (isProfileUnset) {
      const timer = setTimeout(() => {
        setIsNewUserSetupOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [firebaseUser, userProfile.onboardingCompleted, userProfile.businessName, userProfile.phone, userProfile.address]);

  // Daily Islamic Quote Auto-popup:
  // Display one Islamic quote popup after login on the user's first successful login of each day (Asia/Dhaka timezone).
  // Shown only once per calendar day, even if user refreshes the page or navigates between screens.
  useEffect(() => {
    if (!firebaseUser) return;

    if (shouldShowDailyIslamicQuote(firebaseUser.uid)) {
      const timer = setTimeout(() => {
        setIsIslamicQuoteOpen(true);
        markDailyIslamicQuoteShown(firebaseUser.uid);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [firebaseUser]);

  // Windows XP sound effects integration: global click listener & logon chime
  useEffect(() => {
    const detach = soundService.attachGlobalClickListener();
    return () => detach();
  }, []);

  const hasPlayedLogonRef = React.useRef(false);
  useEffect(() => {
    if (firebaseUser && !hasPlayedLogonRef.current) {
      hasPlayedLogonRef.current = true;
      soundService.playLogon();
    } else if (!firebaseUser) {
      hasPlayedLogonRef.current = false;
    }
  }, [firebaseUser]);

  // Close context menu on global click or Escape
  useEffect(() => {
    const handleCloseMenu = () => setContextMenuPos(null);
    window.addEventListener('click', handleCloseMenu);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenuPos(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleCloseMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Window maximized state on desktop & mobile
  const [isMaximized, setIsMaximized] = useState(true);

  // Cross-platform browser Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Cross-platform Fullscreen handler (Desktop & Android Chrome / PWA)
  const toggleFullscreen = async () => {
    soundService.playClick();
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }
      } else {
        const doc = document as any;
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle request notice:', err);
    }
  };

  const handleToggleFullscreen = () => {
    toggleFullscreen();
    setIsMaximized(true);
  };

  const handleToggleMaximize = () => {
    soundService.playClick();
    setIsMaximized((prev) => !prev);
  };

  // Selected contact for detail view
  const currentContact = contacts.find((c) => c.id === selectedContactId);

  // Handlers
  const handleOpenNewContact = () => {
    setEditingContact(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  };

  const handleOpenNewTransaction = (contactId?: string) => {
    setEditingTx(null);
    setPreselectedContactId(contactId || null);
    setIsTxModalOpen(true);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTx(tx);
    setPreselectedContactId(tx.contactId);
    setIsTxModalOpen(true);
  };

  // If Firebase auth is initializing its initial session check
  if (!isAuthReady) {
    return (
      <div className="w-screen h-screen bg-[#00136B] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 grid grid-cols-2 gap-1 transform -rotate-6 mb-4 filter drop-shadow">
          <div className="bg-[#E73827] rounded-tl-sm" />
          <div className="bg-[#7FBA00] rounded-tr-sm" />
          <div className="bg-[#00A4EF] rounded-bl-sm" />
          <div className="bg-[#FFB900] rounded-br-sm" />
        </div>
        <div className="text-xl font-bold font-serif italic mb-3">
          Windows<span className="text-[#F18800] ml-1 font-sans not-italic text-sm">xp</span>
        </div>
        <div className="w-48 h-3 bg-[#111111] border border-[#555555] rounded-xs p-0.5 overflow-hidden flex items-center">
          <div className="flex gap-1 animate-pulse">
            <div className="w-3 h-2 bg-[#2A65FF] rounded-2xs" />
            <div className="w-3 h-2 bg-[#2A65FF] rounded-2xs" />
            <div className="w-3 h-2 bg-[#2A65FF] rounded-2xs" />
          </div>
        </div>
        <div className="text-xs text-[#A0C5FF] mt-3">
          DenaPawna (দেনাপাওনা) — Starting up...
        </div>
      </div>
    );
  }

  // Maintenance Mode Check: Block standard users when maintenance mode is active
  if (appSettings?.maintenanceMode && !isAdmin) {
    return <XPMaintenanceScreen />;
  }

  // Protected Route: Require authentication before accessing the application
  if (!firebaseUser) {
    return <XPLogonScreen />;
  }

  const getWindowConfig = (): {
    title: string;
    icon: React.ComponentProps<typeof XPIcon>['name'];
  } => {
    switch (activeTab) {
      case 'dashboard':
        return { title: `${userProfile.businessName} — ${t('navDashboard')}`, icon: 'ledger' };
      case 'contacts':
        return {
          title: currentContact
            ? `${currentContact.name} — ${language === 'bn' ? 'খাতা বিবরণ' : 'Statement'}`
            : t('navContacts'),
          icon: 'contact',
        };
      case 'ledger':
        return { title: `${t('navLedger')} (${userProfile.businessName})`, icon: 'money' };
      case 'reminders':
        return { title: t('remindersTitle'), icon: 'reminders' };
      case 'analytics':
        return { title: t('analyticsTitle'), icon: 'analytics' };
      case 'publicLookup':
        return { title: t('publicLookupTitle'), icon: 'lookup' };
      case 'backup':
        return { title: t('backupTitle'), icon: 'backup' };
      case 'settings':
        return { title: t('settingsTitle'), icon: 'settings' };
      case 'androidGuide':
        return { title: t('androidGuideTitle'), icon: 'android' };
      case 'admin':
        return {
          title: language === 'bn' ? 'দেনাপাওনা অ্যাডমিন ও নিরাপত্তা প্যানেল' : 'DenaPawna Security & Control Panel',
          icon: 'shield',
        };
      default:
        return { title: 'DenaPawna Khata Pro', icon: 'ledger' };
    }
  };

  const winConfig = getWindowConfig();

  // Handle saving wallpaper config
  const handleApplyWallpaper = (config: WallpaperConfig) => {
    setWallpaperConfig(config);
    try {
      localStorage.setItem('denapawna_wallpaper', JSON.stringify(config));
    } catch {
      // ignore
    }
  };

  const handleToggleMinimize = () => {
    setIsAppMinimized((prev) => !prev);
  };

  return (
    <>
      <div
        className="no-print relative w-screen max-w-full h-[100dvh] overflow-hidden flex flex-col justify-between select-none"
        onContextMenu={(e) => {
          // If right clicking on desktop or wallpaper area
          const target = e.target as HTMLElement;
          if (
            target.tagName !== 'INPUT' &&
            target.tagName !== 'TEXTAREA' &&
            !target.closest('main')
          ) {
            e.preventDefault();
            soundService.playClick();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        {/* Admin Maintenance Mode Notice Banner */}
        {isAdmin && appSettings?.maintenanceMode && (
          <div className="bg-[#FFFFCC] border-b border-[#D4C07B] px-3 py-1 flex items-center justify-between text-xs text-[#665200] z-50 shrink-0 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">⚠️</span>
              <span className="font-bold">
                {language === 'bn'
                  ? 'মেইনটেনেন্স মোড সক্রিয়: সাধারণ ব্যবহারকারীদের প্রবেশাধিকার ব্লক রয়েছে।'
                  : 'MAINTENANCE MODE ACTIVE: Standard user access is blocked.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                updateAppSettings({ maintenanceMode: false });
              }}
              className="xp-button px-2.5 py-0.5 text-xs text-red-700 font-bold cursor-pointer hover:bg-red-50 border-red-300"
            >
              {language === 'bn' ? 'মেইনটেনেন্স বন্ধ করুন' : 'Turn Off Maintenance Mode'}
            </button>
          </div>
        )}

      {/* Dynamic Desktop Wallpaper Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden">
        {wallpaperConfig.preset === 'bliss' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C72D8] via-[#489FFB] to-[#3B9229]">
            {/* Stylized Bliss Clouds */}
            <div className="absolute top-6 left-12 w-96 h-28 bg-white/30 rounded-full blur-2xl" />
            <div className="absolute top-16 right-20 w-80 h-24 bg-white/25 rounded-full blur-2xl" />
            {/* Rolling Green Hills Curve */}
            <div className="absolute -bottom-10 -left-20 right-0 h-64 bg-gradient-to-t from-[#2E7D32] via-[#43A047] to-[#66BB6A]/80 rounded-[50%_50%_0_0] transform -rotate-1 scale-110" />
          </div>
        )}

        {wallpaperConfig.preset === 'royale' && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2E76] via-[#1E57CD] to-[#0A1C44]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
          </div>
        )}

        {wallpaperConfig.preset === 'silver' && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#374151] via-[#6B7280] to-[#1F2937]" />
        )}

        {wallpaperConfig.preset === 'olive' && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#2D4A1D] via-[#608038] to-[#1E3612]" />
        )}

        {wallpaperConfig.preset === 'midnight' && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#030B1E] via-[#0B1D45] to-[#020611]" />
        )}

        {wallpaperConfig.preset === 'custom' && (
          wallpaperConfig.customUrl ? (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${wallpaperConfig.customUrl})` }}
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: wallpaperConfig.customColor || '#1A365D' }}
            />
          )
        )}
      </div>

      {/* Security PIN Lock Screen if locked */}
      <PinLockModal />

      {/* Main Desktop Workspace Area */}
      <div
        className={`relative z-10 flex-1 flex pb-[40px] sm:pb-[36px] overflow-hidden gap-2 ${
          !isAppMinimized && isMaximized ? 'p-0 sm:p-1' : 'p-1 sm:p-2.5'
        }`}
      >
        {/* Desktop Shortcut Icons with responsive wrapping & overflow protection */}
        <aside
          className={`flex-col flex-wrap content-start gap-1 py-1 z-10 shrink-0 max-h-full overflow-y-auto overflow-x-auto no-scrollbar scroll-smooth pr-1 ${
            !isAppMinimized ? (isMaximized ? 'hidden' : 'hidden md:flex') : 'flex'
          }`}
        >
          <XPDesktopIcon
            name="ledger"
            label={t('navDashboard')}
            sublabel="Overview"
            isActive={!isAppMinimized && activeTab === 'dashboard'}
            onClick={() => {
              setIsAppMinimized(false);
              setSelectedContactId(null);
              setActiveTab('dashboard');
            }}
          />
          <XPDesktopIcon
            name="contact"
            label={t('navContacts')}
            sublabel="Directory"
            isActive={!isAppMinimized && activeTab === 'contacts'}
            onClick={() => {
              setIsAppMinimized(false);
              setSelectedContactId(null);
              setActiveTab('contacts');
            }}
          />
          <XPDesktopIcon
            name="money"
            label={t('navLedger')}
            sublabel="Khata"
            isActive={!isAppMinimized && activeTab === 'ledger'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('ledger');
            }}
          />
          <XPDesktopIcon
            name="reminders"
            label={t('navReminders')}
            sublabel="Due Dates"
            isActive={!isAppMinimized && activeTab === 'reminders'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('reminders');
            }}
          />
          <XPDesktopIcon
            name="analytics"
            label={t('navAnalytics')}
            sublabel="Reports"
            isActive={!isAppMinimized && activeTab === 'analytics'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('analytics');
            }}
          />
          <XPDesktopIcon
            name="browser"
            label="Internet Explorer"
            sublabel="Google Search"
            isActive={isGoogleBrowserOpen}
            onClick={() => {
              soundService.playClick();
              setIsGoogleBrowserOpen(true);
            }}
          />
          <XPDesktopIcon
            name="lookup"
            label={t('navPublicLookup')}
            sublabel="Portal"
            isActive={!isAppMinimized && activeTab === 'publicLookup'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('publicLookup');
            }}
          />
          <XPDesktopIcon
            name="backup"
            label={t('navBackup')}
            sublabel="Data"
            isActive={!isAppMinimized && activeTab === 'backup'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('backup');
            }}
          />
          {isAdmin && (
            <XPDesktopIcon
              name="shield"
              label={language === 'bn' ? 'অ্যাডমিন' : 'Admin Panel'}
              sublabel="Security"
              isActive={!isAppMinimized && activeTab === 'admin'}
              onClick={() => {
                setIsAppMinimized(false);
                setActiveTab('admin');
              }}
            />
          )}
          <XPDesktopIcon
            name="settings"
            label={t('navSettings')}
            sublabel="Config"
            isActive={!isAppMinimized && activeTab === 'settings'}
            onClick={() => {
              setIsAppMinimized(false);
              setActiveTab('settings');
            }}
          />
          <XPDesktopIcon
            name="settings"
            label={language === 'bn' ? 'ডেভেলপার তথ্য' : 'Developer Info'}
            sublabel="System & Dev"
            isActive={isDeveloperInfoOpen}
            onClick={() => setIsDeveloperInfoOpen(true)}
          />
        </aside>

        {/* Active Application Window Container (Can be minimized) */}
        {!isAppMinimized && (
          <main className="flex-1 flex flex-col h-full min-w-0 w-full z-20 animate-in fade-in zoom-in-95 duration-100">
            <XPWindow
              title={winConfig.title}
              iconName={winConfig.icon}
              isMaximized={isMaximized}
              isFullscreen={isFullscreen}
              onMaximize={handleToggleMaximize}
              onToggleFullscreen={handleToggleFullscreen}
              onMinimize={() => {
                soundService.playClick();
                setIsAppMinimized(true);
              }}
              onClose={() => setActiveTab('dashboard')}
              onOpenDeveloperInfo={() => setIsDeveloperInfoOpen(true)}
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  onOpenNewTransaction={() => handleOpenNewTransaction()}
                  onOpenNewContact={handleOpenNewContact}
                />
              )}

              {activeTab === 'contacts' &&
                (currentContact ? (
                  <ContactDetailView
                    contact={currentContact}
                    onBack={() => setSelectedContactId(null)}
                    onEdit={() => handleEditContact(currentContact)}
                    onAddTransaction={(cId) => handleOpenNewTransaction(cId)}
                  />
                ) : (
                  <ContactList
                    onSelectContact={(cId) => setSelectedContactId(cId)}
                    onOpenNewContact={handleOpenNewContact}
                    onEditContact={handleEditContact}
                    onAddTransaction={(cId) => handleOpenNewTransaction(cId)}
                  />
                ))}

              {activeTab === 'ledger' && (
                <TransactionList
                  onOpenNewTransaction={() => handleOpenNewTransaction()}
                  onEditTransaction={handleEditTransaction}
                  onSelectContact={(cId) => {
                    setSelectedContactId(cId);
                    setActiveTab('contacts');
                  }}
                />
              )}

              {activeTab === 'reminders' && <RemindersView />}

              {activeTab === 'analytics' && <AnalyticsCharts />}

              {activeTab === 'publicLookup' && <PublicLookupView />}

              {activeTab === 'backup' && <BackupRestoreView />}

              {activeTab === 'settings' && <SettingsView />}

              {activeTab === 'androidGuide' && <AndroidBuildGuide />}

              {activeTab === 'admin' && <AdminPanelView />}
            </XPWindow>
          </main>
        )}
      </div>

      {/* Desktop Right-Click Context Menu */}
      {contextMenuPos && (
        <div
          className="fixed z-[99999] w-64 bg-[#FFFFFF] border-2 border-[#0055EA] rounded-[2px] shadow-2xl py-1 text-[12px] text-black font-sans select-none animate-in fade-in duration-75 xp-bevel-outset"
          style={{
            top: `${Math.min(contextMenuPos.y, window.innerHeight - 260)}px`,
            left: `${Math.min(contextMenuPos.x, window.innerWidth - 270)}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Facebook Context Menu Item */}
          <a
            href="https://www.facebook.com/KcuFegO"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center justify-between cursor-pointer transition-colors font-semibold text-[#1877F2]"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#1877F2] text-white rounded-full flex items-center justify-center font-bold text-[10px]">f</span>
              <span>Facebook Profile</span>
            </div>
            <span className="text-[10px] text-gray-400">@KcuFegO</span>
          </a>

          <div className="border-t border-[#E0E0E0] my-1" />

          {/* Google Search / Browser */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
              setIsGoogleBrowserOpen(true);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="browser" size={15} />
            <span>Google Search / Browser</span>
          </button>

          {/* Change Desktop Wallpaper */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
              setIsDisplayPropertiesOpen(true);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="settings" size={15} />
            <span>{language === 'bn' ? 'ওয়ালপেপার পরিবর্তন (Display Properties)' : 'Change Desktop Wallpaper'}</span>
          </button>

          {/* Show Desktop / Restore App */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
              handleToggleMinimize();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="ledger" size={15} />
            <span>
              {isAppMinimized
                ? (language === 'bn' ? 'উইন্ডো ফিরিয়ে আনুন (Restore Window)' : 'Restore Application')
                : (language === 'bn' ? 'ডেস্কটপ প্রদর্শন (Show Desktop)' : 'Show Desktop')}
            </span>
          </button>

          {/* Refresh Desktop */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="sync" size={15} />
            <span>{language === 'bn' ? 'রিফ্রেশ (Refresh)' : 'Refresh'}</span>
          </button>

          {/* Full Screen / Maximize Window */}
          <button
            type="button"
            onClick={() => {
              setContextMenuPos(null);
              handleToggleMaximize();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span className="text-sm">⛶</span>
            <span>{language === 'bn' ? 'পূর্ণ পর্দা (Toggle Fullscreen / Maximize)' : 'Toggle Fullscreen / Maximize'}</span>
          </button>

          <div className="border-t border-[#E0E0E0] my-1" />

          {/* Shortcut to Add Transaction */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
              handleOpenNewTransaction();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="money" size={15} />
            <span>{t('addTransaction')}</span>
          </button>

          {/* Shortcut to Add Contact */}
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setContextMenuPos(null);
              handleOpenNewContact();
            }}
            className="w-full text-left px-3 py-1.5 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
          >
            <XPIcon name="contact" size={15} />
            <span>{t('addContact')}</span>
          </button>
        </div>
      )}

      {/* Touch-Friendly Mobile Bottom Navigation Bar (Visible on mobile screens) */}
      <MobileNavBar
        onOpenMenu={() => {
          const startBtn = document.querySelector('.xp-start-btn') as HTMLButtonElement;
          if (startBtn) startBtn.click();
        }}
      />

      {/* Windows XP Taskbar (Fixed at bottom on all screens) */}
      <XPTaskbar
        onOpenDeveloperInfo={() => setIsDeveloperInfoOpen(true)}
        onOpenLogOff={() => setIsLogOffModalOpen(true)}
        isAppMinimized={isAppMinimized}
        onToggleMinimize={handleToggleMinimize}
      />

      {/* Authentic Windows XP Log Off Modal Dialog */}
      <XPLogOffDialog
        isOpen={isLogOffModalOpen}
        onClose={() => setIsLogOffModalOpen(false)}
      />

      {/* Daily Islamic Quotes Popup Modal (Displayed exclusively through the daily login popup) */}
      <IslamicQuoteModal
        isOpen={isIslamicQuoteOpen}
        onClose={() => setIsIslamicQuoteOpen(false)}
      />

      {/* Developer Information Modal */}
      <DeveloperInfoModal
        isOpen={isDeveloperInfoOpen}
        onClose={() => setIsDeveloperInfoOpen(false)}
      />

      {/* Google Browser / Search Modal Window */}
      <GoogleBrowserWindow
        isOpen={isGoogleBrowserOpen}
        onClose={() => setIsGoogleBrowserOpen(false)}
      />

      {/* Wallpaper / Display Properties Customizer */}
      <DisplayPropertiesModal
        isOpen={isDisplayPropertiesOpen}
        onClose={() => setIsDisplayPropertiesOpen(false)}
        currentConfig={wallpaperConfig}
        onApplyConfig={handleApplyWallpaper}
      />

      {/* Contact Modal (Add/Edit) */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSave={(data) => {
          saveContact(data);
          setIsContactModalOpen(false);
        }}
        initialContact={editingContact}
      />

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSave={(data) => {
          saveTransaction(data);
          setIsTxModalOpen(false);
        }}
        initialTransaction={editingTx}
        preselectedContactId={preselectedContactId}
      />
      </div>

      {/* Off-screen Document rendered exclusively for printing with @media print */}
      <div className="print-only">
        <PrintableStatementDocument
          userProfile={userProfile}
          contacts={contacts}
          transactions={transactions}
          targetContactId={printContactId}
        />
      </div>

      {/* Windows XP Statement Print & Export Preview Modal */}
      <PrintStatementModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        initialContactId={printContactId}
      />

      {/* New User Business Profile Setup Wizard */}
      <XPNewUserSetupModal
        isOpen={isNewUserSetupOpen}
        onClose={() => setIsNewUserSetupOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <I18nProvider>
      <AppProvider>
        <WindowProvider>
          <MainAppContent />
        </WindowProvider>
      </AppProvider>
    </I18nProvider>
  );
}
