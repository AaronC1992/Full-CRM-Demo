import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    let rows;
    if (leadId) {
      rows = await sql`SELECT * FROM activities WHERE lead_id = ${leadId} ORDER BY created_date DESC`;
    } else {
      rows = await sql`SELECT a.*, l.business_name FROM activities a LEFT JOIN leads l ON a.lead_id = l.id ORDER BY a.created_date DESC LIMIT 50`;
    }
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const [activity] = await sql`
      INSERT INTO activities (lead_id, type, description)
      VALUES (${body.leadId}, ${body.type || 'note'}, ${body.description || ''})
      RETURNING *
    `;
    return NextResponse.json(activity, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add activity' }, { status: 500 });
  }
}