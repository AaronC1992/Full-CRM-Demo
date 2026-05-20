import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [demo] = await sql`SELECT d.*, l.business_name as lead_name FROM demos d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${params.id}`;
    if (!demo) return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    return NextResponse.json(demo);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch demo' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      updatedDate: ts,
    };
    const [updated] = await sql`UPDATE demos SET ${sql(data)} WHERE id = ${params.id} RETURNING *`;
    if (!updated) return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    const [demo] = await sql`SELECT d.*, l.business_name as lead_name FROM demos d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${params.id}`;
    return NextResponse.json(demo);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update demo' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM demos WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete demo' }, { status: 500 });
  }
}