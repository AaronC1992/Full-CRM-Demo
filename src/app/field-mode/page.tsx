'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { DashboardStats, Lead } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { CalendarDays, CheckCircle2, Phone, Route, Smartphone, StickyNote, MessageSquare } from 'lucide-react';

export default function FieldModePage() {
  const { enabledModules, profile, industryOption } = useDemoMode();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((res) => (res.ok ? res.json() : Promise.reject(new Error('dashboard')))),
      fetch('/api/leads?priority=Hot&sort=nextFollowUpDate&dir=asc&_ts=' + Date.now()).then((res) => (res.ok ? res.json() : Promise.reject(new Error('leads')))),
    ])
      .then(([dashboardData, leadData]) => {
        setStats(dashboardData);
        setLeads(Array.isArray(leadData) ? leadData : []);
      })
      .catch(() => {
        setStats(null);
        setLeads([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!enabledModules['field-mode']) {
    return (
      <AppLayout title="Field mode">
        <ModuleGate title="Field mode" description="Enable Field mode in Feature Builder to show the mobile visit view." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Field mode">
      <div className="mx-auto max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-lg overflow-hidden">
          <div className="bg-slate-900 text-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Smartphone size={22} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300">Mobile view</p>
                <p className="font-semibold">{industryOption.shortLabel} field mode</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-blue-600 text-white p-3">
                <p className="text-[11px] text-blue-100">Follow ups</p>
                <p className="text-2xl font-bold mt-1">{stats?.followUpDueToday ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-emerald-600 text-white p-3">
                <p className="text-[11px] text-emerald-100">Routes</p>
                <p className="text-2xl font-bold mt-1">{stats?.routesToday ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-amber-500 text-white p-3">
                <p className="text-[11px] text-amber-100">Hot leads</p>
                <p className="text-2xl font-bold mt-1">{stats?.hotLeads.length ?? 0}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Route size={17} className="text-blue-500" />
                <h3 className="font-semibold text-gray-800">Today&apos;s route focus</h3>
              </div>
              {loading ? (
                <p className="text-sm text-gray-500 mt-3">Loading route details…</p>
              ) : leads.length === 0 ? (
                <p className="text-sm text-gray-500 mt-3">No route leads are ready yet.</p>
              ) : (
                <div className="space-y-3 mt-3">
                  {leads.slice(0, 4).map((lead, index) => (
                    <div key={lead.id} className="rounded-xl border border-gray-200 px-3 py-3">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{index + 1}</div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{lead.businessName}</p>
                          <p className="text-xs text-gray-500 mt-1">{lead.city} · {lead.nextFollowUpDate ? formatDate(lead.nextFollowUpDate) : 'Ready now'}</p>
                        </div>
                        <Link href={`/leads/${lead.id}`} className="text-xs font-medium text-blue-600">Open</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <StickyNote size={17} className="text-amber-500" />
                <h3 className="font-semibold text-gray-800">Quick note</h3>
              </div>
              <p className="text-sm text-gray-600 mt-2">Use this mode when you are in the field. Tap a lead, mark the visit, add a note, and keep moving.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ['Call', Phone, '/leads'],
                ['Schedule', CalendarDays, '/calendar'],
                ['Message', MessageSquare, '/outreach'],
                ['Wrap up', CheckCircle2, '/routes'],
              ].map(([label, Icon, href]) => (
                <Link key={label} href={href as string} className="rounded-2xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm hover:border-blue-200">
                  <Icon size={18} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-800">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-emerald-100">Field workflow</p>
            <h2 className="text-2xl font-bold mt-1">Fast updates without the desktop clutter</h2>
            <p className="text-sm text-emerald-50 mt-2">This screen keeps calls, visits, notes, and route checks in one place so the team can update records from the truck or job site.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link href="/routes" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors">
              <p className="text-xs uppercase tracking-wide text-gray-500">Route builder</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Open the full route plan</p>
              <p className="text-sm text-gray-600 mt-2">Review stops, notes, and visit order before heading out.</p>
            </Link>
            <Link href="/notifications" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors">
              <p className="text-xs uppercase tracking-wide text-gray-500">Alerts</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">See the newest reminders</p>
              <p className="text-sm text-gray-600 mt-2">Keep up with follow ups and same day tasks while on the road.</p>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800">Mobile friendly setup</h3>
            <p className="text-sm text-gray-600 mt-2">The cards, buttons, and spacing here are tuned for smaller screens so the CRM still feels usable when the user is outside the office.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                'Large tap targets',
                'Short action list',
                'Lead focused layout',
                'Quick note capture',
              ].map((item) => (
                <div key={item} className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-gray-700">{item}</div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800">Suggested next stops</h3>
            <div className="space-y-3 mt-4">
              {(stats?.hotLeads ?? []).slice(0, 3).map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-xl border border-gray-200 px-3 py-3 hover:border-blue-200">
                  <p className="font-medium text-gray-900">{lead.businessName}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.city} · {lead.priority}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}