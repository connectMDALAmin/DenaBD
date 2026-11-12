/**
 * Predefined Expense Categories for Personal Expense Management
 * Fully bilingual (Bangla and English) with icons, color themes, and helpers.
 */

export interface ExpenseCategoryDef {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  color: string;
}

export const PREDEFINED_EXPENSE_CATEGORIES: ExpenseCategoryDef[] = [
  {
    id: 'house_rent',
    nameEn: 'House Rent',
    nameBn: 'বাড়ি ভাড়া',
    icon: '🏠',
    color: '#2563EB',
  },
  {
    id: 'grocery_shopping',
    nameEn: 'Grocery & Shopping',
    nameBn: 'মুদি ও বাজার',
    icon: '🛒',
    color: '#16A34A',
  },
  {
    id: 'food_dining',
    nameEn: 'Food & Dining',
    nameBn: 'খাবার ও রেস্তোরাঁ',
    icon: '🍲',
    color: '#EA580C',
  },
  {
    id: 'electricity_bill',
    nameEn: 'Electricity Bill',
    nameBn: 'বিদ্যুৎ বিল',
    icon: '⚡',
    color: '#CA8A04',
  },
  {
    id: 'gas_bill',
    nameEn: 'Gas Bill',
    nameBn: 'গ্যাস বিল',
    icon: '🔥',
    color: '#E11D48',
  },
  {
    id: 'water_bill',
    nameEn: 'Water Bill',
    nameBn: 'পানি বিল',
    icon: '💧',
    color: '#0284C7',
  },
  {
    id: 'internet_mobile',
    nameEn: 'Internet & Mobile',
    nameBn: 'ইন্টারনেট ও মোবাইল রিচার্জ',
    icon: '📱',
    color: '#7C3AED',
  },
  {
    id: 'transportation',
    nameEn: 'Transportation',
    nameBn: 'যাতায়াত ও পরিবহন',
    icon: '🚌',
    color: '#0891B2',
  },
  {
    id: 'medical_healthcare',
    nameEn: 'Medical & Healthcare',
    nameBn: 'চিকিৎসা ও ওষুধ',
    icon: '💊',
    color: '#DC2626',
  },
  {
    id: 'education',
    nameEn: 'Education',
    nameBn: 'শিক্ষা ও পড়াশোনা',
    icon: '🎓',
    color: '#4F46E5',
  },
  {
    id: 'clothing',
    nameEn: 'Clothing',
    nameBn: 'পোশাক ও কাপড়',
    icon: '👕',
    color: '#9333EA',
  },
  {
    id: 'family_expenses',
    nameEn: 'Family Expenses',
    nameBn: 'পারিবারিক খরচ',
    icon: '👨‍👩‍👦',
    color: '#DB2777',
  },
  {
    id: 'entertainment',
    nameEn: 'Entertainment',
    nameBn: 'বিনোদন ও সিনেমা',
    icon: '🎬',
    color: '#F59E0B',
  },
  {
    id: 'travel',
    nameEn: 'Travel',
    nameBn: 'ভ্রমণ ও ট্যুর',
    icon: '✈️',
    color: '#0D9488',
  },
  {
    id: 'personal_care',
    nameEn: 'Personal Care',
    nameBn: 'ব্যক্তিগত যত্ন ও সেলুন',
    icon: '✨',
    color: '#D97706',
  },
  {
    id: 'loan_interest_fees',
    nameEn: 'Loan Interest / Fees',
    nameBn: 'ঋণের সুদ ও ব্যাংক ফি',
    icon: '💳',
    color: '#475569',
  },
  {
    id: 'other_expenses',
    nameEn: 'Other Expenses',
    nameBn: 'অন্যান্য খরচ',
    icon: '📝',
    color: '#6B7280',
  },
];

/**
 * Common regular business/khata transaction categories
 */
export const COMMON_TRANSACTION_CATEGORIES = [
  { id: 'goods_sale', nameEn: 'Goods Sale (বাকিতে পণ্য বিক্রি)', nameBn: 'পণ্য বিক্রি (বাকি)' },
  { id: 'goods_purchase', nameEn: 'Goods Purchase (বাকিতে পণ্য ক্রয়)', nameBn: 'পণ্য ক্রয় (বাকি)' },
  { id: 'cash_loan', nameEn: 'Personal / Cash Loan (হাতে ধার)', nameBn: 'নগদ ধার / কর্জ' },
  { id: 'business_deal', nameEn: 'Business Deal (ব্যবসায়িক লেনদেন)', nameBn: 'ব্যবসায়িক লেনদেন' },
  { id: 'advance', nameEn: 'Advance Payment (অগ্রিম)', nameBn: 'অগ্রিম গ্রহণ / প্রদান' },
  { id: 'salary_wages', nameEn: 'Salary & Wages (বেতন ও মজুরি)', nameBn: 'কর্মচারীর বেতন' },
  { id: 'commission', nameEn: 'Commission (কমিশন)', nameBn: 'কমিশন' },
  { id: 'general', nameEn: 'General / Regular (সাধারণ)', nameBn: 'সাধারণ লেনদেন' },
];

/**
 * Resolves localized category name from category ID or string
 */
export function getExpenseCategoryLabel(catIdOrName: string, lang: 'en' | 'bn'): string {
  if (!catIdOrName) return lang === 'bn' ? 'অন্যান্য খরচ' : 'Other Expenses';
  const match = PREDEFINED_EXPENSE_CATEGORIES.find(
    (c) => c.id === catIdOrName || c.nameEn.toLowerCase() === catIdOrName.toLowerCase() || c.nameBn === catIdOrName
  );
  if (match) {
    return lang === 'bn' ? match.nameBn : match.nameEn;
  }
  return catIdOrName;
}

/**
 * Resolves category icon
 */
export function getExpenseCategoryIcon(catIdOrName: string): string {
  const match = PREDEFINED_EXPENSE_CATEGORIES.find(
    (c) => c.id === catIdOrName || c.nameEn.toLowerCase() === catIdOrName.toLowerCase() || c.nameBn === catIdOrName
  );
  return match ? match.icon : '🏷️';
}

/**
 * Resolves category color
 */
export function getExpenseCategoryColor(catIdOrName: string): string {
  const match = PREDEFINED_EXPENSE_CATEGORIES.find(
    (c) => c.id === catIdOrName || c.nameEn.toLowerCase() === catIdOrName.toLowerCase() || c.nameBn === catIdOrName
  );
  return match ? match.color : '#6B7280';
}
