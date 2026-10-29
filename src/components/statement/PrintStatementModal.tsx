import React, { useState } from 'react';
import { XPTitleBar } from '../xp/XPTitleBar';
import { useI18n } from '../../i18n/I18nContext';
import { useApp } from '../../context/AppContext';
import { Printer, Download, Filter, User, Calendar, X } from 'lucide-react';
import { PrintableStatementDocument } from './PrintableStatementDocument';
import { exportContactPdfStatement, exportLedgerPdfStatement } from '../../services/export/pdfExport';

interface PrintStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContactId?: string | null;
}

export const PrintStatementModal: React.FC<PrintStatementModalProps> = ({
  isOpen,
  onClose,
  initialContactId = null,
}) => {
  const { language } = useI18n();
  const { userProfile, contacts, transactions } = useApp();

  const [selectedContactId, setSelectedContactId] = useState<string | null>(initialContactId);
  const [datePreset, setDatePreset] = useState<'all' | 'this_month' | 'last_30_days'>('all');

  if (!isOpen) return null;

  // Compute date range based on preset
  let startDate: string | undefined = undefined;
  let endDate: string | undefined = undefined;

  const now = new Date();
  if (datePreset === 'this_month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  } else if (datePreset === 'last_30_days') {
    const past = new Date();
    past.setDate(past.getDate() - 30);
    startDate = past.toISOString().split('T')[0];
    endDate = now.toISOString().split('T')[0];
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (selectedContactId) {
      const contact = contacts.find((c) => c.id === selectedContactId);
      if (contact) {
        exportContactPdfStatement(contact, transactions, userProfile);
        return;
      }
    }
    exportLedgerPdfStatement(transactions, contacts, userProfile, 'Official Ledger Statement');
  };

  return (
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs select-none animate-in fade-in duration-150 no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-[#ECE9D8] border-[3px] border-[#0055EA] rounded-[7px] xp-window-shadow flex flex-col overflow-hidden text-xs"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="print-dialog-title"
      >
        {/* Title Bar */}
        <XPTitleBar
          title={
            language === 'bn'
              ? 'প্রিন্ট বিবরণী প্রিভিউ (Print Statement Preview)'
              : 'Print Statement Preview — DenaPawna Khata Pro'
          }
          iconName="print"
          onClose={onClose}
        />

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#F0EDE0] border-b border-[#D0CCB8] xp-bevel-outset">
          <div className="flex flex-wrap items-center gap-2">
            {/* Contact Selector */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-[#7F9DB9]">
              <User size={13} className="text-[#0055EA]" />
              <select
                value={selectedContactId || ''}
                onChange={(e) => setSelectedContactId(e.target.value || null)}
                className="text-xs bg-transparent border-none outline-none font-medium text-gray-800 cursor-pointer pr-1"
              >
                <option value="">
                  {language === 'bn' ? '📋 সার্বগ্রাহী সকল লেজার বিবরণী' : '📋 Full Ledger (All Contacts)'}
                </option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    👤 {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Preset */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-[#7F9DB9]">
              <Calendar size={13} className="text-[#0055EA]" />
              <select
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value as any)}
                className="text-xs bg-transparent border-none outline-none font-medium text-gray-800 cursor-pointer pr-1"
              >
                <option value="all">
                  {language === 'bn' ? 'সব সময়ের রেকর্ড (All Time)' : 'All Records'}
                </option>
                <option value="this_month">
                  {language === 'bn' ? 'চলতি মাস (This Month)' : 'This Month'}
                </option>
                <option value="last_30_days">
                  {language === 'bn' ? 'বিগত ৩০ দিন (Last 30 Days)' : 'Last 30 Days'}
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="xp-button-primary px-3 py-1 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Open System Print Dialog"
            >
              <Printer size={14} />
              <span>{language === 'bn' ? 'প্রিন্ট করুন (Print)' : 'Print Now'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="xp-button px-3 py-1 flex items-center gap-1.5 text-xs font-semibold text-blue-900 cursor-pointer"
              title="Download PDF File"
            >
              <Download size={14} className="text-blue-600" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="xp-button px-2.5 py-1 text-xs text-gray-700 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Statement Scrollable Paper Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#5A6378]/25 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-xl rounded-[2px] border border-gray-400 overflow-hidden">
            <PrintableStatementDocument
              userProfile={userProfile}
              contacts={contacts}
              transactions={transactions}
              targetContactId={selectedContactId}
              dateRange={{ startDate, endDate }}
            />
          </div>
        </div>

        {/* Bottom Statusbar */}
        <div className="px-3 py-1 bg-[#ECE9D8] border-t border-[#D0CCB8] flex items-center justify-between text-[11px] text-gray-600">
          <span>
            {language === 'bn'
              ? 'টিপস: ব্রাউজার থেকে সরাসরি পেজ সাইজ A4 সিলেক্ট করে প্রিন্ট দিন।'
              : 'Tip: Select Paper Size A4 in print dialog for optimal layout.'}
          </span>
          <span className="font-mono text-[10px] text-gray-500">
            Powered by DenaPawna Print Engine
          </span>
        </div>
      </div>
    </div>
  );
};
