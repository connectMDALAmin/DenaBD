import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { getDueReminderItems, buildWhatsAppLink, buildSmsLink, DueReminderItem } from '../../services/reminders/reminderEngine';
import { formatCurrency } from '../../services/accounting/calculator';
import { BellRing, MessageSquare, PhoneCall, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

export const RemindersView: React.FC = () => {
  const { contacts, transactions, userProfile, saveTransaction } = useApp();
  const { t, language } = useI18n();

  const [filter, setFilter] = useState<'all' | 'overdue' | 'due_today' | 'upcoming'>('all');

  const reminderItems = getDueReminderItems(contacts, transactions);

  const filteredItems = reminderItems.filter((item) => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleMarkInstallmentPaid = (item: DueReminderItem) => {
    if (item.type !== 'installment' || !item.installmentId) return;

    const tx = transactions.find((t) => t.id === item.transactionId);
    if (!tx || !tx.installments) return;

    const updatedInstallments = tx.installments.map((inst) => {
      if (inst.id === item.installmentId) {
        return {
          ...inst,
          paidAmount: inst.amount,
          status: 'paid' as const,
          paidDate: new Date().toISOString().split('T')[0],
        };
      }
      return inst;
    });

    // Also record a 'received' transaction
    saveTransaction({
      userId: userProfile.id,
      contactId: item.contact.id,
      type: 'received',
      amount: item.amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      category: 'কিস্তি আদায়',
      notes: `কিস্তি পরিশোধ (${item.dueDate})`,
      status: 'active',
    });

    saveTransaction({
      ...tx,
      installments: updatedInstallments,
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#FFFCE8] border border-[#E0D89A] rounded-[4px] p-3 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <BellRing size={18} className="text-amber-600" />
          <span className="font-semibold text-gray-800">
            {t('remindersTitle')} — {reminderItems.length}{' '}
            {language === 'bn' ? 'টি বকেয়া তাকিদা পাওয়া গেছে' : 'due items pending'}
          </span>
        </div>
        <span className="text-gray-500 text-[11px]">
          WhatsApp & SMS One-Click Dispatch
        </span>
      </div>

      {/* Filter Segmented Controls */}
      <div className="flex items-center gap-1 bg-[#ECE9D8] p-1 rounded-[3px] border border-[#7F9DB9] text-xs">
        {[
          { id: 'all', label: language === 'bn' ? 'সকল তাকিদা' : 'All Due' },
          { id: 'overdue', label: language === 'bn' ? 'মেয়াদোত্তীর্ণ (Overdue)' : 'Overdue' },
          { id: 'due_today', label: language === 'bn' ? 'আজকের শেষ তারিখ' : 'Due Today' },
          { id: 'upcoming', label: language === 'bn' ? 'আসন্ন কিস্তি' : 'Upcoming' },
        ].map((btn) => (
          <button
            key={btn.id}
            type="button"
            onClick={() => setFilter(btn.id as any)}
            className={`px-3 py-1 rounded-[2px] transition cursor-pointer text-xs ${
              filter === btn.id
                ? 'bg-[#0055EA] text-white font-bold'
                : 'text-gray-800 hover:bg-white/50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Reminders List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[4px] border border-[#7F9DB9] xp-bevel-inset p-10 text-center text-gray-400 italic text-xs">
            {language === 'bn'
              ? 'আলহামদুলিল্লাহ! কোনো বকেয়া তাকিদা অপেক্ষমান নেই।'
              : 'No pending reminders in this category.'}
          </div>
        ) : (
          filteredItems.map((item) => {
            const whatsAppUrl = buildWhatsAppLink(
              item.contact,
              item.amount,
              item.dueDate,
              userProfile.businessName,
              language
            );

            const smsUrl = buildSmsLink(
              item.contact,
              item.amount,
              item.dueDate,
              userProfile.businessName,
              language
            );

            const isOverdue = item.status === 'overdue';
            const isDueToday = item.status === 'due_today';

            return (
              <div
                key={item.id}
                className={`p-3 bg-white rounded-[4px] border xp-bevel-inset flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                  isOverdue
                    ? 'border-red-300 bg-red-50/30'
                    : isDueToday
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-[#7F9DB9]'
                }`}
              >
                {/* Left: Contact & Due info */}
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 ${
                      isOverdue
                        ? 'bg-red-100 text-red-700'
                        : isDueToday
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isOverdue ? (
                      <AlertTriangle size={18} />
                    ) : isDueToday ? (
                      <Clock size={18} />
                    ) : (
                      <XPIcon name="reminders" size={18} />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {item.contact.name}
                      </span>
                      <span className="font-mono text-gray-600">({item.contact.phone})</span>
                      {item.type === 'installment' && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 text-[10px] font-semibold">
                          কিস্তি (Installment)
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-600 mt-0.5">
                      {item.category} • {language === 'bn' ? 'নির্ধারিত তারিখ:' : 'Due Date:'}{' '}
                      <strong className="font-mono">{item.dueDate}</strong>
                      {' • '}
                      <span
                        className={`font-semibold ${
                          isOverdue ? 'text-red-600' : isDueToday ? 'text-amber-700' : 'text-blue-700'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(item.daysDifference)} ${t('overdueDays')}`
                          : isDueToday
                          ? t('dueToday')
                          : `${item.daysDifference} ${t('dueInDays')}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Quick Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-gray-500 block">
                      {language === 'bn' ? 'বকেয়া পরিমাণ' : 'Due Amount'}
                    </span>
                    <span className="text-base font-bold font-mono text-[#0055EA] tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp Action */}
                    <a
                      href={whatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="xp-button px-2.5 py-1 text-xs font-semibold text-[#1B5E20] bg-green-50 hover:bg-green-100 border-green-600 flex items-center gap-1 cursor-pointer"
                      title="Open in WhatsApp"
                    >
                      <MessageSquare size={13} className="text-green-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>

                    {/* SMS Action */}
                    <a
                      href={smsUrl}
                      className="xp-button px-2.5 py-1 text-xs font-semibold text-blue-900 flex items-center gap-1 cursor-pointer"
                      title="Open Native SMS"
                    >
                      <PhoneCall size={13} className="text-blue-600" />
                      <span className="hidden sm:inline">SMS</span>
                    </a>

                    {/* Quick Mark Paid for Installment */}
                    {item.type === 'installment' && (
                      <button
                        type="button"
                        onClick={() => handleMarkInstallmentPaid(item)}
                        className="xp-button px-2 py-1 text-xs text-green-700 font-semibold flex items-center gap-1 cursor-pointer"
                        title="Mark Installment as Paid"
                      >
                        <CheckCircle2 size={13} />
                        <span>আদায়</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
