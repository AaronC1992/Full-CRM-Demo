import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT key, value FROM settings` as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const { key, value } of rows) settings[key] = value;
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const sql = getDb();
    const body = await req.json();
    for (const [key, value] of Object.entries(body)) {
      await sql`
        INSERT INTO settings (key, value) VALUES (${key}, ${String(value)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
      `;
    }
    const rows = await sql`SELECT key, value FROM settings` as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const { key, value } of rows) settings[key] = value;
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}