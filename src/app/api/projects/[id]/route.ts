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
      "titleAr", "titleEn", "category", "year", "location", "description",
      "imageData", "palette1", "palette2", "palette3", "motif", "span",
      "featured", "order", "published",
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    // If imageData is changing, delete the old image from Blob (if it was a Vercel Blob URL)
    if (data.imageData !== undefined) {
      const existing = await db.project.findUnique({
        where: { id: parseInt(id) },
        select: { imageData: true, titleAr: true },
      });
      if (existing && existing.imageData && existing.imageData !== data.imageData) {
        await deleteBlobIfVercel(existing.imageData);
      }
    }

    const project = await db.project.update({
      where: { id: parseInt(id) },
      data,
    });
    await logActivity(
      "update",
      "project",
      String(project.id),
      `Updated project "${project.titleAr}"`,
      session.username
    );
    return NextResponse.json(project);
  } catch (e) {
    console.error("Update project error:", e);
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
    const projectId = parseInt(id);

    // Fetch project + gallery images BEFORE deleting (cascade will wipe ProjectImages rows)
    const existing = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, titleAr: true, imageData: true, images: { select: { url: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    await db.project.delete({ where: { id: projectId } });

    // Best-effort: delete main image and gallery images from Blob
    await deleteBlobIfVercel(existing.imageData);
    for (const img of existing.images) {
      await deleteBlobIfVercel(img.url);
    }

    await logActivity(
      "delete",
      "project",
      String(projectId),
      `Deleted project "${existing.titleAr}"`,
      session.username
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete project error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
