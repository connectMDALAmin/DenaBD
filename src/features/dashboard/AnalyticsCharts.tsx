import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  computeMonthlyCashFlowTrends,
  fromMinorUnits,
  formatCurrency,
  calculateExpenseSummary,
} from '../../services/accounting/calculator';
import {
  getExpenseCategoryLabel,
  getExpenseCategoryIcon,
  getExpenseCategoryColor,
} from '../../services/expenses/expenseCategories';
import { XPIcon } from '../../components/xp/XPIcon';
import { TrendingDown, PieChart as PieIcon, BarChart3, Calendar, Layers, CreditCard } from 'lucide-react';

const COLORS = ['#0055EA', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#0097A7', '#FF8F00', '#E91E63', '#00BCD4'];

export const AnalyticsCharts: React.FC = () => {
  const { transactions, contacts, ledgerSummary } = useApp();
  const { t, language } = useI18n();

  // Active Analytics Tab: 'ledger' | 'expenses'
  const [activeChartTab, setActiveChartTab] = useState<'ledger' | 'expenses'>('ledger');

  // Ledger Cash Flow Data
  const monthlyData = useMemo(() => computeMonthlyCashFlowTrends(transactions), [transactions]);

  // Breakdown of Receivables vs Payables
  const pieData = useMemo(() => [
    {
      name: t('receivables'),
      value: fromMinorUnits(ledgerSummary.totalReceivable),
    },
    {
      name: t('payables'),
      value: fromMinorUnits(ledgerSummary.totalPayable),
    },
  ], [ledgerSummary, t]);

  // Payment Method Breakdown for Ledger
  const methodData = useMemo(() => {
    const methodMap: Record<string, number> = {};
    transactions
      .filter((tx) => tx.status !== 'cancelled' && tx.type !== 'expense')
      .forEach((tx) => {
        methodMap[tx.paymentMethod] = (methodMap[tx.paymentMethod] || 0) + fromMinorUnits(tx.amount);
      });

    return Object.entries(methodMap).map(([method, amount]) => ({
      name: method.toUpperCase(),
      amount: Math.round(amount),
    }));
  }, [transactions]);

  // Aging analysis
  const agingData = useMemo(() => {
    const now = new Date().getTime();
    let agingCurrent = 0;
    let aging15Days = 0;
    let aging30Days = 0;
    let aging60Plus = 0;

    transactions
      .filter((tx) => tx.status !== 'cancelled' && tx.type === 'given' && tx.dueDate)
      .forEach((tx) => {
        const due = new Date(tx.dueDate!).getTime();
        const diffDays = Math.round((now - due) / (1000 * 60 * 60 * 24));
        const val = fromMinorUnits(tx.amount);
        if (diffDays <= 0) {
          agingCurrent += val;
        } else if (diffDays <= 15) {
          aging15Days += val;
        } else if (diffDays <= 30) {
          aging30Days += val;
        } else {
          aging60Plus += val;
        }
      });

    return [
      { name: language === 'bn' ? 'নিয়মিত (মেয়াদ বাকি)' : 'Current (On-Time)', value: agingCurrent },
      { name: language === 'bn' ? '১-১৫ দিন বকেয়া' : '1-15 Days Due', value: aging15Days },
      { name: language === 'bn' ? '১৬-৩০ দিন বকেয়া' : '16-30 Days Due', value: aging30Days },
      { name: language === 'bn' ? '৩০+ দিন অতি-বকেয়া' : '30+ Days Overdue', value: aging60Plus },
    ];
  }, [transactions, language]);

  // === EXPENSE ANALYTICS DATA ===
  const expenseSummary = useMemo(() => {
    return calculateExpenseSummary(transactions, new Date(), language === 'bn' ? 'bn' : 'en');
  }, [transactions, language]);

  // Monthly Expense Trend (Last 6 Months)
  const monthlyExpenseTrend = useMemo(() => {
    const now = new Date();
    const result: Array<{ month: string; amount: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${monthNum}`;

      const totalForMonth = transactions
        .filter((tx) => tx.type === 'expense' && tx.status !== 'cancelled' && tx.date.startsWith(prefix))
        .reduce((sum, tx) => sum + (tx.amount || 0), 0);

      const monthName = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        month: 'short',
      });

      result.push({
        month: `${monthName} '${String(year).slice(-2)}`,
        amount: totalForMonth,
      });
    }

    return result;
  }, [transactions, language]);

  // Category Pie Chart Data
  const categoryPieData = useMemo(() => {
    return expenseSummary.categoryTotals.slice(0, 6).map((cat) => ({
      name: cat.categoryLabel,
      value: cat.total,
      color: cat.color,
      icon: cat.icon,
      percentage: cat.percentage,
    }));
  }, [expenseSummary]);

  // Expense Payment Methods
  const expenseMethodData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((tx) => tx.type === 'expense' && tx.status !== 'cancelled')
      .forEach((tx) => {
        const method = (tx.paymentMethod || 'cash').toUpperCase();
        map[method] = (map[method] || 0) + (tx.amount || 0);
      });

    return Object.entries(map).map(([method, amount]) => ({
      name: method,
      amount: Math.round(amount),
    }));
  }, [transactions]);

  // Period-wise Comparison Breakdown
  const periodBreakdown = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth();

    const expenses = transactions.filter((t) => t.type === 'expense' && t.status !== 'cancelled');

    const todayTotal = expenses
      .filter((t) => t.date.split('T')[0] === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    const weekTotal = expenses
      .filter((t) => new Date(t.date).getTime() >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthTotal = expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const yearTotal = expenses
      .filter((t) => new Date(t.date).getFullYear() === curYear)
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      {
        period: language === 'bn' ? 'দৈনিক খরচ (আজ)' : "Daily (Today)",
        amount: todayTotal,
        desc: language === 'bn' ? 'আজকের মোট ব্যয়' : "Today's spending",
      },
      {
        period: language === 'bn' ? 'সাপ্তাহিক খরচ (৭ দিন)' : 'Weekly (7 Days)',
        amount: weekTotal,
        desc: language === 'bn' ? 'গত ৭ দিনের ব্যয়' : 'Last 7 days total',
      },
      {
        period: language === 'bn' ? 'মাসিক খরচ (চলতি মাস)' : 'Monthly (This Month)',
        amount: monthTotal,
        desc: language === 'bn' ? 'চলতি ক্যালেন্ডার মাস' : 'Current calendar month',
      },
      {
        period: language === 'bn' ? 'বাৎসরিক খরচ (এই বছর)' : 'Yearly (This Year)',
        amount: yearTotal,
        desc: language === 'bn' ? 'চলতি বছর ২০২৫' : 'Current calendar year',
      },
    ];
  }, [transactions, language]);

  return (
    <div className="space-y-4">
      {/* Top Tab Bar: Ledger vs Personal Expenses */}
      <div className="flex items-center space-x-1 border-b border-[#7F9DB9] pb-1">
        <button
          type="button"
          onClick={() => setActiveChartTab('ledger')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-t cursor-pointer border-t border-l border-r transition ${
            activeChartTab === 'ledger'
              ? 'bg-white border-[#7F9DB9] text-[#0055EA] font-bold shadow-xs'
              : 'bg-[#ECE9D8] border-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'ব্যবসায়িক খাতা অ্যানালিটিক্স' : 'Ledger Analytics'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveChartTab('expenses')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-t cursor-pointer border-t border-l border-r transition ${
            activeChartTab === 'expenses'
              ? 'bg-white border-[#7F9DB9] text-red-600 font-bold shadow-xs'
              : 'bg-[#ECE9D8] border-transparent text-gray-700 hover:bg-gray-100'
          }`}
        >
          <XPIcon name="expense" size={14} />
          <span>{language === 'bn' ? 'ব্যক্তিগত খরচের অ্যানালিটিক্স' : 'Personal Expense Analytics'}</span>
        </button>
      </div>

      {activeChartTab === 'ledger' ? (
        <>
          {/* 2-Column Chart Grid for Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Cash Flow Bar Chart */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#0055EA] inline-block rounded-xs" />
                  {t('cashFlowTrend')}
                </h3>
                <span className="text-[11px] text-gray-500">Last 6 Months</span>
              </div>
              <div className="h-64 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                      contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="given" name={t('typeGiven')} fill="#0055EA" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="received" name={t('typeReceived')} fill="#388E3C" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Receivables vs Payables Ratio */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#388E3C] inline-block rounded-xs" />
                  {t('receivablesVsPayables')}
                </h3>
                <span className="text-[11px] text-gray-500 font-mono">
                  Net: {formatCurrency(ledgerSummary.netPosition)}
                </span>
              </div>
              <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
                <div className="w-full sm:w-1/2 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#0055EA" />
                        <Cell fill="#D32F2F" />
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                        contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 p-2 space-y-2 text-xs">
                  <div className="p-2 rounded bg-blue-50 border border-blue-200">
                    <div className="text-[11px] text-blue-700 font-medium">{t('receivables')}</div>
                    <div className="text-sm font-bold text-blue-900 font-mono tabular-nums">
                      {formatCurrency(ledgerSummary.totalReceivable)}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-red-50 border border-red-200">
                    <div className="text-[11px] text-red-700 font-medium">{t('payables')}</div>
                    <div className="text-sm font-bold text-red-900 font-mono tabular-nums">
                      {formatCurrency(ledgerSummary.totalPayable)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Aging Breakdown & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Aging Breakdown */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570]">{t('agingBreakdown')}</h3>
                <span className="text-[11px] text-amber-600 font-semibold">
                  Overdue: {formatCurrency(ledgerSummary.totalOverdueReceivable)}
                </span>
              </div>
              <div className="h-56 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agingData} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="#666" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#666" fontSize={10} width={90} />
                    <Tooltip
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                    />
                    <Bar dataKey="value" fill="#F57C00" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570]">{t('methodDistribution')}</h3>
                <span className="text-[11px] text-gray-500">Channel Volume</span>
              </div>
              <div className="h-56 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={methodData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" fontSize={10} />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, 'Total']}
                      contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                    />
                    <Bar dataKey="amount" fill="#7B1FA2" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* EXPENSE ANALYTICS VIEW */
        <div className="space-y-4">
          {/* Top Row: Period Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {periodBreakdown.map((item, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-[#7F9DB9] xp-bevel-inset">
                <div className="text-[11px] font-bold text-gray-600">{item.period}</div>
                <div className="text-xl font-bold text-red-600 font-mono mt-1">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* Middle Row: Monthly Expense Trend + Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Spending Trend */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span>{language === 'bn' ? 'মাসিক ব্যক্তিগত খরচের ট্রেন্ড' : 'Monthly Spending Trend'}</span>
                </h3>
                <span className="text-[11px] text-gray-500">{language === 'bn' ? 'বিগত ৬ মাস' : 'Last 6 Months'}</span>
              </div>
              <div className="h-64 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpenseTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, language === 'bn' ? 'মোট খরচ' : 'Spent']}
                      contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                    />
                    <Bar dataKey="amount" fill="#D32F2F" radius={[3, 3, 0, 0]} name={language === 'bn' ? 'খরচ (৳)' : 'Expense (BDT)'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Pie Chart */}
            <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  <span>{language === 'bn' ? 'খাত অনুযায়ী খরচের অনুপাত' : 'Category-wise Spending'}</span>
                </h3>
                <span className="text-[11px] text-gray-500 font-mono">
                  {language === 'bn' ? 'সর্বমোট: ' : 'Total: '} {formatCurrency(expenseSummary.allTimeTotal)}
                </span>
              </div>
              {categoryPieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-xs text-gray-400 italic">
                  {language === 'bn' ? 'এখনো কোনো খরচের তথ্য নেই' : 'No expense data recorded'}
                </div>
              ) : (
                <div className="h-64 flex flex-col sm:flex-row items-center justify-center">
                  <div className="w-full sm:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                          contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 p-2 space-y-1.5 text-xs max-h-56 overflow-y-auto">
                    {categoryPieData.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 rounded bg-gray-50 border border-gray-100">
                        <span className="flex items-center gap-1.5 truncate max-w-[120px]">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        <span className="font-mono font-bold text-gray-800">
                          {cat.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row: Expense Payment Methods */}
          <div className="bg-white p-3 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
              <h3 className="font-bold text-xs text-[#002570] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'পেমেন্ট মাধ্যম অনুযায়ী ব্যয়' : 'Payment Method Distribution'}</span>
              </h3>
              <span className="text-[11px] text-gray-500">{language === 'bn' ? 'নগদ, ব্যাংক ও মোবাইল ব্যাংকিং' : 'Cash, Bank & Mobile'}</span>
            </div>
            {expenseMethodData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-xs text-gray-400 italic">
                {language === 'bn' ? 'কোনো পেমেন্ট তথ্য নেই' : 'No payment data'}
              </div>
            ) : (
              <div className="h-48 text-xs font-mono">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={expenseMethodData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" stroke="#666" fontSize={11} />
                    <YAxis stroke="#666" fontSize={11} />
                    <Tooltip
                      formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, language === 'bn' ? 'মোট' : 'Total']}
                      contentStyle={{ backgroundColor: '#ECE9D8', border: '1px solid #707070', fontSize: '11px' }}
                    />
                    <Bar dataKey="amount" fill="#00897B" radius={[3, 3, 0, 0]} name={language === 'bn' ? 'ব্যয় (৳)' : 'Spent (BDT)'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
