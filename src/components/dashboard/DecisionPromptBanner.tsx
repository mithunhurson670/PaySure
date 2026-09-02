import React from 'react';
import { Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DecisionPromptBanner: React.FC = () => {
  const { openAnalyzeDeal, setActiveView } = useApp();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-200/80 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Working Capital & Receivables Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time cash flow monitoring, order capital risk assessment, and MSME receivables tracking.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => setActiveView('deals')}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Deals Register
        </button>
        <button
          id="btn-banner-analyze"
          onClick={() => openAnalyzeDeal()}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Analyze New Deal</span>
        </button>
      </div>
    </div>
  );
};
