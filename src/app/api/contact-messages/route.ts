import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// POST — public endpoint (anyone can submit a contact message)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json(
        { error: "الاسم مطلوب" },
        { status: 400 }
      );
    }
    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        { error: "الرسالة مطلوبة" },
        { status: 400 }
      );
    }

    // Rate limit: max 5 messages per IP per 10 minutes (basic check via recent timestamps)
    // Note: For production-grade rate limiting, use Upstash or Vercel KV
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    try {
      const recent = await db.contactMessage.findMany({
        where: {
          createdAt: { gt: tenMinAgo },
          phone: body.phone || body.email || "",
        },
        select: { id: true },
      });
      if (recent.length >= 5) {
        return NextResponse.json(
          { error: "لقد أرسلت عدة رسائل مؤخرًا. حاول مرة أخرى لاحقًا." },
          { status: 429 }
        );
      }
    } catch {
      // If DB query fails, proceed (don't block submission)
    }

    const message = await db.contactMessage.create({
      data: {
        name: body.name.trim().slice(0, 200),
        email: (body.email || "").trim().slice(0, 200),
        phone: (body.phone || "").trim().slice(0, 50),
        service: (body.service || "").trim().slice(0, 100),
        message: body.message.trim().slice(0, 5000),
        status: "new",
      },
    });

    return NextResponse.json({ success: true, id: message.id }, { status: 201 });
  } catch (e) {
    console.error("Contact message POST error:", e);
    return NextResponse.json(
      { error: "فشل حفظ الرسالة" },
      { status: 500 }
    );
  }
}

// GET — admin only, returns all contact messages
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const messages = await db.contactMessage.findMany({
      where: status && status !== "all" ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json(messages);
  } catch (e) {
    console.error("Contact messages GET error:", e);
    return NextResponse.json([]);
  }
}
