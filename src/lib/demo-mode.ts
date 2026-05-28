export type DemoIndustry =
  | 'lawn-care'
  | 'contractor'
  | 'salon-spa'
  | 'auto-repair'
  | 'cleaning-company'
  | 'restaurant-catering'
  | 'retail-shop'
  | 'real-estate'
  | 'insurance-agency'
  | 'church-nonprofit'
  | 'gym-fitness'
  | 'general-service';

export interface IndustryOption {
  value: DemoIndustry;
  label: string;
  shortLabel: string;
}

export interface IndustryProfile {
  headline: string;
  customerLabel: string;
  jobLabel: string;
  pipelineLabel: string;
  workflowExamples: string[];
  dashboardCards: Array<{ label: string; value: number; trend: string }>;
}

export const INDUSTRY_OPTIONS: IndustryOption[] = [
  { value: 'lawn-care', label: 'Lawn care and landscaping', shortLabel: 'Lawn care' },
  { value: 'contractor', label: 'Contractor', shortLabel: 'Contractor' },
  { value: 'salon-spa', label: 'Salon or spa', shortLabel: 'Salon' },
  { value: 'auto-repair', label: 'Auto repair', shortLabel: 'Auto shop' },
  { value: 'cleaning-company', label: 'Cleaning company', shortLabel: 'Cleaning' },
  { value: 'restaurant-catering', label: 'Restaurant or catering', shortLabel: 'Restaurant' },
  { value: 'retail-shop', label: 'Retail shop', shortLabel: 'Retail' },
  { value: 'real-estate', label: 'Real estate', shortLabel: 'Real estate' },
  { value: 'insurance-agency', label: 'Insurance agency', shortLabel: 'Insurance' },
  { value: 'church-nonprofit', label: 'Church or nonprofit', shortLabel: 'Nonprofit' },
  { value: 'gym-fitness', label: 'Gym or fitness', shortLabel: 'Gym' },
  { value: 'general-service', label: 'General service business', shortLabel: 'General service' },
];

export type DemoModuleKey =
  | 'customers'
  | 'lead-pipeline'
  | 'lead-scoring'
  | 'job-tracking'
  | 'estimates'
  | 'invoices'
  | 'scheduling'
  | 'route-builder'
  | 'review-requests'
  | 'email-followups'
  | 'sms-followups'
  | 'automations'
  | 'notifications'
  | 'field-mode'
  | 'customer-portal'
  | 'marketing-dashboard'
  | 'inventory'
  | 'team-management'
  | 'reports'
  | 'ai-assistant'
  | 'billing'
  | 'website-lead-forms'
  | 'landing-pages'
  | 'service-area-pages';

export interface DemoModuleDefinition {
  key: DemoModuleKey;
  label: string;
  route?: string;
  category: 'Core CRM' | 'Operations' | 'Growth' | 'Automation' | 'Admin';
  description: string;
  monthlyWeight: number;
  setupWeight: number;
}

