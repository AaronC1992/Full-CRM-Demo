'use client';

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { DemoModuleKey, estimatePackageCosts } from '@/lib/demo-mode';

export default function PackageBuilderPage() {
  const { industryOption, moduleDefinitions, enabledModules } = useDemoMode();
  const [clientName, setClientName] = useState('Sample Client');
  const [notes, setNotes] = useState('Client wants stronger follow up and cleaner reporting.');

  const selected = useMemo(() => {
    return moduleDefinitions.filter((module) => enabledModules[module.key]).map((module) => module.key as DemoModuleKey);
  }, [moduleDefinitions, enabledModules]);

  const selectedModules = moduleDefinitions.filter((module) => selected.includes(module.key));
  const costs = estimatePackageCosts(selected);

  const benefits = useMemo(() => {
    const list = [
      'Clear visibility into sales and service activity.',
      'Faster team follow up with fewer missed opportunities.',
      'Professional client experience with polished reporting.',
    ];

    if (selected.includes('ai-assistant')) list.push('AI guided writing and next action recommendations.');
    if (selected.includes('marketing-dashboard')) list.push('Campaign level insights tied to lead quality.');
    if (selected.includes('customer-portal')) list.push('Self service customer portal to reduce office calls.');

    return list;
  }, [selected]);

  return (
    <AppLayout title="Package Builder">
      <div className="space-y-5 max-w-6xl">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800">Client package proposal</h2>
          <p className="text-sm text-gray-500 mt-1">
            Build a custom proposal from active demo modules for {industryOption.label}.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Client name</label>
              <input
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Industry profile</label>
              <div className="mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700">
                {industryOption.label}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Implementation notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800">Selected features</h3>
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {selectedModules.map((module) => (
                <div key={module.key} className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-sm font-medium text-gray-800">{module.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{module.description}</p>
                </div>
              ))}
            </div>

            <h4 className="font-semibold text-gray-800 mt-5">Client benefits</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {benefits.map((benefit) => (
                <li key={benefit}>• {benefit}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-xl p-5">
            <h3 className="font-semibold">Proposal summary</h3>
            <div className="space-y-3 mt-3 text-sm">
              <div>
                <p className="text-slate-400">Setup fee suggestion</p>
                <p className="text-2xl font-bold">${costs.setupFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Monthly fee suggestion</p>
                <p className="text-2xl font-bold">${costs.monthlyFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400">Timeline estimate</p>
                <p className="font-semibold">{costs.timelineWeeks} weeks</p>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-700 pt-4 text-xs text-slate-300 leading-relaxed">
              <p>Client: {clientName}</p>
              <p className="mt-1">Modules: {selectedModules.length}</p>
              <p className="mt-2">Implementation note: {notes}</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
