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
import { ResetDemoConfirmModal } from './components/xp/ResetDemoConfirmModal';
import { shouldShowDailyIslamicQuote, markDailyIslamicQuoteShown } from './utils/dateUtils';
import { soundService } from './services/sound/soundService';

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
    isResetModalOpen,
    setIsResetModalOpen,
    resetToSampleData,
    isPrintModalOpen,
    setIsPrintModalOpen,
    printContactId,
  } = useApp();

  const { t, language } = useI18n();

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

  // Window maximized state on desktop
  const [isMaximized, setIsMaximized] = useState(true);

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

  // Protected Route: Require Google authentication before accessing the application
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

  return (
    <>
      <div className="no-print relative w-screen h-screen overflow-hidden flex flex-col justify-between">
      {/* Windows XP Bliss Landscape Desktop Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1C72D8] via-[#489FFB] to-[#3B9229] select-none pointer-events-none">
        {/* Stylized Bliss Clouds */}
        <div className="absolute top-6 left-12 w-96 h-28 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute top-16 right-20 w-80 h-24 bg-white/25 rounded-full blur-2xl" />
        {/* Rolling Green Hills Curve */}
        <div className="absolute -bottom-10 -left-20 right-0 h-64 bg-gradient-to-t from-[#2E7D32] via-[#43A047] to-[#66BB6A]/80 rounded-[50%_50%_0_0] transform -rotate-1 scale-110" />
      </div>

      {/* Security PIN Lock Screen if locked */}
      <PinLockModal />

      {/* Main Desktop Workspace Area */}
      <div className="relative z-10 flex-1 flex p-1 sm:p-2.5 pb-[40px] sm:pb-[36px] overflow-hidden gap-2">
        {/* Desktop Shortcut Icons with responsive wrapping & overflow protection */}
        <aside className="hidden lg:flex flex-col flex-wrap content-start gap-1 py-1 z-10 shrink-0 max-h-full overflow-y-auto overflow-x-auto no-scrollbar scroll-smooth pr-1">
          <XPDesktopIcon
            name="ledger"
            label={t('navDashboard')}
            sublabel="Overview"
            isActive={activeTab === 'dashboard'}
            onClick={() => {
              setSelectedContactId(null);
              setActiveTab('dashboard');
            }}
          />
          <XPDesktopIcon
            name="contact"
            label={t('navContacts')}
            sublabel="Directory"
            isActive={activeTab === 'contacts'}
            onClick={() => {
              setSelectedContactId(null);
              setActiveTab('contacts');
            }}
          />
          <XPDesktopIcon
            name="money"
            label={t('navLedger')}
            sublabel="Khata"
            isActive={activeTab === 'ledger'}
            onClick={() => setActiveTab('ledger')}
          />
          <XPDesktopIcon
            name="reminders"
            label={t('navReminders')}
            sublabel="Due Dates"
            isActive={activeTab === 'reminders'}
            onClick={() => setActiveTab('reminders')}
          />
          <XPDesktopIcon
            name="analytics"
            label={t('navAnalytics')}
            sublabel="Reports"
            isActive={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <XPDesktopIcon
            name="lookup"
            label={t('navPublicLookup')}
            sublabel="Portal"
            isActive={activeTab === 'publicLookup'}
            onClick={() => setActiveTab('publicLookup')}
          />
          <XPDesktopIcon
            name="backup"
            label={t('navBackup')}
            sublabel="Data"
            isActive={activeTab === 'backup'}
            onClick={() => setActiveTab('backup')}
          />
          <XPDesktopIcon
            name="android"
            label="Android APK"
            sublabel="Build Guide"
            isActive={activeTab === 'androidGuide'}
            onClick={() => setActiveTab('androidGuide')}
          />
          {isAdmin && (
            <XPDesktopIcon
              name="shield"
              label={language === 'bn' ? 'অ্যাডমিন' : 'Admin Panel'}
              sublabel="Security"
              isActive={activeTab === 'admin'}
              onClick={() => setActiveTab('admin')}
            />
          )}
          <XPDesktopIcon
            name="settings"
            label={t('navSettings')}
            sublabel="Config"
            isActive={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <XPDesktopIcon
            name="settings"
            label={language === 'bn' ? 'ডেভেলপার তথ্য' : 'Developer Info'}
            sublabel="System & Dev"
            isActive={isDeveloperInfoOpen}
            onClick={() => setIsDeveloperInfoOpen(true)}
          />
        </aside>

        {/* Active Application Window Container */}
        <main className="flex-1 flex flex-col h-full min-w-0 z-20">
          <XPWindow
            title={winConfig.title}
            iconName={winConfig.icon}
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized((prev) => !prev)}
            onMinimize={() => {}}
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
      </div>

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

      {/* Accidental Prevention Dialog for Reset Demo */}
      <ResetDemoConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToSampleData}
        contactsCount={contacts.length}
        transactionsCount={transactions.length}
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
