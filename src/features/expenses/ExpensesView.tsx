import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { Transaction } from '../../types/accounting';
import { XPIcon } from '../../components/xp/XPIcon';
import {
  PREDEFINED_EXPENSE_CATEGORIES,
  getExpenseCategoryLabel,
  getExpenseCategoryIcon,
  getExpenseCategoryColor,
} from '../../services/expenses/expenseCategories';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { soundService } from '../../services/sound/soundService';

interface ExpensesViewProps {
  onOpenNewExpense: () => void;
  onEditExpense: (tx: Transaction) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onOpenNewExpense,
  onEditExpense,
}) => {
  const { transactions, deleteTransaction, userProfile } = useApp();
  const { language, t } = useI18n();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Delete confirmation dialog state
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [deleteConfirmationStep, setDeleteConfirmationStep] = useState<1 | 2>(1);

  // All expense transactions sorted newest first
  const allExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.status !== 'cancelled')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Date filtering helper
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((tx) => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const catLabelEn = getExpenseCategoryLabel(tx.category || '', 'en').toLowerCase();
        const catLabelBn = getExpenseCategoryLabel(tx.category || '', 'bn').toLowerCase();
        const notes = (tx.notes || '').toLowerCase();
        const ref = (tx.referenceNumber || '').toLowerCase();
        const amtStr = String(tx.amount);

        const matches =
          catLabelEn.includes(q) ||
          catLabelBn.includes(q) ||
          notes.includes(q) ||
          ref.includes(q) ||
          amtStr.includes(q);

        if (!matches) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // 3. Payment Method filter
      if (selectedPaymentMethod !== 'all' && tx.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // 4. Date Range filter
      if (dateFilter === 'today') {
        const txDateStr = tx.date ? tx.date.split('T')[0] : '';
        if (txDateStr !== todayStr) return false;
      } else if (dateFilter === 'week') {
        const txTime = new Date(tx.date).getTime();
        const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        if (txTime < weekAgo) return false;
      } else if (dateFilter === 'month') {
        const txDate = new Date(tx.date);
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      } else if (dateFilter === 'year') {
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() !== now.getFullYear()) {
          return false;
        }
      }

      return true;
    });
  }, [allExpenses, searchTerm, selectedCategory, selectedPaymentMethod, dateFilter, todayStr]);

  // Metrics calculation
  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [filteredExpenses]);

  const avgExpense = useMemo(() => {
    return filteredExpenses.length > 0 ? Math.round(totalFilteredAmount / filteredExpenses.length) : 0;
  }, [filteredExpenses, totalFilteredAmount]);

  // All-time expense total for quick reference
  const allTimeTotal = useMemo(() => {
    return allExpenses.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  }, [allExpenses]);

  // Format currency helper
  const formatBDT = (val: number) => {
    return `৳${val.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}`;
  };

  // CSV Export handler
  const handleExportCSV = () => {
    soundService.playClick();
    if (filteredExpenses.length === 0) return;

    const headers = [
      language === 'bn' ? 'তারিখ' : 'Date',
      language === 'bn' ? 'ক্যাটাগরি' : 'Category',
      language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (BDT)',
      language === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment Method',
      language === 'bn' ? 'রেফারেন্স / ভাউচার' : 'Ref / Invoice',
      language === 'bn' ? 'বিবরণ / নোট' : 'Notes / Description',
    ];

    const rows = filteredExpenses.map((tx) => [
      `"${tx.date ? tx.date.split('T')[0] : ''}"`,
      `"${getExpenseCategoryLabel(tx.category || '', language)}"`,
      `"${tx.amount}"`,
      `"${tx.paymentMethod || 'cash'}"`,
      `"${(tx.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DenaPawna_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Delete transaction with double confirmation
  const handleInitiateDelete = (tx: Transaction) => {
    soundService.playClick();
    setDeletingTx(tx);
    setDeleteConfirmationStep(1);
  };

  const handleConfirmDeleteStep1 = () => {
    soundService.playClick();
    setDeleteConfirmationStep(2);
  };

  const handleFinalDelete = () => {
    if (!deletingTx) return;
    soundService.playClick();
    deleteTransaction(deletingTx.id);
    setDeletingTx(null);
    setDeleteConfirmationStep(1);
  };

  const handleCancelDelete = () => {
    soundService.playClick();
    setDeletingTx(null);
    setDeleteConfirmationStep(1);
  };

  return (
    <div className="p-3 sm:p-5 max-w-6xl mx-auto space-y-4">
      {/* Top Banner / XP Window Header */}
      <div className="bg-gradient-to-r from-[#0055EA] via-[#1E70F0] to-[#0040B8] text-white p-4 rounded-t shadow-md border-b-2 border-[#F6A500] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 rounded border border-white/20 shadow-inner">
            <XPIcon name="expense" size={32} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-shadow">
              {language === 'bn' ? 'ব্যক্তিগত খরচের হিসাব' : 'Personal Expense Management'}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 opacity-90">
              {language === 'bn'
                ? 'ব্যক্তিগত ও পারিবারিক খরচের আলাদা হিসাব — গ্রাহক খাতার দেনা-পাওনা সম্পূর্ণ অক্ষত থাকবে'
                : 'Track personal & household spending — Customer debt balances remain strictly unaffected'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              soundService.playClick();
              onOpenNewExpense();
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-b from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] active:from-[#15803D] text-white font-bold text-sm rounded shadow-sm border border-[#14532D] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন খরচ এন্ট্রি' : 'New Expense'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredExpenses.length === 0}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-b from-white to-[#ECE9D8] hover:bg-gray-100 text-gray-800 text-xs sm:text-sm font-semibold rounded border border-[#7F9DB9] disabled:opacity-50 cursor-pointer shadow-xs"
            title={language === 'bn' ? 'CSV ফাইল ডাউনলোড করুন' : 'Export to CSV'}
          >
            <Download className="w-4 h-4 text-[#0055EA]" />
            <span className="hidden sm:inline">{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total In Selected Filter */}
        <div className="bg-[#ECE9D8] border border-[#0055EA] p-3 rounded shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-1">
            <span>{language === 'bn' ? 'ফিল্টারকৃত মোট খরচ' : 'Filtered Total'}</span>
            <DollarSign className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-700 font-mono tracking-tight">
            {formatBDT(totalFilteredAmount)}
          </div>
          <div className="text-[11px] text-gray-600 mt-1">
            {filteredExpenses.length} {language === 'bn' ? 'টি এন্ট্রি' : 'transactions'}
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none pr-1">
            <XPIcon name="expense" size={48} />
          </div>
        </div>

        {/* All-time Personal Expense */}
        <div className="bg-[#ECE9D8] border border-[#7F9DB9] p-3 rounded shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-1">
            <span>{language === 'bn' ? 'সর্বমোট ব্যক্তিগত খরচ' : 'All-Time Spent'}</span>
            <TrendingDown className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
            {formatBDT(allTimeTotal)}
          </div>
          <div className="text-[11px] text-gray-600 mt-1">
            {allExpenses.length} {language === 'bn' ? 'টি সর্বমোট রেকর্ড' : 'total records'}
          </div>
        </div>

        {/* Average Per Expense */}
        <div className="bg-[#ECE9D8] border border-[#7F9DB9] p-3 rounded shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-1">
            <span>{language === 'bn' ? 'গড় প্রতি খরচ' : 'Average / Expense'}</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 font-mono">
            {formatBDT(avgExpense)}
          </div>
          <div className="text-[11px] text-gray-600 mt-1">
            {language === 'bn' ? 'নির্বাচিত সময়কালে' : 'In active filter'}
          </div>
        </div>

        {/* Active Category Indicator */}
        <div className="bg-[#ECE9D8] border border-[#7F9DB9] p-3 rounded shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-gray-700 font-semibold mb-1">
            <span>{language === 'bn' ? 'নির্বাচিত ক্যাটাগরি' : 'Selected Category'}</span>
            <Filter className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-sm font-bold text-purple-900 truncate">
            {selectedCategory === 'all'
              ? language === 'bn'
                ? 'সকল ক্যাটাগরি'
                : 'All Categories'
              : getExpenseCategoryLabel(selectedCategory, language)}
          </div>
          <div className="text-[11px] text-gray-600 mt-1">
            {language === 'bn' ? 'পেমেন্ট: ' : 'Method: '}
            <span className="font-semibold capitalize">{selectedPaymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#ECE9D8] border border-[#7F9DB9] p-3 rounded shadow-inner space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'bn' ? 'খরচের বিবরণ, ক্যাটাগরি বা নোট...' : 'Search category, notes, ref...'}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#7F9DB9] rounded shadow-inner focus:outline-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-white border border-[#7F9DB9] rounded shadow-inner focus:outline-blue-500"
            >
              <option value="all">{language === 'bn' ? '📁 সকল ক্যাটাগরি (All Categories)' : '📁 All Categories'}</option>
              {PREDEFINED_EXPENSE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.nameBn} ({c.nameEn})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-2 py-1.5 text-xs bg-white border border-[#7F9DB9] rounded shadow-inner focus:outline-blue-500"
            >
              <option value="all">{language === 'bn' ? '💳 সকল পেমেন্ট মাধ্যম' : '💳 All Payment Methods'}</option>
              <option value="cash">{language === 'bn' ? 'নগদ (Cash)' : 'Cash'}</option>
              <option value="bank">{language === 'bn' ? 'ব্যাংক ট্রান্সফার (Bank)' : 'Bank Transfer'}</option>
              <option value="bkash">বিকাশ (bKash)</option>
              <option value="nagad">নগদ (Nagad)</option>
              <option value="rocket">রকেট (Rocket)</option>
              <option value="other">{language === 'bn' ? 'অন্যান্য (Other)' : 'Other'}</option>
            </select>
          </div>

          {/* Date Range Tabs */}
          <div className="flex bg-white rounded border border-[#7F9DB9] p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                dateFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? 'সব' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                dateFilter === 'today'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? 'আজ' : 'Today'}
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('week')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                dateFilter === 'week'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? '৭ দিন' : 'Week'}
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('month')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                dateFilter === 'month'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? 'এই মাস' : 'Month'}
            </button>
            <button
              type="button"
              onClick={() => setDateFilter('year')}
              className={`flex-1 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                dateFilter === 'year'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'bn' ? 'এই বছর' : 'Year'}
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-[#7F9DB9] rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gradient-to-b from-[#F2F4F7] to-[#DFE3E8] border-b border-[#7F9DB9] text-gray-700 font-bold">
                <th className="py-2.5 px-3 border-r border-[#D3D8E0]">{language === 'bn' ? 'তারিখ' : 'Date'}</th>
                <th className="py-2.5 px-3 border-r border-[#D3D8E0]">{language === 'bn' ? 'খরচের ক্যাটাগরি' : 'Category'}</th>
                <th className="py-2.5 px-3 border-r border-[#D3D8E0]">{language === 'bn' ? 'বিবরণ ও রেফারেন্স' : 'Description / Ref'}</th>
                <th className="py-2.5 px-3 border-r border-[#D3D8E0]">{language === 'bn' ? 'মাধ্যম' : 'Method'}</th>
                <th className="py-2.5 px-3 border-r border-[#D3D8E0] text-right">{language === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</th>
                <th className="py-2.5 px-3 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="p-3 bg-red-50 text-red-400 rounded-full">
                        <TrendingDown className="w-8 h-8" />
                      </div>
                      <p className="font-semibold text-gray-700">
                        {language === 'bn' ? 'কোনো খরচের রেকর্ড পাওয়া যায়নি' : 'No expense records found'}
                      </p>
                      <p className="text-xs text-gray-500 max-w-sm">
                        {language === 'bn'
                          ? 'নতুন খরচ রেকর্ড করতে উপরের "নতুন খরচ এন্ট্রি" বাটনে ক্লিক করুন।'
                          : 'Click "New Expense" above to record personal spending like rent, utilities, food, etc.'}
                      </p>
                      <button
                        onClick={onOpenNewExpense}
                        className="mt-2 px-3 py-1.5 bg-[#0055EA] text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                      >
                        {language === 'bn' ? '+ খরচ যোগ করুন' : '+ Add First Expense'}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((tx, idx) => {
                  const catId = tx.category || 'other_expenses';
                  const catLabel = getExpenseCategoryLabel(catId, language);
                  const catIcon = getExpenseCategoryIcon(catId);
                  const catColor = getExpenseCategoryColor(catId);
                  const dateStr = tx.date ? tx.date.split('T')[0] : '';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-blue-50/60 transition-colors ${
                        idx % 2 === 1 ? 'bg-[#FAFBFC]' : 'bg-white'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap font-mono text-gray-800">
                        {dateStr}
                      </td>

                      {/* Category Badge */}
                      <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                        <span
                          className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${catColor}15`,
                            color: catColor,
                            border: `1px solid ${catColor}35`,
                          }}
                        >
                          <span>{catIcon}</span>
                          <span className="font-semibold">{catLabel}</span>
                        </span>
                      </td>

                      {/* Description & Reference */}
                      <td className="py-2.5 px-3 border-r border-gray-200 text-gray-800">
                        <div className="font-medium text-xs">
                          {tx.notes ? tx.notes : <span className="text-gray-400 italic">{language === 'bn' ? 'নোট নেই' : 'No notes'}</span>}
                        </div>
                        {tx.referenceNumber && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {language === 'bn' ? 'ইনভয়েস/ভাউচার: ' : 'Ref: '}
                            <span className="font-semibold">{tx.referenceNumber}</span>
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold uppercase tracking-wider border border-gray-300">
                          {tx.paymentMethod || 'CASH'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-2.5 px-3 border-r border-gray-200 whitespace-nowrap text-right font-mono font-bold text-red-600 text-sm">
                        -{formatBDT(tx.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            type="button"
                            onClick={() => {
                              soundService.playClick();
                              onEditExpense(tx);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded cursor-pointer"
                            title={language === 'bn' ? 'সম্পাদনা করুন' : 'Edit Expense'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateDelete(tx)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded cursor-pointer"
                            title={language === 'bn' ? 'মুছে ফেলুন' : 'Delete Expense'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Status Bar */}
        <div className="bg-[#ECE9D8] px-3 py-2 border-t border-[#7F9DB9] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-700 gap-2">
          <div>
            {language === 'bn' ? 'প্রদর্শিত হচ্ছে ' : 'Showing '}
            <span className="font-bold">{filteredExpenses.length}</span>
            {language === 'bn' ? ' টি খরচের এন্ট্রি' : ' expense entries'}
          </div>
          <div className="font-bold text-red-700 font-mono">
            {language === 'bn' ? 'মোট খরচ: ' : 'Total: '} {formatBDT(totalFilteredAmount)}
          </div>
        </div>
      </div>

      {/* Double Confirmation Delete Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#ECE9D8] rounded-t border-2 border-[#0055EA] shadow-2xl overflow-hidden font-sans">
            {/* Modal Title Bar */}
            <div className="bg-gradient-to-r from-[#D32F2F] to-[#B71C1C] text-white px-3 py-1.5 flex items-center justify-between select-none">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-300" />
                <span className="font-bold text-xs">
                  {deleteConfirmationStep === 1
                    ? language === 'bn'
                      ? 'খরচ মুছে ফেলার নিশ্চিতকরণ — ধাপ ১'
                      : 'Confirm Delete Expense — Step 1 of 2'
                    : language === 'bn'
                    ? 'চূড়ান্ত সতর্কতা — ধাপ ২'
                    : 'FINAL CONFIRMATION — Step 2 of 2'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="w-5 h-5 bg-[#C0392B] hover:bg-red-700 text-white rounded-xs font-bold text-xs flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3">
              {deleteConfirmationStep === 1 ? (
                <>
                  <div className="p-3 bg-white rounded border border-[#7F9DB9] text-xs space-y-1.5">
                    <p className="font-bold text-gray-900">
                      {language === 'bn'
                        ? 'আপনি কি নিশ্চিত যে এই ব্যক্তিগত খরচটি মুছে ফেলতে চান?'
                        : 'Are you sure you want to delete this expense record?'}
                    </p>
                    <div className="pt-2 border-t border-gray-200 text-gray-700 space-y-1">
                      <div>
                        <span className="font-semibold">{language === 'bn' ? 'ক্যাটাগরি: ' : 'Category: '}</span>
                        {getExpenseCategoryLabel(deletingTx.category || '', language)}
                      </div>
                      <div>
                        <span className="font-semibold">{language === 'bn' ? 'পরিমাণ: ' : 'Amount: '}</span>
                        <span className="text-red-700 font-bold">{formatBDT(deletingTx.amount)}</span>
                      </div>
                      <div>
                        <span className="font-semibold">{language === 'bn' ? 'তারিখ: ' : 'Date: '}</span>
                        {deletingTx.date ? deletingTx.date.split('T')[0] : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="px-4 py-1.5 bg-gradient-to-b from-white to-[#ECE9D8] border border-[#7F9DB9] text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 cursor-pointer"
                    >
                      {language === 'bn' ? 'বাতিল' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteStep1}
                      className="px-4 py-1.5 bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded border border-amber-800 cursor-pointer"
                    >
                      {language === 'bn' ? 'পরবর্তী ধাপ →' : 'Proceed to Step 2 →'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-red-50 rounded border-2 border-red-500 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-red-700 font-bold">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <span>{language === 'bn' ? 'স্থায়ীভাবে মুছে ফেলা হবে!' : 'Permanent Deletion!'}</span>
                    </div>
                    <p className="text-red-800">
                      {language === 'bn'
                        ? 'এই এন্ট্রিটি মুছে ফেললে তা পুনরায় উদ্ধার করা সম্ভব হবে না। আপনি কি নিশ্চিত?'
                        : 'Once deleted, this expense record cannot be recovered. Are you absolutely certain?'}
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="px-4 py-1.5 bg-gradient-to-b from-white to-[#ECE9D8] border border-[#7F9DB9] text-gray-800 text-xs font-semibold rounded hover:bg-gray-100 cursor-pointer"
                    >
                      {language === 'bn' ? 'না, রাখুন' : 'No, Keep It'}
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalDelete}
                      className="px-4 py-1.5 bg-gradient-to-b from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold rounded border border-red-900 cursor-pointer shadow-sm"
                    >
                      {language === 'bn' ? 'হ্যাঁ, চূড়ান্তভাবে মুছুন' : 'Yes, Delete Permanently'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
