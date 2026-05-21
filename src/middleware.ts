import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'cue_session';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login'];

// AUTH DISABLED FOR TESTING
// To re-enable: delete this function and uncomment the one below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function middleware(_req: NextRequest) {
  return NextResponse.next();
}

/* AUTH MIDDLEWARE — uncomment to restore login protection:
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
    return res;
  }
}
*/

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
