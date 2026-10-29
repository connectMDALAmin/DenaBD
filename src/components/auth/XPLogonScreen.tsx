import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  Shield,
  AlertCircle,
  RefreshCw,
  Lock,
  CheckCircle2,
  ArrowRight,
  Mail,
  KeyRound,
  User,
  Store,
  Search,
} from 'lucide-react';
import { soundService } from '../../services/sound/soundService';
import { PublicLookupModal } from './PublicLookupModal';

export const XPLogonScreen: React.FC = () => {
  const {
    signInWithGoogle,
    signUpWithEmail,
    signInWithEmail,
    sendPasswordReset,
  } = useApp();
  const { language, setLanguage } = useI18n();

  const [loading, setLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<'google' | 'email-login' | 'email-register' | 'forgot-password' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Authentication mode: 'google' | 'email-login' | 'email-register' | 'forgot-password'
  const [authMode, setAuthMode] = useState<'google' | 'email-login' | 'email-register' | 'forgot-password'>('google');

  // Email form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  // Public Search Modal state
  const [showPublicLookup, setShowPublicLookup] = useState(false);

  const getFirebaseErrorMessage = (err: any): string => {
    const code = err?.code || '';
    const message = err?.message || '';

    if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
      return language === 'bn'
        ? 'ভুল ইমেইল বা পাসওয়ার্ড দেওয়া হয়েছে। তথ্য যাচাই করুন।'
        : 'Invalid email or password.';
    }
    if (code === 'auth/wrong-password') {
      return language === 'bn'
        ? 'ভুল পাসওয়ার্ড। দয়া করে আবার চেষ্টা করুন।'
        : 'Wrong password. Please try again.';
    }
    if (code === 'auth/email-already-in-use') {
      return language === 'bn'
        ? 'এই ইমেইল দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে। অনুগ্রহ করে লগইন করুন।'
        : 'This email is already in use. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return language === 'bn'
        ? 'পাসওয়ার্ড অত্যন্ত দুর্বল। কমপক্ষে ৬ অক্ষরের শক্তিশালী পাসওয়ার্ড দিন।'
        : 'Password is too weak. Please use at least 6 characters.';
    }
    if (code === 'auth/invalid-email') {
      return language === 'bn'
        ? 'সঠিক ফরম্যাটের ইমেইল ঠিকানা দিন (যেমন: name@example.com)।'
        : 'Please enter a valid email address.';
    }
    if (code === 'auth/missing-password') {
      return language === 'bn'
        ? 'পাসওয়ার্ড পূরণ করা আবশ্যক।'
        : 'Password is required.';
    }
    if (code === 'auth/too-many-requests') {
      return language === 'bn'
        ? 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে অ্যাকাউন্ট সাময়িকভাবে বন্ধ রাখা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন অথবা পাসওয়ার্ড রিসেট করুন।'
        : 'Access temporarily disabled due to many failed attempts. Try again later or reset password.';
    }
    if (code === 'auth/network-request-failed') {
      return language === 'bn'
        ? 'নেটওয়ার্ক সংযোগ নেই বা ত্রুটি হয়েছে। আপনার ইন্টারনেট কানেকশন পরীক্ষা করুন।'
        : 'Network error. Please check your internet connection.';
    }
    if (code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain')) {
      return language === 'bn'
        ? 'এই ডোমেইনটি ফায়ারবেস কনসোলে অনুমোদিত ডোমেইন (Authorized Domains) তালিকায় যোগ করতে হবে।'
        : 'This domain is not authorized in Firebase Console Authentication settings.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return language === 'bn'
        ? 'গুগল সাইন-ইন পপআপ উইন্ডোটি বন্ধ করা হয়েছে।'
        : 'Google sign-in popup was closed by user.';
    }
    if (code === 'auth/popup-blocked') {
      return language === 'bn'
        ? 'ব্রাউজার পপআপ উইন্ডো ব্লক করেছে। ব্রাউজারে পপআপ অনুমোদন করুন।'
        : 'Browser popup was blocked. Please allow popups for this site.';
    }
    if (code === 'permission-denied' || message.includes('permission-denied')) {
      return language === 'bn'
        ? 'ফায়ারস্টোর ডাটাবেসে লেখার অনুমতি নেই (Firestore Rules Error)।'
        : 'Cloud Firestore permission denied.';
    }

    return message || (language === 'bn' ? 'অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'An unexpected error occurred.');
  };

  const handleSignInGoogle = async () => {
    try {
      setLoading(true);
      setLoadingType('google');
      setErrorMsg(null);
      setSuccessMsg(null);
      await signInWithGoogle();
      soundService.playLogon();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(language === 'bn' ? 'ইমেইল এবং পাসওয়ার্ড লিখুন' : 'Enter email and password');
      return;
    }

    try {
      setLoading(true);
      setLoadingType('email-login');
      setErrorMsg(null);
      setSuccessMsg(null);
      await signInWithEmail(email, password);
      soundService.playLogon();
    } catch (err: any) {
      console.error('Email sign-in error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(language === 'bn' ? 'সব প্রয়োজনীয় তথ্য পূরণ করুন' : 'Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
          : 'Password must be at least 6 characters'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(
        language === 'bn'
          ? 'উভয় পাসওয়ার্ড হুবহু এক হতে হবে'
          : 'Passwords do not match'
      );
      return;
    }

    try {
      setLoading(true);
      setLoadingType('email-register');
      setErrorMsg(null);
      setSuccessMsg(null);
      await signUpWithEmail(
        email,
        password,
        displayName || email.split('@')[0],
        businessName || (language === 'bn' ? 'আমার ব্যবসা প্রতিষ্ঠান' : 'My Business')
      );
      setSuccessMsg(language === 'bn' ? 'রেজিস্ট্রেশন সফল হয়েছে! স্বাগতম।' : 'Registration successful! Welcome.');
      soundService.playLogon();
    } catch (err: any) {
      console.error('Email sign-up error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ইমেইল ঠিকানা দিন' : 'Please provide an email address');
      return;
    }

    try {
      setLoading(true);
      setLoadingType('forgot-password');
      setErrorMsg(null);
      setSuccessMsg(null);
      await sendPasswordReset(targetEmail);
      setSuccessMsg(
        language === 'bn'
          ? 'পাসওয়ার্ড রিসেটের লিঙ্ক আপনার ইমেইলে পাঠানো হয়েছে। ইনবক্স অথবা স্প্যাম ফোল্ডার চেক করুন।'
          : 'Password reset link sent! Check your inbox or spam folder.'
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
      setLoadingType(null);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col justify-between bg-[#00136B] text-white font-sans">
      {/* Top Windows XP Banner Bar */}
      <header className="min-h-16 py-2 bg-gradient-to-r from-[#00136B] via-[#003399] to-[#00136B] border-b-2 border-[#D8832B] flex flex-wrap items-center justify-between px-3 sm:px-8 gap-2 shrink-0 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Windows XP 4-Color Flag Icon */}
          <div className="w-7 h-7 sm:w-9 sm:h-9 grid grid-cols-2 gap-0.5 transform -rotate-6 filter drop-shadow-md shrink-0">
            <div className="bg-[#E73827] rounded-tl-sm" />
            <div className="bg-[#7FBA00] rounded-tr-sm" />
            <div className="bg-[#00A4EF] rounded-bl-sm" />
            <div className="bg-[#FFB900] rounded-br-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center">
              {/* Fully visible and unclipped path across all mobile and desktop screens */}
              <span className="text-[9.5px] xs:text-[11px] sm:text-xs md:text-sm font-bold font-mono text-white drop-shadow select-all bg-[#001E5E]/90 px-1.5 sm:px-2 py-0.5 rounded border border-[#2B54A6] shadow-inner tracking-tight sm:tracking-normal whitespace-nowrap">
                {String.raw`C:\WINDOWS\SYSTEM32\DRIVERS\etc\\>ARNOB<//`}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-[#CBDDFD] truncate mt-0.5">
              DenaPawna Digital Ledger (দেনাপাওনা)
            </p>
          </div>
        </div>

        {/* Right Header Buttons: Language Selector */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-[#002266] border border-[#2B54A6] rounded p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setLanguage('bn')}
              className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-colors text-[11px] ${
                language === 'bn' ? 'bg-[#316AC5] text-white shadow-xs' : 'text-[#A0C5FF] hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded cursor-pointer font-bold transition-colors text-[11px] ${
                language === 'en' ? 'bg-[#316AC5] text-white shadow-xs' : 'text-[#A0C5FF] hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {/* Center Logon Canvas with XP Divider */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-3 sm:p-6 overflow-y-auto relative">
        {/* Stylized background ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#002D8C]/50 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center z-10 my-auto">
          {/* Left Column: Welcome Message & Features */}
          <div className="flex flex-col gap-3 sm:gap-4 text-center md:text-left pr-0 md:pr-6 md:border-r border-[#1D4A9E]">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#F2A900]">
              <Lock className="w-5 h-5 shrink-0" />
              <span className="text-xs uppercase tracking-widest font-bold">
                {language === 'bn' ? 'সুরক্ষিত ক্লাউড ও লোকাল লগইন' : 'Secure Cloud & Offline Khata'}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
              {language === 'bn'
                ? 'দেনাপাওনা ডিজিটাল খাতা ও হিসাব সিস্টেমে স্বাগতম'
                : 'Welcome to DenaPawna Digital Ledger'}
            </h1>

            <p className="text-xs sm:text-sm text-[#B0D0FF] leading-relaxed">
              {language === 'bn'
                ? 'গুগল বা ইমেইল একাউন্ট দিয়ে লগইন করুন। আপনার সকল হিসাব ক্লাউডে ও মোবাইলে স্বয়ংক্রিয়ভাবে সিঙ্ক থাকবে এবং ইন্টারনেট ছাড়াও লোকাল ডিভাইসে কাজ করবে।'
                : 'Sign in with Google or Email. All ledger transactions sync in real-time to Cloud Firestore and remain cached offline on your phone or PC.'}
            </p>

            {/* Quick Public Customer Search Action Link */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPublicLookup(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border border-amber-400 rounded text-xs font-bold text-white shadow-md cursor-pointer transition"
              >
                <Search size={14} />
                <span>
                  {language === 'bn'
                    ? 'কাস্টমার পাবলিক খাতা অনুসন্ধান (লগইন ছাড়া দেখুন)'
                    : 'Customer Public Balance Search (No Login Required)'}
                </span>
              </button>
            </div>

            {/* Feature Highlights with XP bullets */}
            <div className="space-y-2 pt-2 text-xs sm:text-sm text-[#D6E6FF]">
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-[#5BD971] shrink-0" />
                <span>{language === 'bn' ? 'ফায়ারবেস ক্লাউড ও অফলাইন লোকাল ক্যাশ' : 'Firebase Cloud & Offline Local Cache'}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-[#5BD971] shrink-0" />
                <span>{language === 'bn' ? 'গুগল ও ইমেইল অথেন্টিকেশন সুবিধা' : 'Google & Email/Password Authentication'}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <CheckCircle2 className="w-4 h-4 text-[#5BD971] shrink-0" />
                <span>{language === 'bn' ? 'নিরাপত্তা পিন লক ও রিসেট সুবিধা' : 'Security PIN Protection & Reset'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Windows XP Account Sign-In / Register Cards */}
          <div className="flex flex-col items-center md:items-start justify-center w-full">
            <div className="w-full max-w-md bg-[#ECE9D8] text-black border-2 border-[#0055EA] rounded-[8px] p-4 sm:p-5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] relative">
              {/* Card Title Bar with Auth Mode Switcher */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D0CCB8]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#0055EA] flex items-center justify-center text-white shadow-xs">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h2 className="font-bold text-xs sm:text-sm text-[#003399]">
                      {authMode === 'google'
                        ? language === 'bn' ? 'লগ-অন উইন্ডো (Windows XP)' : 'Log On to Windows'
                        : authMode === 'email-login'
                        ? language === 'bn' ? 'ইমেইল দিয়ে লগইন করুন' : 'Email Sign-In'
                        : authMode === 'email-register'
                        ? language === 'bn' ? 'নতুন একাউন্ট রেজিস্ট্রেশন' : 'Register New Account'
                        : language === 'bn' ? 'পাসওয়ার্ড রিসেট (Forgot Password)' : 'Reset Password'}
                    </h2>
                    <p className="text-[10px] text-gray-600">
                      {authMode === 'forgot-password'
                        ? language === 'bn' ? 'ইমেইলে পাসওয়ার্ড রিসেট লিঙ্ক পাঠানো হবে' : 'We will send a reset link to your email'
                        : language === 'bn' ? 'পদ্ধতি নির্বাচন করুন' : 'Select sign-in method'}
                    </p>
                  </div>
                </div>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-1 bg-white/70 p-0.5 rounded border border-[#7F9DB9] text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('google');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                      authMode === 'google' ? 'bg-[#0055EA] text-white shadow-xs' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('email-login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                      authMode === 'email-login' ? 'bg-[#0055EA] text-white shadow-xs' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('email-register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className={`px-2 py-0.5 rounded cursor-pointer font-semibold transition ${
                      authMode === 'email-register' ? 'bg-[#0055EA] text-white shadow-xs' : 'text-gray-700 hover:text-black'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMsg && (
                <div className="mb-3 p-2 bg-red-50 border border-red-400 rounded text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                  <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed text-[11px]">{errorMsg}</div>
                </div>
              )}

              {/* Success Message Box */}
              {successMsg && (
                <div className="mb-3 p-2 bg-emerald-50 border border-emerald-400 rounded text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed text-[11px] font-semibold">{successMsg}</div>
                </div>
              )}

              {/* TAB 1: GOOGLE SIGN-IN */}
              {authMode === 'google' && (
                <div className="space-y-4 py-2">
                  <div className="p-4 bg-white border-2 border-[#0055EA] rounded-[6px] shadow-sm flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-11 h-11 rounded bg-gray-50 border border-gray-300 flex items-center justify-center p-2 shrink-0 shadow-inner">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="font-bold text-xs sm:text-sm text-gray-900">
                        {language === 'bn' ? 'গুগল দিয়ে সাইন-ইন' : 'Google Sign-In'}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {language === 'bn' ? 'যেকোনো জিমেইল একাউন্ট দিয়ে সরাসরি প্রবেশ করুন' : 'Sign in securely with any Gmail account'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignInGoogle}
                      disabled={loading}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-b from-[#3E82F7] via-[#246AD6] to-[#124FB0] border-2 border-[#0B3880] text-white font-bold rounded-[4px] shadow hover:brightness-110 active:brightness-95 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-1.5 text-xs transition shrink-0"
                    >
                      {loading && loadingType === 'google' ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          <span>{language === 'bn' ? 'প্রবেশ করা হচ্ছে...' : 'Signing in...'}</span>
                        </>
                      ) : (
                        <>
                          <span>{language === 'bn' ? 'সাইন-ইন করুন' : 'Sign In'}</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to Email Login link */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('email-login')}
                      className="text-[11px] text-[#0055EA] hover:underline cursor-pointer font-semibold"
                    >
                      {language === 'bn' ? 'ইমেইল ও পাসওয়ার্ড দিয়ে প্রবেশ করতে চান? ক্লিক করুন' : 'Prefer Email & Password? Click here'}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: EMAIL & PASSWORD LOGIN */}
              {authMode === 'email-login' && (
                <form onSubmit={handleEmailSignIn} className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-bold text-xs mb-1 flex items-center gap-1">
                      <Mail size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'ইমেইল ঠিকানা:' : 'Email Address:'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold text-xs mb-1 flex items-center gap-1">
                      <KeyRound size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full xp-button-primary py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {loading && loadingType === 'email-login' ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{language === 'bn' ? 'লগইন করুন (Email Sign In)' : 'Sign In with Email'}</span>
                        <ArrowRight size={13} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email-register');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#0055EA] hover:underline font-semibold cursor-pointer"
                    >
                      {language === 'bn' ? 'নতুন একাউন্ট খুলুন' : 'Create new account'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setResetEmail(email);
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-amber-800 hover:underline font-medium cursor-pointer"
                    >
                      {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: NEW ACCOUNT REGISTRATION */}
              {authMode === 'email-register' && (
                <form onSubmit={handleEmailSignUp} className="space-y-2.5">
                  <div>
                    <label className="block text-gray-700 font-bold text-[11px] mb-0.5 flex items-center gap-1">
                      <User size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'আপনার পূর্ণ নাম:' : 'Full Name:'}</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={language === 'bn' ? 'মোঃ রফিকুল ইসলাম' : 'Rafiqul Islam'}
                      className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold text-[11px] mb-0.5 flex items-center gap-1">
                      <Store size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'দোকান বা ব্যবসার নাম:' : 'Business / Shop Name:'}</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={language === 'bn' ? 'ভাই ভাই ট্রেডার্স' : 'Bhai Bhai Traders'}
                      className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold text-[11px] mb-0.5 flex items-center gap-1">
                      <Mail size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'ইমেইল ঠিকানা:' : 'Email Address:'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="business@gmail.com"
                      className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-700 font-bold text-[10px] mb-0.5">
                        {language === 'bn' ? 'পাসওয়ার্ড (৬+ অক্ষর):' : 'Password (6+ chars):'}
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-bold text-[10px] mb-0.5">
                        {language === 'bn' ? 'পাসওয়ার্ড নিশ্চিত:' : 'Confirm Password:'}
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-2 py-1 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full xp-button-primary py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs mt-1"
                  >
                    {loading && loadingType === 'email-register' ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{language === 'bn' ? 'একাউন্ট তৈরি হচ্ছে...' : 'Creating account...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} />
                        <span>{language === 'bn' ? 'নতুন একাউন্ট খুলুন (Register)' : 'Register Account'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAuthMode('email-login')}
                      className="text-[#0055EA] hover:underline font-semibold cursor-pointer"
                    >
                      {language === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন' : 'Already registered? Sign in'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('google')}
                      className="text-gray-600 hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'গুগল সাইন-ইন' : 'Google Sign In'}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: FORGOT PASSWORD RESET */}
              {authMode === 'forgot-password' && (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div>
                    <label className="block text-gray-700 font-bold text-xs mb-1 flex items-center gap-1">
                      <Mail size={12} className="text-[#0055EA]" />
                      <span>{language === 'bn' ? 'আপনার নিবন্ধিত ইমেইল ঠিকানা:' : 'Registered Email Address:'}</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail || email}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setEmail(e.target.value);
                      }}
                      placeholder="yourname@gmail.com"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#7F9DB9] text-xs font-sans outline-none focus:border-[#0055EA] rounded-[2px]"
                    />
                  </div>

                  <p className="text-[10.5px] text-gray-600 leading-relaxed bg-amber-50 p-2 border border-amber-200 rounded-[2px]">
                    {language === 'bn'
                      ? 'আপনার ইমেইল ঠিকানা দিয়ে নিচের বাটনে ক্লিক করলে পাসওয়ার্ড রিসেট করার একটি নিরাপদ লিঙ্ক আপনার ইনবক্সে পাঠানো হবে।'
                      : 'Enter your email address and click below to receive a secure password reset link in your inbox.'}
                  </p>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full xp-button-primary py-2 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {loading && loadingType === 'forgot-password' ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>{language === 'bn' ? 'লিঙ্ক পাঠানো হচ্ছে...' : 'Sending link...'}</span>
                      </>
                    ) : (
                      <>
                        <Mail size={13} />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড রিসেট লিঙ্ক পাঠান' : 'Send Reset Link'}</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-300 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('email-login');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-[#0055EA] hover:underline font-semibold cursor-pointer"
                    >
                      {language === 'bn' ? '← লগইন স্ক্রিনে ফিরে যান' : '← Back to Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('google');
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-gray-600 hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'গুগল সাইন-ইন' : 'Google Sign In'}
                    </button>
                  </div>
                </form>
              )}

              {/* Windows XP animated loading block bar */}
              {loading && (
                <div className="mt-3 p-1.5 bg-[#222222] border border-[#555555] rounded flex items-center justify-center">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-3.5 bg-[#2A65FF] rounded-xs animate-pulse" />
                    <div className="w-2.5 h-3.5 bg-[#2A65FF] rounded-xs animate-pulse delay-75" />
                    <div className="w-2.5 h-3.5 bg-[#2A65FF] rounded-xs animate-pulse delay-150" />
                  </div>
                </div>
              )}

              <p className="mt-3 text-[9.5px] text-gray-500 text-center">
                {language === 'bn'
                  ? 'সকল তথ্য ক্লাউড ফায়ারবেসে সংরক্ষিত হয় এবং ফোন অ্যাপে অফলাইনেও সচল থাকে।'
                  : 'All records sync to Firebase Cloud and cache offline for mobile app usage.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Status / Footer Bar */}
      <footer className="min-h-10 py-1.5 bg-gradient-to-r from-[#00136B] via-[#002B80] to-[#00136B] border-t border-[#1D4A9E] flex flex-wrap items-center justify-between px-3 sm:px-8 text-[10px] sm:text-[11px] text-[#A0C5FF] gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Firebase Cloud Live • Offline Ready</span>
        </div>

        <div className="text-center text-[#82B1FF]">
          DenaPawna Digital Ledger v2.5
        </div>

        <div className="flex items-center gap-2">
          <span>© 2026 DenaPawna</span>
        </div>
      </footer>

      {/* Public Customer Statement Search Modal */}
      <PublicLookupModal
        isOpen={showPublicLookup}
        onClose={() => setShowPublicLookup(false)}
      />
    </div>
  );
};
