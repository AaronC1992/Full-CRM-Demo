'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const INVOICES = [
  { id: 'INV 3301', customer: 'Northside account', amount: '$2,100', status: 'Draft', due: 'May 30' },
  { id: 'INV 3302', customer: 'Maple Street group', amount: '$3,450', status: 'Sent', due: 'May 29' },
  { id: 'INV 3303', customer: 'Cedar Ridge client', amount: '$5,800', status: 'Paid', due: 'May 20' },
  { id: 'INV 3304', customer: 'Lake View account', amount: '$1,450', status: 'Overdue', due: 'May 16' },
];

export default function InvoicesPage() {
  const { enabledModules } = useDemoMode();

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
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800">Invoice center</h2>
          <p className="text-sm text-gray-500 mt-1">Statuses include draft, sent, paid, and overdue. All payment activity is simulated in demo mode.</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {INVOICES.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{invoice.id}</td>
                  <td className="px-4 py-3 text-gray-700">{invoice.customer}</td>
                  <td className="px-4 py-3 text-gray-900 font-semibold">{invoice.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{invoice.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{invoice.due}</td>
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
