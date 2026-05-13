import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { jsonToCsv } from '@/lib/utils';
import { Lead } from '@/lib/types';

// GET /api/export/leads
export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM leads ORDER BY createdDate DESC').all() as Record<string, unknown>[];

    const leads = rows.map(row => ({
      ...row,
      tags: (() => {
        try { return JSON.parse(row.tags as string || '[]').join(';'); }
        catch { return ''; }
      })(),
    }));

    const csv = jsonToCsv(leads);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="cue-crm-leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
