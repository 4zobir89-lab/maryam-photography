import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const allowedFields = ["icon", "titleAr", "titleEn", "descAr", "order"];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    const item = await db.philosophyCard.update({
      where: { id: parseInt(id) },
      data,
    });
    await logActivity(
      "update",
      "philosophy",
      String(item.id),
      `Updated philosophy card "${item.titleAr}"`,
      session.username
    );
    return NextResponse.json(item);
  } catch (e) {
    console.error("Update philosophy error:", e);
    return NextResponse.json({ error: "خطأ في التحديث" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const existing = await db.philosophyCard.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, titleAr: true },
    });
    await db.philosophyCard.delete({ where: { id: parseInt(id) } });
    await logActivity(
      "delete",
      "philosophy",
      String(id),
      `Deleted philosophy card "${existing?.titleAr ?? ""}"`,
      session.username
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete philosophy error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
