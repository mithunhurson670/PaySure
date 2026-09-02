import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const USER_ID = process.env.DEFAULT_USER_ID;

if (!USER_ID || USER_ID.includes('PASTE')) {
  console.error('CRITICAL: DEFAULT_USER_ID in .env is missing or invalid.');
}

app.use(express.json());

// Request logger & CORS
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Seed baseline customers if table is empty
async function seedDefaultCustomers() {
  if (!USER_ID) return;
  const { data } = await supabase.from('customers').select('id');
  if (!data || data.length === 0) {
    console.log('Seeding baseline MSME customers...');
    await supabase.from('customers').insert([
      {
        id: 'cust-1',
        user_id: USER_ID,
        name: 'ABC Foods Pvt. Ltd.',
        category: 'Corporate',
        health_status: 'Healthy',
        health_score: 92,
        total_business: 3240000,
        total_paid: 2880000,
        outstanding: 360000,
        current_exposure: 360000,
        average_payment_days: 28,
        contact_person: 'Sunil Mehta (Procurement Lead)',
        phone: '+91 98210 99401',
        email: 'sunil.mehta@abcfoods.in',
        address: 'Plot 42, MIDC Industrial Area, Andheri East, Mumbai',
        joined_date: '2024-03-15',
      },
      {
        id: 'cust-2',
        user_id: USER_ID,
        name: 'GreenMart Industries Pvt. Ltd.',
        category: 'Wholesale',
        health_status: 'Watch',
        health_score: 72,
        total_business: 2200000,
        total_paid: 1700000,
        outstanding: 500000,
        current_exposure: 500000,
        average_payment_days: 32,
        contact_person: 'Vikram Sethi (Finance Manager)',
        phone: '+91 98402 77112',
        email: 'vikram.sethi@greenmart.co.in',
        address: 'Phase 2, Turbhe, Navi Mumbai',
        joined_date: '2024-07-20',
      },
    ]);
  }
}
seedDefaultCustomers();

// 1. GET Customers
app.get('/api/customers', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((c: any) => ({
    id: c.id,
    name: c.name,
    category: c.category,
    healthStatus: c.health_status,
    healthScore: c.health_score,
    totalBusiness: Number(c.total_business || 0),
    totalPaid: Number(c.total_paid || 0),
    outstanding: Number(c.outstanding || 0),
    dueThisWeek: Number(c.due_this_week || 0),
    overdueAmount: Number(c.overdue_amount || 0),
    underDisputeAmount: Number(c.under_dispute_amount || 0),
    averagePaymentDays: Number(c.average_payment_days || 30),
    paymentBehaviourStatus: c.payment_behaviour_status || 'Stable',
    onTimePaymentRate: Number(c.on_time_payment_rate || 100),
    latePaymentsCount: Number(c.late_payments_count || 0),
    activeDealsCount: Number(c.active_deals_count || 0),
    openDisputesCount: Number(c.open_disputes_count || 0),
    missedCommitmentsCount: Number(c.missed_commitments_count || 0),
    currentExposure: Number(c.current_exposure ?? c.outstanding ?? 0),
    whyScoreReasons: c.why_score_reasons || [],
    contactPerson: c.contact_person,
    phone: c.phone,
    email: c.email,
    gstNo: c.gst_no,
    address: c.address,
    joinedDate: c.joined_date,
  }));
  res.json(mapped);
});