export const DEMO_MODULES: DemoModuleDefinition[] = [
  { key: 'customers', label: 'Customer CRM', route: '/customers', category: 'Core CRM', description: 'Customer records, notes, tags, files, and history.', monthlyWeight: 79, setupWeight: 600 },
  { key: 'lead-pipeline', label: 'Lead pipeline', route: '/pipeline', category: 'Core CRM', description: 'Pipeline boards with stages and follow up tasks.', monthlyWeight: 69, setupWeight: 500 },
  { key: 'lead-scoring', label: 'Lead scoring', route: '/lead-scoring', category: 'Core CRM', description: 'Weighted lead scores and deal priority guidance.', monthlyWeight: 59, setupWeight: 450 },
  { key: 'job-tracking', label: 'Job tracking', route: '/jobs', category: 'Operations', description: 'Jobs, projects, status, and assignments.', monthlyWeight: 89, setupWeight: 700 },
  { key: 'estimates', label: 'Estimates', route: '/estimates', category: 'Operations', description: 'Estimate builder, statuses, and preview layout.', monthlyWeight: 59, setupWeight: 450 },
  { key: 'invoices', label: 'Invoices', route: '/invoices', category: 'Operations', description: 'Invoice lifecycle with paid and overdue states.', monthlyWeight: 59, setupWeight: 450 },
  { key: 'scheduling', label: 'Scheduling', route: '/calendar', category: 'Operations', description: 'Day, week, and month calendar views.', monthlyWeight: 69, setupWeight: 500 },
  { key: 'route-builder', label: 'Route builder', route: '/routes', category: 'Operations', description: 'Route planning with stop order and drive time.', monthlyWeight: 99, setupWeight: 800 },
  { key: 'review-requests', label: 'Review requests', route: '/reviews', category: 'Growth', description: 'Review request queue and response ideas.', monthlyWeight: 49, setupWeight: 350 },
  { key: 'email-followups', label: 'Email follow ups', route: '/outreach', category: 'Automation', description: 'Automated email sequences and reminders.', monthlyWeight: 39, setupWeight: 250 },
  { key: 'sms-followups', label: 'SMS follow ups', route: '/outreach', category: 'Automation', description: 'SMS touch points and missed lead recovery.', monthlyWeight: 39, setupWeight: 250 },
  { key: 'automations', label: 'Automations', route: '/automations', category: 'Automation', description: 'Rule based workflows that create follow up actions automatically.', monthlyWeight: 89, setupWeight: 650 },
  { key: 'notifications', label: 'Notifications', route: '/notifications', category: 'Automation', description: 'Alerts, reminders, and live activity updates.', monthlyWeight: 39, setupWeight: 250 },
  { key: 'field-mode', label: 'Field mode', route: '/field-mode', category: 'Operations', description: 'Mobile friendly field view for visits and quick updates.', monthlyWeight: 59, setupWeight: 500 },
  { key: 'customer-portal', label: 'Customer portal', route: '/customer-portal', category: 'Growth', description: 'Client self service view for estimates and invoices.', monthlyWeight: 69, setupWeight: 550 },
  { key: 'marketing-dashboard', label: 'Marketing dashboard', route: '/marketing', category: 'Growth', description: 'Campaign health, ideas, and growth progress.', monthlyWeight: 79, setupWeight: 650 },
  { key: 'inventory', label: 'Inventory', category: 'Operations', description: 'Stock tracking for parts and retail items.', monthlyWeight: 49, setupWeight: 350 },
  { key: 'team-management', label: 'Team management', route: '/settings', category: 'Admin', description: 'Users, permissions, and performance overview.', monthlyWeight: 59, setupWeight: 450 },
  { key: 'reports', label: 'Reports', route: '/reports', category: 'Admin', description: 'Revenue, conversion, retention, and activity reports.', monthlyWeight: 59, setupWeight: 450 },
  { key: 'ai-assistant', label: 'AI assistant', route: '/ai-helper', category: 'Automation', description: 'Suggested actions, writing support, and summaries.', monthlyWeight: 99, setupWeight: 900 },
  { key: 'billing', label: 'Billing', route: '/billing', category: 'Admin', description: 'Subscription plans, invoices, and payment details.', monthlyWeight: 49, setupWeight: 350 },
  { key: 'website-lead-forms', label: 'Website lead forms', route: '/marketing', category: 'Growth', description: 'Lead capture forms and source tracking.', monthlyWeight: 39, setupWeight: 300 },
  { key: 'landing-pages', label: 'Landing pages', route: '/marketing', category: 'Growth', description: 'Campaign pages and conversion ideas.', monthlyWeight: 49, setupWeight: 350 },
  { key: 'service-area-pages', label: 'Service area pages', route: '/marketing', category: 'Growth', description: 'Local city pages and local SEO checklist.', monthlyWeight: 49, setupWeight: 350 },
];

export const DEFAULT_ENABLED_MODULES: Record<DemoModuleKey, boolean> = DEMO_MODULES.reduce((acc, module) => {
  acc[module.key] = true;
  return acc;
}, {} as Record<DemoModuleKey, boolean>);

