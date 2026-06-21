import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// GET /api/projects/[id]/images — public, list gallery images for a project
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const images = await db.projectImage.findMany({
      where: { projectId: parseInt(id) },
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    return NextResponse.json(images);
  } catch (e) {
    console.error("Project images GET error:", e);
    return NextResponse.json([]);
  }
}

// POST /api/projects/[id]/images — admin only, add a gallery image
// Body: { url, caption?, order? }
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const projectId = parseInt(id);
    const body = await req.json();

    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "URL مطلوب" }, { status: 400 });
    }

    // Verify project exists
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, titleAr: true },
    });
    if (!project) {
      return NextResponse.json({ error: "المشروع غير موجود" }, { status: 404 });
    }

    const maxOrder = await db.projectImage.aggregate({
      where: { projectId },
      _max: { order: true },
    });

    const image = await db.projectImage.create({
      data: {
        projectId,
        url: body.url,
        caption: body.caption || "",
        order: body.order ?? (maxOrder._max.order || 0) + 1,
      },
    });

    await logActivity(
      "create",
      "projectImage",
      String(image.id),
      `Added gallery image to project "${project.titleAr}"`,
      session.username
    );
    return NextResponse.json(image, { status: 201 });
  } catch (e) {
    console.error("Create project image error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}
