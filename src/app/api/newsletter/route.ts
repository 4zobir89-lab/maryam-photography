import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// Simple email format check — pragmatic, not RFC-exhaustive
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;

// POST — public, subscribe an email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "بريد إلكتروني غير صالح" },
        { status: 400 }
      );
    }

    try {
      await db.newsletterSubscriber.create({ data: { email } });
    } catch (e: unknown) {
      // P2002 = unique constraint violation → already subscribed (idempotent success)
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code?: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { success: true, alreadySubscribed: true },
          { status: 200 }
        );
      }
      throw e;
    }

    await logActivity(
      "create",
      "newsletterSubscriber",
      email,
      `New newsletter subscriber: ${email}`,
      "public"
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error("Newsletter POST error:", e);
    return NextResponse.json(
      { error: "فشل الاشتراك في النشرة البريدية" },
      { status: 500 }
    );
  }
}

// GET — admin only, returns all subscribers
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const subscribers = await db.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: 1000,
    });
    return NextResponse.json(subscribers);
  } catch (e) {
    console.error("Newsletter GET error:", e);
    return NextResponse.json([]);
  }
}
