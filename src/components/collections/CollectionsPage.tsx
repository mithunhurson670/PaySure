import React, { useState } from 'react';
import {
  Clock,
  Send,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Check,
  Search,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CollectionPriority } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

export const CollectionsPage: React.FC = () => {
  const {
    collectionPriorities,
    customers,
    invoices,
    disputes,
    commitments,
    viewCustomerProfile,
    showToast,
    addCommitment,
  } = useApp();

  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);

  // New commitment modal
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState(customers[0]?.id || '');
  const [promiseAmount, setPromiseAmount] = useState<number>(140000);
  const [promiseDate, setPromiseDate] = useState<string>('2026-09-10');
  const [promiseNotes, setPromiseNotes] = useState<string>('Customer promised RTGS transfer post audit clearance.');

  const totalOverdue = invoices
    .filter(i => i.status === 'Overdue' || i.status === 'Disputed')
    .reduce((acc, inv) => acc + inv.remainingAmount, 0);

  const missedCommitments = commitments.filter(c => c.status === 'Missed' || (c.status === 'Upcoming' && new Date(c.promisedDate) < new Date('2026-09-01'))).length;
  const activeDisputes = disputes.filter(d => d.status !== 'Resolved').length;

  const filteredItems = collectionPriorities.filter(item => {
    if (filterUrgency === 'High' && item.urgency !== 'High') return false;
    if (filterUrgency === 'Medium' && item.urgency !== 'Medium') return false;
    if (filterUrgency === 'Low' && item.urgency !== 'Low') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.customerName.toLowerCase().includes(q) ||
        item.primaryIssue.toLowerCase().includes(q) ||
        item.suggestedAction.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendReminder = (item: CollectionPriority) => {
    setWhatsappSent(item.id);
    showToast(`Payment statement and reminder dispatched to ${item.customerName}!`, 'success');
    setTimeout(() => {
      setWhatsappSent(null);
    }, 1500);
  };

  const handleSavePromise = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === targetCustomer);
    if (!cust) return;

    addCommitment({
      customerId: cust.id,
      customerName: cust.name,
      invoiceId: 'inv-queue',
      invoiceNumber: 'OVERDUE-SETTLEMENT',
      amount: promiseAmount,
      promisedDate: promiseDate,
      notes: promiseNotes,
    });

    setShowPromiseModal(false);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Receivables Aging & Priority Collections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ranked collection queues based on payment delinquency, broken promises, and working-capital exposure.
          </p>
        </div>

        <button
          onClick={() => setShowPromiseModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Log Payment Commitment</span>
        </button>
      </div>

      {/* 3 Overview Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Overdue & Blocked Liquidity</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {formatINR(totalOverdue)}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across {invoices.filter(i => i.status === 'Overdue').length} overdue tax invoices
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Broken / Late Commitments</span>
          <div className="text-xl font-bold text-amber-700 font-mono mt-1">
            {missedCommitments} Promises
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Requires executive follow-up
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-medium">Open Commercial Disputes</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-1">
            {activeDisputes} Active
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Quality or quantity credit note audits
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Prioritized', count: collectionPriorities.length },
            { id: 'High', label: 'High Urgency', count: collectionPriorities.filter(i => i.urgency === 'High').length },
            { id: 'Medium', label: 'Medium Urgency', count: collectionPriorities.filter(i => i.urgency === 'Medium').length },
            { id: 'Low', label: 'Low Urgency', count: collectionPriorities.filter(i => i.urgency === 'Low').length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterUrgency(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterUrgency === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterUrgency === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
            placeholder="Search priority queue..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Priority Action Queue Cards */}
      <div className="space-y-3">
        {filteredItems.map(item => {
          const isHigh = item.urgency === 'High';
          const isMedium = item.urgency === 'Medium';

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Column: Customer and Risk context */}
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded font-mono ${
                      isHigh
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : isMedium
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-50 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isHigh ? '🔴 High Urgency' : isMedium ? '🟠 Medium Urgency' : '🔵 Regular'}
                  </span>

                  <h3
                    onClick={() => viewCustomerProfile(item.customerId)}
                    className="font-semibold text-sm text-slate-900 hover:text-slate-600 cursor-pointer"
                  >
                    {item.customerName}
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1 font-sans">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Avg delay: {item.daysOverdue} days</span>
                  </span>
                  <span>•</span>
                  <span>Score: {item.customerHealthScore}/100</span>
                </div>

                <div className="text-xs text-slate-700 pt-1 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-medium text-slate-900">Issue:</strong> {item.primaryIssue}
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <strong className="text-slate-800 font-medium">Recommended Action:</strong> {item.suggestedAction}
                </div>
              </div>

              {/* Right Column: Amount and Dispatch Actions */}
              <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-500 font-medium uppercase font-sans">
                    Exposure at Risk
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {formatINR(item.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendReminder(item)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {whatsappSent === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Notice</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => viewCustomerProfile(item.customerId)}
                    className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    360° Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Log Payment Commitment Modal */}
      {showPromiseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">
                Log Customer Payment Commitment
              </h3>
              <button
                onClick={() => setShowPromiseModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePromise} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Customer</label>
                <select
                  value={targetCustomer}
                  onChange={e => setTargetCustomer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Outstanding: {formatINR(c.outstanding)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Promised Amount (₹)</label>
                  <input
                    type="number"
                    value={promiseAmount}
                    onChange={e => setPromiseAmount(Number(e.target.value))}
                    step="10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Promised Settlement Date</label>
                  <input
                    type="date"
                    value={promiseDate}
                    onChange={e => setPromiseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Commitment Context & Notes</label>
                <input
                  type="text"
                  value={promiseNotes}
                  onChange={e => setPromiseNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromiseModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
