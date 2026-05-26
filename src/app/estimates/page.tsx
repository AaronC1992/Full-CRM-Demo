'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const ESTIMATES = [
  { id: 'EST 2201', customer: 'Northside account', amount: '$4,200', status: 'Draft', due: 'May 28' },
  { id: 'EST 2202', customer: 'Maple Street group', amount: '$6,900', status: 'Sent', due: 'May 29' },
  { id: 'EST 2203', customer: 'Cedar Ridge client', amount: '$5,800', status: 'Approved', due: 'May 26' },
  { id: 'EST 2204', customer: 'Lake View account', amount: '$2,950', status: 'Rejected', due: 'May 25' },
];

const LINE_ITEMS = [
  { label: 'CRM configuration and workflow setup', qty: 1, unit: 1600 },
  { label: 'Dashboard and report customization', qty: 1, unit: 1200 },
  { label: 'Team onboarding and training', qty: 1, unit: 900 },
  { label: 'Launch support package', qty: 1, unit: 500 },
];

export default function EstimatesPage() {
  const { enabledModules } = useDemoMode();

  if (!enabledModules.estimates) {
    return (
      <AppLayout title="Estimates">
        <ModuleGate title="Estimates" description="Enable Estimates in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  const subtotal = LINE_ITEMS.reduce((sum, item) => sum + item.qty * item.unit, 0);

  return (
    <AppLayout title="Estimates">
      <div className="grid xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Estimate list</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Estimate</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Amount</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ESTIMATES.map((estimate) => (
                <tr key={estimate.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{estimate.id}</td>
                  <td className="px-4 py-3 text-gray-700">{estimate.customer}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{estimate.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{estimate.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{estimate.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800">PDF style preview</h3>
          <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-800">Sample Estimate</p>
            <p className="text-xs text-gray-500 mt-0.5">Demo mode document</p>
            <div className="mt-3 space-y-2">
              {LINE_ITEMS.map((item) => (
                <div key={item.label} className="flex justify-between text-xs text-gray-700">
                  <span>{item.label}</span>
                  <span>${(item.qty * item.unit).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
          </div>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            This estimate preview is simulated for demo mode.
          </p>
        </section>
      </div>
    </AppLayout>
  );
}
