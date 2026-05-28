import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb, { isNoDbMode } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { deleteMockUser, ensureUserManagementSchema, findMockUserById, findMockUserByUsername, updateMockUser } from '@/lib/user-management';

type UserRow = {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'member';
  active: number;
};

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    const body = await req.json() as {
      username?: string;
      fullName?: string;
      role?: 'admin' | 'member';
      active?: boolean;
      password?: string;
    };

    if (isNoDbMode) {
      const existing = findMockUserById(userId);
      if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      const username = (body.username ?? existing.username).trim().toLowerCase();
      const fullName = (body.fullName ?? existing.fullName).trim();
      const role: 'admin' | 'member' = body.role === 'admin' ? 'admin' : body.role === 'member' ? 'member' : existing.role;
      const active = typeof body.active === 'boolean' ? body.active : existing.active;

      if (!username || !fullName) {
        return NextResponse.json({ error: 'Name and username are required' }, { status: 400 });
      }

      const duplicate = findMockUserByUsername(username);
      if (duplicate && duplicate.id !== userId) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
      }

      let passwordHash: string | undefined;
      if (typeof body.password === 'string' && body.password.length > 0) {
        if (body.password.length < 8) {
          return NextResponse.json({ error: 'Password needs at least 8 characters' }, { status: 400 });
        }
        passwordHash = await bcrypt.hash(body.password, 10);
      }

      const updated = updateMockUser(userId, { username, fullName, role, active, passwordHash });
      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

      return NextResponse.json({
        id: updated.id,
        username: updated.username,
        fullName: updated.fullName,
        role: updated.role,
        active: updated.active,
      });
    }

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    const [existing] = await sql`SELECT id, username, full_name, role, active FROM app_users WHERE id = ${userId}` as UserRow[];
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const username = (body.username ?? existing.username).trim().toLowerCase();
    const fullName = (body.fullName ?? existing.fullName).trim();
    const role: 'admin' | 'member' = body.role === 'admin' ? 'admin' : body.role === 'member' ? 'member' : existing.role;
    const active = typeof body.active === 'boolean' ? (body.active ? 1 : 0) : existing.active;

    if (!username || !fullName) {
      return NextResponse.json({ error: 'Name and username are required' }, { status: 400 });
    }

    const duplicate = await sql`SELECT id FROM app_users WHERE username = ${username} AND id <> ${userId}` as Array<{ id: number }>;
    if (duplicate.length > 0) return NextResponse.json({ error: 'Username already exists' }, { status: 409 });

    const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
    await sql`UPDATE app_users SET username = ${username}, full_name = ${fullName}, role = ${role}, active = ${active}, updated_at = ${ts} WHERE id = ${userId}`;

    if (typeof body.password === 'string' && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: 'Password needs at least 8 characters' }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(body.password, 10);
      await sql`UPDATE app_users SET password_hash = ${passwordHash}, updated_at = ${ts} WHERE id = ${userId}`;
    }

    const [updated] = await sql`SELECT id, username, full_name, role, active FROM app_users WHERE id = ${userId}` as UserRow[];
    return NextResponse.json({
      id: updated.id,
      username: updated.username,
      fullName: updated.fullName,
      role: updated.role,
      active: updated.active === 1,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

  try {
    const userId = Number(params.id);
    if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });

    if (admin.userId !== null && admin.userId === userId) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    if (isNoDbMode) {
      const existing = findMockUserById(userId);
      if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const ok = deleteMockUser(userId);
      if (!ok) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      return NextResponse.json({ success: true });
    }

    const sql = getDb();
    await ensureUserManagementSchema(sql);

    const [existing] = await sql`SELECT id FROM app_users WHERE id = ${userId}` as Array<{ id: number }>;
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await sql.begin(async (tx) => {
      await tx`UPDATE leads SET assigned_user_id = NULL WHERE assigned_user_id = ${userId}`;
      await tx`UPDATE route_plans SET assigned_user_id = NULL WHERE assigned_user_id = ${userId}`;
      await tx`DELETE FROM app_users WHERE id = ${userId}`;
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
