'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getPortalPreview } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

export default function CustomerPortalPage() {
  const { industry, enabledModules } = useDemoMode();

  if (!enabledModules['customer-portal']) {
    return (
      <AppLayout title="Customer Portal">
        <ModuleGate title="Customer portal" description="Enable Customer portal in Feature Builder to show this preview." />
      </AppLayout>
    );
  }

  const portal = getPortalPreview(industry);

  return (
    <AppLayout title="Customer Portal">
      <div className="space-y-5 max-w-5xl">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800">Portal preview for customer experience</h2>
          <p className="text-sm text-gray-500 mt-1">Show clients exactly what their customers would see in a self service portal.</p>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-blue-300">Signed in as</p>
          <p className="text-xl font-semibold mt-1">{portal.customerName}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800">Upcoming appointments</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {portal.upcomingAppointments.map((item) => (
                <li key={item} className="border border-gray-200 rounded-lg px-3 py-2">{item}</li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800">Messages</h3>
            <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
              Your team has a new update ready for review.
            </div>
            <button className="mt-3 px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white">Request service</button>
          </section>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800">Estimate approval</h3>
            <p className="text-sm text-gray-700 mt-2">{portal.estimateTitle}</p>
            <button className="mt-3 px-3 py-2 text-sm rounded-lg border border-gray-200">Approve estimate</button>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800">Invoice preview</h3>
            <p className="text-sm text-gray-700 mt-2">{portal.invoiceTitle}</p>
            <button className="mt-3 px-3 py-2 text-sm rounded-lg border border-gray-200">View invoice</button>
          </section>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800">Service history</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {portal.serviceHistory.map((item) => (
              <li key={item} className="border border-gray-200 rounded-lg px-3 py-2">{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
