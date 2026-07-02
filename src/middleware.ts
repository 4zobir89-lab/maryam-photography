import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// AUTH_SECRET must be set — no insecure fallback. The app will fail to start
// (module load) if it is missing, which is the desired behavior.
const SECRET_STRING = process.env.AUTH_SECRET;
if (!SECRET_STRING) {
  throw new Error(
    "AUTH_SECRET environment variable is required. Set it in your .env file or Vercel dashboard."
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
