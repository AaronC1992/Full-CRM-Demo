'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const JOBS = [
  { id: 'J 1001', customer: 'Northside account', title: 'Initial setup and onboarding', status: 'In progress', due: 'May 28', owner: 'Jordan', budget: '$4,200' },
  { id: 'J 1002', customer: 'Maple Street group', title: 'Automation rollout', status: 'Pending', due: 'May 30', owner: 'Taylor', budget: '$6,900' },
  { id: 'J 1003', customer: 'Cedar Ridge client', title: 'Reporting dashboard', status: 'Scheduled', due: 'Jun 1', owner: 'Alex', budget: '$3,500' },
  { id: 'J 1004', customer: 'Evergreen account', title: 'Marketing launch support', status: 'Complete', due: 'May 24', owner: 'Morgan', budget: '$2,700' },
];

export default function JobsPage() {
  const { profile, enabledModules } = useDemoMode();

  if (!enabledModules['job-tracking']) {
    return (
      <AppLayout title="Jobs or Projects">
        <ModuleGate title="Job tracking" description="Enable Job tracking in Feature Builder to show this page." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Jobs or Projects">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">{profile.jobLabel}</h2>
          <p className="text-sm text-gray-500 mt-1">Track open work, deadlines, owners, and progress in one place.</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Job ID</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Scope</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Due</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Budget</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {JOBS.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{job.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{job.customer}</td>
                  <td className="px-4 py-3 text-gray-700">{job.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700">{job.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{job.due}</td>
                  <td className="px-4 py-3 text-gray-700">{job.owner}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{job.budget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
