import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { ensureUserManagementSchema } from '@/lib/user-management';

type LeadAssignmentRow = { id: number; businessName: string; leadStatus: string };
type RouteAssignmentRow = { id: number; name: string; routeDate: string; status: string };

function toNumberList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item));
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    const leads = await sql`
      SELECT id, business_name, lead_status
      FROM leads
      WHERE assigned_user_id = ${userId}
      ORDER BY business_name ASC
      LIMIT 2000
    ` as LeadAssignmentRow[];

    const routes = await sql`
      SELECT id, name, route_date, status
      FROM route_plans
      WHERE assigned_user_id = ${userId}
      ORDER BY updated_at DESC
      LIMIT 2000
    ` as RouteAssignmentRow[];

    return NextResponse.json({ leads, routes });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const body = await req.json() as { leadIds?: unknown; routeIds?: unknown };
    const leadIds = toNumberList(body.leadIds);
    const routeIds = toNumberList(body.routeIds);

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    await sql.begin(async (tx) => {
      await tx`UPDATE leads SET assigned_user_id = NULL WHERE assigned_user_id = ${userId}`;
      await tx`UPDATE route_plans SET assigned_user_id = NULL WHERE assigned_user_id = ${userId}`;

      if (leadIds.length > 0) {
        await tx`UPDATE leads SET assigned_user_id = ${userId} WHERE id = ANY(${leadIds})`;
      }

      if (routeIds.length > 0) {
        await tx`UPDATE route_plans SET assigned_user_id = ${userId} WHERE id = ANY(${routeIds})`;
      }
    });

    return NextResponse.json({ success: true, leadCount: leadIds.length, routeCount: routeIds.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update assignments' }, { status: 500 });
  }
}
