import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/import/leads  (accepts JSON array)
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
        notes, painPoints, personalizedPitch, demoWebsiteUrl, crmDemoUrl,
        marketingPackageInterest, websitePackageInterest, crmPackageInterest, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((items: Record<string, unknown>[]) => {
      let imported = 0;
      const errors: string[] = [];
      for (let i = 0; i < items.length; i++) {
        const lead = items[i];
        if (!lead.businessName) {
          errors.push(`Row ${i + 1}: Missing businessName`);
          continue;
        }
        try {
          const tags = Array.isArray(lead.tags)
            ? JSON.stringify(lead.tags)
            : typeof lead.tags === 'string' && lead.tags.startsWith('[')
            ? lead.tags
            : JSON.stringify(lead.tags ? String(lead.tags).split(';') : []);

          stmt.run(
            lead.businessName || '', lead.contactName || '', lead.phone || '',
            lead.email || '', lead.website || '', lead.facebookPage || '',
            lead.address || '', lead.city || '', lead.state || 'MO',
            lead.industry || '', lead.currentWebsiteQuality || '',
            lead.hasWebsite || '', lead.hasFacebookPage || '', lead.googleBusinessProfile || '',
            lead.serviceOpportunity || '', lead.suggestedOffer || '',
            lead.estimatedDealValue ?? null, lead.leadSource || 'Import',
            lead.leadStatus || 'New', lead.priority || 'Warm',
            lead.notes || '', lead.painPoints || '', lead.personalizedPitch || '',
            lead.demoWebsiteUrl || '', lead.crmDemoUrl || '',
            lead.marketingPackageInterest || '', lead.websitePackageInterest || '',
            lead.crmPackageInterest || '', tags
          );
          imported++;
        } catch (e) {
          errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
      }
      return { imported, skipped: items.length - imported, errors };
    });

    const result = insertMany(leads as Record<string, unknown>[]);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