export const INDUSTRY_PROFILES: Record<DemoIndustry, IndustryProfile> = {
  'lawn-care': {
    headline: 'Field service growth with routes, estimates, and crew scheduling.',
    customerLabel: 'Property owners',
    jobLabel: 'Service visits',
    pipelineLabel: 'Estimate pipeline',
    workflowExamples: ['New lead to yard inspection', 'Estimate sent to approved', 'Route built to route complete'],
    dashboardCards: [
      { label: 'Monthly recurring revenue', value: 48320, trend: '+11 percent' },
      { label: 'Open estimates', value: 41, trend: '18 close this week' },
      { label: 'Route stops today', value: 29, trend: 'On schedule' },
      { label: 'Five star reviews', value: 14, trend: '+4 this month' },
    ],
  },
  contractor: {
    headline: 'Track prospects, projects, change orders, and invoice cycles.',
    customerLabel: 'Homeowners',
    jobLabel: 'Projects',
    pipelineLabel: 'Bid pipeline',
    workflowExamples: ['Inbound call to site visit', 'Scope approved to job kickoff', 'Progress billing to final payment'],
    dashboardCards: [
      { label: 'Quoted value', value: 214000, trend: '9 active bids' },
      { label: 'Jobs in progress', value: 12, trend: '3 near completion' },
      { label: 'Pending invoices', value: 17, trend: 'Collection focus' },
      { label: 'Follow ups due', value: 22, trend: 'Daily owner check in' },
    ],
  },
  'salon-spa': {
    headline: 'Client retention focused CRM with appointments and upsell prompts.',
    customerLabel: 'Clients',
    jobLabel: 'Appointments',
    pipelineLabel: 'Consultation pipeline',
    workflowExamples: ['New guest to consultation', 'Service visit to product upsell', 'Missed guest to recovery offer'],
    dashboardCards: [
      { label: 'Bookings this week', value: 126, trend: '+8 percent' },
      { label: 'Rebook rate', value: 71, trend: 'Healthy retention' },
      { label: 'Service upgrades', value: 23, trend: 'Add on focus' },
      { label: 'Review requests sent', value: 39, trend: '22 published' },
    ],
  },
  'auto-repair': {
    headline: 'Repair order workflow with estimate, parts, and follow up reminders.',
    customerLabel: 'Vehicle owners',
    jobLabel: 'Repair orders',
    pipelineLabel: 'Repair estimate pipeline',
    workflowExamples: ['Inspection to estimate approved', 'Parts ordered to repair complete', 'Delivery to maintenance reminder'],
    dashboardCards: [
      { label: 'Open repair orders', value: 34, trend: '8 awaiting parts' },
      { label: 'Estimate approvals', value: 19, trend: '56 percent close rate' },
      { label: 'Average ticket', value: 642, trend: '+6 percent' },
      { label: 'Customer follow ups', value: 27, trend: 'Service reminder week' },
    ],
  },
  'cleaning-company': {
    headline: 'Recurring service scheduling and quality follow up automation.',
    customerLabel: 'Accounts',
    jobLabel: 'Cleaning visits',
    pipelineLabel: 'Service quote pipeline',
    workflowExamples: ['Inbound inquiry to walkthrough', 'Walkthrough to recurring contract', 'Visit complete to review request'],
    dashboardCards: [
      { label: 'Recurring contracts', value: 91, trend: '+7 this month' },
      { label: 'One time jobs', value: 26, trend: 'Seasonal boost' },
      { label: 'Missed follow ups', value: 6, trend: 'Needs attention' },
      { label: 'Crew utilization', value: 84, trend: 'High efficiency' },
    ],
  },
  'restaurant-catering': {
    headline: 'Event leads, catering orders, and repeat guest communication.',
    customerLabel: 'Guests',
    jobLabel: 'Orders and events',
    pipelineLabel: 'Catering pipeline',
    workflowExamples: ['Event inquiry to tasting', 'Proposal to booked event', 'Event complete to repeat offer'],
    dashboardCards: [
      { label: 'Catering leads', value: 37, trend: '12 high intent' },
      { label: 'Booked events', value: 18, trend: 'Next 30 days' },
      { label: 'Average event value', value: 2180, trend: '+4 percent' },
      { label: 'Review score', value: 4.7, trend: 'Strong local trust' },
    ],
  },
  'retail-shop': {
    headline: 'Retail CRM with campaigns, loyalty, and local traffic reporting.',
    customerLabel: 'Shoppers',
    jobLabel: 'Store events',
    pipelineLabel: 'Bulk order pipeline',
    workflowExamples: ['New shopper to loyalty signup', 'Campaign launch to repeat purchase', 'Review posted to referral invite'],
    dashboardCards: [
      { label: 'Loyalty members', value: 1430, trend: '+64 this month' },
      { label: 'Campaign revenue', value: 32840, trend: 'Last 30 days' },
      { label: 'Average order value', value: 84, trend: '+3 percent' },
      { label: 'Inventory alerts', value: 12, trend: 'Restock needed' },
    ],
  },
  'real-estate': {
    headline: 'Lead to closing CRM with nurture automations and reporting.',
    customerLabel: 'Buyers and sellers',
    jobLabel: 'Transactions',
    pipelineLabel: 'Deal pipeline',
    workflowExamples: ['New lead to buyer consult', 'Listing to contract signed', 'Post close to referral ask'],
    dashboardCards: [
      { label: 'Active buyers', value: 48, trend: '9 hot leads' },
      { label: 'Listings this month', value: 21, trend: '+5 percent' },
      { label: 'Deals under contract', value: 16, trend: 'Strong quarter' },
      { label: 'Pending follow ups', value: 33, trend: 'Nurture queue' },
    ],
  },
  'insurance-agency': {
    headline: 'Policy pipeline with renewal reminders and coverage upsells.',
    customerLabel: 'Policy holders',
    jobLabel: 'Policy workflows',
    pipelineLabel: 'Policy sales pipeline',
    workflowExamples: ['Quote request to bind policy', 'Renewal due to policy review', 'Claim event to coverage update'],
    dashboardCards: [
      { label: 'Policies sold', value: 64, trend: 'Month to date' },
      { label: 'Renewals due', value: 53, trend: '30 day window' },
      { label: 'Cross sell opportunities', value: 29, trend: 'AI suggested' },
      { label: 'Retention rate', value: 89, trend: 'Excellent' },
    ],
  },
  'church-nonprofit': {
    headline: 'Member care, volunteer scheduling, and donation engagement.',
    customerLabel: 'Members and supporters',
    jobLabel: 'Events and care tasks',
    pipelineLabel: 'Outreach pipeline',
    workflowExamples: ['First visit to member onboarding', 'Volunteer signup to schedule', 'Donor gift to thank you follow up'],
    dashboardCards: [
      { label: 'Active members', value: 486, trend: '+12 this quarter' },
      { label: 'Volunteers this week', value: 114, trend: 'High engagement' },
      { label: 'Donation campaign progress', value: 72, trend: 'Goal completion percent' },
      { label: 'Pastoral care follow ups', value: 19, trend: 'Needs assignment' },
    ],
  },
  'gym-fitness': {
    headline: 'Membership growth with appointments, classes, and retention.',
    customerLabel: 'Members',
    jobLabel: 'Sessions and classes',
    pipelineLabel: 'Membership pipeline',
    workflowExamples: ['Trial lead to member signup', 'Member inactive to reactivation', 'Class attendance to personal training upsell'],
    dashboardCards: [
      { label: 'Active memberships', value: 762, trend: '+24 this month' },
      { label: 'Intro consults booked', value: 38, trend: 'Strong lead flow' },
      { label: 'Personal training upsells', value: 17, trend: '+9 percent' },
      { label: 'At risk members', value: 42, trend: 'Retention campaign running' },
    ],
  },
  'general-service': {
    headline: 'Flexible CRM setup for calls, jobs, scheduling, and growth.',
    customerLabel: 'Customers',
    jobLabel: 'Jobs',
    pipelineLabel: 'Sales pipeline',
    workflowExamples: ['Lead captured to call booked', 'Estimate sent to close won', 'Job complete to review request'],
    dashboardCards: [
      { label: 'Revenue this month', value: 92450, trend: '+9 percent' },
      { label: 'New leads', value: 58, trend: 'Across all channels' },
      { label: 'Open follow ups', value: 44, trend: 'Team working queue' },
      { label: 'Appointments booked', value: 67, trend: 'Strong pipeline' },
    ],
  },
};