// 2. POST Customer (New Customer Creation)
app.post('/api/customers', async (req, res) => {
  const c = req.body;
  const id = c.id || `cust-${Date.now()}`;
  const initialOutstanding = Number(c.outstanding || 0);

  const row = {
    id,
    user_id: USER_ID,
    name: c.name,
    category: c.category || 'Corporate',
    health_status: c.healthStatus || 'Healthy',
    health_score: Number(c.healthScore || 85),
    total_business: Number(c.totalBusiness || 0),
    total_paid: Number(c.totalPaid || 0),
    outstanding: initialOutstanding,
    due_this_week: Number(c.dueThisWeek || 0),
    overdue_amount: Number(c.overdueAmount || 0),
    under_dispute_amount: Number(c.underDisputeAmount || 0),
    average_payment_days: Number(c.averagePaymentDays || 30),
    payment_behaviour_status: c.paymentBehaviourStatus || 'Stable',
    on_time_payment_rate: Number(c.onTimePaymentRate || 100),
    late_payments_count: Number(c.latePaymentsCount || 0),
    active_deals_count: Number(c.activeDealsCount || 0),
    open_disputes_count: Number(c.openDisputesCount || 0),
    missed_commitments_count: Number(c.missedCommitmentsCount || 0),
    current_exposure: Number(c.currentExposure ?? initialOutstanding),
    why_score_reasons: c.whyScoreReasons || [
      { type: 'positive', text: 'Baseline onboarding health rating assigned.' },
    ],
    contact_person: c.contactPerson || c.name || 'Primary Contact',
    phone: c.phone || '+91 99999 99999',
    email: c.email || `${id}@example.com`,
    gst_no: c.gstNo || null,
    address: c.address || 'India',
    joined_date: c.joinedDate || new Date().toISOString().split('T')[0],
  };

  const { error } = await supabase.from('customers').insert([row]);
  if (error) {
    console.error('Insert Customer Error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log(`[Supabase] Created customer: "${c.name}" with ID: ${id}`);
  res.status(201).json({ ...c, id });
});

// 3. GET Deals
app.get('/api/deals', async (req, res) => {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((d: any) => ({
    id: d.id,
    dealNumber: d.deal_number,
    customerId: d.customer_id,
    customerName: d.customer_name,
    orderValue: Number(d.order_value || 0),
    advancePercent: Number(d.advance_percent || 0),
    advanceAmount: Number(d.advance_amount || 0),
    remainingReceivable: Number(d.remaining_receivable || 0),
    paymentPeriodDays: Number(d.payment_period_days || 0),
    estimatedFulfillmentCost: Number(d.estimated_fulfillment_cost || 0),
    availableWorkingCapital: Number(d.available_working_capital || 0),
    workingCapitalGap: Number(d.working_capital_gap || 0),
    advanceCoveragePercent: Number(d.advance_coverage_percent || 0),
    expectedMargin: Number(d.expected_margin || 0),
    expectedMarginPercent: Number(d.expected_margin_percent || 0),
    riskStatus: d.risk_status,
    status: d.status,
    whyReasons: d.why_reasons || [],
    notes: d.notes,
    createdAt: d.created_at,
    acceptedAt: d.accepted_at,
  }));
  res.json(mapped);
});

// 4. POST Deals
app.post('/api/deals', async (req, res) => {
  const d = req.body;
  const id = d.id || `deal-${Date.now()}`;
  const dealNumber = d.dealNumber || `DEAL-2026-${Math.floor(100 + Math.random() * 900)}`;
  const createdAt = new Date().toISOString().split('T')[0];

  const row = {
    id,
    user_id: USER_ID,
    deal_number: dealNumber,
    customer_id: d.customerId,
    customer_name: d.customerName,
    order_value: d.orderValue,
    advance_percent: d.advancePercent,
    advance_amount: d.advanceAmount,
    remaining_receivable: d.remainingReceivable,
    payment_period_days: d.paymentPeriodDays,
    estimated_fulfillment_cost: d.estimatedFulfillmentCost,
    available_working_capital: d.availableWorkingCapital,
    working_capital_gap: d.workingCapitalGap,
    advance_coverage_percent: d.advanceCoveragePercent,
    expected_margin: d.expectedMargin,
    expected_margin_percent: d.expectedMarginPercent,
    risk_status: d.riskStatus,
    status: 'Analyzed',
    why_reasons: d.whyReasons || [],
    notes: d.notes,
    created_at: createdAt,
  };

  const { error } = await supabase.from('deals').insert([row]);
  if (error) {
    console.error('Insert Deal Error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ ...d, id, dealNumber, createdAt, status: 'Analyzed' });
});

// 5. GET Invoices
app.get('/api/invoices', async (req, res) => {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((i: any) => ({
    id: i.id,
    invoiceNumber: i.invoice_number,
    dealId: i.deal_id,
    customerId: i.customer_id,
    customerName: i.customer_name,
    amount: Number(i.amount || 0),
    paidAmount: Number(i.paid_amount || 0),
    remainingAmount: Number(i.remaining_amount || 0),
    issueDate: i.issue_date,
    dueDate: i.due_date,
    status: i.status,
    notes: i.notes,
    items: [],
  }));
  res.json(mapped);
});

// 6. GET Payments
app.get('/api/payments', async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('payment_date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((p: any) => ({
    id: p.id,
    customerId: p.customer_id,
    customerName: p.customer_name,
    invoiceId: p.invoice_id,
    invoiceNumber: p.invoice_number,
    amount: Number(p.amount || 0),
    date: p.payment_date,
    paymentType: p.payment_type,
    referenceNumber: p.reference_number,
    remainingBalanceAfter: Number(p.remaining_balance_after || 0),
    notes: p.notes,
  }));
  res.json(mapped);
});

// 7. POST Payment & Balance Reconciliation
app.post('/api/payments', async (req, res) => {
  const { customerId, invoiceId, amount, paymentType, referenceNumber, notes } = req.body;

  const { data: invoice } = await supabase.from('invoices').select('*').eq('id', invoiceId).single();
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const newPaid = Number(invoice.paid_amount || 0) + Number(amount);
  const newRemaining = Math.max(0, Number(invoice.amount) - newPaid);
  const newStatus = newRemaining === 0 ? 'Paid' : 'Partial';

  await supabase
    .from('invoices')
    .update({
      paid_amount: newPaid,
      remaining_amount: newRemaining,
      status: newStatus,
    })
    .eq('id', invoiceId);

  const paymentRecord = {
    id: `pay-${Date.now()}`,
    user_id: USER_ID,
    customer_id: customerId,
    customer_name: invoice.customer_name,
    invoice_id: invoiceId,
    invoice_number: invoice.invoice_number,
    amount: Number(amount),
    payment_date: new Date().toISOString().split('T')[0],
    payment_type: paymentType || 'Bank Transfer',
    reference_number: referenceNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    remaining_balance_after: newRemaining,
    notes: notes || '',
  };

  const { error: payErr } = await supabase.from('payments').insert([paymentRecord]);
  if (payErr) return res.status(500).json({ error: payErr.message });

  // Update Customer balances & current exposure
  const { data: customer } = await supabase.from('customers').select('*').eq('id', customerId).single();
  if (customer) {
    const updatedOutstanding = Math.max(0, Number(customer.outstanding || 0) - Number(amount));
    await supabase
      .from('customers')
      .update({
        total_paid: Number(customer.total_paid || 0) + Number(amount),
        outstanding: updatedOutstanding,
        current_exposure: updatedOutstanding,
      })
      .eq('id', customerId);
  }

  // If this invoice is fully settled, mark any upcoming payment commitment as honoured
  if (newRemaining === 0) {
    try {
      await supabase
        .from('commitments')
        .update({
          status: 'Honoured',
          actual_payment_date: new Date().toISOString().split('T')[0],
        })
        .eq('invoice_id', invoiceId)
        .eq('status', 'Upcoming');
    } catch {
      // safe fallback if commitments table is optional
    }
  }

  console.log(`[Supabase] Recorded payment ₹${amount} for ${invoice.invoice_number}`);
  res.status(201).json({ payment: paymentRecord });
});

// 8. GET Commitments (Customer Payment Promises)
app.get('/api/commitments', async (req, res) => {
  const { data, error } = await supabase
    .from('commitments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((cm: any) => ({
    id: cm.id,
    customerId: cm.customer_id,
    customerName: cm.customer_name,
    invoiceId: cm.invoice_id,
    invoiceNumber: cm.invoice_number,
    amount: Number(cm.amount || 0),
    promisedDate: cm.promised_date,
    actualPaymentDate: cm.actual_payment_date,
    status: cm.status,
    notes: cm.notes,
  }));
  res.json(mapped);
});

