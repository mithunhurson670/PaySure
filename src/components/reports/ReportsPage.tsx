import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  PieChart as PieIcon,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { cashFlow6Months } from '../../data/mockData';
import { formatINR } from '../../utils/financialCalculations';

export const ReportsPage: React.FC = () => {
  const { customers, showToast } = useApp();

  // Concentration data
  const totalReceivables = customers.reduce((acc, c) => acc + c.outstanding, 0);
  const concentrationData = customers.map(c => ({
    name: c.name,
    value: c.outstanding,
    percent: totalReceivables > 0 ? Math.round((c.outstanding / totalReceivables) * 100) : 0,
  }));

  const COLORS = ['#0f172a', '#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'];

  // Aging data
  const agingData = [
    { bucket: '0 - 30 Days', amount: 620000 },
    { bucket: '31 - 60 Days', amount: 480000 },
    { bucket: '61 - 90 Days', amount: 290000 },
    { bucket: '90+ Days', amount: 150000 },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Working Capital Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear analytics explaining working capital distribution and buyer credit dependency.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting executive PDF financial report...', 'success')}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Summary (PDF / CSV)</span>
        </button>
      </div>

      {/* Grid: Concentration Risk & Aging Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Customer Concentration Risk (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-900">
                Customer Concentration Risk
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluates if working capital is disproportionately concentrated in a single buyer.
            </p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={concentrationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {concentrationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatINR(value), 'Outstanding']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            {concentrationData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                  <span className="font-sans font-medium text-slate-700 truncate max-w-[170px]">{c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{c.percent}%</span>
                  <span className="font-bold text-slate-900">{formatINR(c.value, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Receivables Aging & Historical Inflows (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Receivables Aging Analysis
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribution of current outstanding invoices across aging delinquency buckets.
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="bucket" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={val => formatINR(val, true)}
                />
                <Tooltip
                  formatter={(val: any) => [formatINR(val), 'Amount']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="amount" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Aging Risk Insight:</span>{' '}
              ₹4.4L of receivables are past the 60-day mark. Prompt notice dispatch under MSMED statutory limits is recommended.
            </div>
          </div>
        </div>
      </div>

      {/* 6-Month Cash Inflows vs Outflows Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-slate-900">
            6-Month Cash Inflows vs Fulfillment Expenses
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational cash collections compared against manufacturing outlays.
          </p>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlow6Months} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={val => formatINR(val, true)}
              />
              <Tooltip
                formatter={(val: any) => [formatINR(val)]}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="inflow" name="Inflow (Collections)" fill="#0f172a" radius={[3, 3, 0, 0]} barSize={20} />
              <Bar dataKey="outflow" name="Outflow (Fulfillment)" fill="#94a3b8" radius={[3, 3, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
