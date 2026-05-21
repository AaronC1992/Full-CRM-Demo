import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const [route] = await sql`SELECT * FROM route_plans WHERE id = ${Number(params.id)}` as Record<string, unknown>[];
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });

    const stops = await sql`SELECT * FROM route_stops WHERE route_plan_id = ${Number(params.id)} AND skipped = 0 ORDER BY stop_order ASC` as Record<string, unknown>[];
    if (stops.length === 0) return NextResponse.json({ error: 'No stops' }, { status: 400 });

    const encode = (s: string) => encodeURIComponent(s);
    const stopAddresses = stops.map(s => [s.address, s.city, s.state].filter(Boolean).join(', '));
    const customStart = (route.startAddress as string) || '';
    const customEnd = (route.endAddress as string) || '';
    const origin = customStart || stopAddresses[0];
    const destination = customEnd || stopAddresses[stopAddresses.length - 1];
    // Exclude first stop from waypoints if it is used as origin, last stop if used as destination
    const wpsStart = !customStart ? 1 : 0;
    const wpsEnd = !customEnd ? stopAddresses.length - 1 : stopAddresses.length;
    const waypoints = stopAddresses.slice(wpsStart, wpsEnd);
    const BATCH_SIZE = 9;
    const urls: string[] = [];

    if (waypoints.length <= BATCH_SIZE) {
      const wp = waypoints.map(encode).join('|');
      urls.push(`https://www.google.com/maps/dir/?api=1&origin=${encode(origin)}&destination=${encode(destination)}${wp ? `&waypoints=${wp}` : ''}&travelmode=driving`);
    } else {
      // For large routes, batch segments using the corrected waypoints list
      const allSegmentAddresses = [origin, ...waypoints, destination];
      for (let i = 0; i < allSegmentAddresses.length - 1; i += BATCH_SIZE + 1) {
        const batch = allSegmentAddresses.slice(i, i + BATCH_SIZE + 2);
        const bOrigin = batch[0];
        const bDest = batch[batch.length - 1];
        const bWp = batch.slice(1, -1).map(encode).join('|');
        urls.push(`https://www.google.com/maps/dir/?api=1&origin=${encode(bOrigin)}&destination=${encode(bDest)}${bWp ? `&waypoints=${bWp}` : ''}&travelmode=driving`);
      }
    }

    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await sql`UPDATE route_plans SET google_maps_url = ${urls[0]}, updated_at = ${ts} WHERE id = ${Number(params.id)}`;
    return NextResponse.json({ urls, primary: urls[0], batches: urls.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate Google Maps URL' }, { status: 500 });
  }
}