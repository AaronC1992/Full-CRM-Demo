'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Users, Smartphone, Laptop, Clock3, ChevronRight } from 'lucide-react';

type Role = 'Admin' | 'Dispatcher' | 'Field tech' | 'Sales';

type TeamRow = {
  id: string;
  name: string;
  role: Role;
  mobileCheckIns: number;
  jobsCompleted: number;
  utilization: number;
  status: 'Active' | 'Away';
};

const DEFAULT_TEAM: TeamRow[] = [
  { id: 'U1001', name: 'Jordan Parker', role: 'Admin', mobileCheckIns: 6, jobsCompleted: 4, utilization: 78, status: 'Active' },
  { id: 'U1002', name: 'Taylor Rivera', role: 'Dispatcher', mobileCheckIns: 2, jobsCompleted: 1, utilization: 72, status: 'Active' },
  { id: 'U1003', name: 'Alex Chen', role: 'Field tech', mobileCheckIns: 11, jobsCompleted: 8, utilization: 85, status: 'Active' },
  { id: 'U1004', name: 'Morgan Lee', role: 'Sales', mobileCheckIns: 4, jobsCompleted: 3, utilization: 69, status: 'Away' },
];

export default function TeamPage() {
  const { enabledModules } = useDemoMode();
  const [team, setTeam] = useState<TeamRow[]>(DEFAULT_TEAM);
  const [officeSeats, setOfficeSeats] = useState(3);
  const [mobileSeats, setMobileSeats] = useState(6);

  const seatUsage = useMemo(() => {
    const officeUsed = team.filter((member) => member.role === 'Admin' || member.role === 'Dispatcher').length;
    const mobileUsed = team.filter((member) => member.role === 'Field tech' || member.role === 'Sales').length;
    return { officeUsed, mobileUsed };
  }, [team]);

  if (!enabledModules['employee-operations'] && !enabledModules['seat-licensing']) {
    return (
      <AppLayout title="Team Ops">
        <ModuleGate title="Team Ops" description="Enable Employee tracking in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Team Ops">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active team</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{team.filter((member) => member.status === 'Active').length}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Mobile check ins</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{team.reduce((sum, member) => sum + member.mobileCheckIns, 0)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Jobs completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{team.reduce((sum, member) => sum + member.jobsCompleted, 0)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Average utilization</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{Math.round(team.reduce((sum, member) => sum + member.utilization, 0) / team.length)}%</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Office seats used</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{seatUsage.officeUsed} of {officeSeats}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Mobile seats used</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{seatUsage.mobileUsed} of {mobileSeats}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Labor tracking</p>
            <Link href="/labor" className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline">
              Open labor view <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              <h2 className="font-semibold text-gray-800">Employee tracking</h2>
            </div>
            <div className="mt-3 space-y-2">
              {team.map((member) => (
                <div key={member.id} className="border border-gray-200 rounded-lg px-3 py-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{member.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{member.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${member.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{member.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                    <p>Check ins: {member.mobileCheckIns}</p>
                    <p>Jobs: {member.jobsCompleted}</p>
                    <p>Utilization: {member.utilization}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${member.utilization}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Clock3 size={15} className="text-blue-500" />
                Labor and activity view
              </div>
              <p className="mt-2">Use the separate labor page for clock in, clock out, driving, and job time so the demo can show a more realistic field operation workflow.</p>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h2 className="font-semibold text-gray-800">Seat and role licensing</h2>
            <p className="text-sm text-gray-500 mt-2">Separate office seats and mobile seats for a realistic role based licensing model.</p>

            <div className="mt-3 space-y-3">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Laptop size={15} className="text-indigo-500" />
                  <p className="font-medium text-gray-800">Office seats</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">Used {seatUsage.officeUsed} of {officeSeats}</p>
                <input type="range" min={1} max={20} value={officeSeats} onChange={(event) => setOfficeSeats(Number(event.target.value))} className="w-full mt-2" />
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Smartphone size={15} className="text-emerald-500" />
                  <p className="font-medium text-gray-800">Mobile seats</p>
                </div>
                <p className="text-sm text-gray-600 mt-2">Used {seatUsage.mobileUsed} of {mobileSeats}</p>
                <input type="range" min={1} max={30} value={mobileSeats} onChange={(event) => setMobileSeats(Number(event.target.value))} className="w-full mt-2" />
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm text-gray-700">
                <p className="font-semibold">Licensing summary</p>
                <p className="mt-1">Office roles: Admin and Dispatcher</p>
                <p>Mobile roles: Field tech and Sales</p>
                <p className="mt-2">Estimated monthly seat cost: ${((officeSeats * 89) + (mobileSeats * 39)).toLocaleString()}</p>
              </div>

              <Link href="/integrations" className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                Review accounting sync
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
