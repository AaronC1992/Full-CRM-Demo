import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured. Add it to your environment variables.' }, { status: 500 });
    }

    const sql = getDb();
    let stops: Record<string, unknown>[] = [];
    let startAddress = '';
    let endAddress = '';
    let travelMode = 'driving';
    let avoidTolls = false;
    let avoidHighways = false;
    let routePlanId: number | null = null;

    if (body.routePlanId) {
      routePlanId = Number(body.routePlanId);
      const [route] = await sql`SELECT * FROM route_plans WHERE id = ${routePlanId}` as Record<string, unknown>[];
      if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
      startAddress = route.startAddress as string;
      endAddress = route.endAddress as string;
      stops = await sql`SELECT * FROM route_stops WHERE route_plan_id = ${routePlanId} AND skipped = 0 ORDER BY stop_order ASC` as Record<string, unknown>[];
    } else {
      stops = body.stops || [];
      startAddress = body.startAddress || '';
      endAddress = body.endAddress || '';
      travelMode = body.travelMode || 'driving';
      avoidTolls = body.avoidTolls || false;
      avoidHighways = body.avoidHighways || false;
    }

    if (stops.length === 0) return NextResponse.json({ error: 'No stops to optimize' }, { status: 400 });

    const getStopAddress = (s: Record<string, unknown>) => {
      if (s.latitude && s.longitude) return `${s.latitude},${s.longitude}`;
      return [s.address, s.city, s.state].filter(Boolean).join(', ');
    };

    const originIsFirstStop = !startAddress;
    const destIsLastStop = !endAddress;
    const origin = startAddress || getStopAddress(stops[0]);
    const destination = endAddress || getStopAddress(stops[stops.length - 1]);
    // Exclude the first stop from waypoints if it is used as origin,
    // and the last stop if it is used as destination, to avoid duplication.
    const waypointStops = stops.slice(
      originIsFirstStop ? 1 : 0,
      destIsLastStop ? stops.length - 1 : stops.length,
    );
    const waypoints = waypointStops.map(getStopAddress);

    const avoidParam = [avoidTolls ? 'tolls' : '', avoidHighways ? 'highways' : ''].filter(Boolean).join('|');

    const gmUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
    gmUrl.searchParams.set('origin', origin);
    gmUrl.searchParams.set('destination', destination);
    if (waypoints.length > 0) {
      gmUrl.searchParams.set('waypoints', `optimize:true|${waypoints.join('|')}`);
    }
    gmUrl.searchParams.set('mode', travelMode.toLowerCase());
    if (avoidParam) gmUrl.searchParams.set('avoid', avoidParam);
    gmUrl.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY!);

    const gmRes = await fetch(gmUrl.toString());
    const gmData = await gmRes.json();

    if (gmData.status !== 'OK') {
      return NextResponse.json({ error: `Google Maps API error: ${gmData.status}.` }, { status: 400 });
    }

    const gmRoute = gmData.routes[0];
    // waypoint_order indexes into waypointStops (intermediate stops only)
    const optimizedOrder: number[] = gmRoute.waypoint_order || [];
    const reorderedMiddle = optimizedOrder.map((origIdx: number) => waypointStops[origIdx]);

    // Reconstruct full ordered stop list preserving pinned first/last stops
    const firstStop = originIsFirstStop ? stops[0] : null;
    const lastStop = destIsLastStop ? stops[stops.length - 1] : null;
    const fullOrdered = [
      ...(firstStop ? [firstStop] : []),
      ...reorderedMiddle,
      ...(lastStop ? [lastStop] : []),
    ];
    const reorderedStops = fullOrdered.map((s, i) => ({ ...s, stopOrder: i + 1 }));

    let totalDuration = 0;
    let totalDistance = 0;
    for (const leg of gmRoute.legs || []) {
      totalDuration += leg.duration?.value || 0;
      totalDistance += leg.distance?.value || 0;
    }

    const estimatedDriveTime = totalDuration > 0
      ? `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`
      : '';
    const estimatedRouteDistance = totalDistance > 0
      ? `${(totalDistance / 1609.34).toFixed(1)} miles`
      : '';

    const encode = (s: string) => encodeURIComponent(s);
    const BATCH_SIZE = 9;
    // Build URLs using origin + reordered intermediate stops + destination (no duplication)
    const allAddresses = [origin, ...reorderedMiddle.map(getStopAddress), destination];
    const mapsUrls: string[] = [];
    for (let i = 0; i < allAddresses.length - 1; i += BATCH_SIZE + 1) {
      const batch = allAddresses.slice(i, i + BATCH_SIZE + 2);
      const bOrigin = batch[0];
      const bDest = batch[batch.length - 1];
      const bWp = batch.slice(1, -1).map(encode).join('|');
      mapsUrls.push(`https://www.google.com/maps/dir/?api=1&origin=${encode(bOrigin)}&destination=${encode(bDest)}${bWp ? `&waypoints=${bWp}` : ''}&travelmode=driving`);
    }

    if (routePlanId) {
      const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
      await sql.begin(async tx => {
        for (const s of reorderedStops) {
          await tx`UPDATE route_stops SET stop_order = ${s.stopOrder as number}, updated_at = ${ts} WHERE id = ${(s as Record<string, unknown>).id as number}`;
        }
      });
      await sql`
        UPDATE route_plans SET
          estimated_drive_time = ${estimatedDriveTime},
          estimated_route_distance = ${estimatedRouteDistance},
          google_maps_url = ${mapsUrls[0] || ''},
          status = 'Optimized',
          updated_at = ${new Date().toISOString().replace('T', ' ').slice(0, 19)}
        WHERE id = ${routePlanId}
      `;
    }

    return NextResponse.json({
      optimizedStops: reorderedStops,
      estimatedDriveTime,
      estimatedRouteDistance,
      googleMapsUrls: mapsUrls,
      primaryGoogleMapsUrl: mapsUrls[0] || '',
      batches: mapsUrls.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Route optimization failed' }, { status: 500 });
  }
}