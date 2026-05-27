'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Edit3, Plus, Sparkles, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { showToast } from '@/components/ui/Toast';

type AutomationStatus = 'active' | 'paused';
type AutomationTrigger = 'new lead' | 'form submitted' | 'estimate approved' | 'invoice overdue' | 'review received' | 'task completed';
type AutomationAction = 'create task' | 'send email' | 'send text' | 'create deal' | 'add tag' | 'notify team';
type AutomationChannel = 'CRM' | 'Email' | 'SMS' | 'Internal';

type Automation = {
  id: number;
  name: string;
  trigger: AutomationTrigger;
  condition: string;
  action: AutomationAction;
  channel: AutomationChannel;
  status: AutomationStatus;
  runsThisWeek: number;
  notes: string;
};

type AutomationForm = {
  name: string;
  trigger: AutomationTrigger;
  condition: string;
  action: AutomationAction;
  channel: AutomationChannel;
  status: AutomationStatus;
  notes: string;
};

const STORAGE_KEY = 'full-crm-demo-automations';

const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: 1,
    name: 'Lead response sprint',
    trigger: 'new lead',
    condition: 'Lead source is web form and priority is high',
    action: 'send text',
    channel: 'SMS',
    status: 'active',
    runsThisWeek: 18,
    notes: 'Replies within five minutes and assigns an owner task.',
  },
  {
    id: 2,
    name: 'Review request follow up',
    trigger: 'task completed',
    condition: 'Job is marked complete and customer is satisfied',
    action: 'send email',
    channel: 'Email',
    status: 'active',
    runsThisWeek: 12,
    notes: 'Sends a review request after the job closes.',
  },
  {
    id: 3,
    name: 'Overdue invoice reminder',
    trigger: 'invoice overdue',
    condition: 'Invoice remains unpaid for seven days',
    action: 'notify team',
    channel: 'Internal',
    status: 'paused',
    runsThisWeek: 4,
    notes: 'Alerts the account owner before a follow up call.',
  },
];

const TRIGGERS: AutomationTrigger[] = ['new lead', 'form submitted', 'estimate approved', 'invoice overdue', 'review received', 'task completed'];
const ACTIONS: AutomationAction[] = ['create task', 'send email', 'send text', 'create deal', 'add tag', 'notify team'];
const CHANNELS: AutomationChannel[] = ['CRM', 'Email', 'SMS', 'Internal'];

const EMPTY_FORM: AutomationForm = {
  name: '',
  trigger: 'new lead',
  condition: '',
  action: 'create task',
  channel: 'CRM',
  status: 'active',
  notes: '',
};

const PRESETS: AutomationForm[] = [
  {
    name: 'Lead response sprint',
    trigger: 'new lead',
    condition: 'Priority is high or source is website',
    action: 'send text',
    channel: 'SMS',
    status: 'active',
    notes: 'Speed to lead workflow for fresh inquiries.',
  },
  {
    name: 'Quote follow up',
    trigger: 'estimate approved',
    condition: 'Customer has not replied in two days',
    action: 'create task',
    channel: 'CRM',
    status: 'active',
    notes: 'Creates a follow up task for the assigned rep.',
  },
  {
    name: 'Review request flow',
    trigger: 'task completed',
    condition: 'Job status changes to done',
    action: 'send email',
    channel: 'Email',
    status: 'active',
    notes: 'Asks for a review and routes replies to the team.',
  },
];

