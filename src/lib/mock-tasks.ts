import { Task } from '@/lib/types';

type MockTask = Task & { leadName?: string };

function dateOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function timestampOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

const MOCK_TASKS: MockTask[] = [
  {
    id: 1001,
    title: 'Call Green Horizon about SEO pages',
    leadId: 1,
    leadName: 'Green Horizon Lawn Care',
    dueDate: dateOffset(0),
    taskType: 'Call',
    priority: 'High',
    status: 'pending',
    notes: 'Review proposal options before call.',
    createdDate: timestampOffset(-4),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1002,
    title: 'Send proposal update to Summit Stone',
    leadId: 2,
    leadName: 'Summit Stone and Deck',
    dueDate: dateOffset(1),
    taskType: 'Proposal',
    priority: 'Urgent',
    status: 'in_progress',
    notes: 'Include gallery redesign and quote form.',
    createdDate: timestampOffset(-5),
    updatedDate: timestampOffset(0),
  },
  {
    id: 1003,
    title: 'Follow up Blue Sky auto reminders',
    leadId: 3,
    leadName: 'Blue Sky Auto Repair',
    dueDate: dateOffset(2),
    taskType: 'Follow up',
    priority: 'Normal',
    status: 'pending',
    notes: 'Confirm missed call text back flow.',
    createdDate: timestampOffset(-3),
    updatedDate: timestampOffset(-2),
  },
  {
    id: 1004,
    title: 'Draft starter website scope for Cedar Ridge',
    leadId: 4,
    leadName: 'Cedar Ridge Cleaning',
    dueDate: dateOffset(3),
    taskType: 'Build demo',
    priority: 'Normal',
    status: 'pending',
    notes: 'One page launch layout is enough for now.',
    createdDate: timestampOffset(-2),
    updatedDate: timestampOffset(-2),
  },
  {
    id: 1005,
    title: 'Prepare call notes for Prime Edge meeting',
    leadId: 5,
    leadName: 'Prime Edge Roofing',
    dueDate: dateOffset(1),
    taskType: 'Meeting',
    priority: 'High',
    status: 'pending',
    notes: 'Focus on speed to lead automation.',
    createdDate: timestampOffset(-4),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1006,
    title: 'Send onboarding checklist to River Town',
    leadId: 6,
    leadName: 'River Town Salon',
    dueDate: dateOffset(-1),
    taskType: 'Email',
    priority: 'Low',
    status: 'completed',
    notes: 'Customer signed monthly plan.',
    createdDate: timestampOffset(-7),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1007,
    title: 'Try alternate contact for Metro Fleet',
    leadId: 7,
    leadName: 'Metro Fleet Wash',
    dueDate: dateOffset(-2),
    taskType: 'Call',
    priority: 'Low',
    status: 'pending',
    notes: 'Previous voicemails did not get a reply.',
    createdDate: timestampOffset(-6),
    updatedDate: timestampOffset(-2),
  },
  {
    id: 1008,
    title: 'Text Dr. Cole reminder about proposal window',
    leadId: 8,
    leadName: 'West Park Dentistry',
    dueDate: dateOffset(0),
    taskType: 'Text',
    priority: 'Urgent',
    status: 'in_progress',
    notes: 'Keep tone concise and professional.',
    createdDate: timestampOffset(-3),
    updatedDate: timestampOffset(0),
  },
  {
    id: 1009,
    title: 'Send demo walk through to Oakline Plumbing',
    leadId: 9,
    leadName: 'Oakline Plumbing',
    dueDate: dateOffset(1),
    taskType: 'Send demo',
    priority: 'High',
    status: 'pending',
    notes: 'Highlight financing section on hero.',
    createdDate: timestampOffset(-5),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1010,
    title: 'Build catering event form draft',
    leadId: 10,
    leadName: 'Golden Hour Catering',
    dueDate: dateOffset(4),
    taskType: 'Build demo',
    priority: 'Normal',
    status: 'pending',
    notes: 'Need date picker and guest count fields.',
    createdDate: timestampOffset(-2),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1011,
    title: 'Create nurture sequence for Atlas Fitness',
    leadId: 11,
    leadName: 'Atlas Fitness Studio',
    dueDate: dateOffset(5),
    taskType: 'Other',
    priority: 'Normal',
    status: 'pending',
    notes: 'Trial to membership conversion flow.',
    createdDate: timestampOffset(-1),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1012,
    title: 'Research competitors for Northland Pest',
    leadId: 12,
    leadName: 'Northland Pest Control',
    dueDate: dateOffset(2),
    taskType: 'Other',
    priority: 'Low',
    status: 'pending',
    notes: 'Capture top three local competitors.',
    createdDate: timestampOffset(-3),
    updatedDate: timestampOffset(-3),
  },
  {
    id: 1013,
    title: 'Update outreach list for True North Realty',
    leadId: 14,
    leadName: 'True North Realty Group',
    dueDate: dateOffset(-1),
    taskType: 'Follow up',
    priority: 'High',
    status: 'pending',
    notes: 'Add city specific campaign tags.',
    createdDate: timestampOffset(-5),
    updatedDate: timestampOffset(-1),
  },
  {
    id: 1014,
    title: 'Draft renewal automation plan for Stone Creek',
    leadId: 15,
    leadName: 'Stone Creek Insurance',
    dueDate: dateOffset(3),
    taskType: 'Email',
    priority: 'Normal',
    status: 'in_progress',
    notes: 'Map trigger and reminder timing.',
    createdDate: timestampOffset(-4),
    updatedDate: timestampOffset(0),
  },
  {
    id: 1015,
    title: 'Review onboarding assets for Pioneer Solar',
    leadId: 20,
    leadName: 'Pioneer Solar Solutions',
    dueDate: dateOffset(6),
    taskType: 'Meeting',
    priority: 'High',
    status: 'pending',
    notes: 'Gather logo, imagery, and service list.',
    createdDate: timestampOffset(-2),
    updatedDate: timestampOffset(-1),
  },
];

export function getMockTasks(status?: string, leadId?: number | null): MockTask[] {
  return MOCK_TASKS
    .filter((task) => {
      if (status && task.status !== status) return false;
      if (leadId && task.leadId !== leadId) return false;
      return true;
    })
    .slice()
    .sort((a, b) => {
      const due = a.dueDate.localeCompare(b.dueDate);
      if (due !== 0) return due;
      return b.priority.localeCompare(a.priority);
    });
}

export function getMockTaskById(id: number): MockTask | undefined {
  return MOCK_TASKS.find((task) => task.id === id);
}
