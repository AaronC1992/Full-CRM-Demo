'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { getIndustryServiceCatalog } from '@/lib/demo-mode';
import {
  ServiceCatalogItem,
  createServiceCatalogItem,
  loadServiceCatalog,
  mergeCatalogWithServices,
  saveServiceCatalog,
} from '@/lib/service-catalog';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const { industry } = useDemoMode();
  const modeCatalog = getIndustryServiceCatalog(industry);

  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');

  useEffect(() => {
    const existing = loadServiceCatalog();
    const merged = mergeCatalogWithServices(existing, modeCatalog.serviceOptions);
    setServices(merged);
    if (merged.length !== existing.length) {
      saveServiceCatalog(merged);
    }
  }, [modeCatalog.serviceOptions]);

  const totalActiveValue = useMemo(
    () => services.reduce((sum, item) => item.active ? sum + item.value : sum, 0),
    [services]
  );

  const addService = () => {
    const name = newName.trim();
    if (!name) {
      showToast('Service name is required.', 'error');
      return;
    }

    const exists = services.some((item) => item.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      showToast('That service already exists.', 'error');
      return;
    }

    const value = Number(newValue || 0);
    const next = [...services, createServiceCatalogItem(name, value)];
    setServices(next);
    setNewName('');
    setNewValue('');
  };

  const updateService = (id: string, patch: Partial<ServiceCatalogItem>) => {
    setServices((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const removeService = (id: string) => {
    setServices((current) => current.filter((item) => item.id !== id));
  };

  const resetFromMode = () => {
    const reset = mergeCatalogWithServices([], modeCatalog.serviceOptions);
    setServices(reset);
    saveServiceCatalog(reset);
    showToast('Service list reset to this mode defaults.');
  };

  const saveAll = () => {
    if (services.some((item) => !item.name.trim())) {
      showToast('Every service needs a name.', 'error');
      return;
    }

    saveServiceCatalog(services);
    showToast('Service pricing saved. Lead values will use these amounts.');
  };

  return (
    <AppLayout title="Services">
      <div className="space-y-5 max-w-5xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Service Price Settings</h2>
          <p className="text-sm text-gray-500">
            Set a default value for each service. Lead estimated value is calculated from selected services using this table.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-600">{services.length} services</span>
            <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-600">Active total {formatCurrency(totalActiveValue)}</span>
            <button
              type="button"
              onClick={resetFromMode}
              className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-100"
            >
              Reset to mode defaults
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Add Service</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              className="sm:col-span-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Service name"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              min={0}
              placeholder="Value"
              value={newValue}
              onChange={(event) => setNewValue(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus size={15} /> Add service
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Active</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Service</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Value</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No services yet. Add your first service above.
                    </td>
                  </tr>
                )}
                {services.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={(event) => updateService(item.id, { active: event.target.checked })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={item.name}
                        onChange={(event) => updateService(item.id, { name: event.target.value })}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        type="number"
                        min={0}
                        value={item.value}
                        onChange={(event) => updateService(item.id, { value: Number(event.target.value || 0) })}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeService(item.id)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={saveAll}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={15} /> Save service pricing
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
