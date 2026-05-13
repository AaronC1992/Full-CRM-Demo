import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'crm.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema();
  }
  return db;
}

function initializeSchema() {
  const database = db;

  database.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessName TEXT NOT NULL DEFAULT '',
      contactName TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      website TEXT DEFAULT '',
      facebookPage TEXT DEFAULT '',
      address TEXT DEFAULT '',
      city TEXT DEFAULT '',
      state TEXT DEFAULT 'MO',
      industry TEXT DEFAULT '',
      currentWebsiteQuality TEXT DEFAULT '',
      hasWebsite TEXT DEFAULT '',
      hasFacebookPage TEXT DEFAULT '',
      googleBusinessProfile TEXT DEFAULT '',
      serviceOpportunity TEXT DEFAULT '',
      suggestedOffer TEXT DEFAULT '',
      estimatedDealValue REAL,
      leadSource TEXT DEFAULT '',
      leadStatus TEXT DEFAULT 'New',
      priority TEXT DEFAULT 'Warm',
      lastContactedDate TEXT DEFAULT '',
      nextFollowUpDate TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      painPoints TEXT DEFAULT '',
      personalizedPitch TEXT DEFAULT '',
      demoWebsiteUrl TEXT DEFAULT '',
      crmDemoUrl TEXT DEFAULT '',
      marketingPackageInterest TEXT DEFAULT '',
      websitePackageInterest TEXT DEFAULT '',
      crmPackageInterest TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leadId INTEGER REFERENCES leads(id) ON DELETE CASCADE,
      type TEXT DEFAULT 'note',
      description TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT '',
      leadId INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      dueDate TEXT DEFAULT '',
      taskType TEXT DEFAULT 'Follow up',
      priority TEXT DEFAULT 'Normal',
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessName TEXT DEFAULT '',
      leadId INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      serviceSold TEXT DEFAULT '',
      packageType TEXT DEFAULT '',
      monthlyValue REAL,
      oneTimeSetupValue REAL,
      estimatedCloseDate TEXT DEFAULT '',
      dealStage TEXT DEFAULT 'Opportunity',
      proposalUrl TEXT DEFAULT '',
      contractStatus TEXT DEFAULT 'None',
      paymentStatus TEXT DEFAULT 'Unpaid',
      notes TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS demos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      businessName TEXT DEFAULT '',
      leadId INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      demoUrl TEXT DEFAULT '',
      originalWebsiteUrl TEXT DEFAULT '',
      demoStatus TEXT DEFAULT 'Idea',
      layoutOptionUsed TEXT DEFAULT '',
      dateStarted TEXT DEFAULT '',
      dateCompleted TEXT DEFAULT '',
      dateSent TEXT DEFAULT '',
      clientFeedback TEXT DEFAULT '',
      neededChanges TEXT DEFAULT '',
      followUpDate TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT '',
      type TEXT DEFAULT 'cold_call',
      content TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      packageName TEXT DEFAULT '',
      description TEXT DEFAULT '',
      setupPrice REAL,
      monthlyPrice REAL,
      includedFeatures TEXT DEFAULT '[]',
      bestFor TEXT DEFAULT '',
      internalNotes TEXT DEFAULT '',
      createdDate TEXT DEFAULT (datetime('now', 'localtime')),
      updatedDate TEXT DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
  `);

  seedDefaultData(database);
}

function seedDefaultData(database: Database.Database) {
  // Seed settings
  const settingsCount = (database.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }).count;
  if (settingsCount === 0) {
    const insertSetting = database.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    const defaults: Record<string, string> = {
      businessName: 'Cue Marketing Solutions',
      ownerName: 'Aaron Cue',
      email: 'info@cuemarketingsolutions.com',
      phone: '918 808 0074',
      defaultCity: 'Joplin',
      defaultState: 'MO',
      defaultServices: 'Website Design, Local SEO, Social Media Management',
      defaultSignature: 'Aaron Cue\nCue Marketing Solutions\n918 808 0074\ninfo@cuemarketingsolutions.com',
      defaultFollowUpDays: '3',
      defaultLeadSource: 'Manual research',
      defaultEstimatedValue: '1500',
    };
    for (const [key, value] of Object.entries(defaults)) {
      insertSetting.run(key, value);
    }
  }

  // Seed default templates
  const templateCount = (database.prepare('SELECT COUNT(*) as count FROM templates').get() as { count: number }).count;
  if (templateCount === 0) {
    const insertTemplate = database.prepare(`
      INSERT INTO templates (name, type, content) VALUES (?, ?, ?)
    `);
    const templates = [
      ['Cold Call Script', 'cold_call', `Hi, may I speak with the owner or manager?

Hi {{contactName}}, my name is {{myName}} with {{myName === "Aaron" ? "Cue Marketing Solutions" : "Cue Marketing Solutions"}} — we help local businesses in {{city}} get more customers online.

I actually took a look at {{businessName}} and noticed {{websiteIssue}}. We've been helping businesses like yours fix that with a new website and local SEO.

Do you have just 2 minutes? I'd love to show you what we've done for other {{industry}} businesses nearby.

[IF INTERESTED]
Great! I can put together a quick demo website for {{businessName}} at no cost so you can see exactly what it would look like. Can I get your email to send that over?

[CLOSE]
I'll send that your way and follow up in a couple days. Thanks so much, {{contactName}} — have a great day!`],

      ['Voicemail Script', 'voicemail', `Hi {{contactName}}, this is {{myName}} with Cue Marketing Solutions. I'm reaching out to {{businessName}} because I noticed an opportunity to help you get more customers online in {{city}}.

I'd love to put together a free demo website so you can see what's possible. Give me a call back at {{myPhone}} or feel free to email me at {{myEmail}}.

Again, {{myName}} at {{myPhone}}. Talk soon!`],

      ['Cold Email', 'cold_email', `Subject: Quick question about {{businessName}}'s website

Hi {{contactName}},

My name is {{myName}} and I run Cue Marketing Solutions — we help {{industry}} businesses in {{city}} get more leads from their website and Google.

I came across {{businessName}} and noticed {{websiteIssue}}. I've helped other local businesses in the area fix exactly this and start getting consistent leads online.

I'd love to build you a FREE demo website so you can see what a modern, optimized site would look like for your business — no commitment, just a look.

Would you be open to a quick 10-minute call this week?

Best,
{{myName}}
{{myPhone}}
{{myEmail}}
Cue Marketing Solutions`],

      ['Facebook Message', 'facebook_message', `Hi {{contactName}}! 👋

I came across {{businessName}} and love what you're doing. I'm {{myName}} with Cue Marketing Solutions — we help local {{industry}} businesses in {{city}} get more customers through their website and social media.

I actually built a quick demo for your business to show what's possible. Would love to share it if you're interested!

No strings attached — just want to show you the potential. Let me know! 😊`],

      ['Text Message', 'text_message', `Hi {{contactName}}, this is {{myName}} from Cue Marketing Solutions. I help {{industry}} businesses in {{city}} get more customers online. I put together a free demo for {{businessName}} — mind if I send it over? Takes 2 min to look at. {{myPhone}}`],

      ['Follow Up Message', 'follow_up', `Hi {{contactName}}, just following up from my last message about {{businessName}}'s website. I finished the demo and think you'll really like it! The {{serviceOffer}} I put together is specifically designed for {{industry}} businesses in {{city}}.

Want me to send it over? Happy to hop on a quick call to walk you through it.

— {{myName}}, {{myPhone}}`],

      ['Demo Delivery Message', 'demo_delivery', `Hi {{contactName}}! Great news — I finished the demo website for {{businessName}}! 🎉

Check it out here: {{demoUrl}}

I built it specifically for your business showing how a modern, mobile-friendly site with local SEO could help you get more customers in {{city}}.

A few things I included:
• Fast, mobile-friendly design
• Clear call-to-action buttons
• Local SEO setup
• Professional photos section

I'd love to walk you through it on a quick 15-minute call. When works for you?

— {{myName}}
{{myPhone}} | {{myEmail}}`],

      ['Proposal Follow Up', 'proposal_follow_up', `Hi {{contactName}}, I wanted to follow up on the proposal I sent for {{businessName}}. I know things get busy!

Just wanted to make sure you had a chance to review it and answer any questions you might have. The {{serviceOffer}} I recommended would really help you stand out from other {{industry}} businesses in {{city}}.

Happy to adjust the package if needed — just let me know what works best for your budget and goals.

— {{myName}}, {{myPhone}}`],

      ['Lost Lead Reactivation', 'reactivation', `Hi {{contactName}}, hope things are going great at {{businessName}}!

It's been a while since we last talked and I wanted to check back in. I've been working with a few other {{industry}} businesses in {{city}} and the results have been really exciting.

If you're ever ready to explore getting more customers online, I'd love to reconnect. Things have changed a lot and I have some new ideas specifically for {{businessName}}.

No pressure at all — just wanted to stay in touch!

— {{myName}}
{{myPhone}} | {{myEmail}}`],
    ];
    for (const [name, type, content] of templates) {
      insertTemplate.run(name, type, content);
    }
  }

  // Seed default packages
  const packageCount = (database.prepare('SELECT COUNT(*) as count FROM packages').get() as { count: number }).count;
  if (packageCount === 0) {
    const insertPkg = database.prepare(`
      INSERT INTO packages (packageName, description, setupPrice, monthlyPrice, includedFeatures, bestFor, internalNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const packages = [
      ['Starter Website', '5-page professional website with mobile-friendly design and basic SEO', 997, 97, JSON.stringify(['5 pages', 'Mobile responsive', 'Contact form', 'Basic on-page SEO', 'Google Analytics setup', '1 year hosting included']), 'Small local businesses needing their first website', ''],
      ['Business Website', '10-page website with advanced SEO, lead capture, and Google Business integration', 1997, 147, JSON.stringify(['Up to 10 pages', 'Mobile responsive', 'Contact & lead capture forms', 'Advanced on-page SEO', 'Google Business Profile setup', 'Social media links', 'Blog setup', '1 year hosting']), 'Established local businesses wanting to grow online', ''],
      ['Website Redesign', 'Full redesign of existing website with modern design and improved SEO', 1497, 97, JSON.stringify(['Full redesign', 'Content migration', 'Mobile optimization', 'SEO audit & fixes', 'Speed optimization', 'Contact forms']), 'Businesses with outdated websites', ''],
      ['Website + CRM Bundle', 'New website plus custom CRM to manage leads and follow-ups', 2997, 247, JSON.stringify(['Full business website', 'Custom CRM setup', 'Lead tracking', 'Follow-up automation', 'Email templates', 'Monthly reports']), 'Service businesses wanting full sales system', 'Best upsell — push this combo'],
      ['Custom CRM', 'Personalized CRM built for their specific business and sales process', 1497, 197, JSON.stringify(['Custom lead fields', 'Sales pipeline', 'Email templates', 'Task management', 'Import/export', 'Training session']), 'Businesses with active sales teams or many leads', ''],
      ['Local SEO Setup', 'One-time SEO audit and optimization for local search rankings', 497, 197, JSON.stringify(['Google Business Profile optimization', 'Citation building (50+ sites)', 'On-page SEO', 'Keyword research', 'Monthly ranking reports']), 'Any local business wanting more Google visibility', ''],
      ['Monthly Social Media', 'Done-for-you social media content and posting', 0, 397, JSON.stringify(['12 posts/month', 'Custom graphics', 'Caption writing', 'Hashtag research', 'Facebook & Instagram', 'Monthly report']), 'Businesses needing consistent social presence', ''],
      ['Google Business Cleanup', 'Optimize and fully build out Google Business Profile', 297, 0, JSON.stringify(['Profile optimization', 'Photo updates', 'Category setup', 'Q&A setup', 'Review strategy', 'Posts setup']), 'Businesses with incomplete or unclaimed GBP', 'Great entry offer'],
      ['Ads Management', 'Facebook and/or Google Ads management with monthly reporting', 497, 597, JSON.stringify(['Campaign setup', 'Ad copywriting', 'Audience targeting', 'Monthly reports', 'A/B testing', 'Budget optimization']), 'Businesses ready to invest in paid advertising', 'Minimum $500/mo ad spend recommended'],
    ];
    for (const [name, desc, setup, monthly, features, bestFor, notes] of packages) {
      insertPkg.run(name, desc, setup, monthly, features, bestFor, notes);
    }
  }

  // Seed sample leads
  const leadCount = (database.prepare('SELECT COUNT(*) as count FROM leads').get() as { count: number }).count;
  if (leadCount === 0) {
    const insertLead = database.prepare(`
      INSERT INTO leads (businessName, contactName, phone, email, website, city, state, industry,
        hasWebsite, hasFacebookPage, currentWebsiteQuality, serviceOpportunity, suggestedOffer,
        estimatedDealValue, leadSource, leadStatus, priority, notes, painPoints, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const leads = [
      ['Joplin Family Dentistry', 'Dr. Sarah Hendricks', '417-555-0142', 'info@joplindentistry.com', 'http://joplindentistry.com', 'Joplin', 'MO', 'Dentist', 'Yes', 'Yes', 'Poor — outdated, not mobile-friendly', 'Website redesign, Local SEO, Google Business cleanup', 'Website Redesign + Local SEO', 2500, 'Manual research', 'New', 'Hot', 'Website looks like it was built in 2010. No online booking. Could use full redesign + local SEO.', 'Losing patients to competitors with better online presence', JSON.stringify(['dentist', 'joplin', 'redesign'])],
      ['Webb City Auto Repair', 'Mike Torres', '417-555-0287', '', 'https://webbcityauto.net', 'Webb City', 'MO', 'Auto Repair', 'Yes', 'No', 'Average — functional but outdated', 'Local SEO, Facebook ads, Social media management', 'Local SEO + Social Media', 1500, 'Manual research', 'Needs research', 'Warm', 'Has a website but no Facebook presence. Competitors are running ads.', 'Not showing up in local searches for auto repair', JSON.stringify(['auto repair', 'webb city'])],
      ['Carthage Flower Shop', 'Linda Martinez', '417-555-0391', 'flowers@carthagebloom.com', '', 'Carthage', 'MO', 'Florist', 'No', 'Yes', 'None', 'Starter website, Local SEO, Social media', 'Starter Website Bundle', 1200, 'Facebook research', 'Ready to contact', 'Hot', 'No website at all! Only has Facebook. Big opportunity for a starter site + SEO.', 'Missing out on customers who search Google for florists', JSON.stringify(['florist', 'carthage', 'no website'])],
      ['Neosho Pest Control', 'Dave Williams', '417-555-0534', 'dave@neoshopest.com', 'http://neoshopest.com', 'Neosho', 'MO', 'Pest Control', 'Yes', 'Yes', 'Poor — very old design', 'Website redesign, Google Ads, Local SEO', 'Website + CRM Bundle', 3000, 'Google Maps research', 'Contacted', 'Urgent', 'Left voicemail on 5/10. Website is terrible — looks untrustworthy. High deal value potential.', 'Losing leads because website looks unprofessional', JSON.stringify(['pest control', 'neosho', 'follow up'])],
      ['Carl Junction HVAC', 'Tom Baker', '417-555-0678', 'info@cjhvac.com', 'https://carljunctionhvac.com', 'Carl Junction', 'MO', 'HVAC', 'Yes', 'No', 'Average', 'Local SEO, Google Business cleanup, Facebook ads', 'Local SEO + Google Business', 1000, 'Yelp research', 'Follow up needed', 'Warm', 'Good business, decent website. Needs help with local visibility and review generation.', 'Not ranking well on Google for HVAC searches', JSON.stringify(['hvac', 'carl junction'])],
    ];
    for (const lead of leads) {
      insertLead.run(...lead);
    }

    // Add sample activities for first lead
    const firstLead = database.prepare('SELECT id FROM leads LIMIT 1').get() as { id: number };
    if (firstLead) {
      const insertActivity = database.prepare('INSERT INTO activities (leadId, type, description) VALUES (?, ?, ?)');
      insertActivity.run(firstLead.id, 'note', 'Lead added to CRM from manual research');
    }
  }
}

export default getDb;
