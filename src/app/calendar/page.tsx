'use client';

import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { getIndustryCalendar } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TYPES = ['Appointment', 'Job', 'Meeting', 'Consultation', 'Event'] as const;

export default function CalendarPage() {
  const { industry, enabledModules } = useDemoMode();

  if (!enabledModules.scheduling) {
    return (
      <AppLayout title="Calendar">
        <ModuleGate title="Calendar" description="Enable Scheduling in Feature Builder to show this module." />
      </AppLayout>
    );
  }

  const events = getIndustryCalendar(industry);

  return (
    <AppLayout title="Calendar">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-800">Day, week, and month scheduling</h2>
          <p className="text-sm text-gray-500 mt-1">This is a simulated scheduling view for appointments, jobs, meetings, consultations, and events.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <section className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Week view</h3>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day) => (
                <div key={day} className="bg-gray-50 border border-gray-200 rounded-lg p-2 min-h-40">
                  <p className="text-xs font-semibold text-gray-600 mb-2">{day}</p>
                  <div className="space-y-1">
                    {events
                      .filter((event) => event.day === day)
                      .map((event) => (
                        <div key={event.id} className="bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
                          <p className="text-[11px] font-semibold text-blue-700">{event.time}</p>
                          <p className="text-xs text-blue-900">{event.title}</p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Day agenda</h3>
            <div className="space-y-2">
              {events.slice(0, 5).map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500">{event.day} • {event.time}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.type} • {event.owner}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Month legend</h3>
          <div className="grid sm:grid-cols-5 gap-2">
            {TYPES.map((type) => (
              <div key={type} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">
                {type}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
