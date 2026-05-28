import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import getDb from '@/lib/db';
import { ensureUserManagementSchema } from '@/lib/user-management';

const COOKIE_NAME = 'cue_session';

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
// Note: resets per serverless instance; provides basic brute-force protection.
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.length < 32) {
      console.error('JWT_SECRET is missing or too short (minimum 32 characters)');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { username, password } = await req.json() as { username?: string; password?: string };

    let authUser: { username: string; role: 'admin' | 'member'; userId: number | null; name: string } | null = null;

    try {
      const sql = getDb();
      await ensureUserManagementSchema(sql);
      const [user] = await sql`
        SELECT id, username, full_name, role, password_hash, active
        FROM app_users
        WHERE username = ${String(username || '').trim().toLowerCase()}
        LIMIT 1
      ` as Array<{ id: number; username: string; fullName: string; role: string; passwordHash: string; active: number }>;

      if (user && user.active === 1) {
        const passwordMatch = await bcrypt.compare(password ?? '', user.passwordHash);
        if (passwordMatch) {
          authUser = {
            username: user.username,
            role: user.role === 'admin' ? 'admin' : 'member',
            userId: user.id,
            name: user.fullName || user.username,
          };
        }
      }
    } catch {
      // Fallback to env credentials when user table is unavailable.
    }

    if (!authUser) {
      const validUsername = process.env.AUTH_USERNAME;
      const passwordHash = process.env.AUTH_PASSWORD_HASH;

      if (!validUsername || !passwordHash) {
        return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
      }

      const usernameMatch = String(username || '') === validUsername;
      const passwordMatch = await bcrypt.compare(password ?? '', passwordHash);

      if (!usernameMatch || !passwordMatch) {
        return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
      }

      authUser = {
        username: validUsername,
        role: 'admin',
        userId: null,
        name: validUsername,
      };
    }

    const JWT_SECRET = new TextEncoder().encode(jwtSecret);
    const token = await new SignJWT({
      sub: authUser.username,
      role: authUser.role,
      uid: authUser.userId,
      name: authUser.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
