'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getLeadSourceMetrics } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

type DeliveryCadence = 'Daily' | 'Weekly' | 'Monthly';

type ReportDefinition = {
  id: string;
  name: string;
  metric: string;
  groupBy: string;
  filter: string;
  cadence: DeliveryCadence;
  recipients: string;
  lastRun: string;
};

const KPI_LIST = [
  { label: 'Revenue', value: '$92,450' },
  { label: 'Lead conversion rate', value: '31%' },
  { label: 'Open follow ups', value: '44' },
  { label: 'Completed jobs', value: '118' },
  { label: 'Customer retention', value: '86%' },
  { label: 'Top services', value: 'Automation, scheduling, reporting' },
  { label: 'Monthly activity', value: '1,284 timeline entries' },
  { label: 'Team performance', value: '4.6 out of 5 quality score' },
];

const STORAGE_KEY = 'fullcrmdemo_custom_reports_v2';

const DEFAULT_REPORTS: ReportDefinition[] = [
  {
    id: 'R1001',
    name: 'Weekly pipeline health',
    metric: 'Lead conversion rate',
    groupBy: 'Owner',
    filter: 'Open stages only',
    cadence: 'Weekly',
    recipients: 'owner@fullcrmdemo.com',
    lastRun: '2026-05-30',
  },
  {
    id: 'R1002',
    name: 'Monthly margin summary',
    metric: 'Gross margin',
    groupBy: 'Service type',
    filter: 'Closed work only',
    cadence: 'Monthly',
    recipients: 'finance@fullcrmdemo.com',
    lastRun: '2026-05-31',
  },
];

const EMPTY_REPORT: Omit<ReportDefinition, 'id' | 'lastRun'> = {
  name: '',
  metric: 'Lead conversion rate',
  groupBy: 'Owner',
  filter: 'All data',
  cadence: 'Weekly',
  recipients: 'owner@fullcrmdemo.com',
};

function loadReports() {
  if (typeof window === 'undefined') return DEFAULT_REPORTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_REPORTS;
    const parsed = JSON.parse(raw) as ReportDefinition[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REPORTS;
  } catch {
    return DEFAULT_REPORTS;
  }
}

export default function ReportsPage() {
  const { industry, enabledModules } = useDemoMode();
  const [reports, setReports] = useState<ReportDefinition[]>(DEFAULT_REPORTS);
  const [builder, setBuilder] = useState(EMPTY_REPORT);

  useEffect(() => {
    setReports(loadReports());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const scheduledCount = useMemo(() => reports.length, [reports]);

  if (!enabledModules.reports && !enabledModules['report-builder']) {
    return (
      <AppLayout title="Reports">
        <ModuleGate title="Reports" description="Enable Reports in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  const sources = getLeadSourceMetrics(industry);

  return (
    <AppLayout title="Reports">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {KPI_LIST.slice(0, 4).map((kpi) => (
            <div key={kpi.label} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Scheduled reports</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{scheduledCount}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Builder templates</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Last run status</p>
            <p className="text-2xl font-bold text-green-600 mt-1">Healthy</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Lead source performance</h2>
            <div className="space-y-2 mt-3">
              {sources.map((row) => (
                <div key={row.source} className="border border-gray-200 rounded-lg px-3 py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800">{row.source}</span>
                    <span className="text-gray-600">{row.leads} leads</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Conversion rate: {row.conversion}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Custom report builder</h2>
            <div className="space-y-2 mt-3 text-sm text-gray-700">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Report name</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.name} onChange={(event) => setBuilder((current) => ({ ...current, name: event.target.value }))} placeholder="Weekly operations scorecard" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Metric</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.metric} onChange={(event) => setBuilder((current) => ({ ...current, metric: event.target.value }))}>
                    <option>Lead conversion rate</option>
                    <option>Revenue</option>
                    <option>Gross margin</option>
                    <option>Task completion</option>
                    <option>Route efficiency</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Group by</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.groupBy} onChange={(event) => setBuilder((current) => ({ ...current, groupBy: event.target.value }))}>
                    <option>Owner</option>
                    <option>Team</option>
                    <option>Service type</option>
                    <option>Lead source</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Filter</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.filter} onChange={(event) => setBuilder((current) => ({ ...current, filter: event.target.value }))} placeholder="Closed work only" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cadence</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.cadence} onChange={(event) => setBuilder((current) => ({ ...current, cadence: event.target.value as DeliveryCadence }))}>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Recipients</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2" value={builder.recipients} onChange={(event) => setBuilder((current) => ({ ...current, recipients: event.target.value }))} placeholder="owner@fullcrmdemo.com" />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!builder.name.trim()) return;
                  const report: ReportDefinition = {
                    id: `R${Date.now().toString().slice(-4)}`,
                    lastRun: new Date().toISOString().slice(0, 10),
                    ...builder,
                    name: builder.name.trim(),
                  };
                  setReports((current) => [report, ...current]);
                  setBuilder(EMPTY_REPORT);
                }}
                className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700"
              >
                Save custom report
              </button>
            </div>
          </section>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800">Scheduled report delivery</h3>
          <div className="mt-3 space-y-2">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{report.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{report.metric} by {report.groupBy}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{report.cadence}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Filter: {report.filter}</p>
                <p className="text-xs text-gray-500">Recipients: {report.recipients}</p>
                <p className="text-xs text-gray-400 mt-1">Last run: {report.lastRun}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
