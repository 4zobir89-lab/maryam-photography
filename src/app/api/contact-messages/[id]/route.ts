import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

// PATCH — admin only, update status
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
    const allowedFields = ["status"];
    const data: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in body) data[key] = body[key];
    }

    const updated = await db.contactMessage.update({
      where: { id: idNum },
      data,
    });

    await logActivity(
      "update",
      "contactMessage",
      String(idNum),
      `Status → ${body.status}`,
      session.username
    );

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Contact message PATCH error:", e);
    return NextResponse.json({ error: "فشل التحديث" }, { status: 500 });
  }
}

// DELETE — admin only
export async function DELETE(req: NextRequest, { params }: Params) {
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

    await db.contactMessage.delete({ where: { id: idNum } });

    await logActivity(
      "delete",
      "contactMessage",
      String(idNum),
      "Deleted contact message",
      session.username
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Contact message DELETE error:", e);
    return NextResponse.json({ error: "فشل الحذف" }, { status: 500 });
  }
}
