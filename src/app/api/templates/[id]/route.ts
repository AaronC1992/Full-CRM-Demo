import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const b = await req.json();
    const existing = db.prepare('SELECT * FROM templates WHERE id = ?').get(params.id) as Record<string, unknown> | undefined;
    if (!existing) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    db.prepare(`UPDATE templates SET name=?, type=?, content=?, updatedDate=datetime('now','localtime') WHERE id=?`)
      .run(b.name ?? existing.name, b.type ?? existing.type, b.content ?? existing.content, params.id);
    return NextResponse.json(db.prepare('SELECT * FROM templates WHERE id = ?').get(params.id));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM templates WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
