import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

export const DealsList: React.FC = () => {
  const { deals, openAnalyzeDeal, viewDealDetails } = useApp();
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredDeals = deals.filter(deal => {
    // Risk/status filter
    if (filterRisk === 'Safe' && deal.riskStatus !== 'Safe') return false;
    if (filterRisk === 'Conditional' && deal.riskStatus !== 'Conditional') return false;
    if (filterRisk === 'High Risk' && deal.riskStatus !== 'High Risk') return false;
    if (filterRisk === 'Accepted' && deal.status !== 'Accepted' && deal.status !== 'In Fulfillment') return false;
    if (filterRisk === 'Completed' && deal.status !== 'Completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        deal.dealNumber.toLowerCase().includes(q) ||
        deal.customerName.toLowerCase().includes(q) ||
        (deal.notes && deal.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Deals', count: deals.length },
    { id: 'Safe', label: '🟢 Safe', count: deals.filter(d => d.riskStatus === 'Safe').length },
    { id: 'Conditional', label: '🟠 Caution', count: deals.filter(d => d.riskStatus === 'Conditional').length },
    { id: 'High Risk', label: '🔴 High Risk', count: deals.filter(d => d.riskStatus === 'High Risk').length },
    { id: 'Accepted', label: 'Accepted', count: deals.filter(d => d.status === 'Accepted' || d.status === 'In Fulfillment').length },
    { id: 'Completed', label: 'Completed', count: deals.filter(d => d.status === 'Completed').length },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Deals & Order Safety Register
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer order proposals, advance ratios, working-capital exposure, and safety statuses.
          </p>
        </div>

        <button
          onClick={() => openAnalyzeDeal()}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Analyze New Deal</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRisk(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterRisk === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterRisk === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search deals, customer..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Deal & Customer</th>
                <th className="py-3 px-4">Order Value</th>
                <th className="py-3 px-4">Advance Upfront</th>
                <th className="py-3 px-4">Fulfillment Cost</th>
                <th className="py-3 px-4">Receivable</th>
                <th className="py-3 px-4">Payment Terms</th>
                <th className="py-3 px-4">Capital Gap</th>
                <th className="py-3 px-4">Risk Verdict</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No deals match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredDeals.map(deal => (
                  <tr
                    key={deal.id}
                    onClick={() => viewDealDetails(deal.id)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-slate-700">
                        {deal.dealNumber}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {deal.customerName}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                      {formatINR(deal.orderValue)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 font-mono">
                        {formatINR(deal.advanceAmount, true)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans">({deal.advancePercent}% Adv)</div>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {formatINR(deal.estimatedFulfillmentCost, true)}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {formatINR(deal.remainingReceivable, true)}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-700">
                      {deal.paymentPeriodDays} Days
                    </td>

                    <td className="py-3 px-4 font-mono">
                      {deal.workingCapitalGap > 0 ? (
                        <span className="font-medium text-amber-700">
                          {formatINR(deal.workingCapitalGap, true)}
                        </span>
                      ) : (
                        <span className="text-emerald-700">₹0</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
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
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                        {deal.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          viewDealDetails(deal.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
