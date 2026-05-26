'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getLeadSourceMetrics } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const CAMPAIGNS = [
  { name: 'Reactivation push', channel: 'Email', status: 'Active', leads: 18 },
  { name: 'Referral incentive', channel: 'SMS', status: 'Active', leads: 11 },
  { name: 'Seasonal offer', channel: 'Landing page', status: 'Draft', leads: 7 },
];

const CHECKLIST = [
  'Google profile category and services updated',
  'City service pages include current offers',
  'Review responses posted weekly',
  'Primary social channels have weekly posts',
  'Lead forms tagged by campaign source',
];

export default function MarketingPage() {
  const { industry, enabledModules } = useDemoMode();

  if (!enabledModules['marketing-dashboard']) {
    return (
      <AppLayout title="Marketing">
        <ModuleGate title="Marketing dashboard" description="Enable Marketing dashboard in Feature Builder to show this page." />
      </AppLayout>
    );
  }

  const leadSources = getLeadSourceMetrics(industry);

  return (
    <AppLayout title="Marketing">
      <div className="space-y-5">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Monthly growth</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">+18%</p>
            <p className="text-sm text-gray-500 mt-1">Compared with prior month</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Website lead forms</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">42</p>
            <p className="text-sm text-gray-500 mt-1">Tracked from active pages</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Campaign conversion</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">31%</p>
            <p className="text-sm text-gray-500 mt-1">Average lead to deal conversion</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Lead source tracking</h2>
            <div className="mt-3 space-y-2">
              {leadSources.map((row) => (
                <div key={row.source} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-800">{row.source}</p>
                    <p className="text-xs text-gray-500">{row.leads} leads</p>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(row.conversion, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{row.conversion}% conversion</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Campaign list</h2>
            <div className="mt-3 space-y-2">
              {CAMPAIGNS.map((campaign) => (
                <div key={campaign.name} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-sm text-gray-800">{campaign.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{campaign.channel} • {campaign.status} • {campaign.leads} leads</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Landing page and content ideas</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              <li>• Compare plans page for decision stage prospects.</li>
              <li>• Fast quote page for mobile traffic.</li>
              <li>• Case study page with before and after outcomes.</li>
              <li>• Offer page with limited time incentive.</li>
            </ul>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Local SEO checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {CHECKLIST.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm">
          Social post ideas and email draft generation are available in AI Assistant.
        </div>
      </div>
    </AppLayout>
  );
}
