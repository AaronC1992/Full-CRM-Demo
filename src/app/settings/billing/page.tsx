'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { showToast } from '@/components/ui/Toast';
import { ArrowLeft, BadgeCheck, CreditCard, MessageSquareText, Sparkles, ShieldCheck } from 'lucide-react';

type SubscriptionRequest = {
  plan: string;
  requestType: string;
  message: string;
  contactEmail: string;
};

const STORAGE_KEY = 'fullcrmdemo_subscription_requests';

const INITIAL_REQUEST: SubscriptionRequest = {
  plan: 'Growth',
  requestType: 'Upgrade',
  message: 'Request more seats and CRM automations.',
  contactEmail: 'owner@fullcrmdemo.com',
};

const DEFAULT_REQUESTS: SubscriptionRequest[] = [
  {
    plan: 'Growth',
    requestType: 'Upgrade',
    message: 'Need additional user seats and route management.',
    contactEmail: 'owner@fullcrmdemo.com',
  },
];

function loadRequests() {
  if (typeof window === 'undefined') return DEFAULT_REQUESTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as SubscriptionRequest[] : DEFAULT_REQUESTS;
  } catch {
    return DEFAULT_REQUESTS;
  }
}

export default function SettingsBillingPage() {
  const { enabledModules } = useDemoMode();
  const [requests, setRequests] = useState<SubscriptionRequest[]>(DEFAULT_REQUESTS);
  const [form, setForm] = useState<SubscriptionRequest>(INITIAL_REQUEST);

  useEffect(() => {
    setRequests(loadRequests());
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
    }
  }, [requests]);

  const requestCount = useMemo(() => requests.length, [requests]);

  if (!enabledModules.billing) {
    return (
      <AppLayout title="Subscription">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <p className="text-sm text-gray-500">Enable Billing in Feature Builder to show subscription tools.</p>
        </div>
      </AppLayout>
    );
  }

  const submitRequest = () => {
    if (!form.contactEmail.trim() || !form.message.trim()) {
      showToast('Email and request details are required.', 'error');
      return;
    }

    setRequests((current) => [form, ...current].slice(0, 8));
    showToast('Subscription request saved for review.');
  };

  return (
    <AppLayout title="Subscription">
      <div className="space-y-5 max-w-5xl">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline">
          <ArrowLeft size={15} /> Back to Settings
        </Link>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-300">CRM subscription</p>
                <h2 className="text-2xl font-bold mt-1">Manage the CRM plan that powers the account</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-xl">This page is for the CRM owner to request seats, modules, billing changes, or support changes for the account itself.</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <ShieldCheck size={26} className="text-sky-300" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Current plan</p>
                <p className="text-xl font-bold mt-1">Growth</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Renewal</p>
                <p className="text-xl font-bold mt-1">Jun 1</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-slate-300">Requests</p>
                <p className="text-xl font-bold mt-1">{requestCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <CreditCard size={17} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Current subscription</h3>
            </div>
            <div className="space-y-3 mt-4 text-sm">
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Plan</p>
                <p className="font-semibold text-gray-900 mt-1">Growth</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Billing email</p>
                <p className="font-semibold text-gray-900 mt-1">owner@fullcrmdemo.com</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Included support</p>
                <p className="font-semibold text-gray-900 mt-1">Email, onboarding, and change requests</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800">Request a change</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plan</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.plan} onChange={(event) => setForm((current) => ({ ...current, plan: event.target.value }))}>
                  <option>Starter</option>
                  <option>Growth</option>
                  <option>Scale</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Request type</label>
                <select className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.requestType} onChange={(event) => setForm((current) => ({ ...current, requestType: event.target.value }))}>
                  <option>Upgrade</option>
                  <option>Downgrade</option>
                  <option>Additional users</option>
                  <option>Billing question</option>
                  <option>Pause account</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact email</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.contactEmail} onChange={(event) => setForm((current) => ({ ...current, contactEmail: event.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Request details</label>
                <input className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={submitRequest} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                <MessageSquareText size={15} /> Submit request
              </button>
              <Link href="/billing" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                Customer billing
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck size={17} className="text-green-500" />
              <h3 className="font-semibold text-gray-800">Recent requests</h3>
            </div>
            <div className="space-y-3 mt-4">
              {requests.map((request, index) => (
                <div key={`${request.contactEmail}-${index}`} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900">{request.requestType}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{request.plan}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{request.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{request.contactEmail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}