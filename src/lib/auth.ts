import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Use AUTH_SECRET if available, otherwise a fallback.
// We do NOT throw at module load — this would break every API route that
// imports auth.ts (including login) if AUTH_SECRET is temporarily missing.
// Instead we log a warning and use a fallback; JWT signing/verification will
// still work consistently within the same runtime.
const SECRET_STRING =
  process.env.AUTH_SECRET || "maryam-photography-dev-fallback-secret";
if (!process.env.AUTH_SECRET) {
  console.warn(
    "[auth] AUTH_SECRET is not set — using insecure fallback. " +
      "Set AUTH_SECRET in your Vercel dashboard for production."
  );
}
const SECRET = new TextEncoder().encode(SECRET_STRING);

const SESSION_COOKIE = "maryam_admin_session";
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

// NOTE: CSRF protection for admin mutations is mitigated via the
// httpOnly + sameSite=lax cookie settings on the session cookie. No custom
// CSRF token or X-Requested-With header check is enforced, because lax
// same-site prevents cross-site browsers from sending the cookie on
// state-changing cross-origin POST requests (the typical CSRF vector).

export interface SessionPayload {
  userId: string;
  username: string;
  name?: string;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await signSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;
