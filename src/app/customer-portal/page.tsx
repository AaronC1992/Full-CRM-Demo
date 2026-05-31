'use client';

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getPortalPreview } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { CalendarDays, CheckCircle2, CreditCard, FileText, MessageSquare, Send, ShieldCheck } from 'lucide-react';

export default function CustomerPortalPage() {
  const { industry, enabledModules } = useDemoMode();
  const [messageDraft, setMessageDraft] = useState('');
  const [serviceRequest, setServiceRequest] = useState('');
  const [approvedEstimate, setApprovedEstimate] = useState(false);
  const [paidInvoice, setPaidInvoice] = useState(false);

  if (!enabledModules['customer-portal']) {
    return (
      <AppLayout title="Customer Portal">
        <ModuleGate title="Customer portal" description="Enable Customer portal in Feature Builder to show this preview." />
      </AppLayout>
    );
  }

  const portal = getPortalPreview(industry);
  const portalStats = useMemo(() => ({
    appointments: portal.upcomingAppointments.length,
    messages: 2,
    history: portal.serviceHistory.length,
    balance: paidInvoice ? 0 : 184,
  }), [paidInvoice, portal]);

  const sendMessage = () => {
    if (!messageDraft.trim()) return;
    setMessageDraft('');
  };

  const requestService = () => {
    if (!serviceRequest.trim()) return;
    setServiceRequest('');
  };

  return (
    <AppLayout title="Customer Portal">
      <div className="space-y-5 max-w-5xl">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Appointments</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{portalStats.appointments}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Messages</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{portalStats.messages}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Service history</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{portalStats.history}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Open balance</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${portalStats.balance}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-600">Signed in as</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{portal.customerName}</p>
              <p className="text-sm text-gray-500 mt-2">A full self service view with appointments, messages, estimates, invoices, and request service actions.</p>
            </div>
            <div className="rounded-2xl bg-slate-900 text-white px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-slate-300">Portal status</p>
              <p className="text-sm font-semibold mt-1">Active and connected</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-500" />
              <h3 className="font-semibold text-gray-800">Upcoming appointments</h3>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {portal.upcomingAppointments.map((item) => (
                <li key={item} className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">{item}</li>
              ))}
            </ul>

            <div className="mt-4 rounded-xl border border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <MessageSquare size={14} /> Messages
              </div>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <div className="rounded-lg bg-white border border-gray-200 px-3 py-2">Team: Your estimate is ready for review.</div>
                <div className="rounded-lg bg-blue-600 text-white px-3 py-2 ml-6">Customer: Thanks, I will look at it tonight.</div>
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Type a portal message"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                />
                <button type="button" onClick={sendMessage} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                  <Send size={15} /> Send
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-green-500" />
              <h3 className="font-semibold text-gray-800">Estimate and invoice center</h3>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">Estimate approval</p>
              <p className="text-sm text-gray-700 mt-2">{portal.estimateTitle}</p>
              <button type="button" onClick={() => setApprovedEstimate(true)} className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
                <CheckCircle2 size={15} /> {approvedEstimate ? 'Approved' : 'Approve estimate'}
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">Invoice preview</p>
              <p className="text-sm text-gray-700 mt-2">{portal.invoiceTitle}</p>
              <button type="button" onClick={() => setPaidInvoice(true)} className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700">
                <CreditCard size={15} /> {paidInvoice ? 'Paid' : 'Pay invoice'}
              </button>
            </div>
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <p className="text-xs uppercase tracking-wide text-gray-500">Request service</p>
              <textarea
                className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                rows={3}
                placeholder="Tell us what you need next"
                value={serviceRequest}
                onChange={(event) => setServiceRequest(event.target.value)}
              />
              <button type="button" onClick={requestService} className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                <FileText size={15} /> Request service
              </button>
            </div>
          </section>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Service history</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {portal.serviceHistory.map((item) => (
              <li key={item} className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
