import React, { useState } from 'react';
import {
  Zap,
  Scale,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

export const FinancingPage: React.FC = () => {
  const { businessSettings, showToast } = useApp();

  // Factoring Simulator state
  const [invoiceAmount, setInvoiceAmount] = useState<number>(600000);
  const [advanceRate, setAdvanceRate] = useState<number>(85); // 85% upfront
  const [discountPercentPerMonth, setDiscountPercentPerMonth] = useState<number>(1.25); // 1.25%
  const [creditDays, setCreditDays] = useState<number>(60);

  const [copiedNotice, setCopiedNotice] = useState(false);

  // Calculations
  const immediateCash = Math.round(invoiceAmount * (advanceRate / 100));
  const months = creditDays / 30;
  const factoringFee = Math.round(invoiceAmount * ((discountPercentPerMonth * months) / 100));
  const netReceived = invoiceAmount - factoringFee;

  const msmeNoticeDraft = `LEGAL STATUTORY NOTICE UNDER SECTION 15 & 16 OF MSMED ACT, 2006\n\nTo:\nManaging Director / Accounts Head\nGreenMart Retail Ltd\n\nSubject: Delayed Payment for Invoices exceeding 45-day statutory limit\n\nDear Sir/Madam,\n\nWe draw your immediate attention to Outstanding Invoices aggregating to ₹4,80,000, which have exceeded the statutory maximum credit period of 45 days mandated under Section 15 of the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006.\n\nPlease note that under Section 16 of the MSMED Act, failure to settle within 45 days attracts mandatory compound interest with monthly rests at 3 (three) times the Repo/Bank Rate notified by the Reserve Bank of India.\n\nKindly release the pending RTGS remittance within 7 working days to avoid formal escalation to the MSME Facilitation Council (MSME Samadhaan).\n\nAuthorized Signatory,\n${businessSettings.businessName}\nUDYAM Reg: UDYAM-MH-03-0098124`;

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(msmeNoticeDraft);
    setCopiedNotice(true);
    showToast('MSME Samadhaan legal demand notice copied!', 'success');
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Working Capital Financing & Legal Recovery
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Bridge funding gaps via Invoice Discounting (TReDS) and enforce MSMED Act 45-day statutory payment protection.
        </p>
      </div>

      {/* Grid: Factoring Simulator & MSMED Legal Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: TReDS / Invoice Factoring Simulator (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Zap className="w-4 h-4 text-slate-400" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900">
                Invoice Discounting & Factoring Calculator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate cash flow unlock (80–90%) within 24 hours against approved buyer invoices.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Invoice Value (₹)</label>
              <input
                type="number"
                value={invoiceAmount}
                onChange={e => setInvoiceAmount(Number(e.target.value))}
                step="50000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Advance % Unlocked Today</label>
              <input
                type="number"
                min="70"
                max="95"
                value={advanceRate}
                onChange={e => setAdvanceRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Financing Discount Rate (% / mo)</label>
              <input
                type="number"
                step="0.1"
                value={discountPercentPerMonth}
                onChange={e => setDiscountPercentPerMonth(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-medium">Tenure (Days)</label>
              <input
                type="number"
                value={creditDays}
                onChange={e => setCreditDays(Number(e.target.value))}
                step="15"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Results Comparison Grid */}
          <div className="grid grid-cols-3 gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 font-sans text-[10px] uppercase font-medium">Day-1 Cash</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(immediateCash)}</div>
              <span className="text-[10px] text-slate-500 font-sans">{advanceRate}% of invoice</span>
            </div>

            <div>
              <span className="text-slate-500 font-sans text-[10px] uppercase font-medium">Financing Cost</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(factoringFee)}</div>
              <span className="text-[10px] text-slate-500 font-sans">{discountPercentPerMonth}% / mo</span>
            </div>

            <div>
              <span className="text-slate-500 font-sans text-[10px] uppercase font-medium">Net Realized</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{formatINR(netReceived)}</div>
              <span className="text-[10px] text-slate-500 font-sans">Effective return</span>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => showToast('TReDS partner application link generated.', 'success')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              Apply for TReDS Discounting
            </button>
          </div>
        </div>

        {/* Right: MSMED Act 45-Day Statutory Protection (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Scale className="w-4 h-4 text-slate-400" />
              <div>
                <h3 className="font-semibold text-sm text-slate-900">
                  MSMED Act 45-Day Statutory Protection
                </h3>
                <p className="text-xs text-slate-500">
                  Enforce legal compound interest provisions for delayed payments.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold text-slate-900">Section 15 & 16 Provisions:</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Under Indian law, payments to MSMEs cannot exceed 45 days from delivery. Delays incur mandatory compound interest at 3x the RBI Repo rate.
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto select-all text-[11px]">
              {msmeNoticeDraft}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyNotice}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Statutory Demand Notice Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy MSME Samadhaan Notice</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
