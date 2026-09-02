import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Sliders,
  Sparkles,
  DollarSign,
  FileCheck,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WhatIfSimulator } from './WhatIfSimulator';
import { DealRestructuring } from './DealRestructuring';
import { formatINR } from '../../utils/financialCalculations';

export const DetailedDealAnalysis: React.FC = () => {
  const {
    selectedDealId,
    deals,
    customers,
    businessSettings,
    setActiveView,
    viewCustomerProfile,
    acceptDeal,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'what-if' | 'restructure'>('overview');

  // Listen for custom tab events from modal
  useEffect(() => {
    const handleTabChange = (e: any) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('select-deal-tab', handleTabChange);
    return () => window.removeEventListener('select-deal-tab', handleTabChange);
  }, []);

  const deal = deals.find(d => d.id === selectedDealId) || deals[0];
  const customer = customers.find(c => c.id === deal.customerId);

  if (!deal) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="text-base font-semibold text-slate-900">No Deal Selected</h3>
        <p className="text-xs text-slate-500 mt-1">Please select a deal from the deals register.</p>
        <button
          onClick={() => setActiveView('deals')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg cursor-pointer"
        >
          View All Deals
        </button>
      </div>
    );
  }

  const handleApplyStructureChanges = (advancePct: number, days: number) => {
    setActiveTab('overview');
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('deals')}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {deal.dealNumber}
              </h1>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                  deal.riskStatus === 'Safe'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : deal.riskStatus === 'Conditional'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {deal.riskStatus === 'Safe' && '🟢 Safe'}
                {deal.riskStatus === 'Conditional' && '🟠 Conditional'}
                {deal.riskStatus === 'High Risk' && '🔴 High Risk'}
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {deal.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
              <span>Customer:</span>
              <strong
                onClick={() => viewCustomerProfile(deal.customerId)}
                className="text-slate-900 hover:underline cursor-pointer font-medium"
              >
                {deal.customerName}
              </strong>
              <span>• Created on {deal.createdAt}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {deal.status === 'Analyzed' && (
            <button
              onClick={() => {
                acceptDeal(deal.id);
                showToast(`Deal ${deal.dealNumber} accepted! Invoice generated.`, 'success');
              }}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Accept Deal & Invoice</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('restructure')}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Restructure</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Detailed Analysis
        </button>
        <button
          onClick={() => setActiveTab('what-if')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'what-if'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Stress Test (What-If)</span>
        </button>
        <button
          onClick={() => setActiveTab('restructure')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'restructure'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Restructure Deal</span>
        </button>
      </div>

      {/* Tab 1: Detailed Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Main Assessment Header Card */}
          <div
            className={`p-5 rounded-xl border ${
              deal.riskStatus === 'Safe'
                ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                : deal.riskStatus === 'Conditional'
                ? 'bg-amber-50/40 border-amber-200 text-amber-950'
                : 'bg-rose-50/40 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                {deal.riskStatus === 'Safe' && <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />}
                {deal.riskStatus === 'Conditional' && <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />}
                {deal.riskStatus === 'High Risk' && <AlertOctagon className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />}

                <div>
                  <h3 className="text-base font-bold">
                    Overall Assessment:{' '}
                    {deal.riskStatus === 'Safe' && '🟢 Safe to Accept'}
                    {deal.riskStatus === 'Conditional' && '🟠 Conditional Approval'}
                    {deal.riskStatus === 'High Risk' && '🔴 High Capital Risk'}
                  </h3>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed max-w-3xl">
                    {deal.riskStatus === 'Safe' &&
                      'Your advance payment fully covers the fulfillment cost or leaves a trivial funding gap easily managed by your available working capital buffer.'}
                    {deal.riskStatus === 'Conditional' &&
                      'This order is profitable with an estimated margin of ' +
                        formatINR(deal.expectedMargin, true) +
                        ', but locks ' +
                        formatINR(deal.workingCapitalGap, true) +
                        ' of your working capital for ' +
                        deal.paymentPeriodDays +
                        ' days.'}
                    {deal.riskStatus === 'High Risk' &&
                      'Severe working capital drain detected. Executing this order under current credit terms risks stalling your ongoing manufacturing operations.'}
                  </p>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="flex sm:flex-col gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('what-if')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Stress Test →</span>
                </button>
                <button
                  onClick={() => setActiveTab('restructure')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Restructure Deal →</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3 Core Analytical Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {/* Quadrant 1: Deal Overview */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-sans">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">1. Deal Overview</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Order Value:</span>
                  <span className="font-bold text-slate-900">{formatINR(deal.orderValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Advance ({deal.advancePercent}%):</span>
                  <span className="font-semibold text-slate-900">{formatINR(deal.advanceAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Receivable:</span>
                  <span className="font-semibold text-slate-900">{formatINR(deal.remainingReceivable)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Fulfillment Cost:</span>
                  <span className="font-semibold text-slate-900">{formatINR(deal.estimatedFulfillmentCost)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-sans font-medium">Gross Margin:</span>
                  <span className="font-bold text-emerald-700">
                    {formatINR(deal.expectedMargin)} ({deal.expectedMarginPercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Quadrant 2: Financial Exposure */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-sans">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">2. Financial Exposure</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Total Customer Exposure:</span>
                  <span className="font-bold text-slate-900">
                    {formatINR((customer?.outstanding || 0) + deal.remainingReceivable, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Working-Capital Gap:</span>
                  <span className={`font-bold ${deal.workingCapitalGap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {formatINR(deal.workingCapitalGap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Advance Cost Coverage:</span>
                  <span className="font-bold text-slate-900">{deal.advanceCoveragePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Current Liquid Buffer:</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(businessSettings.currentAvailableCapital, true)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-sans font-medium">Buffer Drain:</span>
                  <span className={`font-bold ${deal.workingCapitalGap > businessSettings.currentAvailableCapital * 0.4 ? 'text-rose-700' : 'text-slate-800'}`}>
                    {Math.round((deal.workingCapitalGap / businessSettings.currentAvailableCapital) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quadrant 3: Payment Risk & Behavior */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-sans">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">3. Payment Risk</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Agreed Payment Period:</span>
                  <span className="font-bold text-slate-900">{deal.paymentPeriodDays} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Historical Avg Clearance:</span>
                  <span className="font-bold text-slate-900">
                    {customer?.averagePaymentDays || 30} Days ({customer?.paymentBehaviourStatus || 'Stable'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">On-Time Clearance Rate:</span>
                  <span className="font-bold text-slate-900">{customer?.onTimePaymentRate || 85}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Late Invoices Track:</span>
                  <span className="font-bold text-slate-900">{customer?.latePaymentsCount || 0}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-sans font-medium">Customer Health:</span>
                  <span className="font-bold text-slate-900">
                    {customer?.healthScore || 80}/100 ({customer?.healthStatus || 'Healthy'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Why this result? */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              Decision Assessment Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {deal.whyReasons.map((reason, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                  {reason.type === 'positive' && (
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                  )}
                  {reason.type === 'warning' && (
                    <span className="text-amber-700 font-bold shrink-0">⚠</span>
                  )}
                  {reason.type === 'negative' && (
                    <span className="text-rose-700 font-bold shrink-0">✕</span>
                  )}
                  <p className="text-slate-700 leading-relaxed font-normal">{reason.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: What-If Simulator */}
      {activeTab === 'what-if' && (
        <WhatIfSimulator
          initialOrderValue={deal.orderValue}
          initialFulfillmentCost={deal.estimatedFulfillmentCost}
          initialAdvancePercent={deal.advancePercent}
          initialPaymentPeriod={deal.paymentPeriodDays}
          availableCash={businessSettings.currentAvailableCapital}
          customer={customer}
          dealNumber={deal.dealNumber}
          onApplyChanges={handleApplyStructureChanges}
        />
      )}

      {/* Tab 3: Deal Restructuring */}
      {activeTab === 'restructure' && (
        <DealRestructuring
          deal={deal}
          onApplyStructure={handleApplyStructureChanges}
        />
      )}
    </div>
  );
};
