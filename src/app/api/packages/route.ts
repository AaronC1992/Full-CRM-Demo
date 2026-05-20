import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM packages ORDER BY setup_price ASC`;
    const packages = rows.map((p: Record<string, unknown>) => ({
      ...p,
      includedFeatures: (() => { try { return JSON.parse(p.includedFeatures as string); } catch { return []; } })(),
    }));
    return NextResponse.json(packages);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const data = {
      packageName: body.packageName || '',
      description: body.description || '',
      setupPrice: body.setupPrice ?? null,
      monthlyPrice: body.monthlyPrice ?? null,
      includedFeatures: JSON.stringify(Array.isArray(body.includedFeatures) ? body.includedFeatures : []),
      bestFor: body.bestFor || '',
      internalNotes: body.internalNotes || '',
      createdDate: ts,
      updatedDate: ts,
    };
    const [pkg] = await sql`INSERT INTO packages ${sql(data)} RETURNING *`;
    const result = { ...pkg, includedFeatures: (() => { try { return JSON.parse(pkg.includedFeatures); } catch { return []; } })() };
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}