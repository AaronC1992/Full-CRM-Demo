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

// PUT /api/routes/[id]/stops/[stopId]
export async function PUT(req: NextRequest, { params }: { params: { id: string; stopId: string } }) {
  try {
    const db = getDb();
    const stopId = Number(params.stopId);
    const body = await req.json();

    const fields = [
      'stopOrder', 'visitReason', 'talkingPoints', 'recommendedPitch',
      'leaveBehindSuggestion', 'followUpAction', 'estimatedVisitMinutes',
      'arrivalWindow', 'notes', 'visitOutcome', 'spokeTo', 'interestLevel',
      'followUpDate', 'nextAction', 'visitCompleted', 'visitCompletedAt',
      'skipped', 'skipReason', 'suggestedOffer', 'routeScore',
    ];

    const updates: string[] = [];
    const values: unknown[] = [];

    for (const f of fields) {
      if (f in body) {
        if (f === 'talkingPoints') {
          updates.push(`${f}=?`);
          values.push(JSON.stringify(Array.isArray(body[f]) ? body[f] : []));
        } else if (f === 'visitCompleted' || f === 'skipped') {
          updates.push(`${f}=?`);
          values.push(body[f] ? 1 : 0);
        } else {
          updates.push(`${f}=?`);
          values.push(body[f] ?? '');
        }
      }
    }

    if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    updates.push(`updatedAt=datetime('now','localtime')`);
    values.push(stopId);

    db.prepare(`UPDATE route_stops SET ${updates.join(',')} WHERE id=?`).run(...values);

    const stop = db.prepare('SELECT * FROM route_stops WHERE id = ?').get(stopId);
    return NextResponse.json(parseStop(stop as Record<string, unknown>));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update stop' }, { status: 500 });
  }
}

// DELETE /api/routes/[id]/stops/[stopId]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string; stopId: string } }) {
  try {
    const db = getDb();
    const routeId = Number(params.id);
    const stopId = Number(params.stopId);
    db.prepare('DELETE FROM route_stops WHERE id = ? AND routePlanId = ?').run(stopId, routeId);
    db.prepare(`UPDATE route_plans SET totalStops=(SELECT COUNT(*) FROM route_stops WHERE routePlanId=?), updatedAt=datetime('now','localtime') WHERE id=?`).run(routeId, routeId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete stop' }, { status: 500 });
  }
}
