import React from 'react';
import {
  Bell,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecentAlerts: React.FC = () => {
  const { alerts, markAlertRead, viewCustomerProfile, viewDealDetails, setActiveView } = useApp();

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight">
            Recent Alerts
          </h2>
        </div>
        <span className="text-[11px] text-slate-400">Real-time risk telemetry</span>
      </div>

      <div className="divide-y divide-slate-100 mt-2">
        {alerts.slice(0, 4).map(alert => (
          <div
            key={alert.id}
            className="py-3 flex items-start justify-between gap-3 group hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">
                {alert.severity === 'danger' && (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                )}
                {alert.severity === 'warning' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                {alert.severity === 'success' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                )}
                {alert.severity === 'info' && (
                  <Wallet className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">{alert.title}</h4>
                  <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {alert.description}
                </p>
              </div>
            </div>

            {alert.actionLabel && (
              <button
                onClick={() => {
                  markAlertRead(alert.id);
                  if (alert.targetView === 'customers' && alert.targetId) {
                    viewCustomerProfile(alert.targetId);
                  } else if (alert.targetView === 'deals' && alert.targetId) {
                    viewDealDetails(alert.targetId);
                  } else if (alert.targetView) {
                    setActiveView(alert.targetView as any);
                  }
                }}
                className="text-xs font-medium text-slate-800 hover:text-slate-950 shrink-0 flex items-center gap-0.5 self-center cursor-pointer"
              >
                <span>{alert.actionLabel}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
