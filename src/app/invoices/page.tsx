'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import Link from 'next/link';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { formatMoney, loadMockBillingState, saveMockBillingState, type MockBillingState, type MockInvoice } from '@/lib/mock-billing';
import { CreditCard, ExternalLink, Send, ShieldCheck } from 'lucide-react';

export default function InvoicesPage() {
  const { enabledModules } = useDemoMode();
  const [billingState, setBillingState] = useState<MockBillingState>(() => loadMockBillingState());

  useEffect(() => {
    const state = loadMockBillingState();
    setBillingState(state);
  }, []);

  useEffect(() => {
    saveMockBillingState(billingState);
  }, [billingState]);

  const invoices = billingState.invoices;

  const totalOpen = useMemo(() => invoices.filter((invoice) => invoice.status !== 'Paid' && invoice.status !== 'Void').reduce((sum, invoice) => sum + invoice.amount, 0), [invoices]);

  const sendInvoice = (invoiceId: string) => {
    setBillingState((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) => (
        invoice.id === invoiceId
          ? { ...invoice, status: 'Sent', sentAt: new Date().toISOString(), stripeSessionId: invoice.stripeSessionId || `cs_test_${Math.random().toString(36).slice(2, 10)}` }
          : invoice
      )),
      activity: [`Sent invoice ${invoiceId} from the invoice list`, ...current.activity].slice(0, 12),
    }));
  };

  const markPaid = (invoiceId: string) => {
    setBillingState((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) => (
        invoice.id === invoiceId
          ? { ...invoice, status: 'Paid', paidAt: new Date().toISOString(), stripeSessionId: invoice.stripeSessionId || `cs_test_${Math.random().toString(36).slice(2, 10)}` }
          : invoice
      )),
      activity: [`Marked invoice ${invoiceId} as paid`, ...current.activity].slice(0, 12),
    }));
  };

  if (!enabledModules.invoices) {
    return (
      <AppLayout title="Invoices">
        <ModuleGate title="Invoices" description="Enable Invoices in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Invoices">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-gray-800">Invoice center</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Mock Stripe invoice flow, no real money moves in demo mode.</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Open total</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatMoney(totalOpen)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Invoices</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{invoices.length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Paid</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{invoices.filter((invoice) => invoice.status === 'Paid').length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Open</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{invoices.filter((invoice) => invoice.status === 'Sent' || invoice.status === 'Overdue').length}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Invoice</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Due</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium text-gray-800">{invoice.id}</td>
                  <td className="px-4 py-3 text-gray-700">{invoice.customer}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{formatMoney(invoice.amount)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{invoice.status}</span>
                    {invoice.stripeSessionId && <p className="text-[11px] text-gray-400 mt-1 font-mono">{invoice.stripeSessionId}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{invoice.dueDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => sendInvoice(invoice.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                        <Send size={13} /> Send
                      </button>
                      <button onClick={() => markPaid(invoice.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-green-200 bg-green-50 text-xs font-medium text-green-700">
                        <CreditCard size={13} /> Paid
                      </button>
                      <Link href="/billing" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700">
                        Billing <ExternalLink size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700">
          PDF style invoice preview is available here for demo calls. It is not connected to real payments.
        </div>
      </div>
    </AppLayout>
  );
}
