import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { defaultProjects } from "@/lib/defaultData";

// GET — public, returns published projects
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeUnpublished = searchParams.get("all") === "1";

  // If admin requesting all (including unpublished), check session
  if (includeUnpublished) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  try {
    const projects = await db.project.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });
    return NextResponse.json(projects);
  } catch (e) {
    console.error("Projects GET error, using defaults:", e);
    return NextResponse.json(
      includeUnpublished ? defaultProjects : defaultProjects.filter((p) => p.published)
    );
  }
}

// POST — admin only, create new project
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const maxOrder = await db.project.aggregate({ _max: { order: true } });
    const project = await db.project.create({
      data: {
        titleAr: body.titleAr || "",
        titleEn: body.titleEn || "",
        category: body.category || "weddings",
        year: body.year || "2024",
        location: body.location || "",
        description: body.description || "",
        imageData: body.imageData || "",
        palette1: body.palette1 || "oklch(0.4 0.1 40)",
        palette2: body.palette2 || "oklch(0.2 0.05 285)",
        palette3: body.palette3 || "oklch(0.78 0.13 75)",
        motif: body.motif || "bride",
        span: body.span || "normal",
        featured: body.featured || false,
        order: body.order ?? (maxOrder._max.order || 0) + 1,
        published: body.published ?? true,
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (e) {
    console.error("Create project error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}
