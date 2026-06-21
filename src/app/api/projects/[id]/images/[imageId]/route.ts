import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// Helper to delete blob if URL is a Vercel Blob URL
async function deleteBlobIfVercel(url: string) {
  if (url && url.includes("vercel-storage.com")) {
    try {
      await del(url);
    } catch (e) {
      console.error("Blob delete failed:", e);
    }
  }
}

// PATCH /api/projects/[id]/images/[imageId] — admin only, update caption/order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id, imageId } = await params;
    void id; // projectId not used in update — image has its own id
    const body = await req.json();
    const allowedFields = ["caption", "order"];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    const image = await db.projectImage.update({
      where: { id: parseInt(imageId) },
      data,
    });
    return NextResponse.json(image);
  } catch (e) {
    console.error("Update project image error:", e);
    return NextResponse.json({ error: "خطأ في التحديث" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/images/[imageId] — admin only
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { imageId } = await params;
    const image = await db.projectImage.findUnique({
      where: { id: parseInt(imageId) },
      select: { id: true, url: true },
    });
    if (!image) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    await db.projectImage.delete({ where: { id: parseInt(imageId) } });
    await deleteBlobIfVercel(image.url);

    await logActivity(
      "delete",
      "projectImage",
      String(image.id),
      `Deleted gallery image`,
      session.username
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete project image error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
