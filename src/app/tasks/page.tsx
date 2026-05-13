'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Modal from '@/components/ui/Modal';
import { showToast } from '@/components/ui/Toast';
import { Task, TaskType } from '@/lib/types';
import { formatDate, isOverdue, isDueToday } from '@/lib/utils';
import { Plus, Edit3, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const TASK_TYPES: TaskType[] = ['Call', 'Email', 'Facebook message', 'Text', 'Build demo', 'Send demo', 'Follow up', 'Meeting', 'Proposal', 'Other'];
const TYPE_LABELS: Record<TaskType, string> = {
  'Call': 'Call', 'Email': 'Email', 'Facebook message': 'FB Message', 'Text': 'Text',
  'Build demo': 'Build Demo', 'Send demo': 'Send Demo', 'Follow up': 'Follow Up',
  'Meeting': 'Meeting', 'Proposal': 'Proposal', 'Other': 'Other',
};

const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  'Low': 'bg-blue-100 text-blue-700 border-blue-200',
  'Normal': 'bg-amber-100 text-amber-700 border-amber-200',
  'High': 'bg-orange-100 text-orange-700 border-orange-200',
  'Urgent': 'bg-red-100 text-red-700 border-red-200',
};

const EMPTY: Partial<Task> = { title: '', taskType: 'Call', dueDate: '', priority: 'Normal', status: 'pending', notes: '' };

export default function TasksPage() {
  const [tasks, setTasks] = useState<(Task & { leadName?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'in_progress' | 'completed' | ''>('pending');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Partial<Task>>(EMPTY);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    const params = filterStatus ? `?status=${filterStatus}` : '';
    const res = await fetch(`/api/tasks${params}`);
    if (res.ok) setTasks(await res.json());
    setLoading(false);
  }, [filterStatus]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openNew = () => { setEditTask(EMPTY); setIsNew(true); setShowModal(true); };
  const openEdit = (t: Task) => { setEditTask({ ...t }); setIsNew(false); setShowModal(true); };

  const save = async () => {
    if (!editTask.title?.trim()) { showToast('Title is required.', 'error'); return; }
    setSaving(true);
    try {
      const url = isNew ? '/api/tasks' : `/api/tasks/${editTask.id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTask),
      });
      if (!res.ok) throw new Error();
      showToast(isNew ? 'Task added!' : 'Task updated!');
      setShowModal(false);
      fetchTasks();
    } catch { showToast('Failed to save.', 'error'); }
    setSaving(false);
  };

  const deleteTask = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    showToast('Task deleted.', 'info');
    fetchTasks();
  };

  const toggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (newStatus === 'completed') showToast('Task completed! ✓');
    fetchTasks();
  };

  const overdueCount = tasks.filter(t => t.dueDate && isOverdue(t.dueDate) && t.status !== 'completed').length;
  const todayCount = tasks.filter(t => t.dueDate && isDueToday(t.dueDate) && t.status !== 'completed').length;

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <AppLayout title="Tasks & Follow Ups">
      <div className="max-w-4xl space-y-5">

        {/* Alert banners */}
        {overdueCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
            <AlertCircle size={16} />
            {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''} need attention!
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: 'text-gray-800' },
            { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'text-blue-600' },
            { label: 'Due Today', value: todayCount, color: todayCount > 0 ? 'text-amber-600' : 'text-gray-800' },
            { label: 'Overdue', value: overdueCount, color: overdueCount > 0 ? 'text-red-600' : 'text-gray-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
            {([['', 'All'], ['pending', 'Pending'], ['in_progress', 'In Progress'], ['completed', 'Done']] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilterStatus(val)}
                className={`px-3 py-2 transition-colors ${filterStatus === val ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus size={16} /> Add Task
          </button>
        </div>

        {loading && <div className="flex justify-center py-12"><div className="animate-spin w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}
        {!loading && tasks.length === 0 && <div className="text-center py-16 text-gray-400">No tasks. <button onClick={openNew} className="text-blue-500 hover:underline">Add one.</button></div>}

        {/* Task list */}
        <div className="space-y-2">
          {tasks.map(task => {
            const overdue = task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed';
            const dueToday = task.dueDate && isDueToday(task.dueDate) && task.status !== 'completed';
            return (
              <div
                key={task.id}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-start gap-3 transition-all ${
                  overdue ? 'border-red-200 bg-red-50/30' :
                  dueToday ? 'border-amber-200 bg-amber-50/30' :
                  'border-gray-100'
                } ${task.status === 'completed' ? 'opacity-60' : ''}`}
              >
                <button onClick={() => toggleComplete(task)} className="mt-0.5 shrink-0">
                  {task.status === 'completed'
                    ? <CheckCircle size={20} className="text-green-500" />
                    : <Circle size={20} className="text-gray-300 hover:text-blue-500 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                      {task.leadName && (
                        task.leadId
                          ? <Link href={`/leads/${task.leadId}`} className="text-xs text-blue-400 hover:underline">{task.leadName}</Link>
                          : <p className="text-xs text-gray-400">{task.leadName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {task.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                          {task.priority}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {TYPE_LABELS[task.taskType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {task.dueDate && (
                      <span className={overdue ? 'text-red-500 font-medium' : dueToday ? 'text-amber-600 font-medium' : ''}>
                        {overdue ? '⚠️ Overdue: ' : dueToday ? '📅 Due Today: ' : 'Due: '}
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.notes && <span className="truncate max-w-xs">{task.notes}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit3 size={13} /></button>
                  <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={isNew ? 'Add Task' : 'Edit Task'} size="md">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Title <span className="text-red-500">*</span></label>
            <input className={inp} value={editTask.title || ''} onChange={e => setEditTask(p => ({ ...p, title: e.target.value }))} placeholder="Call Joplin Auto Repair" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Type</label>
              <select className={inp} value={editTask.taskType || 'Call'} onChange={e => setEditTask(p => ({ ...p, taskType: e.target.value as TaskType }))}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Priority</label>
              <select className={inp} value={editTask.priority || 'Normal'} onChange={e => setEditTask(p => ({ ...p, priority: e.target.value as Task['priority'] }))}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select className={inp} value={editTask.status || 'pending'} onChange={e => setEditTask(p => ({ ...p, status: e.target.value as Task['status'] }))}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Due Date</label>
            <input className={inp} type="date" value={editTask.dueDate || ''} onChange={e => setEditTask(p => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Notes</label>
            <textarea className={inp + ' resize-none'} rows={3} value={editTask.notes || ''} onChange={e => setEditTask(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving...' : isNew ? 'Add Task' : 'Save'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
