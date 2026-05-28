import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb, { isNoDbMode } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { createMockUser, ensureUserManagementSchema, findMockUserByUsername, listMockUsers } from '@/lib/user-management';

type UserRow = {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'member';
  active: number;
  leadCount?: number;
  routeCount?: number;
};

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    if (isNoDbMode) {
      return NextResponse.json(listMockUsers());
    }

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    const rows = await sql`
      SELECT
        u.id,
        u.username,
        u.full_name,
        u.role,
        u.active,
        COALESCE((SELECT COUNT(*) FROM leads l WHERE l.assigned_user_id = u.id), 0) AS lead_count,
        COALESCE((SELECT COUNT(*) FROM route_plans r WHERE r.assigned_user_id = u.id), 0) AS route_count
      FROM app_users u
      ORDER BY u.role DESC, u.full_name ASC, u.username ASC
    ` as UserRow[];

    return NextResponse.json(rows.map((row) => ({
      id: row.id,
      username: row.username,
      fullName: row.fullName,
      role: row.role,
      active: row.active === 1,
      leadCount: Number(row.leadCount || 0),
      routeCount: Number(row.routeCount || 0),
    })));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const body = await req.json() as {
      username?: string;
      fullName?: string;
      role?: 'admin' | 'member';
      password?: string;
    };

    const username = (body.username || '').trim().toLowerCase();
    const fullName = (body.fullName || '').trim();
    const password = body.password || '';
    const role: 'admin' | 'member' = body.role === 'admin' ? 'admin' : 'member';

    if (!username || !fullName || password.length < 8) {
      return NextResponse.json({ error: 'Name, username, and password are required. Password needs at least 8 characters.' }, { status: 400 });
    }

    if (isNoDbMode) {
      const existing = findMockUserByUsername(username);
      if (existing) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const created = createMockUser({ username, fullName, role, passwordHash });
      return NextResponse.json({
        id: created.id,
        username: created.username,
        fullName: created.fullName,
        role: created.role,
        active: created.active,
        leadCount: 0,
        routeCount: 0,
      }, { status: 201 });
    }

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    const existing = await sql`SELECT id FROM app_users WHERE username = ${username}` as Array<{ id: number }>;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);

    const [created] = await sql`
      INSERT INTO app_users (username, full_name, role, password_hash, active, created_at, updated_at)
      VALUES (${username}, ${fullName}, ${role}, ${passwordHash}, 1, ${ts}, ${ts})
      RETURNING id, username, full_name, role, active
    ` as UserRow[];

    return NextResponse.json({
      id: created.id,
      username: created.username,
      fullName: created.fullName,
      role: created.role,
      active: created.active === 1,
      leadCount: 0,
      routeCount: 0,
    }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
