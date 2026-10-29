import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, PaymentMethod, Installment } from '../../types/accounting';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import { toMinorUnits, fromMinorUnits, calculateContactBalance } from '../../services/accounting/calculator';
import { triggerSettlementCelebration } from '../../utils/confetti';
import { XPTitleBar } from '../../components/xp/XPTitleBar';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
  initialTransaction?: Transaction | null;
  preselectedContactId?: string | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTransaction,
  preselectedContactId,
}) => {
  const { contacts, transactions } = useApp();
  const { t, language } = useI18n();

  const [contactId, setContactId] = useState<string>('');
  const [type, setType] = useState<TransactionType>('given');
  const [amountStr, setAmountStr] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [category, setCategory] = useState<string>('পণ্য বিক্রয়');
  const [notes, setNotes] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');

  // Installments state
  const [hasInstallments, setHasInstallments] = useState<boolean>(false);
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [installments, setInstallments] = useState<Installment[]>([]);

  useEffect(() => {
    if (initialTransaction) {
      setContactId(initialTransaction.contactId);
      setType(initialTransaction.type);
      setAmountStr(String(fromMinorUnits(initialTransaction.amount)));
      setDate(initialTransaction.date);
      setDueDate(initialTransaction.dueDate || '');
      setPaymentMethod(initialTransaction.paymentMethod);
      setCategory(initialTransaction.category);
      setNotes(initialTransaction.notes || '');
      setReferenceNumber(initialTransaction.referenceNumber || '');
      if (initialTransaction.installments && initialTransaction.installments.length > 0) {
        setHasInstallments(true);
        setInstallmentCount(initialTransaction.installments.length);
        setInstallments(initialTransaction.installments);
      } else {
        setHasInstallments(false);
        setInstallments([]);
      }
    } else {
      setContactId(preselectedContactId || (contacts[0]?.id || ''));
      setType('given');
      setAmountStr('');
      setDate(new Date().toISOString().split('T')[0]);
      setDueDate('');
      setPaymentMethod('cash');
      setCategory(language === 'bn' ? 'পণ্য বাকি বিক্রয়' : 'Credit Sale');
      setNotes('');
      setReferenceNumber('');
      setHasInstallments(false);
      setInstallments([]);
    }
  }, [initialTransaction, preselectedContactId, isOpen, contacts, language]);

  // Regenerate installments if enabled or amount/count changes
  const handleGenerateInstallments = () => {
    const totalMinor = toMinorUnits(parseFloat(amountStr) || 0);
    if (totalMinor <= 0 || installmentCount <= 0) return;

    const baseAmount = Math.floor(totalMinor / installmentCount);
    const remainder = totalMinor - baseAmount * installmentCount;

    const baseDate = new Date(date || new Date().toISOString().split('T')[0]);
    const generated: Installment[] = [];

    for (let i = 0; i < installmentCount; i++) {
      const instDueDate = new Date(baseDate);
      instDueDate.setMonth(instDueDate.getMonth() + (i + 1));
      const amount = i === 0 ? baseAmount + remainder : baseAmount;

      generated.push({
        id: `inst_${Date.now()}_${i}`,
        transactionId: initialTransaction?.id || 'pending',
        dueDate: instDueDate.toISOString().split('T')[0],
        amount,
        paidAmount: 0,
        status: 'pending',
      });
    }

    setInstallments(generated);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId) {
      alert(language === 'bn' ? 'অনুগ্রহ করে কন্ট্যাক্ট নির্বাচন করুন' : 'Please select a contact');
      return;
    }

    const decVal = parseFloat(amountStr) || 0;
    if (decVal <= 0) {
      alert(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Please enter a valid amount');
      return;
    }

    const minorUnits = toMinorUnits(decVal);

    // Overpayment prevention check from Pawna
    const selectedContact = contacts.find((c) => c.id === contactId);
    if (selectedContact) {
      const summary = calculateContactBalance(selectedContact, transactions);
      if (type === 'received' && summary.receivable > 0 && minorUnits > summary.receivable) {
        const excess = fromMinorUnits(minorUnits - summary.receivable).toFixed(2);
        const confirmOverpay = confirm(
          language === 'bn'
            ? `সতর্কতা: পরিশোধের পরিমাণ বকেয়া পাওনা (৳${fromMinorUnits(summary.receivable).toFixed(2)}) অপেক্ষা ৳${excess} বেশি। আপনি কি অতিরিক্ত অর্থ অগ্রিম হিসেবে গ্রহণ করতে চান?`
            : `Warning: Received amount exceeds outstanding receivable by ৳${excess}. Do you want to record this excess amount as an advance?`
        );
        if (!confirmOverpay) return;
      } else if (type === 'repaid' && summary.payable > 0 && minorUnits > summary.payable) {
        const excess = fromMinorUnits(minorUnits - summary.payable).toFixed(2);
        const confirmOverpay = confirm(
          language === 'bn'
            ? `সতর্কতা: পরিশোধের পরিমাণ দেনা (৳${fromMinorUnits(summary.payable).toFixed(2)}) অপেক্ষা ৳${excess} বেশি। আপনি কি এই লেনদেন রেকর্ড করতে চান?`
            : `Warning: Repayment amount exceeds payable balance by ৳${excess}. Do you want to proceed?`
        );
        if (!confirmOverpay) return;
      }

      // Check if this fully settles the account
      if (
        (type === 'received' && minorUnits >= summary.receivable && summary.receivable > 0) ||
        (type === 'repaid' && minorUnits >= summary.payable && summary.payable > 0)
      ) {
        triggerSettlementCelebration();
      }
    }

    onSave({
      id: initialTransaction?.id,
      userId: initialTransaction?.userId || 'user_main_01',
      contactId,
      type,
      amount: minorUnits,
      date,
      dueDate: dueDate || undefined,
      paymentMethod,
      category,
      notes: notes.trim() || undefined,
      referenceNumber: referenceNumber.trim() || undefined,
      status: initialTransaction?.status || 'active',
      installments: hasInstallments && installments.length > 0 ? installments : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="w-full max-w-lg bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow overflow-hidden text-xs max-h-[95vh] flex flex-col">
        {/* Title Bar */}
        <XPTitleBar
          title={initialTransaction ? t('editTransaction') : t('addTransaction')}
          iconName="money"
          onClose={onClose}
        />

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
          {/* Contact Selector */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">
              {t('contactName')} *
            </label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              required
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {c.category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* 4 Transaction Type Segmented Options */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">
              হিসাবের ধরণ / Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setType('given')}
                className={`py-2 px-2 rounded-[3px] border text-left cursor-pointer transition ${
                  type === 'given'
                    ? 'bg-[#0055EA] text-white font-bold border-[#003B99] shadow-sm'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-xs font-semibold">{t('typeGiven')}</div>
                <div className="text-[10px] opacity-80">দেওয়া হলো (তারা দেনাদার)</div>
              </button>

              <button
                type="button"
                onClick={() => setType('received')}
                className={`py-2 px-2 rounded-[3px] border text-left cursor-pointer transition ${
                  type === 'received'
                    ? 'bg-[#2E7D32] text-white font-bold border-[#1B5E20] shadow-sm'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50'
                }`}
              >
                <div className="text-xs font-semibold">{t('typeReceived')}</div>
                <div className="text-[10px] opacity-80">আদায় হলো (পাওনা হ্রাস)</div>
              </button>

              <button
                type="button"
                onClick={() => setType('borrowed')}
                className={`py-2 px-2 rounded-[3px] border text-left cursor-pointer transition ${
                  type === 'borrowed'
                    ? 'bg-[#E65100] text-white font-bold border-[#BF360C] shadow-sm'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-amber-50'
                }`}
              >
                <div className="text-xs font-semibold">{t('typeBorrowed')}</div>
                <div className="text-[10px] opacity-80">ধার নেওয়া হলো (দেনা বৃদ্ধি)</div>
              </button>

              <button
                type="button"
                onClick={() => setType('repaid')}
                className={`py-2 px-2 rounded-[3px] border text-left cursor-pointer transition ${
                  type === 'repaid'
                    ? 'bg-[#6A1B9A] text-white font-bold border-[#4A148C] shadow-sm'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-purple-50'
                }`}
              >
                <div className="text-xs font-semibold">{t('typeRepaid')}</div>
                <div className="text-[10px] opacity-80">ফেরত দেওয়া হলো (দেনা হ্রাস)</div>
              </button>
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('amount')} (৳) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0.00"
                className="w-full px-2.5 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-sm font-mono font-bold tabular-nums outline-none focus:ring-1 focus:ring-[#0055EA]"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Payment Method & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('paymentMethod')}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              >
                <option value="cash">{t('methodCash')}</option>
                <option value="bkash">{t('methodBkash')}</option>
                <option value="nagad">{t('methodNagad')}</option>
                <option value="bank_transfer">{t('methodBank')}</option>
                <option value="card">{t('methodCard')}</option>
                <option value="other">{t('methodOther')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('category')}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. পণ্য বিক্রয়, চালান নং, ঋণ"
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
              />
            </div>
          </div>

          {/* Due Date & Invoice Ref */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('dueDate')} (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs font-mono outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-800 font-semibold mb-1">
                {t('referenceNumber')}
              </label>
              <input
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="INV-2026-001"
                className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs font-mono outline-none"
              />
            </div>
          </div>

          {/* Installment Planner (Optional) */}
          {type === 'given' && (
            <div className="p-3 bg-white border border-[#7F9DB9] rounded-[3px] xp-bevel-inset">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={hasInstallments}
                    onChange={(e) => setHasInstallments(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-[#0055EA]"
                  />
                  <span>{t('installments')}</span>
                </label>
                {hasInstallments && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-600">কিস্তির সংখ্যা:</span>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(parseInt(e.target.value, 10) || 2)}
                      className="w-12 px-1 py-0.5 border border-gray-300 text-center font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateInstallments}
                      className="px-2 py-0.5 bg-[#ECE9D8] border border-gray-400 rounded text-[10px] cursor-pointer hover:bg-gray-200"
                    >
                      হিসাব করুন
                    </button>
                  </div>
                )}
              </div>

              {hasInstallments && installments.length > 0 && (
                <div className="mt-2 space-y-1.5 pt-2 border-t border-gray-100">
                  {installments.map((inst, idx) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between bg-blue-50/60 p-1.5 rounded text-[11px]"
                    >
                      <span className="font-semibold text-gray-700">কিস্তি #{idx + 1}</span>
                      <span className="font-mono">{inst.dueDate}</span>
                      <span className="font-mono font-bold text-[#0055EA]">
                        ৳{fromMinorUnits(inst.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-gray-800 font-semibold mb-1">
              {t('notes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. ৫০ বস্তা চাল সরবরাহ"
              className="w-full px-2 py-1.5 bg-white border border-[#7F9DB9] xp-bevel-inset text-xs outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0CCB8]">
            <button
              type="button"
              onClick={onClose}
              className="xp-button px-4 py-1.5 text-xs text-gray-800 cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="xp-button-primary px-5 py-1.5 text-xs cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
