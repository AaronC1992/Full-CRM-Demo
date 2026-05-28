'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Lead } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { showToast } from '@/components/ui/Toast';
import { Plus, Save, Send, Trash2 } from 'lucide-react';
import { loadServicePricingMap, ServiceLineItem, ServicePricingMap } from '@/lib/service-pricing';
import { loadServiceCatalog, parseSelectedServices, suggestMockServiceValue } from '@/lib/service-catalog';

type EstimateStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected';

interface EstimateItem {
  id: string;
  name: string;
  qty: number;
  unitPrice: number;
}

interface SavedEstimate {
  id: string;
  leadId: number;
  customer: string;
  status: EstimateStatus;
  dueDate: string;
  total: number;
  createdDate: string;
  items: EstimateItem[];
}

const ESTIMATES_STORAGE_KEY = 'fullcrmdemo_estimates_v1';

function makeItem(name = '', qty = 1, unitPrice = 0): EstimateItem {
  return {
    id: `estimate-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    qty,
    unitPrice,
  };
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIsoDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function loadSavedEstimates(): SavedEstimate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ESTIMATES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSavedEstimates(estimates: SavedEstimate[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ESTIMATES_STORAGE_KEY, JSON.stringify(estimates));
}

function getCatalogPriceByName(name: string): number {
  const catalog = loadServiceCatalog();
  const normalized = name.trim().toLowerCase();
  const match = catalog.find((item) => item.name.trim().toLowerCase() === normalized && item.active);
  if (match) return match.value;
  return suggestMockServiceValue(name);
}

function buildItemsFromLead(lead: Lead, serviceMap: ServicePricingMap): EstimateItem[] {
  const customServices = serviceMap[lead.id] || [];
  if (customServices.length > 0) {
    return customServices.map((item: ServiceLineItem) => makeItem(item.name, 1, item.price));
  }

  const selectedServices = parseSelectedServices(lead.serviceOpportunity);
  if (selectedServices.length > 0) {
    return selectedServices.map((name) => makeItem(name, 1, getCatalogPriceByName(name)));
  }

  if (lead.suggestedOffer?.trim()) {
    return [makeItem(lead.suggestedOffer.trim(), 1, getCatalogPriceByName(lead.suggestedOffer.trim()))];
  }

  return [makeItem('New service', 1, 0)];
}

export default function EstimatesPage() {
  const { enabledModules } = useDemoMode();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [status, setStatus] = useState<EstimateStatus>('Draft');
  const [dueDate, setDueDate] = useState(addDaysIsoDate(7));
  const [items, setItems] = useState<EstimateItem[]>([makeItem('New service', 1, 0)]);
  const [notes, setNotes] = useState('');
  const [savedEstimates, setSavedEstimates] = useState<SavedEstimate[]>([]);

  if (!enabledModules.estimates) {
    return (
      <AppLayout title="Estimates">
        <ModuleGate title="Estimates" description="Enable Estimates in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  useEffect(() => {
    fetch('/api/leads?sort=createdDate&dir=desc')
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .finally(() => setLoadingLeads(false));
  }, []);

  useEffect(() => {
    setSavedEstimates(loadSavedEstimates());
  }, []);

  useEffect(() => {
    if (!selectedLeadId) return;
    const selected = leads.find((lead) => lead.id === Number(selectedLeadId));
    if (!selected) return;

    const serviceMap = loadServicePricingMap();
    const autoItems = buildItemsFromLead(selected, serviceMap);
    setItems(autoItems);
    setStatus('Draft');
    setDueDate(addDaysIsoDate(7));
    setNotes(selected.notes || '');
  }, [selectedLeadId, leads]);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === Number(selectedLeadId)) || null,
    [leads, selectedLeadId]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.qty || 0) * (item.unitPrice || 0), 0),
    [items]
  );

  const updateItem = (id: string, patch: Partial<EstimateItem>) => {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const addItem = () => {
    setItems((current) => [...current, makeItem('New service', 1, 0)]);
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const saveEstimate = () => {
    if (!selectedLead) {
      showToast('Select a lead or customer first.', 'error');
      return;
    }

    const normalizedItems = items
      .map((item) => ({
        ...item,
        name: item.name.trim(),
        qty: Number.isFinite(Number(item.qty)) ? Math.max(1, Math.round(Number(item.qty))) : 1,
        unitPrice: Number.isFinite(Number(item.unitPrice)) ? Math.max(0, Number(item.unitPrice)) : 0,
      }))
      .filter((item) => item.name.length > 0);

    if (normalizedItems.length === 0) {
      showToast('Add at least one service item.', 'error');
      return;
    }

    const total = normalizedItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    const estimateId = `EST ${Date.now().toString().slice(-5)}`;
    const next: SavedEstimate = {
      id: estimateId,
      leadId: selectedLead.id,
      customer: selectedLead.businessName,
      status,
      dueDate,
      total,
      createdDate: todayIsoDate(),
      items: normalizedItems,
    };

    const updated = [next, ...savedEstimates];
    setSavedEstimates(updated);
    saveSavedEstimates(updated);
    showToast('Estimate saved.');
  };

  const markAsSent = () => {
    setStatus('Sent');
    showToast('Estimate status set to Sent.');
  };

  return (
    <AppLayout title="Estimates">
      <div className="grid xl:grid-cols-3 gap-4">
        <section className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Estimate Builder</h2>
            <p className="text-xs text-gray-500 mt-1">Select a lead or customer to auto populate services, then edit as needed.</p>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Customer or lead</label>
                <select
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedLeadId}
                  onChange={(event) => setSelectedLeadId(event.target.value)}
                  disabled={loadingLeads}
                >
                  <option value="">{loadingLeads ? 'Loading leads...' : 'Select lead or customer'}</option>
                  <optgroup label="Customers (Won)">
                    {leads.filter((lead) => lead.leadStatus === 'Won').map((lead) => (
                      <option key={`won-${lead.id}`} value={lead.id}>{lead.businessName}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Active Leads">
                    {leads.filter((lead) => lead.leadStatus !== 'Won').map((lead) => (
                      <option key={`lead-${lead.id}`} value={lead.id}>{lead.businessName}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Due date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as EstimateStatus)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                <input
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Scope, exclusions, payment terms"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500">Service</th>
                    <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500 w-20">Qty</th>
                    <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500 w-32">Unit</th>
                    <th className="text-left px-3 py-2 text-xs uppercase tracking-wide text-gray-500 w-32">Line total</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <input
                          value={item.name}
                          onChange={(event) => updateItem(item.id, { name: event.target.value })}
                          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(event) => updateItem(item.id, { qty: Math.max(1, Number(event.target.value || 1)) })}
                          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(event) => updateItem(item.id, { unitPrice: Math.max(0, Number(event.target.value || 0)) })}
                          className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-sm font-medium text-gray-800">{formatCurrency(item.qty * item.unitPrice)}</td>
                      <td className="px-2 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Plus size={14} /> Add line item
              </button>

              <div className="text-right">
                <p className="text-xs text-gray-500">Estimate total</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(subtotal)}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={saveEstimate}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Save size={14} /> Save estimate
              </button>
              <button
                type="button"
                onClick={markAsSent}
                className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg text-sm font-medium hover:bg-blue-100"
              >
                <Send size={14} /> Mark as sent
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800">Estimate preview</h3>
          <div className="mt-3 border border-gray-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-gray-800">{selectedLead?.businessName || 'Select a lead'}</p>
            <p className="text-xs text-gray-500 mt-0.5">Due {dueDate ? formatDate(dueDate) : 'Not set'} • {status}</p>
            <div className="mt-3 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-gray-700">
                  <span>{item.qty}x {item.name || 'Untitled item'}</span>
                  <span>{formatCurrency(item.qty * item.unitPrice)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-800">Saved estimates</h4>
            <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
              {savedEstimates.length === 0 && (
                <p className="text-xs text-gray-500">No saved estimates yet.</p>
              )}
              {savedEstimates.map((estimate) => (
                <div key={estimate.id} className="border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-gray-800">{estimate.id}</p>
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700">{estimate.status}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{estimate.customer}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">Due {formatDate(estimate.dueDate)}</p>
                    <p className="text-xs font-semibold text-gray-900">{formatCurrency(estimate.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
