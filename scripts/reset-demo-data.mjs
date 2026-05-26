import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const envPath = resolve(__dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  const line = envContent
    .split('\n')
    .find((entry) => entry.trim().startsWith('DATABASE_URL='));

  if (!line) {
    throw new Error('DATABASE_URL not found in .env.local');
  }

  return line.split('DATABASE_URL=')[1].trim();
}

const DATABASE_URL = loadDatabaseUrl();

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

const nowDate = new Date();
const nowTimestamp = nowDate.toISOString().replace('T', ' ').slice(0, 19);
const today = nowDate.toISOString().slice(0, 10);

function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const leads = [
  {
    business_name: 'Evergreen Lawn and Landscape',
    contact_name: 'Mason Reed',
    phone: '417-555-0101',
    email: 'mason@evergreenlawnco.com',
    website: 'https://evergreenlawnco.com',
    city: 'Joplin',
    state: 'MO',
    industry: 'Lawn Care and Landscaping',
    service_opportunity: 'Route builder and estimate automation',
    suggested_offer: 'Growth package with scheduling and route optimization',
    estimated_deal_value: 2200,
    lead_source: 'Website inquiry',
    lead_status: 'Interested',
    priority: 'Hot',
    last_contacted_date: today,
    next_follow_up_date: datePlus(2),
    notes: 'Owner wants cleaner route planning and less missed callbacks.',
    tags: JSON.stringify(['lawn care', 'route builder', 'hot lead']),
  },
  {
    business_name: 'Summit Home Services',
    contact_name: 'Avery Holt',
    phone: '417-555-0102',
    email: 'avery@summithomeservices.com',
    website: 'https://summithomeservices.com',
    city: 'Webb City',
    state: 'MO',
    industry: 'Contractor',
    service_opportunity: 'Job tracking and invoice pipeline',
    suggested_offer: 'Contractor operations module bundle',
    estimated_deal_value: 3500,
    lead_source: 'Referral',
    lead_status: 'Won',
    priority: 'Hot',
    last_contacted_date: today,
    next_follow_up_date: datePlus(1),
    notes: 'Needs better visibility on active projects and collections.',
    tags: JSON.stringify(['contractor', 'proposal sent', 'operations']),
  },
  {
    business_name: 'Blush and Glow Studio',
    contact_name: 'Jenna Clay',
    phone: '417-555-0103',
    email: 'jenna@blushandglowstudio.com',
    website: 'https://blushandglowstudio.com',
    city: 'Joplin',
    state: 'MO',
    industry: 'Salon/Spa',
    service_opportunity: 'Appointment follow up and review requests',
    suggested_offer: 'Salon retention and review automation package',
    estimated_deal_value: 1700,
    lead_source: 'Instagram DM',
    lead_status: 'Meeting scheduled',
    priority: 'Warm',
    last_contacted_date: today,
    next_follow_up_date: datePlus(3),
    notes: 'Wants no show recovery and monthly performance reporting.',
    tags: JSON.stringify(['salon', 'appointments', 'reviews']),
  },
  {
    business_name: 'Iron Horse Auto Care',
    contact_name: 'Derek Lane',
    phone: '417-555-0104',
    email: 'derek@ironhorseautocare.com',
    website: 'https://ironhorseautocare.com',
    city: 'Carthage',
    state: 'MO',
    industry: 'Auto Repair',
    service_opportunity: 'Repair order workflow and reminders',
    suggested_offer: 'Auto shop CRM with service reminders',
    estimated_deal_value: 2600,
    lead_source: 'Google Maps',
    lead_status: 'Contacted',
    priority: 'Warm',
    last_contacted_date: today,
    next_follow_up_date: datePlus(4),
    notes: 'Looking for customer maintenance reminders and estimate approval flow.',
    tags: JSON.stringify(['auto repair', 'service reminders']),
  },
  {
    business_name: 'Sparkle Crew Cleaning',
    contact_name: 'Lila Shaw',
    phone: '417-555-0105',
    email: 'lila@sparklecrewcleaning.com',
    website: 'https://sparklecrewcleaning.com',
    city: 'Neosho',
    state: 'MO',
    industry: 'Cleaning Service',
    service_opportunity: 'Recurring schedule and client portal',
    suggested_offer: 'Recurring service operations package',
    estimated_deal_value: 1800,
    lead_source: 'Facebook research',
    lead_status: 'Ready to contact',
    priority: 'Warm',
    last_contacted_date: '',
    next_follow_up_date: datePlus(2),
    notes: 'Great fit for recurring visit scheduling and route management.',
    tags: JSON.stringify(['cleaning', 'recurring services']),
  },
  {
    business_name: 'Riverbend Catering Co',
    contact_name: 'Nina Brooks',
    phone: '417-555-0106',
    email: 'nina@riverbendcateringco.com',
    website: 'https://riverbendcateringco.com',
    city: 'Joplin',
    state: 'MO',
    industry: 'Restaurant',
    service_opportunity: 'Event lead tracking and quote follow ups',
    suggested_offer: 'Catering sales pipeline package',
    estimated_deal_value: 2400,
    lead_source: 'Website inquiry',
    lead_status: 'Proposal sent',
    priority: 'Hot',
    last_contacted_date: today,
    next_follow_up_date: datePlus(1),
    notes: 'Needs better event pipeline visibility for team.',
    tags: JSON.stringify(['restaurant', 'catering', 'events']),
  },
  {
    business_name: 'Oak Street Outfitters',
    contact_name: 'Parker Miles',
    phone: '417-555-0107',
    email: 'parker@oakstreetoutfitters.com',
    website: 'https://oakstreetoutfitters.com',
    city: 'Pittsburg',
    state: 'KS',
    industry: 'Retail Shop',
    service_opportunity: 'Campaign tracking and customer retention',
    suggested_offer: 'Retail growth dashboard package',
    estimated_deal_value: 2100,
    lead_source: 'Referral',
    lead_status: 'New',
    priority: 'Warm',
    last_contacted_date: '',
    next_follow_up_date: datePlus(5),
    notes: 'Interested in seasonal campaign planning and loyalty workflows.',
    tags: JSON.stringify(['retail', 'campaigns', 'loyalty']),
  },
  {
    business_name: 'Horizon Realty Group',
    contact_name: 'Camden Wells',
    phone: '417-555-0108',
    email: 'camden@horizonrealtygroup.com',
    website: 'https://horizonrealtygroup.com',
    city: 'Joplin',
    state: 'MO',
    industry: 'Real Estate',
    service_opportunity: 'Deal pipeline and nurture automations',
    suggested_offer: 'Real estate CRM pipeline package',
    estimated_deal_value: 3200,
    lead_source: 'LinkedIn',
    lead_status: 'Demo website sent',
    priority: 'Hot',
    last_contacted_date: today,
    next_follow_up_date: datePlus(2),
    notes: 'Broker wants visibility from inquiry to close.',
    tags: JSON.stringify(['real estate', 'pipeline', 'nurture']),
  },
  {
    business_name: 'Safe Harbor Insurance',
    contact_name: 'Noah Bates',
    phone: '417-555-0109',
    email: 'noah@safeharborinsurance.com',
    website: 'https://safeharborinsurance.com',
    city: 'Webb City',
    state: 'MO',
    industry: 'Insurance',
    service_opportunity: 'Renewal reminders and policy tracking',
    suggested_offer: 'Insurance renewal workflow package',
    estimated_deal_value: 2800,
    lead_source: 'Cold call list',
    lead_status: 'Contacted',
    priority: 'Warm',
    last_contacted_date: today,
    next_follow_up_date: datePlus(3),
    notes: 'Strong fit for retention and cross sell reminders.',
    tags: JSON.stringify(['insurance', 'renewals', 'retention']),
  },
  {
    business_name: 'Hope Community Church',
    contact_name: 'Pastor Eli Turner',
    phone: '417-555-0110',
    email: 'office@hopecommunitychurch.org',
    website: 'https://hopecommunitychurch.org',
    city: 'Joplin',
    state: 'MO',
    industry: 'Church/Nonprofit',
    service_opportunity: 'Member follow up and event management',
    suggested_offer: 'Nonprofit engagement package',
    estimated_deal_value: 1600,
    lead_source: 'Manual research',
    lead_status: 'Ready to contact',
    priority: 'Warm',
    last_contacted_date: '',
    next_follow_up_date: datePlus(4),
    notes: 'Needs centralized volunteer and donation communication.',
    tags: JSON.stringify(['church', 'nonprofit', 'events']),
  },
  {
    business_name: 'Peak Motion Fitness',
    contact_name: 'Sofia Knight',
    phone: '417-555-0111',
    email: 'sofia@peakmotionfitness.com',
    website: 'https://peakmotionfitness.com',
    city: 'Carthage',
    state: 'MO',
    industry: 'Gym/Fitness',
    service_opportunity: 'Membership retention and upsell campaigns',
    suggested_offer: 'Gym conversion and retention package',
    estimated_deal_value: 2300,
    lead_source: 'Google Maps',
    lead_status: 'Won',
    priority: 'Warm',
    last_contacted_date: today,
    next_follow_up_date: datePlus(2),
    notes: 'Asks for class attendance to upsell workflow.',
    tags: JSON.stringify(['gym', 'fitness', 'retention']),
  },
  {
    business_name: 'North Ridge Plumbing Pros',
    contact_name: 'Wyatt Hale',
    phone: '417-555-0112',
    email: 'wyatt@northridgeplumbingpros.com',
    website: 'https://northridgeplumbingpros.com',
    city: 'Joplin',
    state: 'MO',
    industry: 'General Service',
    service_opportunity: 'Lead routing and follow up automation',
    suggested_offer: 'General service CRM starter package',
    estimated_deal_value: 2500,
    lead_source: 'Referral',
    lead_status: 'Needs research',
    priority: 'Cold',
    last_contacted_date: '',
    next_follow_up_date: datePlus(6),
    notes: 'Needs tighter call to dispatch tracking.',
    tags: JSON.stringify(['service business', 'dispatch', 'follow up']),
  },
];

