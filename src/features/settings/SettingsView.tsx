import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { hashPin, generateSalt } from '../../services/security/pinService';
import { Shield, Palette, Store, Globe, Save, CheckCircle, Lock, RefreshCw } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    saveUserProfile,
    syncState,
    lastSyncTime,
    triggerSync,
    firebaseUser,
    signInWithGoogle,
    logout,
    resetPin,
  } = useApp();
  const { t, language, setLanguage } = useI18n();

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

  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
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
    });

    setNewPin('');
    setConfirmPin('');
    setPinMessage(language === 'bn' ? 'পিন সফলভাবে আপডেট হয়েছে!' : 'PIN updated successfully!');
    setTimeout(() => setPinMessage(null), 3000);
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
              Customize business profile, currency, theme, and 4-digit device PIN
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

      {/* Main Form */}
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

        {/* Security PIN & Data Safety */}
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
    </div>
  );
};
