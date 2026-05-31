'use client';

import { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { CheckCircle2, Mail, MessageSquare, RefreshCw, Send } from 'lucide-react';

type Channel = 'Text' | 'Email';

type ThreadMessage = {
  sender: 'Customer' | 'Team';
  body: string;
  time: string;
};

type Thread = {
  id: string;
  contact: string;
  company: string;
  channel: Channel;
  subject: string;
  status: 'Open' | 'Waiting' | 'Closed';
  assignedTo: string;
  unread: number;
  lastUpdate: string;
  messages: ThreadMessage[];
};

const STORAGE_KEY = 'fullcrmdemo_comms_v1';

const DEFAULT_THREADS: Thread[] = [
  {
    id: 'T-1001',
    contact: 'Mia Carter',
    company: 'Northside account',
    channel: 'Text',
    subject: 'New quote request',
    status: 'Open',
    assignedTo: 'Jordan Parker',
    unread: 2,
    lastUpdate: '2026-05-31T10:40:00Z',
    messages: [
      { sender: 'Customer', body: 'Can you send the quote again today?', time: '9:12 AM' },
      { sender: 'Team', body: 'Absolutely, I am pulling it up now and will resend it shortly.', time: '9:15 AM' },
      { sender: 'Customer', body: 'Perfect, thank you.', time: '9:16 AM' },
    ],
  },
  {
    id: 'T-1002',
    contact: 'Daniel Reed',
    company: 'Maple Street group',
    channel: 'Email',
    subject: 'Service follow up',
    status: 'Waiting',
    assignedTo: 'Taylor Rivera',
    unread: 0,
    lastUpdate: '2026-05-31T09:25:00Z',
    messages: [
      { sender: 'Customer', body: 'We would like to review service options for next month.', time: '8:45 AM' },
      { sender: 'Team', body: 'I can put together a service plan and pricing summary for you.', time: '9:25 AM' },
    ],
  },
  {
    id: 'T-1003',
    contact: 'Sofia Nguyen',
    company: 'Cedar Ridge client',
    channel: 'Text',
    subject: 'Appointment reminder',
    status: 'Closed',
    assignedTo: 'Alex Chen',
    unread: 0,
    lastUpdate: '2026-05-30T16:15:00Z',
    messages: [
      { sender: 'Team', body: 'Reminder that your visit is scheduled for tomorrow morning.', time: '4:00 PM' },
      { sender: 'Customer', body: 'Thanks, we will be ready.', time: '4:15 PM' },
    ],
  },
];

function loadThreads() {
  if (typeof window === 'undefined') return DEFAULT_THREADS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THREADS;
    const parsed = JSON.parse(raw) as Thread[];
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_THREADS;
  } catch {
    return DEFAULT_THREADS;
  }
}

export default function CommunicationsPage() {
  const { enabledModules } = useDemoMode();
  const [threads, setThreads] = useState<Thread[]>(DEFAULT_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState(DEFAULT_THREADS[0].id);
  const [reply, setReply] = useState('');

  useEffect(() => {
    setThreads(loadThreads());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  }, [threads]);

  const selectedThread = threads.find((thread) => thread.id === selectedThreadId) ?? threads[0];

  useEffect(() => {
    if (!selectedThread && threads.length > 0) {
      setSelectedThreadId(threads[0].id);
    }
  }, [selectedThread, threads]);

  const stats = useMemo(() => ({
    open: threads.filter((thread) => thread.status === 'Open').length,
    waiting: threads.filter((thread) => thread.status === 'Waiting').length,
    text: threads.filter((thread) => thread.channel === 'Text').length,
    email: threads.filter((thread) => thread.channel === 'Email').length,
  }), [threads]);

  if (!enabledModules.communications) {
    return (
      <AppLayout title="Communications">
        <ModuleGate title="Communications" description="Enable Communications hub in Feature Builder to show text and email inbox flows." />
      </AppLayout>
    );
  }

  const sendReply = () => {
    if (!selectedThread || !reply.trim()) return;

    const message: ThreadMessage = {
      sender: 'Team',
      body: reply.trim(),
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };

    setThreads((current) => current.map((thread) => (
      thread.id === selectedThread.id
        ? {
            ...thread,
            status: 'Waiting',
            unread: 0,
            lastUpdate: new Date().toISOString(),
            messages: [...thread.messages, message],
          }
        : thread
    )));
    setReply('');
  };

  const markClosed = () => {
    if (!selectedThread) return;
    setThreads((current) => current.map((thread) => (thread.id === selectedThread.id ? { ...thread, status: 'Closed' } : thread)));
  };

  const refreshDemo = () => {
    const fresh = DEFAULT_THREADS;
    setThreads(fresh);
    setSelectedThreadId(fresh[0].id);
    setReply('');
  };

  return (
    <AppLayout title="Communications">
      <div className="space-y-5">
        <div className="grid sm:grid-cols-4 gap-3">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Open threads</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.open}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Waiting on customer</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.waiting}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Text conversations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.text}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Email conversations</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.email}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-4">
          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              <h2 className="font-semibold text-gray-800">Unified inbox</h2>
            </div>
            <div className="space-y-2 mt-3 max-h-[34rem] overflow-y-auto pr-1">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 transition-colors ${thread.id === selectedThread?.id ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{thread.contact}</p>
                      <p className="text-xs text-gray-500 mt-1">{thread.company}</p>
                    </div>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${thread.channel === 'Text' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-violet-50 text-violet-700 border-violet-200'}`}>
                      {thread.channel}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 text-xs text-gray-500">
                    <span>{thread.subject}</span>
                    <span>{thread.unread > 0 ? `${thread.unread} unread` : thread.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            {selectedThread && (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-gray-800">{selectedThread.contact}</h2>
                      <span className={`text-[11px] px-2 py-1 rounded-full border ${selectedThread.status === 'Closed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {selectedThread.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{selectedThread.company} · Assigned to {selectedThread.assignedTo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={refreshDemo} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                      <RefreshCw size={15} /> Reset demo
                    </button>
                    <button type="button" onClick={markClosed} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
                      <CheckCircle2 size={15} /> Mark closed
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3 max-h-[20rem] overflow-y-auto">
                  {selectedThread.messages.map((message, index) => (
                    <div key={`${message.time}-${index}`} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${message.sender === 'Team' ? 'ml-auto bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                      <p>{message.body}</p>
                      <p className={`text-[11px] mt-2 ${message.sender === 'Team' ? 'text-blue-100' : 'text-gray-500'}`}>{message.sender} · {message.time}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3">
                  <div className="rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      {selectedThread.channel === 'Text' ? <MessageSquare size={14} /> : <Mail size={14} />}
                      Reply as {selectedThread.channel.toLowerCase()}
                    </div>
                    <textarea
                      className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
                      rows={4}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder={selectedThread.channel === 'Text' ? 'Type a text reply...' : 'Write an email reply...'}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button type="button" onClick={sendReply} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium">
                        <Send size={15} /> Send reply
                      </button>
                      <button type="button" onClick={() => setReply('Thanks for the update. We will follow up shortly.')} className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                        Quick response
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Connected channels</p>
                      <p className="text-sm text-gray-700 mt-2">Text line is active, shared email inbox is connected, and messages stay tied to each lead or customer record.</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Automation hooks</p>
                      <p className="text-sm text-gray-700 mt-2">Missed lead reminders, estimate follow ups, and review requests can be triggered from the same inbox flow.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}