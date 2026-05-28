import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { ensureUserManagementSchema } from '@/lib/user-management';

function parseStop(row: Record<string, unknown>) {
  return {
    ...row,
    talkingPoints: (() => { try { return JSON.parse(row.talkingPoints as string || '[]'); } catch { return []; } })(),
    visitCompleted: row.visitCompleted === 1,
    skipped: row.skipped === 1,
  };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await ensureUserManagementSchema(sql);
    const [route] = await sql`SELECT * FROM route_plans WHERE id = ${Number(params.id)}`;
    if (!route) return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    const stops = await sql`SELECT * FROM route_stops WHERE route_plan_id = ${Number(params.id)} ORDER BY stop_order ASC` as Record<string, unknown>[];
    return NextResponse.json({ ...(route as Record<string, unknown>), stops: stops.map(parseStop) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch route' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await ensureUserManagementSchema(sql);
    const id = Number(params.id);
    const body = await req.json();
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const data = {
      name: body.name,
      routeDate: body.routeDate,
      startAddress: body.startAddress,
      endAddress: body.endAddress,
      city: body.city,
      state: body.state,
      radiusMiles: body.radiusMiles,
      startTime: body.startTime,
      endTime: body.endTime,
      status: body.status,
      estimatedDriveTime: body.estimatedDriveTime,
      estimatedRouteDistance: body.estimatedRouteDistance,
      googleMapsUrl: body.googleMapsUrl,
      appleMapsUrl: body.appleMapsUrl,
      notes: body.notes,
      aiSummary: body.aiSummary,
      routeGoal: body.routeGoal,
      assignedUserId: body.assignedUserId ?? null,
      updatedAt: ts,
    };
    await sql`UPDATE route_plans SET ${sql(data)} WHERE id = ${id}`;
    const [route] = await sql`SELECT * FROM route_plans WHERE id = ${id}` as Record<string, unknown>[];
    const stops = await sql`SELECT * FROM route_stops WHERE route_plan_id = ${id} ORDER BY stop_order ASC` as Record<string, unknown>[];
    return NextResponse.json({ ...route, stops: stops.map(parseStop) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update route' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const sql = getDb();
    await sql`DELETE FROM route_plans WHERE id = ${Number(params.id)}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}