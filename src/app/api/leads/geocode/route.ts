import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// POST /api/leads/geocode — geocode a single lead by ID
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured.' }, { status: 500 });
    }

    const db = getDb();
    const { leadId } = await req.json();
    if (!leadId) return NextResponse.json({ error: 'leadId is required' }, { status: 400 });

    const lead = db.prepare('SELECT * FROM leads WHERE id=?').get(Number(leadId)) as Record<string, unknown> | null;
    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

    const addressStr = [lead.address, lead.city, lead.state, 'USA'].filter(Boolean).join(', ');
    if (!lead.address && !lead.city) {
      return NextResponse.json({ error: 'Lead has no address to geocode' }, { status: 400 });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressStr)}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK' || !data.results[0]) {
      return NextResponse.json({ error: `Geocoding failed: ${data.status}` }, { status: 400 });
    }

    const { lat, lng } = data.results[0].geometry.location;
    const placeId = data.results[0].place_id || '';

    db.prepare(`UPDATE leads SET latitude=?, longitude=?, placeId=?, updatedDate=datetime('now','localtime') WHERE id=?`)
      .run(lat, lng, placeId, Number(leadId));

    return NextResponse.json({ lat, lng, placeId, address: data.results[0].formatted_address });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
