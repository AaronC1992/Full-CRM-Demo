import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    let demos;
    if (status) {
      demos = await sql`SELECT d.*, l.business_name as lead_name FROM demos d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.demo_status = ${status} ORDER BY d.created_date DESC`;
    } else {
      demos = await sql`SELECT d.*, l.business_name as lead_name FROM demos d LEFT JOIN leads l ON d.lead_id = l.id ORDER BY d.created_date DESC`;
    }
    return NextResponse.json(demos);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch demos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const data = {
      businessName: body.businessName || '',
      leadId: body.leadId ?? null,
      demoUrl: body.demoUrl || '',
      originalWebsiteUrl: body.originalWebsiteUrl || '',
      demoStatus: body.demoStatus || 'Idea',
      layoutOptionUsed: body.layoutOptionUsed || '',
      dateStarted: body.dateStarted || '',
      dateCompleted: body.dateCompleted || '',
      dateSent: body.dateSent || '',
      clientFeedback: body.clientFeedback || '',
      neededChanges: body.neededChanges || '',
      followUpDate: body.followUpDate || '',
      notes: body.notes || '',
      createdDate: ts,
      updatedDate: ts,
    };
    const [{ id }] = await sql`INSERT INTO demos ${sql(data)} RETURNING id`;
    const [demo] = await sql`SELECT d.*, l.business_name as lead_name FROM demos d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${id}`;
    return NextResponse.json(demo, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create demo' }, { status: 500 });
  }
}