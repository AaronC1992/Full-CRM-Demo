'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Building2, MapPin, Plus, RefreshCw, Copy } from 'lucide-react';

type LocationRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  manager: string;
  phone: string;
  serviceArea: string;
  activeJobs: number;
  teamCount: number;
  revenue: number;
  active: boolean;
  primary: boolean;
};

const STORAGE_KEY = 'fullcrmdemo_locations_v1';

const DEFAULT_LOCATIONS: LocationRow[] = [
  { id: 'L-1001', name: 'Northside HQ', city: 'Joplin', state: 'MO', manager: 'Jordan Parker', phone: '417 555 1201', serviceArea: 'North county', activeJobs: 18, teamCount: 6, revenue: 48120, active: true, primary: true },
  { id: 'L-1002', name: 'East branch', city: 'Carl Junction', state: 'MO', manager: 'Taylor Rivera', phone: '417 555 1202', serviceArea: 'East corridor', activeJobs: 11, teamCount: 4, revenue: 31240, active: true, primary: false },
  { id: 'L-1003', name: 'South branch', city: 'Neosho', state: 'MO', manager: 'Morgan Lee', phone: '417 555 1203', serviceArea: 'South county', activeJobs: 7, teamCount: 3, revenue: 20480, active: true, primary: false },
];

function loadLocations() {
  if (typeof window === 'undefined') return DEFAULT_LOCATIONS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCATIONS;
    const parsed = JSON.parse(raw) as LocationRow[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_LOCATIONS;
  } catch {
    return DEFAULT_LOCATIONS;
  }
}

export default function LocationsPage() {
  const { enabledModules } = useDemoMode();
  const [locations, setLocations] = useState<LocationRow[]>(DEFAULT_LOCATIONS);
  const [form, setForm] = useState({ name: '', city: '', state: '', manager: '', phone: '' });

  useEffect(() => {
    setLocations(loadLocations());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
  }, [locations]);

  const totals = useMemo(() => ({
    locations: locations.length,
    active: locations.filter((location) => location.active).length,
    primary: locations.find((location) => location.primary)?.name ?? 'None',
    revenue: locations.reduce((sum, location) => sum + location.revenue, 0),
  }), [locations]);

  if (!enabledModules.locations) {
    return (
      <AppLayout title="Locations">
        <ModuleGate title="Location management" description="Enable Location management in Feature Builder to show branches and territories." />
      </AppLayout>
    );
  }

  const setPrimary = (id: string) => {
    setLocations((current) => current.map((location) => ({ ...location, primary: location.id === id })));
  };

  const toggleActive = (id: string) => {
    setLocations((current) => current.map((location) => (location.id === id ? { ...location, active: !location.active } : location)));
  };

  const addLocation = () => {
    if (!form.name.trim() || !form.city.trim()) return;

    setLocations((current) => [
      {
        id: `L-${Date.now().toString().slice(-4)}`,
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim() || 'MO',
        manager: form.manager.trim() || 'TBD',
        phone: form.phone.trim() || 'No number',
        serviceArea: 'New territory',
        activeJobs: 0,
        teamCount: 0,
        revenue: 0,
        active: true,
        primary: false,
      },
      ...current,
    ]);
    setForm({ name: '', city: '', state: '', manager: '', phone: '' });
  };

  const resetDemo = () => {
    setLocations(DEFAULT_LOCATIONS);
    setForm({ name: '', city: '', state: '', manager: '', phone: '' });
  };

  const copyPhone = async (phone: string) => {
    await navigator.clipboard.writeText(phone);
  };

  return (
    <AppLayout title="Locations">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Locations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.locations}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active branches</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.active}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Primary branch</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{totals.primary}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Combined revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-1">${totals.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-blue-500" />
                <h2 className="font-semibold text-gray-800">Multi location management</h2>
              </div>
              <button type="button" onClick={resetDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                <RefreshCw size={15} /> Reset demo
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {locations.map((location) => (
                <div key={location.id} className={`rounded-xl border p-3 ${location.primary ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{location.name}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={11} />{location.city}, {location.state}</p>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {location.primary && <span className="text-[11px] px-2 py-1 rounded-full border bg-white text-blue-700 border-blue-200">Primary</span>}
                      <span className={`text-[11px] px-2 py-1 rounded-full border ${location.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {location.active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                    <p>Manager {location.manager}</p>
                    <p>Team {location.teamCount}</p>
                    <p>Jobs {location.activeJobs}</p>
                    <p>Revenue ${location.revenue.toLocaleString()}</p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setPrimary(location.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      Set primary
                    </button>
                    <button type="button" onClick={() => toggleActive(location.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                      Toggle active
                    </button>
                    <button type="button" onClick={() => copyPhone(location.phone)} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                      <Copy size={12} /> Copy number
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
            <div>
              <h2 className="font-semibold text-gray-800">Add location</h2>
              <p className="text-sm text-gray-500 mt-1">Show a branch rollout flow for customers who operate in more than one city.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Location name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
              <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
              <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Manager" value={form.manager} onChange={(event) => setForm((current) => ({ ...current, manager: event.target.value }))} />
              <input className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </div>

            <button type="button" onClick={addLocation} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
              <Plus size={15} /> Add branch
            </button>

            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Location controls</p>
              <p>Each branch can carry its own manager, phone, territory, team size, and revenue story.</p>
              <p>Use the primary branch to show which office owns the main account, routing rules, and phone presence.</p>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}