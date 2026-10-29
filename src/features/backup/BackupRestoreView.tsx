import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n/I18nContext';
import {
  downloadBackupFile,
  validateAndPreviewBackup,
  executeRestore,
  ImportPreview,
} from '../../services/storage/backup';
import { exportTransactionsToCsv, exportContactsToCsv } from '../../services/export/csvExport';
import { exportFullExcelReport } from '../../services/export/excelExport';
import {
  Download,
  Upload,
  FileSpreadsheet,
  Printer,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  FileText,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { XPIcon } from '../../components/xp/XPIcon';

export const BackupRestoreView: React.FC = () => {
  const {
    contacts,
    transactions,
    userProfile,
    openResetModal,
    openPrintModal,
    deleteDemoData,
    getDemoDataCounts,
    resetToSampleData,
  } = useApp();
  const { t, language } = useI18n();

  const [importText, setImportText] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const [deleteDemoMessage, setDeleteDemoMessage] = useState<{
    type: 'success' | 'info';
    text: string;
  } | null>(null);

  const demoCounts = getDemoDataCounts();

  const handleOneClickDeleteDemo = () => {
    const res = deleteDemoData();
    if (res.deletedContacts > 0 || res.deletedTransactions > 0) {
      setDeleteDemoMessage({
        type: 'success',
        text:
          language === 'bn'
            ? `সফলভাবে ${res.deletedContacts}টি ডেমো কন্ট্যাক্ট এবং ${res.deletedTransactions}টি ডেমো লেনদেন মুছে ফেলা হয়েছে!`
            : `Successfully deleted ${res.deletedContacts} demo contacts and ${res.deletedTransactions} demo transactions in 1 click!`,
      });
    } else {
      setDeleteDemoMessage({
        type: 'info',
        text:
          language === 'bn'
            ? 'খাতায় কোনো ডেমো ডাটা অবশিষ্ট নেই — আপনার খাতা ইতিমধ্যে পরিষ্কার।'
            : 'No demo data found — your ledger is already clean.',
      });
    }
    setTimeout(() => {
      setDeleteDemoMessage(null);
    }, 5000);
  };

  const handleReloadDemo = () => {
    resetToSampleData();
    setDeleteDemoMessage({
      type: 'info',
      text:
        language === 'bn'
          ? 'পরীক্ষামূলক নমুনা তথ্য পুনরায় লোড করা হয়েছে।'
          : 'Sample demo data has been reloaded.',
    });
    setTimeout(() => {
      setDeleteDemoMessage(null);
    }, 4000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
      const res = validateAndPreviewBackup(text);
      setPreview(res);
      setRestoreSuccess(false);
    };
    reader.readAsText(file);
  };

  const handleApplyRestore = (mode: 'merge' | 'replace') => {
    if (!preview || !preview.parsedData) return;

    if (mode === 'replace' && !confirmReplace) {
      alert(
        language === 'bn'
          ? 'সম্পূর্ণ প্রতিস্থাপনের জন্য নিশ্চিতকরণ বক্সে টিক দিন!'
          : 'Please check the confirmation box before full replacement!'
      );
      return;
    }

    executeRestore(preview.parsedData, mode);
    setRestoreSuccess(true);
    setPreview(null);
    setImportText('');
    setConfirmReplace(false);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[3px] bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <XPIcon name="backup" size={24} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">{t('backupTitle')}</h2>
            <p className="text-xs text-gray-500">
              {contacts.length} Contacts • {transactions.length} Ledger Transactions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => downloadBackupFile('json')}
            className="xp-button-primary px-3 py-1.5 flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
          >
            <Download size={14} />
            <span>{t('exportJSON')}</span>
          </button>
          <button
            type="button"
            onClick={() => downloadBackupFile('pawna')}
            className="xp-button px-3 py-1.5 flex items-center gap-1.5 text-xs text-purple-900 font-semibold cursor-pointer shadow-xs"
            title="Download encrypted .pawna database backup"
          >
            <FileText size={14} className="text-purple-700" />
            <span>.PAWNA Backup</span>
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Full Excel Workbook */}
        <div className="bg-white p-3.5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet size={18} className="text-green-700" />
              <h3 className="font-bold text-xs text-gray-800">Excel Workbook (.xlsx)</h3>
            </div>
            <p className="text-[11px] text-gray-600 mb-3">
              Full 4-sheet financial audit book (Summary, People & Balances, Ledger, Repayments).
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportFullExcelReport(contacts, transactions, userProfile)}
            className="xp-button-primary w-full py-1.5 text-xs font-semibold cursor-pointer"
          >
            Download .XLSX Book
          </button>
        </div>

        {/* CSV Contacts & Ledger */}
        <div className="bg-white p-3.5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileSpreadsheet size={18} className="text-blue-700" />
              <h3 className="font-bold text-xs text-gray-800">CSV Ledger Export</h3>
            </div>
            <p className="text-[11px] text-gray-600 mb-3">
              Export transactions with UTF-8 BOM encoding for Excel/Sheets.
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportTransactionsToCsv(transactions, contacts)}
            className="xp-button w-full py-1.5 text-xs text-blue-900 font-semibold cursor-pointer"
          >
            Download CSV
          </button>
        </div>

        {/* Print Statement */}
        <div className="bg-white p-3.5 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Printer size={18} className="text-gray-700" />
              <h3 className="font-bold text-xs text-gray-800">Printable Statement</h3>
            </div>
            <p className="text-[11px] text-gray-600 mb-3">
              Print official statement format with business header & signature stamp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openPrintModal()}
            className="xp-button w-full py-1.5 text-xs text-gray-800 font-semibold cursor-pointer"
          >
            Print Statement
          </button>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3">
        <div className="flex items-center gap-2">
          <Upload size={18} className="text-[#0055EA]" />
          <h3 className="font-bold text-xs text-gray-900">{t('importJSON')}</h3>
        </div>

        <p className="text-xs text-gray-600">{t('backupWarning')}</p>

        {/* File Picker */}
        <div className="p-4 border-2 border-dashed border-[#7F9DB9] rounded-[4px] bg-blue-50/40 text-center space-y-2">
          <input
            type="file"
            accept=".json,.pawna"
            id="backupFileInput"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="backupFileInput"
            className="xp-button inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-gray-800 cursor-pointer"
          >
            <Upload size={14} />
            <span>Select .JSON or .PAWNA Backup File</span>
          </label>
          <span className="text-[11px] text-gray-500 block">or choose a previous exported JSON file</span>
        </div>

        {/* Restore Success Banner */}
        {restoreSuccess && (
          <div className="p-3 bg-green-50 border border-green-300 rounded text-xs text-green-800 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-600 shrink-0" />
            <span>
              {language === 'bn'
                ? 'আলহামদুলিল্লাহ! সফলভাবে ব্যাকআপ রিস্টোর সম্পন্ন হয়েছে।'
                : 'Backup data successfully restored!'}
            </span>
          </div>
        )}

        {/* Validation & Conflict Preview Card */}
        {preview && (
          <div className="p-4 bg-gray-50 border border-gray-300 rounded text-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-gray-200">
              <span className="font-bold text-gray-900">
                Backup File Analysis (Version {preview.version})
              </span>
              <span className="text-[11px] text-gray-500 font-mono">
                {preview.exportedAt ? new Date(preview.exportedAt).toLocaleString() : ''}
              </span>
            </div>

            {preview.valid ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Total Contacts</span>
                    <span className="text-sm font-bold font-mono text-[#0055EA]">
                      {preview.totalContacts}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">Total Transactions</span>
                    <span className="text-sm font-bold font-mono text-purple-700">
                      {preview.totalTransactions}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">New Contacts</span>
                    <span className="text-sm font-bold font-mono text-green-700">
                      +{preview.contactsToMerge}
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded border border-gray-200">
                    <span className="text-[10px] text-gray-500 block">New Transactions</span>
                    <span className="text-sm font-bold font-mono text-green-700">
                      +{preview.transactionsToMerge}
                    </span>
                  </div>
                </div>

                {/* Restore Mode Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleApplyRestore('merge')}
                    className="w-full sm:w-auto xp-button-primary px-4 py-2 text-xs cursor-pointer"
                  >
                    Merge with Existing Data (নিরাপদ মার্জ)
                  </button>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="confirmReplace"
                      checked={confirmReplace}
                      onChange={(e) => setConfirmReplace(e.target.checked)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                    <label htmlFor="confirmReplace" className="text-xs text-red-700 font-medium cursor-pointer">
                      I understand replace erases existing local data
                    </label>
                  </div>

                  <button
                    type="button"
                    disabled={!confirmReplace}
                    onClick={() => handleApplyRestore('replace')}
                    className="w-full sm:w-auto xp-button px-4 py-2 text-xs text-red-700 border-red-400 font-bold disabled:opacity-40 cursor-pointer hover:bg-red-50"
                  >
                    Full Replace (সম্পূর্ণ প্রতিস্থাপন)
                  </button>
                </div>
              </>
            ) : (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{preview.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* One-Click Delete Demo Data Card */}
      <div className="bg-white p-4 rounded-[4px] border border-[#7F9DB9] xp-bevel-inset space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[3px] bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">
                {language === 'bn'
                  ? 'এক ক্লিকে ডেমো ডাটা মুছুন (One-Click Delete Demo Data)'
                  : 'One-Click Delete Demo Data'}
              </h3>
              <p className="text-[11px] text-gray-500">
                {language === 'bn'
                  ? 'আসল হিসাব শুরু করার জন্য সব পরীক্ষামূলক ডেমো কন্ট্যাক্ট ও লেনদেন ১-ক্লিকে পরিষ্কার করুন'
                  : 'Clean out sample demo contacts & transactions in 1 click to start real bookkeeping'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                demoCounts.contactsCount > 0 || demoCounts.transactionsCount > 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
            >
              {demoCounts.contactsCount > 0 || demoCounts.transactionsCount > 0
                ? language === 'bn'
                  ? `ডেমো ডাটা: ${demoCounts.contactsCount} কন্ট্যাক্ট, ${demoCounts.transactionsCount} লেনদেন`
                  : `Demo: ${demoCounts.contactsCount} contacts, ${demoCounts.transactionsCount} txs`
                : language === 'bn'
                ? 'খাতা পরিষ্কার (Clean)'
                : 'Ledger Clean'}
            </span>
          </div>
        </div>

        {deleteDemoMessage && (
          <div
            className={`p-2.5 rounded text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
              deleteDemoMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-semibold">{deleteDemoMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-gray-600">
            {demoCounts.contactsCount > 0 || demoCounts.transactionsCount > 0 ? (
              <span className="text-amber-800 font-medium">
                {language === 'bn'
                  ? 'নিচের বাটনে ১-ক্লিক করলেই সকল ডেমো তথ্য স্বয়ংক্রিয়ভাবে মুছে যাবে। আপনার তৈরি করা নিজস্ব তথ্য নিরাপদ থাকবে।'
                  : 'Click the button below to instantly remove all demo records in 1 click. Your custom records will remain safe.'}
              </span>
            ) : (
              <span className="text-gray-500">
                {language === 'bn'
                  ? 'বর্তমানে কোনো ডেমো তথ্য নেই — আপনার খাতা বাস্তব ব্যবসার জন্য প্রস্তুত।'
                  : 'No demo records currently exist — your ledger is ready for real business.'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Primary One-Click Delete Demo Button */}
            <button
              type="button"
              onClick={handleOneClickDeleteDemo}
              disabled={demoCounts.contactsCount === 0 && demoCounts.transactionsCount === 0}
              className="xp-button px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-xs transition"
              title="Delete all demo data in one click"
            >
              <Trash2 size={14} className="text-red-600" />
              <span>
                {language === 'bn'
                  ? 'ডেমো ডাটা মুছুন (১-ক্লিক)'
                  : 'Delete Demo Data (1-Click)'}
              </span>
            </button>

            {/* Secondary reload option if ever needed */}
            <button
              type="button"
              onClick={handleReloadDemo}
              className="xp-button px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
              title="Reload sample demo data"
            >
              <RotateCcw size={13} />
              <span>{language === 'bn' ? 'নমুনা তথ্য লোড' : 'Reload Demo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
