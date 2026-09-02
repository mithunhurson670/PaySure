const BASE_URL = 'http://localhost:5000/api';

export const api = {
  getInitialData: async () => {
    const [custRes, dealsRes, invRes, payRes] = await Promise.all([
      fetch(`${BASE_URL}/customers`),
      fetch(`${BASE_URL}/deals`),
      fetch(`${BASE_URL}/invoices`),
      fetch(`${BASE_URL}/payments`),
    ]);
    return {
      customers: await custRes.json(),
      deals: await dealsRes.json(),
      invoices: await invRes.json(),
      payments: await payRes.json(),
    };
  },

  createCustomer: async (customerData: any) => {
    const res = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    return res.json();
  },

  createDeal: async (dealData: any) => {
    const res = await fetch(`${BASE_URL}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData),
    });
    return res.json();
  },

  acceptDeal: async (dealId: string) => {
    const res = await fetch(`${BASE_URL}/deals/${dealId}/accept`, {
      method: 'PATCH',
    });
    return res.json();
  },

  recordPayment: async (paymentData: any) => {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return res.json();
  },

  getCommitments: async () => {
    const res = await fetch(`${BASE_URL}/commitments`);
    return res.json();
  },

  createCommitment: async (commitmentData: any) => {
    const res = await fetch(`${BASE_URL}/commitments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(commitmentData),
    });
    return res.json();
  },
};