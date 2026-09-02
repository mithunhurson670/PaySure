import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ComposedChart,
} from 'recharts';
import {
  ArrowRight,
  Calendar,
  Info,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatINR } from '../../utils/financialCalculations';
import { useApp } from '../../context/AppContext';

interface CashFlowDataPoint {
  period: string;
  isActual: boolean;
  openingCash: number;
  expectedInflow: number;
  expectedOutflow: number;
  netMovement: number;
  actualClosing?: number;
  projectedClosing?: number;
  notes?: string;
}

const cashFlowTimeline: CashFlowDataPoint[] = [
  {
    period: 'Jul 15',
    isActual: true,
    openingCash: 1210000,
    expectedInflow: 450000,
    expectedOutflow: 520000,
    netMovement: -70000,
    actualClosing: 1140000,
  },
  {
    period: 'Aug 01',
    isActual: true,
    openingCash: 1140000,
    expectedInflow: 780000,
    expectedOutflow: 640000,
    netMovement: 140000,
    actualClosing: 1280000,
  },
  {
    period: 'Aug 15',
    isActual: true,
    openingCash: 1280000,
    expectedInflow: 540000,
    expectedOutflow: 620000,
    netMovement: -80000,
    actualClosing: 1200000,
  },
  {
    period: 'Sep 01 (Today)',
    isActual: true,
    openingCash: 1200000,
    expectedInflow: 320000,
    expectedOutflow: 280000,
    netMovement: 40000,
    actualClosing: 1240000,
    projectedClosing: 1240000,
    notes: 'Current verified bank balance.',
  },
  {
    period: 'Sep 15',
    isActual: false,
    openingCash: 1240000,
    expectedInflow: 220000,
    expectedOutflow: 680000,
    netMovement: -460000,
    projectedClosing: 780000,
    notes: 'Raw material procurement outlays for queued orders.',
  },
  {
    period: 'Sep 20',
    isActual: false,
    openingCash: 780000,
    expectedInflow: 80000,
    expectedOutflow: 380000,
    netMovement: -300000,
    projectedClosing: 480000,
    notes: 'Vendor bulk batch settlement; near safe reserve buffer.',
  },
  {
    period: 'Oct 01',
    isActual: false,
    openingCash: 480000,
    expectedInflow: 650000,
    expectedOutflow: 320000,
    netMovement: 330000,
    projectedClosing: 810000,
    notes: 'Apex Logistics proforma dispatch clearance.',
  },
  {
    period: 'Oct 15',
    isActual: false,
    openingCash: 810000,
    expectedInflow: 550000,
    expectedOutflow: 420000,
    netMovement: 130000,
    projectedClosing: 940000,
    notes: 'FreshBite promise payment + GreenMart advance tranche.',
  },
  {
    period: 'Nov 01',
    isActual: false,
    openingCash: 940000,
    expectedInflow: 820000,
    expectedOutflow: 500000,
    netMovement: 320000,
    projectedClosing: 1260000,
    notes: 'GreenMart proforma balance + Royal Cafe dispute unfreeze.',
  },
  {
    period: 'Nov 15',
    isActual: false,
    openingCash: 1260000,
    expectedInflow: 600000,
    expectedOutflow: 480000,
    netMovement: 120000,
    projectedClosing: 1380000,
    notes: 'Standard recurring monthly receivables.',
  },
];

