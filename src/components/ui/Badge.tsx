import { LeadStatus, Priority } from '@/lib/types';
import { STATUS_COLORS, PRIORITY_COLORS, PRIORITY_DOT } from '@/lib/utils';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600 border-gray-200';
  const cls = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center font-medium rounded border ${color} ${cls} whitespace-nowrap`}>
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority] || 'bg-gray-50 text-gray-600 border-gray-200';
  const dot = PRIORITY_DOT[priority] || 'bg-gray-400';
  const cls = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1';
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded border ${color} ${cls} whitespace-nowrap`}>
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  );
}

interface TagBadgeProps {
  tag: string;
}

export function TagBadge({ tag }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      {tag}
    </span>
  );
}
