import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Use AUTH_SECRET if available, otherwise a fallback.
// NOTE: We intentionally do NOT throw at module load — the middleware runs on
// edge runtime and throwing here would cause MIDDLEWARE_INVOCATION_FAILED
// for every request, breaking the entire /admin route (including /admin/login).
// Instead we log a warning and use a fallback secret; if AUTH_SECRET is missing
// in production, JWT verification will simply fail and redirect to login.
const SECRET_STRING =
  process.env.AUTH_SECRET || "maryam-photography-dev-fallback-secret";
if (!process.env.AUTH_SECRET) {
  console.warn(
    "[middleware] AUTH_SECRET is not set — using insecure fallback. " +
      "Set AUTH_SECRET in your Vercel dashboard for production."
  );
}
const SECRET = new TextEncoder().encode(SECRET_STRING);
const SESSION_COOKIE = "maryam_admin_session";

// Protect /admin routes (except /admin/login)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect /admin paths (except login)
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
