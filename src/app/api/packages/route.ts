import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    return NextResponse.json(db.prepare('SELECT * FROM packages ORDER BY setupPrice ASC').all().map((p: unknown) => {
      const row = p as Record<string, unknown>;
      return {
        ...row,
        includedFeatures: (() => { try { return JSON.parse(row.includedFeatures as string || '[]'); } catch { return []; } })(),
      };
    }));
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const b = await req.json();
    const features = Array.isArray(b.includedFeatures) ? JSON.stringify(b.includedFeatures) : (b.includedFeatures || '[]');
    const result = db.prepare(`
      INSERT INTO packages (packageName, description, setupPrice, monthlyPrice, includedFeatures, bestFor, internalNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(b.packageName || '', b.description || '', b.setupPrice ?? null, b.monthlyPrice ?? null, features, b.bestFor || '', b.internalNotes || '');
    const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
    return NextResponse.json({ ...pkg, includedFeatures: (() => { try { return JSON.parse(pkg.includedFeatures as string || '[]'); } catch { return []; } })() }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
