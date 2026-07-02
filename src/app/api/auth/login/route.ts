import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import bcrypt from "bcryptjs";

// ===== Rate limiting (in-memory, per IP) =====
// NOTE: This does NOT persist across Vercel serverless cold starts; for
// production-grade rate limiting use Upstash Redis or similar.
const RATE_LIMIT_MAX = 5; // max attempts
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
let rateLimitCleanupCounter = 0;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function rateLimitCheck(ip: string): { allowed: boolean; retryAfterSec: number } {
  // Periodic cleanup: prune expired entries every 100 requests
  rateLimitCleanupCounter++;
  if (rateLimitCleanupCounter >= 100) {
    rateLimitCleanupCounter = 0;
    const now = Date.now();
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key);
    }
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true, retryAfterSec: 0 };
}

export async function POST(req: NextRequest) {
  // ===== Rate limit check =====
  const ip = getClientIp(req);
  const rl = rateLimitCheck(ip);
  if (!rl.allowed) {
    const minutes = Math.ceil(rl.retryAfterSec / 60);
    return NextResponse.json(
      { error: `محاولات كثيرة فاشلة. حاول مرة أخرى بعد ${minutes} دقيقة.` },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      }
    );
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase();

    let admin: {
      id: string;
      username: string;
      name: string | null;
      password: string;
    } | null = null;
    let dbAvailable = true;

    // Try DB — admin must exist in DB to log in (no hardcoded fallback).
    try {
      admin = await db.adminUser.findUnique({
        where: { username: normalizedUsername },
      });
    } catch (dbErr) {
      dbAvailable = false;
      console.error("DB unavailable during login:", dbErr);
    }

    // Verify password (only if admin row was found)
    if (admin) {
      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) admin = null;
    }

    if (!admin) {
      // Log failed login attempt. If DB is down, log to console only — do NOT
      // reveal whether DB is down (return the same Arabic error either way).
      if (dbAvailable) {
        try {
          await logActivity(
            "login_failed",
            "admin",
            "",
            `Failed login for ${normalizedUsername}`,
            "system"
          );
        } catch (e) {
          console.error("Failed to log login_failed activity:", e);
        }
      } else {
        console.warn(
          `Login failed (DB unavailable) for username: ${normalizedUsername} from IP: ${ip}`
        );
      }
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    await setSessionCookie({
      userId: admin.id,
      username: admin.username,
      name: admin.name || undefined,
    });

    try {
      await logActivity(
        "login_success",
        "admin",
        admin.id,
        `Successful login for ${admin.username}`,
        admin.username
      );
    } catch (e) {
      console.error("Failed to log login_success activity:", e);
    }

    return NextResponse.json({
      success: true,
      user: { username: admin.username, name: admin.name },
    });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
