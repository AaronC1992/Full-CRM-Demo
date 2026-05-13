import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/routes/[id]/google-maps-url
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const route = db.prepare('SELECT * FROM route_plans WHERE id=?').get(Number(params.id)) as Record<string, unknown> | null;
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });

    const stops = db.prepare(
      'SELECT * FROM route_stops WHERE routePlanId=? AND skipped=0 ORDER BY stopOrder ASC'
    ).all(Number(params.id)) as Record<string, unknown>[];

    if (stops.length === 0) return NextResponse.json({ error: 'No stops' }, { status: 400 });

    const encode = (s: string) => encodeURIComponent(s);

    // Build address string for each stop
    const stopAddresses = stops.map(s => {
      const parts = [s.address, s.city, s.state].filter(Boolean);
      return parts.join(', ');
    });

    const origin = (route.startAddress as string) || stopAddresses[0];
    const destination = (route.endAddress as string) || stopAddresses[stopAddresses.length - 1];
    const waypoints = stopAddresses.slice(0, -1); // exclude last if it's the destination

    // Google Maps supports up to 9 waypoints in URL navigation
    const BATCH_SIZE = 9;
    const urls: string[] = [];

    if (waypoints.length <= BATCH_SIZE) {
      const wp = waypoints.map(encode).join('|');
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encode(origin)}&destination=${encode(destination)}${wp ? `&waypoints=${wp}` : ''}&travelmode=driving`;
      urls.push(url);
    } else {
      // Split into batches
      for (let i = 0; i < stopAddresses.length; i += BATCH_SIZE + 1) {
        const batch = stopAddresses.slice(i, i + BATCH_SIZE + 2);
        const bOrigin = batch[0];
        const bDest = batch[batch.length - 1];
        const bWp = batch.slice(1, -1).map(encode).join('|');
        const url = `https://www.google.com/maps/dir/?api=1&origin=${encode(bOrigin)}&destination=${encode(bDest)}${bWp ? `&waypoints=${bWp}` : ''}&travelmode=driving`;
        urls.push(url);
      }
    }

    // Save primary URL to route
    db.prepare(`UPDATE route_plans SET googleMapsUrl=?, updatedAt=datetime('now','localtime') WHERE id=?`)
      .run(urls[0], Number(params.id));

    return NextResponse.json({ urls, primary: urls[0], batches: urls.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate Google Maps URL' }, { status: 500 });
  }
}
