'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { CreditCard, ReceiptText, ShieldCheck, Sparkles, WalletCards, Send, RotateCw, Webhook, PlugZap } from 'lucide-react';
import {
  createMockInvoice,
  formatMoney,
  loadMockBillingState,
  nextStripeSessionId,
  saveMockBillingState,
  type MockBillingState,
  type MockInvoice,
  type MockStripeConfig,
} from '@/lib/mock-billing';

const PLANS = [
  { name: 'Starter', price: '$99', note: 'Simple CRM setup for solo operators.', features: ['Core CRM', 'Leads and routes', 'Email follow ups'] },
  { name: 'Growth', price: '$249', note: 'Most popular for active teams.', features: ['Automations', 'Reports', 'Calendar and tasks'] },
  { name: 'Scale', price: '$499', note: 'For teams that want every module turned on.', features: ['Billing tools', 'AI assistance', 'Field mode'] },
];

const BILLING_CUSTOMERS = ['Northside account', 'Maple Street group', 'Cedar Ridge client', 'Lake View account'];

const DEFAULT_FORM = {
  customer: 'Northside account',
  amount: '249',
  dueDate: '2026-06-01',
  notes: 'Mock invoice generated from CRM billing setup.',
};

export default function BillingPage() {
  const { enabledModules } = useDemoMode();
  const [state, setState] = useState<MockBillingState>(() => loadMockBillingState());
  const [invoiceForm, setInvoiceForm] = useState(DEFAULT_FORM);
  const [draftConfig, setDraftConfig] = useState<MockStripeConfig>(() => loadMockBillingState().config);
  const [officeSeats, setOfficeSeats] = useState(3);
  const [mobileSeats, setMobileSeats] = useState(6);

  useEffect(() => {
    const loaded = loadMockBillingState();
    setState(loaded);
    setDraftConfig(loaded.config);
  }, []);

  useEffect(() => {
    saveMockBillingState(state);
  }, [state]);

  const paidCount = useMemo(() => state.invoices.filter((invoice) => invoice.status === 'Paid').length, [state.invoices]);
  const openCount = useMemo(() => state.invoices.filter((invoice) => invoice.status === 'Sent' || invoice.status === 'Overdue').length, [state.invoices]);
  const draftCount = useMemo(() => state.invoices.filter((invoice) => invoice.status === 'Draft').length, [state.invoices]);
  const totalOpen = useMemo(() => state.invoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Void').reduce((sum, invoice) => sum + invoice.amount, 0), [state.invoices]);

  const updateConfig = () => {
    const nextState: MockBillingState = {
      ...state,
      config: draftConfig,
      activity: [`Mock Stripe settings saved for ${draftConfig.businessName}`, ...state.activity].slice(0, 12),
    };
    setState(nextState);
  };

  const connectStripe = () => {
    const nextState: MockBillingState = {
      ...state,
      config: {
        ...draftConfig,
        connected: true,
        accountName: draftConfig.businessName || 'Full CRM Demo',
      },
      activity: [`Mock Stripe account connected as ${draftConfig.businessName || 'Full CRM Demo'}`, ...state.activity].slice(0, 12),
    };
    setDraftConfig(nextState.config);
    setState(nextState);
  };

  const disconnectStripe = () => {
    const nextState: MockBillingState = {
      ...state,
      config: { ...state.config, connected: false },
      activity: ['Mock Stripe account disconnected', ...state.activity].slice(0, 12),
    };
    setDraftConfig(nextState.config);
    setState(nextState);
  };

  const addInvoice = () => {
    const invoice = createMockInvoice({
      customer: invoiceForm.customer,
      amount: Number(invoiceForm.amount || '0'),
      dueDate: invoiceForm.dueDate,
      notes: invoiceForm.notes,
    });

    setState((current) => ({
      ...current,
      invoices: [invoice, ...current.invoices],
      activity: [`Created invoice ${invoice.id} for ${invoice.customer}`, ...current.activity].slice(0, 12),
    }));
  };

  const sendInvoice = (invoiceId: string) => {
    setState((current) => {
      const invoice = current.invoices.find((item) => item.id === invoiceId);
      if (!invoice) return current;
      const updatedInvoice: MockInvoice = {
        ...invoice,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        stripeSessionId: nextStripeSessionId(),
      };

      return {
        ...current,
        invoices: current.invoices.map((item) => (item.id === invoiceId ? updatedInvoice : item)),
        activity: [`Sent invoice ${invoiceId} with a mock Stripe checkout link`, ...current.activity].slice(0, 12),
      };
    });
  };

  const markPaid = (invoiceId: string) => {
    setState((current) => ({
      ...current,
      invoices: current.invoices.map((item) => (
        item.id === invoiceId
          ? { ...item, status: 'Paid', paidAt: new Date().toISOString(), stripeSessionId: item.stripeSessionId || nextStripeSessionId() }
          : item
      )),
      activity: [`Mock Stripe webhook marked ${invoiceId} as paid`, ...current.activity].slice(0, 12),
    }));
  };

  const voidInvoice = (invoiceId: string) => {
    setState((current) => ({
      ...current,
      invoices: current.invoices.map((item) => (item.id === invoiceId ? { ...item, status: 'Void' } : item)),
      activity: [`Voided invoice ${invoiceId} in mock billing`, ...current.activity].slice(0, 12),
    }));
  };

  const resetDemo = () => {
    const fresh = loadMockBillingState();
    setState(fresh);
    setDraftConfig(fresh.config);
    setInvoiceForm(DEFAULT_FORM);
  };

  if (!enabledModules.billing) {
    return (
      <AppLayout title="Customer Billing">
        <ModuleGate title="Billing" description="Enable Billing in Feature Builder to show subscription tools." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Customer Billing">
      <div className="space-y-5">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-300">Customer billing</p>
                <h2 className="text-2xl font-bold mt-1">Send bills and collect customer payments</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-xl">This mock Stripe billing workspace is for customer invoices, payment links, receipts, and overdue tracking.</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <WalletCards size={26} className="text-sky-300" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Active customers</p>
                <p className="text-xl font-bold mt-1">24</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Open invoices</p>
                <p className="text-xl font-bold mt-1">{openCount}</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Paid invoices</p>
                <p className="text-xl font-bold mt-1">{paidCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-800">Mock Stripe setup</h3>
            </div>
            <div className="space-y-3 mt-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Business name</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={draftConfig.businessName} onChange={(event) => setDraftConfig((current) => ({ ...current, businessName: event.target.value }))} />
              </div>
              <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Publishable key</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono" value={draftConfig.publishableKey} onChange={(event) => setDraftConfig((current) => ({ ...current, publishableKey: event.target.value }))} />
              </div>
              <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Webhook URL</label>
                <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={draftConfig.webhookUrl} onChange={(event) => setDraftConfig((current) => ({ ...current, webhookUrl: event.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Descriptor</label>
                  <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={draftConfig.statementDescriptor} onChange={(event) => setDraftConfig((current) => ({ ...current, statementDescriptor: event.target.value }))} />
                </div>
                <div className="rounded-xl border border-gray-200 p-3 space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tax %</label>
                  <input type="number" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={draftConfig.taxPercent} onChange={(event) => setDraftConfig((current) => ({ ...current, taxPercent: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button onClick={updateConfig} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
                  <RotateCw size={15} /> Save settings
                </button>
                {state.config.connected ? (
                  <button onClick={disconnectStripe} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                    <PlugZap size={15} /> Disconnect
                  </button>
                ) : (
                  <button onClick={connectStripe} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-sm font-medium text-blue-700">
                    <PlugZap size={15} /> Connect mock Stripe
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <CreditCard size={17} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Create mock invoice</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={invoiceForm.customer} onChange={(event) => setInvoiceForm((current) => ({ ...current, customer: event.target.value }))}>
                  {BILLING_CUSTOMERS.map((customer) => <option key={customer}>{customer}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</label>
                <input type="number" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={invoiceForm.amount} onChange={(event) => setInvoiceForm((current) => ({ ...current, amount: event.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Due date</label>
                <input type="date" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={invoiceForm.dueDate} onChange={(event) => setInvoiceForm((current) => ({ ...current, dueDate: event.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={invoiceForm.notes} onChange={(event) => setInvoiceForm((current) => ({ ...current, notes: event.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={addInvoice} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                <ReceiptText size={15} /> Create invoice
              </button>
              <button onClick={resetDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                Reset demo data
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 mt-5">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Draft</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{draftCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Open</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{openCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Paid</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{paidCount}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Open total</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{formatMoney(totalOpen)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <Webhook size={17} className="text-violet-500" />
              <h3 className="font-semibold text-gray-800">Mock webhook and payment events</h3>
            </div>
            <div className="space-y-3 mt-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Current webhook endpoint</p>
                <p className="text-gray-600 mt-1 font-mono text-xs break-all">{draftConfig.webhookUrl}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Card payments</p>
                <p className="text-gray-600 mt-1">{draftConfig.allowCard ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">ACH payments</p>
                <p className="text-gray-600 mt-1">{draftConfig.allowACH ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Last event</p>
                <p className="text-gray-600 mt-1">{state.activity[0] || 'No events yet'}</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              In a real Stripe setup, these actions would map to checkout sessions, invoice webhooks, and payment confirmations from Stripe.
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-4">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <CreditCard size={17} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Seat control center</h3>
            </div>
            <p className="text-sm text-gray-600 mt-2">Align office and mobile licensing with how the demo sells the product to different roles.</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Office seats</label>
                <p className="text-gray-700 mt-1">Used by admins and dispatchers.</p>
                <input type="range" min={1} max={20} value={officeSeats} onChange={(event) => setOfficeSeats(Number(event.target.value))} className="w-full mt-3" />
                <p className="text-sm font-medium text-gray-800 mt-2">{officeSeats} seats</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mobile seats</label>
                <p className="text-gray-700 mt-1">Used by field techs and sales.</p>
                <input type="range" min={1} max={30} value={mobileSeats} onChange={(event) => setMobileSeats(Number(event.target.value))} className="w-full mt-3" />
                <p className="text-sm font-medium text-gray-800 mt-2">{mobileSeats} seats</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              <p className="font-semibold">Seat model summary</p>
              <p className="mt-1">Office roles: Admin and Dispatcher</p>
              <p>Mobile roles: Field tech and Sales</p>
              <p className="mt-2">Estimated monthly seat cost: ${((officeSeats * 89) + (mobileSeats * 39)).toLocaleString()}</p>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2">
              <ReceiptText size={17} className="text-violet-500" />
              <h3 className="font-semibold text-gray-800">Licensing links</h3>
            </div>
            <p className="text-sm text-gray-600">Tie the billing demo back to finance, team, and accounting sync so the buyer sees the full package story.</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                ['Open finance ops', '/finance'],
                ['Open team ops', '/team'],
                ['Open integrations', '/integrations'],
                ['Open marketplace', '/marketplace'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50">
                  {label}
                </Link>
              ))}
            </div>
            <div className="rounded-xl bg-slate-900 text-white p-4 text-sm">
              Demo note, billing stays fully simulated, but the seat controls, invoice flow, and sync points are all clickable.
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border shadow-sm p-5 ${plan.name === 'Growth' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Plan</p>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{plan.name}</h3>
                </div>
                {plan.name === 'Growth' && <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white">Popular</span>}
              </div>
              <p className="text-3xl font-bold text-gray-900 mt-4">{plan.price}<span className="text-sm font-medium text-gray-500"> / month</span></p>
              <p className="text-sm text-gray-600 mt-2">{plan.note}</p>
              <ul className="space-y-2 mt-4 text-sm text-gray-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">Select</button>
                <Link href="/feature-builder" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 text-center">Modules</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <ReceiptText size={17} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Invoices</h3>
            </div>
            <div className="space-y-3 mt-4">
              {state.invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-gray-200 px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.customer} · Due {invoice.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatMoney(invoice.amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.status}</p>
                  </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button onClick={() => sendInvoice(invoice.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                      <Send size={13} /> Send
                    </button>
                    <button onClick={() => markPaid(invoice.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50 text-xs font-medium text-green-700">
                      <CreditCard size={13} /> Mark paid
                    </button>
                    <button onClick={() => voidInvoice(invoice.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                      Void
                    </button>
                  </div>
                  {invoice.stripeSessionId && (
                    <p className="text-[11px] text-gray-500 mt-2 font-mono">Stripe session: {invoice.stripeSessionId}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Billing actions</h3>
              <p className="text-sm text-gray-600 mt-2">Use these controls to shape a proposal or manage the subscription review process.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ['Update payment method', '/settings'],
                ['Review package options', '/package-builder'],
                ['View invoices', '/invoices'],
                ['Check reports', '/reports'],
                ['Open finance ops', '/finance'],
                ['Open team ops', '/team'],
                ['Open marketplace', '/marketplace'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50">
                  {label}
                </Link>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              Billing in this demo focuses on customer invoicing, payment collection, and receipt tracking rather than live payment processing.
            </div>
            <div className="rounded-xl bg-slate-900 text-white p-4 text-sm">
              <p className="font-semibold">Webhook event log</p>
              <div className="space-y-2 mt-3 max-h-48 overflow-y-auto pr-1">
                {state.activity.map((entry) => (
                  <div key={entry} className="rounded-lg bg-white/10 px-3 py-2 text-slate-100 text-xs">
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}