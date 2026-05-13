import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const b = await req.json();
    const existing = db.prepare('SELECT * FROM packages WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    const features = b.includedFeatures !== undefined
      ? (Array.isArray(b.includedFeatures) ? JSON.stringify(b.includedFeatures) : b.includedFeatures)
      : existing.includedFeatures;
    db.prepare(`UPDATE packages SET packageName=?, description=?, setupPrice=?, monthlyPrice=?, includedFeatures=?, bestFor=?, internalNotes=?, updatedDate=datetime('now','localtime') WHERE id=?`)
      .run(b.packageName ?? existing.packageName, b.description ?? existing.description,
           b.setupPrice !== undefined ? b.setupPrice : existing.setupPrice,
           b.monthlyPrice !== undefined ? b.monthlyPrice : existing.monthlyPrice,
           features, b.bestFor ?? existing.bestFor, b.internalNotes ?? existing.internalNotes, params.id);
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(params.id) as Record<string, unknown>;
    return NextResponse.json({ ...pkg, includedFeatures: (() => { try { return JSON.parse(pkg.includedFeatures as string || '[]'); } catch { return []; } })() });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM packages WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
