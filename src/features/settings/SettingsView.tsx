import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { hashPin, generateSalt } from '../../services/security/pinService';
import { Shield, Palette, Store, Globe, Save, CheckCircle, RefreshCw, Megaphone, Trash2, AlertTriangle } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';
import { DangerConfirmModal } from '../../components/xp/DangerConfirmModal';
import { soundService } from '../../services/sound/soundService';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    saveUserProfile,
    deleteUserProfile,
    isAdmin,
    syncState,
    lastSyncTime,
    triggerSync,
    firebaseUser,
    signInWithGoogle,
    logout,
    resetPin,
    appSettings,
    updateAppSettings,
    contacts,
    transactions,
    deleteAllContacts,
    deleteAllTransactions,
  } = useApp();
  const { t, language } = useI18n();

  // Business Profile Form
  const [businessName, setBusinessName] = useState(userProfile.businessName);
  const [ownerName, setOwnerName] = useState(userProfile.ownerName);
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [address, setAddress] = useState(userProfile.address || '');
  const [currency, setCurrency] = useState(userProfile.currency || 'BDT');
  const [currencySymbol, setCurrencySymbol] = useState(userProfile.currencySymbol || '৳');
  const [theme, setTheme] = useState(userProfile.theme || 'luna-blue');

  // PIN Form
  const [pinEnabled, setPinEnabled] = useState(userProfile.pinEnabled);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState<string | null>(null);

  // Global Announcement Banner Form
  const [announcementBanner, setAnnouncementBanner] = useState(appSettings?.announcementBanner ?? true);
  const [announcementText, setAnnouncementText] = useState(
    appSettings?.announcementText ||
      '⭐ দেনাপাওনা ডিজিটাল লেজার — নিরাপদ স্বয়ংক্রিয় ক্লাউড ব্যাকআপ • বাকির খাতা ও দেনা-পাওনা ট্র্যাকিং • ১-ক্লিক মোবাইল স্টেটমেন্ট পোর্টাল | আপনার ব্যবসার হিসাব রাখুন ১০০% নিরাপদ ও নির্ভুলভাবে!'
  );
  const [announcementSaveMsg, setAnnouncementSaveMsg] = useState<string | null>(null);

  // Danger Zone Modals State
  const [isDeleteContactsModalOpen, setIsDeleteContactsModalOpen] = useState(false);
  const [isDeleteTxModalOpen, setIsDeleteTxModalOpen] = useState(false);
  const [isDeleteProfileModalOpen, setIsDeleteProfileModalOpen] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [dangerActionMsg, setDangerActionMsg] = useState<string | null>(null);

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    saveUserProfile({
      businessName,
      ownerName,
      phone,
      address,
      currency,
      currencySymbol,
      theme,
    });
    setSaveMessage(language === 'bn' ? 'সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings saved successfully!');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    if (!pinEnabled) {
      saveUserProfile({
        pinEnabled: false,
        pinHash: undefined,
        pinSalt: undefined,
      });
      setPinMessage(language === 'bn' ? 'পিন লক নিষ্ক্রিয় করা হয়েছে।' : 'Security PIN disabled.');
      return;
    }

    if (newPin.length !== 4) {
      setPinMessage(language === 'bn' ? 'পিন অবশ্যই ৪ সংখ্যার হতে হবে!' : 'PIN must be 4 digits!');
      return;
    }

    if (newPin !== confirmPin) {
      setPinMessage(language === 'bn' ? 'পিন দুটি মিলছে না!' : 'PINs do not match!');
      return;
    }

    const salt = generateSalt();
    const hash = await hashPin(newPin, salt);

    saveUserProfile({
      pinEnabled: true,
      pinSalt: salt,
      pinHash: hash,
      pinCode: newPin,
    });

    setNewPin('');
    setConfirmPin('');
    setPinMessage(language === 'bn' ? 'পিন সফলভাবে আপডেট হয়েছে!' : 'PIN updated successfully!');
    setTimeout(() => setPinMessage(null), 3000);
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    await updateAppSettings({
      announcementBanner,
      announcementText: announcementText.trim(),
    });
    setAnnouncementSaveMsg(
      language === 'bn'
        ? 'বিজ্ঞাপন ও ব্যানার সফলভাবে আপডেট করা হয়েছে!'
        : 'Announcement banner updated successfully!'
    );
    setTimeout(() => setAnnouncementSaveMsg(null), 3500);
  };

  const handleConfirmDeleteAllContacts = async () => {
    const res = await deleteAllContacts();
    setDangerActionMsg(
      language === 'bn'
        ? `সকল ${res.deletedCount} টি কন্ট্যাক্ট ও সংশ্লিষ্ট লেনদেন সফলভাবে মুছে ফেলা হয়েছে!`
        : `All ${res.deletedCount} contacts and linked records were permanently deleted.`
    );
    setTimeout(() => setDangerActionMsg(null), 4000);
  };

  const handleConfirmDeleteAllTransactions = async () => {
    const res = await deleteAllTransactions();
    setDangerActionMsg(
      language === 'bn'
        ? `সকল ${res.deletedCount} টি লেনদেন ইতিহাস সফলভাবে মুছে ফেলা হয়েছে এবং ব্যালেন্স ০ করা হয়েছে!`
        : `All ${res.deletedCount} transaction records deleted and ledger balances reset to 0.`
    );
    setTimeout(() => setDangerActionMsg(null), 4000);
  };

  const handleConfirmDeleteProfile = async () => {
    setIsDeletingProfile(true);
    try {
      await deleteUserProfile();
      setIsDeleteProfileModalOpen(false);
      soundService.playLogoff();
      setDangerActionMsg(
        language === 'bn'
          ? 'আপনার প্রোফাইল ও অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।'
          : 'Your account and profile have been permanently deleted.'
      );
    } catch (err: any) {
      setDangerActionMsg(
        language === 'bn'
          ? `মুছে ফেলতে ব্যর্থ হয়েছে: ${err?.message || 'ত্রুটি ঘটেছে'}`
          : `Failed to delete profile: ${err?.message || 'Error occurred'}`
      );
    } finally {
      setIsDeletingProfile(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <XPIcon name="settings" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('settingsTitle')}</h2>
            <p className="text-xs text-gray-500">
              Customize business profile, advertisement banner, security PIN, and ledger data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => triggerSync()}
          className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-gray-800 cursor-pointer"
        >
          <RefreshCw size={14} className={syncState === 'syncing' ? 'animate-spin' : ''} />
          <span>Sync Now ({syncState.toUpperCase()})</span>
        </button>
      </div>

      {saveMessage && (
        <div className="p-3 bg-green-50 border border-green-300 rounded text-xs text-green-800 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {dangerActionMsg && (
        <div className="p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800 flex items-center gap-2 animate-in fade-in">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span className="font-semibold">{dangerActionMsg}</span>
        </div>
      )}

      {/* Main Form: Business Profile & Security PIN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Business Profile */}
        <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
            <Store size={16} className="text-[#0055EA]" />
            <h3 className="font-bold text-gray-900">{t('businessProfile')}</h3>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('businessName')} *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('ownerName')} *
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('contactPhone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                {t('currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setCurrencySymbol(e.target.value === 'BDT' ? '৳' : e.target.value === 'USD' ? '$' : '₹');
                }}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] outline-none"
              >
                <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {t('contactAddress')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] outline-none"
            />
          </div>

          {/* Windows XP Theme Selection */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1.5 flex items-center gap-1.5">
              <Palette size={14} />
              <span>Windows XP Theme:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('luna-blue')}
                className={`py-1.5 px-2 rounded border text-center cursor-pointer transition ${
                  theme === 'luna-blue'
                    ? 'bg-[#0055EA] text-white font-bold border-[#003B99]'
                    : 'bg-blue-50 text-blue-900 border-blue-200'
                }`}
              >
                Luna Blue
              </button>
              <button
                type="button"
                onClick={() => setTheme('luna-silver')}
                className={`py-1.5 px-2 rounded border text-center cursor-pointer transition ${
                  theme === 'luna-silver'
                    ? 'bg-[#8E94AA] text-white font-bold border-[#6E7388]'
                    : 'bg-gray-100 text-gray-800 border-gray-300'
                }`}
              >
                Luna Silver
              </button>
              <button
                type="button"
                onClick={() => setTheme('luna-olive')}
                className={`py-1.5 px-2 rounded border text-center cursor-pointer transition ${
                  theme === 'luna-olive'
                    ? 'bg-[#7C9550] text-white font-bold border-[#5A7228]'
                    : 'bg-green-50 text-green-900 border-green-200'
                }`}
              >
                Luna Olive
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full xp-button-primary py-2 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save size={14} />
              <span>{t('save')}</span>
            </button>
          </div>
        </form>

        {/* Security PIN & Firebase Cloud Sync */}
        <div className="space-y-4">
          <form onSubmit={handleUpdatePin} className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Shield size={16} className="text-[#0055EA]" />
              <h3 className="font-bold text-gray-900">{t('securityPin')}</h3>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinEnabledCheck"
                checked={pinEnabled}
                onChange={(e) => setPinEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#0055EA] cursor-pointer"
              />
              <label htmlFor="pinEnabledCheck" className="font-semibold text-gray-800 cursor-pointer">
                {t('enablePin')}
              </label>
            </div>

            {pinEnabled && (
              <div className="space-y-2.5 pt-1">
                <div>
                  <label className="block text-gray-600 mb-1">{t('enterPin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] font-mono tracking-widest text-center text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 mb-1">{t('confirmPin')}</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] font-mono tracking-widest text-center text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {pinMessage && (
              <div className="p-2 bg-blue-50 border border-blue-200 text-blue-800 rounded text-[11px]">
                {pinMessage}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 xp-button py-2 text-xs font-semibold text-gray-800 cursor-pointer"
              >
                {language === 'bn' ? 'পিন আপডেট করুন' : 'Update Security PIN'}
              </button>
              {userProfile.pinEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    resetPin();
                    setPinEnabled(false);
                    setNewPin('');
                    setConfirmPin('');
                    setPinMessage(language === 'bn' ? 'পিন রিসেট ও নিষ্ক্রিয় করা হয়েছে!' : 'PIN successfully reset & disabled!');
                    setTimeout(() => setPinMessage(null), 3000);
                  }}
                  className="xp-button py-2 px-3 text-xs font-semibold text-red-700 hover:bg-red-50 border-red-300 cursor-pointer"
                >
                  {language === 'bn' ? 'পিন রিসেট' : 'Reset PIN'}
                </button>
              )}
            </div>
          </form>

          {/* Firebase Authentication & Cloud Sync */}
          <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
              <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                <Shield size={14} className="text-[#0055EA]" />
                <span>Firebase Cloud Authentication</span>
              </h3>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${firebaseUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {firebaseUser ? 'CONNECTED' : 'LOCAL MODE'}
              </span>
            </div>

            {firebaseUser ? (
              <div className="space-y-2">
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-gray-600 text-[11px]">Logged in as:</div>
                  <div className="font-bold text-green-900 font-mono text-xs">{firebaseUser.email || firebaseUser.displayName}</div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">UID: {firebaseUser.uid}</div>
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="xp-button w-full py-1.5 text-xs text-red-700 font-semibold cursor-pointer"
                >
                  Sign Out from Cloud
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-600">
                  Connect your Google account to sync all ledger records across the web and your Android APK in real-time.
                </p>
                <button
                  type="button"
                  onClick={() => signInWithGoogle().catch((e) => alert(e.message))}
                  className="xp-button-primary w-full py-2 text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Globe size={14} />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <div className="flex items-center justify-between text-gray-600">
                <span>Database:</span>
                <span className="font-mono text-[10px]">Cloud Firestore (Persistent)</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>Network:</span>
                <span className="font-bold text-green-700 uppercase">{syncState}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>{t('lastSyncTime')}:</span>
                <span className="font-mono text-[10px]">{new Date(lastSyncTime).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Announcement Banner Editor - Only available to Administrators */}
      {isAdmin && (
        <form
          onSubmit={handleSaveAnnouncement}
          className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3 text-xs"
        >
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Megaphone size={16} className="text-[#0055EA]" />
              <h3 className="font-bold text-gray-900">
                {language === 'bn' ? 'গ্লোবাল বিজ্ঞাপন ও নোটিশ ব্যানার (Global Announcement Banner)' : 'Global Announcement Banner (Menu Bar Ticker)'}
              </h3>
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              {language === 'bn' ? 'মেনু বারের স্ক্রোলিং টেক্সট' : 'Menu Bar Scrolling Ticker'}
            </span>
          </div>

          {announcementSaveMsg && (
            <div className="p-2.5 bg-green-50 border border-green-300 rounded text-xs text-green-800 flex items-center gap-2">
              <CheckCircle size={15} className="text-green-600 shrink-0" />
              <span>{announcementSaveMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="announcementBannerToggle"
              checked={announcementBanner}
              onChange={(e) => setAnnouncementBanner(e.target.checked)}
              className="w-4 h-4 accent-[#0055EA] cursor-pointer"
            />
            <label htmlFor="announcementBannerToggle" className="font-semibold text-gray-800 cursor-pointer">
              {language === 'bn'
                ? 'মেনু বারে স্ক্রোলিং বিজ্ঞাপন ব্যানার সক্রিয় রাখুন (Enable Scrolling Announcement Banner)'
                : 'Show scrolling announcement ticker in top menu bar'}
            </label>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              {language === 'bn' ? 'বিজ্ঞাপন বা ঘোষণার লেখা (Announcement / Ad Text):' : 'Announcement / Ad Text:'}
            </label>
            <textarea
              rows={2}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder={
                language === 'bn'
                  ? 'বিজ্ঞাপনের টেক্সট লিখুন, যেমন: ⭐ দেনাপাওনা ডিজিটাল লেজার — নিরাপদ ১০০% অটো ক্লাউড ব্যাকআপ...'
                  : 'Enter your custom advertisement or announcement text...'
              }
              className="w-full px-2.5 py-2 bg-white border border-[#7F9DB9] outline-none text-xs rounded-[2px]"
            />
          </div>

          {/* Live Preview Box */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-gray-600">
              {language === 'bn' ? 'লাইভ প্রিভিউ (Live Preview):' : 'Live Preview:'}
            </span>
            <div className="h-[26px] bg-white border border-[#7F9DB9] xp-bevel-inset rounded px-2 flex items-center overflow-hidden">
              <span className="shrink-0 text-[10px] font-bold text-[#A91B0D] bg-[#FDE8E8] px-1 py-0.2 rounded border border-[#F8B4B4] mr-2 flex items-center gap-1 select-none">
                <span className="animate-pulse">📢</span>
                <span>{language === 'bn' ? 'বিজ্ঞাপন' : 'Ads'}</span>
              </span>
              <div className="relative w-full overflow-hidden whitespace-nowrap">
                <span className="xp-marquee-text text-[11px] text-[#003399] font-medium">
                  {announcementBanner && announcementText.trim()
                    ? announcementText
                    : '— (বিজ্ঞাপন বন্ধ রয়েছে / Announcement disabled) —'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="xp-button-primary px-4 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
            >
              <Save size={13} />
              <span>
                {language === 'bn' ? 'বিজ্ঞাপন সংরক্ষণ করুন' : 'Save Announcement Banner'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* Danger Zone: Permanent Account Ledger Deletion */}
      <div className="bg-[#FFF5F5] p-4 rounded-[4px] border-2 border-[#E57373] xp-bevel-inset space-y-3 text-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-[#FFCDD2]">
          <AlertTriangle size={18} className="text-[#C62828]" />
          <div>
            <h3 className="font-bold text-[#B71C1C] text-sm">
              {language === 'bn'
                ? 'ডেঞ্জার জোন: স্থায়ী তথ্য বিলোপ (Danger Zone: Permanent Data Wipe)'
                : 'Danger Zone: Permanent Account Ledger Reset'}
            </h3>
            <p className="text-[11px] text-[#D32F2F]">
              {language === 'bn'
                ? 'সাবধান! এই সেকশনের অপশনগুলো অপরিবর্তনীয় এবং স্থায়ীভাবে সকল ডাটা মুছে ফেলে।'
                : 'Caution! Actions here are permanent and cannot be undone.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {/* Card 1: Delete All Contacts */}
          <div className="bg-white p-3.5 rounded-[4px] border border-[#FFCDD2] shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-600" />
                  <span>{language === 'bn' ? 'সকল কন্ট্যাক্ট মুছুন' : 'Delete All Contacts'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-red-100 text-red-800">
                  {contacts.length} {language === 'bn' ? 'টি কন্ট্যাক্ট' : 'Contacts'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার সমস্ত সংরক্ষিত কাস্টমার/সাপ্লায়ার কন্ট্যাক্ট এবং তাদের লিঙ্কযুক্ত সকল স্টেটমেন্ট স্থানীয় মেমরি ও ক্লাউড ফায়ারস্টোর থেকে স্থায়ীভাবে মুছে ফেলবে।'
                  : 'Permanently deletes all contacts and their public lookup statements locally and from Firebase Cloud.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setIsDeleteContactsModalOpen(true);
              }}
              className="w-full py-1.5 px-3 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#EF9A9A] rounded-[3px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Trash2 size={13} />
              <span>{language === 'bn' ? 'সকল কন্ট্যাক্ট ডিলিট করুন...' : 'Delete All Contacts...'}</span>
            </button>
          </div>

          {/* Card 2: Delete All Ledger History & Transactions */}
          <div className="bg-white p-3.5 rounded-[4px] border border-[#FFCDD2] shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-600" />
                  <span>{language === 'bn' ? 'সকল লেনদেন ইতিহাস মুছুন' : 'Delete All History'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-red-100 text-red-800">
                  {transactions.length} {language === 'bn' ? 'টি লেনদেন' : 'Transactions'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার খাতার সমস্ত লেনদেন, জমা, বকেয়া পরিশোধের ইতিহাস মুছে ফেলবে এবং সকল কন্ট্যাক্টের ব্যালেন্স ০ করে দিবে। কন্ট্যাক্ট তালিকা অক্ষুণ্ণ থাকবে।'
                  : 'Permanently clears all ledger transactions and resets balances to 0, while keeping contact profiles.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setIsDeleteTxModalOpen(true);
              }}
              className="w-full py-1.5 px-3 bg-[#FFEBEE] hover:bg-[#FFCDD2] text-[#C62828] border border-[#EF9A9A] rounded-[3px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
            >
              <Trash2 size={13} />
              <span>{language === 'bn' ? 'সকল লেনদেন হিস্ট্রি মুছুন...' : 'Delete All History...'}</span>
            </button>
          </div>

          {/* Card 3: Delete Entire Account & Profile */}
          <div className="bg-white p-3.5 rounded-[4px] border-2 border-[#EF5350] shadow-xs flex flex-col justify-between space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Trash2 size={14} className="text-red-700" />
                  <span>{language === 'bn' ? 'প্রোফাইল ও অ্যাকাউন্ট মুছুন' : 'Delete Account & Profile'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-bold bg-red-600 text-white">
                  {language === 'bn' ? 'স্থায়ী বিলোপ' : 'PERMANENT'}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {language === 'bn'
                  ? 'আপনার সম্পূর্ণ প্রোফাইল, সমস্ত কন্ট্যাক্ট, সমস্ত লেনদেনের খাতা এবং ফায়ারবেস ক্লাউডের সকল সংরক্ষিত তথ্য স্থায়ীভাবে মুছে অ্যাকাউন্ট সম্পূর্ণ বন্ধ করে দেবে।'
                  : 'Permanently wipes your profile, all contacts, all ledger records, and cloud data, deleting your account completely.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                soundService.playClick();
                setIsDeleteProfileModalOpen(true);
              }}
              className="w-full py-1.5 px-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white border border-[#B71C1C] rounded-[3px] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <Trash2 size={13} />
              <span>{language === 'bn' ? 'প্রোফাইল চিরতরে মুছুন...' : 'Delete Account & Profile...'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Double Confirmation Modal: Delete All Contacts */}
      <DangerConfirmModal
        isOpen={isDeleteContactsModalOpen}
        title={language === 'bn' ? 'সকল কন্ট্যাক্ট মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete All Contacts'}
        description={
          language === 'bn'
            ? 'আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্টের সমস্ত কন্ট্যাক্ট স্থায়ীভাবে মুছে ফেলতে চান? এতে তাদের সমস্ত হিস্ট্রি এবং ক্লাউড স্টেটমেন্টও ডিলিট হয়ে যাবে। এই কাজ আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!'
            : 'Are you sure you want to permanently delete all contacts? All linked ledger records and cloud statements will also be erased permanently.'
        }
        itemCountInfo={`Contacts to be deleted: ${contacts.length}`}
        confirmPhrase="DELETE ALL CONTACTS"
        alternativePhrase="সকল কন্ট্যাক্ট মুছুন"
        confirmButtonText={language === 'bn' ? 'সকল কন্ট্যাক্ট মুছুন' : 'Permanently Delete All'}
        onConfirm={handleConfirmDeleteAllContacts}
        onClose={() => setIsDeleteContactsModalOpen(false)}
      />

      {/* Double Confirmation Modal: Delete All Transactions */}
      <DangerConfirmModal
        isOpen={isDeleteTxModalOpen}
        title={language === 'bn' ? 'সকল লেনদেন ইতিহাস মুছে ফেলার নিশ্চিতকরণ' : 'Confirm Delete All Transactions'}
        description={
          language === 'bn'
            ? 'আপনি কি নিশ্চিত যে আপনার খাতার সমস্ত লেনদেন এবং পরিশোধের ইতিহাস মুছে ফেলতে চান? আপনার কন্ট্যাক্ট তালিকা অক্ষুণ্ণ রেখে সকল ব্যালেন্স ০ টাকা করা হবে। এই কাজ আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না!'
            : 'Are you sure you want to permanently clear all ledger transaction history? All contact balances will be reset to 0. This action cannot be undone.'
        }
        itemCountInfo={`Transactions to be deleted: ${transactions.length}`}
        confirmPhrase="DELETE ALL TRANSACTIONS"
        alternativePhrase="সকল লেনদেন মুছুন"
        confirmButtonText={language === 'bn' ? 'সকল ইতিহাস মুছুন' : 'Permanently Wipe History'}
        onConfirm={handleConfirmDeleteAllTransactions}
        onClose={() => setIsDeleteTxModalOpen(false)}
      />

      {/* Double Confirmation Modal: Delete Entire Account & Profile */}
      <DangerConfirmModal
        isOpen={isDeleteProfileModalOpen}
        title={language === 'bn' ? 'প্রোফাইল ও অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলার নিশ্চয়তা' : 'Confirm Permanent Account Deletion'}
        description={
          language === 'bn'
            ? 'আপনি কি নিশ্চিত যে আপনার সম্পূর্ণ অ্যাকাউন্ট ও প্রোফাইল স্থায়ীভাবে মুছে ফেলতে চান? আপনার সমস্ত কন্ট্যাক্ট, লেনদেনের খাতা এবং ফায়ারবেসের সকল ক্লাউড ডাটা চিরতরে ধ্বংস হয়ে যাবে। এই কাজ আর পূর্বাবস্থায় ফিরিয়ে আনা সম্ভব নয়!'
            : 'Are you sure you want to permanently delete your entire account and profile? All ledger data, contacts, and cloud records will be erased forever. This action is irreversible!'
        }
        itemCountInfo={`Account: ${firebaseUser?.email || userProfile.ownerName || 'Active User'}`}
        confirmPhrase="DELETE MY ACCOUNT"
        alternativePhrase="আমার একাউন্ট মুছুন"
        confirmButtonText={isDeletingProfile ? (language === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...') : (language === 'bn' ? 'স্থায়ীভাবে অ্যাকাউন্ট মুছুন' : 'Permanently Delete Account')}
        onConfirm={handleConfirmDeleteProfile}
        onClose={() => setIsDeleteProfileModalOpen(false)}
      />
    </div>
  );
};