export function getIndustryOption(industry: DemoIndustry): IndustryOption {
  return INDUSTRY_OPTIONS.find((option) => option.value === industry) ?? INDUSTRY_OPTIONS[0];
}

export function buildPipelineStages(industry: DemoIndustry): string[] {
  switch (industry) {
    case 'lawn-care':
      return ['New lead', 'Yard inspection', 'Estimate sent', 'Follow up', 'Approved', 'Scheduled'];
    case 'salon-spa':
      return ['New inquiry', 'Consultation set', 'Service plan', 'Booked', 'Retention'];
    case 'auto-repair':
      return ['Check in', 'Inspection', 'Estimate', 'Parts', 'Repair', 'Delivered'];
    case 'restaurant-catering':
      return ['New event', 'Menu planning', 'Proposal', 'Booked', 'Completed'];
    case 'church-nonprofit':
      return ['New contact', 'First visit', 'Engaged', 'Volunteer path', 'Leadership path'];
    default:
      return ['New lead', 'Qualified', 'Proposal', 'Follow up', 'Won'];
  }
}

export function estimatePackageCosts(selected: DemoModuleKey[]): {
  setupFee: number;
  monthlyFee: number;
  timelineWeeks: number;
} {
  const chosen = DEMO_MODULES.filter((module) => selected.includes(module.key));
  const setupFee = chosen.reduce((sum, module) => sum + module.setupWeight, 0);
  const monthlyFee = chosen.reduce((sum, module) => sum + module.monthlyWeight, 0);
  const timelineWeeks = Math.max(2, Math.ceil(selected.length / 3) + 1);

  return { setupFee, monthlyFee, timelineWeeks };
}

export interface DemoTask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  due: string;
  owner: string;
  priority: 'Low' | 'Medium' | 'High';
}

