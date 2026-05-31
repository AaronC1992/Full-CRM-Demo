'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { CheckCircle2, Link2, Milestone } from 'lucide-react';

type JobStatus = 'Not started' | 'In progress' | 'Blocked' | 'Complete';

type JobItem = {
  id: string;
  customer: string;
  title: string;
  owner: string;
  startDate: string;
  endDate: string;
  status: JobStatus;
  progress: number;
  dependencyIds: string[];
  workDays: number;
  budget: number;
};

const STORAGE_KEY = 'fullcrmdemo_jobs_v2';

const DEFAULT_JOBS: JobItem[] = [
  {
    id: 'J1001',
    customer: 'Northside account',
    title: 'Discovery and kickoff',
    owner: 'Jordan',
    startDate: '2026-06-02',
    endDate: '2026-06-04',
    status: 'Complete',
    progress: 100,
    dependencyIds: [],
    workDays: 3,
    budget: 1800,
  },
  {
    id: 'J1002',
    customer: 'Northside account',
    title: 'Data migration and quality checks',
    owner: 'Taylor',
    startDate: '2026-06-05',
    endDate: '2026-06-09',
    status: 'In progress',
    progress: 58,
    dependencyIds: ['J1001'],
    workDays: 5,
    budget: 4200,
  },
  {
    id: 'J1003',
    customer: 'Maple Street group',
    title: 'Automation workflow release',
    owner: 'Alex',
    startDate: '2026-06-10',
    endDate: '2026-06-13',
    status: 'Not started',
    progress: 0,
    dependencyIds: ['J1002'],
    workDays: 4,
    budget: 3900,
  },
  {
    id: 'J1004',
    customer: 'Cedar Ridge client',
    title: 'Training and go live support',
    owner: 'Morgan',
    startDate: '2026-06-14',
    endDate: '2026-06-16',
    status: 'Not started',
    progress: 0,
    dependencyIds: ['J1003'],
    workDays: 3,
    budget: 2600,
  },
];

function loadJobs() {
  if (typeof window === 'undefined') return DEFAULT_JOBS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_JOBS;
    const parsed = JSON.parse(raw) as JobItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JOBS;
  } catch {
    return DEFAULT_JOBS;
  }
}

function statusBadge(status: JobStatus) {
  if (status === 'Complete') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'Blocked') return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'In progress') return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

export default function JobsPage() {
  const { profile, enabledModules } = useDemoMode();
  const [jobs, setJobs] = useState<JobItem[]>(DEFAULT_JOBS);

  useEffect(() => {
    setJobs(loadJobs());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const readyMap = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const job of jobs) {
      const ready = job.dependencyIds.every((id) => jobs.some((candidate) => candidate.id === id && candidate.status === 'Complete'));
      map.set(job.id, ready);
    }
    return map;
  }, [jobs]);

  const stats = useMemo(() => {
    const completed = jobs.filter((job) => job.status === 'Complete').length;
    const blocked = jobs.filter((job) => job.status === 'Blocked').length;
    const averageProgress = Math.round(jobs.reduce((sum, job) => sum + job.progress, 0) / Math.max(1, jobs.length));
    return { completed, blocked, averageProgress };
  }, [jobs]);

  const updateProgress = (jobId: string, progress: number) => {
    setJobs((current) => current.map((job) => {
      if (job.id !== jobId) return job;
      const safeProgress = Math.max(0, Math.min(100, progress));
      const nextStatus: JobStatus = safeProgress >= 100 ? 'Complete' : (safeProgress > 0 ? 'In progress' : 'Not started');
      return { ...job, progress: safeProgress, status: nextStatus };
    }));
  };

  const markBlocked = (jobId: string) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status: 'Blocked' } : job)));
  };

  if (!enabledModules['job-tracking'] && !enabledModules['multi-day-operations']) {
    return (
      <AppLayout title="Jobs or Projects">
        <ModuleGate title="Job tracking" description="Enable Job tracking in Feature Builder to show this page." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Jobs or Projects">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">{profile.jobLabel}</h2>
          <p className="text-sm text-gray-500 mt-1">Track multi day work, dependencies, owners, and progress in one place.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Completed jobs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Blocked jobs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.blocked}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Average progress</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageProgress}%</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Job ID</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Customer</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Scope</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Window</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Dependencies</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Owner</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Budget</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Progress</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{job.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{job.customer}</td>
                  <td className="px-4 py-3 text-gray-700">{job.title}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <p>{job.startDate}</p>
                    <p className="text-xs text-gray-500">to {job.endDate}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge(job.status)}`}>{job.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {job.dependencyIds.length === 0 ? (
                      <span className="text-xs text-gray-500">None</span>
                    ) : (
                      <div className="space-y-1">
                        {job.dependencyIds.map((dep) => (
                          <div key={dep} className="inline-flex items-center gap-1 text-xs text-gray-600 mr-2">
                            <Link2 size={12} />
                            {dep}
                          </div>
                        ))}
                      </div>
                    )}
                    {!readyMap.get(job.id) && <p className="text-xs text-red-600 mt-1">Waiting on dependency</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{job.owner}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">${job.budget.toLocaleString()}</td>
                  <td className="px-4 py-3 min-w-44">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${job.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={job.progress}
                        onChange={(event) => updateProgress(job.id, Number(event.target.value))}
                        className="w-full"
                        disabled={!readyMap.get(job.id) && job.progress === 0}
                      />
                      <span className="text-xs text-gray-500 w-9 text-right">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProgress(job.id, 100)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-green-200 bg-green-50 text-green-700"
                        type="button"
                      >
                        <CheckCircle2 size={12} /> Done
                      </button>
                      <button
                        onClick={() => markBlocked(job.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs border border-red-200 bg-red-50 text-red-700"
                        type="button"
                      >
                        <Milestone size={12} /> Blocked
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
