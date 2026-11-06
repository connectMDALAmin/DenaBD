# 💰 DenaBD (দেনাপাওনা) — Open-Source Digital Ledger & Accounting Khata (Windows XP Edition)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-Android_APK-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest_Passing-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)

> **DenaBD (দেনাপাওনা)** হলো একটি আধুনিক, নির্ভুল এবং অফলাইন-ফার্স্ট ওপেন-সোর্স ডিজিটাল বাকির খাতা ও লেজার প্ল্যাটফর্ম। এটি সম্পূর্ণ নস্টালজিক **Windows XP (Luna UI)** ইন্টারফেসের সাথে প্রস্তুত করা হয়েছে, যা ব্রাউজার (Web SPA/PWA) এবং অ্যান্ড্রয়েড ডিভাইসে (Native APK/AAB) সমান দক্ষতায় চলে।

---

## 🌟 প্রধান বৈশিষ্ট্যসমূহ (Key Features)

- **🎨 খাঁটি Windows XP নস্টালজিক থিম:**
  - ক্লাসিক **Luna Blue**, **Luna Silver**, এবং **Luna Olive** থিম।
  - ব্লিস (Bliss) সবুজ পাহাড়ের ডায়নামিক ওয়ালপেপার, উইন্ডো ড্র্যাগ/মিনিমাইজ/ম্যাক্সিমাইজ এবং স্টার্ট মেনু।
  - খাঁটি এক্সপি সাউন্ড ইফেক্টস (ক্লিক, লগঅন, লগঅফ সাউন্ড)।
  - রেসপনসিভ ডেক্সটপ ও মোবাইল কার্ড লেআউট।

- **🔢 ০% ফ্লোটিং-পয়েন্ট ত্রুটি (Integer Minor Units Engine):**
  - জাভাস্ক্রিপ্টের ভগ্নাংশের জটিলতা দূর করতে অভ্যন্তরীণভাবে সব হিসাব পয়সা/সেন্টে (`500.25 BDT = 50025`) ইনটিজার হিসেবে সংরক্ষিত হয়।

- **📊 দ্বিভাষিক ড্যাশবোর্ড ও অ্যানালিটিক্স (Bilingual BDT Ledger):**
  - এক ক্লিকে সম্পূর্ণ সিস্টেম **বাংলা** এবং **ইংরেজি** ভাষায় রূপান্তরযোগ্য।
  - দেনা (Payable), পাওনা (Receivable), নেট সারপ্লাস ও ৩০ দিনের ক্যাশ-ইনফ্লো/আউটফ্লো সামারি।
  - Recharts চার্টের মাধ্যমে ক্যাশ-ফ্লো ট্রেন্ড ও বকেয়ার বয়স (Aging analysis)।

- **🔐 মাল্টি-টেন্যান্ট ফায়ারবেস ক্লাউড সিঙ্ক ও সিকিউরিটি রুলস:**
  - Google ও Email/Password লগইনের মাধ্যমে ডেটা স্বয়ংক্রিয় ক্লাউড সিঙ্ক।
  - রিয়েল-টাইম অফলাইন ফার্স্ট ব্রাউজার ক্যাশিং ও অনলাইন হলে স্বয়ংক্রিয় সিঙ্ক।
  - কঠোর `firestore.rules` দ্বারা সুরক্ষিত ব্যক্তিগত লেজার।

- **📢 গ্লোবাল অ্যাডমিন অ্যানাউন্সমেন্ট ও অ্যাডস ব্যানার:**
  - অ্যাডমিন কর্তৃক নির্ধারিত বিজ্ঞাপন বা ঘোষণা কেন্দ্রীয়ভাবে সমস্ত ইউজারের ড্যাশবোর্ড ও মেনু বারে রিয়েল-টাইমে সম্প্রচারিত হয়।

- **🔍 পাবলিক ব্যালেন্স স্টেটমেন্ট পোর্টাল (Privacy-First Customer Portal):**
  - গ্রাহক তার নিজস্ব বকেয়া হিসাব দেখতে পারবেন মোবাইল নম্বর ও ইউনিক পিন দিয়ে।
  - অন্য কোনো গ্রাহকের বা অন্য প্রতিষ্ঠানের হিসাব কখনোই ওভারল্যাপ হবে না।

