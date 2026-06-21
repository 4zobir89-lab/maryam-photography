import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/data/export — admin only
// Returns the entire CMS content as a single JSON document.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const [settings, projects, services, testimonials, philosophy] = await Promise.all([
      db.siteSettings.findUnique({ where: { id: 1 } }),
      db.project.findMany({
        include: { images: { orderBy: [{ order: "asc" }, { id: "asc" }] } },
        orderBy: [{ order: "asc" }, { id: "desc" }],
      }),
      db.service.findMany({ orderBy: [{ order: "asc" }, { id: "desc" }] }),
      db.testimonial.findMany({ orderBy: [{ order: "asc" }, { id: "desc" }] }),
      db.philosophyCard.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] }),
    ]);

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      version: 1,
      settings: settings || null,
      projects,
      services,
      testimonials,
      philosophy,
    });
  } catch (e) {
    console.error("Export error:", e);
    return NextResponse.json(
      { error: "فشل تصدير البيانات" },
      { status: 500 }
    );
  }
}
