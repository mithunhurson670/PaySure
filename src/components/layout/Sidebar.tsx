import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Landmark,
  Settings,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  LogOut,
  User,
} from 'lucide-react';
import { useApp, ActiveView } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const {
    activeView,
    setActiveView,
    alerts,
    businessSettings,
    userAccount,
    logout,
    deals,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
  } = useApp();

  const isMobileOpen = propIsOpen !== undefined ? propIsOpen : isMobileSidebarOpen;
  const handleCloseMobile = propOnClose !== undefined ? propOnClose : () => setIsMobileSidebarOpen(false);

  const highRiskDeals = deals.filter(d => d.riskStatus === 'High Risk' && d.status === 'Analyzed').length;

  const currentOwner = userAccount?.ownerName || businessSettings.ownerName || 'Ravi Sharma';
  const currentBusiness = userAccount?.businessName || businessSettings.businessName || 'Sharma Packaging';
  const userInitials = currentOwner
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RS';

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'deals',
      label: 'Deals',
      icon: Briefcase,
      badge: highRiskDeals > 0 ? highRiskDeals : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    {
      id: 'legal-notices',
      label: 'Legal Notices',
      icon: Scale,
      badge: 'MSMED',
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    {
      id: 'financing',
      label: 'Financing',
      icon: Landmark,
      badge: 'Gap Bridge',
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id: ActiveView) => {
    setActiveView(id);
    handleCloseMobile();
  };

  const renderNavList = (isCollapsed: boolean) => (
    <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-thin">
      {!isCollapsed && (
        <div className="px-3 mb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
          Main Navigation
        </div>
      )}
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive =
          activeView === item.id ||
          (item.id === 'customers' && activeView === 'customer-profile') ||
          (item.id === 'deals' && activeView === 'deal-analysis');

        return (
          <div key={item.id} className="relative group">
            <button
              id={`nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
              } py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#0d1527]" />
              )}
            </button>

            {/* Tooltip for collapsed mode on desktop */}
            {isCollapsed && (
              <div className="hidden lg:group-hover:flex absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap pointer-events-none items-center gap-1.5 animate-in fade-in-50 zoom-in-95">
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded font-normal">
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. MOBILE OVERLAY DRAWER (< lg)                                */}
      {/* ------------------------------------------------------------- */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseMobile}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        id="app-sidebar-mobile"
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-[#0d1527] text-slate-300 flex flex-col border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        {/* Mobile Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">PaySure</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  MSME
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Smart Decisions. Safe Business.</p>
            </div>
          </div>

          <button
            id="btn-close-sidebar-mobile"
            onClick={handleCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Capital Guard Active Tag */}
        <div className="px-4 pt-3 pb-1">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold text-emerald-400">Capital Guard Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Buffer: {formatINR(businessSettings.currentAvailableCapital, true)} liquid
            </p>
          </div>
        </div>

        {/* Navigation */}
        {renderNavList(false)}

        {/* Mobile Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0a101f]">
          <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-200 font-bold text-xs shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{currentOwner}</div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span className="truncate">{currentBusiness}</span>
                </div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
              <button
                onClick={() => handleNavClick('settings')}
                className="hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <Settings className="w-3 h-3" />
                <span>Account</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => {
                  handleCloseMobile();
                  window.dispatchEvent(new CustomEvent('open-help-guide'));
                }}
                className="hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Help</span>
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => {
                  handleCloseMobile();
                  logout();
                }}
                className="hover:text-rose-400 text-rose-400/80 transition-colors flex items-center gap-1 cursor-pointer"
                title="Log Out of PaySure"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* 2. DESKTOP COLLAPSIBLE SIDEBAR (>= lg)                        */}
      {/* ------------------------------------------------------------- */}
      <aside
        id="app-sidebar-desktop"
        className={`hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-30 bg-[#0d1527] text-slate-300 border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Brand Header */}
        <div className={`border-b border-slate-800/80 ${isSidebarCollapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4'}`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-200 font-bold shrink-0">
                <ShieldCheck className="w-4 h-4 text-slate-200" />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-white tracking-tight truncate">PaySure</span>
                    <span className="text-[9px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      MSME
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate">
                    Financial Decision Engine
                  </p>
                </div>
              )}
            </div>

            {/* Collapse toggle button */}
            <button
              id="btn-toggle-sidebar"
              onClick={toggleSidebarCollapse}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer ${
                isSidebarCollapsed ? 'mt-1' : ''
              }`}
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Decision Tagline Box (Only when expanded) */}
          {!isSidebarCollapsed && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 animate-in fade-in-50">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold text-[11px]">Capital Guard Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Buffer: {formatINR(businessSettings.currentAvailableCapital, true)} liquid
              </p>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        {renderNavList(isSidebarCollapsed)}

        {/* Bottom User & Business Profile */}
        <div className="p-2.5 border-t border-slate-800/80 bg-[#0a101f]">
          {isSidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <button
                onClick={() => handleNavClick('settings')}
                className="w-9 h-9 rounded-xl bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-200 font-bold text-xs hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer"
                title={`${currentOwner} (${currentBusiness}) - View Profile`}
              >
                {userInitials}
              </button>
              <button
                onClick={logout}
                className="p-2 text-rose-400/80 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div
                onClick={() => handleNavClick('settings')}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-900/60 border border-indigo-700/50 flex items-center justify-center text-indigo-200 font-bold text-xs shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{currentOwner}</div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{currentBusiness}</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/40 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  onClick={() => handleNavClick('settings')}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>Account</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-help-guide'))}
                  className="hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Help</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={logout}
                  className="hover:text-rose-400 text-rose-400/80 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
