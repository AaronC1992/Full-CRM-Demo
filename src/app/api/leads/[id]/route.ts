import { NextRequest, NextResponse } from 'next/server';
import getDb, { isNoDbMode } from '@/lib/db';
import { getMockLeadById } from '@/lib/mock-leads';
import { Lead } from '@/lib/types';

function parseLead(row: Record<string, unknown>): Lead {
  return {
    ...row,
    tags: (() => {
      if (Array.isArray(row.tags)) return row.tags as string[];
      try { return JSON.parse(row.tags as string || '[]'); }
      catch { return []; }
    })(),
  } as Lead;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isNoDbMode) {
      const lead = getMockLeadById(Number(params.id));
      if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      return NextResponse.json(lead);
    }

    const sql = getDb();
    const [row] = await sql`SELECT * FROM leads WHERE id = ${params.id}`;
    if (!row) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    return NextResponse.json(parseLead(row as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (isNoDbMode) {
      const existing = getMockLeadById(Number(params.id));
      if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      const updated: Lead = {
        ...existing,
        ...body,
        tags: body.tags !== undefined ? (Array.isArray(body.tags) ? body.tags : []) : existing.tags,
        updatedDate: ts,
      };
      return NextResponse.json(updated);
    }

    const sql = getDb();

    const [existing] = await sql`SELECT * FROM leads WHERE id = ${params.id}` as Record<string, unknown>[];
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    // Preserve existing tags if body.tags is not provided
    const tagsValue = body.tags !== undefined
      ? (Array.isArray(body.tags) ? JSON.stringify(body.tags) : (body.tags as string))
      : (existing.tags as string);

    if (body.leadStatus && body.leadStatus !== existing.leadStatus) {
      await sql`INSERT INTO activities (lead_id, type, description) VALUES (${params.id}, 'status_change', ${`Status changed from "${existing.leadStatus}" to "${body.leadStatus}"`})`;
    }

    const data = {
      businessName: body.businessName ?? existing.businessName,
      contactName: body.contactName ?? existing.contactName,
      phone: body.phone ?? existing.phone,
      email: body.email ?? existing.email,
      website: body.website ?? existing.website,
      facebookPage: body.facebookPage ?? existing.facebookPage,
      address: body.address ?? existing.address,
      city: body.city ?? existing.city,
      state: body.state ?? existing.state,
      industry: body.industry ?? existing.industry,
      currentWebsiteQuality: body.currentWebsiteQuality ?? existing.currentWebsiteQuality,
      hasWebsite: body.hasWebsite ?? existing.hasWebsite,
      hasFacebookPage: body.hasFacebookPage ?? existing.hasFacebookPage,
      googleBusinessProfile: body.googleBusinessProfile ?? existing.googleBusinessProfile,
      serviceOpportunity: body.serviceOpportunity ?? existing.serviceOpportunity,
      suggestedOffer: body.suggestedOffer ?? existing.suggestedOffer,
      estimatedDealValue: body.estimatedDealValue !== undefined ? body.estimatedDealValue : existing.estimatedDealValue,
      leadSource: body.leadSource ?? existing.leadSource,
      leadStatus: body.leadStatus ?? existing.leadStatus,
      priority: body.priority ?? existing.priority,
      lastContactedDate: body.lastContactedDate ?? existing.lastContactedDate,
      nextFollowUpDate: body.nextFollowUpDate ?? existing.nextFollowUpDate,
      notes: body.notes ?? existing.notes,
      painPoints: body.painPoints ?? existing.painPoints,
      personalizedPitch: body.personalizedPitch ?? existing.personalizedPitch,
      demoWebsiteUrl: body.demoWebsiteUrl ?? existing.demoWebsiteUrl,
      crmDemoUrl: body.crmDemoUrl ?? existing.crmDemoUrl,
      marketingPackageInterest: body.marketingPackageInterest ?? existing.marketingPackageInterest,
      websitePackageInterest: body.websitePackageInterest ?? existing.websitePackageInterest,
      crmPackageInterest: body.crmPackageInterest ?? existing.crmPackageInterest,
      tags: tagsValue,
      updatedDate: ts,
    };

    const [updated] = await sql`UPDATE leads SET ${sql(data)} WHERE id = ${params.id} RETURNING *`;
    return NextResponse.json(parseLead(updated as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (isNoDbMode) {
      const existing = getMockLeadById(Number(params.id));
      if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    const sql = getDb();
    const [existing] = await sql`SELECT id FROM leads WHERE id = ${params.id}`;
    if (!existing) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    await sql`DELETE FROM leads WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}