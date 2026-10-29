import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Contact, Transaction, UserProfile } from '../../types/accounting';
import { calculateContactBalance, formatCurrency, fromMinorUnits, calculateLedgerSummary } from '../accounting/calculator';

export function exportContactPdfStatement(
  contact: Contact,
  transactions: Transaction[],
  userProfile: UserProfile
): void {
  const doc = new jsPDF();
  const summary = calculateContactBalance(contact, transactions);
  const nowStr = new Date().toLocaleDateString();

  // Header Banner
  doc.setFillColor(0, 85, 234); // Windows XP Luna Blue
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(userProfile.businessName || 'DenaPawna Digital Ledger', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Owner: ${userProfile.ownerName} | Phone: ${userProfile.phone || 'N/A'} | Date: ${nowStr}`,
    14,
    24
  );

  // Statement Info
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('STATEMENT OF ACCOUNT / হিসাব বিবরণী', 14, 42);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Contact: ${contact.name}`, 14, 50);
  doc.text(`Phone: ${contact.phone}`, 14, 56);
  if (contact.address) doc.text(`Address: ${contact.address}`, 14, 62);

  // Balance Card
  const net = summary.netBalance;
  const balanceLabel =
    net > 0
      ? 'TOTAL RECEIVABLE (YOU OWE THIS BUSINESS)'
      : net < 0
      ? 'TOTAL PAYABLE (BUSINESS OWES YOU)'
      : 'ACCOUNT SETTLED';

  doc.setFillColor(245, 248, 255);
  doc.setDrawColor(0, 85, 234);
  doc.roundedRect(120, 38, 76, 26, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80, 80, 80);
  doc.text(balanceLabel, 124, 46);

  doc.setFontSize(14);
  doc.setTextColor(net > 0 ? 0 : net < 0 ? 180 : 0, net > 0 ? 85 : 0, net > 0 ? 234 : 0);
  doc.text(`BDT ${fromMinorUnits(Math.abs(net)).toFixed(2)}`, 124, 58);

  // Table of Transactions
  const contactTxs = transactions
    .filter((t) => t.contactId === contact.id && t.status === 'active')
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  const tableRows = contactTxs.map((t) => [
    t.date,
    t.type.toUpperCase(),
    t.category,
    t.referenceNumber || '—',
    t.paymentMethod.toUpperCase(),
    fromMinorUnits(t.amount).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 70,
    head: [['Date', 'Type', 'Category / Note', 'Ref No.', 'Method', 'Amount (BDT)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 85, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      5: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer Signature Block
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 30 : 220;
  if (finalY < 260) {
    doc.setDrawColor(180, 180, 180);
    doc.line(14, finalY, 70, finalY);
    doc.line(140, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('Authorized Signature & Stamp', 14, finalY + 6);
    doc.text("Customer / Beneficiary Signature", 140, finalY + 6);
  }

  doc.save(`${contact.name.replace(/[^a-zA-Z0-9]/g, '_')}_Statement.pdf`);
}

export function exportLedgerPdfStatement(
  transactions: Transaction[],
  contacts: Contact[],
  userProfile: UserProfile,
  filterTitle: string = 'Complete Ledger Statement'
): void {
  const doc = new jsPDF();
  const summary = calculateLedgerSummary(contacts, transactions);
  const nowStr = new Date().toLocaleDateString();

  const contactMap = new Map<string, string>();
  contacts.forEach((c) => contactMap.set(c.id, c.name));

  // Header Banner
  doc.setFillColor(0, 85, 234); // Windows XP Luna Blue
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(userProfile.businessName || 'DenaPawna Digital Ledger', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Proprietor: ${userProfile.ownerName} | Phone: ${userProfile.phone || 'N/A'} | Generated: ${nowStr}`,
    14,
    24
  );

  // Statement Info
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${filterTitle.toUpperCase()} / খাতা বিবরণী`, 14, 42);

  // Summary Metrics Banner
  doc.setFillColor(245, 248, 255);
  doc.setDrawColor(0, 85, 234);
  doc.roundedRect(14, 48, 182, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('TOTAL RECEIVABLE (পাওনা):', 18, 55);
  doc.setTextColor(20, 120, 40);
  doc.text(`BDT ${fromMinorUnits(summary.totalReceivable).toFixed(2)}`, 18, 62);

  doc.setTextColor(60, 60, 60);
  doc.text('TOTAL PAYABLE (দেনা):', 80, 55);
  doc.setTextColor(200, 40, 40);
  doc.text(`BDT ${fromMinorUnits(summary.totalPayable).toFixed(2)}`, 80, 62);

  doc.setTextColor(60, 60, 60);
  doc.text('NET BALANCE:', 140, 55);
  doc.setTextColor(0, 85, 234);
  doc.text(`BDT ${fromMinorUnits(summary.netPosition).toFixed(2)}`, 140, 62);

  // Table of Transactions
  const activeTxs = transactions
    .filter((t) => t.status === 'active')
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  const tableRows = activeTxs.map((t) => [
    t.date,
    contactMap.get(t.contactId) || 'Unknown',
    t.type.toUpperCase(),
    t.category || '—',
    t.referenceNumber || '—',
    t.paymentMethod.toUpperCase(),
    fromMinorUnits(t.amount).toFixed(2),
  ]);

  autoTable(doc, {
    startY: 72,
    head: [['Date', 'Contact', 'Type', 'Category / Note', 'Ref No.', 'Method', 'Amount (BDT)']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 85, 234],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
    },
    columnStyles: {
      6: { halign: 'right', fontStyle: 'bold' },
    },
  });

  // Footer Signature Block
  const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 25 : 230;
  if (finalY < 265) {
    doc.setDrawColor(180, 180, 180);
    doc.line(14, finalY, 75, finalY);
    doc.line(135, finalY, 196, finalY);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Authorized Signature & Official Stamp', 14, finalY + 5);
    doc.text('Accountant / System Verification', 135, finalY + 5);
  }

  doc.save(`DenaPawna_Ledger_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
}
