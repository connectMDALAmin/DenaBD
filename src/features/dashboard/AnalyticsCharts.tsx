import React from 'react';
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
import { computeMonthlyCashFlowTrends, fromMinorUnits, formatCurrency } from '../../services/accounting/calculator';

const COLORS = ['#0055EA', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#0097A7'];

export const AnalyticsCharts: React.FC = () => {
  const { transactions, contacts, ledgerSummary } = useApp();
  const { t, language } = useI18n();

  const monthlyData = computeMonthlyCashFlowTrends(transactions);

  // Breakdown of Receivables vs Payables
  const pieData = [
    {
      name: t('receivables'),
      value: fromMinorUnits(ledgerSummary.totalReceivable),
    },
    {
      name: t('payables'),
      value: fromMinorUnits(ledgerSummary.totalPayable),
    },
  ];

  // Payment Method Breakdown
  const methodMap: Record<string, number> = {};
  transactions
    .filter((tx) => tx.status === 'active')
    .forEach((tx) => {
      methodMap[tx.paymentMethod] = (methodMap[tx.paymentMethod] || 0) + fromMinorUnits(tx.amount);
    });

  const methodData = Object.entries(methodMap).map(([method, amount]) => ({
    name: method.toUpperCase(),
    amount: Math.round(amount),
  }));

  // Aging analysis
  const now = new Date().getTime();
  let agingCurrent = 0;
  let aging15Days = 0;
  let aging30Days = 0;
  let aging60Plus = 0;

  transactions
    .filter((tx) => tx.status === 'active' && tx.type === 'given' && tx.dueDate)
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

  const agingData = [
    { name: language === 'bn' ? 'নিয়মিত (মেয়াদ বাকি)' : 'Current (On-Time)', value: agingCurrent },
    { name: language === 'bn' ? '১-১৫ দিন বকেয়া' : '1-15 Days Due', value: aging15Days },
    { name: language === 'bn' ? '১৬-৩০ দিন বকেয়া' : '16-30 Days Due', value: aging30Days },
    { name: language === 'bn' ? '৩০+ দিন অতি-বকেয়া' : '30+ Days Overdue', value: aging60Plus },
  ];

  return (
    <div className="space-y-4">
      {/* 2-Column Chart Grid */}
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
    </div>
  );
};
