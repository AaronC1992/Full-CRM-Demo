'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { useDemoMode } from '@/components/demo/DemoModeProvider';
import { Lead } from '@/lib/types';
import { scoreLead } from '@/lib/lead-scoring';
import { formatDate } from '@/lib/utils';
import { ArrowUpRight, CircleDollarSign, Gauge, Sparkles, Users } from 'lucide-react';

type ScoredLead = Lead & ReturnType<typeof scoreLead>;

export default function LeadScoringPage() {
  const { enabledModules } = useDemoMode();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads?sort=updatedDate&dir=desc&_ts=' + Date.now())
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load leads'))))
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  const scoredLeads = useMemo<ScoredLead[]>(() => leads.map((lead) => ({ ...lead, ...scoreLead(lead) })).sort((a, b) => b.score - a.score), [leads]);
  const hotCount = scoredLeads.filter((lead) => lead.band === 'Hot').length;
  const warmCount = scoredLeads.filter((lead) => lead.band === 'Warm').length;
  const averageScore = scoredLeads.length ? Math.round(scoredLeads.reduce((sum, lead) => sum + lead.score, 0) / scoredLeads.length) : 0;
  const topLead = scoredLeads[0];

  if (!enabledModules['lead-scoring']) {
    return (
      <AppLayout title="Lead scoring">
        <ModuleGate title="Lead scoring" description="Enable Lead scoring in Feature Builder to show the scoring view." />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lead scoring">
      <div className="space-y-5">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-300">Scoring model</p>
                <h2 className="text-2xl font-bold mt-1">Weighted lead priority for daily selling</h2>
                <p className="text-sm text-slate-300 mt-2 max-w-xl">This view ranks leads using status, priority, value, timing, and ownership so the team can focus on the best next move.</p>
              </div>
              <div className="hidden sm:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/10">
                <Gauge size={28} className="text-sky-300" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-slate-300">Average score</p>
                <p className="text-2xl font-bold mt-1">{averageScore}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-slate-300">Hot leads</p>
                <p className="text-2xl font-bold mt-1">{hotCount}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-slate-300">Warm leads</p>
                <p className="text-2xl font-bold mt-1">{warmCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <Sparkles size={17} className="text-amber-500" />
              <h3 className="font-semibold text-gray-800">What changes the score</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              {[
                ['Status', 'Moves score up when the lead is already engaged or close to a proposal.'],
                ['Priority', 'Urgent and hot leads get the strongest boost.'],
                ['Timing', 'Follow ups due soon rise to the top.'],
                ['Value', 'Bigger opportunities get a higher score.'],
                ['Ownership', 'Assigned leads are easier to act on and score slightly higher.'],
              ].map(([title, copy]) => (
                <div key={title} className="border border-gray-200 rounded-xl p-3">
                  <p className="font-semibold text-gray-800">{title}</p>
                  <p className="text-gray-600 mt-1">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Users size={17} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Scored leads</h3>
            {topLead && <span className="ml-auto text-xs text-gray-500">Top lead updated {formatDate(topLead.updatedDate)}</span>}
          </div>
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading leads…</div>
          ) : scoredLeads.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No leads found yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {scoredLeads.map((lead) => (
                <div key={lead.id} className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{lead.businessName}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${lead.band === 'Hot' ? 'bg-orange-100 text-orange-700' : lead.band === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {lead.band}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{lead.city}, {lead.state} · {lead.industry}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{lead.nextFollowUpDate ? `Next follow up ${formatDate(lead.nextFollowUpDate)}.` : 'No follow up date is set.'}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                      {lead.reasons.slice(0, 3).map((reason) => (
                        <span key={reason} className="px-2 py-1 rounded-full bg-gray-100">{reason}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-gray-400">Score</p>
                      <p className="text-3xl font-bold text-gray-900">{lead.score}</p>
                    </div>
                    <Link href={`/leads/${lead.id}`} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                      Open lead <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/leads" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors">
            <p className="text-xs uppercase tracking-wide text-gray-500">Lead list</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Work the score from the table</p>
            <p className="text-sm text-gray-600 mt-2">Use the score view to decide who to call first.</p>
          </Link>
          <Link href="/routes" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors">
            <p className="text-xs uppercase tracking-wide text-gray-500">Routes</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Turn hot leads into visit plans</p>
            <p className="text-sm text-gray-600 mt-2">Route builder and lead scores work together for field work.</p>
          </Link>
          <Link href="/automations" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 transition-colors">
            <p className="text-xs uppercase tracking-wide text-gray-500">Automations</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">Trigger follow up actions</p>
            <p className="text-sm text-gray-600 mt-2">High scores can drive reminders and internal tasks.</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}