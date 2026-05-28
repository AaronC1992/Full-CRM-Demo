export type MockBillingStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Void';

export interface MockStripeConfig {
  connected: boolean;
  accountName: string;
  businessName: string;
  publishableKey: string;
  webhookUrl: string;
  statementDescriptor: string;
  supportEmail: string;
  taxPercent: number;
  allowCard: boolean;
  allowACH: boolean;
}

export interface MockInvoice {
  id: string;
  customer: string;
  amount: number;
  currency: 'USD';
  status: MockBillingStatus;
  dueDate: string;
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
  stripeSessionId?: string;
  notes?: string;
}

export interface MockBillingState {
  config: MockStripeConfig;
  invoices: MockInvoice[];
  activity: string[];
}

const STORAGE_KEY = 'fullcrmdemo_mock_billing_state';

const DEFAULT_CONFIG: MockStripeConfig = {
  connected: false,
  accountName: 'Full CRM Demo',
  businessName: 'Full CRM Demo LLC',
  publishableKey: 'pk_test_demo_12345',
  webhookUrl: 'https://example.com/api/stripe/webhook',
  statementDescriptor: 'FULLCRMDEMO',
  supportEmail: 'billing@fullcrmdemo.com',
  taxPercent: 0,
  allowCard: true,
  allowACH: false,
};

const DEFAULT_INVOICES: MockInvoice[] = [
  {
    id: 'INV-3301',
    customer: 'Northside account',
    amount: 2100,
    currency: 'USD',
    status: 'Draft',
    dueDate: '2026-05-30',
    createdAt: '2026-05-20T14:20:00.000Z',
    notes: 'Recurring CRM subscription with onboarding support.',
  },
  {
    id: 'INV-3302',
    customer: 'Maple Street group',
    amount: 3450,
    currency: 'USD',
    status: 'Sent',
    dueDate: '2026-05-29',
    createdAt: '2026-05-18T15:00:00.000Z',
    sentAt: '2026-05-18T15:10:00.000Z',
    stripeSessionId: 'cs_test_2demoSent',
    notes: 'Payment link emailed to billing contact.',
  },
  {
    id: 'INV-3303',
    customer: 'Cedar Ridge client',
    amount: 5800,
    currency: 'USD',
    status: 'Paid',
    dueDate: '2026-05-20',
    createdAt: '2026-05-10T11:00:00.000Z',
    sentAt: '2026-05-10T11:05:00.000Z',
    paidAt: '2026-05-12T09:34:00.000Z',
    stripeSessionId: 'cs_test_paidDemo',
    notes: 'Marked paid in the mock Stripe webhook.' ,
  },
];

function buildDefaultState(): MockBillingState {
  return {
    config: DEFAULT_CONFIG,
    invoices: DEFAULT_INVOICES,
    activity: [
      'Mock Stripe account initialized',
      'Invoice INV-3302 sent with payment link',
      'Invoice INV-3303 payment confirmed',
    ],
  };
}

export function getDefaultMockBillingState(): MockBillingState {
  return buildDefaultState();
}

export function loadMockBillingState(): MockBillingState {
  if (typeof window === 'undefined') return buildDefaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildDefaultState();
    const parsed = JSON.parse(raw) as Partial<MockBillingState>;
    return {
      config: { ...DEFAULT_CONFIG, ...(parsed.config || {}) },
      invoices: Array.isArray(parsed.invoices) && parsed.invoices.length > 0 ? parsed.invoices as MockInvoice[] : DEFAULT_INVOICES,
      activity: Array.isArray(parsed.activity) && parsed.activity.length > 0 ? parsed.activity as string[] : buildDefaultState().activity,
    };
  } catch {
    return buildDefaultState();
  }
}

export function saveMockBillingState(state: MockBillingState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createMockInvoice(input: {
  customer: string;
  amount: number;
  dueDate: string;
  notes?: string;
}) {
  const now = new Date().toISOString();
  const random = Math.floor(Math.random() * 900) + 100;
  return {
    id: `INV-${Date.now().toString().slice(-4)}-${random}`,
    customer: input.customer,
    amount: input.amount,
    currency: 'USD' as const,
    status: 'Draft' as const,
    dueDate: input.dueDate,
    createdAt: now,
    notes: input.notes,
  } satisfies MockInvoice;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function nextStripeSessionId() {
  return `cs_test_${Math.random().toString(36).slice(2, 10)}`;
}