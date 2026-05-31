'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Blocks, Store } from 'lucide-react';

type ExtensionRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  installed: boolean;
  rating: number;
};

const DEFAULT_EXTENSIONS: ExtensionRow[] = [
  { id: 'X1001', name: 'Crew time sync', category: 'Operations', description: 'Sync field check ins into crew timelines and daily scorecards.', installed: true, rating: 4.8 },
  { id: 'X1002', name: 'Route weather guard', category: 'Routing', description: 'Adds weather alerts to route plans and dispatch queues.', installed: false, rating: 4.6 },
  { id: 'X1003', name: 'Review booster', category: 'Growth', description: 'Smart timing logic for review requests after completed work.', installed: true, rating: 4.9 },
  { id: 'X1004', name: 'Accounting bridge', category: 'Finance', description: 'Exports journal batches for accounting reconciliation flows.', installed: false, rating: 4.5 },
];

export default function MarketplacePage() {
  const { enabledModules } = useDemoMode();
  const [extensions, setExtensions] = useState<ExtensionRow[]>(DEFAULT_EXTENSIONS);
  const [requestText, setRequestText] = useState('Need an extension for supplier price updates and inventory pull through.');

  if (!enabledModules.marketplace) {
    return (
      <AppLayout title="Marketplace">
        <ModuleGate title="Marketplace" description="Enable Marketplace and extensions in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Marketplace">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-gray-800">Extension marketplace</h2>
              <p className="text-sm text-gray-500 mt-1">Demo catalog that shows a future extension ecosystem for integrations and workflow packs.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Store size={18} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Blocks size={16} className="text-indigo-500" />
              <h3 className="font-semibold text-gray-800">Available extensions</h3>
            </div>
            <div className="mt-3 space-y-2">
              {extensions.map((extension) => (
                <div key={extension.id} className="border border-gray-200 rounded-lg px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{extension.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{extension.category} | Rating {extension.rating}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${extension.installed ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {extension.installed ? 'Installed' : 'Available'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{extension.description}</p>
                  <button
                    type="button"
                    className="mt-3 text-xs px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-blue-700"
                    onClick={() => setExtensions((current) => current.map((item) => (item.id === extension.id ? { ...item, installed: !item.installed } : item)))}
                  >
                    {extension.installed ? 'Uninstall' : 'Install'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800">Request custom extension</h3>
            <p className="text-sm text-gray-500 mt-2">Use this to show clients how a custom module request process would look in production.</p>
            <textarea className="w-full mt-3 border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none" rows={7} value={requestText} onChange={(event) => setRequestText(event.target.value)} />
            <button type="button" className="mt-3 w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
              Submit extension request
            </button>
            <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
              <p className="font-semibold">Demo workflow</p>
              <p className="mt-1">Request captured, reviewed by product team, then published as a private or public extension package.</p>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
