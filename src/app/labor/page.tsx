'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Clock, PlayCircle, Square, TimerReset, Users } from 'lucide-react';

type LaborRow = {
  id: string;
  name: string;
  role: string;
  status: 'Clocked out' | 'Clocked in' | 'Driving' | 'On job';
  clockIn: string;
  hours: number;
  overtime: number;
  currentJob: string;
};

const STORAGE_KEY = 'fullcrmdemo_labor_v1';

const DEFAULT_LABOR: LaborRow[] = [
  { id: 'H-1001', name: 'Alex Chen', role: 'Lead tech', status: 'On job', clockIn: '7:30 AM', hours: 7.6, overtime: 0.5, currentJob: 'Northside onboarding' },
  { id: 'H-1002', name: 'Morgan Lee', role: 'Field tech', status: 'Driving', clockIn: '8:05 AM', hours: 6.8, overtime: 0, currentJob: 'Maple workflow rollout' },
  { id: 'H-1003', name: 'Taylor Rivera', role: 'Dispatcher', status: 'Clocked in', clockIn: '7:15 AM', hours: 8.1, overtime: 0.3, currentJob: 'Schedule coordination' },
  { id: 'H-1004', name: 'Jordan Parker', role: 'Admin', status: 'Clocked out', clockIn: 'N A', hours: 0, overtime: 0, currentJob: 'Office close out' },
];

function loadLabor() {
  if (typeof window === 'undefined') return DEFAULT_LABOR;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LABOR;
    const parsed = JSON.parse(raw) as LaborRow[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_LABOR;
  } catch {
    return DEFAULT_LABOR;
  }
}

export default function LaborPage() {
  const { enabledModules } = useDemoMode();
  const [labor, setLabor] = useState<LaborRow[]>(DEFAULT_LABOR);

  useEffect(() => {
    setLabor(loadLabor());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(labor));
  }, [labor]);

  const totals = useMemo(() => ({
    onClock: labor.filter((row) => row.status !== 'Clocked out').length,
    onJob: labor.filter((row) => row.status === 'On job').length,
    driving: labor.filter((row) => row.status === 'Driving').length,
    overtime: labor.reduce((sum, row) => sum + row.overtime, 0),
  }), [labor]);

  if (!enabledModules['labor-tracking']) {
    return (
      <AppLayout title="Labor">
        <ModuleGate title="Labor tracking" description="Enable Labor tracking in Feature Builder to show clock in, timesheets, and overtime views." />
      </AppLayout>
    );
  }

  const setStatus = (id: string, status: LaborRow['status']) => {
    setLabor((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const resetDemo = () => {
    setLabor(DEFAULT_LABOR);
  };

  return (
    <AppLayout title="Labor">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">On clock</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.onClock}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">On job</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.onJob}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Driving</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totals.driving}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Overtime hours</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{totals.overtime.toFixed(1)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <h2 className="font-semibold text-gray-800">Labor tracking</h2>
              </div>
              <button type="button" onClick={resetDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                <TimerReset size={15} /> Reset demo
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {labor.map((row) => (
                <div key={row.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{row.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{row.role} · {row.currentJob}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${row.status === 'Clocked out' ? 'bg-gray-100 text-gray-700 border-gray-200' : row.status === 'Driving' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {row.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                    <p>Clock in {row.clockIn}</p>
                    <p>Hours {row.hours.toFixed(1)}</p>
                    <p>Overtime {row.overtime.toFixed(1)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <button type="button" onClick={() => setStatus(row.id, 'Clocked in')} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                      <PlayCircle size={12} /> Clock in
                    </button>
                    <button type="button" onClick={() => setStatus(row.id, 'Driving')} className="text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      Start drive
                    </button>
                    <button type="button" onClick={() => setStatus(row.id, 'On job')} className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
                      Start job
                    </button>
                    <button type="button" onClick={() => setStatus(row.id, 'Clocked out')} className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                      <Square size={12} /> Clock out
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-500" />
                <h2 className="font-semibold text-gray-800">Timesheets and cost view</h2>
              </div>
              <p className="text-sm text-gray-500 mt-2">Show labor costs by employee and keep field time, drive time, and job time on one screen.</p>
            </div>

            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50 text-sm text-gray-700 space-y-2">
              <p className="font-semibold">Today&apos;s labor summary</p>
              <p>Field techs are on route, the dispatcher is coordinating stops, and admin time is separated from billable labor.</p>
              <p>Overtime is tracked so this demo can speak to payroll, utilization, and job margin in one place.</p>
            </div>

            <div className="space-y-2 max-h-[24rem] overflow-y-auto pr-1">
              {labor.map((row) => (
                <div key={`${row.id}-summary`} className="rounded-xl border border-gray-200 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-800">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.currentJob}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs text-gray-600">
                    <p>{row.role}</p>
                    <p>{row.hours.toFixed(1)} hours</p>
                    <p>{row.overtime.toFixed(1)} overtime</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}