- **📱 অ্যান্ড্রয়েড মোবাইল রেডি (Capacitor 6+):**
  - গুগল প্লে স্টোরের জন্য রেডিমেড `AAB` এবং সরাসরি ফোনে ইনস্টলের জন্য `APK` বিল্ড কনফিগারেশন।

- **💾 ব্যাকআপ, রিস্টোর ও এক্সপোর্ট:**
  - ভার্সনযুক্ত JSON ব্যাকআপ এক্সপোর্ট ও প্রিভিউ-সহ রিস্টোর।
  - বাংলা ফন্ট সাপোর্ট সহ Excel-কম্প্যাটিবল UTF-8 BOM CSV এক্সপোর্ট ও PDF প্রিন্ট স্টেটমেন্ট।

---

## 🧮 হিসাবের গাণিতিক নিয়মাবলী (Accounting Semantics)

DenaBD কঠোর ডাবল-এন্ট্রি অ্যাকাউন্টিং নীতিমালা অনুসরণ করে:

| লেনদেনের ধরন (Type) | বিবরণ | হিসাবের প্রভাব (Ledger Effect) |
| :--- | :--- | :--- |
| **টাকা দেওয়া হলো (Given)** | গ্রাহককে পণ্য বা নগদ টাকা দেওয়া হলো | **পাওনা (Receivable) বৃদ্ধি পাবে** ↗️ |
| **টাকা পাওয়া গেলো (Received)** | গ্রাহক থেকে বকেয়া টাকা আদায় হলো | **পাওনা (Receivable) হ্রাস পাবে** ↘️ |
| **টাকা নেওয়া হলো (Borrowed)** | মহাজন বা সাপ্লায়ারের কাছ থেকে মাল/টাকা নেওয়া হলো | **দেনা (Payable) বৃদ্ধি পাবে** ↗️ |
| **টাকা ফেরত দেওয়া হলো (Repaid)** | সাপ্লায়ার বা মহাজনের দেনা পরিশোধ করা হলো | **দেনা (Payable) হ্রাস পাবে** ↘️ |

---

## 🚀 দ্রুত শুরু করুন (Quick Start)

### পূর্বশর্ত (Prerequisites)
- **Node.js**: v18.0.0 বা তার পরবর্তী ভার্সন
- **npm** অথবা **bun**

### ইনস্টলেশন ও রান (Local Development)

```bash
# ১. রিপোজিটরি ক্লোন করুন
git clone https://github.com/<your-username>/denabd.git

# ২. প্রজেক্ট ডিরেক্টরিতে প্রবেশ করুন
cd denabd

# ৩. ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# ৪. ডেভেলপমেন্ট সার্ভার চালু করুন (Port: 3000)
npm run dev
```

ব্রাউজারে ওপেন করুন: `http://localhost:3000`

---

## 🧪 স্বয়ংক্রিয় টেস্ট যাচাই (Automated Testing)

প্রকল্পের মূল অ্যাকাউন্টিং অ্যালগরিদম, মুদ্রা রূপান্তর, কিস্তি ও ব্যাকআপ স্কিমা যাচাই করতে:

```bash
# সম্পূর্ণ টেস্ট স্যুট রান করুন
npm test

# ওয়াচ মোডে টেস্ট রান করুন
npx vitest
```

---

## 📱 অ্যান্ড্রয়েড APK ও AAB বিল্ড নির্দেশিকা (Android Build)

প্রকল্পটিতে `@capacitor/android` ও `@capacitor/cli` পূর্ব-কনফিগার করা আছে:

```bash
# ১. ওয়েব প্রোডাকশন বিল্ড তৈরি করুন
npm run build

# ২. অ্যান্ড্রয়েড প্রকল্পে কোড সিঙ্ক করুন
npx cap sync android

# ৩. সরাসরি Debug APK তৈরি করুন (ফোন দিয়ে ইনস্টলের জন্য)
cd android && ./gradlew assembleDebug
# আউটপুট APK লোকেশন:
# android/app/build/outputs/apk/debug/app-debug.apk

# ৪. গুগল প্লে স্টোরের জন্য Release AAB তৈরি করুন
cd android && ./gradlew bundleRelease
# আউটপুট AAB লোকেশন:
# android/app/build/outputs/bundle/release/app-release.aab

# অথবা Android Studio-তে ওপেন করতে:
npx cap open android
```

