import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
} from 'lucide-react';
import { simulateWhatIf, formatINR } from '../../utils/financialCalculations';
import { Customer } from '../../types';

interface WhatIfSimulatorProps {
  initialOrderValue?: number;
  initialFulfillmentCost?: number;
  initialAdvancePercent?: number;
  initialPaymentPeriod?: number;
  availableCash?: number;
  customer?: Customer | null;
  dealNumber?: string;
  onApplyChanges?: (advance: number, days: number) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  initialOrderValue = 1000000,
  initialFulfillmentCost = 700000,
  initialAdvancePercent = 40,
  initialPaymentPeriod = 60,
  availableCash = 1240000,
  onApplyChanges,
}) => {
  // Slider states
  const [orderValue, setOrderValue] = useState<number>(initialOrderValue);
  const [advancePercent, setAdvancePercent] = useState<number>(initialAdvancePercent);
  const [paymentPeriodDays, setPaymentPeriodDays] = useState<number>(initialPaymentPeriod);
  const [paymentDelayDays, setPaymentDelayDays] = useState<number>(0);
  const [fulfillmentCost, setFulfillmentCost] = useState<number>(initialFulfillmentCost);

  const simulation = simulateWhatIf(
    orderValue,
    fulfillmentCost,
    advancePercent,
    paymentPeriodDays,
    paymentDelayDays,
    availableCash
  );

  const handleReset = () => {
    setOrderValue(initialOrderValue);
    setAdvancePercent(initialAdvancePercent);
    setPaymentPeriodDays(initialPaymentPeriod);
    setPaymentDelayDays(0);
    setFulfillmentCost(initialFulfillmentCost);
  };

  // Generate dynamic cash flow timeline data points
  const chartData = [
    { day: 'Day 0 (Kickoff)', balance: simulation.cashAtDay0, milestone: 'Advance Inflow - Production Outlays' },
    { day: 'Day 15 (WIP)', balance: simulation.cashAtDay0 - (fulfillmentCost * 0.25), milestone: 'Manufacturing Expenses' },
    { day: 'Day 30 (Dispatch)', balance: simulation.cashAtDay30, milestone: '100% Fulfillment Cost Incurred' },
    {
      day: `Day ${paymentPeriodDays} (Maturity)`,
      balance: paymentDelayDays === 0 ? simulation.cashAtPayment : simulation.cashAtDay30,
      milestone: paymentDelayDays === 0 ? 'Full Balance Collected' : 'Payment Due (Delayed)',
    },
    ...(paymentDelayDays > 0
      ? [
          {
            day: `Day ${simulation.effectiveTotalDays} (Settlement)`,
            balance: simulation.cashAtPayment,
            milestone: `Settlement after +${paymentDelayDays}d delay`,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-900">
              Interactive What-If Stress Testing
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test how customer payment delays or advance renegotiations impact your live cash position.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="self-start sm:self-auto text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Main Grid: Controls vs Live Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Scenario Parameters
          </div>

          {/* Slider 1: Advance % */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-800">
              <span>Advance Upfront (%)</span>
              <span className="font-mono font-bold text-slate-900">{advancePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={advancePercent}
              onChange={e => setAdvancePercent(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0%</span>
              <span className="text-slate-700">Amount: {formatINR(simulation.advanceAmount, true)}</span>
              <span>100%</span>
            </div>
          </div>

          {/* Slider 2: Agreed Payment Term */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-800">
              <span>Agreed Payment Period</span>
              <span className="font-mono font-bold text-slate-900">{paymentPeriodDays} Days</span>
            </div>
            <input
              type="range"
              min="15"
              max="120"
              step="5"
              value={paymentPeriodDays}
              onChange={e => setPaymentPeriodDays(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>15d</span>
              <span>60d</span>
              <span>120d</span>
            </div>
          </div>

          {/* Slider 3: Customer Payment Delay */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-800">
              <span className="flex items-center gap-1">
                <span>Payment Delay</span>
                {paymentDelayDays > 0 && (
                  <span className="text-[10px] px-1 py-0.2 rounded bg-rose-50 border border-rose-200 text-rose-700 font-medium font-mono">
                    +{paymentDelayDays}d
                  </span>
                )}
              </span>
              <span className={`font-mono ${paymentDelayDays > 0 ? 'text-rose-700 font-bold' : 'text-slate-600'}`}>
                +{paymentDelayDays} Days
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={paymentDelayDays}
              onChange={e => setPaymentDelayDays(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>0d (On-Time)</span>
              <span>+30d</span>
              <span>+60d</span>
            </div>
          </div>

          {/* Slider 4: Fulfillment Cost */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-medium text-slate-800">
              <span>Fulfillment Cost</span>
              <span className="font-mono font-bold text-slate-900">{formatINR(fulfillmentCost, true)}</span>
            </div>
            <input
              type="range"
              min={Math.round(orderValue * 0.3)}
              max={orderValue}
              step="25000"
              value={fulfillmentCost}
              onChange={e => setFulfillmentCost(Number(e.target.value))}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>Margin: {formatINR(simulation.expectedMargin, true)}</span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-medium text-slate-500">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setPaymentPeriodDays(60);
                  setPaymentDelayDays(0);
                  setAdvancePercent(40);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] font-medium text-slate-700 rounded border border-slate-200 cursor-pointer shadow-2xs"
              >
                60d Standard (Manageable)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentPeriodDays(60);
                  setPaymentDelayDays(15);
                  setAdvancePercent(40);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] font-medium text-amber-800 rounded border border-amber-200 cursor-pointer shadow-2xs"
              >
                75d Total (Caution)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentPeriodDays(60);
                  setPaymentDelayDays(30);
                  setAdvancePercent(25);
                }}
                className="px-2 py-1 bg-white hover:bg-slate-100 text-[10px] font-medium text-rose-800 rounded border border-rose-200 cursor-pointer shadow-2xs"
              >
                90d Total (High Pressure)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Projections & Timeline Chart (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Live Dynamic Status Card */}
          <div className={`p-3.5 rounded-xl border ${simulation.riskColor} transition-all`}>
            <div className="flex items-center gap-2">
              {simulation.riskLevel === 'Safe' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              {simulation.riskLevel === 'Caution' && <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />}
              {simulation.riskLevel === 'High Risk' && <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0" />}
              <span className="font-semibold text-xs uppercase tracking-wide">
                {simulation.effectiveTotalDays} Days Total Cycle —{' '}
                {simulation.riskLevel === 'Safe' && '🟢 Manageable'}
                {simulation.riskLevel === 'Caution' && '🟠 Caution'}
                {simulation.riskLevel === 'High Risk' && '🔴 High Pressure'}
              </span>
            </div>
            <p className="text-xs mt-1 font-normal leading-relaxed">
              {simulation.message}
            </p>
          </div>

          {/* 4 Dynamic Indicator Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans text-[10px]">Capital Gap</span>
              <div className={`font-bold text-xs mt-0.5 ${simulation.workingCapitalGap > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {formatINR(simulation.workingCapitalGap, true)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans text-[10px]">Margin</span>
              <div className="font-bold text-xs text-emerald-700 mt-0.5">
                {formatINR(simulation.expectedMargin, true)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans text-[10px]">Lowest Cash Dip</span>
              <div className={`font-bold text-xs mt-0.5 ${simulation.minCashPoint < availableCash * 0.3 ? 'text-rose-700' : 'text-slate-900'}`}>
                {formatINR(simulation.minCashPoint, true)}
              </div>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-sans text-[10px]">Final Position</span>
              <div className="font-bold text-xs text-slate-900 mt-0.5">
                {formatINR(simulation.cashAtPayment, true)}
              </div>
            </div>
          </div>

          {/* Dynamic Cash Flow Trajectory Chart */}
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900">Projected Liquidity Trajectory</span>
              <span className="text-slate-500 text-[11px] font-mono">
                Reserve Floor: {formatINR(availableCash * 0.3, true)}
              </span>
            </div>

            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => formatINR(val, true)}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded-md text-xs shadow-md space-y-0.5">
                            <div className="font-medium text-slate-200">{label}</div>
                            <div className="text-emerald-400 font-mono">
                              Balance: {formatINR(payload[0]?.value as number)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {(payload[0]?.payload as any)?.milestone}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={availableCash * 0.3}
                    stroke="#f43f5e"
                    strokeDasharray="3 3"
                    label={{ value: 'Floor', fill: '#f43f5e', fontSize: 10, position: 'insideTopRight' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Bank Balance"
                    stroke="#0f172a"
                    strokeWidth={2}
                    dot={{ fill: '#0f172a', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Action Button */}
          {onApplyChanges && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => onApplyChanges(advancePercent, paymentPeriodDays)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg shadow-2xs cursor-pointer"
              >
                Apply Parameters to Deal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
