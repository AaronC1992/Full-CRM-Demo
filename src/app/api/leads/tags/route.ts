import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT tags FROM leads WHERE tags IS NOT NULL AND tags != '[]' AND tags != ''` as { tags: string }[];

    const tagSet = new Set<string>();
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.tags);
        if (Array.isArray(parsed)) {
          parsed.forEach(t => typeof t === 'string' && t.trim() && tagSet.add(t.trim().toLowerCase()));
        }
      } catch {
        // skip unparseable rows
      }
    }

    return NextResponse.json(Array.from(tagSet).sort());
  } catch (err) {
    console.error(err);
    return NextResponse.json([]);
  }
}
