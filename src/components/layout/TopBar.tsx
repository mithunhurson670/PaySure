import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Menu,
  X,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  Briefcase,
  CreditCard,
  Building,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/financialCalculations';

export const TopBar: React.FC<{ onOpenMobileMenu?: () => void }> = ({ onOpenMobileMenu }) => {
  const {
    alerts,
    markAlertRead,
    customers,
    deals,
    invoices,
    payments,
    viewCustomerProfile,
    viewDealDetails,
    setActiveView,
    businessSettings,
    toggleMobileSidebar,
    isSidebarCollapsed,
    toggleSidebarCollapse,
  } = useApp();

  const handleMobileMenuClick = onOpenMobileMenu || toggleMobileSidebar;

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadAlerts = alerts.filter(a => !a.isRead);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter global search results
  const filteredCustomers = searchQuery.trim()
    ? customers.filter(
        c =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredDeals = searchQuery.trim()
    ? deals.filter(
        d =>
          d.dealNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const filteredInvoices = searchQuery.trim()
    ? invoices.filter(
        i =>
          i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const totalResults =
    filteredCustomers.length + filteredDeals.length + filteredInvoices.length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            id="btn-mobile-menu"
            onClick={handleMobileMenuClick}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Box */}
          <div ref={searchRef} className="relative flex-1">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                id="global-search-input"
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search customers, deals, invoices, payments..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-sm pl-9 pr-8 py-2 rounded-lg border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Dropdown */}
            {isSearchOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                {totalResults === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No matching records found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCustomers.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3 h-3" /> Customers
                        </div>
                        {filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            onClick={() => {
                              viewCustomerProfile(c.id);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs"
                          >
                            <span className="font-semibold text-slate-800">{c.name}</span>
                            <span className="text-slate-500">Outstanding: {formatINR(c.outstanding, true)}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredDeals.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3" /> Deals
                        </div>
                        {filteredDeals.map(d => (
                          <button
                            key={d.id}
                            onClick={() => {
                              viewDealDetails(d.id);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{d.dealNumber}</span>
                              <span className="text-slate-500 ml-2">({d.customerName})</span>
                            </div>
                            <span className="font-medium text-blue-600">{formatINR(d.orderValue, true)}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {filteredInvoices.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Invoices
                        </div>
                        {filteredInvoices.map(i => (
                          <button
                            key={i.id}
                            onClick={() => {
                              setActiveView('invoices');
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{i.invoiceNumber}</span>
                              <span className="text-slate-500 ml-2">({i.customerName})</span>
                            </div>
                            <span className="text-slate-600">{formatINR(i.remainingAmount, true)} remaining</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Working Capital Badge, Notifications, Help & Primary Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick Capital Buffer Pill (Desktop) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200/80 rounded-lg text-xs">
            <span className="text-slate-500">Available Cash:</span>
            <span className="font-bold text-slate-800">
              {formatINR(businessSettings.currentAvailableCapital, true)}
            </span>
          </div>

          {/* Help & Guide */}
          <button
            id="btn-help-guide"
            onClick={() => {
              const event = new CustomEvent('open-help-guide');
              window.dispatchEvent(event);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="PaySure Decision Guide & MSME Financial Safety Rules"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications Dropdown */}
          <div ref={notifRef} className="relative">
            <button
              id="btn-notifications"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadAlerts.length > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadAlerts.length} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      alerts.forEach(a => markAlertRead(a.id));
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 mt-1">
                  {alerts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    alerts.slice(0, 5).map(alert => (
                      <div
                        key={alert.id}
                        onClick={() => {
                          markAlertRead(alert.id);
                          if (alert.targetView === 'customers' && alert.targetId) {
                            viewCustomerProfile(alert.targetId);
                          } else if (alert.targetView === 'deals' && alert.targetId) {
                            viewDealDetails(alert.targetId);
                          } else if (alert.targetView) {
                            setActiveView(alert.targetView as any);
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className={`p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors ${
                          !alert.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span
                              className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                alert.severity === 'danger'
                                  ? 'bg-rose-500'
                                  : alert.severity === 'warning'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-800">
                                {alert.title}
                              </div>
                              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                                {alert.description}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                                <span>{alert.timestamp}</span>
                                {alert.actionLabel && (
                                  <span className="font-semibold text-blue-600 hover:underline">
                                    {alert.actionLabel} →
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
