// ─── Lead Types ───────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'New'
  | 'Needs research'
  | 'Ready to contact'
  | 'Contacted'
  | 'No answer'
  | 'Interested'
  | 'Demo website started'
  | 'Demo website sent'
  | 'Follow up needed'
  | 'Meeting scheduled'
  | 'Proposal sent'
  | 'Won'
  | 'Lost'
  | 'Not a fit';

export type Priority = 'Cold' | 'Warm' | 'Hot' | 'Urgent';

export interface Lead {
  id: number;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  facebookPage: string;
  address: string;
  city: string;
  state: string;
  industry: string;
  currentWebsiteQuality: string;
  hasWebsite: string;
  hasFacebookPage: string;
  googleBusinessProfile: string;
  serviceOpportunity: string;
  suggestedOffer: string;
  estimatedDealValue: number | null;
  leadSource: string;
  leadStatus: LeadStatus;
  priority: Priority;
  lastContactedDate: string;
  nextFollowUpDate: string;
  notes: string;
  painPoints: string;
  personalizedPitch: string;
  demoWebsiteUrl: string;
  crmDemoUrl: string;
  marketingPackageInterest: string;
  websitePackageInterest: string;
  crmPackageInterest: string;
  tags: string[];
  createdDate: string;
  updatedDate: string;
}

export type LeadInsert = Omit<Lead, 'id' | 'createdDate' | 'updatedDate'>;

// ─── Activity Types ────────────────────────────────────────────────────────────

export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'facebook'
  | 'text'
  | 'demo_sent'
  | 'proposal_sent'
  | 'status_change'
  | 'follow_up'
  | 'won'
  | 'lost';

export interface Activity {
  id: number;
  leadId: number;
  type: ActivityType;
  description: string;
  createdDate: string;
  businessName?: string;
}

// ─── Task Types ────────────────────────────────────────────────────────────────

export type TaskType =
  | 'Call'
  | 'Email'
  | 'Facebook message'
  | 'Text'
  | 'Build demo'
  | 'Send demo'
  | 'Follow up'
  | 'Meeting'
  | 'Proposal'
  | 'Other';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface Task {
  id: number;
  title: string;
  leadId: number | null;
  leadName?: string;
  dueDate: string;
  taskType: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  notes: string;
  createdDate: string;
  updatedDate: string;
}

// ─── Deal Types ────────────────────────────────────────────────────────────────

export type DealStage =
  | 'Opportunity'
  | 'Quoted'
  | 'Proposal sent'
  | 'Negotiating'
  | 'Won'
  | 'Lost';

export type ContractStatus = 'None' | 'Sent' | 'Signed' | 'Declined';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Recurring';

export interface Deal {
  id: number;
  businessName: string;
  leadId: number | null;
  leadName?: string;
  serviceSold: string;
  packageType: string;
  monthlyValue: number | null;
  oneTimeSetupValue: number | null;
  estimatedCloseDate: string;
  dealStage: DealStage;
  proposalUrl: string;
  contractStatus: ContractStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  createdDate: string;
  updatedDate: string;
}

// ─── Demo Types ────────────────────────────────────────────────────────────────

export type DemoStatus =
  | 'Idea'
  | 'Started'
  | 'Needs content'
  | 'Ready to send'
  | 'Sent'
  | 'Needs revisions'
  | 'Approved'
  | 'Converted to customer'
  | 'Dead';

export interface Demo {
  id: number;
  businessName: string;
  leadId: number | null;
  leadName?: string;
  demoUrl: string;
  originalWebsiteUrl: string;
  demoStatus: DemoStatus;
  layoutOptionUsed: string;
  dateStarted: string;
  dateCompleted: string;
  dateSent: string;
  clientFeedback: string;
  neededChanges: string;
  followUpDate: string;
  notes: string;
  createdDate: string;
  updatedDate: string;
}

// ─── Template Types ────────────────────────────────────────────────────────────

export type TemplateType =
  | 'cold_call'
  | 'voicemail'
  | 'cold_email'
  | 'facebook_message'
  | 'text_message'
  | 'follow_up'
  | 'demo_delivery'
  | 'proposal_follow_up'
  | 'reactivation';

export interface Template {
  id: number;
  name: string;
  type: TemplateType;
  content: string;
  createdDate: string;
  updatedDate: string;
}

// ─── Package Types ─────────────────────────────────────────────────────────────

export interface Package {
  id: number;
  packageName: string;
  description: string;
  setupPrice: number | null;
  monthlyPrice: number | null;
  includedFeatures: string[];
  bestFor: string;
  internalNotes: string;
  createdDate: string;
  updatedDate: string;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface Settings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  defaultCity: string;
  defaultState: string;
  defaultServices: string;
  defaultSignature: string;
  defaultFollowUpDays: string;
  defaultLeadSource: string;
  defaultEstimatedValue: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  interestedLeads: number;
  demoSentLeads: number;
  followUpDueToday: number;
  wonDeals: number;
  lostDeals: number;
  monthlyEstimatedValue: number;
  hotLeads: Lead[];
  recentActivity: Activity[];
  upcomingFollowUps: Lead[];
}

// ─── Import/Export ─────────────────────────────────────────────────────────────

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  details?: string[];
}
