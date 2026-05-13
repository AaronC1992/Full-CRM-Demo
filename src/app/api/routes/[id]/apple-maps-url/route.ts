import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

// GET /api/routes/[id]/apple-maps-url
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

    const stopAddresses = stops.map(s => {
      const parts = [s.address, s.city, s.state].filter(Boolean);
      return parts.join(', ');
    });

    const origin = (route.startAddress as string) || stopAddresses[0];

    // Apple Maps multi-stop: saddr + multiple daddr params
    // Apple Maps doesn't support true multi-waypoint like Google, so we link to each stop
    // For small routes, use a single link; for larger ones, link to each stop individually
    const BATCH_SIZE = 4;
    const urls: string[] = [];

    if (stopAddresses.length <= BATCH_SIZE) {
      // Build a single Apple Maps link with the full route
      let url = `https://maps.apple.com/?saddr=${encode(origin)}`;
      for (const addr of stopAddresses) {
        url += `&daddr=${encode(addr)}`;
      }
      url += `&dirflg=d`;
      urls.push(url);
    } else {
      // Individual stop links
      for (const addr of stopAddresses) {
        urls.push(`https://maps.apple.com/?q=${encode(addr)}&dirflg=d`);
      }
    }

    // Save to route
    db.prepare(`UPDATE route_plans SET appleMapsUrl=?, updatedAt=datetime('now','localtime') WHERE id=?`)
      .run(urls[0], Number(params.id));

    return NextResponse.json({ urls, primary: urls[0], note: stopAddresses.length > BATCH_SIZE ? 'Individual stop links generated' : 'Full route link generated' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate Apple Maps URL' }, { status: 500 });
  }
}
