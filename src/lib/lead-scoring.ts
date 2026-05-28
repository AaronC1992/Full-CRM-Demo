import { Lead } from '@/lib/types';

const PRIORITY_SCORE: Record<string, number> = {
  Cold: 12,
  Warm: 32,
  Hot: 56,
  Urgent: 76,
};

const STATUS_SCORE: Record<string, number> = {
  New: 8,
  'Needs research': 12,
  'Ready to contact': 18,
  Contacted: 24,
  'No answer': 14,
  Interested: 38,
  'Demo website started': 42,
  'Demo website sent': 48,
  'Follow up needed': 34,
  'Meeting scheduled': 58,
  'Proposal sent': 66,
  Won: 94,
  Lost: 6,
  'Not a fit': 2,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getFollowUpScore(nextFollowUpDate?: string) {
  if (!nextFollowUpDate) return 0;
  const target = new Date(nextFollowUpDate);
  if (Number.isNaN(target.getTime())) return 0;

  const diffDays = Math.ceil((target.getTime() - Date.now()) / 86400000);
  if (diffDays <= 0) return 18;
  if (diffDays <= 2) return 16;
  if (diffDays <= 5) return 12;
  if (diffDays <= 10) return 8;
  return 4;
}

export type LeadScoreBand = 'Hot' | 'Warm' | 'Cold';

export interface LeadScoreResult {
  score: number;
  band: LeadScoreBand;
  reasons: string[];
}

export function scoreLead(lead: Lead): LeadScoreResult {
  const reasons: string[] = [];

  const priorityScore = PRIORITY_SCORE[lead.priority] ?? 12;
  reasons.push(`Priority adds ${priorityScore}`);

  const statusScore = STATUS_SCORE[lead.leadStatus] ?? 10;
  reasons.push(`Status adds ${statusScore}`);

  const valueScore = lead.estimatedDealValue ? Math.min(16, Math.round(lead.estimatedDealValue / 500)) : 0;
  if (valueScore > 0) reasons.push(`Value adds ${valueScore}`);

  const followUpScore = getFollowUpScore(lead.nextFollowUpDate);
  if (followUpScore > 0) reasons.push(`Follow up timing adds ${followUpScore}`);

  const contactScore = lead.lastContactedDate ? 4 : 0;
  if (contactScore > 0) reasons.push('Recent contact adds 4');

  const assignedScore = lead.assignedUserId ? 4 : 0;
  if (assignedScore > 0) reasons.push('Assigned ownership adds 4');

  const tagScore = Math.min(4, lead.tags.length);
  if (tagScore > 0) reasons.push(`Tags add ${tagScore}`);

  const score = clampScore(priorityScore + statusScore + valueScore + followUpScore + contactScore + assignedScore + tagScore);
  const band: LeadScoreBand = score >= 75 ? 'Hot' : score >= 45 ? 'Warm' : 'Cold';

  return {
    score,
    band,
    reasons,
  };
}