function buildTasks(leadId, leadName) {
  return [
    {
      title: `Call ${leadName} for discovery details`,
      lead_id: leadId,
      due_date: datePlus(1),
      task_type: 'Call',
      priority: 'High',
      status: 'pending',
      notes: 'Confirm goals, budget, and timeline.',
      created_date: nowTimestamp,
      updated_date: nowTimestamp,
    },
    {
      title: `Send custom follow up to ${leadName}`,
      lead_id: leadId,
      due_date: datePlus(2),
      task_type: 'Email',
      priority: 'Normal',
      status: 'pending',
      notes: 'Use industry specific value summary.',
      created_date: nowTimestamp,
      updated_date: nowTimestamp,
    },
  ];
}

function buildActivities(lead) {
  const created = `Demo lead created: ${lead.business_name}`;
  const contacted = lead.last_contacted_date
    ? `Reached out to ${lead.contact_name || lead.business_name} and confirmed interest in ${lead.service_opportunity.toLowerCase()}.`
    : `Prepared outreach plan for ${lead.business_name}.`;
  const followup = lead.next_follow_up_date
    ? `Next follow up scheduled for ${lead.next_follow_up_date}.`
    : 'Follow up date pending qualification call.';

  return [
    { type: 'note', description: created },
    { type: 'call', description: contacted },
    { type: 'follow_up', description: followup },
  ];
}

