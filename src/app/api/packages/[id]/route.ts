import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [pkg] = await sql`SELECT * FROM packages WHERE id = ${params.id}`;
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    const result = { ...(pkg as Record<string, unknown>), includedFeatures: (() => { try { return JSON.parse((pkg as Record<string, unknown>).includedFeatures as string); } catch { return []; } })() };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
      updatedDate: ts,
    };
    const [pkg] = await sql`UPDATE packages SET ${sql(data)} WHERE id = ${params.id} RETURNING *`;
    if (!pkg) return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    const result = { ...(pkg as Record<string, unknown>), includedFeatures: (() => { try { return JSON.parse((pkg as Record<string, unknown>).includedFeatures as string); } catch { return []; } })() };
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM packages WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}