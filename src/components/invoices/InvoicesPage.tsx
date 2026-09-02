import React, { useState } from 'react';
import {
  Plus,
  Search,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    customers,
    viewCustomerProfile,
    recordPayment,
    addInvoice,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create Invoice Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createCustomerId, setCreateCustomerId] = useState<string>(customers[0]?.id || '');
  const [createTotalAmount, setCreateTotalAmount] = useState<number>(500000);
  const [createPaidAmount, setCreatePaidAmount] = useState<number>(200000);
  const [createDueDate, setCreateDueDate] = useState<string>('2026-10-15');
  const [createNotes, setCreateNotes] = useState<string>('Contract batch delivery.');

  // Quick Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'NEFT/RTGS' | 'UPI' | 'Cheque' | 'Bank Transfer'>('NEFT/RTGS');
  const [paymentRef, setPaymentRef] = useState<string>('UTR-98712');

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Invoices', count: invoices.length },
    { id: 'Due', label: 'Due', count: invoices.filter(i => i.status === 'Due').length },
    { id: 'Overdue', label: 'Overdue', count: invoices.filter(i => i.status === 'Overdue').length },
    { id: 'Partial', label: 'Partial', count: invoices.filter(i => i.status === 'Partial').length },
    { id: 'Disputed', label: 'Disputed', count: invoices.filter(i => i.status === 'Disputed').length },
    { id: 'Paid', label: 'Paid', count: invoices.filter(i => i.status === 'Paid').length },
  ];

  const handleOpenPayment = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.remainingAmount);
    setPaymentRef(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    recordPayment({
      invoiceId: selectedInvoice.id,
      customerId: selectedInvoice.customerId,
      amount: paymentAmount,
      paymentType: paymentMethod,
      referenceNumber: paymentRef,
      notes: `Reconciliation for ${selectedInvoice.invoiceNumber}`,
    });

    setSelectedInvoice(null);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === createCustomerId);
    if (!cust) return;

    addInvoice({
      customerId: cust.id,
      customerName: cust.name,
      totalAmount: createTotalAmount,
      paidAmount: createPaidAmount,
      dueDate: createDueDate,
      notes: createNotes,
    });

    setShowCreateModal(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Invoices & Accounts Receivable
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track issued tax invoices, partial payments, maturity dates, and aging delinquency.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search invoice #, customer..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-mono">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 font-mono">Total Amount</th>
                <th className="py-3 px-4 font-mono">Paid Amount</th>
                <th className="py-3 px-4 font-mono">Remaining</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>

                    <td className="py-3 px-4">
                      <span
                        onClick={() => viewCustomerProfile(inv.customerId)}
                        className="font-medium text-slate-900 hover:text-slate-600 cursor-pointer"
                      >
                        {inv.customerName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono">{inv.issueDate}</td>

                    <td className="py-3 px-4 font-medium text-slate-800 font-mono">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{inv.dueDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{formatINR(inv.amount)}</td>

                    <td className="py-3 px-4 font-mono font-medium text-emerald-700">{formatINR(inv.paidAmount)}</td>

                    <td className="py-3 px-4 font-mono">
                      <span className={`font-semibold ${inv.remainingAmount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                        {formatINR(inv.remainingAmount)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'Partial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : inv.status === 'Disputed'
                            ? 'bg-slate-100 text-slate-700 border border-slate-300'
                            : 'bg-slate-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {inv.status === 'Paid' && '🟢 Paid'}
                        {inv.status === 'Partial' && '🟡 Partial'}
                        {inv.status === 'Overdue' && '🔴 Overdue'}
                        {inv.status === 'Disputed' && '⚠️ Disputed'}
                        {inv.status === 'Due' && 'Due'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {inv.remainingAmount > 0 ? (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-[11px] rounded shadow-2xs cursor-pointer"
                        >
                          Record Pay
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-[11px] font-medium flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Record Payment for {selectedInvoice.invoiceNumber}
              </h3>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-500 font-medium block">Customer</label>
                <div className="font-semibold text-slate-900 mt-0.5">{selectedInvoice.customerName}</div>
              </div>

              <div>
                <label className="text-slate-500 font-medium block">Total Outstanding</label>
                <div className="font-mono font-bold text-amber-700 mt-0.5">
                  {formatINR(selectedInvoice.remainingAmount)}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Payment Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  max={selectedInvoice.remainingAmount}
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">UTR / Ref #</label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Generate New Tax Invoice
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Select Customer</label>
                <select
                  value={createCustomerId}
                  onChange={e => setCreateCustomerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.healthStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Total Amount (₹)</label>
                  <input
                    type="number"
                    value={createTotalAmount}
                    onChange={e => setCreateTotalAmount(Number(e.target.value))}
                    step="10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Advance Paid (₹)</label>
                  <input
                    type="number"
                    value={createPaidAmount}
                    onChange={e => setCreatePaidAmount(Number(e.target.value))}
                    step="10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Payment Due Date</label>
                <input
                  type="date"
                  value={createDueDate}
                  onChange={e => setCreateDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Notes / PO Reference</label>
                <input
                  type="text"
                  value={createNotes}
                  onChange={e => setCreateNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
