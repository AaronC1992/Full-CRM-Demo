import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') || '';
    let query = 'SELECT d.*, l.businessName as leadName FROM deals d LEFT JOIN leads l ON d.leadId = l.id WHERE 1=1';
    const params: unknown[] = [];
    if (stage) { query += ' AND d.dealStage = ?'; params.push(stage); }
    query += ' ORDER BY d.createdDate DESC';
    return NextResponse.json(db.prepare(query).all(...params));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const b = await req.json();
    const result = db.prepare(`
      INSERT INTO deals (businessName, leadId, serviceSold, packageType, monthlyValue,
        oneTimeSetupValue, estimatedCloseDate, dealStage, proposalUrl, contractStatus, paymentStatus, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.businessName || '', b.leadId ?? null, b.serviceSold || '', b.packageType || '',
      b.monthlyValue ?? null, b.oneTimeSetupValue ?? null, b.estimatedCloseDate || '',
      b.dealStage || 'Opportunity', b.proposalUrl || '', b.contractStatus || 'None',
      b.paymentStatus || 'Unpaid', b.notes || ''
    );
    const deal = db.prepare('SELECT d.*, l.businessName as leadName FROM deals d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(result.lastInsertRowid);
    return NextResponse.json(deal, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
