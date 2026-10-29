import React, { useState } from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { Smartphone, Terminal, PackageCheck, ShieldAlert, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

export const AndroidBuildGuide: React.FC = () => {
  const { t, language } = useI18n();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      title: '1. Web App Build (প্রডাকশন বান্ডল তৈরি)',
      cmd: 'npm run build',
      desc: 'Builds optimized HTML, CSS, and TypeScript assets into the "dist" folder.',
    },
    {
      title: '2. Add Android Platform (ক্যাপাসিটর অ্যান্ড্রয়েড যোগ)',
      cmd: 'npx cap add android',
      desc: 'Generates a complete Android Studio native Gradle project in the /android directory.',
    },
    {
      title: '3. Sync Web Assets to Android (সিঙ্ক করুন)',
      cmd: 'npx cap sync android',
      desc: 'Copies the production dist web assets and updates Android plugins, icons, and configuration.',
    },
    {
      title: '4. Build Debug APK (ইনস্টলেবল টেস্ট APK তৈরি)',
      cmd: 'cd android && ./gradlew assembleDebug',
      desc: 'Generates the standalone installable APK at: android/app/build/outputs/apk/debug/app-debug.apk',
    },
    {
      title: '5. Build Play Store AAB Bundle (গুগল প্লে রিলিজ বান্ডল)',
      cmd: 'cd android && ./gradlew bundleRelease',
      desc: 'Generates Google Play release bundle at: android/app/build/outputs/bundle/release/app-release.aab',
    },
    {
      title: '6. Open in Android Studio (মোবাইল আইডিই-তে খুলুন)',
      cmd: 'npx cap open android',
      desc: 'Opens the project in Android Studio for device testing, signing keys, and emulator runs.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 text-xs">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-green-100 flex items-center justify-center text-green-700 shrink-0">
            <XPIcon name="android" size={28} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('androidGuideTitle')}</h2>
            <p className="text-xs text-gray-500">
              Capacitor 6+ native packaging, offline storage, camera receipts, and APK release workflow
            </p>
          </div>
        </div>

        <span className="px-2 py-1 rounded bg-green-100 text-green-800 font-bold font-mono">
          Package: com.denapawna.app
        </span>
      </div>

      {/* Feature Checklist */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
          <PackageCheck size={16} className="text-[#0055EA]" />
          <span>Android Production Readiness Checklist (প্রডাকশন ফিচার স্থিতি)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <span>Responsive Viewport & Touch Optimization (সম্পন্ন)</span>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <span>Capacitor Configuration & Android Manifest Ready (সম্পন্ন)</span>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <span>Offline Local Database & Background Sync (সম্পন্ন)</span>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <span>WhatsApp & Native SMS URI Handlers (সম্পন্ন)</span>
          </div>
          <div className="p-2 rounded bg-green-50 border border-green-200 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-600 shrink-0" />
            <span>Device 4-Digit Security PIN Lock (সম্পন্ন)</span>
          </div>
          <div className="p-2 rounded bg-amber-50 border border-amber-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span>Google Play Release Keystore (Requires user private key on signing)</span>
          </div>
        </div>
      </div>

      {/* Step by step Terminal commands */}
      <div className="space-y-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
          <Terminal size={16} className="text-[#0055EA]" />
          <span>Step-by-Step Command Line Build Guide</span>
        </h3>

        {steps.map((s, idx) => (
          <div
            key={idx}
            className="bg-white p-3.5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">{s.title}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(s.cmd, idx)}
                className="xp-button px-2 py-0.5 text-[11px] flex items-center gap-1 text-gray-700 cursor-pointer"
              >
                {copiedIndex === idx ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-2 bg-[#1E293B] text-green-400 rounded font-mono text-xs overflow-x-auto select-all">
              {s.cmd}
            </pre>
            <p className="text-[11px] text-gray-600">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Release Keystore & Play Store Signing */}
      <div className="bg-[#FFFCE8] border border-[#E0D89A] rounded-[4px] p-4 space-y-2 text-xs">
        <h4 className="font-bold text-[#6B5500] flex items-center gap-1.5">
          <ShieldAlert size={16} />
          <span>Release Signing Key Generation (গুগল প্লে স্টোর সাইনিং কি)</span>
        </h4>
        <p className="text-gray-700">
          To publish on the Google Play Store, generate a release keystore with Java keytool:
        </p>
        <pre className="p-2 bg-white border border-[#E0D89A] text-gray-900 rounded font-mono text-[11px] overflow-x-auto">
          keytool -genkey -v -keystore denapawna-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias denapawna
        </pre>
        <p className="text-gray-600 text-[11px]">
          Keep your keystore file and passwords safe in your private vault; never commit private keystores or Google service secrets to public git repositories.
        </p>
      </div>
    </div>
  );
};
