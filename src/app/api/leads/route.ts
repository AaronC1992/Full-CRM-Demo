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

// GET /api/leads
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';
    const city = searchParams.get('city') || '';
    const industry = searchParams.get('industry') || '';
    const sort = searchParams.get('sort') || 'createdDate';
    const dir = searchParams.get('dir') === 'asc' ? 'ASC' : 'DESC';

    let query = 'SELECT * FROM leads WHERE 1=1';
    const params: unknown[] = [];

    if (search) {
      query += ` AND (businessName LIKE ? OR contactName LIKE ? OR phone LIKE ? OR city LIKE ? OR industry LIKE ?)`;
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }
    if (status) { query += ' AND leadStatus = ?'; params.push(status); }
    if (priority) { query += ' AND priority = ?'; params.push(priority); }
    if (city) { query += ' AND city LIKE ?'; params.push(`%${city}%`); }
    if (industry) { query += ' AND industry = ?'; params.push(industry); }

    const allowedSort = ['businessName','contactName','city','leadStatus','priority','estimatedDealValue','createdDate','updatedDate','nextFollowUpDate','lastContactedDate'];
    const safeSort = allowedSort.includes(sort) ? sort : 'createdDate';
    query += ` ORDER BY ${safeSort} ${dir}`;

    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return NextResponse.json(rows.map(parseLead));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : (body.tags || '[]');

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

    const result = stmt.run(
      body.businessName || '', body.contactName || '', body.phone || '',
      body.email || '', body.website || '', body.facebookPage || '',
      body.address || '', body.city || '', body.state || 'MO',
      body.industry || '', body.currentWebsiteQuality || '',
      body.hasWebsite || '', body.hasFacebookPage || '', body.googleBusinessProfile || '',
      body.serviceOpportunity || '', body.suggestedOffer || '',
      body.estimatedDealValue ?? null, body.leadSource || '',
      body.leadStatus || 'New', body.priority || 'Warm',
      body.lastContactedDate || '', body.nextFollowUpDate || '',
      body.notes || '', body.painPoints || '', body.personalizedPitch || '',
      body.demoWebsiteUrl || '', body.crmDemoUrl || '',
      body.marketingPackageInterest || '', body.websitePackageInterest || '',
      body.crmPackageInterest || '', tags
    );

    const newLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;

    // Log activity
    db.prepare('INSERT INTO activities (leadId, type, description) VALUES (?, ?, ?)').run(
      result.lastInsertRowid, 'note', `Lead created via API`
    );

    return NextResponse.json(parseLead(newLead), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
