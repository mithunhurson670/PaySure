import React, { useState } from 'react';
import {
  AlertCircle,
  Clock,
  ArrowRight,
  Send,
  PhoneCall,
  CreditCard,
  MessageSquare,
  ShieldAlert,
  Check,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CollectionPriority } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

export const CollectionPriorities: React.FC = () => {
  const {
    collectionPriorities,
    viewCustomerProfile,
    showToast,
    recordPayment,
    invoices,
    setActiveView,
  } = useApp();

  const [activeActionModal, setActiveActionModal] = useState<CollectionPriority | null>(null);
  const [whatsappSent, setWhatsappSent] = useState<string | null>(null);

  const handleTakeAction = (item: CollectionPriority) => {
    setActiveActionModal(item);
  };

  const handleSendReminder = (item: CollectionPriority) => {
    setWhatsappSent(item.id);
    showToast(`Payment reminder & statement dispatched to ${item.customerName}!`, 'success');
    setTimeout(() => {
      setWhatsappSent(null);
      setActiveActionModal(null);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            Top Collection Priorities
          </h2>
          <p className="text-xs text-slate-500">
            Ranked by overdue days, payment commitment breaches, and customer risk.
          </p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200">
          {collectionPriorities.length} Action Items
        </span>
      </div>

      {/* Priority List */}
      <div className="divide-y divide-slate-100 mt-2">
        {collectionPriorities.map(item => (
          <div
            key={item.id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {item.urgency === 'High' && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                )}
                {item.urgency === 'Medium' && (
                  <span className="inline-flex rounded-full h-2 w-2 bg-amber-500 mt-0.5"></span>
                )}
                {item.urgency === 'Low' && (
                  <span className="inline-flex rounded-full h-2 w-2 bg-slate-400 mt-0.5"></span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => viewCustomerProfile(item.customerId)}
                    className="font-semibold text-xs text-slate-900 hover:text-slate-700 cursor-pointer"
                  >
                    {item.customerName}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                      item.urgency === 'High'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.urgency === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.riskLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                  <span className="font-mono font-medium text-slate-800 text-xs">
                    {formatINR(item.amount, true)}
                  </span>
                  <span>•</span>
                  <span className="text-slate-600 line-clamp-1">{item.primaryIssue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => handleTakeAction(item)}
                className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-medium rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Drawer Modal */}
      {activeActionModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 shadow-xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-sm text-slate-900">
                  Collection Action: {activeActionModal.customerName}
                </h3>
              </div>
              <button
                onClick={() => setActiveActionModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Amount Due / Blocked:</span>
                  <span className="font-bold text-slate-900 text-xs">
                    {formatINR(activeActionModal.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Root Cause:</span>
                  <span className="font-sans font-medium text-slate-800 text-right">
                    {activeActionModal.primaryIssue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Customer Health Score:</span>
                  <span className="font-bold text-amber-700">
                    {activeActionModal.customerHealthScore}/100
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1">PaySure Recommended Next Step:</div>
                <p className="text-slate-700">{activeActionModal.suggestedAction}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSendReminder(activeActionModal)}
                disabled={whatsappSent === activeActionModal.id}
                className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
              >
                {whatsappSent === activeActionModal.id ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Statement Sent Successfully!</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Payment Notice & Statement</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const custId = activeActionModal.customerId;
                    setActiveActionModal(null);
                    viewCustomerProfile(custId, 'overview');
                  }}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <PhoneCall className="w-3 h-3 text-slate-400" />
                  <span>360° Profile</span>
                </button>

                <button
                  onClick={() => {
                    setActiveActionModal(null);
                    setActiveView('legal-notices');
                  }}
                  className="py-1.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Scale className="w-3 h-3 text-rose-600" />
                  <span>MSMED Legal Notice</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