---

## 🔒 ক্লাউড ও সিকিউরিটি কনফিগারেশন (Firebase Architecture)

- **`firestore.rules`**: প্রতিটি ইউজারের ডাটা (`users/{userId}/*`) কঠোরভাবে এনক্রিপ্ট ও আইসোলেটেড। গ্লোবাল অ্যানাউন্সমেন্ট পাবলিক রিড এবং অ্যাডমিন অনলি রাইট।
- **`storage.rules`**: ভাউচার ও রসিদের ছবির সাইজ সীমা (সর্বোচ্চ 5MB) এবং ইমেজ টাইপ সুরক্ষা।
- **`src/services/security/pinService.ts`**: Web Crypto API দিয়ে সল্টেড SHA-256 ডিভাইজ পিন ভল্ট।

---

## 📂 ফাইল কাঠামো (Project Directory Structure)

```text
denabd/
├── android/                 # Capacitor Android native project & Gradle build
├── public/                  # Static assets (XP icons, wallpapers, sounds)
├── src/
│   ├── components/          # Reusable XP windows, titlebars, dialogs & buttons
│   ├── context/             # AppContext (central reactive state engine)
│   ├── features/            # Feature modules
│   │   ├── admin/           # Super Admin panel, audit logs & announcement
│   │   ├── analytics/       # Cashflow, aging & volume charts (Recharts)
│   │   ├── backup/          # JSON restore/export & CSV reports
│   │   ├── contacts/        # Directory, balance cards & detail ledger
│   │   ├── dashboard/       # Overview, debtors, creditors & XP ribbons
│   │   ├── ledger/          # All transaction logs & filters
│   │   ├── public-lookup/   # Multi-tenant secure statement viewer
│   │   ├── reminders/       # Due dates, WhatsApp & SMS generator
│   │   └── settings/        # Business profile, vault PIN & theme picker
│   ├── i18n/                # English & Bengali translation engine
│   ├── services/
│   │   ├── accounting/      # Core math calculator (minor units integer engine)
│   │   ├── firebase/        # Cloud sync, auth & realtime snapshot listeners
│   │   ├── security/        # Salte-hashed WebCrypto PIN verification
│   │   └── storage/         # LocalStorage cache, offline queue & schema
│   ├── types/               # TypeScript interfaces
│   └── App.tsx              # Main desktop workspace orchestrator
├── tests/                   # Vitest automated test suites
├── firestore.rules          # Production Firebase Security Rules
├── capacitor.config.ts      # Native mobile bridge configuration
├── LICENSE                  # MIT License
└── package.json             # NPM scripts & dependencies
```

---

## 🤝 অবদান রাখুন (Contributing)

আমরা যে কোনো ধরনের গঠনমূলক অবদানকে স্বাগত জানাই!
1. রিপোজিটরি ফর্ক করুন (`Fork`).
2. আপনার ফিচার ব্রাঞ্চ তৈরি করুন (`git checkout -b feature/AmazingFeature`).
3. পরিবর্তন কমিট করুন (`git commit -m 'feat: Add some amazing feature'`).
4. টেস্ট পাস করছে কিনা যাচাই করুন (`npm test`).
5. ব্রাঞ্চে পুশ করুন (`git push origin feature/AmazingFeature`).
6. একটি **Pull Request (PR)** ওপেন করুন।

বিস্তারিত তথ্যের জন্য [CONTRIBUTING.md](CONTRIBUTING.md) দেখুন।

---

## 📄 লাইসেন্স (License)

এই প্রকল্পটি [MIT License](LICENSE)-এর অধীনে উন্মুক্ত ওপেন-সোর্স হিসেবে প্রকাশিত। আপনি স্বাধীনভাবে এটি ব্যক্তিগত বা ব্যবসায়িক উদ্দেশ্যে ব্যবহার ও পরিবর্তন করতে পারবেন।

---

<p align="center">
  <b>DenaBD (দেনাপাওনা)</b> — ব্যবসায়িক হিসাব-নিকাশে শতভাগ নির্ভুলতা ও নির্ভরযোগ্যতা।<br>
  Made with ❤️ for Bangladeshi & Global Merchants.
</p>
