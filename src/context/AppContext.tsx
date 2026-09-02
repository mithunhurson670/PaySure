import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Customer,
  Deal,
  Invoice,
  Payment,
  Dispute,
  Commitment,
  CustomerDocument,
  CollectionPriority,
  AlertNotification,
  BusinessSettings,
  DealRiskStatus,
  UserAccount,
} from '../types';
import {
  initialCustomers,
  initialDeals,
  initialInvoices,
  initialPayments,
  initialDisputes,
  initialCommitments,
  initialDocuments,
  initialCollectionPriorities,
  initialAlerts,
  initialBusinessSettings,
} from '../data/mockData';
import { analyzeDealSafety, formatINR } from '../utils/financialCalculations';
import { api } from '../services/api';

export type ActiveView =
  | 'dashboard'
  | 'deals'
  | 'customers'
  | 'customer-profile'
  | 'invoices'
  | 'payments'
  | 'legal-notices'
  | 'collections'
  | 'reports'
  | 'financing'
  | 'settings'
  | 'profile'
  | 'deal-analysis';

export type AuthView = 'login' | 'signup' | 'forgot-password' | 'business-registration';
export type CustomerSubTab =
  | 'overview'
  | 'orders'
  | 'payments'
  | 'issues'
  | 'activity';

export const initialUserAccount: UserAccount = {
  id: 'usr-001',
  ownerName: 'Ravi Sharma',
  email: 'ravi.sharma@sharmapack.in',
  phone: '+91 98201 44521',
  businessName: 'Sharma Packaging & Print Solutions',
  industry: 'Packaging & Industrial Printing MSME',
  businessType: 'Private Limited Company',
  currentAvailableCapital: 1240000,
  createdAt: '2025-01-10',
  lastLoginAt: '2026-09-01 07:15 AM',
  twoFactorEnabled: false,
  autoLockMinutes: 30,
  notificationPreferences: {
    emailAlerts: true,
    smsAlerts: true,
    cashRiskAlerts: true,
    weeklyDigest: true,
    msmeStatutoryAlerts: true,
  },
};

interface AppContextType {
  // Authentication State
  isAuthenticated: boolean;
  userAccount: UserAccount;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  login: (email: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  signup: (data: {
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    industry: string;
    businessType: string;
    availableWorkingCapital: number;
  }) => void;
  logout: () => void;
  resetPassword: (email: string, newPassword?: string) => { success: boolean; message: string };
  updateUserProfile: (data: Partial<UserAccount>) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  updateNotificationPreferences: (prefs: Partial<UserAccount['notificationPreferences']>) => void;
  updateSecuritySettings: (settings: { twoFactorEnabled?: boolean; autoLockMinutes?: number }) => void;

  // Navigation State
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedDealId: string | null;
  setSelectedDealId: (id: string | null) => void;
  selectedCustomerTab: CustomerSubTab;
  setSelectedCustomerTab: (tab: CustomerSubTab) => void;
  isAnalyzeModalOpen: boolean;
  setIsAnalyzeModalOpen: (open: boolean) => void;
  analyzeInitialData: {
    customerId?: string;
    orderValue?: number;
    advancePercent?: number;
    paymentPeriodDays?: number;
    fulfillmentCost?: number;
  } | null;
  openAnalyzeDeal: (data?: {
    customerId?: string;
    orderValue?: number;
    advancePercent?: number;
    paymentPeriodDays?: number;
    fulfillmentCost?: number;
  }) => void;

  // Data Store
  customers: Customer[];
  deals: Deal[];
  invoices: Invoice[];
  payments: Payment[];
  disputes: Dispute[];
  commitments: Commitment[];
  documents: CustomerDocument[];
  collectionPriorities: CollectionPriority[];
  alerts: AlertNotification[];
  businessSettings: BusinessSettings;

  // Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'healthScore' | 'totalBusiness' | 'totalPaid' | 'outstanding' | 'dueThisWeek' | 'overdueAmount' | 'underDisputeAmount' | 'averagePaymentDays' | 'paymentBehaviourStatus' | 'onTimePaymentRate' | 'latePaymentsCount' | 'activeDealsCount' | 'openDisputesCount' | 'missedCommitmentsCount' | 'currentExposure' | 'whyScoreReasons' | 'joinedDate'>) => Customer;
  addDeal: (deal: Omit<Deal, 'id' | 'dealNumber' | 'createdAt' | 'status' | 'workingCapitalGap' | 'advanceAmount' | 'remainingReceivable' | 'advanceCoveragePercent' | 'expectedMargin' | 'expectedMarginPercent' | 'riskStatus' | 'whyReasons'>) => Deal;
  addInvoice: (invoiceData: {
    customerId: string;
    customerName: string;
    totalAmount: number;
    paidAmount?: number;
    dueDate: string;
    notes?: string;
  }) => Invoice;
  acceptDeal: (dealId: string) => Promise<void>;
  restructureAndApplyDeal: (dealId: string, newAdvancePercent: number, newPaymentDays: number) => void;
  recordPayment: (payment: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentType: Payment['paymentType'];
    referenceNumber: string;
    notes?: string;
  }) => Promise<void>;
  resolveDispute: (disputeId: string, resolutionNotes: string) => void;
  addCommitment: (commitment: Omit<Commitment, 'id' | 'status'>) => void;
  markCommitmentHonoured: (commitmentId: string) => void;
  markAlertRead: (alertId: string) => void;
  updateBusinessSettings: (settings: Partial<BusinessSettings>) => void;