// 9. POST Commitment
app.post('/api/commitments', async (req, res) => {
  const cm = req.body;
  const id = cm.id || `comm-${Date.now()}`;

  const row = {
    id,
    user_id: USER_ID,
    customer_id: cm.customerId,
    customer_name: cm.customerName,
    invoice_id: cm.invoiceId || null,
    invoice_number: cm.invoiceNumber || null,
    amount: Number(cm.amount || 0),
    promised_date: cm.promisedDate,
    status: cm.status || 'Upcoming',
    notes: cm.notes || '',
  };

  const { error } = await supabase.from('commitments').insert([row]);
  if (error) {
    console.error('Insert Commitment Error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log(`[Supabase] Created commitment: ${id} for ${cm.customerName}`);
  res.status(201).json({ ...cm, id });
});

// 10. PATCH Mark Commitment Honoured
app.patch('/api/commitments/:id/honour', async (req, res) => {
  const commId = req.params.id;
  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase
    .from('commitments')
    .update({ status: 'Honoured', actual_payment_date: today })
    .eq('id', commId);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, actualPaymentDate: today });
});

// 11. GET Disputes
app.get('/api/disputes', async (req, res) => {
  const { data, error } = await supabase
    .from('disputes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  const mapped = data.map((d: any) => ({
    id: d.id,
    customerId: d.customer_id,
    customerName: d.customer_name,
    invoiceId: d.invoice_id,
    invoiceNumber: d.invoice_number,
    disputeReason: d.dispute_reason,
    amountAffected: Number(d.amount_affected || 0),
    raisedDate: d.raised_date,
    resolvedDate: d.resolved_date,
    status: d.status,
    resolutionNotes: d.resolution_notes,
  }));
  res.json(mapped);
});

