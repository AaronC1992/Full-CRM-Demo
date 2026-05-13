import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const leadId = searchParams.get('leadId') || '';
    let query = 'SELECT d.*, l.businessName as leadName FROM demos d LEFT JOIN leads l ON d.leadId = l.id WHERE 1=1';
    const params: unknown[] = [];
    if (status) { query += ' AND d.demoStatus = ?'; params.push(status); }
    if (leadId) { query += ' AND d.leadId = ?'; params.push(leadId); }
    query += ' ORDER BY d.createdDate DESC';
    return NextResponse.json(db.prepare(query).all(...params));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch demos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const b = await req.json();
    const result = db.prepare(`
      INSERT INTO demos (businessName, leadId, demoUrl, originalWebsiteUrl, demoStatus,
        layoutOptionUsed, dateStarted, dateCompleted, dateSent, clientFeedback,
        neededChanges, followUpDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.businessName || '', b.leadId ?? null, b.demoUrl || '', b.originalWebsiteUrl || '',
      b.demoStatus || 'Idea', b.layoutOptionUsed || '', b.dateStarted || '',
      b.dateCompleted || '', b.dateSent || '', b.clientFeedback || '',
      b.neededChanges || '', b.followUpDate || '', b.notes || ''
    );
    const demo = db.prepare('SELECT d.*, l.businessName as leadName FROM demos d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(result.lastInsertRowid);
    return NextResponse.json(demo, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create demo' }, { status: 500 });
  }
}
