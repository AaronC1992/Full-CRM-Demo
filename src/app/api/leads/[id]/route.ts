import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { Lead } from '@/lib/types';

function parseLead(row: Record<string, unknown>): Lead {
  return {
    ...row,
    tags: (() => {
      try { return JSON.parse(row.tags as string || '[]'); }
      catch { return []; }
    })(),
  } as Lead;
}

// GET /api/leads/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM leads WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!row) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json(parseLead(row));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// PUT /api/leads/:id
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const body = await req.json();
    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : (body.tags || '[]');

    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Track status change
    if (body.leadStatus && body.leadStatus !== existing.leadStatus) {
      db.prepare('INSERT INTO activities (leadId, type, description) VALUES (?, ?, ?)').run(
        params.id, 'status_change', `Status changed from "${existing.leadStatus}" to "${body.leadStatus}"`
      );
    }

    db.prepare(`
      UPDATE leads SET
        businessName = ?, contactName = ?, phone = ?, email = ?, website = ?,
        facebookPage = ?, address = ?, city = ?, state = ?, industry = ?,
        currentWebsiteQuality = ?, hasWebsite = ?, hasFacebookPage = ?,
        googleBusinessProfile = ?, serviceOpportunity = ?, suggestedOffer = ?,
        estimatedDealValue = ?, leadSource = ?, leadStatus = ?, priority = ?,
        lastContactedDate = ?, nextFollowUpDate = ?, notes = ?, painPoints = ?,
        personalizedPitch = ?, demoWebsiteUrl = ?, crmDemoUrl = ?,
        marketingPackageInterest = ?, websitePackageInterest = ?, crmPackageInterest = ?,
        tags = ?, updatedDate = datetime('now', 'localtime')
      WHERE id = ?
    `).run(
      body.businessName ?? existing.businessName, body.contactName ?? existing.contactName,
      body.phone ?? existing.phone, body.email ?? existing.email,
      body.website ?? existing.website, body.facebookPage ?? existing.facebookPage,
      body.address ?? existing.address, body.city ?? existing.city,
      body.state ?? existing.state, body.industry ?? existing.industry,
      body.currentWebsiteQuality ?? existing.currentWebsiteQuality,
      body.hasWebsite ?? existing.hasWebsite, body.hasFacebookPage ?? existing.hasFacebookPage,
      body.googleBusinessProfile ?? existing.googleBusinessProfile,
      body.serviceOpportunity ?? existing.serviceOpportunity,
      body.suggestedOffer ?? existing.suggestedOffer,
      body.estimatedDealValue !== undefined ? body.estimatedDealValue : existing.estimatedDealValue,
      body.leadSource ?? existing.leadSource,
      body.leadStatus ?? existing.leadStatus,
      body.priority ?? existing.priority,
      body.lastContactedDate ?? existing.lastContactedDate,
      body.nextFollowUpDate ?? existing.nextFollowUpDate,
      body.notes ?? existing.notes, body.painPoints ?? existing.painPoints,
      body.personalizedPitch ?? existing.personalizedPitch,
      body.demoWebsiteUrl ?? existing.demoWebsiteUrl,
      body.crmDemoUrl ?? existing.crmDemoUrl,
      body.marketingPackageInterest ?? existing.marketingPackageInterest,
      body.websitePackageInterest ?? existing.websitePackageInterest,
      body.crmPackageInterest ?? existing.crmPackageInterest,
      tags, params.id
    );

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(params.id) as Record<string, unknown>;
    return NextResponse.json(parseLead(updated));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE /api/leads/:id
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM leads WHERE id = ?').get(params.id);
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    db.prepare('DELETE FROM leads WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
