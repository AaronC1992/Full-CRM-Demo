import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/leads/bulk
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const leads = Array.isArray(body) ? body : body.leads;

    if (!Array.isArray(leads)) {
      return NextResponse.json({ error: 'Expected an array of leads' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO leads (
        businessName, contactName, phone, email, website, facebookPage, address, city, state,
        industry, currentWebsiteQuality, hasWebsite, hasFacebookPage, googleBusinessProfile,
        serviceOpportunity, suggestedOffer, estimatedDealValue, leadSource, leadStatus, priority,
        lastContactedDate, nextFollowUpDate, notes, painPoints, personalizedPitch,
        demoWebsiteUrl, crmDemoUrl, marketingPackageInterest, websitePackageInterest,
        crmPackageInterest, tags
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);

    const insertMany = db.transaction((items: Record<string, unknown>[]) => {
      const results = [];
      for (const lead of items) {
        const tags = Array.isArray(lead.tags) ? JSON.stringify(lead.tags) : (lead.tags || '[]');
        const result = stmt.run(
          lead.businessName || '', lead.contactName || '', lead.phone || '',
          lead.email || '', lead.website || '', lead.facebookPage || '',
          lead.address || '', lead.city || '', lead.state || 'MO',
          lead.industry || '', lead.currentWebsiteQuality || '',
          lead.hasWebsite || '', lead.hasFacebookPage || '', lead.googleBusinessProfile || '',
          lead.serviceOpportunity || '', lead.suggestedOffer || '',
          lead.estimatedDealValue ?? null, lead.leadSource || 'ChatGPT research',
          lead.leadStatus || 'New', lead.priority || 'Warm',
          lead.lastContactedDate || '', lead.nextFollowUpDate || '',
          lead.notes || '', lead.painPoints || '', lead.personalizedPitch || '',
          lead.demoWebsiteUrl || '', lead.crmDemoUrl || '',
          lead.marketingPackageInterest || '', lead.websitePackageInterest || '',
          lead.crmPackageInterest || '', tags
        );
        results.push(result.lastInsertRowid);
      }
      return results;
    });

    const ids = insertMany(leads as Record<string, unknown>[]);
    return NextResponse.json({ imported: ids.length, ids }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Bulk import failed' }, { status: 500 });
  }
}