  // Helpers
  viewCustomerProfile: (customerId: string, defaultTab?: CustomerSubTab) => void;
  viewDealDetails: (dealId: string) => void;

  // Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Global search
  globalSearch: string;
  setGlobalSearch: (query: string) => void;

  // Sidebar State
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebarCollapse: () => void;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobileSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('paysure_is_authenticated');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [authView, setAuthView] = useState<AuthView>('login');

  // Multi-user persistent account registry
  const [registeredAccounts, setRegisteredAccounts] = useState<Array<UserAccount & { password?: string }>>(() => {
    const saved = localStorage.getItem('paysure_registered_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse registered accounts cache', e);
      }
    }
    return [
      {
        ...initialUserAccount,
        password: 'password123',
      },
    ];
  });

  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('paysure_user_account');
    return saved ? JSON.parse(saved) : initialUserAccount;
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>('cust-2');
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedCustomerTab, setSelectedCustomerTab] = useState<CustomerSubTab>('overview');
  const [isAnalyzeModalOpen, setIsAnalyzeModalOpen] = useState(false);
  const [analyzeInitialData, setAnalyzeInitialData] = useState<{
    customerId?: string;
    orderValue?: number;
    advancePercent?: number;
    paymentPeriodDays?: number;
    fulfillmentCost?: number;
  } | null>(null);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('paysure_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });
  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem('paysure_deals');
    return saved ? JSON.parse(saved) : initialDeals;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('paysure_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('paysure_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });
  const [disputes, setDisputes] = useState<Dispute[]>(() => {
    const saved = localStorage.getItem('paysure_disputes');
    return saved ? JSON.parse(saved) : initialDisputes;
  });
  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    const saved = localStorage.getItem('paysure_commitments');
    return saved ? JSON.parse(saved) : initialCommitments;
  });
  const [documents] = useState<CustomerDocument[]>(initialDocuments);
  const [collectionPriorities, setCollectionPriorities] = useState<CollectionPriority[]>(initialCollectionPriorities);
  const [alerts, setAlerts] = useState<AlertNotification[]>(initialAlerts);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(() => {
    const saved = localStorage.getItem('paysure_settings');
    return saved ? JSON.parse(saved) : initialBusinessSettings;
  });

  const [globalSearch, setGlobalSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('paysure_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Sync initial data from Express Backend on startup
  useEffect(() => {
    async function loadRemoteData() {
      try {
        const data = await api.getInitialData();
        if (data.customers && data.customers.length > 0) setCustomers(data.customers);
        if (data.deals && data.deals.length > 0) setDeals(data.deals);
        if (data.invoices && data.invoices.length > 0) setInvoices(data.invoices);
        if (data.payments && data.payments.length > 0) setPayments(data.payments);
      } catch (err) {
        console.warn('Express server not reachable yet. Using local state.', err);
      }
    }
    loadRemoteData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('paysure_registered_accounts', JSON.stringify(registeredAccounts));
  }, [registeredAccounts]);
  useEffect(() => {
    localStorage.setItem('paysure_is_authenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);
  useEffect(() => {
    localStorage.setItem('paysure_user_account', JSON.stringify(userAccount));
  }, [userAccount]);
  useEffect(() => {
    localStorage.setItem('paysure_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);
  useEffect(() => {
    localStorage.setItem('paysure_customers', JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem('paysure_deals', JSON.stringify(deals));
  }, [deals]);
  useEffect(() => {
    localStorage.setItem('paysure_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('paysure_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('paysure_disputes', JSON.stringify(disputes));
  }, [disputes]);
  useEffect(() => {
    localStorage.setItem('paysure_commitments', JSON.stringify(commitments));
  }, [commitments]);
  useEffect(() => {
    localStorage.setItem('paysure_settings', JSON.stringify(businessSettings));
  }, [businessSettings]);

  const toggleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const openAnalyzeDeal = (data?: {
    customerId?: string;
    orderValue?: number;
    advancePercent?: number;
    paymentPeriodDays?: number;
    fulfillmentCost?: number;
  }) => {
    setAnalyzeInitialData(data || null);
    setIsAnalyzeModalOpen(true);
  };

  const viewCustomerProfile = (customerId: string, defaultTab: CustomerSubTab = 'overview') => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerTab(defaultTab);
    setActiveView('customer-profile');
  };

  const viewDealDetails = (dealId: string) => {
    setSelectedDealId(dealId);
    setActiveView('deal-analysis');
  };

  // Add Customer (Optimistic UI + Express Backend sync)
  const addCustomer = (customerData: Omit<Customer, 'id' | 'healthScore' | 'totalBusiness' | 'totalPaid' | 'outstanding' | 'dueThisWeek' | 'overdueAmount' | 'underDisputeAmount' | 'averagePaymentDays' | 'paymentBehaviourStatus' | 'onTimePaymentRate' | 'latePaymentsCount' | 'activeDealsCount' | 'openDisputesCount' | 'missedCommitmentsCount' | 'currentExposure' | 'whyScoreReasons' | 'joinedDate'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      healthStatus: 'Healthy',
      healthScore: 85,
      totalBusiness: 0,
      totalPaid: 0,
      outstanding: 0,
      dueThisWeek: 0,
      overdueAmount: 0,
      underDisputeAmount: 0,
      averagePaymentDays: 30,
      paymentBehaviourStatus: 'Stable',
      onTimePaymentRate: 100,
      latePaymentsCount: 0,
      activeDealsCount: 0,
      openDisputesCount: 0,
      missedCommitmentsCount: 0,
      currentExposure: 0,
      whyScoreReasons: [
        { type: 'positive', text: 'New onboarded customer profile. Standard baseline 85 health rating.' }
      ],
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setCustomers(prev => [newCustomer, ...prev]);
    showToast(`Customer "${newCustomer.name}" added successfully!`);

    api.createCustomer(newCustomer).catch(err => console.error('Failed to sync customer with backend:', err));

    return newCustomer;
  };

  // Add Deal (Optimistic UI + Express Backend sync)
  const addDeal = (dealData: Omit<Deal, 'id' | 'dealNumber' | 'createdAt' | 'status' | 'workingCapitalGap' | 'advanceAmount' | 'remainingReceivable' | 'advanceCoveragePercent' | 'expectedMargin' | 'expectedMarginPercent' | 'riskStatus' | 'whyReasons'>): Deal => {
    const cust = customers.find(c => c.id === dealData.customerId);
    const analysis = analyzeDealSafety({
      orderValue: dealData.orderValue,
      advancePercent: dealData.advancePercent,
      paymentPeriodDays: dealData.paymentPeriodDays,
      estimatedFulfillmentCost: dealData.estimatedFulfillmentCost,
      availableWorkingCapital: dealData.availableWorkingCapital || businessSettings.currentAvailableCapital,
      customer: cust || null,
    });

    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      dealNumber: `DEAL-2026-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Analyzed',
      advanceAmount: analysis.advanceAmount,
      remainingReceivable: analysis.remainingReceivable,
      workingCapitalGap: analysis.workingCapitalGap,
      advanceCoveragePercent: analysis.advanceCoveragePercent,
      expectedMargin: analysis.expectedMargin,
      expectedMarginPercent: analysis.expectedMarginPercent,
      riskStatus: analysis.riskStatus,
      whyReasons: analysis.whyReasons,
      notes: dealData.notes || 'Analyzed via PaySure decision workflow.',
    };

    setDeals(prev => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
    showToast(`Deal ${newDeal.dealNumber} analyzed (${newDeal.riskStatus})!`);

    api.createDeal(newDeal).catch(err => console.error('Failed to sync deal with backend:', err));

    return newDeal;
  };

  const addInvoice = (data: {
    customerId: string;
    customerName: string;
    totalAmount: number;
    paidAmount?: number;
    dueDate: string;
    notes?: string;
  }): Invoice => {
    const paid = data.paidAmount || 0;
    const remaining = Math.max(0, data.totalAmount - paid);
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(300 + Math.random() * 700)}`,
      customerId: data.customerId,
      customerName: data.customerName,
      amount: data.totalAmount,
      paidAmount: paid,
      remainingAmount: remaining,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: data.dueDate,
      status: remaining === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Due',
      items: [
        {
          id: 'item-1',
          description: data.notes || 'Goods / Services fulfillment invoice',
          quantity: 1,
          unitRate: data.totalAmount,
          amount: data.totalAmount,
        },
      ],
      notes: data.notes,
    };
    setInvoices(prev => [newInv, ...prev]);
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === data.customerId) {
          const newOutstanding = c.outstanding + remaining;
          return {
            ...c,
            totalBusiness: c.totalBusiness + data.totalAmount,
            totalPaid: c.totalPaid + paid,
            outstanding: newOutstanding,
            currentExposure: newOutstanding,
          };
        }
        return c;
      })
    );
    showToast(`Invoice ${newInv.invoiceNumber} created successfully!`, 'success');
    return newInv;
  };

  // Accept Deal (Calls PATCH /api/deals/:id/accept in Express + Supabase)
  const acceptDeal = async (dealId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const invoiceId = `inv-${Date.now()}`;
    const invoiceNumber = `INV-2026-${Math.floor(200 + Math.random() * 800)}`;
    const paymentId = `pay-${Date.now()}`;
    const paymentRef = `ADV-${Math.floor(100000 + Math.random() * 900000)}`;

    const optimisticInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      dealId: deal.id,
      customerId: deal.customerId,
      customerName: deal.customerName,
      amount: deal.orderValue,
      paidAmount: deal.advanceAmount,
      remainingAmount: deal.remainingReceivable,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + deal.paymentPeriodDays * 86400000).toISOString().split('T')[0],
      status: deal.advanceAmount >= deal.orderValue ? 'Paid' : deal.advanceAmount > 0 ? 'Partial' : 'Due',
      items: [
        {
          id: 'item-1',
          description: `Order fulfillment supply as per contract ${deal.dealNumber}`,
          quantity: 1,
          unitRate: deal.orderValue,
          amount: deal.orderValue,
        },
      ],
      notes: `Generated upon deal acceptance. Advance received: ${formatINR(deal.advanceAmount, true)}.`,
    };

    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, status: 'Accepted', acceptedAt: new Date().toISOString().split('T')[0] } : d));
    setInvoices(prev => [optimisticInvoice, ...prev]);

    if (deal.advanceAmount > 0) {
      const advPayment: Payment = {
        id: paymentId,
        customerId: deal.customerId,
        customerName: deal.customerName,
        invoiceId: optimisticInvoice.id,
        invoiceNumber: optimisticInvoice.invoiceNumber,
        amount: deal.advanceAmount,
        date: new Date().toISOString().split('T')[0],
        paymentType: 'Advance Payment',
        referenceNumber: paymentRef,
        remainingBalanceAfter: deal.remainingReceivable,
        notes: `Upfront advance (${deal.advancePercent}%) collected.`,
      };
      setPayments(prev => [advPayment, ...prev]);
    }

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === deal.customerId) {
          const newOutstanding = c.outstanding + deal.remainingReceivable;
          return {
            ...c,
            totalBusiness: c.totalBusiness + deal.orderValue,
            totalPaid: c.totalPaid + deal.advanceAmount,
            outstanding: newOutstanding,
            currentExposure: newOutstanding,
            activeDealsCount: (c.activeDealsCount || 0) + 1,
          };
        }
        return c;
      })
    );

    if (deal.remainingReceivable > 0) {
      const commDate = new Date(Date.now() + deal.paymentPeriodDays * 86400000).toISOString().split('T')[0];
      const newComm: Commitment = {
        id: `comm-${Date.now()}`,
        customerId: deal.customerId,
        customerName: deal.customerName,
        invoiceId: optimisticInvoice.id,
        invoiceNumber: optimisticInvoice.invoiceNumber,
        amount: deal.remainingReceivable,
        promisedDate: commDate,
        status: 'Upcoming',
        notes: `Expected remaining settlement at ${deal.paymentPeriodDays} days credit maturity.`,
      };
      setCommitments(prev => [newComm, ...prev]);

      if ((api as any).createCommitment) {
        (api as any).createCommitment(newComm).catch((err: any) => console.warn('Backend commitment sync failed:', err));
      }
    }

    showToast(`Deal ${deal.dealNumber} accepted! Stored in database.`, 'success');

    try {
      const result = await api.acceptDeal(dealId);
      if (result.deal) {
        setDeals(prev => prev.map(d => (d.id === dealId ? result.deal : d)));
      }
      if (result.invoice) {
        setInvoices(prev => [result.invoice, ...prev.filter(i => i.id !== optimisticInvoice.id)]);
      }
      if (result.payment) {
        setPayments(prev => [result.payment, ...prev.filter(p => p.id !== paymentId)]);
      }
      if (result.customer) {
        setCustomers(prev => prev.map(c => (c.id === result.customer.id ? { ...result.customer, currentExposure: result.customer.outstanding ?? result.customer.current_exposure } : c)));
      }
    } catch (err) {
      console.warn('Backend accept-deal sync failed, preserved in local storage:', err);
    }
  };

  const restructureAndApplyDeal = (dealId: string, newAdvancePercent: number, newPaymentDays: number) => {
    setDeals(prev =>
      prev.map(d => {
        if (d.id === dealId) {
          const cust = customers.find(c => c.id === d.customerId);
          const analysis = analyzeDealSafety({
            orderValue: d.orderValue,
            advancePercent: newAdvancePercent,
            paymentPeriodDays: newPaymentDays,
            estimatedFulfillmentCost: d.estimatedFulfillmentCost,
            availableWorkingCapital: d.availableWorkingCapital,
            customer: cust || null,
          });
          return {
            ...d,
            advancePercent: newAdvancePercent,
            paymentPeriodDays: newPaymentDays,
            advanceAmount: analysis.advanceAmount,
            remainingReceivable: analysis.remainingReceivable,
            workingCapitalGap: analysis.workingCapitalGap,
            advanceCoveragePercent: analysis.advanceCoveragePercent,
            expectedMargin: analysis.expectedMargin,
            expectedMarginPercent: analysis.expectedMarginPercent,
            riskStatus: analysis.riskStatus,
            whyReasons: analysis.whyReasons,
            restructureApplied: true,
            notes: `Restructured to ${newAdvancePercent}% advance & ${newPaymentDays} days. Risk improved to ${analysis.riskStatus}.`,
          };
        }
        return d;
      })
    );
    showToast(`Deal successfully restructured to ${newAdvancePercent}% advance & ${newPaymentDays} days term!`, 'success');
  };

  // Record Payment (Calls POST /api/payments in Express + Supabase)
  const recordPayment = async (data: {
    customerId: string;
    invoiceId: string;
    amount: number;
    paymentType: Payment['paymentType'];
    referenceNumber: string;
    notes?: string;
  }) => {
    const inv = invoices.find(i => i.id === data.invoiceId);
    if (!inv) return;
    const newPaidAmount = inv.paidAmount + data.amount;
    const newRemaining = Math.max(0, inv.amount - newPaidAmount);
    const newStatus: Invoice['status'] = newRemaining === 0 ? 'Paid' : 'Partial';

    setInvoices(prev =>
      prev.map(i => {
        if (i.id === data.invoiceId) {
          return {
            ...i,
            paidAmount: newPaidAmount,
            remainingAmount: newRemaining,
            status: newStatus,
          };
        }
        return i;
      })
    );

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      customerId: data.customerId,
      customerName: inv.customerName,
      invoiceId: data.invoiceId,
      invoiceNumber: inv.invoiceNumber,
      amount: data.amount,
      date: new Date().toISOString().split('T')[0],
      paymentType: data.paymentType,
      referenceNumber: data.referenceNumber,
      remainingBalanceAfter: newRemaining,
      notes: data.notes,
    };
    setPayments(prev => [newPayment, ...prev]);

    setCustomers(prev =>
      prev.map(c => {
        if (c.id === data.customerId) {
          const updatedOutstanding = Math.max(0, c.outstanding - data.amount);
          return {
            ...c,
            totalPaid: c.totalPaid + data.amount,
            outstanding: updatedOutstanding,
            currentExposure: updatedOutstanding,
          };
        }
        return c;
      })
    );

    setBusinessSettings(prev => ({
      ...prev,
      currentAvailableCapital: prev.currentAvailableCapital + data.amount,
    }));

    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      type: 'payment_received',
      title: 'Payment Received',
      description: `${formatINR(data.amount, true)} received from ${inv.customerName} for ${inv.invoiceNumber}.`,
      timestamp: 'Just now',
      severity: 'success',
      actionLabel: 'View Receipt',
      targetView: 'payments',
      isRead: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    showToast(`Payment of ${formatINR(data.amount)} recorded for ${inv.invoiceNumber}!`, 'success');

    try {
      await api.recordPayment(data);
    } catch (err) {
      console.warn('Backend payment record failed, preserved in local storage:', err);
    }
  };

  const resolveDispute = (disputeId: string, resolutionNotes: string) => {
    setDisputes(prev =>
      prev.map(d => {
        if (d.id === disputeId) {
          return {
            ...d,
            status: 'Resolved',
            resolvedDate: new Date().toISOString().split('T')[0],
            resolutionNotes,
          };
        }
        return d;
      })
    );
    const dispute = disputes.find(d => d.id === disputeId);
    if (dispute) {
      setInvoices(prev =>
        prev.map(i => {
          if (i.id === dispute.invoiceId) {
            return {
              ...i,
              status: i.remainingAmount === 0 ? 'Paid' : 'Due',
            };
          }
          return i;
        })
      );
      setCustomers(prev =>
        prev.map(c => {
          if (c.id === dispute.customerId) {
            return {
              ...c,
              openDisputesCount: Math.max(0, c.openDisputesCount - 1),
              underDisputeAmount: Math.max(0, c.underDisputeAmount - dispute.amountAffected),
              healthStatus: c.openDisputesCount <= 1 ? 'Watch' : c.healthStatus,
            };
          }
          return c;
        })
      );
    }
    showToast('Dispute marked as resolved and payment unblocked!', 'success');
  };

  const addCommitment = (data: Omit<Commitment, 'id' | 'status'>) => {
    const newComm: Commitment = {
      ...data,
      id: `comm-${Date.now()}`,
      status: 'Upcoming',
    };
    setCommitments(prev => [newComm, ...prev]);
    showToast(`Payment promise of ${formatINR(data.amount, true)} recorded for ${data.promisedDate}.`, 'info');

    if ((api as any).createCommitment) {
      (api as any).createCommitment(newComm).catch((err: any) => console.warn('Backend commitment sync failed:', err));
    }
  };

  const markCommitmentHonoured = (commitmentId: string) => {
    setCommitments(prev =>
      prev.map(c => {
        if (c.id === commitmentId) {
          return {
            ...c,
            status: 'Honoured',
            actualPaymentDate: new Date().toISOString().split('T')[0],
          };
        }
        return c;
      })
    );
    showToast('Payment commitment marked as honoured!', 'success');
  };

  const markAlertRead = (alertId: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  const updateBusinessSettings = (settings: Partial<BusinessSettings>) => {
    setBusinessSettings(prev => ({ ...prev, ...settings }));
    showToast('Business settings updated successfully!', 'success');
  };

  // Login: Resolves account by email from the multi-account registry
  const login = (email: string, password: string, rememberMe = true) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, error: 'Please provide both email and password.' };
    }

    const matched = registeredAccounts.find(
      acc => acc.email.trim().toLowerCase() === cleanEmail
    );

    if (!matched) {
      return {
        success: false,
        error: 'No account found with this email. Please check your credentials or register a new business.',
      };
    }

    if (matched.password && matched.password !== cleanPassword) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedAccount: UserAccount = {
      ...matched,
      lastLoginAt: nowStr,
    };

    setUserAccount(updatedAccount);

    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === matched.id ? { ...acc, lastLoginAt: nowStr } : acc))
    );

    setBusinessSettings(prev => ({
      ...prev,
      businessName: matched.businessName || prev.businessName,
      ownerName: matched.ownerName || prev.ownerName,
      email: matched.email || prev.email,
      phone: matched.phone || prev.phone,
      industry: matched.industry || prev.industry,
      businessType: matched.businessType || prev.businessType,
      currentAvailableCapital: matched.currentAvailableCapital ?? prev.currentAvailableCapital,
    }));

    setIsAuthenticated(true);
    setActiveView('dashboard');
    showToast(`Welcome back, ${matched.ownerName}!`, 'success');
    return { success: true };
  };

  // Signup: Saves new account to registry without overwriting other users
  const signup = (data: {
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    industry: string;
    businessType: string;
    availableWorkingCapital: number;
  }) => {
    const nowStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const cleanEmail = data.email.trim().toLowerCase();

    const newAcc: UserAccount & { password?: string } = {
      id: `usr-${Date.now()}`,
      ownerName: data.ownerName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      password: data.password.trim(),
      businessName: data.businessName.trim(),
      industry: data.industry,
      businessType: data.businessType,
      currentAvailableCapital: data.availableWorkingCapital || 500000,
      createdAt: new Date().toISOString().split('T')[0],
      lastLoginAt: nowStr,
      twoFactorEnabled: false,
      autoLockMinutes: 30,
      notificationPreferences: {
        emailAlerts: true,
        smsAlerts: true,
        cashRiskAlerts: true,
        weeklyDigest: true,
        msmeStatutoryAlerts: true,
      },
    };

    setRegisteredAccounts(prev => {
      const filtered = prev.filter(acc => acc.email.trim().toLowerCase() !== cleanEmail);
      return [...filtered, newAcc];
    });

    setUserAccount(newAcc);

    setBusinessSettings(prev => ({
      ...prev,
      businessName: data.businessName.trim(),
      ownerName: data.ownerName.trim(),
      email: cleanEmail,
      phone: data.phone.trim(),
      industry: data.industry,
      businessType: data.businessType,
      currentAvailableCapital: data.availableWorkingCapital || 500000,
    }));

    setIsAuthenticated(true);
    setActiveView('dashboard');
    showToast(`Welcome to PaySure, ${data.ownerName}! Your business account has been registered.`, 'success');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthView('login');
    showToast('You have been logged out of PaySure.', 'info');
  };

  const resetPassword = (email: string) => {
    if (!email.trim()) {
      return { success: false, message: 'Please enter a valid email address.' };
    }
    showToast(`Password reset link sent to ${email}.`, 'success');
    return { success: true, message: `Instructions sent to ${email}` };
  };

  const updateUserProfile = (data: Partial<UserAccount>) => {
    setUserAccount(prev => {
      const updated = { ...prev, ...data };
      setRegisteredAccounts(all =>
        all.map(acc => (acc.id === updated.id ? { ...acc, ...updated } : acc))
      );
      return updated;
    });

    setBusinessSettings(prev => ({
      ...prev,
      ...(data.businessName ? { businessName: data.businessName } : {}),
      ...(data.ownerName ? { ownerName: data.ownerName } : {}),
      ...(data.email ? { email: data.email } : {}),
      ...(data.phone ? { phone: data.phone } : {}),
      ...(data.industry ? { industry: data.industry } : {}),
      ...(data.businessType ? { businessType: data.businessType } : {}),
      ...(data.currentAvailableCapital !== undefined ? { currentAvailableCapital: data.currentAvailableCapital } : {}),
    }));

    showToast('Profile & Business details updated successfully!', 'success');
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentPassword) {
      return { success: false, message: 'Please enter your current password.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }

    const currentAccount = registeredAccounts.find(acc => acc.id === userAccount.id);
    if (currentAccount?.password && currentAccount.password !== currentPassword) {
      return { success: false, message: 'Current password does not match our records.' };
    }

    setRegisteredAccounts(prev =>
      prev.map(acc => (acc.id === userAccount.id ? { ...acc, password: newPassword } : acc))
    );

    showToast('Your password has been changed securely.', 'success');
    return { success: true, message: 'Password changed successfully.' };
  };

  const updateNotificationPreferences = (prefs: Partial<UserAccount['notificationPreferences']>) => {
    setUserAccount(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        ...prefs,
      },
    }));
    showToast('Notification preferences updated.', 'success');
  };

  const updateSecuritySettings = (settings: { twoFactorEnabled?: boolean; autoLockMinutes?: number }) => {
    setUserAccount(prev => ({
      ...prev,
      ...(settings.twoFactorEnabled !== undefined ? { twoFactorEnabled: settings.twoFactorEnabled } : {}),
      ...(settings.autoLockMinutes !== undefined ? { autoLockMinutes: settings.autoLockMinutes } : {}),
    }));
    showToast('Security settings updated.', 'success');
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      userAccount,
      authView,
      setAuthView,
      login,
      signup,
      logout,
      resetPassword,
      updateUserProfile,
      changePassword,
      updateNotificationPreferences,
      updateSecuritySettings,
      activeView,
      setActiveView,
      selectedCustomerId,
      setSelectedCustomerId,
      selectedDealId,
      setSelectedDealId,
      selectedCustomerTab,
      setSelectedCustomerTab,
      isAnalyzeModalOpen,
      setIsAnalyzeModalOpen,
      analyzeInitialData,
      openAnalyzeDeal,
      customers,
      deals,
      invoices,
      payments,
      disputes,
      commitments,
      documents,
      collectionPriorities,
      alerts,
      businessSettings,
      addCustomer,
      addDeal,
      addInvoice,
      acceptDeal,
      restructureAndApplyDeal,
      recordPayment,
      resolveDispute,
      addCommitment,
      markCommitmentHonoured,
      markAlertRead,
      updateBusinessSettings,
      viewCustomerProfile,
      viewDealDetails,
      toast,
      showToast,
      globalSearch,
      setGlobalSearch,
      isSidebarCollapsed,
      setIsSidebarCollapsed,
      toggleSidebarCollapse,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      toggleMobileSidebar,
    }),
    [
      isAuthenticated,
      userAccount,
      registeredAccounts,
      authView,
      activeView,
      selectedCustomerId,
      selectedDealId,
      selectedCustomerTab,
      isAnalyzeModalOpen,
      analyzeInitialData,
      customers,
      deals,
      invoices,
      payments,
      disputes,
      commitments,
      documents,
      collectionPriorities,
      alerts,
      businessSettings,
      toast,
      globalSearch,
      isSidebarCollapsed,
      isMobileSidebarOpen,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};