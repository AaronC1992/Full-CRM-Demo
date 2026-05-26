'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getLeadSourceMetrics } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const KPI_LIST = [
  { label: 'Revenue', value: '$92,450' },
  { label: 'Lead conversion rate', value: '31%' },
  { label: 'Open follow ups', value: '44' },
  { label: 'Completed jobs', value: '118' },
  { label: 'Customer retention', value: '86%' },
  { label: 'Top services', value: 'Automation, scheduling, reporting' },
  { label: 'Monthly activity', value: '1,284 timeline entries' },
  { label: 'Team performance', value: '4.6 out of 5 quality score' },
];

export default function ReportsPage() {
  const { industry, enabledModules } = useDemoMode();

  if (!enabledModules.reports) {
    return (
      <AppLayout title="Reports">
        <ModuleGate title="Reports" description="Enable Reports in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  const sources = getLeadSourceMetrics(industry);

  return (
    <AppLayout title="Reports">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {KPI_LIST.slice(0, 4).map((kpi) => (
            <div key={kpi.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Lead source performance</h2>
            <div className="space-y-2 mt-3">
              {sources.map((row) => (
                <div key={row.source} className="border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{row.source}</span>
                    <span className="text-gray-600">{row.leads} leads</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Conversion rate: {row.conversion}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Report catalog</h2>
            <ul className="space-y-2 mt-3 text-sm text-gray-700">
              {KPI_LIST.slice(4).map((item) => (
                <li key={item.label} className="border border-gray-200 rounded-lg px-3 py-2">
                  <p className="font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.value}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
