import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export const COOKIE_NAME = 'cue_session';

export type SessionRole = 'admin' | 'member';

export interface SessionUser {
  username: string;
  role: SessionRole;
  userId: number | null;
  name: string;
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret.length < 32) return null;

  try {
    const JWT_SECRET = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const username = typeof payload.sub === 'string' ? payload.sub : '';
    if (!username) return null;

    const role = payload.role === 'admin' ? 'admin' : 'member';
    const userId = typeof payload.uid === 'number' ? payload.uid : null;
    const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : username;

    return { username, role, userId, name };
  } catch {
    return null;
  }
}

export async function requireAdmin(req: NextRequest): Promise<SessionUser | null> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'admin') return null;
  return user;
}
