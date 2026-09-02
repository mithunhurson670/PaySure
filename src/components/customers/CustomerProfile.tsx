import React, { useState } from 'react';
import {
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CreditCard,
  Plus,
  Sliders,
  Calendar,
  MessageSquare,
  HelpCircle,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp, CustomerSubTab } from '../../context/AppContext';
import { Deal } from '../../types';
import { WhatIfSimulator } from '../deals/WhatIfSimulator';
import { formatINR } from '../../utils/financialCalculations';

export const CustomerProfile: React.FC = () => {
  const {
    selectedCustomerId,
    selectedCustomerTab,
    setSelectedCustomerTab,
    customers,
    deals,
    invoices,
    payments,
    disputes,
    commitments,
    openAnalyzeDeal,
    resolveDispute,
    addCommitment,
    recordPayment,
    showToast,
    viewDealDetails,
    setActiveView,
  } = useApp();

  const customer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Inline What-If Simulator state for an order
  const [simulatingDeal, setSimulatingDeal] = useState<Deal | null>(null);

  // Issues / Commitment form states
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [commitAmount, setCommitAmount] = useState<number>(140000);
  const [commitDate, setCommitDate] = useState<string>('2026-09-15');
  const [commitInvoiceId, setCommitInvoiceId] = useState<string>('');
  const [commitNotes, setCommitNotes] = useState<string>('Committed over telephonic finance review.');

  // Dispute resolution modal state
  const [resolvingDisputeId, setResolvingDisputeId] = useState<string | null>(null);
  const [disputeNotes, setDisputeNotes] = useState<string>('Agreed on revised quality credit note.');

  // Quick Record Payment state inside Payments tab
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payInvoiceId, setPayInvoiceId] = useState<string>('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payRef, setPayRef] = useState<string>('UTR-');
  const [payMethod, setPayMethod] = useState<'NEFT/RTGS' | 'UPI' | 'Cheque' | 'Bank Transfer'>('NEFT/RTGS');

  if (!customer) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
        <p className="text-slate-500 text-xs">No customer selected.</p>
        <button
          onClick={() => setActiveView('customers')}
          className="mt-3 px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium cursor-pointer"
        >
          View All Customers
        </button>
      </div>
    );
  }

  const customerDeals = deals.filter(d => d.customerId === customer.id);
  const customerInvoices = invoices.filter(i => i.customerId === customer.id);
  const customerPayments = payments.filter(p => p.customerId === customer.id);
  const customerDisputes = disputes.filter(d => d.customerId === customer.id);
  const customerCommitments = commitments.filter(c => c.customerId === customer.id);

  // Unresolved issues count
  const openDisputes = customerDisputes.filter(d => d.status !== 'Resolved');
  const missedOrUpcomingCommitments = customerCommitments.filter(c => c.status !== 'Honoured');
  const totalOpenIssues = openDisputes.length + (customer.overdueAmount > 0 ? 1 : 0) + missedOrUpcomingCommitments.length;

  // 5 STRICT TABS
  const tabs: Array<{ id: CustomerSubTab; label: string; count?: number }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders', count: customerDeals.length },
    { id: 'payments', label: 'Payments', count: customerInvoices.length },
    { id: 'issues', label: 'Issues', count: totalOpenIssues > 0 ? totalOpenIssues : undefined },
    { id: 'activity', label: 'Activity' },
  ];

  // Payment Behaviour Analytical Data
  const paymentBehaviourChartData = [
    { order: 'May', expectedDays: 30, actualDays: 32 },
    { order: 'Jun', expectedDays: 45, actualDays: 48 },
    { order: 'Jul', expectedDays: 30, actualDays: 42 },
    { order: 'Aug (Latest)', expectedDays: 45, actualDays: customer.averagePaymentDays || 58 },
  ];

  // Activity Timeline Items
  const timelineEvents = [
    {
      id: 'act-1',
      date: 'Aug 28, 2026',
      title: 'Payment Received',
      description: `₹1,00,000 NEFT received against Invoice ${customerInvoices[0]?.invoiceNumber || 'INV-2026-042'}.`,
      icon: CheckCircle2,
    },
    {
      id: 'act-2',
      date: 'Aug 25, 2026',
      title: 'New Deal Order Created',
      description: `Order #${customerDeals[0]?.dealNumber || 'DEAL-2026-108'} entered for ${formatINR(customerDeals[0]?.orderValue || 500000)}.`,
      icon: FileText,
    },
    {
      id: 'act-3',
      date: 'Aug 22, 2026',
      title: 'Payment Commitment Logged',
      description: `Customer committed to settle ₹1,40,000 on Aug 28.`,
      icon: Calendar,
    },
    {
      id: 'act-4',
      date: 'Aug 20, 2026',
      title: 'Partial Payment Reconciled',
      description: `₹50,000 received via RTGS clearance.`,
      icon: CreditCard,
    },
    {
      id: 'act-5',
      date: 'Aug 18, 2026',
      title: 'Invoice Generated',
      description: `Tax Invoice generated for ${formatINR(customer.totalBusiness * 0.3 || 400000)} with 45-day credit terms.`,
      icon: FileText,
    },
  ];

  const handleCreateCommitment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = customerInvoices.find(i => i.id === commitInvoiceId) || customerInvoices[0];

    addCommitment({
      customerId: customer.id,
      customerName: customer.name,
      invoiceId: inv ? inv.id : 'inv-general',
      invoiceNumber: inv ? inv.invoiceNumber : 'GENERAL',
      amount: commitAmount,
      promisedDate: commitDate,
      notes: commitNotes,
    });

    setShowCommitmentModal(false);
  };

  const handleQuickPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = customerInvoices.find(i => i.id === payInvoiceId) || customerInvoices[0];
    if (!inv || payAmount <= 0) return;

    recordPayment({
      invoiceId: inv.id,
      customerId: customer.id,
      amount: payAmount,
      paymentType: payMethod,
      referenceNumber: payRef,
      notes: `Direct customer profile reconciliation for ${inv.invoiceNumber}`,
    });

    setShowPaymentModal(false);
  };

  const handleResolveDisputeAction = (disputeId: string) => {
    resolveDispute(disputeId, disputeNotes);
    setResolvingDisputeId(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Customer 360° Header Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-slate-900 text-white font-bold text-lg flex items-center justify-center shrink-0">
              {customer.name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {customer.name}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {customer.category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                    customer.healthStatus === 'Healthy'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : customer.healthStatus === 'Watch'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {customer.healthStatus === 'Healthy' && '🟢 Safe (Score 80+)'}
                  {customer.healthStatus === 'Watch' && '🟠 Watch (Score 60-79)'}
                  {customer.healthStatus === 'Attention' && '🔴 High Risk'}
                  {customer.healthStatus === 'Dispute' && '⚠️ Dispute Active'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>Contact: <strong className="text-slate-700 font-medium">{customer.contactPerson}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {customer.phone}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {customer.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 self-start lg:self-center">
            <button
              onClick={() =>
                openAnalyzeDeal({
                  customerId: customer.id,
                  orderValue: 800000,
                  advancePercent: 40,
                  paymentPeriodDays: 60,
                  fulfillmentCost: 560000,
                })
              }
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Analyze Deal for {customer.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* 6 Key Financial Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 text-xs font-mono">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Total Business</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatINR(customer.totalBusiness)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Total Paid</span>
            <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
              {formatINR(customer.totalPaid)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Outstanding</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatINR(customer.outstanding)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Current Exposure</span>
            <span className="text-sm font-bold text-slate-900 mt-0.5 block">
              {formatINR(customer.currentExposure || customer.outstanding)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Overdue</span>
            <span className={`text-sm font-bold mt-0.5 block ${customer.overdueAmount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {formatINR(customer.overdueAmount)}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-sans text-[10px] uppercase font-medium block">Open Issues</span>
            <span className={`text-sm font-bold mt-0.5 block ${totalOpenIssues > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {totalOpenIssues > 0 ? `${totalOpenIssues} Action Item${totalOpenIssues > 1 ? 's' : ''}` : 'None (Healthy)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. STRICT 5-TAB NAVIGATION (Overview | Orders | Payments | Issues | Activity) */}
      <div className="border-b border-slate-200 bg-white rounded-xl px-3 pt-1 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const isActive = selectedCustomerTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-customer-${tab.id}`}
                onClick={() => setSelectedCustomerTab(tab.id)}
                className={`pb-2.5 pt-2 px-3.5 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW                                                           */}
      {/* ========================================================================= */}
      {selectedCustomerTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Health Score & Behaviour Breakdown (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <h3 className="font-semibold text-sm text-slate-900">
                    Payment Health & Risk Score
                  </h3>
                </div>
                <span className="text-xl font-bold text-slate-900 font-mono">
                  {customer.healthScore}
                  <span className="text-xs font-normal text-slate-400">/100</span>
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Payment Behaviour:</span>
                    <span className="font-semibold text-slate-900 flex items-center gap-1">
                      {customer.paymentBehaviourStatus === 'Improving' && <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />}
                      {customer.paymentBehaviourStatus === 'Slowing' && <TrendingDown className="w-3.5 h-3.5 text-rose-700" />}
                      {customer.paymentBehaviourStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Average Clearance:</span>
                    <span className="font-semibold text-slate-900 font-mono">
                      {customer.averagePaymentDays}d (Agreed: 45d)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">On-Time Rate:</span>
                    <span className="font-semibold text-emerald-700 font-mono">
                      {customer.onTimePaymentRate}%
                    </span>
                  </div>
                </div>

                {/* Plain-English Why Explanation */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Health Assessment Note:</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {customer.whyScoreReasons && customer.whyScoreReasons.length > 0
                      ? customer.whyScoreReasons[0].text
                      : `${customer.name} maintains a ${customer.healthScore}/100 rating with an average ${customer.averagePaymentDays}-day settlement history.`}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Payment-Behaviour Trend Graph (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900">
                    Payment Behaviour (Agreed vs Actual Days)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Settlement turnaround trends over consecutive invoice cycles.
                  </p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  customer.paymentBehaviourStatus === 'Improving'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : customer.paymentBehaviourStatus === 'Slowing'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {customer.paymentBehaviourStatus}
                </span>
              </div>

              {/* Chart */}
              <div className="h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentBehaviourChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="order" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value: any) => [`${value} Days`, '']}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                    />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 11, paddingBottom: 6 }} />
                    <Bar dataKey="expectedDays" name="Agreed Credit Term (Days)" fill="#94a3b8" radius={[3, 3, 0, 0]} barSize={16} />
                    <Bar dataKey="actualDays" name="Actual Settlement (Days)" fill="#0f172a" radius={[3, 3, 0, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Current Financial Breakdown Row */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-semibold text-sm text-slate-900">
              Current Financial Position
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-slate-500 font-sans text-[11px] font-medium">Total Outstanding</span>
                <div className="text-base font-bold text-slate-900">{formatINR(customer.outstanding)}</div>
                <p className="text-[10px] text-slate-500 font-sans">Unpaid ledger balance</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-slate-500 font-sans text-[11px] font-medium">Due Soon (Next 15d)</span>
                <div className="text-base font-bold text-slate-900">{formatINR(customer.dueThisWeek || 100000)}</div>
                <p className="text-[10px] text-slate-500 font-sans">Within standard grace period</p>
              </div>

              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/30 space-y-1">
                <span className="text-slate-500 font-sans text-[11px] font-medium">Overdue Balance</span>
                <div className="text-base font-bold text-rose-700">{formatINR(customer.overdueAmount)}</div>
                <p className="text-[10px] text-slate-500 font-sans">Exceeded 45-day statutory limit</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <span className="text-slate-500 font-sans text-[11px] font-medium">Held in Dispute</span>
                <div className="text-base font-bold text-slate-900">{formatINR(customer.underDisputeAmount)}</div>
                <p className="text-[10px] text-slate-500 font-sans">Subject to credit note verification</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDERS                                                             */}
      {/* ========================================================================= */}
      {selectedCustomerTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Customer Order History & Deals Register
              </h3>
              <p className="text-xs text-slate-500">
                Past and active orders, advances, fulfillment expenses, and cash flow simulations.
              </p>
            </div>

            <button
              onClick={() =>
                openAnalyzeDeal({
                  customerId: customer.id,
                  orderValue: 800000,
                  advancePercent: 40,
                  paymentPeriodDays: 60,
                  fulfillmentCost: 560000,
                })
              }
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Order Proposal</span>
            </button>
          </div>

          {/* Orders List */}
          <div className="space-y-3">
            {customerDeals.map(deal => (
              <div
                key={deal.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {deal.dealNumber}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                          deal.riskStatus === 'Safe'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : deal.riskStatus === 'Conditional'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {deal.riskStatus === 'Safe' && '🟢 Safe'}
                        {deal.riskStatus === 'Conditional' && '🟠 Caution'}
                        {deal.riskStatus === 'High Risk' && '🔴 High Risk'}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200 font-mono">
                        {deal.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{deal.notes}</p>
                  </div>

                  {/* Actions for this order */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimulatingDeal(deal)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                      title="Open interactive What-If Simulator preloaded with this order's financial values"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>What-If / Simulate</span>
                    </button>

                    <button
                      onClick={() => viewDealDetails(deal.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 flex items-center gap-1 cursor-pointer shadow-2xs transition-colors"
                    >
                      <span>Full Analysis</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Financial Details Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-sans text-[10px] font-medium block">Order Value</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{formatINR(deal.orderValue)}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-sans text-[10px] font-medium block">Advance</span>
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                      {formatINR(deal.advanceAmount)} ({deal.advancePercent}%)
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-sans text-[10px] font-medium block">Fulfillment Cost</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{formatINR(deal.estimatedFulfillmentCost)}</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-sans text-[10px] font-medium block">Capital Gap</span>
                    <span className={`text-xs font-bold mt-0.5 block ${deal.workingCapitalGap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {deal.workingCapitalGap > 0 ? formatINR(deal.workingCapitalGap) : '₹0 (Funded)'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-sans text-[10px] font-medium block">Credit Terms</span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">{deal.paymentPeriodDays}d Term</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PAYMENTS                                                           */}
      {/* ========================================================================= */}
      {selectedCustomerTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Invoicing, Payments & Settlement Progress
              </h3>
              <p className="text-xs text-slate-500">
                Invoices raised, payments collected, and partial balances.
              </p>
            </div>

            <button
              onClick={() => {
                setPayInvoiceId(customerInvoices[0]?.id || '');
                setPayAmount(customerInvoices[0]?.remainingAmount || 100000);
                setPayRef(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
                setShowPaymentModal(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment Received</span>
            </button>
          </div>

          {/* Invoices with Progress Indicators */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 font-semibold text-xs text-slate-800 flex items-center justify-between">
              <span>Customer Invoices & Settlement Progress</span>
              <span className="text-slate-500 font-mono text-[11px]">{customerInvoices.length} Invoices</span>
            </div>

            <div className="divide-y divide-slate-100">
              {customerInvoices.map(inv => {
                const percentPaid = inv.amount > 0 ? Math.round((inv.paidAmount / inv.amount) * 100) : 0;
                return (
                  <div key={inv.id} className="p-4 hover:bg-slate-50/60 transition-colors space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900 font-mono">{inv.invoiceNumber}</span>
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'Partial'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : inv.status === 'Overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                          Issued: {inv.issueDate} • Due: <strong className="text-slate-700 font-mono">{inv.dueDate}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-left sm:text-right text-xs font-mono">
                          <span className="text-slate-500 font-sans text-[10px] font-medium block">Total Value</span>
                          <span className="font-bold text-slate-900">{formatINR(inv.amount)}</span>
                        </div>

                        {inv.remainingAmount > 0 && (
                          <button
                            onClick={() => {
                              setPayInvoiceId(inv.id);
                              setPayAmount(inv.remainingAmount);
                              setPayRef(`UTR-${Math.floor(100000 + Math.random() * 900000)}`);
                              setShowPaymentModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded shadow-2xs cursor-pointer"
                          >
                            Collect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-emerald-700">Paid: {formatINR(inv.paidAmount)} ({percentPaid}%)</span>
                        <span className="text-slate-700">Remaining: {formatINR(inv.remainingAmount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-slate-900 rounded-full transition-all duration-500"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recorded Payments History Ledger */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 font-semibold text-xs text-slate-800 flex items-center justify-between">
              <span>Receipt History & Bank UTR Ledger</span>
              <span className="text-slate-500 font-mono text-[11px]">{customerPayments.length} Settlements</span>
            </div>

            <div className="divide-y divide-slate-100">
              {customerPayments.map(p => (
                <div key={p.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 font-mono">{formatINR(p.amount)} Received</div>
                      <p className="text-slate-500 text-[11px] font-mono">
                        {p.date} • {p.paymentType} • Ref: <strong className="text-slate-700">{p.referenceNumber}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right font-mono text-xs">
                    <span className="text-slate-400 block text-[10px] font-sans">Invoice</span>
                    <span className="font-medium text-slate-800">{p.invoiceNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ISSUES                                                             */}
      {/* ========================================================================= */}
      {selectedCustomerTab === 'issues' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Customer Issues, Disputes & Payment Commitments
              </h3>
              <p className="text-xs text-slate-500">
                Consolidated view of invoice disputes, delayed obligations, and customer payment promises.
              </p>
            </div>

            <button
              onClick={() => {
                setCommitInvoiceId(customerInvoices[0]?.id || '');
                setShowCommitmentModal(true);
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Commitment</span>
            </button>
          </div>

          <div className="space-y-3">
            {/* 1. Active Disputes */}
            {customerDisputes.map(disp => (
              <div
                key={disp.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-medium text-[10px] rounded border border-slate-200 font-mono">
                      ⚠️ Dispute
                    </span>
                    <span className="font-semibold text-slate-900 text-xs font-mono">
                      {disp.invoiceNumber}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatINR(disp.amountAffected)} Blocked
                  </span>
                </div>

                <div className="text-xs space-y-0.5 text-slate-600">
                  <p><strong>Reason:</strong> {disp.reason}</p>
                  <p className="text-slate-500 text-[11px]">Raised: {disp.createdDate} • Status: <strong className="text-slate-800">{disp.status}</strong></p>
                </div>

                {disp.status !== 'Resolved' && (
                  <div className="pt-1">
                    <button
                      onClick={() => setResolvingDisputeId(disp.id)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs cursor-pointer"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* 2. Payment Commitments */}
            {customerCommitments.map(comm => (
              <div
                key={comm.id}
                className={`p-4 bg-white rounded-xl border shadow-2xs space-y-2.5 ${
                  comm.status === 'Missed' ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 font-medium text-[10px] rounded ${
                        comm.status === 'Missed'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {comm.status === 'Missed' ? '🔴 Missed' : '🟠 Upcoming'}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs font-mono">
                      Promised: {comm.promisedDate}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-900 font-mono">
                    {formatINR(comm.amount)}
                  </span>
                </div>

                <div className="text-xs space-y-0.5 text-slate-600">
                  <p><strong>Notes:</strong> {comm.notes}</p>
                  <p className="text-slate-500 text-[11px] font-mono">Invoice: {comm.invoiceNumber} • Status: {comm.status}</p>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      showToast(`Follow-up statement reminder dispatched for promised date ${comm.promisedDate}!`, 'success');
                    }}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ACTIVITY                                                           */}
      {/* ========================================================================= */}
      {selectedCustomerTab === 'activity' && (
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Customer Activity Log
            </h3>
            <p className="text-xs text-slate-500">
              Audit timeline of orders, invoices, payments, and communication events.
            </p>
          </div>

          <div className="relative pl-5 border-l border-slate-200 space-y-5 pt-2">
            {timelineEvents.map(event => {
              const Icon = event.icon;
              return (
                <div key={event.id} className="relative group">
                  {/* Dot */}
                  <div className="absolute -left-[27px] top-1 p-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700">
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-900">{event.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{event.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      {/* 1. Log Payment Commitment Modal */}
      {showCommitmentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">
                Log Commitment for {customer.name}
              </h3>
              <button
                onClick={() => setShowCommitmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCommitment} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Promised Amount (₹)</label>
                <input
                  type="number"
                  value={commitAmount}
                  onChange={e => setCommitAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Promised Date</label>
                <input
                  type="date"
                  value={commitDate}
                  onChange={e => setCommitDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Notes / Context</label>
                <textarea
                  rows={2}
                  value={commitNotes}
                  onChange={e => setCommitNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCommitmentModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg cursor-pointer"
                >
                  Save Commitment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Quick Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">
                Record Payment for {customer.name}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickPaymentSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Select Invoice</label>
                <select
                  value={payInvoiceId}
                  onChange={e => {
                    setPayInvoiceId(e.target.value);
                    const inv = customerInvoices.find(i => i.id === e.target.value);
                    if (inv) setPayAmount(inv.remainingAmount);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {customerInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — Due: {formatINR(inv.remainingAmount)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Amount Received (₹)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Mode</label>
                  <select
                    value={payMethod}
                    onChange={e => setPayMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="NEFT/RTGS">NEFT / RTGS</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Ref / UTR #</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={e => setPayRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Resolve Dispute Modal */}
      {resolvingDisputeId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-semibold text-sm text-slate-900">
                Resolve Invoice Dispute
              </h3>
              <button
                onClick={() => setResolvingDisputeId(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-600">
                Resolving this dispute unblocks the invoice status and recalculates the customer payment health score.
              </p>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Resolution Notes</label>
                <textarea
                  rows={3}
                  value={disputeNotes}
                  onChange={e => setDisputeNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingDisputeId(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolveDisputeAction(resolvingDisputeId)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg cursor-pointer"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. What-If Simulator Modal Pre-loaded with Order Values */}
      {simulatingDeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Sliders className="w-5 h-5 text-slate-800" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      What-If Cash Flow Stress Test
                    </h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded border border-slate-200">
                      {simulatingDeal.dealNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preloaded financial parameters for <span className="font-medium text-slate-700">{customer.name}</span> (Order Value: {formatINR(simulatingDeal.orderValue)})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSimulatingDeal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Close simulator"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <WhatIfSimulator
              initialOrderValue={simulatingDeal.orderValue}
              initialFulfillmentCost={simulatingDeal.estimatedFulfillmentCost}
              initialAdvancePercent={simulatingDeal.advancePercent}
              initialPaymentPeriod={simulatingDeal.paymentPeriodDays}
              customer={customer}
              dealNumber={simulatingDeal.dealNumber}
            />
          </div>
        </div>
      )}
    </div>
  );
};
