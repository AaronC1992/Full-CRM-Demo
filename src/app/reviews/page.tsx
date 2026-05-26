'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getIndustryReviews } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

export default function ReviewsPage() {
  const { industry, enabledModules } = useDemoMode();

  if (!enabledModules['review-requests']) {
    return (
      <AppLayout title="Reviews">
        <ModuleGate title="Review requests" description="Enable Review requests in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  const reviews = getIndustryReviews(industry);

  return (
    <AppLayout title="Reviews">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">Review request dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Track request status, sent date, rating, and suggested response ideas.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Sent date</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Rating</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Response suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{row.customer}</td>
                  <td className="px-4 py-3 text-gray-700">{row.sentDate}</td>
                  <td className="px-4 py-3"><span className="text-xs px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{row.status}</span></td>
                  <td className="px-4 py-3 text-gray-700">{row.rating > 0 ? `${row.rating} / 5` : 'Not rated'}</td>
                  <td className="px-4 py-3 text-gray-700">{row.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
