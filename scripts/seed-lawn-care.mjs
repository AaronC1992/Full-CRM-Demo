/**
 * Lawn Care Prospecting Seed Script
 * Run with: npm run seed:lawn-care
 *
 * Upsert safe: checks businessName + phone and businessName + website before inserting.
 * Running multiple times will not create duplicates.
 */
import postgres from 'postgres';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const dbUrlLine = envContent.split('\n').find(l => l.startsWith('DATABASE_URL='));
const DATABASE_URL = dbUrlLine?.slice('DATABASE_URL='.length).trim();
if (!DATABASE_URL) throw new Error('DATABASE_URL not found in .env.local');

const toCamel = s => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const fromCamel = s => s.replace(/([A-Z])/g, c => `_${c.toLowerCase()}`);

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  transform: { column: { from: toCamel, to: fromCamel } },
});

const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
const today = new Date().toISOString().split('T')[0];

// ─── Lead Data ────────────────────────────────────────────────────────────────

const LEADS = [
  {
    lead: {
      businessName: 'Master Cuts Lawn Care & Landscaping',
      contactName: '',
      phone: '417-396-9531',
      email: '',
      website: '',
      facebookPage: 'https://www.facebook.com/MClawncareandlandscaping/',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Unknown',
      hasFacebookPage: 'Yes',
      currentWebsiteQuality: 'Needs research',
      googleBusinessProfile: '',
      serviceOpportunity: 'Website, Google visibility, quote forms, lead tracking CRM, route builder',
      suggestedOffer: 'Local lawn care website and CRM starter package',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'Contacted',
      priority: 'Hot',
      lastContactedDate: today,
      nextFollowUpDate: '',
      notes: 'Owner asked me to text details and availability to meet for coffee or drinks. I sent a message explaining websites, lead generation, Google visibility, quote forms, follow up systems, simple CRM, and the route builder concept.',
      painPoints: 'Likely needs easier lead capture, follow up, quote tracking, and efficient routing.',
      personalizedPitch: 'I can help Master Cuts look more professional online, capture more quote requests, organize leads and customers, and use a simple route builder to plan daily mowing routes more efficiently.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'contacted', 'coffee meeting', 'route builder', 'hot lead']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: 'Good candidate for coffee meeting.',
      doNotVisit: 0,
      routeNotes: 'Prioritize for in person relationship building.',
      createdDate: now,
      updatedDate: now,
    },
    activity: {
      type: 'text',
      description: 'Owner asked me to text details and availability to meet for coffee or drinks. Sent a message explaining websites, lead generation, Google visibility, quote forms, follow up systems, simple CRM, and the route builder concept.',
    },
  },

  {
    lead: {
      businessName: 'Quality Lawn & Landscape',
      contactName: 'Justin Southard',
      phone: '417-206-0995',
      email: '',
      website: 'https://qualitylawnllc.com/',
      facebookPage: '',
      address: '5130 Co Rd 200',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Existing website, needs local review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Local website support, Google visibility, quote forms, lead tracking, CRM, route builder',
      suggestedOffer: 'Local marketing and CRM review',
      estimatedDealValue: 2000,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'Follow up needed',
      priority: 'Hot',
      lastContactedDate: today,
      nextFollowUpDate: '2026-05-25',
      notes: 'I spoke to the owner, Justin. He said he already pays someone for website and marketing type work, but he is interested in someone local doing it. He said to call or text Monday to set up coffee or drinks for Tuesday or Thursday next week.',
      painPoints: 'Currently paying someone non local or less local. Interested in local support. May need better hands on service, local accountability, and practical CRM or route tools.',
      personalizedPitch: 'Since Quality Lawn & Landscape already pays for website or marketing help, the angle is not to replace everything immediately. The angle is to offer a local review, find gaps, and show how a local partner could improve lead flow, Google visibility, quote tracking, and customer organization.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'owner spoke', 'justin southard', 'follow up monday', 'coffee meeting', 'hot lead', 'local angle']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: 'Call or text Monday to schedule coffee or drinks for Tuesday or Thursday.',
      doNotVisit: 0,
      routeNotes: 'High priority. Already open to meeting.',
      createdDate: now,
      updatedDate: now,
    },
    activity: {
      type: 'call',
      description: 'Spoke with the owner, Justin Southard. He already pays someone for website and marketing work but is interested in someone local. Said to call or text Monday to set up coffee or drinks for Tuesday or Thursday.',
    },
    task: {
      title: 'Follow up with Justin at Quality Lawn & Landscape',
      taskType: 'Follow up',
      dueDate: '2026-05-25',
      priority: 'High',
      status: 'pending',
      notes: 'Call or text Justin to set up coffee or drinks for Tuesday or Thursday. Mention that he was interested in someone local reviewing what he already has in place.',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: '3D Lawn & Landscape',
      contactName: '',
      phone: '417-793-0320',
      email: '',
      website: 'https://www.3-dlawn.com/',
      facebookPage: '',
      address: '',
      city: 'Carthage',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Fall follow up, website review, local SEO, CRM, route builder, lead tracking',
      suggestedOffer: 'Fall marketing reset and local CRM review',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'Follow up needed',
      priority: 'Warm',
      lastContactedDate: today,
      nextFollowUpDate: '2026-09-01',
      notes: 'I spoke with them and they said to reach back out in the fall. They said they currently do not have much they are doing now. They have tried a few places before, but it never worked out for them.',
      painPoints: 'They have tried marketing or website companies before and did not get good results. They may be cautious and need a simple, low pressure, local option that proves value.',
      personalizedPitch: 'In the fall, ask what they tried before, what did not work, and what they wish those companies had done differently. Pitch a simple local review and practical lead tracking or route organization system instead of a big agency package.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'landscaping', 'carthage', 'follow up in fall', 'tried marketing before', 'cautious lead', 'route builder']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: 'Do not push now. Reconnect in fall.',
      doNotVisit: 0,
      routeNotes: 'Save for fall follow up route.',
      createdDate: now,
      updatedDate: now,
    },
    activity: {
      type: 'call',
      description: 'Spoke with them. They said to reach back out in the fall. They currently do not have much going on and have tried a few marketing places before with no good results. They are cautious.',
    },
    task: {
      title: 'Follow up with 3D Lawn & Landscape in the fall',
      taskType: 'Follow up',
      dueDate: '2026-09-01',
      priority: 'Normal',
      status: 'pending',
      notes: 'Reach back out in the fall. They said they tried a few places before and it never worked out. Use a low pressure local angle and ask what failed before.',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Dependable Lawn Care Joplin',
      contactName: '',
      phone: '417-622-6577',
      email: 'dlcmowing@outlook.com',
      website: 'https://www.lawncarejoplin.com/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'CRM, quote tracking, website optimization, Google visibility, route builder',
      suggestedOffer: 'Lawn care CRM and quote system',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Offers commercial work, shrub trimming, sod, mulch, snow removal, outdoor living, and irrigation. Good candidate for CRM or estimate tracking.',
      painPoints: 'Multiple service lines can make quotes, follow ups, and customer organization harder to manage.',
      personalizedPitch: 'Help organize quote requests, recurring customers, seasonal services, and follow ups in one simple system.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'joplin', 'commercial', 'crm', 'quote tracking', 'route builder']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Pure Lawn Management',
      contactName: '',
      phone: '417-850-7873',
      email: 'office@purelawnmanagement.com',
      website: 'https://purelawnmanagement.com/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Established company, needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'SEO, Google Ads, review funnel, lead tracking, CRM',
      suggestedOffer: 'Local SEO and lead tracking system',
      estimatedDealValue: 2000,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Established company serving Joplin, Webb City, Carl Junction, and Carthage. Better fit for SEO, review funnel, Google Ads, and tracking than a basic website.',
      painPoints: 'Established companies may need better lead attribution, better ranking by city, and better tracking.',
      personalizedPitch: 'Help them track which towns and services are producing leads and build stronger local SEO pages.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'webb city', 'carthage', 'seo', 'review funnel']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'R&D Lawn Care',
      contactName: '',
      phone: '417-438-6590',
      email: '',
      website: 'https://www.randdlawncare.com/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Local SEO city pages, quote funnel, CRM, route builder',
      suggestedOffer: 'Local SEO plus route and quote CRM',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Serves Joplin, Seneca, Carthage, and Grove OK. Regional service area makes them a good fit for location based landing pages and route planning.',
      painPoints: 'Multi city service area can cause inefficient routing and scattered leads.',
      personalizedPitch: 'Help build city specific lead pages and organize leads by area for better daily routing.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'joplin', 'seneca', 'carthage', 'grove', 'local seo', 'route builder']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'The Lawn Specialist',
      contactName: 'David',
      phone: '417-499-7096',
      email: 'david@thelawnspecialist.com',
      website: 'https://www.thelawnspecialist.com/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Serviceable but may be basic',
      googleBusinessProfile: '',
      serviceOpportunity: 'Website modernization, quote flow, before and after gallery, Google review strategy',
      suggestedOffer: 'Website refresh and review growth package',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Website looks serviceable but may be basic. Good fit for modernization, quote flow, before and after gallery, and Google review strategy.',
      painPoints: 'May need stronger conversion from website visitors into quote requests.',
      personalizedPitch: 'Improve quote flow, showcase before and after work, and make reviews and service areas more visible.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'joplin', 'website refresh', 'review strategy', 'quote flow']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Top Cuts Lawncare Solutions',
      contactName: '',
      phone: '417-560-5219',
      email: 'Operations@TopCutsLS.com',
      website: 'https://www.topcutsls.com/',
      facebookPage: '',
      address: '222 N. River St.',
      city: 'Carthage',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Website, SEO, CRM, route builder, mower sales marketing',
      suggestedOffer: 'Lawncare and equipment sales marketing review',
      estimatedDealValue: 2000,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Also appears to be a Ferris dealer, so they may need help marketing both lawncare and mower sales or service.',
      painPoints: 'Two sides of the business may need clearer lead paths and better customer segmentation.',
      personalizedPitch: 'Help separate lawncare leads from mower sales leads and organize both into a simple CRM.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'carthage', 'mower sales', 'ferris', 'crm', 'route builder']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Jasper Ridge LLC',
      contactName: '',
      phone: '417-796-4044',
      email: 'sales@jasperidge.net',
      website: 'https://www.jasperidge.net/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Landscaping and Hardscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Project estimate tracking, lead forms, SEO landing pages, before and after portfolio',
      suggestedOffer: 'Landscaping project lead system',
      estimatedDealValue: 2500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Focuses on landscaping, drainage, irrigation, retaining walls, and larger projects. Better fit for project estimates and portfolio based marketing.',
      painPoints: 'Larger jobs need better estimate tracking, follow up, and proof of work.',
      personalizedPitch: 'Help capture larger project leads and track estimates from first call to close.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['landscaping', 'hardscaping', 'joplin', 'drainage', 'irrigation', 'retaining walls', 'estimate tracking']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Colbert Lawn Service',
      contactName: '',
      phone: '417-437-7728',
      email: '',
      website: '',
      facebookPage: '',
      address: '202 Amber Brush Lane',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Unknown',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs research',
      googleBusinessProfile: '',
      serviceOpportunity: 'Website, quote form, local SEO, Google visibility, CRM',
      suggestedOffer: 'Starter website and lead capture system',
      estimatedDealValue: 1200,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Listed locally as mowing and landscaping services. Good lead for website refresh, starter website, or quote form.',
      painPoints: 'May need better online presence and easier quote capture.',
      personalizedPitch: 'Help create a simple professional online presence that turns local searches into quote requests.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'joplin', 'starter website', 'quote form', 'local seo']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Bclean Bhealthy LLC',
      contactName: '',
      phone: '417-297-2477',
      email: 'Csr@bcleanbhealthycleaningservices.com',
      website: '',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Cleaning, Lawn Care, and Power Washing',
      hasWebsite: 'Unknown',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs research',
      googleBusinessProfile: '',
      serviceOpportunity: 'Bundled services website, CRM, lead tracking, quote forms',
      suggestedOffer: 'Multi service website and lead CRM',
      estimatedDealValue: 1500,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'New',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Offers cleaning, lawn care, and power washing. A bundled services website and lead CRM could be an easy sell.',
      painPoints: 'Multiple service categories may make marketing and lead organization messy.',
      personalizedPitch: 'Help organize cleaning, lawn care, and power washing leads into separate pipelines with one simple customer system.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['cleaning', 'lawn care', 'power washing', 'joplin', 'crm', 'multi service']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },

  {
    lead: {
      businessName: 'Zimmer Landscape & Mowing',
      contactName: '',
      phone: '',
      email: '',
      website: 'https://zimmerlandscape.com/',
      facebookPage: '',
      address: '',
      city: 'Joplin',
      state: 'MO',
      industry: 'Lawn Care and Landscaping',
      hasWebsite: 'Yes',
      hasFacebookPage: 'Unknown',
      currentWebsiteQuality: 'Needs review',
      googleBusinessProfile: '',
      serviceOpportunity: 'Website conversion review, lead forms, CRM, route builder, Google visibility',
      suggestedOffer: 'Website and lead conversion review',
      estimatedDealValue: 1200,
      leadSource: 'Manual lawn care prospecting',
      leadStatus: 'Needs research',
      priority: 'Warm',
      lastContactedDate: '',
      nextFollowUpDate: '',
      notes: 'Website shows mowing, landscaping, cleanup, shrub care, and free yard assessment forms, but phone number needs to be researched before calling.',
      painPoints: 'May need better lead conversion, follow up, and tracking.',
      personalizedPitch: 'Review their current website and show ways to improve conversion, follow up, and route planning.',
      demoWebsiteUrl: '',
      crmDemoUrl: '',
      marketingPackageInterest: '',
      websitePackageInterest: '',
      crmPackageInterest: '',
      tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'needs phone', 'website review', 'route builder']),
      routeEligible: 1,
      inPersonVisitStatus: 'Not visited',
      visitNotes: '',
      doNotVisit: 0,
      routeNotes: '',
      createdDate: now,
      updatedDate: now,
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findExistingLead(businessName, phone, website) {
  if (phone) {
    const rows = await sql`SELECT id FROM leads WHERE business_name = ${businessName} AND phone = ${phone} LIMIT 1`;
    if (rows.length > 0) return rows[0].id;
  }
  if (website) {
    const rows = await sql`SELECT id FROM leads WHERE business_name = ${businessName} AND website = ${website} LIMIT 1`;
    if (rows.length > 0) return rows[0].id;
  }
  // Fallback: match by business name only
  const rows = await sql`SELECT id FROM leads WHERE business_name = ${businessName} LIMIT 1`;
  return rows.length > 0 ? rows[0].id : null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  let inserted = 0;
  let skipped = 0;
  let activityCount = 0;
  let taskCount = 0;

  for (const entry of LEADS) {
    const { lead, activity, task } = entry;

    const existingId = await findExistingLead(lead.businessName, lead.phone, lead.website);

    if (existingId) {
      console.log(`  SKIP  ${lead.businessName} (id=${existingId})`);
      skipped++;
      continue;
    }

    const [newLead] = await sql`INSERT INTO leads ${sql(lead)} RETURNING id`;
    const leadId = newLead.id;
    console.log(`  ADD   ${lead.businessName} (id=${leadId})`);
    inserted++;

    if (activity) {
      await sql`INSERT INTO activities ${sql({
        leadId,
        type: activity.type,
        description: activity.description,
        createdDate: now,
      })}`;
      activityCount++;
    }

    if (task) {
      await sql`INSERT INTO tasks ${sql({
        title: task.title,
        leadId,
        taskType: task.taskType,
        dueDate: task.dueDate,
        priority: task.priority,
        status: task.status,
        notes: task.notes,
        createdDate: task.createdDate,
        updatedDate: task.updatedDate,
      })}`;
      taskCount++;
    }
  }

  console.log(`\nDone. Inserted ${inserted} leads, skipped ${skipped} duplicates, added ${activityCount} activities and ${taskCount} tasks.`);
  await sql.end();
}

run().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
