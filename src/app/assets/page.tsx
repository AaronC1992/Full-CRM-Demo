'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { HardHat, ShieldCheck } from 'lucide-react';

type AssetStatus = 'Active' | 'Service due' | 'Out of service';

type AssetRow = {
  id: string;
  name: string;
  type: string;
  owner: string;
  purchaseDate: string;
  warrantyUntil: string;
  nextMaintenance: string;
  status: AssetStatus;
  value: number;
};

const STORAGE_KEY = 'fullcrmdemo_assets_v1';

const DEFAULT_ASSETS: AssetRow[] = [
  { id: 'A1001', name: 'Truck 12', type: 'Vehicle', owner: 'Jordan', purchaseDate: '2025-02-14', warrantyUntil: '2028-02-14', nextMaintenance: '2026-06-12', status: 'Service due', value: 32000 },
  { id: 'A1002', name: 'Field tablet set', type: 'Hardware', owner: 'Alex', purchaseDate: '2025-08-08', warrantyUntil: '2027-08-08', nextMaintenance: '2026-07-01', status: 'Active', value: 4200 },
  { id: 'A1003', name: 'Warehouse sprayer', type: 'Equipment', owner: 'Taylor', purchaseDate: '2024-11-03', warrantyUntil: '2026-11-03', nextMaintenance: '2026-05-29', status: 'Out of service', value: 5400 },
];

function loadAssets() {
  if (typeof window === 'undefined') return DEFAULT_ASSETS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ASSETS;
    const parsed = JSON.parse(raw) as AssetRow[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ASSETS;
  } catch {
    return DEFAULT_ASSETS;
  }
}

function badgeStyle(status: AssetStatus) {
  if (status === 'Active') return 'bg-green-50 text-green-700 border-green-200';
  if (status === 'Service due') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

export default function AssetsPage() {
  const { enabledModules } = useDemoMode();
  const [assets, setAssets] = useState<AssetRow[]>(DEFAULT_ASSETS);
  const [form, setForm] = useState({ name: '', type: 'Equipment', owner: 'Jordan', purchaseDate: '2026-06-01', warrantyUntil: '2027-06-01', nextMaintenance: '2026-07-01', value: '0' });

  useEffect(() => {
    setAssets(loadAssets());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
  }, [assets]);

  const totals = useMemo(() => {
    const active = assets.filter((asset) => asset.status === 'Active').length;
    const serviceDue = assets.filter((asset) => asset.status === 'Service due').length;
    const out = assets.filter((asset) => asset.status === 'Out of service').length;
    const value = assets.reduce((sum, asset) => sum + asset.value, 0);
    return { active, serviceDue, out, value };
  }, [assets]);

  if (!enabledModules['asset-tracking']) {
    return (
      <AppLayout title="Assets">
        <ModuleGate title="Assets" description="Enable Asset tracking in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Assets">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active assets</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.active}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Service due</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{totals.serviceDue}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Out of service</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{totals.out}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Asset value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">${totals.value.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <HardHat size={16} className="text-blue-500" />
              <h2 className="font-semibold text-gray-800">Asset registry</h2>
            </div>
            <div className="mt-3 space-y-2">
              {assets.map((asset) => (
                <div key={asset.id} className="border border-gray-200 rounded-lg px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{asset.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{asset.type} | Owner: {asset.owner}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${badgeStyle(asset.status)}`}>{asset.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-gray-500">
                    <p>Purchase: {asset.purchaseDate}</p>
                    <p>Warranty: {asset.warrantyUntil}</p>
                    <p>Maintenance: {asset.nextMaintenance}</p>
                    <p>Value: ${asset.value.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button type="button" className="text-xs px-2 py-1 rounded-lg border border-green-200 bg-green-50 text-green-700" onClick={() => setAssets((current) => current.map((row) => (row.id === asset.id ? { ...row, status: 'Active' } : row)))}>
                      Mark active
                    </button>
                    <button type="button" className="text-xs px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700" onClick={() => setAssets((current) => current.map((row) => (row.id === asset.id ? { ...row, status: 'Service due' } : row)))}>
                      Mark service due
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500" />
              <h2 className="font-semibold text-gray-800">Add demo asset</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <input className="col-span-2 border border-gray-200 rounded-lg px-3 py-2" placeholder="Asset name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" placeholder="Owner" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" type="date" value={form.purchaseDate} onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" type="date" value={form.warrantyUntil} onChange={(event) => setForm((current) => ({ ...current, warrantyUntil: event.target.value }))} />
              <input className="border border-gray-200 rounded-lg px-3 py-2" type="date" value={form.nextMaintenance} onChange={(event) => setForm((current) => ({ ...current, nextMaintenance: event.target.value }))} />
              <input className="col-span-2 border border-gray-200 rounded-lg px-3 py-2" type="number" placeholder="Value" value={form.value} onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))} />
              <button
                type="button"
                className="col-span-2 bg-blue-600 text-white rounded-lg py-2 font-medium hover:bg-blue-700"
                onClick={() => {
                  if (!form.name.trim()) return;
                  const next: AssetRow = {
                    id: `A${Date.now().toString().slice(-4)}`,
                    name: form.name.trim(),
                    type: form.type.trim() || 'Equipment',
                    owner: form.owner.trim() || 'Unassigned',
                    purchaseDate: form.purchaseDate,
                    warrantyUntil: form.warrantyUntil,
                    nextMaintenance: form.nextMaintenance,
                    status: 'Active',
                    value: Number(form.value || '0'),
                  };
                  setAssets((current) => [next, ...current]);
                  setForm({ ...form, name: '', value: '0' });
                }}
              >
                Save asset
              </button>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
