import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const demo = db.prepare('SELECT d.*, l.businessName as leadName FROM demos d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(params.id);
    if (!demo) return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    return NextResponse.json(demo);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch demo' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const b = await req.json();
    const existing = db.prepare('SELECT * FROM demos WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Demo not found' }, { status: 404 });
    db.prepare(`
      UPDATE demos SET businessName=?, leadId=?, demoUrl=?, originalWebsiteUrl=?, demoStatus=?,
        layoutOptionUsed=?, dateStarted=?, dateCompleted=?, dateSent=?, clientFeedback=?,
        neededChanges=?, followUpDate=?, notes=?, updatedDate=datetime('now','localtime') WHERE id=?
    `).run(
      b.businessName ?? existing.businessName, b.leadId !== undefined ? b.leadId : existing.leadId,
      b.demoUrl ?? existing.demoUrl, b.originalWebsiteUrl ?? existing.originalWebsiteUrl,
      b.demoStatus ?? existing.demoStatus, b.layoutOptionUsed ?? existing.layoutOptionUsed,
      b.dateStarted ?? existing.dateStarted, b.dateCompleted ?? existing.dateCompleted,
      b.dateSent ?? existing.dateSent, b.clientFeedback ?? existing.clientFeedback,
      b.neededChanges ?? existing.neededChanges, b.followUpDate ?? existing.followUpDate,
      b.notes ?? existing.notes, params.id
    );
    const updated = db.prepare('SELECT d.*, l.businessName as leadName FROM demos d LEFT JOIN leads l ON d.leadId = l.id WHERE d.id = ?').get(params.id);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update demo' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM demos WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete demo' }, { status: 500 });
  }
}
