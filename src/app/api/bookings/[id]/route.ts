import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

const VALID_STATUSES = ["new", "confirmed", "completed", "cancelled"];

// PATCH — admin only, update status (and optionally other fields)
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (typeof body.status === "string") {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "حالة غير صالحة" },
          { status: 400 }
        );
      }
      data.status = body.status;
    }
    if (typeof body.name === "string") data.name = body.name.slice(0, 200);
    if (typeof body.email === "string") data.email = body.email.slice(0, 200);
    if (typeof body.phone === "string") data.phone = body.phone.slice(0, 50);
    if (typeof body.location === "string") data.location = body.location.slice(0, 200);
    if (typeof body.message === "string") data.message = body.message.slice(0, 5000);

    const updated = await db.bookingRequest.update({
      where: { id: idNum },
      data,
    });

    await logActivity(
      "update",
      "bookingRequest",
      String(idNum),
      `Status → ${body.status || "(no change)"}`,
      session.username
    );

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Booking PATCH error:", e);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

// DELETE — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    // Fetch the booking first (so we can log its name)
    const existing = await db.bookingRequest.findUnique({
      where: { id: idNum },
      select: { id: true, name: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    await db.bookingRequest.delete({ where: { id: idNum } });

    await logActivity(
      "delete",
      "bookingRequest",
      String(idNum),
      `Deleted booking from "${existing.name}"`,
      session.username
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Booking DELETE error:", e);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
