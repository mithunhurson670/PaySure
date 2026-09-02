import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Sparkles,
  HelpCircle,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeDealSafety, formatINR } from '../../utils/financialCalculations';

export const AnalyzeDealModal: React.FC = () => {
  const {
    isAnalyzeModalOpen,
    setIsAnalyzeModalOpen,
    analyzeInitialData,
    customers,
    businessSettings,
    addDeal,
    acceptDeal,
    viewDealDetails,
    showToast,
  } = useApp();

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-2');
  const [orderValue, setOrderValue] = useState<number>(1000000); // ₹10 Lakh
  const [advancePercent, setAdvancePercent] = useState<number>(40); // 40%
  const [paymentPeriodDays, setPaymentPeriodDays] = useState<number>(60); // 60 days
  const [fulfillmentCost, setFulfillmentCost] = useState<number>(700000); // ₹7 Lakh
  const [availableWorkingCapital, setAvailableWorkingCapital] = useState<number>(
    businessSettings.currentAvailableCapital || 1240000
  );
  const [dealNotes, setDealNotes] = useState<string>('Standard client packaging contract.');

  // Workflow State: 'input' -> 'result'
  const [currentStep, setCurrentStep] = useState<'input' | 'result'>('input');
  const [analyzedDealId, setAnalyzedDealId] = useState<string | null>(null);

  // Sync initial data if opened with presets
  useEffect(() => {
    if (analyzeInitialData) {
      if (analyzeInitialData.customerId) setSelectedCustomerId(analyzeInitialData.customerId);
      if (analyzeInitialData.orderValue) setOrderValue(analyzeInitialData.orderValue);
      if (analyzeInitialData.advancePercent !== undefined) setAdvancePercent(analyzeInitialData.advancePercent);
      if (analyzeInitialData.paymentPeriodDays) setPaymentPeriodDays(analyzeInitialData.paymentPeriodDays);
      if (analyzeInitialData.fulfillmentCost) setFulfillmentCost(analyzeInitialData.fulfillmentCost);
    }
  }, [analyzeInitialData, isAnalyzeModalOpen]);

  if (!isAnalyzeModalOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Auto-calculated variables
  const advanceAmount = Math.round(orderValue * (advancePercent / 100));
  const remainingReceivable = Math.max(0, orderValue - advanceAmount);
  const workingCapitalGap = Math.max(0, fulfillmentCost - advanceAmount);

  // Real-time analysis output
  const analysisResult = analyzeDealSafety({
    orderValue,
    advancePercent,
    paymentPeriodDays,
    estimatedFulfillmentCost: fulfillmentCost,
    availableWorkingCapital,
    customer: currentCustomer,
  });

  const handleRunAnalysis = () => {
    // Persist deal in context
    const createdDeal = addDeal({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      orderValue,
      advancePercent,
      paymentPeriodDays,
      estimatedFulfillmentCost: fulfillmentCost,
      availableWorkingCapital,
      notes: dealNotes,
    });

    setAnalyzedDealId(createdDeal.id);
    setCurrentStep('result');
  };

  const handleAcceptNow = () => {
    if (analyzedDealId) {
      acceptDeal(analyzedDealId);
      setIsAnalyzeModalOpen(false);
      setCurrentStep('input');
    }
  };

  const handleOpenDetailedAnalysis = () => {
    if (analyzedDealId) {
      setIsAnalyzeModalOpen(false);
      viewDealDetails(analyzedDealId);
    }
  };

  const handleApplyPreset = (type: 'demo' | 'safe' | 'high_risk') => {
    if (type === 'demo') {
      setSelectedCustomerId('cust-2'); // GreenMart
      setOrderValue(1000000);
      setAdvancePercent(40);
      setPaymentPeriodDays(60);
      setFulfillmentCost(700000);
    } else if (type === 'safe') {
      setSelectedCustomerId('cust-1'); // ABC Foods
      setOrderValue(800000);
      setAdvancePercent(60);
      setPaymentPeriodDays(30);
      setFulfillmentCost(450000);
    } else if (type === 'high_risk') {
      setSelectedCustomerId('cust-3'); // FreshBite
      setOrderValue(1200000);
      setAdvancePercent(15);
      setPaymentPeriodDays(90);
      setFulfillmentCost(900000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-white border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                {currentStep === 'input' ? 'Analyze New Deal' : 'Deal Safety Assessment'}
              </h2>
              <p className="text-xs text-slate-500">
                {currentStep === 'input'
                  ? 'Evaluate cash-flow impact and working capital exposure before accepting'
                  : 'PaySure Financial Decision & Capital Risk Verdict'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsAnalyzeModalOpen(false);
              setCurrentStep('input');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {currentStep === 'input' ? (
            /* STEP 1: INPUT DEAL PARAMETERS */
            <div className="space-y-5">
              {/* Quick Presets */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-medium text-slate-600">
                  Standard Order Terms:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('demo')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 font-medium rounded text-slate-700 cursor-pointer shadow-2xs"
                  >
                    Moderate (40% Adv / 60d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('safe')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 font-medium rounded text-slate-700 cursor-pointer shadow-2xs"
                  >
                    Conservative (60% Adv / 30d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('high_risk')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 font-medium rounded text-slate-700 cursor-pointer shadow-2xs"
                  >
                    High Risk (15% Adv / 90d)
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                {/* Customer Selector */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-semibold text-slate-700 flex items-center justify-between text-xs">
                    <span>Customer</span>
                    <span className="font-normal text-slate-500 font-mono text-[11px]">
                      Payment Health: {currentCustomer.healthScore}/100 ({currentCustomer.healthStatus})
                    </span>
                  </label>
                  <select
                    id="select-deal-customer"
                    value={selectedCustomerId}
                    onChange={e => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.category} (Avg {c.averagePaymentDays} days, Score: {c.healthScore})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Value */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center justify-between text-xs">
                    <span>Order Value (₹)</span>
                    <span className="font-mono text-slate-900 font-bold text-xs">
                      {formatINR(orderValue)}
                    </span>
                  </label>
                  <input
                    id="input-order-value"
                    type="number"
                    value={orderValue}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setOrderValue(val);
                      if (fulfillmentCost === 0 || fulfillmentCost === Math.round(orderValue * 0.7)) {
                        setFulfillmentCost(Math.round(val * 0.7));
                      }
                    }}
                    placeholder="1000000"
                    step="50000"
                    min="10000"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-medium focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                  />
                  <div className="flex gap-1 pt-0.5">
                    {[500000, 1000000, 1500000, 2500000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setOrderValue(amt)}
                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-mono text-slate-700 rounded cursor-pointer"
                      >
                        {formatINR(amt, true)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advance % */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-slate-700">
                      Advance Upfront (%)
                    </label>
                    <span className="font-mono font-bold text-slate-900">
                      {advancePercent}% = {formatINR(advanceAmount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input-advance-slider"
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={advancePercent}
                      onChange={e => setAdvancePercent(Number(e.target.value))}
                      className="flex-1 accent-slate-900 cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={advancePercent}
                      onChange={e => setAdvancePercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-14 bg-white border border-slate-200 rounded-lg p-1 text-center font-mono font-medium text-slate-900 text-xs"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Receivable: {formatINR(remainingReceivable)}
                  </p>
                </div>

                {/* Estimated Fulfillment Cost */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center justify-between text-xs">
                    <span>Estimated Fulfillment Cost (₹)</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {formatINR(fulfillmentCost)}
                    </span>
                  </label>
                  <input
                    id="input-fulfillment-cost"
                    type="number"
                    value={fulfillmentCost}
                    onChange={e => setFulfillmentCost(Number(e.target.value))}
                    placeholder="700000"
                    step="25000"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-medium focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                  />
                  <p className="text-[11px] text-slate-500">
                    Direct material, labor, and logistics outlays.
                  </p>
                </div>

                {/* Payment Period (Days) */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center justify-between text-xs">
                    <span>Credit Period Term</span>
                    <span className="font-semibold text-slate-900 text-xs">{paymentPeriodDays} Days</span>
                  </label>
                  <select
                    id="select-payment-period"
                    value={paymentPeriodDays}
                    onChange={e => setPaymentPeriodDays(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-medium focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                  >
                    <option value={15}>15 Days (Short cycle)</option>
                    <option value={30}>30 Days (Standard Industry Norm)</option>
                    <option value={45}>45 Days (MSME Extended Term)</option>
                    <option value={60}>60 Days (High Capital Lock-in)</option>
                    <option value={75}>75 Days (Liquidity Stress)</option>
                    <option value={90}>90 Days (Extreme Risk)</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Expected days from dispatch until final balance clearance.
                  </p>
                </div>

                {/* Available Working Capital */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-semibold text-slate-700 flex items-center justify-between text-xs">
                    <span>Available Liquid Capital (₹)</span>
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {formatINR(availableWorkingCapital)}
                    </span>
                  </label>
                  <input
                    id="input-available-capital"
                    type="number"
                    value={availableWorkingCapital}
                    onChange={e => setAvailableWorkingCapital(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-900 font-mono font-medium focus:ring-1 focus:ring-slate-900 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Instant Auto-Calculation Summary Pill */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider font-sans">
                  Live Computations:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-sans text-[11px]">Advance:</span>
                    <div className="font-bold text-slate-900">{formatINR(advanceAmount, true)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans text-[11px]">Receivable:</span>
                    <div className="font-bold text-slate-900">{formatINR(remainingReceivable, true)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans text-[11px]">Capital Gap:</span>
                    <div className={`font-bold ${workingCapitalGap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatINR(workingCapitalGap, true)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-sans text-[11px]">Margin:</span>
                    <div className="font-bold text-slate-900">
                      {formatINR(orderValue - fulfillmentCost, true)} ({Math.round(((orderValue - fulfillmentCost) / orderValue) * 100)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: DEAL SAFETY RESULT SCREEN */
            <div className="space-y-5 animate-in fade-in-50">
              {/* Professional Verdict Banner */}
              <div
                className={`p-4 rounded-xl border ${
                  analysisResult.riskStatus === 'Safe'
                    ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                    : analysisResult.riskStatus === 'Conditional'
                    ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                    : 'bg-rose-50/50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  {analysisResult.riskStatus === 'Safe' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  )}
                  {analysisResult.riskStatus === 'Conditional' && (
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  )}
                  {analysisResult.riskStatus === 'High Risk' && (
                    <AlertOctagon className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200">
                        {analysisResult.riskStatus === 'Safe' && '🟢 SAFE TO ACCEPT'}
                        {analysisResult.riskStatus === 'Conditional' && '🟠 CAUTION / CONDITIONAL'}
                        {analysisResult.riskStatus === 'High Risk' && '🔴 HIGH RISK'}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        {currentCustomer.name}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                      {analysisResult.riskHeadline}
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-700 mt-1">
                      {analysisResult.riskSummary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Metrics Grid */}
              <div>
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Deal Financial Structure
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Order Value</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatINR(orderValue, true)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Advance Upfront</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatINR(analysisResult.advanceAmount, true)} ({advancePercent}%)
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Receivable</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatINR(analysisResult.remainingReceivable, true)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Fulfillment Cost</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatINR(fulfillmentCost, true)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Working-Capital Gap</span>
                    <div className={`text-sm font-bold mt-0.5 ${analysisResult.workingCapitalGap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {formatINR(analysisResult.workingCapitalGap, true)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Expected Margin</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {formatINR(analysisResult.expectedMargin, true)} ({analysisResult.expectedMarginPercent}%)
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Payment Term</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {paymentPeriodDays} Days
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 font-sans text-[11px]">Advance Coverage</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {analysisResult.advanceCoveragePercent}% of Cost
                    </div>
                  </div>
                </div>
              </div>

              {/* Explanations Breakdown */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Assessment Factors
                </h4>
                <div className="space-y-1.5 pt-0.5 text-xs">
                  {analysisResult.whyReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {reason.type === 'positive' && (
                        <span className="text-emerald-700 font-bold shrink-0">✓</span>
                      )}
                      {reason.type === 'warning' && (
                        <span className="text-amber-700 font-bold shrink-0">⚠</span>
                      )}
                      {reason.type === 'negative' && (
                        <span className="text-rose-700 font-bold shrink-0">✕</span>
                      )}
                      <span className="text-slate-700">{reason.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          {currentStep === 'input' ? (
            <>
              <button
                type="button"
                onClick={() => setIsAnalyzeModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>

              <button
                id="btn-submit-analyze"
                type="button"
                onClick={handleRunAnalysis}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Analyze Deal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('input')}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Adjust Inputs</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenDetailedAnalysis}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Detailed Analysis</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (analyzedDealId) {
                      setIsAnalyzeModalOpen(false);
                      viewDealDetails(analyzedDealId);
                      const event = new CustomEvent('select-deal-tab', { detail: 'what-if' });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <span>Stress Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (analyzedDealId) {
                      setIsAnalyzeModalOpen(false);
                      viewDealDetails(analyzedDealId);
                      const event = new CustomEvent('select-deal-tab', { detail: 'restructure' });
                      window.dispatchEvent(event);
                    }
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-medium text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-slate-500" />
                  <span>Restructure</span>
                </button>

                <button
                  type="button"
                  onClick={handleAcceptNow}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Accept Deal</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
