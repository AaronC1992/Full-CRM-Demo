import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

function parseStop(row: Record<string, unknown>) {
  return {
    ...row,
    talkingPoints: (() => { try { return JSON.parse(row.talkingPoints as string || '[]'); } catch { return []; } })(),
    visitCompleted: row.visitCompleted === 1,
    skipped: row.skipped === 1,
  };
}

// GET /api/routes
export async function GET() {
  try {
    const db = getDb();
    const routes = db.prepare(`
      SELECT rp.*, COUNT(rs.id) as stopCount
      FROM route_plans rp
      LEFT JOIN route_stops rs ON rp.id = rs.routePlanId
      GROUP BY rp.id
      ORDER BY rp.createdAt DESC
    `).all();
    return NextResponse.json(routes);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

// POST /api/routes — save a route plan with stops
export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const {
      name = '', routeDate = '', startAddress = '', endAddress = '',
      city = '', state = 'MO', radiusMiles = null,
      startTime = '', endTime = '', status = 'Draft',
      estimatedDriveTime = '', estimatedRouteDistance = '',
      googleMapsUrl = '', appleMapsUrl = '',
      notes = '', aiSummary = '', routeGoal = '',
      stops = [],
    } = body;

    const result = db.prepare(`
      INSERT INTO route_plans
        (name, routeDate, startAddress, endAddress, city, state, radiusMiles,
         startTime, endTime, status, totalStops, estimatedDriveTime,
         estimatedRouteDistance, googleMapsUrl, appleMapsUrl, notes, aiSummary, routeGoal)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      name, routeDate, startAddress, endAddress, city, state, radiusMiles,
      startTime, endTime, status, stops.length, estimatedDriveTime,
      estimatedRouteDistance, googleMapsUrl, appleMapsUrl, notes, aiSummary, routeGoal
    );

    const routeId = result.lastInsertRowid as number;

    if (stops.length > 0) {
      const insertStop = db.prepare(`
        INSERT INTO route_stops
          (routePlanId, leadId, businessName, contactName, phone, email, website,
           facebookPage, address, city, state, latitude, longitude, stopOrder,
           priority, leadStatus, industry, serviceOpportunity, suggestedOffer,
           estimatedDealValue, visitReason, talkingPoints, recommendedPitch,
           leaveBehindSuggestion, followUpAction, estimatedVisitMinutes,
           arrivalWindow, notes, routeScore)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);
      const insertMany = db.transaction((stopsArr: Record<string, unknown>[]) => {
        for (const s of stopsArr) {
          insertStop.run(
            routeId, s.leadId ?? null,
            s.businessName ?? '', s.contactName ?? '', s.phone ?? '',
            s.email ?? '', s.website ?? '', s.facebookPage ?? '',
            s.address ?? '', s.city ?? '', s.state ?? '',
            s.latitude ?? null, s.longitude ?? null,
            s.stopOrder ?? 0,
            s.priority ?? 'Warm', s.leadStatus ?? 'New',
            s.industry ?? '', s.serviceOpportunity ?? '',
            s.suggestedOffer ?? '', s.estimatedDealValue ?? null,
            s.visitReason ?? '',
            JSON.stringify(Array.isArray(s.talkingPoints) ? s.talkingPoints : []),
            s.recommendedPitch ?? '', s.leaveBehindSuggestion ?? '',
            s.followUpAction ?? '', s.estimatedVisitMinutes ?? 15,
            s.arrivalWindow ?? '', s.notes ?? '', s.routeScore ?? null
          );
        }
      });
      insertMany(stops);
    }

    const created = db.prepare('SELECT * FROM route_plans WHERE id = ?').get(routeId) as Record<string, unknown>;
    const savedStops = db.prepare('SELECT * FROM route_stops WHERE routePlanId = ? ORDER BY stopOrder ASC').all(routeId) as Record<string, unknown>[];
    return NextResponse.json({ ...created, stops: savedStops.map(parseStop) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save route' }, { status: 500 });
  }
}
