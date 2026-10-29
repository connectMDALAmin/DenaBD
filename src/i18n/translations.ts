/**
 * Comprehensive Bangla (বাংলা) & English translations for DenaPawna
 */

export type Language = 'bn' | 'en';

export const translations = {
  bn: {
    // Brand & App
    appName: 'দেনাপাওনা',
    appTagline: 'আধুনিক উইন্ডোজ এক্সপি ডিজিটাল খাতা ও হিসাবরক্ষণ',
    startMenu: 'শুরু',
    desktop: 'ডেস্কটপ',
    version: 'সংস্করণ ২.৪',

    // Windows XP UI
    windowMinimize: 'ছোট করুন',
    windowMaximize: 'বড় করুন',
    windowClose: 'বন্ধ করুন',
    ok: 'ঠিক আছে',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    search: 'অনুসন্ধান করুন...',
    actions: 'পদক্ষেপ',
    status: 'অবস্থা',
    refresh: 'রিফ্রেশ',
    apply: 'প্রয়োগ করুন',

    // Top Navigation / Taskbar
    navDashboard: 'ড্যাশবোর্ড',
    navContacts: 'কন্ট্যাক্ট ডিরেক্টরি',
    navLedger: 'হিসাব খাতা',
    navReminders: 'তাকিদা ও কিস্তি',
    navAnalytics: 'অ্যানালিটিক্স',
    navPublicLookup: 'পাবলিক লুকআপ',
    navBackup: 'ব্যাকআপ ও রিস্টোর',
    navSettings: 'সেটিংস ও নিরাপত্তা',
    navAndroidBuild: 'অ্যান্ড্রয়েড নির্দেশিকা',

    // Financial Metrics
    receivables: 'মোট পাওনা (বাকি)',
    payables: 'মোট দেনা (ঋণ)',
    netPosition: 'নিট ব্যালেন্স',
    cashInflow: 'নগদ জমা (৩০ দিন)',
    cashOutflow: 'নগদ খরচ (৩০ দিন)',
    overdueReceivable: 'মেয়াদোত্তীর্ণ পাওনা',
    overduePayable: 'মেয়াদোত্তীর্ণ দেনা',
    theyOweYou: 'তারা আপনাকে দেবে',
    youOweThem: 'আপনি তাদের দেবেন',
    settled: 'হিসাব সম্পন্ন (শূন্য ব্যালেন্স)',

    // Transaction Types
    typeGiven: 'টাকা দেওয়া হলো (পাওনা)',
    typeReceived: 'টাকা পাওয়া গেলো (আদায়)',
    typeBorrowed: 'টাকা নেওয়া হলো (দেনা)',
    typeRepaid: 'টাকা ফেরত দেওয়া হলো (পরিশোধ)',
    labelGiven: 'দেওয়া',
    labelReceived: 'পাওয়া',
    labelBorrowed: 'নেওয়া',
    labelRepaid: 'ফেরত',

    // Transaction Details
    amount: 'পরিমাণ',
    date: 'তারিখ',
    dueDate: 'পরিশোধের শেষ তারিখ',
    category: 'ক্যাটাগরি',
    paymentMethod: 'পেমেন্ট মাধ্যম',
    notes: 'নোট ও বিবরণ',
    referenceNumber: 'রশিদ/রেফারেন্স নং',
    receiptAttachment: 'রশিদের ছবি',
    installments: 'কিস্তি ব্যবস্থা',
    installmentCount: 'কিস্তির সংখ্যা',
    addTransaction: 'নতুন লেনদেন লিখুন',
    editTransaction: 'লেনদেন সংশোধন',
    transactionHistory: 'লেনদেনের ইতিহাস',

    // Contact Categories
    categoryCustomer: 'গ্রাহক / কাস্টমার',
    categorySupplier: 'পাইকার / মহাজন',
    categoryFriendFamily: 'বন্ধু ও পরিবার',
    categoryEmployee: 'কর্মচারী',
    categoryOther: 'অন্যান্য',

    // Payment Methods
    methodCash: 'নগদ (Cash)',
    methodBkash: 'বিকাশ (bKash)',
    methodNagad: 'নগদ (Nagad)',
    methodBank: 'ব্যাংক ট্রান্সফার',
    methodCard: 'কার্ড',
    methodOther: 'অন্যান্য মাধ্যম',

    // Contacts
    addContact: 'নতুন কন্ট্যাক্ট যোগ করুন',
    editContact: 'কন্ট্যাক্ট সম্পাদনা',
    contactName: 'নাম',
    contactPhone: 'মোবাইল নম্বর',
    contactEmail: 'ইমেইল (ঐচ্ছিক)',
    contactAddress: 'ঠিকানা (ঐচ্ছিক)',
    openingBalance: 'শুরুর ব্যালেন্স',
    openingBalanceHelp: 'ধনাত্মক হলে সে আপনাকে দেবে, ঋণাত্মক হলে আপনি তাকে দেবেন',
    publicLookupAllowed: 'পাবলিক লুকআপ অনুমোদিত',
    reminderPreference: 'তাকিদা পাঠানোর মাধ্যম',

    // Reminders
    remindersTitle: 'বাকি আদায়ের তাকিদা ও কিস্তি',
    sendWhatsApp: 'হোয়াটসঅ্যাপ মেসেজ',
    sendSMS: 'এসএমএস পাঠান',
    dueToday: 'আজকে পরিশোধের দিন',
    overdueDays: 'দিন মেয়াদোত্তীর্ণ',
    dueInDays: 'দিনের মধ্যে পরিশোধ',
    upcoming: 'আসন্ন',
    reminderTemplateWhatsApp: 'আসসালামু আলাইকুম {name} ভাই/ম্যাম, {business} থেকে জানানো যাচ্ছে আপনার নিকট বর্তমান বকেয়া {amount} টাকা। পরিশোধের তারিখ ছিল {dueDate}। অনুগ্রহ করে দ্রুত পরিশোধের ব্যবস্থা করবেন। ধন্যবাদ।',
    reminderTemplateSMS: '{business}: প্রিয় {name}, আপনার বকেয়া {amount} টাকা {dueDate} তারিখের মধ্যে পরিশোধ করার বিনীত অনুরোধ করা হচ্ছে।',

    // Public Lookup
    publicLookupTitle: 'গ্রাহক ব্যালেন্স লুকআপ পোর্টাল',
    publicLookupDesc: 'গ্রাহকরা তাদের মোবাইল নম্বর ও নিরাপত্তা টোকেন দিয়ে তাদের হিসাব চেক করতে পারবেন।',
    enterPhone: 'নিবন্ধিত মোবাইল নম্বর লিখুন',
    enterToken: 'অনুমোদিত এক্সেস টোকেন বা পিন',
    checkBalance: 'ব্যালেন্স যাচাই করুন',
    lookupDisclaimer: 'গোপনীয়তা রক্ষার্থে কেবল অনুমোদিত বিবরণ দেখানো হচ্ছে। মালিক কর্তৃক নিরাপত্তা কোড সক্রিয় থাকতে হবে।',
    lookupNotFound: 'কোনো অনুমোদিত হিসাব পাওয়া যায়নি বা এক্সেস টোকেন সঠিক নয়।',

    // Analytics
    analyticsTitle: 'আর্থিক বিশ্লেষণ ও চার্ট',
    cashFlowTrend: 'মাসিক নগদ প্রবাহ ট্রেন্ড',
    receivablesVsPayables: 'পাওনা বনাম দেনার অনুপাত',
    agingBreakdown: 'বকেয়া বয়সের বিশ্লেষণ',
    categoryDistribution: 'ক্যাটাগরি ভিত্তিক লেনদেন',
    methodDistribution: 'পেমেন্ট পদ্ধতির বণ্টন',

    // Backup & Restore
    backupTitle: 'ডেটা ব্যাকআপ, রিস্টোর ও এক্সপোর্ট',
    exportJSON: 'সম্পূর্ণ ডেটা ব্যাকআপ ডাউনলোড (JSON)',
    importJSON: 'ব্যাকআপ ফাইল থেকে রিস্টোর করুন',
    exportCSV: 'এক্সেলে এক্সপোর্ট (CSV)',
    printStatement: 'প্রিন্টযোগ্য খাতা বিবরণী (Statement)',
    backupWarning: 'রিস্টোর করার পূর্বে নিশ্চিত হোন। বিদ্যমান তথ্যের সাথে মার্জ অথবা সম্পূর্ণ প্রতিস্থাপন করা যাবে।',

    // Security & PIN
    settingsTitle: 'সিস্টেম সেটিংস ও নিরাপত্তা',
    businessProfile: 'ব্যবসার বিবরণী',
    businessName: 'ব্যবসা প্রতিষ্ঠানের নাম',
    ownerName: 'মালিকের নাম',
    currency: 'মুদ্রা',
    securityPin: 'অ্যাপের ৪-ডিজিটের নিরাপত্তা পিন',
    enablePin: 'পিন লক সক্রিয় করুন',
    enterPin: '৪-ডিজিট পিন প্রবেশ করুন',
    confirmPin: 'পিন পুনরায় নিশ্চিত করুন',
    pinLocked: 'ভুল পিনের কারণে লক করা হয়েছে। কিছুক্ষণ অপেক্ষা করুন।',
    unlock: 'আনলক করুন',

    // Synchronization
    syncStatusOnline: 'অনলাইন (সিঙ্ক সক্রিয়)',
    syncStatusOffline: 'অফলাইন (লোকাল স্টোরেজে সংরক্ষিত)',
    syncStatusSyncing: 'সিঙ্ক হচ্ছে...',
    syncSuccess: 'সফলভাবে সিঙ্ক হয়েছে',
    lastSyncTime: 'সর্বশেষ সিঙ্ক',

    // Android
    androidGuideTitle: 'অ্যান্ড্রয়েড অ্যাপ ও APK নির্মাণ নির্দেশিকা',

    // Daily Quotes
    quoteTitle: 'আজকের ব্যবসায়িক প্রজ্ঞা',
  },

  en: {
    // Brand & App
    appName: 'DenaPawna',
    appTagline: 'Modern Windows XP Digital Ledger & Financial Khata',
    startMenu: 'start',
    desktop: 'Desktop',
    version: 'v2.4 Pro',

    // Windows XP UI
    windowMinimize: 'Minimize',
    windowMaximize: 'Maximize',
    windowClose: 'Close',
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search...',
    actions: 'Actions',
    status: 'Status',
    refresh: 'Refresh',
    apply: 'Apply',

    // Top Navigation / Taskbar
    navDashboard: 'Dashboard',
    navContacts: 'Contacts',
    navLedger: 'Ledger Khata',
    navReminders: 'Reminders & Due',
    navAnalytics: 'Analytics',
    navPublicLookup: 'Public Lookup',
    navBackup: 'Backup & Restore',
    navSettings: 'Settings & Security',
    navAndroidBuild: 'Android APK Guide',

    // Financial Metrics
    receivables: 'Total Receivables (Pawna)',
    payables: 'Total Payables (Dena)',
    netPosition: 'Net Position',
    cashInflow: 'Cash Inflow (30d)',
    cashOutflow: 'Cash Outflow (30d)',
    overdueReceivable: 'Overdue Receivables',
    overduePayable: 'Overdue Payables',
    theyOweYou: 'They owe you',
    youOweThem: 'You owe them',
    settled: 'Account Settled (Zero balance)',

    // Transaction Types
    typeGiven: 'Money Given (Receivable +)',
    typeReceived: 'Money Received (Receivable -)',
    typeBorrowed: 'Money Borrowed (Payable +)',
    typeRepaid: 'Money Repaid (Payable -)',
    labelGiven: 'Given',
    labelReceived: 'Received',
    labelBorrowed: 'Borrowed',
    labelRepaid: 'Repaid',

    // Transaction Details
    amount: 'Amount',
    date: 'Date',
    dueDate: 'Due Date',
    category: 'Category',
    paymentMethod: 'Payment Method',
    notes: 'Notes & Description',
    referenceNumber: 'Ref / Invoice No.',
    receiptAttachment: 'Receipt Photo',
    installments: 'Installment Plan',
    installmentCount: 'Installments Count',
    addTransaction: 'New Transaction',
    editTransaction: 'Edit Transaction',
    transactionHistory: 'Transaction History',

    // Contact Categories
    categoryCustomer: 'Customer',
    categorySupplier: 'Supplier / Vendor',
    categoryFriendFamily: 'Friend & Family',
    categoryEmployee: 'Employee',
    categoryOther: 'Other',

    // Payment Methods
    methodCash: 'Cash',
    methodBkash: 'bKash',
    methodNagad: 'Nagad',
    methodBank: 'Bank Transfer',
    methodCard: 'Card',
    methodOther: 'Other Method',

    // Contacts
    addContact: 'New Contact',
    editContact: 'Edit Contact',
    contactName: 'Full Name',
    contactPhone: 'Phone Number',
    contactEmail: 'Email (Optional)',
    contactAddress: 'Address (Optional)',
    openingBalance: 'Opening Balance',
    openingBalanceHelp: 'Positive: they owe you, Negative: you owe them',
    publicLookupAllowed: 'Allow Public Lookup',
    reminderPreference: 'Reminder Channel',

    // Reminders
    remindersTitle: 'Due Collections & Reminders',
    sendWhatsApp: 'WhatsApp Message',
    sendSMS: 'Send SMS',
    dueToday: 'Due Today',
    overdueDays: 'days overdue',
    dueInDays: 'days left',
    upcoming: 'Upcoming',
    reminderTemplateWhatsApp: 'Hello {name}, greetings from {business}. A reminder that an outstanding balance of {amount} is due ({dueDate}). Kindly arrange payment at your earliest convenience. Thank you.',
    reminderTemplateSMS: '{business}: Dear {name}, gentle reminder regarding outstanding balance of {amount} due on {dueDate}. Please settle soon.',

    // Public Lookup
    publicLookupTitle: 'Public Balance Lookup Portal',
    publicLookupDesc: 'Customers can securely review their authorized statement using their registered phone number and verification token.',
    enterPhone: 'Enter registered phone number',
    enterToken: 'Enter authorized access token / PIN',
    checkBalance: 'Check Balance',
    lookupDisclaimer: 'To protect privacy, only authorized minimal statements are shown. Business owner must have public lookup enabled.',
    lookupNotFound: 'No authorized records found or invalid security credentials.',

    // Analytics
    analyticsTitle: 'Financial Analytics & Reports',
    cashFlowTrend: 'Monthly Cash Flow Trends',
    receivablesVsPayables: 'Receivables vs Payables',
    agingBreakdown: 'Due Aging Breakdown',
    categoryDistribution: 'Category Distribution',
    methodDistribution: 'Payment Method Distribution',

    // Backup & Restore
    backupTitle: 'Backup, Restore & Export',
    exportJSON: 'Download Full JSON Backup',
    importJSON: 'Restore From JSON Backup',
    exportCSV: 'Export to Excel (CSV)',
    printStatement: 'Printable Statement (PDF)',
    backupWarning: 'Always verify backup files before restoring. You can merge with existing data or completely replace.',

    // Security & PIN
    settingsTitle: 'System Settings & Security',
    businessProfile: 'Business Profile',
    businessName: 'Business Name',
    ownerName: 'Owner Name',
    currency: 'Currency',
    securityPin: '4-Digit Security PIN',
    enablePin: 'Enable Security PIN',
    enterPin: 'Enter 4-Digit PIN',
    confirmPin: 'Confirm PIN',
    pinLocked: 'Device locked due to multiple incorrect attempts. Please wait.',
    unlock: 'Unlock',

    // Synchronization
    syncStatusOnline: 'Online (Sync Active)',
    syncStatusOffline: 'Offline (Saved Locally)',
    syncStatusSyncing: 'Syncing...',
    syncSuccess: 'Synced successfully',
    lastSyncTime: 'Last Sync',

    // Android
    androidGuideTitle: 'Android APK & AAB Build Guide',

    // Daily Quotes
    quoteTitle: 'Daily Business Wisdom',
  },
};

export const businessQuotes = [
  {
    bn: '“হিসাব পরিষ্কার থাকলে ব্যবসায়ী নির্ভয়ে ঘুমায়।” — লোকগাথা',
    en: '“Clear ledgers bring sound sleep to the merchant.” — Traditional Proverb',
  },
  {
    bn: '“সময়ে টাকা আদায় না হলে ব্যবসার প্রাণশক্তি ক্ষয় হয়।”',
    en: '“Timely debt collection preserves the lifeblood of business.”',
  },
  {
    bn: '“বাকি দেওয়া সহজ, কিন্তু বাকি আদায় করতে ধৈর্যের দরকার।”',
    en: '“Extending credit is effortless; collecting requires discipline and tact.”',
  },
  {
    bn: '“একটি বিশ্বস্ত হিসাবের খাতা একটি সফল ব্যবসা গড়ে তোলে।”',
    en: '“An honest, accurate ledger builds an enduring enterprise.”',
  },
  {
    bn: '“প্রতিদিনের দেনাপাওনা প্রতিদিন লিখলে কোনো দেনাদার অচেনা থাকে না।”',
    en: '“Record each transaction daily, and no debtor will ever be forgotten.”',
  },
];
