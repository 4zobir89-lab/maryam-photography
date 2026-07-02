import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { del } from "@vercel/blob";

// Delete blob only if URL is a Vercel Blob URL (non-blocking on failure)
async function deleteBlobIfVercel(url: string) {
  if (!url || !url.includes("vercel-storage.com")) return;
  try {
    await del(url);
  } catch (e) {
    console.error("Blob delete failed (non-blocking):", e);
  }
}

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
      "quoteAr", "nameAr", "roleAr", "roleEn", "rating",
      "avatar", "imageData", "order", "published",
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    // If imageData is being changed, delete the old blob from storage
    if (body.imageData !== undefined) {
      const existing = await db.testimonial.findUnique({
        where: { id: parseInt(id) },
        select: { imageData: true },
      });
      if (existing?.imageData && existing.imageData !== body.imageData) {
        await deleteBlobIfVercel(existing.imageData);
      }
    }

    const item = await db.testimonial.update({
      where: { id: parseInt(id) },
      data,
    });
    await logActivity(
      "update",
      "testimonial",
      String(item.id),
      `Updated testimonial from "${item.nameAr}"`,
      session.username
    );
    return NextResponse.json(item);
  } catch (e) {
    console.error("Update testimonial error:", e);
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
    const existing = await db.testimonial.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, nameAr: true, imageData: true },
    });
    await db.testimonial.delete({ where: { id: parseInt(id) } });

    // Delete image blob after successful DB delete
    if (existing?.imageData) {
      await deleteBlobIfVercel(existing.imageData);
    }

    await logActivity(
      "delete",
      "testimonial",
      String(id),
      `Deleted testimonial from "${existing?.nameAr ?? ""}"`,
      session.username
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete testimonial error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
