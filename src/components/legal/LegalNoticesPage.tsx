import React, { useState, useMemo } from 'react';
import {
  Scale,
  FileText,
  Copy,
  Check,
  Printer,
  Mail,
  Send,
  AlertTriangle,
  ShieldAlert,
  Info,
  Calendar,
  Building2,
  DollarSign,
  Clock,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Customer, Invoice } from '../../types';
import { formatINR } from '../../utils/financialCalculations';

interface DispatchedNotice {
  id: string;
  refNo: string;
  customerName: string;
  date: string;
  totalDemand: number;
  principalAmount: number;
  interestAmount: number;
  cureDays: number;
  status: 'Served' | 'In Cure Period' | 'Settled' | 'Escalated to MSEFC';
  invoices: string[];
}

export const LegalNoticesPage: React.FC = () => {
  const { customers, invoices, businessSettings, showToast, viewCustomerProfile } = useApp();

  // Find customers with overdue invoices or select the first customer with overdue amounts
  const customersWithOverdue = useApp().customers.filter(c => c.overdueAmount > 0);
  const defaultCustomer = customersWithOverdue[0] || customers[0];

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(defaultCustomer?.id || '');
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || defaultCustomer;

  // Selected customer invoices
  const customerInvoices = invoices.filter(
    i => i.customerId === selectedCustomer?.id && (i.status === 'Overdue' || i.status === 'Disputed' || i.remainingAmount > 0)
  );

  // Selected invoices checklist
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  
  // Set initial selected invoices when customer changes
  React.useEffect(() => {
    if (customerInvoices.length > 0) {
      setSelectedInvoiceIds(customerInvoices.map(i => i.id));
    } else {
      setSelectedInvoiceIds([]);
    }
  }, [selectedCustomerId]);

  // Notice Configuration State
  const [noticeType, setNoticeType] = useState<'statutory_demand' | 'pre_litigation' | 'conciliation'>('statutory_demand');
  const [noticeRefNo, setNoticeRefNo] = useState<string>(`MSMED/SEC15-16/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [noticeDate, setNoticeDate] = useState<string>('2026-09-01');
  const [curePeriodDays, setCurePeriodDays] = useState<number>(7);
  const [signatoryName, setSignatoryName] = useState<string>('Finance & Accounts Head');
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSamadhaanGuide, setShowSamadhaanGuide] = useState(false);

  // Audit history of dispatched notices
  const [noticeHistory, setNoticeHistory] = useState<DispatchedNotice[]>([
    {
      id: 'not-01',
      refNo: 'MSMED/SEC15-16/2026/104',
      customerName: 'GreenMart Retail Ltd',
      date: '2026-08-20',
      totalDemand: 494500,
      principalAmount: 480000,
      interestAmount: 14500,
      cureDays: 7,
      status: 'In Cure Period',
      invoices: ['INV-2026-088'],
    },
    {
      id: 'not-02',
      refNo: 'MSMED/SEC15-16/2026/092',
      customerName: 'Royal Cafe Chain',
      date: '2026-08-12',
      totalDemand: 226800,
      principalAmount: 220000,
      interestAmount: 6800,
      cureDays: 10,
      status: 'Served',
      invoices: ['INV-2026-061'],
    },
    {
      id: 'not-03',
      refNo: 'MSMED/SEC15-16/2026/077',
      customerName: 'Horizon Foods Pvt Ltd',
      date: '2026-07-28',
      totalDemand: 388000,
      principalAmount: 380000,
      interestAmount: 8000,
      cureDays: 7,
      status: 'Settled',
      invoices: ['INV-2026-039'],
    },
  ]);

  // MSMED Statutory Calculation for each invoice:
  // RBI Repo Rate = 6.5% -> 3x RBI Rate = 19.5% p.a.
  // Compounded with monthly rests
  const calculatedInvoices = useMemo(() => {
    return customerInvoices.map(inv => {
      const isSelected = selectedInvoiceIds.includes(inv.id);
      const daysElapsed = 65; // realistic benchmark days elapsed
      const statutoryLimit = 45;
      const daysOverdueStatutory = Math.max(0, daysElapsed - statutoryLimit);
      
      const annualRate = 0.195; // 19.5% (3x RBI Repo Rate of 6.5%)
      const monthsElapsed = daysOverdueStatutory / 30;
      
      // Compound interest formula with monthly rests: A = P * (1 + r/12)^(n) - P
      const principal = inv.remainingAmount || inv.amount;
      const compoundInterest = daysOverdueStatutory > 0
        ? Math.round(principal * (Math.pow(1 + annualRate / 12, monthsElapsed) - 1))
        : 0;
      
      const totalClaim = principal + compoundInterest;

      return {
        ...inv,
        isSelected,
        daysElapsed,
        statutoryLimit,
        daysOverdueStatutory,
        principal,
        compoundInterest,
        totalClaim,
      };
    });
  }, [customerInvoices, selectedInvoiceIds]);

  const activeSelectedCalculations = calculatedInvoices.filter(i => i.isSelected);

  const totalSelectedPrincipal = activeSelectedCalculations.reduce((acc, i) => acc + i.principal, 0);
  const totalSelectedInterest = activeSelectedCalculations.reduce((acc, i) => acc + i.compoundInterest, 0);
  const totalStatutoryDemand = totalSelectedPrincipal + totalSelectedInterest;

  // Toggle invoice selection
  const toggleInvoice = (id: string) => {
    if (selectedInvoiceIds.includes(id)) {
      setSelectedInvoiceIds(selectedInvoiceIds.filter(i => i !== id));
    } else {
      setSelectedInvoiceIds([...selectedInvoiceIds, id]);
    }
  };

  // Select all or deselect all
  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === customerInvoices.length) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds(customerInvoices.map(i => i.id));
    }
  };

  // Generate formal statutory legal notice text
  const statutoryNoticeText = useMemo(() => {
    const custName = selectedCustomer?.name || 'Customer Enterprise';
    const custAddress = selectedCustomer?.address || 'Corporate Office';
    const custGst = selectedCustomer?.gstNo || 'GSTIN Not Provided';
    const busName = businessSettings.businessName || 'PaySure Enterprise Pvt Ltd';
    const busUdyam = 'UDYAM-MH-03-0098124';
    const busGst = '27AAECP4589F1Z2';

    const invoiceRowsText = activeSelectedCalculations
      .map(
        (inv, idx) =>
          `${idx + 1}. Invoice No: ${inv.invoiceNumber} | Date: ${inv.dueDate} | Principal: ${formatINR(
            inv.principal
          )} | Overdue Days: ${inv.daysOverdueStatutory}d | Sec 16 Interest (3x RBI Rate): ${formatINR(
            inv.compoundInterest
          )} | Total: ${formatINR(inv.totalClaim)}`
      )
      .join('\n');

    return `LEGAL STATUTORY DEMAND NOTICE
UNDER SECTION 15, 16 & 17 OF THE MICRO, SMALL AND MEDIUM ENTERPRISES DEVELOPMENT (MSMED) ACT, 2006
READ WITH SECTION 43B(h) OF THE INCOME TAX ACT, 1961

Ref No: ${noticeRefNo}
Date of Notice: ${noticeDate}
Mode: Electronic Transmission & Registered Post A.D.

TO:
The Board of Directors / Chief Financial Officer / Accounts Payable Head
${custName}
Address: ${custAddress}
GSTIN: ${custGst}

FROM:
${busName}
Enterprise Status: Micro / Small Enterprise
Udyam Registration No: ${busUdyam}
GSTIN: ${busGst}

SUBJECT: STATUTORY DEMAND FOR IMMEDIATE REMITTANCE OF OUTSTANDING DUES OF ${formatINR(
      totalStatutoryDemand
    )} COMPRISING PRINCIPAL AMOUNT AND MANDATORY COMPOUND INTEREST UNDER SECTION 16 OF THE MSMED ACT, 2006.

Sir/Madam,

Under instructions and on behalf of our enterprise, ${busName}, registered under the MSMED Act, 2006, this statutory demand notice is issued to you:

1. STATUTORY APPLICABILITY UNDER MSMED ACT, 2006:
Our enterprise is a registered MSME unit under the Udyam Registration framework. Goods/services were duly delivered and accepted by your company against the issued tax invoices without any statutory objection raised within the 15-day dispute window under Section 2(b) of the MSMED Act.

2. VIOLATION OF SECTION 15 (STATUTORY 45-DAY SETTLEMENT CEILING):
Under Section 15 of the MSMED Act, 2006, the buyer is statutorily obligated to make payment on or before the agreed date, and in no case shall the period exceed 45 (forty-five) days from the date of delivery/acceptance. Your enterprise has failed to discharge the outstanding liabilities within the mandated 45-day statutory ceiling.

3. MANDATORY STATUTORY COMPOUND INTEREST UNDER SECTION 16:
Under Section 16 of the MSMED Act, where any buyer fails to make payment as required under Section 15, the buyer is liable to pay compound interest with monthly rests to the supplier on that amount from the appointed day at three times (3x) of the Bank Rate / Repo Rate notified by the Reserve Bank of India (currently 19.5% per annum). The liability to pay interest is mandatory by operation of law and cannot be waived or modified by any contract.

4. DETAILS OF OUTSTANDING DELINQUENT INVOICES:
${invoiceRowsText}

----------------------------------------------------------------------
TOTAL PRINCIPAL OUTSTANDING: ${formatINR(totalSelectedPrincipal)}
TOTAL ACCRUED COMPOUND PENAL INTEREST (SEC 16): ${formatINR(totalSelectedInterest)}
TOTAL STATUTORY DEMAND PAYABLE: ${formatINR(totalStatutoryDemand)}
----------------------------------------------------------------------

5. TAX CONSEQUENCES UNDER SECTION 43B(h) OF THE INCOME TAX ACT:
Your attention is expressly drawn to Section 43B(h) of the Income Tax Act, 1961, whereby any sum payable to a Micro or Small Enterprise beyond the statutory time limit under Section 15 of the MSMED Act is disallowed as a business expense for income tax assessment, resulting in added tax liability and penalties for your company.

6. FORMAL DEMAND & CURE TIMELINE:
We hereby formally call upon you to remit the total statutory amount of ${formatINR(
      totalStatutoryDemand
    )} via RTGS/NEFT within ${curePeriodDays} (seven) days from the receipt of this notice into our designated bank account:
- Account Name: ${busName}
- Bank Name: HDFC Bank Ltd, Industrial Finance Branch
- Account No: 50200084920194
- IFSC Code: HDFC0000184

7. STATUTORY REMEDIES ON DEFAULT:
In the event of failure to clear the full statutory amount within ${curePeriodDays} days:
(a) A formal complaint under Section 18 of the MSMED Act shall be lodged before the Micro and Small Enterprises Facilitation Council (MSEFC) via the MSME Samadhaan portal for recovery with continuous penal compound interest.
(b) Adverse payment default reporting will be transmitted to Commercial Credit Bureaus (CIBIL Commercial / CRIF High Mark).

Yours faithfully,
For ${busName}

Authorized Signatory: ${signatoryName}
UDYAM Registration: ${busUdyam}
Contact: compliance@paysure.in | +91 98201 44820`;
  }, [
    selectedCustomer,
    businessSettings,
    activeSelectedCalculations,
    noticeRefNo,
    noticeDate,
    curePeriodDays,
    signatoryName,
    totalSelectedPrincipal,
    totalSelectedInterest,
    totalStatutoryDemand,
  ]);

  const handleCopyNotice = () => {
    navigator.clipboard.writeText(statutoryNoticeText);
    setCopiedNotice(true);
    showToast('Statutory Legal Demand Notice copied to clipboard!', 'success');
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMarkServed = () => {
    const newNotice: DispatchedNotice = {
      id: `not-${Date.now()}`,
      refNo: noticeRefNo,
      customerName: selectedCustomer?.name || 'Customer',
      date: noticeDate,
      totalDemand: totalStatutoryDemand,
      principalAmount: totalSelectedPrincipal,
      interestAmount: totalSelectedInterest,
      cureDays: curePeriodDays,
      status: 'Served',
      invoices: activeSelectedCalculations.map(i => i.invoiceNumber),
    };

    setNoticeHistory([newNotice, ...noticeHistory]);
    showToast(`Legal Demand Notice ${noticeRefNo} marked as served!`, 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-900 text-white rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                MSMED Statutory Legal Demand Notices
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated legal recovery generator under Section 15 & 16 of the MSMED Act, 2006 (45-Day statutory limit & 3x RBI Compound Penal Interest).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSamadhaanGuide(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>MSME Samadhaan Guide</span>
          </button>

          <button
            onClick={handleCopyNotice}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            {copiedNotice ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedNotice ? 'Notice Copied' : 'Copy Notice Text'}</span>
          </button>
        </div>
      </div>

      {/* Statutory MSMED Act Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Section 15 (Settlement Ceiling)</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Mandatory</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">Max 45 Days</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Statutory ceiling for payment from date of goods acceptance. Overrules longer buyer contract terms.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Section 16 (Compound Interest)</span>
            <span className="text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">19.5% p.a.</span>
          </div>
          <div className="text-lg font-bold text-rose-700 font-mono">3x RBI Repo Rate</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Compounded with monthly rests from appointed date. Cannot be waived by any agreement.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Section 43B(h) Income Tax</span>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">Tax Disallowance</span>
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">Expense Disallowed</div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Delinquent buyers lose tax deduction on delayed MSME purchases in their corporate tax filings.
          </p>
        </div>
      </div>

      {/* Main 2-Column Notice Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer & Invoice Selection + Notice Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Customer Selection Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Select Delinquent Customer
              </span>
              {selectedCustomer && (
                <button
                  onClick={() => viewCustomerProfile(selectedCustomer.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Customer 360°</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 block">
                Target Enterprise / Debtor Account:
              </label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.overdueAmount > 0 ? `(₹${(c.overdueAmount / 100000).toFixed(1)}L Overdue)` : '(Clear)'}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomer && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Contact Person:</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.contactPerson}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">GSTIN / Tax ID:</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.gstNo}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Total Ledger Overdue:</span>
                  <span className="font-bold text-rose-700">{formatINR(selectedCustomer.overdueAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Avg Payment Delay:</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.averagePaymentDays} Days</span>
                </div>
              </div>
            )}
          </div>

          {/* Invoices Selection & Interest Calculation */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  2. Overdue Invoices & Sec 16 Interest
                </span>
                <span className="text-[11px] text-slate-500">
                  Select invoices to attach to this statutory legal demand.
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {selectedInvoiceIds.length === customerInvoices.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {customerInvoices.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No unpaid or overdue invoices found for this customer.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {calculatedInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => toggleInvoice(inv.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      inv.isSelected
                        ? 'border-slate-900 bg-slate-50/80 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={inv.isSelected}
                          onChange={() => {}} // Handled by parent div
                          className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-slate-900 font-mono">{inv.invoiceNumber}</span>
                          <span className="text-[11px] text-slate-500 ml-2 font-mono">Due: {inv.dueDate}</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">{formatINR(inv.principal)}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono text-slate-600">
                      <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>+{inv.daysOverdueStatutory}d past 45-day limit</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 font-sans">Sec 16 Interest: </span>
                        <span className="font-bold text-slate-900">+{formatINR(inv.compoundInterest)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Invoices Cumulative Total */}
            <div className="p-3 bg-slate-900 text-white rounded-lg space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span className="font-sans">Principal Amount:</span>
                <span>{formatINR(totalSelectedPrincipal)}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span className="font-sans">Accrued Sec 16 Interest:</span>
                <span>+{formatINR(totalSelectedInterest)}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-700 text-sm font-bold text-white">
                <span className="font-sans">Total Statutory Claim:</span>
                <span className="text-emerald-400">{formatINR(totalStatutoryDemand)}</span>
              </div>
            </div>
          </div>

          {/* Notice Parameters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block pb-2 border-b border-slate-100">
              3. Notice Parameters & Legal Form
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Notice Reference No.</label>
                <input
                  type="text"
                  value={noticeRefNo}
                  onChange={e => setNoticeRefNo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-medium">Cure Period (Days)</label>
                <select
                  value={curePeriodDays}
                  onChange={e => setCurePeriodDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                >
                  <option value={7}>7 Days (Statutory Standard)</option>
                  <option value={10}>10 Days (Final Notice)</option>
                  <option value={15}>15 Days (Conciliation)</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-slate-700 font-medium">Authorized Signatory Title</label>
                <input
                  type="text"
                  value={signatoryName}
                  onChange={e => setSignatoryName(e.target.value)}
                  placeholder="Finance Director / Legal Head"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleMarkServed}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Notice Served</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Statutory Document Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-300 shadow-md p-6 sm:p-8 space-y-5 font-serif text-slate-900 text-xs sm:text-[13px] leading-relaxed relative print:border-none print:shadow-none">
            {/* Watermark / Formal Header Tag */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 font-sans">
              <div>
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 uppercase">
                  {businessSettings.businessName}
                </span>
                <p className="text-[11px] text-slate-500">
                  Registered MSME Supplier | Udyam: UDYAM-MH-03-0098124 | GSTIN: 27AAECP4589F1Z2
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white text-[10px] font-mono font-semibold uppercase rounded">
                  Statutory Legal Notice
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{noticeRefNo}</p>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1 font-sans py-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 uppercase tracking-wide">
                STATUTORY DEMAND NOTICE
              </h2>
              <p className="text-[11px] text-slate-600 font-medium">
                ISSUED UNDER SECTIONS 15, 16 & 17 OF THE MSMED ACT, 2006 READ WITH SECTION 43B(h) OF THE INCOME TAX ACT, 1961
              </p>
            </div>

            {/* To / Address Block */}
            <div className="space-y-1 font-sans text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="font-bold text-slate-900">TO:</div>
              <div className="font-semibold text-slate-800">{selectedCustomer?.name}</div>
              <div className="text-slate-600">{selectedCustomer?.address}</div>
              <div className="text-slate-600 font-mono text-[11px]">GSTIN: {selectedCustomer?.gstNo}</div>
              <div className="text-slate-600">Kind Attn: {selectedCustomer?.contactPerson} / Managing Director</div>
            </div>

            {/* Subject Line */}
            <div className="font-sans text-xs font-bold text-slate-900 bg-slate-100/70 p-2.5 rounded border border-slate-200">
              SUBJECT: Demand for immediate remittance of delinquent statutory dues aggregating to{' '}
              <span className="font-mono text-rose-700">{formatINR(totalStatutoryDemand)}</span> along with Section 16 compound penal interest.
            </div>

            {/* Body Paragraphs */}
            <div className="space-y-3 text-slate-800">
              <p>
                <strong>1. Statutory MSME Status:</strong> Our enterprise is a registered Micro/Small enterprise under the Micro, Small and Medium Enterprises Development (MSMED) Act, 2006. The goods/services listed herein were duly supplied and acknowledged by your company without any dispute or objection within the statutory 15-day period.
              </p>

              <p>
                <strong>2. Breach of Section 15 (Mandatory 45-Day Limit):</strong> Under Section 15 of the MSMED Act, payment for supplies must be discharged within the agreed term, which in no circumstance can legally exceed <strong>45 (forty-five) days</strong> from the date of delivery. Your company has exceeded this non-negotiable statutory limit.
              </p>

              <p>
                <strong>3. Compound Interest at 3x RBI Repo Rate (Section 16):</strong> By virtue of Section 16, delayed remittances attract <strong>mandatory compound interest with monthly rests at 3 (three) times the RBI Repo Rate (currently 19.5% p.a.)</strong> from the appointed due date. This liability is mandatory by statutory operation of law.
              </p>

              {/* Invoices Table */}
              <div className="font-sans overflow-hidden border border-slate-200 rounded-lg mt-2">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Invoice No.</th>
                      <th className="py-2 px-2">Due Date</th>
                      <th className="py-2 px-2 text-right">Principal</th>
                      <th className="py-2 px-2 text-right">Overdue</th>
                      <th className="py-2 px-2 text-right">Sec 16 Interest</th>
                      <th className="py-2 px-3 text-right">Total Demand</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {activeSelectedCalculations.map(inv => (
                      <tr key={inv.id}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="py-2 px-2 text-slate-600">{inv.dueDate}</td>
                        <td className="py-2 px-2 text-right font-medium text-slate-800">{formatINR(inv.principal)}</td>
                        <td className="py-2 px-2 text-right text-rose-700 font-semibold">+{inv.daysOverdueStatutory}d</td>
                        <td className="py-2 px-2 text-right text-slate-800">{formatINR(inv.compoundInterest)}</td>
                        <td className="py-2 px-3 text-right font-bold text-slate-900">{formatINR(inv.totalClaim)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200">
                      <td colSpan={2} className="py-2.5 px-3 font-sans">CUMULATIVE STATUTORY DEMAND:</td>
                      <td className="py-2.5 px-2 text-right">{formatINR(totalSelectedPrincipal)}</td>
                      <td className="py-2.5 px-2 text-right"></td>
                      <td className="py-2.5 px-2 text-right text-emerald-700">+{formatINR(totalSelectedInterest)}</td>
                      <td className="py-2.5 px-3 text-right text-sm text-slate-900">{formatINR(totalStatutoryDemand)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>4. Income Tax Disallowance Notice:</strong> Pursuant to Section 43B(h) of the Income Tax Act, 1961, failure to discharge these outstanding dues before the end of the financial year shall result in permanent disallowance of these expenses from your taxable business income, attracting substantial additional tax liability and statutory penalty.
              </p>

              <p>
                <strong>5. Demand Directive:</strong> You are hereby called upon to remit the total statutory demand of <strong>{formatINR(totalStatutoryDemand)}</strong> within <strong>{curePeriodDays} days</strong> of receipt of this notice into our designated corporate bank account (HDFC Bank Ltd, Account No: 50200084920194, IFSC: HDFC0000184).
              </p>

              <p>
                <strong>6. Notice of MSEFC Legal Escalation:</strong> In the event of default, our enterprise shall immediately file an application before the <strong>Micro & Small Enterprises Facilitation Council (MSEFC)</strong> via the MSME Samadhaan portal under Section 18 of the MSMED Act for formal recovery decree, execution, and credit bureau delinquency reporting.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 border-t border-slate-200 font-sans flex items-end justify-between">
              <div>
                <div className="text-[11px] text-slate-500 font-mono">Date: {noticeDate}</div>
                <div className="text-[11px] text-slate-500 font-mono">Place: Pune / Mumbai, Maharashtra</div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-slate-900">For {businessSettings.businessName}</div>
                <div className="h-8"></div>
                <div className="font-semibold text-slate-800">{signatoryName}</div>
                <div className="text-[11px] text-slate-500">Authorized Signatory / Legal Representative</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatched Notices Registry / History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-semibold text-sm text-slate-900">
              Statutory Demand Notice Registry & Recovery Status
            </h3>
            <p className="text-xs text-slate-500">
              Audit log of formal legal notices served to buyers with active cure countdowns.
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded">
            {noticeHistory.length} Notices Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Notice Ref No.</th>
                <th className="py-2.5 px-3">Target Customer</th>
                <th className="py-2.5 px-3">Date Served</th>
                <th className="py-2.5 px-3 text-right">Principal</th>
                <th className="py-2.5 px-3 text-right">Sec 16 Interest</th>
                <th className="py-2.5 px-3 text-right">Total Demand</th>
                <th className="py-2.5 px-3">Cure Window</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {noticeHistory.map(not => (
                <tr key={not.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-3 font-semibold text-slate-900">{not.refNo}</td>
                  <td className="py-3 px-3 font-sans font-medium text-slate-800">{not.customerName}</td>
                  <td className="py-3 px-3 text-slate-500">{not.date}</td>
                  <td className="py-3 px-3 text-right text-slate-700">{formatINR(not.principalAmount)}</td>
                  <td className="py-3 px-3 text-right text-emerald-700">+{formatINR(not.interestAmount)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">{formatINR(not.totalDemand)}</td>
                  <td className="py-3 px-3 font-sans text-slate-600">{not.cureDays} Days</td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        not.status === 'Settled'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : not.status === 'In Cure Period'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : not.status === 'Escalated to MSEFC'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {not.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MSME Samadhaan Guide Modal */}
      {showSamadhaanGuide && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-base text-slate-900">
                  MSME Samadhaan (MSEFC) Filing Guide
                </h3>
              </div>
              <button
                onClick={() => setShowSamadhaanGuide(false)}
                className="text-slate-400 hover:text-slate-600 text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                The <strong>Micro and Small Enterprise Facilitation Council (MSEFC)</strong> provides a statutory quasi-judicial recovery mechanism under Section 18 of the MSMED Act, 2006.
              </p>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900">Step-by-Step Recovery Process:</div>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                  <li><strong>Serve Statutory Notice:</strong> Issue this Section 15/16 Demand Notice with a 7-day cure window.</li>
                  <li><strong>Upload on MSME Samadhaan:</strong> Login to <em>samadhaan.msme.gov.in</em> using your Udyam Registration & mobile OTP.</li>
                  <li><strong>Submit Proof of Supply:</strong> Upload work order/purchase order, tax invoices, and proof of physical delivery / transport bilty.</li>
                  <li><strong>Council Conciliation:</strong> The Council summons the buyer for mutual settlement within 90 days.</li>
                  <li><strong>Arbitration Award:</strong> If conciliation fails, an enforceable legal recovery decree with 3x RBI compound interest is passed.</li>
                </ol>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] font-medium flex items-center gap-2">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>Buyer cannot appeal an MSEFC award in court without pre-depositing 75% of the decree amount.</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <a
                href="https://samadhaan.msme.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>Visit MSME Samadhaan Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowSamadhaanGuide(false)}
                className="px-4 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
