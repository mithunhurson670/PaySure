import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Deal, RestructureOption } from '../../types';
import { formatINR, generateRestructureOptions } from '../../utils/financialCalculations';

interface DealRestructuringProps {
  deal: Deal;
  onApplyStructure?: (advancePercent: number, paymentDays: number) => void;
}

export const DealRestructuring: React.FC<DealRestructuringProps> = ({
  deal,
  onApplyStructure,
}) => {
  const { businessSettings, restructureAndApplyDeal, showToast } = useApp();
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('opt-3');

  const options = generateRestructureOptions(
    deal.orderValue,
    deal.estimatedFulfillmentCost,
    deal.paymentPeriodDays,
    deal.advancePercent,
    businessSettings.currentAvailableCapital
  );

  const selectedOption = options.find(o => o.id === selectedOptionId) || options[2];

  const handleApply = (opt: RestructureOption) => {
    if (onApplyStructure) {
      onApplyStructure(opt.advancePercent, opt.paymentPeriodDays);
    } else {
      restructureAndApplyDeal(deal.id, opt.advancePercent, opt.paymentPeriodDays);
    }
  };

  // Generate WhatsApp / Email Negotiation Script for the MSME Owner
  const negotiationDraft = `Dear ${deal.customerName} Team,\n\nThank you for confirming Order #${deal.dealNumber} (Value: ${formatINR(deal.orderValue)}).\n\nTo ensure dedicated procurement of custom raw materials and meet our high delivery quality standards on schedule, our revised standard financial term requires a ${selectedOption.advancePercent}% mobilization advance (${formatINR(selectedOption.advanceAmount)}) with balance settlement within ${selectedOption.paymentPeriodDays} days of dispatch.\n\nPlease confirm so we can immediately initiate batch scheduling.\n\nWarm regards,\n${businessSettings.ownerName}\n${businessSettings.businessName}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(negotiationDraft);
    setCopiedTemplate(true);
    showToast('Client negotiation template copied to clipboard!', 'success');
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Deal Restructuring & Safe Alternatives
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare restructured terms with lower working-capital exposure and export client negotiation scripts.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
          <span className="font-sans">Current:</span>
          <strong className="text-rose-700">{deal.advancePercent}% Adv / {deal.paymentPeriodDays}d</strong>
        </div>
      </div>

      {/* Comparison Grid: Current Proposal vs 3 Suggested Alternatives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        {/* Current Proposal Card */}
        <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 space-y-3 relative flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 font-mono">
                Current Proposal
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                {deal.riskStatus}
              </span>
            </div>

            <div className="mt-2 space-y-1">
              <div className="text-base font-bold text-slate-900 font-mono">
                {deal.advancePercent}% Adv
              </div>
              <div className="text-xs text-slate-600">
                {deal.paymentPeriodDays} Days Credit
              </div>
            </div>

            <div className="my-2.5 pt-2 border-t border-rose-200/60 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-[11px]">Advance:</span>
                <span className="font-bold text-slate-900">{formatINR(deal.advanceAmount, true)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans text-[11px]">Capital Gap:</span>
                <span className="font-bold text-rose-700">{formatINR(deal.workingCapitalGap, true)}</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
            Locks {formatINR(deal.workingCapitalGap, true)} of capital for {deal.paymentPeriodDays} days.
          </div>
        </div>

        {/* 3 Smart Alternatives */}
        {options.map(opt => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => setSelectedOptionId(opt.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'border-slate-900 bg-slate-50/50 ring-1 ring-slate-900'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-900 font-sans">
                    {opt.title}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      opt.riskStatus === 'Safe'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {opt.riskStatus === 'Safe' ? '🟢 Safe' : '🟠 Low Risk'}
                  </span>
                </div>

                <div className="mt-2 space-y-0.5">
                  <div className="text-base font-bold text-slate-900 font-mono">
                    {opt.advancePercent}% Adv
                  </div>
                  <div className="text-xs text-slate-600">
                    {opt.paymentPeriodDays} Days Credit
                  </div>
                </div>

                <div className="my-2.5 pt-2 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans text-[11px]">Advance:</span>
                    <span className="font-bold text-slate-900">{formatINR(opt.advanceAmount, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans text-[11px]">Capital Gap:</span>
                    <span
                      className={`font-bold ${
                        opt.workingCapitalGap === 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {opt.workingCapitalGap === 0 ? '₹0 (Funded)' : formatINR(opt.workingCapitalGap, true)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 leading-snug">
                  {opt.cashImprovement || opt.whyExplanation}
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    handleApply(opt);
                    showToast(`Deal restructured to ${opt.advancePercent}% Adv / ${opt.paymentPeriodDays}d!`, 'success');
                  }}
                  className={`w-full py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    isSelected
                      ? 'bg-slate-900 text-white hover:bg-slate-800'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Apply Term</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Negotiation Script Box */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">
              Client Negotiation Script for {selectedOption.title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyScript}
            className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-medium rounded-lg shadow-2xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            {copiedTemplate ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Script</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed select-all">
          {negotiationDraft}
        </div>
      </div>
    </div>
  );
};
