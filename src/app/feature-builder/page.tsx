'use client';

import AppLayout from '@/components/layout/AppLayout';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

export default function FeatureBuilderPage() {
  const { industryOption, moduleDefinitions, enabledModules, setModuleEnabled, resetModules } = useDemoMode();

  const grouped = moduleDefinitions.reduce<Record<string, typeof moduleDefinitions>>((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {});

  const enabledCount = Object.values(enabledModules).filter(Boolean).length;

  return (
    <AppLayout title="Feature Builder">
      <div className="space-y-5 max-w-6xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-5">
          <p className="text-xs uppercase tracking-wide text-blue-100">Demo package configuration</p>
          <h2 className="text-xl font-semibold mt-1">{industryOption.label}</h2>
          <p className="text-sm text-blue-100 mt-1">
            Toggle modules on or off to shape each client demo, without changing code.
          </p>
          <div className="mt-3 text-sm font-medium">Enabled modules: {enabledCount} of {moduleDefinitions.length}</div>
        </div>

        {Object.entries(grouped).map(([category, modules]) => (
          <section key={category} className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-semibold text-gray-800">{category}</h3>
              <button
                onClick={resetModules}
                className="text-xs font-semibold text-blue-600 hover:underline"
                type="button"
              >
                Reset defaults
              </button>
            </div>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {modules.map((module) => {
                const active = enabledModules[module.key];
                return (
                  <label
                    key={module.key}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      active
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm text-gray-800">{module.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(event) => setModuleEnabled(module.key, event.target.checked)}
                        className="mt-1 h-4 w-4"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-sm">
          <p className="font-semibold">Demo mode safety</p>
          <ul className="mt-2 space-y-1 text-slate-300">
            <li>Payment, messaging, and AI outputs are simulated for sales demos.</li>
            <li>No live SMS, email, or payment processing is triggered.</li>
            <li>Feature toggles only affect the UI presentation layer in demo mode.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
}
