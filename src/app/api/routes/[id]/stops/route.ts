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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    const routeId = Number(params.id);
    const s = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

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
    const [{ id: stopId }] = await sql`INSERT INTO route_stops ${sql(stopData)} RETURNING id`;
    await sql`UPDATE route_plans SET total_stops = (SELECT COUNT(*) FROM route_stops WHERE route_plan_id = ${routeId}), updated_at = ${ts} WHERE id = ${routeId}`;
    const [stop] = await sql`SELECT * FROM route_stops WHERE id = ${stopId}`;
    return NextResponse.json(parseStop(stop as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 });
  }
}