// 12. POST Dispute
app.post('/api/disputes', async (req, res) => {
  const d = req.body;
  const id = d.id || `disp-${Date.now()}`;

  const row = {
    id,
    user_id: USER_ID,
    customer_id: d.customerId,
    customer_name: d.customerName,
    invoice_id: d.invoiceId,
    invoice_number: d.invoiceNumber,
    dispute_reason: d.disputeReason,
    amount_affected: Number(d.amountAffected || 0),
    raised_date: d.raisedDate || new Date().toISOString().split('T')[0],
    status: d.status || 'Open',
    resolution_notes: d.resolutionNotes || '',
  };

  const { error } = await supabase.from('disputes').insert([row]);
  if (error) return res.status(500).json({ error: error.message });

  // Update Customer dispute count & dispute total
  const { data: customer } = await supabase.from('customers').select('*').eq('id', d.customerId).single();
  if (customer) {
    await supabase
      .from('customers')
      .update({
        open_disputes_count: Number(customer.open_disputes_count || 0) + 1,
        under_dispute_amount: Number(customer.under_dispute_amount || 0) + Number(d.amountAffected || 0),
      })
      .eq('id', d.customerId);
  }

  res.status(201).json({ ...d, id });
});

// 13. PATCH Resolve Dispute
app.patch('/api/disputes/:id/resolve', async (req, res) => {
  const disputeId = req.params.id;
  const { resolutionNotes } = req.body;
  const today = new Date().toISOString().split('T')[0];

  const { data: disp } = await supabase.from('disputes').select('*').eq('id', disputeId).single();
  if (!disp) return res.status(404).json({ error: 'Dispute not found' });

  await supabase
    .from('disputes')
    .update({
      status: 'Resolved',
      resolved_date: today,
      resolution_notes: resolutionNotes || 'Resolved amicably',
    })
    .eq('id', disputeId);

  const { data: customer } = await supabase.from('customers').select('*').eq('id', disp.customer_id).single();
  if (customer) {
    await supabase
      .from('customers')
      .update({
        open_disputes_count: Math.max(0, Number(customer.open_disputes_count || 0) - 1),
        under_dispute_amount: Math.max(0, Number(customer.under_dispute_amount || 0) - Number(disp.amount_affected || 0)),
      })
      .eq('id', disp.customer_id);
  }

  res.json({ success: true, resolvedDate: today });
});

