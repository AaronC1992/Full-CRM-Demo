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
    const origin = (route.startAddress as string) || stopAddresses[0];
    const BATCH_SIZE = 4;
    const urls: string[] = [];

    if (stopAddresses.length <= BATCH_SIZE) {
      let url = `https://maps.apple.com/?saddr=${encode(origin)}`;
      for (const addr of stopAddresses) url += `&daddr=${encode(addr)}`;
      url += `&dirflg=d`;
      urls.push(url);
    } else {
      for (const addr of stopAddresses) urls.push(`https://maps.apple.com/?q=${encode(addr)}&dirflg=d`);
    }

    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await sql`UPDATE route_plans SET apple_maps_url = ${urls[0]}, updated_at = ${ts} WHERE id = ${Number(params.id)}`;
    return NextResponse.json({ urls, primary: urls[0], note: stopAddresses.length > BATCH_SIZE ? 'Individual stop links generated' : 'Full route link generated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate Apple Maps URL' }, { status: 500 });
  }
}