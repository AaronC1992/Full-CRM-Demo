/**
 * Seed script: Lawn care and landscaping prospecting leads
 * Run once: node scripts/seed-lawn-care-leads.cjs
 * Uses upsert logic — safe to run multiple times.
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'crm.db');
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// ─── Leads ────────────────────────────────────────────────────────────────────

const leads = [
  {
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
    lastContactedDate: '',
    nextFollowUpDate: '',
    notes: 'Owner asked me to text details and availability to meet for coffee or drinks. I sent a message explaining websites, lead generation, Google visibility, quote forms, follow up systems, simple CRM, and the route builder concept.',
    painPoints: 'Likely needs easier lead capture, follow up, quote tracking, and efficient routing.',
    personalizedPitch: 'I can help Master Cuts look more professional online, capture more quote requests, organize leads and customers, and use a simple route builder to plan daily mowing routes more efficiently.',
    tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'contacted', 'coffee meeting', 'route builder', 'hot lead']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: 'Good candidate for coffee meeting.',
    routeNotes: 'Prioritize for in person relationship building.',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    lastContactedDate: '',
    nextFollowUpDate: '2026-05-25',
    notes: 'I spoke to the owner, Justin. He said he already pays someone for website and marketing type work, but he is interested in someone local doing it. He said to call or text Monday to set up coffee or drinks for Tuesday or Thursday next week.',
    painPoints: 'Currently paying someone non local or less local. Interested in local support. May need better hands on service, local accountability, and practical CRM or route tools.',
    personalizedPitch: 'Since Quality Lawn & Landscape already pays for website or marketing help, the angle is not to replace everything immediately. The angle is to offer a local review, find gaps, and show how a local partner could improve lead flow, Google visibility, quote tracking, and customer organization.',
    tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'owner spoke', 'justin southard', 'follow up monday', 'coffee meeting', 'hot lead', 'local angle']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: 'Call or text Monday to schedule coffee or drinks for Tuesday or Thursday.',
    routeNotes: 'High priority. Already open to meeting.',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    lastContactedDate: '',
    nextFollowUpDate: '2026-09-01',
    notes: 'I spoke with them and they said to reach back out in the fall. They said they currently do not have much they are doing now. They have tried a few places before, but it never worked out for them.',
    painPoints: 'They have tried marketing or website companies before and did not get good results. They may be cautious and need a simple, low pressure, local option that proves value.',
    personalizedPitch: 'In the fall, ask what they tried before, what did not work, and what they wish those companies had done differently. Pitch a simple local review and practical lead tracking or route organization system instead of a big agency package.',
    tags: JSON.stringify(['lawn care', 'landscaping', 'carthage', 'follow up in fall', 'tried marketing before', 'cautious lead', 'route builder']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: 'Do not push now. Reconnect in fall.',
    routeNotes: 'Save for fall follow up route.',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'joplin', 'commercial', 'crm', 'quote tracking', 'route builder']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'webb city', 'carthage', 'seo', 'review funnel']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'joplin', 'seneca', 'carthage', 'grove', 'local seo', 'route builder']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'joplin', 'website refresh', 'review strategy', 'quote flow']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'carthage', 'mower sales', 'ferris', 'crm', 'route builder']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['landscaping', 'hardscaping', 'joplin', 'drainage', 'irrigation', 'retaining walls', 'estimate tracking']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['lawn care', 'joplin', 'starter website', 'quote form', 'local seo']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    tags: JSON.stringify(['cleaning', 'lawn care', 'power washing', 'joplin', 'crm', 'multi service']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
  {
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
    priority: 'Normal',
    lastContactedDate: '',
    nextFollowUpDate: '',
    notes: 'Website shows mowing, landscaping, cleanup, shrub care, and free yard assessment forms, but phone number needs to be researched before calling.',
    painPoints: 'May need better lead conversion, follow up, and tracking.',
    personalizedPitch: 'Review their current website and show ways to improve conversion, follow up, and route planning.',
    tags: JSON.stringify(['lawn care', 'landscaping', 'joplin', 'needs phone', 'website review', 'route builder']),
    routeEligible: 1,
    inPersonVisitStatus: 'Not visited',
    visitNotes: '',
    routeNotes: '',
    routeScore: null,
    demoWebsiteUrl: '',
    crmDemoUrl: '',
    marketingPackageInterest: '',
    websitePackageInterest: '',
    crmPackageInterest: '',
  },
];

// ─── Upsert leads ─────────────────────────────────────────────────────────────

const upsertLead = db.prepare(`
  INSERT INTO leads (
    businessName, contactName, phone, email, website, facebookPage,
    address, city, state, industry, currentWebsiteQuality,
    hasWebsite, hasFacebookPage, googleBusinessProfile,
    serviceOpportunity, suggestedOffer, estimatedDealValue,
    leadSource, leadStatus, priority,
    lastContactedDate, nextFollowUpDate,
    notes, painPoints, personalizedPitch,
    demoWebsiteUrl, crmDemoUrl,
    marketingPackageInterest, websitePackageInterest, crmPackageInterest,
    tags,
    routeEligible, inPersonVisitStatus, visitNotes, routeNotes, routeScore
  ) VALUES (
    @businessName, @contactName, @phone, @email, @website, @facebookPage,
    @address, @city, @state, @industry, @currentWebsiteQuality,
    @hasWebsite, @hasFacebookPage, @googleBusinessProfile,
    @serviceOpportunity, @suggestedOffer, @estimatedDealValue,
    @leadSource, @leadStatus, @priority,
    @lastContactedDate, @nextFollowUpDate,
    @notes, @painPoints, @personalizedPitch,
    @demoWebsiteUrl, @crmDemoUrl,
    @marketingPackageInterest, @websitePackageInterest, @crmPackageInterest,
    @tags,
    @routeEligible, @inPersonVisitStatus, @visitNotes, @routeNotes, @routeScore
  )
  ON CONFLICT DO NOTHING
`);

// Duplicate check: businessName + phone, or businessName + website if phone is blank
function leadExists(businessName, phone, website) {
  if (phone) {
    const row = db.prepare('SELECT id FROM leads WHERE businessName = ? AND phone = ?').get(businessName, phone);
    if (row) return row.id;
  }
  if (website) {
    const row = db.prepare('SELECT id FROM leads WHERE businessName = ? AND website = ?').get(businessName, website);
    if (row) return row.id;
  }
  const row = db.prepare('SELECT id FROM leads WHERE businessName = ?').get(businessName);
  return row ? row.id : null;
}

const insertedIds = {};

for (const lead of leads) {
  const existingId = leadExists(lead.businessName, lead.phone, lead.website);
  if (existingId) {
    console.log(`SKIP (already exists): ${lead.businessName} [id=${existingId}]`);
    insertedIds[lead.businessName] = existingId;
  } else {
    const result = upsertLead.run(lead);
    const newId = result.lastInsertRowid;
    insertedIds[lead.businessName] = newId;
    console.log(`INSERT: ${lead.businessName} [id=${newId}]`);
  }
}

// ─── Activities ───────────────────────────────────────────────────────────────

const insertActivity = db.prepare(`
  INSERT INTO activities (leadId, type, description) VALUES (?, ?, ?)
`);

function addActivity(businessName, type, description) {
  const id = insertedIds[businessName];
  if (!id) return;
  // Avoid duplicate activity entries
  const existing = db.prepare(
    'SELECT id FROM activities WHERE leadId = ? AND type = ? AND description = ?'
  ).get(id, type, description);
  if (!existing) {
    insertActivity.run(id, type, description);
    console.log(`  + Activity [${type}]: ${businessName}`);
  }
}

addActivity(
  'Master Cuts Lawn Care & Landscaping',
  'text',
  'Owner asked me to text details and availability to meet for coffee or drinks. Sent a message explaining websites, lead generation, Google visibility, quote forms, follow up systems, simple CRM, and the route builder concept.'
);

addActivity(
  'Quality Lawn & Landscape',
  'call',
  'Spoke to the owner, Justin Southard. He said he already pays someone for website and marketing type work but is interested in someone local doing it. He said to call or text Monday to set up coffee or drinks for Tuesday or Thursday next week.'
);

addActivity(
  '3D Lawn & Landscape',
  'call',
  'Spoke with them. They said to reach back out in the fall. They currently do not have much going on. They have tried a few places before but it never worked out for them.'
);

// ─── Tasks ────────────────────────────────────────────────────────────────────

const insertTask = db.prepare(`
  INSERT INTO tasks (title, leadId, dueDate, taskType, priority, status, notes)
  VALUES (@title, @leadId, @dueDate, @taskType, @priority, @status, @notes)
`);

function addTask(businessName, title, taskType, dueDate, priority, status, notes) {
  const leadId = insertedIds[businessName] || null;
  const existing = db.prepare(
    'SELECT id FROM tasks WHERE title = ? AND (leadId = ? OR (leadId IS NULL AND ? IS NULL))'
  ).get(title, leadId, leadId);
  if (!existing) {
    insertTask.run({ title, leadId, dueDate, taskType, priority, status, notes });
    console.log(`  + Task: ${title}`);
  } else {
    console.log(`  SKIP task (already exists): ${title}`);
  }
}

addTask(
  'Quality Lawn & Landscape',
  'Follow up with Justin at Quality Lawn & Landscape',
  'Follow up',
  '2026-05-25',
  'High',
  'pending',
  'Call or text Justin to set up coffee or drinks for Tuesday or Thursday. Mention that he was interested in someone local reviewing what he already has in place.'
);

addTask(
  '3D Lawn & Landscape',
  'Follow up with 3D Lawn & Landscape in the fall',
  'Follow up',
  '2026-09-01',
  'Normal',
  'pending',
  'Reach back out in the fall. They said they tried a few places before and it never worked out. Use a low pressure local angle and ask what failed before.'
);

// ─── Done ─────────────────────────────────────────────────────────────────────

db.close();
console.log('\nSeed complete.');