function buildDeal(leadId, lead) {
  if (lead.lead_status !== 'Won') return null;

  return {
    business_name: lead.business_name,
    lead_id: leadId,
    service_sold: lead.suggested_offer,
    package_type: 'Growth',
    monthly_value: lead.estimated_deal_value,
    one_time_setup_value: Math.round((lead.estimated_deal_value || 1500) * 0.8),
    estimated_close_date: today,
    deal_stage: 'Won',
    proposal_url: '',
    contract_status: 'Signed',
    payment_status: 'Partial',
    notes: `Demo deal record created for ${lead.business_name}.`,
    created_date: nowTimestamp,
    updated_date: nowTimestamp,
  };
}

function buildDemoRecord(leadId, lead) {
  if (!['Demo website sent', 'Proposal sent', 'Won'].includes(lead.lead_status)) {
    return null;
  }

  return {
    business_name: lead.business_name,
    lead_id: leadId,
    demo_url: `https://demo.example.com/${lead.business_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    original_website_url: lead.website || '',
    demo_status: lead.lead_status === 'Won' ? 'Approved' : 'Sent',
    layout_option_used: 'Website + CRM',
    date_started: datePlus(-7),
    date_completed: datePlus(-2),
    date_sent: datePlus(-1),
    client_feedback: 'Positive response to dashboard and workflow automation.',
    needed_changes: 'Minor copy edits and branding updates.',
    follow_up_date: lead.next_follow_up_date || datePlus(2),
    notes: 'Demo asset created for sales presentation.',
    created_date: nowTimestamp,
    updated_date: nowTimestamp,
  };
}

async function run() {
  console.log('Resetting demo leads, tasks, activities, deals, and demos...');

  await sql.begin(async (tx) => {
    await tx`DELETE FROM demos`;
    await tx`DELETE FROM deals`;
    await tx`DELETE FROM activities`;
    await tx`DELETE FROM tasks`;
    await tx`DELETE FROM leads`;

    for (const lead of leads) {
      const leadRow = {
        ...lead,
        created_date: nowTimestamp,
        updated_date: nowTimestamp,
      };

      const [{ id }] = await tx`INSERT INTO leads ${tx(leadRow)} RETURNING id`;

      const activityRows = buildActivities(lead);
      for (const activity of activityRows) {
        await tx`
          INSERT INTO activities (lead_id, type, description)
          VALUES (${id}, ${activity.type}, ${activity.description})
        `;
      }

      const taskRows = buildTasks(id, lead.business_name);
      for (const task of taskRows) {
        await tx`INSERT INTO tasks ${tx(task)}`;
      }

      const dealRow = buildDeal(id, lead);
      if (dealRow) {
        await tx`INSERT INTO deals ${tx(dealRow)}`;
      }

      const demoRow = buildDemoRecord(id, lead);
      if (demoRow) {
        await tx`INSERT INTO demos ${tx(demoRow)}`;
      }
    }
  });

  const [leadCount] = await sql`SELECT COUNT(*)::int AS count FROM leads`;
  const [taskCount] = await sql`SELECT COUNT(*)::int AS count FROM tasks`;
  const [activityCount] = await sql`SELECT COUNT(*)::int AS count FROM activities`;
  const [dealCount] = await sql`SELECT COUNT(*)::int AS count FROM deals`;
  const [demoCount] = await sql`SELECT COUNT(*)::int AS count FROM demos`;

  console.log(
    `Done. Leads: ${leadCount.count}, Tasks: ${taskCount.count}, Activities: ${activityCount.count}, Deals: ${dealCount.count}, Demos: ${demoCount.count}`
  );
}

run()
  .catch((error) => {
    console.error('Failed to reset demo data:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end({ timeout: 5 });
  });
