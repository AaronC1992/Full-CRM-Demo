import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const sql = getDb();
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    let deals;
    if (stage) {
      deals = await sql`SELECT d.*, l.business_name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.deal_stage = ${stage} ORDER BY d.created_date DESC`;
    } else {
      deals = await sql`SELECT d.*, l.business_name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id ORDER BY d.created_date DESC`;
    }
    return NextResponse.json(deals);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
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
      createdDate: ts,
      updatedDate: ts,
    };
    const [{ id }] = await sql`INSERT INTO deals ${sql(data)} RETURNING id`;
    const [deal] = await sql`SELECT d.*, l.business_name as lead_name FROM deals d LEFT JOIN leads l ON d.lead_id = l.id WHERE d.id = ${id}`;
    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}