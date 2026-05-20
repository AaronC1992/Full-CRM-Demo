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
    const ids: number[] = [];
    await sql.begin(async tx => {
      for (const lead of leads as Record<string, unknown>[]) {
        const tags = Array.isArray(lead.tags) ? JSON.stringify(lead.tags) : (lead.tags || '[]');
        const data = {
          businessName: lead.businessName || '',
          contactName: lead.contactName || '',
          phone: lead.phone || '',
          email: lead.email || '',
          website: lead.website || '',
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
          leadSource: lead.leadSource || 'ChatGPT research',
          leadStatus: lead.leadStatus || 'New',
          priority: lead.priority || 'Warm',
          lastContactedDate: lead.lastContactedDate || '',
          nextFollowUpDate: lead.nextFollowUpDate || '',
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
        const [{ id }] = await tx`INSERT INTO leads ${tx(data as unknown as Record<string, string | number | boolean | null>)} RETURNING id`;
        ids.push(id as number);
      }
    });
    return NextResponse.json({ imported: ids.length, ids }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Bulk import failed' }, { status: 500 });
  }
}