export type HealthStatus = 'Healthy' | 'Watch' | 'Attention' | 'Dispute';
export type DealRiskStatus = 'Safe' | 'Conditional' | 'High Risk';
export type DealWorkflowStatus = 'Analyzed' | 'Accepted' | 'In Fulfillment' | 'Completed' | 'Rejected';
export type InvoiceStatus = 'Paid' | 'Partial' | 'Due' | 'Overdue' | 'Disputed';
export type CommitmentStatus = 'Upcoming' | 'Missed' | 'Honoured';
export type DisputeStatus = 'Under Review' | 'Pending Action' | 'Resolved';

export interface Customer {
  id: string;
  name: string;
  category: 'Wholesale' | 'Corporate' | 'Retail' | 'Manufacturing' | 'Hospitality';
  healthStatus: HealthStatus;
  healthScore: number; // 0 - 100
  totalBusiness: number; // in INR
  totalPaid: number; // in INR
  outstanding: number; // in INR
  dueThisWeek: number; // in INR
  overdueAmount: number; // in INR
  underDisputeAmount: number; // in INR
  averagePaymentDays: number;
  paymentBehaviourStatus: 'Improving' | 'Stable' | 'Delayed' | 'Volatile' | 'Slowing';
  onTimePaymentRate: number; // percentage 0 - 100
  latePaymentsCount: number;
  activeDealsCount: number;
  openDisputesCount: number;
  missedCommitmentsCount: number;
  currentExposure: number; // in INR
  whyScoreReasons: Array<{
    type: 'positive' | 'warning' | 'negative';
    text: string;
  }>;
  contactPerson: string;
  phone: string;
  email: string;
  gstNo: string;
  address: string;
  joinedDate: string;
}

export interface Deal {
  id: string;
  dealNumber: string;
  customerId: string;
  customerName: string;
  orderValue: number;
  advancePercent: number;
  advanceAmount: number;
  remainingReceivable: number;
  paymentPeriodDays: number;
  estimatedFulfillmentCost: number;
  availableWorkingCapital: number;
  workingCapitalGap: number;
  advanceCoveragePercent: number;
  expectedMargin: number;
  expectedMarginPercent: number;
  riskStatus: DealRiskStatus;
  status: DealWorkflowStatus;
  whyReasons: Array<{
    type: 'positive' | 'warning' | 'negative';
    text: string;
  }>;
  createdAt: string;
  acceptedAt?: string;
  notes?: string;
  restructureApplied?: boolean;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitRate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  dealId?: string;
  customerId: string;
  customerName: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  disputeId?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  date: string;
  paymentType: 'NEFT/RTGS' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Advance Payment';
  referenceNumber: string;
  remainingBalanceAfter: number;
  notes?: string;
}

export interface Dispute {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amountAffected: number;
  reason: string;
  status: DisputeStatus;
  createdDate: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  raisedBy: 'Customer' | 'Internal Audit';
}

export interface Commitment {
  id: string;
  customerId: string;
  customerName: string;
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  promisedDate: string;
  actualPaymentDate?: string;
  status: CommitmentStatus;
  notes?: string;
}

export interface CustomerDocument {
  id: string;
  customerId: string;
  title: string;
  type: 'Purchase Order' | 'GST Invoice' | 'Delivery Challan' | 'Contract' | 'Bank Guarantee';
  uploadDate: string;
  size: string;
  fileFormat: string;
}

export interface CollectionPriority {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  daysOverdue: number;
  urgency: 'High' | 'Medium' | 'Low';
  riskLabel: '🔴 High' | '🟠 Medium' | '🟡 Medium' | '🟢 Low';
  primaryIssue: string;
  suggestedAction: string;
  customerHealthScore: number;
}

export interface AlertNotification {
  id: string;
  type: 'missed_commitment' | 'deal_attention' | 'new_dispute' | 'payment_received' | 'cash_flow_risk';
  title: string;
  description: string;
  timestamp: string;
  severity: 'danger' | 'warning' | 'success' | 'info';
  actionLabel?: string;
  targetView?: string;
  targetId?: string;
  isRead: boolean;
}

export interface CashFlowPoint {
  month: string;
  expectedInflow: number;
  expectedOutflow: number;
  projectedBalance: number;
  isForecast?: boolean;
}

export interface RestructureOption {
  id: string;
  title: string;
  advancePercent: number;
  advanceAmount: number;
  paymentPeriodDays: number;
  workingCapitalGap: number;
  riskStatus: DealRiskStatus;
  badge: 'Better' | 'Safer' | 'Safest';
  isRecommended: boolean;
  whyExplanation: string;
  cashImprovement: string;
}

export interface UserAccount {
  id: string;
  ownerName: string;
  email: string;
  phone: string;
  businessName: string;
  industry: string;
  businessType: string;
  currentAvailableCapital: number;
  createdAt: string;
  lastLoginAt: string;
  twoFactorEnabled: boolean;
  autoLockMinutes: number;
  notificationPreferences: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    cashRiskAlerts: boolean;
    weeklyDigest: boolean;
    msmeStatutoryAlerts: boolean;
  };
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  gstin: string;
  industry: string;
  businessType: string;
  currentAvailableCapital: number;
  defaultCreditPeriodDays: number;
  minimumAdvanceDesiredPercent: number;
  safetyBufferAmount: number;
}

