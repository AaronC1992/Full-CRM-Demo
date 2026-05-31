'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { RefreshCw, Link2, CheckCircle2, AlertTriangle, Wallet } from 'lucide-react';

type SyncEvent = {
  id: string;
  source: 'QuickBooks' | 'Bank feed' | 'Stripe' | 'CRM';
  detail: string;
  amount: number;
  status: 'Synced' | 'Pending' | 'Needs review';
};

const STORAGE_KEY = 'fullcrmdemo_integrations_v1';

const DEFAULT_EVENTS: SyncEvent[] = [
  { id: 'I-1001', source: 'QuickBooks', detail: 'Invoice INV 3001 pushed to ledger', amount: 640, status: 'Synced' },
  { id: 'I-1002', source: 'Bank feed', detail: 'Deposit matched to payment batch', amount: 1200, status: 'Synced' },
  { id: 'I-1003', source: 'Stripe', detail: 'Card payment waiting for settlement', amount: 480, status: 'Pending' },
  { id: 'I-1004', source: 'CRM', detail: 'Customer record ready for chart of accounts mapping', amount: 0, status: 'Needs review' },
];

function loadEvents() {
  if (typeof window === 'undefined') return DEFAULT_EVENTS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EVENTS;
    const parsed = JSON.parse(raw) as SyncEvent[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_EVENTS;
  } catch {
    return DEFAULT_EVENTS;
  }
}

export default function IntegrationsPage() {
  const { enabledModules } = useDemoMode();
  const [events, setEvents] = useState<SyncEvent[]>(DEFAULT_EVENTS);
  const [quickBooksConnected, setQuickBooksConnected] = useState(true);
  const [bankFeedConnected, setBankFeedConnected] = useState(true);

  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const totals = useMemo(() => ({
    synced: events.filter((event) => event.status === 'Synced').length,
    pending: events.filter((event) => event.status === 'Pending').length,
    review: events.filter((event) => event.status === 'Needs review').length,
    amount: events.reduce((sum, event) => sum + event.amount, 0),
  }), [events]);

  if (!enabledModules['accounting-sync']) {
    return (
      <AppLayout title="Integrations">
        <ModuleGate title="Accounting sync" description="Enable Accounting sync in Feature Builder to show QuickBooks style ledger mapping." />
      </AppLayout>
    );
  }

  const addEvent = (source: SyncEvent['source'], detail: string, amount: number, status: SyncEvent['status']) => {
    setEvents((current) => [
      { id: `I-${Date.now().toString().slice(-4)}`, source, detail, amount, status },
      ...current,
    ]);
  };

  const runSync = () => {
    addEvent('QuickBooks', 'Sync run completed across customers, invoices, and payments', 0, 'Synced');
  };

  const resetDemo = () => {
    setEvents(DEFAULT_EVENTS);
    setQuickBooksConnected(true);
    setBankFeedConnected(true);
  };

  return (
    <AppLayout title="Integrations">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Synced</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.synced}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.pending}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Needs review</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.review}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Sync amount</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${totals.amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Link2 size={16} className="text-blue-500" />
                <h2 className="font-semibold text-gray-800">QuickBooks style sync</h2>
              </div>
              <button type="button" onClick={resetDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                <RefreshCw size={15} /> Reset demo
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">QuickBooks</p>
                <p className="text-sm text-gray-700 mt-2">Customers, invoices, payments, and classes stay mapped to accounting friendly records.</p>
                <button type="button" onClick={() => setQuickBooksConnected((current) => !current)} className="mt-3 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                  {quickBooksConnected ? 'Disconnect' : 'Connect'} QuickBooks
                </button>
              </div>
              <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Bank feed</p>
                <p className="text-sm text-gray-700 mt-2">Payment batches and bank deposits are matched back to customer invoices for review.</p>
                <button type="button" onClick={() => setBankFeedConnected((current) => !current)} className="mt-3 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                  {bankFeedConnected ? 'Disconnect' : 'Connect'} bank feed
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mapped objects</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700">
                <p>Customers to contacts</p>
                <p>Invoices to transactions</p>
                <p>Payments to deposits</p>
                <p>Jobs to classes</p>
                <p>Tax codes to regions</p>
                <p>Expenses to ledger categories</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 text-white p-4 text-sm">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-sky-300" />
                Accounting grade reconciliation summary
              </div>
              <p className="text-slate-300 mt-2">Use this mock sync to show how the CRM can mirror QuickBooks style bookkeeping and payment reconciliation without leaving the demo.</p>
            </div>

            <button type="button" onClick={runSync} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
              <CheckCircle2 size={15} /> Run sync
            </button>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h2 className="font-semibold text-gray-800">Sync activity</h2>
            </div>
            <div className="space-y-2 mt-3 max-h-[30rem] overflow-y-auto pr-1">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-200 p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{event.source}</p>
                      <p className="text-xs text-gray-500 mt-1">{event.detail}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${event.status === 'Synced' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : event.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <p>{event.id}</p>
                    <p>${event.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}