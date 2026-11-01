import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { soundService } from '../../services/sound/soundService';
import { XPIcon } from './XPIcon';
import { Shield, RefreshCw, KeyRound, AlertTriangle, Lock } from 'lucide-react';

export const XPMaintenanceScreen: React.FC = () => {
  const { appSettings, updateAppSettings, signInWithGoogle, signInWithEmail } = useApp();
  const { language } = useI18n();

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('ar2x7ar@gmail.com');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      soundService.playClick();
      await signInWithEmail(adminEmail.trim(), adminPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      soundService.playClick();
      await signInWithGoogle();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Sign-In failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    soundService.playClick();
    setTimeout(() => {
      setIsChecking(false);
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#00136B] flex items-center justify-center p-4 select-none font-sans">
      {/* Background subtle Windows XP aura */}
      <div className="absolute inset-0 bg-radial from-[#0C32A8] via-[#001D80] to-[#00136B] opacity-90 pointer-events-none" />

      {/* Maintenance Dialog Box */}
      <div className="relative w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[8px] xp-window-shadow overflow-hidden text-[#222222] animate-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="h-[30px] px-2.5 flex items-center justify-between select-none xp-titlebar-blue text-white font-bold text-[13px]">
          <div className="flex items-center gap-2">
            <XPIcon name="settings" size={17} className="shrink-0" />
            <span>
              {language === 'bn' ? 'সিস্টেম রক্ষণাবেক্ষণ মোড — DenaPawna' : 'System Maintenance Mode — DenaPawna'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono bg-[#A91B0D] text-white px-1.5 py-0.5 rounded-[2px] font-bold">
              OFFLINE
            </span>
          </div>
        </div>

        {/* Dialog Content Area */}
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-[4px] bg-[#FFF2B2] border-2 border-[#D4A300] flex items-center justify-center text-[#B27B00] shrink-0 shadow-xs">
              <AlertTriangle size={32} className="text-[#C27D00] animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {language === 'bn'
                  ? 'বর্তমানে সিস্টেম রক্ষণাবেক্ষণ চলছে'
                  : 'System Maintenance in Progress'}
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                {language === 'bn'
                  ? 'নিরাপত্তা ও ডাটাবেজ সুরক্ষার স্বার্থে অ্যাডমিনিস্ট্রেটর এই অ্যাপ্লিকেশনটি সাময়িকভাবে বন্ধ রেখেছেন। রক্ষণাবেক্ষণ শেষ হওয়া পর্যন্ত অপেক্ষা করুন।'
                  : 'The system administrator has temporarily placed this ledger into scheduled maintenance mode for database security and system upgrades.'}
              </p>
            </div>
          </div>

          {/* Announcement Box */}
          <div className="bg-white p-3 rounded-[3px] border border-[#7F9DB9] xp-bevel-inset text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#003399]">
              <span>📢 {language === 'bn' ? 'কর্তৃপক্ষের নোটিশ:' : 'Maintenance Announcement:'}</span>
              <span className="text-gray-400 font-mono text-[10px]">
                {new Date(appSettings.updatedAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-800 font-medium italic bg-[#FFFFE1] p-2 border border-[#E6DB55] rounded-[2px] leading-relaxed">
              "{appSettings.maintenanceMessage || 'System maintenance in progress. Please check back shortly.'}"
            </p>
          </div>

          {/* Admin Login Dropdown Panel */}
          {showAdminLogin ? (
            <div className="bg-white p-3.5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3 text-xs animate-in fade-in duration-100">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-200">
                <div className="flex items-center gap-1.5 font-bold text-[#003399]">
                  <Shield size={14} />
                  <span>{language === 'bn' ? 'অ্যাডমিন প্রবেশাধিকার' : 'Administrator Authorization'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="text-gray-500 hover:text-gray-800 text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-2 bg-red-50 border border-red-300 rounded text-red-700 text-[11px]">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleAdminEmailLogin} className="space-y-2">
                <div>
                  <label className="block text-gray-700 font-medium text-[11px] mb-0.5">Admin Email:</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-2 py-1 bg-[#F9F9F9] border border-[#7F9DB9] outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium text-[11px] mb-0.5">Password:</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-2 py-1 bg-[#F9F9F9] border border-[#7F9DB9] outline-none text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 xp-button-primary py-1.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound size={13} />
                    <span>{loading ? 'Verifying...' : 'Admin Logon'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleAdminGoogleLogin}
                    className="xp-button px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-gray-100"
                  >
                    <span>Google Sign-In</span>
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {/* Action Footer Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={handleCheckStatus}
              className="xp-button px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-gray-800"
            >
              <RefreshCw size={13} className={isChecking ? 'animate-spin' : ''} />
              <span>{language === 'bn' ? 'স্ট্যাটাস চেক করুন' : 'Refresh Status'}</span>
            </button>

            {!showAdminLogin && (
              <button
                type="button"
                onClick={() => {
                  soundService.playClick();
                  setShowAdminLogin(true);
                }}
                className="xp-button px-3 py-1.5 text-xs font-semibold flex items-center gap-1 text-[#003399] cursor-pointer hover:bg-blue-50"
              >
                <Lock size={12} />
                <span>{language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Bypass Logon'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Windows XP Dialog Status Bar */}
        <div className="h-6 px-3 bg-[#D8D2BD] border-t border-[#C0B9A0] flex items-center justify-between text-[11px] text-gray-600 font-mono">
          <span>Maintenance Status: ACTIVE</span>
          <span>DenaPawna Security Subsystem</span>
        </div>
      </div>
    </div>
  );
};
