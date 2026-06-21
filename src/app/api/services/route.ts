import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { defaultServices } from "@/lib/defaultData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeUnpublished = searchParams.get("all") === "1";
  if (includeUnpublished) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }
  try {
    const services = await db.service.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });
    return NextResponse.json(services);
  } catch (e) {
    console.error("Services GET error, using defaults:", e);
    return NextResponse.json(
      includeUnpublished ? defaultServices : defaultServices.filter((s) => s.published)
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const maxOrder = await db.service.aggregate({ _max: { order: true } });
    const service = await db.service.create({
      data: {
        titleAr: body.titleAr || "",
        titleEn: body.titleEn || "",
        description: body.description || "",
        price: body.price || "",
        duration: body.duration || "",
        features: body.features || "[]",
        icon: body.icon || "Camera",
        accentFrom: body.accentFrom || "oklch(0.78 0.13 75 / 0.15)",
        featured: body.featured || false,
        order: body.order ?? (maxOrder._max.order || 0) + 1,
        published: body.published ?? true,
      },
    });
    await logActivity(
      "create",
      "service",
      String(service.id),
      `Created service "${service.titleAr}"`,
      session.username
    );
    return NextResponse.json(service, { status: 201 });
  } catch (e) {
    console.error("Create service error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}
