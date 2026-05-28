'use client';
import { useState, useEffect, useCallback } from 'react';
import { Save, Users, Plus, Edit3, Trash2, Link2, CreditCard, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import { showToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { INDUSTRY_OPTIONS } from '@/lib/demo-mode';
import type { AppUser } from '@/lib/types';

const SETTINGS_FIELDS = [
  { key: 'businessName', label: 'Business Name', placeholder: 'Full CRM Demo', type: 'text' },
  { key: 'ownerName', label: 'Owner Name', placeholder: 'Aaron Cue', type: 'text' },
  { key: 'email', label: 'Email', placeholder: 'hello@fullcrmdemo.com', type: 'email' },
  { key: 'phone', label: 'Phone', placeholder: '918 808 0074', type: 'text' },
  { key: 'defaultCity', label: 'Default City', placeholder: 'Joplin', type: 'text' },
  { key: 'defaultState', label: 'Default State', placeholder: 'MO', type: 'text' },
  { key: 'defaultLeadSource', label: 'Default Lead Source', placeholder: 'Manual research', type: 'text' },
  { key: 'defaultFollowUpDays', label: 'Default Follow Up Days', placeholder: '3', type: 'number' },
  { key: 'defaultEstimatedValue', label: 'Default Estimated Value ($)', placeholder: '1500', type: 'number' },
];

const TEXTAREA_FIELDS = [
  { key: 'defaultServices', label: 'Default Services Offered', placeholder: 'Website design, Local SEO, Social media management...' },
  { key: 'defaultSignature', label: 'Default Email Signature', placeholder: 'Jordan Parker\nFull CRM Demo\n555 010 2244\nhello@fullcrmdemo.com' },
];

type SessionUser = {
  username: string;
  role: 'admin' | 'member';
  userId: number | null;
  name: string;
};

type UserForm = {
  id: number | null;
  fullName: string;
  username: string;
  role: 'admin' | 'member';
  active: boolean;
  password: string;
};

type LeadOption = { id: number; businessName: string; leadStatus: string };
type RouteOption = { id: number; name: string; routeDate: string; status: string };

const EMPTY_USER_FORM: UserForm = {
  id: null,
  fullName: '',
  username: '',
  role: 'member',
  active: true,
  password: '',
};

export default function SettingsPage() {
  const {
    industry,
    setIndustry,
    enabledModules,
    setModuleEnabled,
    moduleDefinitions,
  } = useDemoMode();

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [showUserModal, setShowUserModal] = useState(false);
  const [userForm, setUserForm] = useState<UserForm>(EMPTY_USER_FORM);
  const [savingUser, setSavingUser] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const [assignmentUser, setAssignmentUser] = useState<AppUser | null>(null);
  const [leadChoices, setLeadChoices] = useState<LeadOption[]>([]);
  const [routeChoices, setRouteChoices] = useState<RouteOption[]>([]);
  const [assignmentLeadIds, setAssignmentLeadIds] = useState<Set<number>>(new Set());
  const [assignmentRouteIds, setAssignmentRouteIds] = useState<Set<number>>(new Set());
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const set = (key: string, value: string) => setSettings((prev) => ({ ...prev, [key]: value }));

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
      showToast('Failed to load users.', 'error');
    }
    setUsersLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [settingsRes, meRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/auth/me'),
        ]);

        if (!cancelled) {
          if (settingsRes.ok) {
            const data = await settingsRes.json();
            setSettings(data);
          }

          if (meRes.ok) {
            const meData = await meRes.json();
            setSessionUser(meData as SessionUser);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (sessionUser?.role === 'admin') {
      fetchUsers();
    }
  }, [sessionUser, fetchUsers]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      showToast('Settings saved!');
    } catch {
      showToast('Failed to save settings.', 'error');
    }
    setSaving(false);
  };

  const openNewUser = () => {
    setUserForm(EMPTY_USER_FORM);
    setShowUserModal(true);
  };

  const openEditUser = (user: AppUser) => {
    setUserForm({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
      active: user.active,
      password: '',
    });
    setShowUserModal(true);
  };

  const saveUser = async () => {
    if (!userForm.fullName.trim() || !userForm.username.trim()) {
      showToast('Name and username are required.', 'error');
      return;
    }

    if (!userForm.id && userForm.password.length < 8) {
      showToast('Password needs at least 8 characters.', 'error');
      return;
    }

    setSavingUser(true);
    try {
      const body = {
        fullName: userForm.fullName.trim(),
        username: userForm.username.trim().toLowerCase(),
        role: userForm.role,
        active: userForm.active,
        password: userForm.password,
      };

      const url = userForm.id ? `/api/users/${userForm.id}` : '/api/users';
      const method = userForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || 'Failed to save user.', 'error');
        setSavingUser(false);
        return;
      }

      showToast(userForm.id ? 'User updated.' : 'User created.');
      setShowUserModal(false);
      fetchUsers();
    } catch {
      showToast('Failed to save user.', 'error');
    }
    setSavingUser(false);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete user.', 'error');
        return;
      }
      showToast('User removed.', 'info');
      fetchUsers();
    } catch {
      showToast('Failed to delete user.', 'error');
    }
  };

  const openAssignments = async (user: AppUser) => {
    setAssignmentUser(user);
    setAssignmentsLoading(true);

    try {
      const [assignRes, leadsRes, routesRes] = await Promise.all([
        fetch(`/api/users/${user.id}/assignments`),
        fetch('/api/leads?sort=businessName&dir=asc'),
        fetch('/api/routes'),
      ]);

      const assignData = assignRes.ok ? await assignRes.json() : { leads: [], routes: [] };
      const leadsData = leadsRes.ok ? await leadsRes.json() : [];
      const routesData = routesRes.ok ? await routesRes.json() : [];

      const leads = (Array.isArray(leadsData) ? leadsData : []) as LeadOption[];
      const routes = (Array.isArray(routesData) ? routesData : []) as RouteOption[];

      setLeadChoices(leads);
      setRouteChoices(routes);
      setAssignmentLeadIds(new Set((assignData.leads || []).map((lead: LeadOption) => lead.id)));
      setAssignmentRouteIds(new Set((assignData.routes || []).map((route: RouteOption) => route.id)));
    } catch {
      setLeadChoices([]);
      setRouteChoices([]);
      setAssignmentLeadIds(new Set());
      setAssignmentRouteIds(new Set());
      showToast('Failed to load assignments.', 'error');
    }

    setAssignmentsLoading(false);
  };

  const saveAssignments = async () => {
    if (!assignmentUser) return;
    setSavingAssignments(true);
    try {
      const res = await fetch(`/api/users/${assignmentUser.id}/assignments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: Array.from(assignmentLeadIds),
          routeIds: Array.from(assignmentRouteIds),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save assignments.', 'error');
        setSavingAssignments(false);
        return;
      }

      showToast('Assignments saved.');
      setAssignmentUser(null);
      fetchUsers();
    } catch {
      showToast('Failed to save assignments.', 'error');
    }
    setSavingAssignments(false);
  };

  const toggleLeadAssignment = (id: number) => {
    setAssignmentLeadIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRouteAssignment = (id: number) => {
    setAssignmentRouteIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  if (loading) return (
    <AppLayout title="Settings">
      <div className="flex justify-center py-16"><div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
    </AppLayout>
  );

  return (
    <AppLayout title="Settings">
      <div className="max-w-5xl space-y-6">

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Business Info</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SETTINGS_FIELDS.map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                <input
                  className={inp}
                  type={type}
                  value={settings[key] || ''}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Defaults and Templates</h2>
          <div className="space-y-4">
            {TEXTAREA_FIELDS.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">{label}</label>
                <textarea
                  className={inp + ' resize-none'}
                  rows={4}
                  value={settings[key] || ''}
                  onChange={(e) => set(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Demo Profile Settings</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Business Type</label>
              <select
                className={inp}
                value={industry}
                onChange={(event) => setIndustry(event.target.value as typeof industry)}
              >
                {INDUSTRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Brand Colors</label>
              <div className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-500 bg-gray-50">
                Demo branding is simulated for each client package.
              </div>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-700 mb-2">Enabled Modules</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2">
            {moduleDefinitions.map((module) => (
              <label key={module.key} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50">
                <input
                  type="checkbox"
                  checked={enabledModules[module.key]}
                  onChange={(event) => setModuleEnabled(module.key, event.target.checked)}
                />
                {module.label}
              </label>
            ))}
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Team members, custom fields, pipeline stages, and service types can be tuned per client during implementation.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-semibold text-gray-800">Billing and subscription</h2>
              <p className="text-sm text-gray-500 mt-1">This is the CRM plan area, where the account owner can review the subscription and request changes.</p>
            </div>
            <Link href="/settings/billing" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
              <CreditCard size={15} /> Open subscription page <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Current plan</p>
              <p className="font-semibold text-gray-900 mt-1">Growth</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Next renewal</p>
              <p className="font-semibold text-gray-900 mt-1">Jun 1, 2026</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
              <p className="text-xs uppercase tracking-wide text-gray-500">Plan status</p>
              <p className="font-semibold text-gray-900 mt-1">Active</p>
            </div>
          </div>
        </div>

        {sessionUser?.role === 'admin' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold text-gray-800">Team Management</h2>
                <p className="text-sm text-gray-500 mt-1">Create users and manage who owns routes and leads.</p>
              </div>
              <button
                onClick={openNewUser}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <Plus size={15} /> Add User
              </button>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-6"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-500 border border-gray-200 rounded-lg p-4">No users found. Add your first team member.</div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800">{user.fullName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                          {user.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                        {!user.active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inactive</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">@{user.username} • {user.leadCount || 0} leads • {user.routeCount || 0} routes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openAssignments(user)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50"
                      >
                        <Link2 size={13} /> Assign
                      </button>
                      <button
                        onClick={() => openEditUser(user)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                        title="Edit user"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pb-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>

      <Modal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={userForm.id ? 'Edit User' : 'Add User'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Full Name</label>
            <input
              className={inp}
              value={userForm.fullName}
              onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Jordan Parker"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Username</label>
            <input
              className={inp}
              value={userForm.username}
              onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))}
              placeholder="jordan"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Role</label>
              <select
                className={inp}
                value={userForm.role}
                onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as 'admin' | 'member' }))}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                className={inp}
                value={userForm.active ? 'active' : 'inactive'}
                onChange={(event) => setUserForm((current) => ({ ...current, active: event.target.value === 'active' }))}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Password {userForm.id ? '(leave empty to keep current password)' : ''}</label>
            <input
              type="password"
              className={inp}
              value={userForm.password}
              onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={userForm.id ? 'Optional password update' : 'At least 8 characters'}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setShowUserModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={saveUser} disabled={savingUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {savingUser ? 'Saving...' : userForm.id ? 'Save User' : 'Create User'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={assignmentUser !== null}
        onClose={() => setAssignmentUser(null)}
        title={assignmentUser ? `Assignments for ${assignmentUser.fullName}` : 'Assignments'}
        size="xl"
      >
        {assignmentsLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <section className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800">Leads and Customers</h3>
                  <span className="text-xs text-gray-500">{assignmentLeadIds.size} selected</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {leadChoices.map((lead) => (
                    <label key={lead.id} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={assignmentLeadIds.has(lead.id)} onChange={() => toggleLeadAssignment(lead.id)} />
                      <span className="truncate">{lead.businessName}</span>
                      <span className="text-xs text-gray-400">{lead.leadStatus}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm text-gray-800">Routes</h3>
                  <span className="text-xs text-gray-500">{assignmentRouteIds.size} selected</span>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1">
                  {routeChoices.map((route) => (
                    <label key={route.id} className="flex items-center gap-2 text-sm text-gray-700 px-2 py-1.5 rounded hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={assignmentRouteIds.has(route.id)} onChange={() => toggleRouteAssignment(route.id)} />
                      <span className="truncate">{route.name || `Route #${route.id}`}</span>
                      <span className="text-xs text-gray-400">{route.routeDate || route.status}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignmentUser(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveAssignments} disabled={savingAssignments} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
                {savingAssignments ? 'Saving...' : 'Save Assignments'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUser}
        title="Delete User"
        message={deleteTarget ? `Delete ${deleteTarget.fullName}? Their lead and route assignments will be cleared.` : ''}
        confirmLabel="Delete"
      />
    </AppLayout>
  );
}
