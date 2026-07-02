import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

const VALID_SERVICES = ["wedding", "portrait", "commercial", "workshop", "other"];

// POST — public, create a booking request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }
    if (!body.phone || typeof body.phone !== "string" || !body.phone.trim()) {
      return NextResponse.json({ error: "رقم الهاتف مطلوب" }, { status: 400 });
    }

    // Normalize service
    const service = VALID_SERVICES.includes(body.service)
      ? body.service
      : "other";

    // Parse preferred date (optional)
    let preferredDate: Date | null = null;
    if (body.preferredDate) {
      const d = new Date(body.preferredDate);
      if (!isNaN(d.getTime())) preferredDate = d;
    }

    // Rate limit: max 3 bookings per phone in 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
    try {
      const recent = await db.bookingRequest.findMany({
        where: {
          phone: (body.phone || "").trim(),
          createdAt: { gt: tenMinAgo },
        },
        select: { id: true },
      });
      if (recent.length >= 3) {
        return NextResponse.json(
          { error: "لقد أرسلت عدة طلبات حجز مؤخرًا. حاول مرة أخرى لاحقًا." },
          { status: 429 }
        );
      }
    } catch {
      // If DB query fails (e.g. table not yet created), proceed
    }

    const booking = await db.bookingRequest.create({
      data: {
        name: body.name.trim().slice(0, 200),
        email: (body.email || "").trim().slice(0, 200),
        phone: body.phone.trim().slice(0, 50),
        service,
        preferredDate,
        location: (body.location || "").trim().slice(0, 200),
        message: (body.message || "").trim().slice(0, 5000),
        status: "new",
      },
    });

    await logActivity(
      "create",
      "bookingRequest",
      String(booking.id),
      `New booking from "${booking.name}" (${booking.service})`,
      "public"
    );

    return NextResponse.json(
      { success: true, id: booking.id, service: booking.service, preferredDate: booking.preferredDate },
      { status: 201 }
    );
  } catch (e) {
    console.error("Booking POST error:", e);
    return NextResponse.json(
      { error: "فشل حفظ طلب الحجز" },
      { status: 500 }
    );
  }
}

// GET — admin only, returns all booking requests (optional ?status filter)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;

    const bookings = await db.bookingRequest.findMany({
      where: status && status !== "all" ? { status } : {},
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json(bookings);
  } catch (e) {
    console.error("Bookings GET error:", e);
    return NextResponse.json([]);
  }
}
