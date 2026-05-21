import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const leads = Array.isArray(body) ? body : body.leads;
    if (!Array.isArray(leads)) {
      return NextResponse.json({ error: 'Expected an array of leads' }, { status: 400 });
    }
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < leads.length; i++) {
      const lead = leads[i] as Record<string, unknown>;
      if (!lead.businessName) {
        errors.push(`Row ${i + 1}: Missing businessName`);
        continue;
      }
      const businessName = String(lead.businessName);
      const phone = String(lead.phone || '');
      const website = String(lead.website || '');
      if (phone || website) {
        const [dup] = await sql`SELECT id FROM leads WHERE business_name = ${businessName} AND ((${phone} != '' AND phone = ${phone}) OR (${website} != '' AND website = ${website}))`;
        if (dup) { skipped++; continue; }
      }
      try {
        const tags = Array.isArray(lead.tags)
          ? JSON.stringify(lead.tags)
          : typeof lead.tags === 'string' && lead.tags.startsWith('[')
          ? lead.tags
          : JSON.stringify(lead.tags ? String(lead.tags).split(';') : []);

        const data = {
          businessName,
          contactName: lead.contactName || '',
          phone,
          email: lead.email || '',
          website,
          facebookPage: lead.facebookPage || '',
          address: lead.address || '',
          city: lead.city || '',
          state: lead.state || 'MO',
          industry: lead.industry || '',
          currentWebsiteQuality: lead.currentWebsiteQuality || '',
          hasWebsite: lead.hasWebsite || '',
          hasFacebookPage: lead.hasFacebookPage || '',
          googleBusinessProfile: lead.googleBusinessProfile || '',
          serviceOpportunity: lead.serviceOpportunity || '',
          suggestedOffer: lead.suggestedOffer || '',
          estimatedDealValue: lead.estimatedDealValue ?? null,
          leadSource: lead.leadSource || 'Import',
          leadStatus: lead.leadStatus || 'New',
          priority: lead.priority || 'Warm',
          notes: lead.notes || '',
          painPoints: lead.painPoints || '',
          personalizedPitch: lead.personalizedPitch || '',
          demoWebsiteUrl: lead.demoWebsiteUrl || '',
          crmDemoUrl: lead.crmDemoUrl || '',
          marketingPackageInterest: lead.marketingPackageInterest || '',
          websitePackageInterest: lead.websitePackageInterest || '',
          crmPackageInterest: lead.crmPackageInterest || '',
          tags,
          createdDate: ts,
          updatedDate: ts,
        };
        await sql`INSERT INTO leads ${sql(data as unknown as Record<string, string | number | boolean | null>)}`;
        imported++;
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : 'Unknown error'}`);
      }
    }
    return NextResponse.json({ imported, skipped, errors }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}