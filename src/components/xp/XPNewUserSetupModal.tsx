import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { XPTitleBar } from './XPTitleBar';
import { XPIcon } from './XPIcon';
import { Store, User, Phone, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface XPNewUserSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XPNewUserSetupModal: React.FC<XPNewUserSetupModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, saveUserProfile, firebaseUser } = useApp();
  const { language } = useI18n();

  const [businessName, setBusinessName] = useState(() => {
    if (userProfile.businessName && userProfile.businessName !== 'আমার ব্যবসা') {
      return userProfile.businessName;
    }
    return '';
  });

  const [ownerName, setOwnerName] = useState(() => {
    if (userProfile.ownerName && userProfile.ownerName !== 'ব্যবহারকারী') {
      return userProfile.ownerName;
    }
    return firebaseUser?.displayName || '';
  });

  const [phone, setPhone] = useState(() => userProfile.phone || firebaseUser?.phoneNumber || '');
  const [address, setAddress] = useState(() => userProfile.address || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBusiness = businessName.trim();
    const cleanOwner = ownerName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    if (!cleanBusiness) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে ব্যবসার নাম প্রদান করুন।' : 'Please enter business name.');
      return;
    }
    if (!cleanOwner) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে স্বত্বাধিকারী বা মালিকের নাম লিখুন।' : 'Please enter owner name.');
      return;
    }
    if (!cleanPhone) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে একটি মোবাইল নম্বর প্রদান করুন।' : 'Please enter phone number.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      soundService.playClick();
      await saveUserProfile({
        businessName: cleanBusiness,
        ownerName: cleanOwner,
        phone: cleanPhone,
        address: cleanAddress,
        onboardingCompleted: true,
      });

      soundService.playLogon();
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || (language === 'bn' ? 'তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।' : 'Failed to save setup.'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-[#ECE9D8] rounded-t-[8px] rounded-b-[4px] shadow-2xl border-2 border-[#0055EA] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <XPTitleBar
          title={language === 'bn' ? 'ব্যবসায়িক খাতা সেটআপ উইজার্ড — দেনাপাওনা' : 'Business Setup Wizard — DenaPawna'}
          iconName="settings"
          onClose={onClose}
        />

        {/* Wizard Header Banner */}
        <div className="bg-gradient-to-r from-[#003399] via-[#0055EA] to-[#2575FC] p-4 text-white flex items-center gap-3 border-b border-[#002266]">
          <div className="w-12 h-12 bg-white/10 rounded-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
            <XPIcon name="ledger" size={28} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              {language === 'bn' ? 'নতুন ব্যবহারকারী খাতা সেটআপ (Initial Setup)' : 'Welcome! Setup Your Business Profile'}
            </h2>
            <p className="text-[11px] text-blue-100 mt-0.5 leading-snug">
              {language === 'bn'
                ? 'দেনাপাওনা ডিজিটাল লেজারে স্বাগতম! খাতার হিসাব, স্লিপ প্রিন্টিং এবং ক্লাউড সুরক্ষার জন্য আপনার তথ্য দিন।'
                : 'Configure your business name and details for accurate ledger accounting, vouchers, and statements.'}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs text-gray-800">
          {errorMsg && (
            <div className="p-2.5 bg-red-100 border border-red-400 text-red-800 rounded text-xs flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Business Name */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-bold text-gray-800">
              <Store size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'ব্যবসা বা দোকানের নাম (Business Name):' : 'Business Name:'}</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: মেসার্স খান ট্রেডার্স / Khan General Store' : 'e.g. Khan Enterprise'}
              className="w-full px-3 py-2 bg-white border border-[#7F9DB9] rounded-[2px] outline-none text-xs focus:border-[#0055EA] shadow-inner"
              autoFocus
            />
          </div>

          {/* Owner Name */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-bold text-gray-800">
              <User size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'স্বত্বাধিকারী / মালিকের নাম (Owner Name):' : 'Owner Name:'}</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: মোঃ আব্দুল্লাহ খান' : 'e.g. Abdullah Khan'}
              className="w-full px-3 py-2 bg-white border border-[#7F9DB9] rounded-[2px] outline-none text-xs focus:border-[#0055EA] shadow-inner"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-bold text-gray-800">
              <Phone size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'ব্যবসায়িক মোবাইল নম্বর (Phone Number):' : 'Phone Number:'}</span>
              <span className="text-red-600">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: 01712-345678' : 'e.g. +8801712345678'}
              className="w-full px-3 py-2 bg-white border border-[#7F9DB9] rounded-[2px] outline-none text-xs font-mono focus:border-[#0055EA] shadow-inner"
            />
          </div>

          {/* Business Address */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 font-bold text-gray-800">
              <MapPin size={14} className="text-[#0055EA]" />
              <span>{language === 'bn' ? 'দোকান / ব্যবসার ঠিকানা (Address):' : 'Business Address:'}</span>
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={language === 'bn' ? 'যেমন: দোকান নং ১২, চকবাজার, ঢাকা' : 'e.g. Shop #12, Chawkbazar, Dhaka'}
              className="w-full px-3 py-2 bg-white border border-[#7F9DB9] rounded-[2px] outline-none text-xs focus:border-[#0055EA] shadow-inner resize-none"
            />
          </div>

          <div className="bg-[#FFFFCC] border border-[#E6DB55] p-2 rounded text-[11px] text-gray-700 flex items-start gap-1.5">
            <span className="font-bold text-[#D4A017]">ℹ️</span>
            <span>
              {language === 'bn'
                ? 'এই তথ্যগুলো আপনার বাকির খাতা ও দেনাপাওনার রসিদে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে। পরে সেটিংস থেকে পরিবর্তন করা যাবে।'
                : 'This information will be printed on voucher slips and client statement portals. You can edit this anytime in Settings.'}
            </span>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#D4D0C8]">
            <button
              type="button"
              onClick={onClose}
              className="xp-button px-3.5 py-1.5 text-xs text-gray-700 cursor-pointer"
            >
              {language === 'bn' ? 'পরে করব' : 'Skip for now'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="xp-button-primary px-5 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-md"
            >
              <CheckCircle size={14} />
              <span>
                {isSaving
                  ? language === 'bn'
                    ? 'সংরক্ষণ করা হচ্ছে...'
                    : 'Saving...'
                  : language === 'bn'
                  ? 'খাতা শুরু করুন'
                  : 'Complete & Open Ledger'}
              </span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