// 14. PATCH Accept Deal (Multi-Table Transaction)
app.patch('/api/deals/:id/accept', async (req, res) => {
  const dealId = req.params.id;

  const { data: deal, error: dealErr } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (dealErr || !deal) return res.status(404).json({ error: 'Deal not found' });

  const today = new Date().toISOString().split('T')[0];
  const dueDate = new Date(Date.now() + Number(deal.payment_period_days) * 86400000).toISOString().split('T')[0];
  const invoiceId = `inv-${Date.now()}`;
  const invoiceNumber = `INV-2026-${Math.floor(200 + Math.random() * 800)}`;
  const invStatus = Number(deal.advance_amount) >= Number(deal.order_value) ? 'Paid' : Number(deal.advance_amount) > 0 ? 'Partial' : 'Due';

  // Step A: Update Deal
  await supabase.from('deals').update({ status: 'Accepted', accepted_at: today }).eq('id', dealId);

  // Step B: Insert Invoice
  const invoiceRow = {
    id: invoiceId,
    user_id: USER_ID,
    invoice_number: invoiceNumber,
    deal_id: deal.id,
    customer_id: deal.customer_id,
    customer_name: deal.customer_name,
    amount: deal.order_value,
    paid_amount: deal.advance_amount,
    remaining_amount: deal.remaining_receivable,
    issue_date: today,
    due_date: dueDate,
    status: invStatus,
    notes: `Contract accepted: ${deal.deal_number}`,
  };
  const { error: invErr } = await supabase.from('invoices').insert([invoiceRow]);
  if (invErr) {
    console.error('Invoice creation failed:', invErr.message);
    return res.status(500).json({ error: invErr.message });
  }

  // Step C: Insert Advance Payment (if advance > 0)
  let paymentRow: any = null;
  if (Number(deal.advance_amount) > 0) {
    paymentRow = {
      id: `pay-${Date.now()}`,
      user_id: USER_ID,
      customer_id: deal.customer_id,
      customer_name: deal.customer_name,
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      amount: deal.advance_amount,
      payment_date: today,
      payment_type: 'Advance Payment',
      reference_number: `ADV-${Math.floor(100000 + Math.random() * 900000)}`,
      remaining_balance_after: deal.remaining_receivable,
      notes: `Upfront advance (${deal.advance_percent}%) received`,
    };
    await supabase.from('payments').insert([paymentRow]);
  }

  // Step D: Insert Commitment for Remaining Balance (if any)
  let commitmentRow: any = null;
  if (Number(deal.remaining_receivable) > 0) {
    commitmentRow = {
      id: `comm-${Date.now()}`,
      user_id: USER_ID,
      customer_id: deal.customer_id,
      customer_name: deal.customer_name,
      invoice_id: invoiceId,
      invoice_number: invoiceNumber,
      amount: Number(deal.remaining_receivable),
      promised_date: dueDate,
      status: 'Upcoming',
      notes: `Expected remaining settlement at ${deal.payment_period_days} days credit maturity.`,
    };
    try {
      await supabase.from('commitments').insert([commitmentRow]);
    } catch {
      // safe fallback if commitments table is optional
    }
  }

  // Step E: Update Customer Ledger & Current Exposure
  const { data: customer } = await supabase.from('customers').select('*').eq('id', deal.customer_id).single();
  if (customer) {
    const updatedOutstanding = Number(customer.outstanding || 0) + Number(deal.remaining_receivable);
    await supabase
      .from('customers')
      .update({
        total_business: Number(customer.total_business || 0) + Number(deal.order_value),
        total_paid: Number(customer.total_paid || 0) + Number(deal.advance_amount),
        outstanding: updatedOutstanding,
        current_exposure: updatedOutstanding,
        active_deals_count: Number(customer.active_deals_count || 0) + 1,
      })
      .eq('id', deal.customer_id);
  }

  console.log(`Successfully accepted deal ${deal.deal_number} and created invoice ${invoiceNumber}`);

  res.json({
    deal: { ...deal, status: 'Accepted', acceptedAt: today },
    invoice: {
      id: invoiceId,
      invoiceNumber,
      dealId: deal.id,
      customerId: deal.customer_id,
      customerName: deal.customer_name,
      amount: Number(deal.order_value),
      paidAmount: Number(deal.advance_amount),
      remainingAmount: Number(deal.remaining_receivable),
      issueDate: today,
      dueDate,
      status: invStatus,
      items: [],
      notes: `Contract accepted: ${deal.deal_number}`,
    },
    payment: paymentRow
      ? {
          id: paymentRow.id,
          customerId: paymentRow.customer_id,
          customerName: paymentRow.customer_name,
          invoiceId: paymentRow.invoice_id,
          invoiceNumber: paymentRow.invoice_number,
          amount: Number(paymentRow.amount),
          date: paymentRow.payment_date,
          paymentType: paymentRow.payment_type,
          referenceNumber: paymentRow.reference_number,
          remainingBalanceAfter: Number(paymentRow.remaining_balance_after),
          notes: paymentRow.notes,
        }
      : null,
    commitment: commitmentRow
      ? {
          id: commitmentRow.id,
          customerId: commitmentRow.customer_id,
          customerName: commitmentRow.customer_name,
          invoiceId: commitmentRow.invoice_id,
          invoiceNumber: commitmentRow.invoice_number,
          amount: Number(commitmentRow.amount),
          promisedDate: commitmentRow.promised_date,
          status: commitmentRow.status,
          notes: commitmentRow.notes,
        }
      : null,
  });
});

app.listen(PORT, () => {
  console.log(`PaySure Express Server connected to Supabase at http://localhost:${PORT}`);
});