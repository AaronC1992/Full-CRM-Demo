import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json(db.prepare('SELECT * FROM templates ORDER BY type, name').all());
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const b = await req.json();
    const result = db.prepare('INSERT INTO templates (name, type, content) VALUES (?, ?, ?)').run(b.name || '', b.type || 'cold_call', b.content || '');
    const template = db.prepare('SELECT * FROM templates WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(template, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
