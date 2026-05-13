import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const deal = db.prepare('SELECT d.*, l.businessName as leadName FROM deals d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(params.id);
    if (!deal) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    return NextResponse.json(deal);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const b = await req.json();
    const existing = db.prepare('SELECT * FROM deals WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    db.prepare(`
      UPDATE deals SET businessName=?, leadId=?, serviceSold=?, packageType=?, monthlyValue=?,
        oneTimeSetupValue=?, estimatedCloseDate=?, dealStage=?, proposalUrl=?, contractStatus=?,
        paymentStatus=?, notes=?, updatedDate=datetime('now','localtime') WHERE id=?
    `).run(
      b.businessName ?? existing.businessName, b.leadId !== undefined ? b.leadId : existing.leadId,
      b.serviceSold ?? existing.serviceSold, b.packageType ?? existing.packageType,
      b.monthlyValue !== undefined ? b.monthlyValue : existing.monthlyValue,
      b.oneTimeSetupValue !== undefined ? b.oneTimeSetupValue : existing.oneTimeSetupValue,
      b.estimatedCloseDate ?? existing.estimatedCloseDate, b.dealStage ?? existing.dealStage,
      b.proposalUrl ?? existing.proposalUrl, b.contractStatus ?? existing.contractStatus,
      b.paymentStatus ?? existing.paymentStatus, b.notes ?? existing.notes, params.id
    );
    const updated = db.prepare('SELECT d.*, l.businessName as leadName FROM deals d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(params.id);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM deals WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 });
  }
}
