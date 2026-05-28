'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Activity, DashboardStats, Lead } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';
import { Bell, CheckCircle2, Clock3, Flame, Route, TriangleAlert } from 'lucide-react';

type NotificationKind = 'lead' | 'activity' | 'task' | 'route' | 'system';

interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string;
  time: string;
  read?: boolean;
}

export default function NotificationsPage() {
  const { enabledModules } = useDemoMode();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard').then((res) => (res.ok ? res.json() : Promise.reject(new Error('dashboard')))),
      fetch('/api/activities').then((res) => (res.ok ? res.json() : Promise.reject(new Error('activities')))),
      fetch('/api/leads?sort=updatedDate&dir=desc&_ts=' + Date.now()).then((res) => (res.ok ? res.json() : Promise.reject(new Error('leads')))),
    ])
      .then(([dashboardData, activityData, leadData]) => {
        setStats(dashboardData);
        setActivities(Array.isArray(activityData) ? activityData : []);
        setLeads(Array.isArray(leadData) ? leadData : []);
      })
      .catch(() => {
        setStats(null);
        setActivities([]);
        setLeads([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];

    if (stats) {
      if (stats.followUpDueToday > 0) {
        items.push({
          id: 'followups',
          kind: 'task',
          title: `${stats.followUpDueToday} follow up${stats.followUpDueToday > 1 ? 's' : ''} due today`,
          body: 'Work the leads that need a same day response.',
          href: '/leads?filter=followup',
          time: 'Now',
        });
      }

      if ((stats.routesToday ?? 0) > 0) {
        items.push({
          id: 'routes',
          kind: 'route',
          title: `${stats.routesToday} route${stats.routesToday === 1 ? '' : 's'} ready`,
          body: 'Route builder has active visits for the day.',
          href: '/routes',
          time: 'Today',
        });
      }

      if (stats.hotLeads.length > 0) {
        items.push({
          id: 'hot-leads',
          kind: 'lead',
          title: `${stats.hotLeads.length} hot lead${stats.hotLeads.length > 1 ? 's' : ''} ready`,
          body: 'Open the hottest opportunities first.',
          href: '/lead-scoring',
          time: 'Today',
        });
      }
    }

    activities.slice(0, 6).forEach((activity) => {
      items.push({
        id: `activity-${activity.id}`,
        kind: 'activity',
        title: activity.description,
        body: activity.businessName ? `Lead: ${activity.businessName}` : 'Activity from the CRM timeline.',
        href: activity.leadId ? `/leads/${activity.leadId}` : '/dashboard',
        time: formatDateTime(activity.createdDate),
      });
    });

    const staleLead = leads.find((lead) => lead.nextFollowUpDate && new Date(lead.nextFollowUpDate).getTime() <= Date.now());
    if (staleLead) {
      items.push({
        id: 'stale-followup',
        kind: 'system',
        title: `${staleLead.businessName} is overdue for a follow up`,
        body: 'The next follow up date has passed and needs attention.',
        href: `/leads/${staleLead.id}`,
        time: 'Overdue',
      });
    }

    return items.map((item) => ({ ...item, read: readIds.has(item.id) }));
  }, [activities, leads, readIds, stats]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const iconMap: Record<NotificationKind, React.ElementType> = {
    lead: Flame,
    activity: Bell,
    task: Clock3,
    route: Route,
    system: TriangleAlert,
  };

  if (!enabledModules.notifications) {
    return (
      <AppLayout title="Notifications">
        <ModuleGate title="Notifications" description="Enable Notifications in Feature Builder to show the alert center." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Notifications">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-5">
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-100">Notification center</p>
                <h2 className="text-2xl font-bold mt-1">Keep every follow up visible</h2>
                <p className="text-sm text-blue-100 mt-2 max-w-xl">This view pulls in lead activity, route reminders, and same day tasks so nothing slips through the cracks.</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/10 p-3">
                <Bell size={28} className="text-white" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-sky-100">Unread</p>
                <p className="text-2xl font-bold mt-1">{unreadCount}</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-sky-100">Leads</p>
                <p className="text-2xl font-bold mt-1">{leads.length}</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-xl p-3">
                <p className="text-xs text-sky-100">Actions</p>
                <p className="text-2xl font-bold mt-1">{notifications.length}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-gray-800">Recent alerts</h3>
            <button
              onClick={() => setReadIds(new Set(notifications.map((notification) => notification.id)))}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Mark all read
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-sm text-gray-500">Loading alerts…</div>
          ) : notifications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 text-sm text-gray-500">No alerts are ready right now.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.kind];
                return (
                  <Link
                    href={notification.href}
                    key={notification.id}
                    className={`block bg-white border rounded-2xl shadow-sm p-4 transition-colors ${notification.read ? 'border-gray-100' : 'border-blue-200 ring-1 ring-blue-100'}`}
                    onClick={() => setReadIds((current) => new Set([...current, notification.id]))}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.kind === 'lead' ? 'bg-orange-100 text-orange-600' : notification.kind === 'route' ? 'bg-emerald-100 text-emerald-600' : notification.kind === 'task' ? 'bg-amber-100 text-amber-600' : notification.kind === 'system' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{notification.title}</p>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                        <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-green-500" />
              <h3 className="font-semibold text-gray-800">Quick actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                ['Open leads', '/leads'],
                ['Open routes', '/routes'],
                ['Open tasks', '/tasks'],
                ['Open dashboard', '/dashboard'],
              ].map(([label, href]) => (
                <Link key={label} href={href} className="rounded-xl border border-gray-200 px-3 py-3 text-sm font-medium text-gray-700 hover:border-blue-200 hover:bg-blue-50">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800">Why this matters</h3>
            <p className="text-sm text-gray-600 mt-2">Notifications are gathered from tasks, activities, route updates, and urgent lead follow ups so the CRM feels active without needing another inbox.</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800">Recent lead activity</h3>
            <div className="space-y-3 mt-4">
              {leads.slice(0, 4).map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-xl border border-gray-200 px-3 py-3 hover:border-blue-200">
                  <p className="text-sm font-medium text-gray-900">{lead.businessName}</p>
                  <p className="text-xs text-gray-500 mt-1">{lead.leadStatus} · {lead.priority}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}