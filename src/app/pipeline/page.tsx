'use client';

import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ModuleGate from '@/components/demo/ModuleGate';
import { buildPipelineStages } from '@/lib/demo-mode';
import { useDemoMode } from '@/components/demo/DemoModeProvider';

type DemoDeal = {
  id: string;
  name: string;
  source: string;
  value: number;
  nextFollowUp: string;
  owner: string;
  notes: string;
  stage: string;
};

function buildDeals(stages: string[]): DemoDeal[] {
  return [
    {
      id: 'd1',
      name: 'Northside account',
      source: 'Website form',
      value: 4200,
      nextFollowUp: 'Today',
      owner: 'Jordan',
      notes: 'Asked for fast onboarding.',
      stage: stages[0],
    },
    {
      id: 'd2',
      name: 'Maple Street group',
      source: 'Referral',
      value: 6900,
      nextFollowUp: 'Tomorrow',
      owner: 'Alex',
      notes: 'Wants two package options.',
      stage: stages[1] ?? stages[0],
    },
    {
      id: 'd3',
      name: 'Cedar Ridge client',
      source: 'Google profile',
      value: 5800,
      nextFollowUp: 'Friday',
      owner: 'Taylor',
      notes: 'Decision maker meeting booked.',
      stage: stages[2] ?? stages[0],
    },
    {
      id: 'd4',
      name: 'West End services',
      source: 'Social post',
      value: 3400,
      nextFollowUp: 'Next week',
      owner: 'Morgan',
      notes: 'Needs contract review.',
      stage: stages[3] ?? stages[0],
    },
  ];
}

export default function PipelinePage() {
  const { industry, profile, enabledModules } = useDemoMode();
  const stages = useMemo(() => buildPipelineStages(industry), [industry]);
  const [deals, setDeals] = useState<DemoDeal[]>(() => buildDeals(stages));
  const [dragId, setDragId] = useState<string | null>(null);

  if (!enabledModules['lead-pipeline']) {
    return (
      <AppLayout title="Pipeline">
        <ModuleGate title="Pipeline" description="Enable Lead pipeline in Feature Builder to show this board in your demo package." />
      </AppLayout>
    );
  }

  const grouped = stages.map((stage) => ({
    stage,
    deals: deals.filter((deal) => deal.stage === stage),
  }));

  function moveDeal(targetStage: string) {
    if (!dragId) return;
    setDeals((prev) => prev.map((deal) => (deal.id === dragId ? { ...deal, stage: targetStage } : deal)));
    setDragId(null);
  }

  return (
    <AppLayout title="Pipeline">
      <div className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">{profile.pipelineLabel}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag and drop opportunities across stages to show a live sales process.
          </p>
        </div>

        <div className="grid grid-flow-col auto-cols-[18rem] gap-4 overflow-x-auto pb-2">
          {grouped.map((column) => (
            <section
              key={column.stage}
              className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-h-[24rem]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => moveDeal(column.stage)}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{column.stage}</h3>
                <span className="text-xs text-gray-500">{column.deals.length}</span>
              </div>

              <div className="space-y-2">
                {column.deals.map((deal) => (
                  <article
                    key={deal.id}
                    draggable
                    onDragStart={() => setDragId(deal.id)}
                    className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing"
                  >
                    <p className="font-medium text-sm text-gray-800">{deal.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{deal.source}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Value</p>
                        <p className="font-semibold text-gray-800">${deal.value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Follow up</p>
                        <p className="font-semibold text-gray-800">{deal.nextFollowUp}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{deal.notes}</p>
                    <p className="text-[11px] text-blue-600 mt-2 font-medium">Owner: {deal.owner}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
