'use client';

import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const CATEGORY_ORDER = ['Core CRM', 'Operations', 'Growth', 'Automation', 'Admin'] as const;

export default function FeaturesPage() {
  const { moduleDefinitions, enabledModules, industryOption, profile } = useDemoMode();

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: moduleDefinitions.filter((module) => module.category === category),
  }));

  const enabledCount = moduleDefinitions.filter((module) => enabledModules[module.key]).length;

  return (
    <AppLayout title="Features">
      <div className="space-y-5">
        <section className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-blue-300">Demo page</p>
          <h2 className="text-2xl font-semibold mt-1">CRM feature overview</h2>
          <p className="text-sm text-slate-200 mt-2 max-w-3xl">
            Use this page during sales demos to explain what the platform includes, what is active now, and where each feature lives in the CRM.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-300">Industry profile</p>
              <p className="text-lg font-semibold mt-0.5">{industryOption.label}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-300">Modules enabled</p>
              <p className="text-lg font-semibold mt-0.5">{enabledCount} of {moduleDefinitions.length}</p>
            </div>
            <div className="bg-white/10 border border-white/10 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-300">Primary workflow</p>
              <p className="text-sm font-semibold mt-1">{profile.workflowExamples[0]}</p>
            </div>
          </div>
        </section>

        {grouped.map((group) => (
          <section key={group.category} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-gray-800">{group.category}</h3>
              <span className="text-xs text-gray-500">{group.items.length} features</span>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
              {group.items.map((feature) => {
                const isEnabled = enabledModules[feature.key];
                return (
                  <div key={feature.key} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{feature.label}</p>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${isEnabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {isEnabled ? 'Enabled' : 'Available'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">{feature.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">Category {group.category}</span>
                      {feature.route ? (
                        <Link href={feature.route} className="text-xs font-semibold text-blue-600 hover:underline">
                          Open
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">No page</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppLayout>
  );
}
