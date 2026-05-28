'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { CreditCard, ReceiptText, ShieldCheck, Sparkles, WalletCards } from 'lucide-react';

const PLANS = [
  { name: 'Starter', price: '$99', note: 'Simple CRM setup for solo operators.', features: ['Core CRM', 'Leads and routes', 'Email follow ups'] },
  { name: 'Growth', price: '$249', note: 'Most popular for active teams.', features: ['Automations', 'Reports', 'Calendar and tasks'] },
  { name: 'Scale', price: '$499', note: 'For teams that want every module turned on.', features: ['Billing tools', 'AI assistance', 'Field mode'] },
];

const INVOICES = [
  { id: 'INV 2401', amount: '$249', status: 'Paid', date: 'May 01' },
  { id: 'INV 2402', amount: '$249', status: 'Open', date: 'Jun 01' },
  { id: 'INV 2403', amount: '$499', status: 'Draft', date: 'Jun 15' },
];

export default function BillingPage() {
  const { enabledModules } = useDemoMode();

  if (!enabledModules.billing) {
    return (
      <AppLayout title="Billing">
        <ModuleGate title="Billing" description="Enable Billing in Feature Builder to show subscription tools." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Billing">
      <div className="space-y-5">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-300">Subscription management</p>
                <h2 className="text-2xl font-bold mt-1">Keep plan, invoice, and payment details in one place</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-xl">This is a demo billing workspace for package reviews, recurring plans, and invoice status tracking.</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <WalletCards size={26} className="text-sky-300" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Current plan</p>
                <p className="text-xl font-bold mt-1">Growth</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Next invoice</p>
                <p className="text-xl font-bold mt-1">Jun 1</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Status</p>
                <p className="text-xl font-bold mt-1">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-emerald-500" />
              <h3 className="font-semibold text-gray-800">Payment snapshot</h3>
            </div>
            <div className="space-y-3 mt-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Card on file</p>
                <p className="text-gray-600 mt-1">Visa ending in 4281</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Billing contact</p>
                <p className="text-gray-600 mt-1">finance@fullcrmdemo.com</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="font-semibold text-gray-800">Usage notes</p>
                <p className="text-gray-600 mt-1">All payment activity remains simulated in this demo build.</p>
              </div>
            </div>
          </div>
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
              {INVOICES.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{invoice.id}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{invoice.amount}</p>
                    <p className="text-xs text-gray-500 mt-1">{invoice.status}</p>
                  </div>
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
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50">
                  {label}
                </Link>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              Billing in this demo focuses on subscription planning, invoice status, and package scoping rather than live payment processing.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}