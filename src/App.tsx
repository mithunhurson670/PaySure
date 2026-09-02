import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { DecisionPromptBanner } from './components/dashboard/DecisionPromptBanner';
import { KPISnapshot } from './components/dashboard/KPISnapshot';
import { CashFlowSnapshot } from './components/dashboard/CashFlowSnapshot';
import { CollectionPriorities } from './components/dashboard/CollectionPriorities';
import { RecentAlerts } from './components/dashboard/RecentAlerts';
import { AnalyzeDealModal } from './components/deals/AnalyzeDealModal';
import { DetailedDealAnalysis } from './components/deals/DetailedDealAnalysis';
import { DealsList } from './components/deals/DealsList';
import { CustomersGrid } from './components/customers/CustomersGrid';
import { CustomerProfile } from './components/customers/CustomerProfile';
import { AddCustomerModal } from './components/customers/AddCustomerModal';
import { InvoicesPage } from './components/invoices/InvoicesPage';
import { PaymentsPage } from './components/payments/PaymentsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { FinancingPage } from './components/financing/FinancingPage';
import { LegalNoticesPage } from './components/legal/LegalNoticesPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { AuthContainer } from './components/auth/AuthContainer';

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in-50 duration-300">
      {/* 1. Decision Prompt Banner */}
      <DecisionPromptBanner />

      {/* 2. Four Headline KPI Cards */}
      <KPISnapshot />

      {/* 3. Cash Flow Snapshot (Interactive 3/6 Months Area Chart) */}
      <CashFlowSnapshot />

      {/* 4. Priorities & Live Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CollectionPriorities />
        </div>
        <div className="lg:col-span-5">
          <RecentAlerts />
        </div>
      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeView, toast } = useApp();
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Desktop Collapsible & Mobile Drawer Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopBar />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'deals' && <DealsList />}
          {activeView === 'deal-analysis' && <DetailedDealAnalysis />}
          {activeView === 'customers' && (
            <CustomersGrid onOpenAddCustomer={() => setIsAddCustomerOpen(true)} />
          )}
          {activeView === 'customer-profile' && <CustomerProfile />}
          {activeView === 'invoices' && <InvoicesPage />}
          {activeView === 'payments' && <PaymentsPage />}
          {(activeView === 'legal-notices' || activeView === 'collections') && <LegalNoticesPage />}
          {activeView === 'reports' && <ReportsPage />}
          {activeView === 'financing' && <FinancingPage />}
          {activeView === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800/80 shadow-rose-950/20'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800/80 shadow-amber-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AnalyzeDealModal />
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />
    </div>
  );
};

const AppRoot: React.FC = () => {
  const { isAuthenticated, toast } = useApp();

  return (
    <>
      {!isAuthenticated ? <AuthContainer /> : <MainContent />}

      {/* Global Toast Feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800/80 shadow-rose-950/20'
                : toast.type === 'warning'
                ? 'bg-amber-950 text-amber-100 border-amber-800/80 shadow-amber-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppRoot />
    </AppProvider>
  );
}
