import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/activities?leadId=X
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    let rows;
    if (leadId) {
      rows = db.prepare('SELECT * FROM activities WHERE leadId = ? ORDER BY createdDate DESC').all(leadId);
    } else {
      rows = db.prepare('SELECT a.*, l.businessName FROM activities a LEFT JOIN leads l ON a.leadId = l.id ORDER BY a.createdDate DESC LIMIT 50').all();
    }
    return NextResponse.json(rows);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

// POST /api/activities
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const result = db.prepare(
      'INSERT INTO activities (leadId, type, description) VALUES (?, ?, ?)'
    ).run(body.leadId, body.type || 'note', body.description || '');
    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(activity, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
}
