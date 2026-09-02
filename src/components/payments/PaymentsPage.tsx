import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

export const PaymentsPage: React.FC = () => {
  const { payments, invoices, viewCustomerProfile, recordPayment } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Form states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(200000);
  const [method, setMethod] = useState<'NEFT/RTGS' | 'UPI' | 'Cheque' | 'Bank Transfer'>('NEFT/RTGS');
  const [refNum, setRefNum] = useState<string>('UTR-');
  const [notes, setNotes] = useState<string>('Standard clearance');

  const filteredPayments = payments.filter(pay => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pay.invoiceNumber.toLowerCase().includes(q) ||
        pay.customerName.toLowerCase().includes(q) ||
        pay.referenceNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i.id === selectedInvoiceId);
    if (!inv) return;

    recordPayment({
      invoiceId: inv.id,
      customerId: inv.customerId,
      amount,
      paymentType: method,
      referenceNumber: refNum,
      notes,
    });

    setShowAddPaymentModal(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Payments Received & Reconciliation Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit bank deposits, RTGS transfers, UPI credits, and cleared receivables.
          </p>
        </div>

        <button
          onClick={() => {
            setRefNum(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
            setShowAddPaymentModal(true);
          }}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Total Collections Reconciled</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {formatINR(totalCollected)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
            <Calendar className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Reconciled Transactions</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {payments.length} Settlements
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg">
            <CreditCard className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Primary Settlement Route</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              NEFT / RTGS (88%)
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer, invoice #, or UTR reference..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredPayments.length} of {payments.length}
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 font-mono">Invoice #</th>
                <th className="py-3 px-4 font-mono">Amount Paid</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 font-mono">Reference / UTR</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">{pay.date}</td>

                    <td className="py-3 px-4 font-medium text-slate-900">
                      <span
                        onClick={() => viewCustomerProfile(pay.customerId)}
                        className="hover:text-slate-600 cursor-pointer"
                      >
                        {pay.customerName}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{pay.invoiceNumber}</td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {formatINR(pay.amount)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {pay.paymentType}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{pay.referenceNumber}</td>

                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{pay.notes}</td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Reconciled</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Record Inward Payment
              </h3>
              <button
                onClick={() => setShowAddPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Link to Invoice</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => setSelectedInvoiceId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {invoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.customerName} (Due: {formatINR(inv.remainingAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Amount Received (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  step="10000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Channel</label>
                  <select
                    value={method}
                    onChange={e => setMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">UTR / Transaction #</label>
                  <input
                    type="text"
                    value={refNum}
                    onChange={e => setRefNum(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Reconciliation Remarks</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
