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

export async function GET() {
  try {
    const sql = getDb();
    const routes = await sql`
      SELECT rp.*, COUNT(rs.id) as stop_count
      FROM route_plans rp
      LEFT JOIN route_stops rs ON rp.id = rs.route_plan_id
      GROUP BY rp.id
      ORDER BY rp.created_at DESC
    `;
    return NextResponse.json(routes);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sql = getDb();
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
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const planData = {
      name, routeDate, startAddress, endAddress, city, state, radiusMiles,
      startTime, endTime, status, totalStops: stops.length,
      estimatedDriveTime, estimatedRouteDistance,
      googleMapsUrl, appleMapsUrl, notes, aiSummary, routeGoal,
      createdAt: ts, updatedAt: ts,
    };
    const [{ id: routeId }] = await sql`INSERT INTO route_plans ${sql(planData)} RETURNING id`;

    if (stops.length > 0) {
      await sql.begin(async tx => {
        for (const s of stops as Record<string, unknown>[]) {
          const stopData = {
            routePlanId: routeId,
            leadId: s.leadId ?? null,
            businessName: s.businessName ?? '',
            contactName: s.contactName ?? '',
            phone: s.phone ?? '',
            email: s.email ?? '',
            website: s.website ?? '',
            facebookPage: s.facebookPage ?? '',
            address: s.address ?? '',
            city: s.city ?? '',
            state: s.state ?? '',
            latitude: s.latitude ?? null,
            longitude: s.longitude ?? null,
            stopOrder: s.stopOrder ?? 0,
            priority: s.priority ?? 'Warm',
            leadStatus: s.leadStatus ?? 'New',
            industry: s.industry ?? '',
            serviceOpportunity: s.serviceOpportunity ?? '',
            suggestedOffer: s.suggestedOffer ?? '',
            estimatedDealValue: s.estimatedDealValue ?? null,
            visitReason: s.visitReason ?? '',
            talkingPoints: JSON.stringify(Array.isArray(s.talkingPoints) ? s.talkingPoints : []),
            recommendedPitch: s.recommendedPitch ?? '',
            leaveBehindSuggestion: s.leaveBehindSuggestion ?? '',
            followUpAction: s.followUpAction ?? '',
            estimatedVisitMinutes: s.estimatedVisitMinutes ?? 15,
            arrivalWindow: s.arrivalWindow ?? '',
            notes: s.notes ?? '',
            routeScore: s.routeScore ?? null,
            createdAt: ts,
            updatedAt: ts,
          };
          await tx`INSERT INTO route_stops ${tx(stopData as unknown as Record<string, string | number | boolean | null>)}`;
        }
      });
    }

    const [created] = await sql`SELECT * FROM route_plans WHERE id = ${routeId}` as Record<string, unknown>[];
    const savedStops = await sql`SELECT * FROM route_stops WHERE route_plan_id = ${routeId} ORDER BY stop_order ASC` as Record<string, unknown>[];
    return NextResponse.json({ ...created, stops: savedStops.map(parseStop) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to save route' }, { status: 500 });
  }
}