export function getIndustryTasks(industry: DemoIndustry): DemoTask[] {
  const profile = INDUSTRY_PROFILES[industry];
  return [
    { id: 't1', title: `Review ${profile.pipelineLabel.toLowerCase()} board`, status: 'todo', due: 'Today', owner: 'Jordan', priority: 'High' },
    { id: 't2', title: `Send follow ups to top ${profile.customerLabel.toLowerCase()}`, status: 'in-progress', due: 'Tomorrow', owner: 'Alex', priority: 'Medium' },
    { id: 't3', title: 'Prepare weekly growth summary', status: 'done', due: 'Completed', owner: 'Morgan', priority: 'Low' },
    { id: 't4', title: 'Audit lead source quality', status: 'todo', due: 'Friday', owner: 'Taylor', priority: 'High' },
  ];
}

export interface DemoCalendarEvent {
  id: string;
  title: string;
  type: 'Appointment' | 'Job' | 'Meeting' | 'Consultation' | 'Event';
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  time: string;
  owner: string;
}

export function getIndustryCalendar(industry: DemoIndustry): DemoCalendarEvent[] {
  const profile = INDUSTRY_PROFILES[industry];
  return [
    { id: 'e1', title: `${profile.pipelineLabel} review`, type: 'Meeting', day: 'Mon', time: '9:00 AM', owner: 'Jordan' },
    { id: 'e2', title: `New ${profile.jobLabel.toLowerCase()} kickoff`, type: 'Job', day: 'Tue', time: '11:00 AM', owner: 'Alex' },
    { id: 'e3', title: 'Priority customer follow up', type: 'Appointment', day: 'Wed', time: '2:30 PM', owner: 'Taylor' },
    { id: 'e4', title: 'Team standup and planning', type: 'Meeting', day: 'Thu', time: '8:30 AM', owner: 'Morgan' },
    { id: 'e5', title: 'Weekly outcomes recap', type: 'Consultation', day: 'Fri', time: '4:00 PM', owner: 'Jordan' },
  ];
}

export interface DemoReviewRecord {
  id: string;
  customer: string;
  sentDate: string;
  status: 'Pending' | 'Opened' | 'Reviewed';
  rating: number;
  suggestion: string;
}

export function getIndustryReviews(industry: DemoIndustry): DemoReviewRecord[] {
  const profile = INDUSTRY_PROFILES[industry];
  return [
    { id: 'r1', customer: `Northside ${profile.customerLabel.split(' ')[0]}`, sentDate: 'May 22', status: 'Reviewed', rating: 5, suggestion: 'Thank them and ask for one referral.' },
    { id: 'r2', customer: 'Evergreen account', sentDate: 'May 24', status: 'Opened', rating: 4, suggestion: 'Offer a loyalty incentive for next service.' },
    { id: 'r3', customer: 'Maple client', sentDate: 'May 25', status: 'Pending', rating: 0, suggestion: 'Send a friendly reminder in two days.' },
  ];
}

export interface DemoLeadSource {
  source: string;
  leads: number;
  conversion: number;
}

export function getLeadSourceMetrics(industry: DemoIndustry): DemoLeadSource[] {
  if (industry === 'real-estate') {
    return [
      { source: 'Referral', leads: 22, conversion: 39 },
      { source: 'Google profile', leads: 17, conversion: 31 },
      { source: 'Social content', leads: 14, conversion: 18 },
      { source: 'Open house forms', leads: 11, conversion: 26 },
    ];
  }

  return [
    { source: 'Website form', leads: 31, conversion: 34 },
    { source: 'Google profile', leads: 25, conversion: 28 },
    { source: 'Referral', leads: 18, conversion: 42 },
    { source: 'Social posts', leads: 15, conversion: 21 },
  ];
}

export interface DemoPortalPreview {
  customerName: string;
  upcomingAppointments: string[];
  estimateTitle: string;
  invoiceTitle: string;
  serviceHistory: string[];
}

export function getPortalPreview(industry: DemoIndustry): DemoPortalPreview {
  const profile = INDUSTRY_PROFILES[industry];
  return {
    customerName: `Sample ${profile.customerLabel.split(' ')[0]}`,
    upcomingAppointments: ['Tue 10:00 AM', 'Fri 2:30 PM'],
    estimateTitle: `${profile.jobLabel} package option A`,
    invoiceTitle: `Monthly ${profile.jobLabel.toLowerCase()} invoice`,
    serviceHistory: ['Initial consult completed', 'Scope approved', 'Team assignment created'],
  };
}

export function formatIndustryLabel(industry: DemoIndustry): string {
  return getIndustryOption(industry).label;
}
