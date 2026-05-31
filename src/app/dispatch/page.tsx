'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Navigation, MapPin, RefreshCw, Users, Clock, Route as RouteIcon } from 'lucide-react';

type Crew = {
  id: string;
  name: string;
  role: string;
  territory: string;
  status: 'Idle' | 'On route' | 'On site';
  stopsAssigned: number;
  eta: string;
};

type DispatchStop = {
  id: string;
  customer: string;
  city: string;
  priority: 'Hot' | 'Warm' | 'Standard';
  driveTime: string;
  status: 'Unassigned' | 'Assigned' | 'On route' | 'Complete';
  crewId: string | null;
};

const STORAGE_KEY = 'fullcrmdemo_dispatch_v1';

const DEFAULT_CREWS: Crew[] = [
  { id: 'C-1', name: 'Alex Chen', role: 'Lead tech', territory: 'North zone', status: 'On route', stopsAssigned: 3, eta: '10:30 AM' },
  { id: 'C-2', name: 'Morgan Lee', role: 'Field tech', territory: 'East zone', status: 'Idle', stopsAssigned: 2, eta: '11:10 AM' },
  { id: 'C-3', name: 'Taylor Rivera', role: 'Dispatcher', territory: 'West zone', status: 'On site', stopsAssigned: 4, eta: '11:45 AM' },
];

const DEFAULT_STOPS: DispatchStop[] = [
  { id: 'S-1001', customer: 'Northside account', city: 'Joplin', priority: 'Hot', driveTime: '12 min', status: 'Assigned', crewId: 'C-1' },
  { id: 'S-1002', customer: 'Maple Street group', city: 'Carl Junction', priority: 'Warm', driveTime: '18 min', status: 'Unassigned', crewId: null },
  { id: 'S-1003', customer: 'Cedar Ridge client', city: 'Webb City', priority: 'Standard', driveTime: '9 min', status: 'On route', crewId: 'C-3' },
  { id: 'S-1004', customer: 'Lake View account', city: 'Neosho', priority: 'Hot', driveTime: '26 min', status: 'Unassigned', crewId: null },
];

function loadState() {
  if (typeof window === 'undefined') return { crews: DEFAULT_CREWS, stops: DEFAULT_STOPS };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { crews: DEFAULT_CREWS, stops: DEFAULT_STOPS };
    const parsed = JSON.parse(raw) as { crews?: Crew[]; stops?: DispatchStop[] };
    return {
      crews: Array.isArray(parsed.crews) && parsed.crews.length ? parsed.crews : DEFAULT_CREWS,
      stops: Array.isArray(parsed.stops) && parsed.stops.length ? parsed.stops : DEFAULT_STOPS,
    };
  } catch {
    return { crews: DEFAULT_CREWS, stops: DEFAULT_STOPS };
  }
}

export default function DispatchPage() {
  const { enabledModules } = useDemoMode();
  const [crews, setCrews] = useState<Crew[]>(DEFAULT_CREWS);
  const [stops, setStops] = useState<DispatchStop[]>(DEFAULT_STOPS);

  useEffect(() => {
    const next = loadState();
    setCrews(next.crews);
    setStops(next.stops);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ crews, stops }));
  }, [crews, stops]);

  const stats = useMemo(() => ({
    unassigned: stops.filter((stop) => stop.status === 'Unassigned').length,
    assigned: stops.filter((stop) => stop.status === 'Assigned').length,
    active: stops.filter((stop) => stop.status === 'On route').length,
    complete: stops.filter((stop) => stop.status === 'Complete').length,
  }), [stops]);

  if (!enabledModules.dispatch) {
    return (
      <AppLayout title="Dispatch">
        <ModuleGate title="Dispatch" description="Enable Dispatch board in Feature Builder to show smart maps and crew routing." />
      </AppLayout>
    );
  }

  const assignStop = (stopId: string, crewId: string) => {
    setStops((current) => current.map((stop) => (stop.id === stopId ? { ...stop, crewId, status: 'Assigned' } : stop)));
  };

  const optimizeRoutes = () => {
    const priorityRank: Record<DispatchStop['priority'], number> = { Hot: 0, Warm: 1, Standard: 2 };
    setStops((current) => [...current].sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority] || left.driveTime.localeCompare(right.driveTime)));
  };

  const advanceStatus = (stopId: string) => {
    setStops((current) => current.map((stop) => {
      if (stop.id !== stopId) return stop;
      const nextStatus = stop.status === 'Unassigned' ? 'Assigned' : stop.status === 'Assigned' ? 'On route' : stop.status === 'On route' ? 'Complete' : 'Complete';
      return { ...stop, status: nextStatus };
    }));
  };

  const resetDemo = () => {
    setCrews(DEFAULT_CREWS);
    setStops(DEFAULT_STOPS);
  };

  return (
    <AppLayout title="Dispatch">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Unassigned stops</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.unassigned}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Assigned</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.assigned}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">On route</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Complete</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.complete}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 justify-between flex-wrap">
              <div className="flex items-center gap-2">
                <Navigation size={16} className="text-blue-500" />
                <h2 className="font-semibold text-gray-800">Smart maps and route queue</h2>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={optimizeRoutes} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                  <RouteIcon size={15} /> Optimize routes
                </button>
                <button type="button" onClick={resetDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
                  <RefreshCw size={15} /> Reset demo
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 mt-4">
              {stops.map((stop) => (
                <div key={stop.id} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{stop.customer}</p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin size={11} />{stop.city}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${stop.priority === 'Hot' ? 'bg-red-50 text-red-700 border-red-200' : stop.priority === 'Warm' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {stop.priority}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                    <p>Drive {stop.driveTime}</p>
                    <p>Status {stop.status}</p>
                    <p>{stop.crewId ? `Crew ${stop.crewId}` : 'Unassigned'}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {crews.map((crew) => (
                      <button key={crew.id} type="button" onClick={() => assignStop(stop.id, crew.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700">
                        Assign {crew.name.split(' ')[0]}
                      </button>
                    ))}
                    <button type="button" onClick={() => advanceStatus(stop.id)} className="text-xs px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
                      Advance status
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 bg-slate-900 text-white p-4">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-sky-300" />
                <p className="font-semibold">Smart map summary</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm text-slate-200">
                <div className="rounded-lg bg-white/10 border border-white/10 p-3">
                  <p className="text-xs text-slate-300">Drive time saved</p>
                  <p className="text-xl font-bold mt-1">34 min</p>
                </div>
                <div className="rounded-lg bg-white/10 border border-white/10 p-3">
                  <p className="text-xs text-slate-300">Territories live</p>
                  <p className="text-xl font-bold mt-1">3</p>
                </div>
                <div className="rounded-lg bg-white/10 border border-white/10 p-3">
                  <p className="text-xs text-slate-300">Route efficiency</p>
                  <p className="text-xl font-bold mt-1">92%</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-green-500" />
              <h2 className="font-semibold text-gray-800">Crew dispatch board</h2>
            </div>
            <div className="space-y-3 mt-3">
              {crews.map((crew) => (
                <div key={crew.id} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{crew.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{crew.role} · {crew.territory}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${crew.status === 'Idle' ? 'bg-gray-100 text-gray-700 border-gray-200' : crew.status === 'On route' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {crew.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                    <p>Stops {crew.stopsAssigned}</p>
                    <p>ETA {crew.eta}</p>
                    <p>{crew.territory}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              Smart maps combine territory coverage, stop order, and crew status so dispatch can see what is open, assigned, and already on the road.
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}