import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/leads/bulk-geocode
// Body: { leadIds: number[] } — geocode up to 25 leads at once
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured.' }, { status: 500 });
    }

    const db = getDb();
    const { leadIds } = await req.json();

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: 'leadIds array is required' }, { status: 400 });
    }

    // Rate-limit: max 25 per call
    const limited = leadIds.slice(0, 25);
    const placeholders = limited.map(() => '?').join(',');
    const leads = db.prepare(
      `SELECT * FROM leads WHERE id IN (${placeholders}) AND (address != '' OR city != '')`
    ).all(...limited) as Record<string, unknown>[];

    const results: { id: number; success: boolean; lat?: number; lng?: number; error?: string }[] = [];

    for (const lead of leads) {
      try {
        const addressStr = [lead.address, lead.city, lead.state, 'USA'].filter(Boolean).join(', ');
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressStr)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results[0]) {
          const { lat, lng } = data.results[0].geometry.location;
          const placeId = data.results[0].place_id || '';
          db.prepare(`UPDATE leads SET latitude=?, longitude=?, placeId=?, updatedDate=datetime('now','localtime') WHERE id=?`)
            .run(lat, lng, placeId, lead.id);
          results.push({ id: lead.id as number, success: true, lat, lng });
        } else {
          results.push({ id: lead.id as number, success: false, error: data.status });
        }
      } catch {
        results.push({ id: lead.id as number, success: false, error: 'Request failed' });
      }
    }

    const succeeded = results.filter(r => r.success).length;
    return NextResponse.json({ total: limited.length, succeeded, failed: limited.length - succeeded, results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Bulk geocode failed' }, { status: 500 });
  }
}