export default function AutomationsPage() {
  const { enabledModules } = useDemoMode();
  const [hydrated, setHydrated] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>(DEFAULT_AUTOMATIONS);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editAutomation, setEditAutomation] = useState<AutomationForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setAutomations(JSON.parse(raw) as Automation[]);
      } catch {
        setAutomations(DEFAULT_AUTOMATIONS);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(automations));
  }, [automations, hydrated]);

  const stats = useMemo(() => {
    const active = automations.filter((automation) => automation.status === 'active').length;
    const paused = automations.length - active;
    const runs = automations.reduce((total, automation) => total + automation.runsThisWeek, 0);
    return { active, paused, runs };
  }, [automations]);

  if (!enabledModules['automations']) {
    return (
      <AppLayout title="Automations">
        <ModuleGate title="Automations" description="Enable Automations in Feature Builder to show this section." />
      </AppLayout>
    );
  }

  const openNew = (preset?: AutomationForm) => {
    setEditingId(null);
    setEditAutomation(preset ? { ...preset } : EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (automation: Automation) => {
    setEditingId(automation.id);
    setEditAutomation({
      name: automation.name,
      trigger: automation.trigger,
      condition: automation.condition,
      action: automation.action,
      channel: automation.channel,
      status: automation.status,
      notes: automation.notes,
    });
    setShowModal(true);
  };

  const saveAutomation = () => {
    if (!editAutomation.name.trim() || !editAutomation.condition.trim()) {
      showToast('Name and condition are required.', 'error');
      return;
    }

    if (editingId === null) {
      const newAutomation: Automation = {
        id: Date.now(),
        name: editAutomation.name.trim(),
        trigger: editAutomation.trigger,
        condition: editAutomation.condition.trim(),
        action: editAutomation.action,
        channel: editAutomation.channel,
        status: editAutomation.status,
        runsThisWeek: 0,
        notes: editAutomation.notes.trim(),
      };
      setAutomations((current) => [newAutomation, ...current]);
      showToast('Automation created.');
    } else {
      setAutomations((current) => current.map((automation) => (
        automation.id === editingId
          ? {
              ...automation,
              name: editAutomation.name.trim(),
              trigger: editAutomation.trigger,
              condition: editAutomation.condition.trim(),
              action: editAutomation.action,
              channel: editAutomation.channel,
              status: editAutomation.status,
              notes: editAutomation.notes.trim(),
            }
          : automation
      )));
      showToast('Automation updated.');
    }

    setShowModal(false);
  };

  const toggleStatus = (automationId: number) => {
    setAutomations((current) => current.map((automation) => {
      if (automation.id !== automationId) return automation;
      return { ...automation, status: automation.status === 'active' ? 'paused' : 'active' };
    }));
  };

  const deleteAutomation = () => {
    if (deleteTarget === null) return;
    setAutomations((current) => current.filter((automation) => automation.id !== deleteTarget));
    setDeleteTarget(null);
    showToast('Automation removed.', 'info');
  };

  return (
    <AppLayout title="Automations">
      <div className="max-w-6xl space-y-5">
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Automation studio</p>
              <h2 className="text-2xl font-semibold mt-2">Build rule based workflows that keep deals moving</h2>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                Create automations that react to lead activity, job milestones, and invoice events, then trigger the next task automatically.
              </p>
            </div>
            <button
              onClick={() => openNew()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100"
              type="button"
            >
              <Plus size={16} /> New automation
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Active</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
            <p className="text-sm text-gray-500 mt-1">Running now</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Paused</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.paused}</p>
            <p className="text-sm text-gray-500 mt-1">Waiting to resume</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Runs this week</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.runs}</p>
            <p className="text-sm text-gray-500 mt-1">Triggered by events</p>
          </div>
        </div>

        <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-semibold text-gray-800">Quick start presets</h3>
              <p className="text-sm text-gray-500 mt-1">Start from a common workflow, then customize the rule.</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => openNew(preset)}
                className="text-left border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">{preset.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Trigger, action, and follow up flow included.</p>
                  </div>
                  <Sparkles size={16} className="text-blue-500 shrink-0 mt-0.5" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          {automations.map((automation) => (
            <div key={automation.id} className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-800">{automation.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${automation.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {automation.status === 'active' ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    When {automation.trigger} and {automation.condition.toLowerCase()}, {automation.action} in {automation.channel}.
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{automation.notes}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleStatus(automation.id)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {automation.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(automation)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                    title="Edit automation"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(automation.id)}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
                    title="Delete automation"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Trigger</p>
                  <p className="font-medium text-gray-800 mt-1">{automation.trigger}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Action</p>
                  <p className="font-medium text-gray-800 mt-1">{automation.action}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Runs this week</p>
                  <p className="font-medium text-gray-800 mt-1">{automation.runsThisWeek}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Automation ideas to add next</p>
              <p className="text-sm text-slate-300 mt-1">
                Lead assignment, missed call recovery, renewal reminders, and internal alerts for hot opportunities.
              </p>
            </div>
          </div>
        </section>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId === null ? 'New automation' : 'Edit automation'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name</label>
              <input
                value={editAutomation.name}
                onChange={(event) => setEditAutomation((current) => ({ ...current, name: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lead response sprint"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                value={editAutomation.status}
                onChange={(event) => setEditAutomation((current) => ({ ...current, status: event.target.value as AutomationStatus }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Trigger</label>
              <select
                value={editAutomation.trigger}
                onChange={(event) => setEditAutomation((current) => ({ ...current, trigger: event.target.value as AutomationTrigger }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {TRIGGERS.map((trigger) => <option key={trigger} value={trigger}>{trigger}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Action</label>
              <select
                value={editAutomation.action}
                onChange={(event) => setEditAutomation((current) => ({ ...current, action: event.target.value as AutomationAction }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ACTIONS.map((action) => <option key={action} value={action}>{action}</option>)}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Channel</label>
              <select
                value={editAutomation.channel}
                onChange={(event) => setEditAutomation((current) => ({ ...current, channel: event.target.value as AutomationChannel }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CHANNELS.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Condition</label>
              <input
                value={editAutomation.condition}
                onChange={(event) => setEditAutomation((current) => ({ ...current, condition: event.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Lead source is web form and priority is high"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea
              value={editAutomation.notes}
              onChange={(event) => setEditAutomation((current) => ({ ...current, notes: event.target.value }))}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Describe what the automation should do after it runs."
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveAutomation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {editingId === null ? 'Create automation' : 'Save changes'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteAutomation}
        title="Delete automation"
        message="Delete this automation? This cannot be undone."
        confirmLabel="Delete"
      />
    </AppLayout>
  );
}