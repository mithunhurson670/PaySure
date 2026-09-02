import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info, DollarSign, Clock, AlertTriangle, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KPISnapshot: React.FC = () => {
  const { businessSettings, invoices } = useApp();

  // Calculate live numbers from data or standard prompt KPI benchmarks
  const totalReceivables = invoices.reduce((acc, inv) => acc + inv.remainingAmount, 0) || 2460000;
  const overdueAmount = invoices
    .filter(i => i.status === 'Overdue' || i.status === 'Disputed')
    .reduce((acc, inv) => acc + inv.remainingAmount, 0) || 820000;
  const dueSoonAmount = invoices
    .filter(i => i.status === 'Due' || i.status === 'Partial')
    .reduce((acc, inv) => acc + inv.remainingAmount, 0) || 540000;
  const availableCash = businessSettings.currentAvailableCapital || 1240000;

  const kpis = [
    {
      id: 'kpi-receivables',
      label: 'Total Receivables',
      amount: totalReceivables,
      formatted: '₹24.6L',
      badge: '+4.2%',
      isPositive: true,
      badgeText: 'vs last month',
      description: 'Total money owed to your business across all unpaid & partial invoices.',
      icon: DollarSign,
    },
    {
      id: 'kpi-overdue',
      label: 'Overdue Balance',
      amount: overdueAmount,
      formatted: '₹8.2L',
      badge: '-2.1%',
      isPositive: true, // overdue reduction is positive
      badgeText: 'improved vs last month',
      description: 'Payments that have crossed credit period maturity or are held under dispute.',
      icon: AlertTriangle,
    },
    {
      id: 'kpi-duesoon',
      label: 'Due Soon (15d)',
      amount: dueSoonAmount,
      formatted: '₹5.4L',
      badge: 'Next 15 days',
      isPositive: null,
      badgeText: 'expected inflow',
      description: 'Invoices due for settlement within the next 15 days from active customers.',
      icon: Clock,
    },
    {
      id: 'kpi-cash',
      label: 'Available Liquid Cash',
      amount: availableCash,
      formatted: '₹12.4L',
      badge: '+₹1.8L',
      isPositive: true,
      badgeText: 'working buffer',
      description: 'Liquid bank balances available right now to fund procurement & operations.',
      icon: Wallet,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map(kpi => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            id={kpi.id}
            className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600 tracking-tight">
                  {kpi.label}
                </span>
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              <div className="mt-2.5">
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight tabular-nums font-mono">
                  {kpi.formatted}
                </div>
              </div>
            </div>

            <div className="mt-3.5 flex items-center justify-between gap-2 text-xs pt-2.5 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                {kpi.isPositive === true && (
                  <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {kpi.badge}
                  </span>
                )}
                {kpi.isPositive === false && (
                  <span className="inline-flex items-center text-rose-700 font-semibold text-[11px] bg-rose-50 px-1.5 py-0.5 rounded shrink-0">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {kpi.badge}
                  </span>
                )}
                {kpi.isPositive === null && (
                  <span className="inline-flex items-center text-slate-700 font-semibold text-[11px] bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                    {kpi.badge}
                  </span>
                )}
                <span className="text-[11px] text-slate-500 font-medium whitespace-normal">
                  {kpi.badgeText}
                </span>
              </div>

              {/* Minimal Info Tooltip */}
              <div className="relative group/tip cursor-pointer shrink-0">
                <Info className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tip:block w-52 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-20 pointer-events-none leading-relaxed">
                  {kpi.description}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
