import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { defaultTestimonials } from "@/lib/defaultData";

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
    const items = await db.testimonial.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: [{ order: "asc" }, { id: "desc" }],
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("Testimonials GET error, using defaults:", e);
    return NextResponse.json(
      includeUnpublished ? defaultTestimonials : defaultTestimonials.filter((t) => t.published)
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
    const maxOrder = await db.testimonial.aggregate({ _max: { order: true } });
    const item = await db.testimonial.create({
      data: {
        quoteAr: body.quoteAr || "",
        nameAr: body.nameAr || "",
        roleAr: body.roleAr || "",
        roleEn: body.roleEn || "",
        rating: body.rating ?? 5,
        avatar: body.avatar || "",
        order: body.order ?? (maxOrder._max.order || 0) + 1,
        published: body.published ?? true,
      },
    });
    await logActivity(
      "create",
      "testimonial",
      String(item.id),
      `Created testimonial from "${item.nameAr}"`,
      session.username
    );
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("Create testimonial error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}
