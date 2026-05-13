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

// POST /api/routes/[id]/stops — add a stop
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const routeId = Number(params.id);
    const s = await req.json();

    const result = db.prepare(`
      INSERT INTO route_stops
        (routePlanId, leadId, businessName, contactName, phone, email, website,
         facebookPage, address, city, state, latitude, longitude, stopOrder,
         priority, leadStatus, industry, serviceOpportunity, suggestedOffer,
         estimatedDealValue, visitReason, talkingPoints, recommendedPitch,
         leaveBehindSuggestion, followUpAction, estimatedVisitMinutes,
         arrivalWindow, notes, routeScore)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `).run(
      routeId, s.leadId ?? null,
      s.businessName ?? '', s.contactName ?? '', s.phone ?? '',
      s.email ?? '', s.website ?? '', s.facebookPage ?? '',
      s.address ?? '', s.city ?? '', s.state ?? '',
      s.latitude ?? null, s.longitude ?? null, s.stopOrder ?? 0,
      s.priority ?? 'Warm', s.leadStatus ?? 'New',
      s.industry ?? '', s.serviceOpportunity ?? '', s.suggestedOffer ?? '',
      s.estimatedDealValue ?? null, s.visitReason ?? '',
      JSON.stringify(Array.isArray(s.talkingPoints) ? s.talkingPoints : []),
      s.recommendedPitch ?? '', s.leaveBehindSuggestion ?? '',
      s.followUpAction ?? '', s.estimatedVisitMinutes ?? 15,
      s.arrivalWindow ?? '', s.notes ?? '', s.routeScore ?? null
    );

    // Update totalStops on route
    db.prepare(`UPDATE route_plans SET totalStops=(SELECT COUNT(*) FROM route_stops WHERE routePlanId=?), updatedAt=datetime('now','localtime') WHERE id=?`).run(routeId, routeId);

    const stop = db.prepare('SELECT * FROM route_stops WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(parseStop(stop as Record<string, unknown>), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to add stop' }, { status: 500 });
  }
}