export const CashFlowSnapshot: React.FC = () => {
  const [viewScope, setViewScope] = useState<'all' | 'projected'>('all');
  const { setActiveView, businessSettings } = useApp();

  const safeThreshold = businessSettings.safetyBufferAmount || 400000;

  const data = viewScope === 'all'
    ? cashFlowTimeline
    : cashFlowTimeline.filter(d => !d.isActual || d.period.includes('Today'));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: CashFlowDataPoint = payload[0]?.payload;
      const closing = item.isActual ? item.actualClosing : item.projectedClosing;
      const isBelowThreshold = (closing || 0) < safeThreshold;
      const isNearThreshold = (closing || 0) < safeThreshold * 1.35;

      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-lg shadow-xl border border-slate-700 text-xs space-y-2 min-w-[240px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-100 text-xs">{label}</span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                item.isActual ? 'bg-slate-800 text-slate-300' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {item.isActual ? 'Historical Record' : 'Projected Forecast'}
            </span>
          </div>

          <div className="space-y-1 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Opening Cash:</span>
              <span className="font-medium text-slate-100">{formatINR(item.openingCash)}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span className="text-slate-400 font-sans">Expected Inflow:</span>
              <span className="font-medium">+{formatINR(item.expectedInflow)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span className="text-slate-400 font-sans">Expected Outflow:</span>
              <span className="font-medium">-{formatINR(item.expectedOutflow)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 font-semibold">
              <span className="text-slate-400 font-sans">Net Movement:</span>
              <span className={item.netMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {item.netMovement >= 0 ? '+' : ''}
                {formatINR(item.netMovement)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className="font-medium text-slate-300 text-xs">
              {item.isActual ? 'Actual Closing:' : 'Projected Closing:'}
            </span>
            <span
              className={`font-mono font-bold text-sm ${
                isBelowThreshold ? 'text-rose-400' : isNearThreshold ? 'text-amber-400' : 'text-slate-100'
              }`}
            >
              {formatINR(closing || 0)}
            </span>
          </div>

          {item.notes && (
            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              {item.notes}
            </p>
          )}

          {isBelowThreshold && (
            <div className="p-1.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-[10px] rounded font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Projected balance falls below safe working-capital reserve.</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
              Cash Flow Trajectory (Actual vs. Projected)
            </h2>
            <div className="relative group/tip cursor-pointer">
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tip:block w-72 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-20 pointer-events-none">
                Combines historical bank records with scheduled invoice maturities and procurement fulfillment outlays.
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Solid line shows verified historical cash; dashed line projects future balances against your safe working-capital reserve.
          </p>
        </div>

        {/* View Range Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewScope('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Trajectory
            </button>
            <button
              onClick={() => setViewScope('projected')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewScope === 'projected'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Forecast Only
            </button>
          </div>

          <button
            onClick={() => setActiveView('reports')}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 pl-2 py-1 cursor-pointer"
          >
            <span>Aging Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-64 sm:h-72 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 18, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="period"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />

            <YAxis
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 1600000]}
              tickFormatter={val => formatINR(val, true)}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Safe Working Capital Buffer Line */}
            <ReferenceLine
              y={safeThreshold}
              stroke="#e11d48"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `Safe Buffer (${formatINR(safeThreshold, true)})`,
                fill: '#e11d48',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />

            {/* Today Divider Line - Extends fully down to X-axis */}
            <ReferenceLine
              x="Sep 01 (Today)"
              stroke="#0f172a"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              isFront={true}
              label={{
                value: 'TODAY',
                fill: '#0f172a',
                fontSize: 10,
                fontWeight: '700',
                position: 'top',
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
            />

            {/* Historical Actual Solid Line */}
            <Line
              type="monotone"
              dataKey="actualClosing"
              name="Historical Verified Cash"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 3.5, fill: '#0f172a' }}
              activeDot={{ r: 5 }}
              connectNulls={false}
            />

            {/* Future Projected Dashed Line */}
            <Line
              type="monotone"
              dataKey="projectedClosing"
              name="Projected Forecast"
              stroke="#64748b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3.5, fill: '#64748b', strokeDasharray: '0' }}
              activeDot={{ r: 5 }}
              connectNulls={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Structured Cash-Flow Summary Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4 border-t border-slate-100">
        {/* Next 30 Days Card */}
        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Next 30 Days (Sep 1 – Oct 1)
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              Short Term
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Expected Inflow:</span>
              <span className="font-medium text-emerald-700">₹9,50,000</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Expected Outflow:</span>
              <span className="font-medium text-rose-700">₹13,80,000</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
              <span className="text-slate-700 font-sans">Net Movement:</span>
              <span className="text-rose-700 font-bold">-₹4,30,000</span>
            </div>
          </div>
        </div>

        {/* Next 60 Days Card */}
        <div className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Next 60 Days (Sep 1 – Nov 1)
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              Medium Term
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Expected Inflow:</span>
              <span className="font-medium text-emerald-700">₹23,20,000</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Expected Outflow:</span>
              <span className="font-medium text-rose-700">₹23,00,000</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
              <span className="text-slate-700 font-sans">Projected Balance:</span>
              <span className="text-slate-900 font-bold">₹12,60,000</span>
            </div>
          </div>
        </div>

        {/* Risk Callout Card */}
        <div className="p-3.5 bg-amber-50/40 rounded-lg border border-amber-200/80 space-y-2 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Liquidity Pressure Window</span>
          </div>

          <p className="text-xs text-amber-900/80 leading-relaxed">
            <strong>September 18–20:</strong> ₹3.0L working-capital gap for custom vendor procurement outlays before customer milestone clearances.
          </p>

          <div className="flex items-center justify-between pt-1 text-[11px] text-amber-900 font-medium">
            <span>Buffer Min: ₹4.8L</span>
            <button
              onClick={() => setActiveView('financing')}
              className="text-slate-900 font-semibold hover:underline cursor-pointer"
            >
              Bridge via TReDS →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
