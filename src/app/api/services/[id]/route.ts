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
    const allowedFields = [
      "titleAr", "titleEn", "description", "price", "duration",
      "features", "icon", "accentFrom", "featured", "order", "published",
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    const service = await db.service.update({
      where: { id: parseInt(id) },
      data,
    });
    await logActivity(
      "update",
      "service",
      String(service.id),
      `Updated service "${service.titleAr}"`,
      session.username
    );
    return NextResponse.json(service);
  } catch (e) {
    console.error("Update service error:", e);
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
    const existing = await db.service.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, titleAr: true },
    });
    await db.service.delete({ where: { id: parseInt(id) } });
    await logActivity(
      "delete",
      "service",
      String(id),
      `Deleted service "${existing?.titleAr ?? ""}"`,
      session.username
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete service error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
