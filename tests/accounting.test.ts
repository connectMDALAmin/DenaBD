import { describe, it, expect } from 'vitest';
import {
  toMinorUnits,
  fromMinorUnits,
  calculateContactBalance,
  calculateLedgerSummary,
  formatCurrency,
} from '../src/services/accounting/calculator';
import { Contact, Transaction } from '../src/types/accounting';
import { validateAndPreviewBackup } from '../src/services/storage/backup';

describe('Accounting Engine Calculations', () => {
  it('converts monetary decimals to minor units and back without floating point inaccuracies', () => {
    expect(toMinorUnits(150.55)).toBe(15055);
    expect(toMinorUnits('250.99')).toBe(25099);
    expect(toMinorUnits('৳ 1,250.50')).toBe(125050);
    expect(fromMinorUnits(15055)).toBe(150.55);
    expect(fromMinorUnits(0)).toBe(0);
  });

  it('correctly calculates contact balances for Given, Received, Borrowed, and Repaid transactions', () => {
    const mockContact: Contact = {
      id: 'test_c1',
      userId: 'u1',
      name: 'Rahim Traders',
      phone: '+8801700000000',
      category: 'customer',
      openingBalance: 100000, // 1,000 BDT opening receivable
      publicLookupEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const mockTransactions: Transaction[] = [
      // Given 5,000 BDT -> Receivable increases
      {
        id: 'tx1',
        userId: 'u1',
        contactId: 'test_c1',
        type: 'given',
        amount: 500000,
        date: '2026-10-01',
        paymentMethod: 'cash',
        category: 'Sale',
        status: 'active',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      // Received 2,000 BDT -> Receivable decreases
      {
        id: 'tx2',
        userId: 'u1',
        contactId: 'test_c1',
        type: 'received',
        amount: 200000,
        date: '2026-10-05',
        paymentMethod: 'bkash',
        category: 'Payment',
        status: 'active',
        createdAt: '2026-10-05T00:00:00Z',
        updatedAt: '2026-10-05T00:00:00Z',
      },
    ];

    const summary = calculateContactBalance(mockContact, mockTransactions, '2026-10-15');
    // Opening 1,000 + 5,000 - 2,000 = 4,000 BDT = 400000 minor units
    expect(summary.receivable).toBe(400000);
    expect(summary.payable).toBe(0);
    expect(summary.netBalance).toBe(400000);
  });

  it('correctly calculates separate payable balances for Borrowed and Repaid', () => {
    const supplierContact: Contact = {
      id: 'test_sup1',
      userId: 'u1',
      name: 'Textile Mill',
      phone: '+8801800000000',
      category: 'supplier',
      openingBalance: -200000, // User owes 2,000 BDT
      publicLookupEnabled: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const transactions: Transaction[] = [
      // Borrowed 10,000 BDT -> Payable increases
      {
        id: 'tx3',
        userId: 'u1',
        contactId: 'test_sup1',
        type: 'borrowed',
        amount: 1000000,
        date: '2026-10-02',
        paymentMethod: 'bank_transfer',
        category: 'Raw materials',
        status: 'active',
        createdAt: '2026-10-02T00:00:00Z',
        updatedAt: '2026-10-02T00:00:00Z',
      },
      // Repaid 3,000 BDT -> Payable decreases
      {
        id: 'tx4',
        userId: 'u1',
        contactId: 'test_sup1',
        type: 'repaid',
        amount: 300000,
        date: '2026-10-08',
        paymentMethod: 'bank_transfer',
        category: 'Repayment',
        status: 'active',
        createdAt: '2026-10-08T00:00:00Z',
        updatedAt: '2026-10-08T00:00:00Z',
      },
    ];

    const summary = calculateContactBalance(supplierContact, transactions, '2026-10-15');
    // Opening payable 2,000 + 10,000 - 3,000 = 9,000 BDT = 900000 minor units
    expect(summary.payable).toBe(900000);
    expect(summary.receivable).toBe(0);
    expect(summary.netBalance).toBe(-900000); // Negative indicates payable
  });

  it('correctly tracks overdue status when dueDate is before current date', () => {
    const contact: Contact = {
      id: 'test_c2',
      userId: 'u1',
      name: 'Overdue Customer',
      phone: '+8801900000000',
      category: 'customer',
      openingBalance: 0,
      publicLookupEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const transactions: Transaction[] = [
      {
        id: 'tx5',
        userId: 'u1',
        contactId: 'test_c2',
        type: 'given',
        amount: 500000, // 5,000 BDT
        date: '2026-09-01',
        dueDate: '2026-09-20', // Past due!
        paymentMethod: 'cash',
        category: 'Goods',
        status: 'active',
        createdAt: '2026-09-01T00:00:00Z',
        updatedAt: '2026-09-01T00:00:00Z',
      },
    ];

    const summary = calculateContactBalance(contact, transactions, '2026-10-15');
    expect(summary.isOverdue).toBe(true);
    expect(summary.overdueAmount).toBe(500000);
  });
});

describe('Backup Validation & Integrity', () => {
  it('validates a well-formed JSON backup structure', () => {
    const validJson = JSON.stringify({
      version: '2.4.0',
      exportedAt: '2026-10-15T12:00:00.000Z',
      user: {
        id: 'u1',
        businessName: 'Test Business',
      },
      contacts: [
        { id: 'c1', name: 'Karim', phone: '01800000000', category: 'customer', openingBalance: 0 },
      ],
      transactions: [
        { id: 't1', contactId: 'c1', amount: 50000, type: 'given', date: '2026-10-01' },
      ],
    });

    const preview = validateAndPreviewBackup(validJson);
    expect(preview.valid).toBe(true);
    expect(preview.totalContacts).toBe(1);
    expect(preview.totalTransactions).toBe(1);
  });

  it('rejects malformed or incomplete backup files', () => {
    const invalidJson = JSON.stringify({
      foo: 'bar',
    });

    const preview = validateAndPreviewBackup(invalidJson);
    expect(preview.valid).toBe(false);
    expect(preview.error).toContain('missing contacts or transactions');
  });

  it('correctly calculates full settlement when repayments equal loan amount', () => {
    const contact: Contact = {
      id: 'test_c3',
      userId: 'u1',
      name: 'Settled Contact',
      phone: '+8801722222222',
      category: 'customer',
      openingBalance: 0,
      publicLookupEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    };

    const transactions: Transaction[] = [
      {
        id: 'tx_give',
        userId: 'u1',
        contactId: 'test_c3',
        type: 'given',
        amount: 250000, // 2,500 BDT
        date: '2026-10-01',
        paymentMethod: 'cash',
        category: 'Loan',
        status: 'active',
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      {
        id: 'tx_rec',
        userId: 'u1',
        contactId: 'test_c3',
        type: 'received',
        amount: 250000, // 2,500 BDT
        date: '2026-10-10',
        paymentMethod: 'bkash',
        category: 'Settlement',
        status: 'active',
        createdAt: '2026-10-10T00:00:00Z',
        updatedAt: '2026-10-10T00:00:00Z',
      },
    ];

    const summary = calculateContactBalance(contact, transactions, '2026-10-15');
    expect(summary.receivable).toBe(0);
    expect(summary.payable).toBe(0);
    expect(summary.netBalance).toBe(0);
    expect(summary.isOverdue).toBe(false);
  });

  it('correctly identifies and performs one-click deletion of demo data', async () => {
    const { db } = await import('../src/services/storage/db');
    // Ensure initial sample data is populated
    db.resetToSampleData();
    const initialCounts = db.getDemoDataCounts();
    expect(initialCounts.contactsCount).toBeGreaterThan(0);
    expect(initialCounts.transactionsCount).toBeGreaterThan(0);

    // Perform one-click delete
    const result = db.deleteDemoData();
    expect(result.deletedContacts).toBe(initialCounts.contactsCount);
    expect(result.deletedTransactions).toBe(initialCounts.transactionsCount);

    // After deletion, demo count must be 0
    const postCounts = db.getDemoDataCounts();
    expect(postCounts.contactsCount).toBe(0);
    expect(postCounts.transactionsCount).toBe(0);

    // Reset back for test consistency
    db.resetToSampleData();
  });
});
