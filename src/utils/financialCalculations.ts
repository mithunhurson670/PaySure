import { Customer, Deal, DealRiskStatus, RestructureOption } from '../types';

/**
 * Formats numbers into clear Indian Currency notation (Lakhs, Crores, or standard thousands)
 */
export function formatINR(amount: number, short = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  if (short) {
    if (absAmount >= 10000000) {
      return `${isNegative ? '-' : ''}₹${(absAmount / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
    }
    if (absAmount >= 100000) {
      return `${isNegative ? '-' : ''}₹${(absAmount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    }
    if (absAmount >= 1000) {
      return `${isNegative ? '-' : ''}₹${(absAmount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${isNegative ? '-' : ''}₹${Math.round(absAmount)}`;
  }

  // Full Indian comma formatted
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(absAmount);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Returns plain English description of monetary amounts (e.g., "10 Lakh Rupees")
 */
export function formatINRWords(amount: number): string {
  if (isNaN(amount)) return 'Zero Rupees';
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `${(abs / 10000000).toFixed(2)} Crore Rupees`;
  }
  if (abs >= 100000) {
    return `${(abs / 100000).toFixed(1)} Lakh Rupees`;
  }
  return `${abs.toLocaleString('en-IN')} Rupees`;
}

export interface DealAnalysisInput {
  orderValue: number;
  advancePercent: number;
  paymentPeriodDays: number;
  estimatedFulfillmentCost: number;
  availableWorkingCapital: number;
  customer?: Customer | null;
}

export interface DealAnalysisOutput {
  advanceAmount: number;
  remainingReceivable: number;
  workingCapitalGap: number;
  advanceCoveragePercent: number;
  expectedMargin: number;
  expectedMarginPercent: number;
  capitalExhaustionPercent: number;
  riskStatus: DealRiskStatus;
  riskHeadline: string;
  riskSummary: string;
  whyReasons: Array<{
    type: 'positive' | 'warning' | 'negative';
    text: string;
  }>;
  suggestedActionHeadline: string;
  restructureOptions: RestructureOption[];
}

/**
 * PaySure Core Decision Algorithm
 * Evaluates whether an MSME can safely accept an order without jeopardizing working capital.
 */
export function analyzeDealSafety(input: DealAnalysisInput): DealAnalysisOutput {
  const {
    orderValue,
    advancePercent,
    paymentPeriodDays,
    estimatedFulfillmentCost,
    availableWorkingCapital,
    customer,
  } = input;

  const advanceAmount = Math.round(orderValue * (advancePercent / 100));
  const remainingReceivable = Math.max(0, orderValue - advanceAmount);
  const workingCapitalGap = Math.max(0, estimatedFulfillmentCost - advanceAmount);
  
  const advanceCoveragePercent = estimatedFulfillmentCost > 0
    ? Math.min(100, Math.round((advanceAmount / estimatedFulfillmentCost) * 100))
    : 100;
    
  const expectedMargin = orderValue - estimatedFulfillmentCost;
  const expectedMarginPercent = orderValue > 0 
    ? Math.round((expectedMargin / orderValue) * 100) 
    : 0;

  const capitalExhaustionPercent = availableWorkingCapital > 0
    ? Math.min(100, Math.round((workingCapitalGap / availableWorkingCapital) * 100))
    : 100;

  // Determine Risk Status based on plain financial fundamentals
  let riskStatus: DealRiskStatus = 'Safe';
  const whyReasons: Array<{ type: 'positive' | 'warning' | 'negative'; text: string }> = [];

  // Positive baseline checks
  if (customer && customer.healthStatus === 'Healthy') {
    whyReasons.push({
      type: 'positive',
      text: `Customer has strong on-time payment track record (${customer.onTimePaymentRate}% on-time, avg ${customer.averagePaymentDays} days).`,
    });
  } else if (customer && customer.healthStatus === 'Watch') {
    whyReasons.push({
      type: 'warning',
      text: `Customer has moderate payment delays (${customer.averagePaymentDays} days average payout, ${customer.latePaymentsCount} recorded delays).`,
    });
  } else if (customer && (customer.healthStatus === 'Attention' || customer.healthStatus === 'Dispute')) {
    whyReasons.push({
      type: 'negative',
      text: `Customer has critical payment alerts (${customer.openDisputesCount} active disputes, ${customer.missedCommitmentsCount} missed commitments).`,
    });
  }

  // Margin check
  if (expectedMargin > 0) {
    whyReasons.push({
      type: 'positive',
      text: `Healthy profit margin of ${formatINR(expectedMargin, true)} (${expectedMarginPercent}% gross margin on order).`,
    });
  } else {
    whyReasons.push({
      type: 'negative',
      text: `Unprofitable order: fulfillment cost exceeds or matches total billing value.`,
    });
  }

  // Working Capital Gap & Coverage check
  if (workingCapitalGap === 0) {
    whyReasons.push({
      type: 'positive',
      text: `Advance fully covers 100% of your manufacturing/fulfillment cost upfront. Zero internal capital locked.`,
    });
  } else if (workingCapitalGap <= availableWorkingCapital * 0.3) {
    whyReasons.push({
      type: 'warning',
      text: `Advance covers ${advanceCoveragePercent}% of fulfillment costs. ${formatINR(workingCapitalGap, true)} temporary funding gap is manageable with your current reserves.`,
    });
  } else {
    whyReasons.push({
      type: 'negative',
      text: `${formatINR(workingCapitalGap, true)} temporary funding gap will consume ${capitalExhaustionPercent}% of your available working capital (${formatINR(availableWorkingCapital, true)}).`,
    });
  }

  // Credit period check
  if (paymentPeriodDays > 60) {
    whyReasons.push({
      type: 'negative',
      text: `${formatINR(remainingReceivable, true)} remaining balance will be locked for a long credit window of ${paymentPeriodDays} days.`,
    });
  } else if (paymentPeriodDays > 30) {
    whyReasons.push({
      type: 'warning',
      text: `${formatINR(remainingReceivable, true)} receivable will be outstanding for ${paymentPeriodDays} days credit term.`,
    });
  } else {
    whyReasons.push({
      type: 'positive',
      text: `Short credit period of ${paymentPeriodDays} days minimizes prolonged receivable risk.`,
    });
  }

  // Determine aggregate risk rating
  const customerBad = customer && (customer.healthStatus === 'Attention' || customer.healthStatus === 'Dispute');
  
  if (
    expectedMargin <= 0 ||
    workingCapitalGap > availableWorkingCapital * 0.65 ||
    (workingCapitalGap > availableWorkingCapital * 0.45 && paymentPeriodDays > 60) ||
    (customerBad && workingCapitalGap > availableWorkingCapital * 0.2)
  ) {
    riskStatus = 'High Risk';
  } else if (
    workingCapitalGap > 0 ||
    paymentPeriodDays >= 45 ||
    (customer && customer.healthStatus === 'Watch')
  ) {
    riskStatus = 'Conditional';
  } else {
    riskStatus = 'Safe';
  }

  let riskHeadline = '';
  let riskSummary = '';
  let suggestedActionHeadline = '';

  if (riskStatus === 'Safe') {
    riskHeadline = 'SAFE TO ACCEPT';
    riskSummary = 'This deal is financially solid. Your advance covers upfront costs or the minor gap is well within safe working capital limits.';
    suggestedActionHeadline = 'Proceed with order execution and generate proforma invoice.';
  } else if (riskStatus === 'Conditional') {
    riskHeadline = 'CONDITIONAL';
    riskSummary = 'This order is profitable, but it may create temporary pressure on your working capital before the final payment arrives.';
    suggestedActionHeadline = 'Consider requesting a 10% higher advance or shortening credit terms before signing.';
  } else {
    riskHeadline = 'HIGH RISK';
    riskSummary = 'Accepting this order in its current structure severely strains your available cash and exposes you to cash-flow stall if payment is delayed.';
    suggestedActionHeadline = 'Do not accept as-is. Restructure terms with the client using the recommendations below.';
  }

  // Generate Restructure Options
  const restructureOptions = generateRestructureOptions(
    orderValue,
    estimatedFulfillmentCost,
    paymentPeriodDays,
    advancePercent,
    availableWorkingCapital
  );

  return {
    advanceAmount,
    remainingReceivable,
    workingCapitalGap,
    advanceCoveragePercent,
    expectedMargin,
    expectedMarginPercent,
    capitalExhaustionPercent,
    riskStatus,
    riskHeadline,
    riskSummary,
    whyReasons,
    suggestedActionHeadline,
    restructureOptions,
  };
}

/**
 * Generates actionable, safer alternative deal structures for negotiation
 */
export function generateRestructureOptions(
  orderValue: number,
  fulfillmentCost: number,
  currentDays: number,
  currentAdvancePercent: number,
  availableCapital: number
): RestructureOption[] {
  // Option 1: Moderate advance bump, same days
  const opt1AdvancePct = Math.min(80, Math.max(currentAdvancePercent + 10, 50));
  const opt1AdvanceAmt = Math.round(orderValue * (opt1AdvancePct / 100));
  const opt1Gap = Math.max(0, fulfillmentCost - opt1AdvanceAmt);
  const opt1Risk: DealRiskStatus = opt1Gap <= availableCapital * 0.35 ? 'Conditional' : 'High Risk';

  // Option 2: 50% advance + shorter days (45 days)
  const opt2AdvancePct = 50;
  const opt2Days = Math.min(currentDays, 45);
  const opt2AdvanceAmt = Math.round(orderValue * (opt2AdvancePct / 100));
  const opt2Gap = Math.max(0, fulfillmentCost - opt2AdvanceAmt);
  const opt2Risk: DealRiskStatus = opt2Gap <= availableCapital * 0.25 ? 'Safe' : 'Conditional';

  // Option 3: Full cost coverage advance (e.g., 60%-70%) + 30-45 days
  const costCoveragePercent = Math.min(80, Math.max(60, Math.ceil((fulfillmentCost / orderValue) * 100)));
  const opt3AdvancePct = costCoveragePercent;
  const opt3Days = Math.min(currentDays, 45);
  const opt3AdvanceAmt = Math.round(orderValue * (opt3AdvancePct / 100));
  const opt3Gap = Math.max(0, fulfillmentCost - opt3AdvanceAmt);
  const opt3Risk: DealRiskStatus = 'Safe';

  return [
    {
      id: 'opt-1',
      title: `${opt1AdvancePct}% Advance + ${currentDays} Days`,
      advancePercent: opt1AdvancePct,
      advanceAmount: opt1AdvanceAmt,
      paymentPeriodDays: currentDays,
      workingCapitalGap: opt1Gap,
      riskStatus: opt1Risk,
      badge: 'Better',
      isRecommended: false,
      whyExplanation: `Increases upfront cash inflow to ${formatINR(opt1AdvanceAmt, true)}, shrinking your working capital gap by ${formatINR(Math.max(0, fulfillmentCost - (orderValue * (currentAdvancePercent / 100)) - opt1Gap), true)}.`,
      cashImprovement: `Gap reduced to ${formatINR(opt1Gap, true)}`,
    },
    {
      id: 'opt-2',
      title: `${opt2AdvancePct}% Advance + ${opt2Days} Days`,
      advancePercent: opt2AdvancePct,
      advanceAmount: opt2AdvanceAmt,
      paymentPeriodDays: opt2Days,
      workingCapitalGap: opt2Gap,
      riskStatus: opt2Risk,
      badge: 'Safer',
      isRecommended: false,
      whyExplanation: `Reduces credit collection cycle by ${Math.max(0, currentDays - opt2Days)} days while securing ${formatINR(opt2AdvanceAmt, true)} initial funding.`,
      cashImprovement: `Cuts receivables lock-in to ${opt2Days} days`,
    },
    {
      id: 'opt-3',
      title: `${opt3AdvancePct}% Advance + ${opt3Days} Days`,
      advancePercent: opt3AdvancePct,
      advanceAmount: opt3AdvanceAmt,
      paymentPeriodDays: opt3Days,
      workingCapitalGap: opt3Gap,
      riskStatus: opt3Risk,
      badge: 'Safest',
      isRecommended: true,
      whyExplanation: `Recommended: 100% covers your estimated direct fulfillment costs (${formatINR(fulfillmentCost, true)}) upfront, eliminating cash drain completely.`,
      cashImprovement: opt3Gap === 0 ? 'Zero working capital locked' : `Gap slashed to ${formatINR(opt3Gap, true)}`,
    },
  ];
}

/**
 * Calculates What-If dynamic scenario projections
 */
export function simulateWhatIf(
  orderValue: number,
  fulfillmentCost: number,
  advancePercent: number,
  paymentPeriodDays: number,
  paymentDelayDays: number,
  initialAvailableCash: number
) {
  const advanceAmount = Math.round(orderValue * (advancePercent / 100));
  const remainingReceivable = Math.max(0, orderValue - advanceAmount);
  const workingCapitalGap = Math.max(0, fulfillmentCost - advanceAmount);
  const effectiveTotalDays = paymentPeriodDays + paymentDelayDays;
  const expectedMargin = orderValue - fulfillmentCost;

  // Projected Cash Flow Profile over days (Day 0, Day 15, Day 30, Day 60, Day 90)
  const cashAtDay0 = initialAvailableCash + advanceAmount - (fulfillmentCost * 0.5); // 50% cost spent at kickoff
  const cashAtDay30 = cashAtDay0 - (fulfillmentCost * 0.5); // remaining 50% cost spent
  const cashAtPayment = cashAtDay30 + remainingReceivable;

  let riskLevel: 'Safe' | 'Caution' | 'High Risk' = 'Safe';
  let riskColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let message = 'Cash flow remains positive and within comfortable safety boundaries.';

  if (effectiveTotalDays > 75 || cashAtDay30 < initialAvailableCash * 0.3) {
    riskLevel = 'High Risk';
    riskColor = 'text-rose-700 bg-rose-50 border-rose-200';
    message = `Critical pressure: A ${paymentDelayDays}-day delay locks ${formatINR(remainingReceivable, true)} for ${effectiveTotalDays} total days, depleting liquid reserves.`;
  } else if (effectiveTotalDays > 45 || workingCapitalGap > initialAvailableCash * 0.25) {
    riskLevel = 'Caution';
    riskColor = 'text-amber-700 bg-amber-50 border-amber-200';
    message = `Manageable caution: Short-term cash dip expected between Day 15 and Day ${effectiveTotalDays}. Buffer is tight.`;
  } else {
    riskLevel = 'Safe';
    riskColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
    message = 'Comfortable buffer: Fast turnaround and high advance keep working capital protected.';
  }

  return {
    advanceAmount,
    remainingReceivable,
    workingCapitalGap,
    expectedMargin,
    effectiveTotalDays,
    riskLevel,
    riskColor,
    message,
    cashAtDay0,
    cashAtDay30,
    cashAtPayment,
    minCashPoint: Math.min(cashAtDay0, cashAtDay30, cashAtPayment),
  };
}
