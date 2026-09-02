import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowRight,
  Clock,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

export const CustomersGrid: React.FC<{ onOpenAddCustomer: () => void }> = ({
  onOpenAddCustomer,
}) => {
  const { customers, viewCustomerProfile } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCustomers = customers.filter(customer => {
    if (filterStatus !== 'all' && customer.healthStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.category.toLowerCase().includes(q) ||
        customer.contactPerson.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Customers', count: customers.length },
    { id: 'Healthy', label: '🟢 Healthy', count: customers.filter(c => c.healthStatus === 'Healthy').length },
    { id: 'Watch', label: '🟠 Watch', count: customers.filter(c => c.healthStatus === 'Watch').length },
    { id: 'Attention', label: '🔴 Attention', count: customers.filter(c => c.healthStatus === 'Attention').length },
    { id: 'Dispute', label: '🔴 Dispute', count: customers.filter(c => c.healthStatus === 'Dispute').length },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Customer Credit & Health Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor client reliability, payment velocities, outstanding balances, and historical credit risk.
          </p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="self-start sm:self-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-medium text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
            placeholder="Search by customer name, contact..."
            className="w-full bg-slate-50 text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(customer => {
          const isHealthy = customer.healthStatus === 'Healthy';
          const isWatch = customer.healthStatus === 'Watch';

          return (
            <div
              key={customer.id}
              onClick={() => viewCustomerProfile(customer.id)}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              {/* Top Card Row */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                      <Building2 className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-slate-900 group-hover:text-slate-700 transition-colors leading-snug">
                        {customer.name}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {customer.category}
                      </span>
                    </div>
                  </div>

                  {/* Health Badge */}
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded shrink-0 ${
                      isHealthy
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isWatch
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isHealthy && '🟢 Healthy'}
                    {isWatch && '🟠 Watch'}
                    {!isHealthy && !isWatch && '🔴 Attention'}
                  </span>
                </div>

                {/* 4 Core Financial Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs font-mono">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-sans font-medium">
                      Total Business
                    </span>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {formatINR(customer.totalBusiness, true)}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-sans font-medium">
                      Outstanding
                    </span>
                    <div className={`font-bold mt-0.5 ${customer.outstanding > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                      {formatINR(customer.outstanding, true)}
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-sans font-medium">
                      Avg Clearance
                    </span>
                    <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{customer.averagePaymentDays}d</span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 text-[10px] uppercase font-sans font-medium">
                      Health Score
                    </span>
                    <div className="font-bold mt-0.5 flex items-center gap-1">
                      <span
                        className={
                          customer.healthScore >= 85
                            ? 'text-emerald-700'
                            : customer.healthScore >= 70
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {customer.healthScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Specific Risk or Dispute Alert Flag */}
                {(customer.openDisputesCount > 0 || customer.missedCommitmentsCount > 0) && (
                  <div className="mt-2.5 p-2 bg-rose-50/70 rounded-lg border border-rose-200 text-[11px] text-rose-700 font-medium flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>
                      {customer.openDisputesCount > 0
                        ? `${customer.openDisputesCount} Active Dispute (${formatINR(customer.underDisputeAmount, true)})`
                        : `${customer.missedCommitmentsCount} Missed Commitments`}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px] truncate max-w-[170px]">
                  {customer.contactPerson}
                </span>
                <span className="font-medium text-slate-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-xs">
                  <span>360° Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
