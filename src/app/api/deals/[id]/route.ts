import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [deal] = await sql`SELECT d.*, l.business_name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${params.id}`;
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    return NextResponse.json(deal);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
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
      serviceSold: body.serviceSold || '',
      packageType: body.packageType || '',
      monthlyValue: body.monthlyValue ?? null,
      oneTimeSetupValue: body.oneTimeSetupValue ?? null,
      estimatedCloseDate: body.estimatedCloseDate || '',
      dealStage: body.dealStage || 'Opportunity',
      proposalUrl: body.proposalUrl || '',
      contractStatus: body.contractStatus || 'None',
      paymentStatus: body.paymentStatus || 'Unpaid',
      notes: body.notes || '',
      updatedDate: ts,
    };
    const [updated] = await sql`UPDATE deals SET ${sql(data)} WHERE id = ${params.id} RETURNING *`;
    if (!updated) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    const [deal] = await sql`SELECT d.*, l.business_name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${params.id}`;
    return NextResponse.json(deal);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM deals WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}