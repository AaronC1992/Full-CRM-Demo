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

// GET /api/routes/[id]
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const route = db.prepare('SELECT * FROM route_plans WHERE id = ?').get(Number(params.id));
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    const stops = (db.prepare('SELECT * FROM route_stops WHERE routePlanId = ? ORDER BY stopOrder ASC').all(Number(params.id)) as Record<string, unknown>[]).map(parseStop);
    return NextResponse.json({ ...route, stops });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

// PUT /api/routes/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const id = Number(params.id);
    const body = await req.json();
    const {
      name, routeDate, startAddress, endAddress, city, state, radiusMiles,
      startTime, endTime, status, estimatedDriveTime, estimatedRouteDistance,
      googleMapsUrl, appleMapsUrl, notes, aiSummary, routeGoal,
    } = body;

    db.prepare(`
      UPDATE route_plans SET
        name=?, routeDate=?, startAddress=?, endAddress=?, city=?, state=?,
        radiusMiles=?, startTime=?, endTime=?, status=?,
        estimatedDriveTime=?, estimatedRouteDistance=?,
        googleMapsUrl=?, appleMapsUrl=?, notes=?, aiSummary=?, routeGoal=?,
        updatedAt=datetime('now','localtime')
      WHERE id=?
    `).run(
      name, routeDate, startAddress, endAddress, city, state, radiusMiles,
      startTime, endTime, status, estimatedDriveTime, estimatedRouteDistance,
      googleMapsUrl, appleMapsUrl, notes, aiSummary, routeGoal, id
    );

    const route = db.prepare('SELECT * FROM route_plans WHERE id = ?').get(id) as Record<string, unknown>;
    const stops = (db.prepare('SELECT * FROM route_stops WHERE routePlanId = ? ORDER BY stopOrder ASC').all(id) as Record<string, unknown>[]).map(parseStop);
    return NextResponse.json({ ...route, stops });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

// DELETE /api/routes/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM route_plans WHERE id = ?').run(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
