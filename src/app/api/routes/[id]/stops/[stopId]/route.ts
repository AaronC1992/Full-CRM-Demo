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

export async function PUT(req: NextRequest, { params }: { params: { id: string; stopId: string } }) {
  try {
    const sql = getDb();
    const stopId = Number(params.stopId);
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const allowed = [
      'stopOrder', 'visitReason', 'talkingPoints', 'recommendedPitch',
      'leaveBehindSuggestion', 'followUpAction', 'estimatedVisitMinutes',
      'arrivalWindow', 'notes', 'visitOutcome', 'spokeTo', 'interestLevel',
      'followUpDate', 'nextAction', 'visitCompleted', 'visitCompletedAt',
      'skipped', 'skipReason', 'suggestedOffer', 'routeScore',
    ];
    const updateData: Record<string, unknown> = {};
    for (const f of allowed) {
      if (f in body) {
        if (f === 'talkingPoints') updateData[f] = JSON.stringify(Array.isArray(body[f]) ? body[f] : []);
        else if (f === 'visitCompleted' || f === 'skipped') updateData[f] = body[f] ? 1 : 0;
        else updateData[f] = body[f] ?? '';
      }
    }
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    updateData.updatedAt = ts;

    const [updatedStop] = await sql`UPDATE route_stops SET ${sql(updateData)} WHERE id = ${stopId} RETURNING *`;
    return NextResponse.json(parseStop(updatedStop as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update stop' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; stopId: string } }) {
  try {
    const sql = getDb();
    const routeId = Number(params.id);
    const stopId = Number(params.stopId);
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await sql`DELETE FROM route_stops WHERE id = ${stopId} AND route_plan_id = ${routeId}`;
    await sql`UPDATE route_plans SET total_stops = (SELECT COUNT(*) FROM route_stops WHERE route_plan_id = ${routeId}), updated_at = ${ts} WHERE id = ${routeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete stop' }, { status: 500 });
  }
}