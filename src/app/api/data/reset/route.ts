import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import {
  defaultSettings,
  defaultPhilosophy,
  defaultProjects,
  defaultServices,
  defaultTestimonials,
} from "@/lib/defaultData";

// POST /api/data/reset — admin only
// Wipes ALL CMS data and re-seeds with the defaults from src/lib/defaultData.ts
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    // 1) Reset settings to defaults (upsert row id=1)
    const settingsData: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(defaultSettings)) {
      if (k === "id") continue;
      settingsData[k] = v;
    }
    await db.siteSettings.upsert({
      where: { id: 1 },
      update: settingsData,
      create: { id: 1, ...settingsData },
    });

    // 2) Projects (+ images) — wipe & re-seed
    await db.$transaction([
      db.projectImage.deleteMany({}),
      db.project.deleteMany({}),
    ]);
    for (const p of defaultProjects) {
      await db.project.create({
        data: {
          titleAr: p.titleAr,
          titleEn: p.titleEn,
          category: p.category,
          year: p.year,
          location: p.location,
          description: p.description,
          imageData: p.imageData,
          palette1: p.palette1,
          palette2: p.palette2,
          palette3: p.palette3,
          motif: p.motif,
          span: p.span,
          featured: p.featured,
          order: p.order,
          published: p.published,
        },
      });
    }

    // 3) Services — wipe & re-seed
    await db.service.deleteMany({});
    for (const s of defaultServices) {
      await db.service.create({
        data: {
          titleAr: s.titleAr,
          titleEn: s.titleEn,
          description: s.description,
          price: s.price,
          duration: s.duration,
          features: s.features,
          icon: s.icon,
          accentFrom: s.accentFrom,
          featured: s.featured,
          order: s.order,
          published: s.published,
        },
      });
    }

    // 4) Testimonials — wipe & re-seed
    await db.testimonial.deleteMany({});
    for (const t of defaultTestimonials) {
      await db.testimonial.create({
        data: {
          quoteAr: t.quoteAr,
          nameAr: t.nameAr,
          roleAr: t.roleAr,
          roleEn: t.roleEn,
          rating: t.rating,
          avatar: t.avatar,
          order: t.order,
          published: t.published,
        },
      });
    }

    // 5) Philosophy cards — wipe & re-seed
    await db.philosophyCard.deleteMany({});
    for (const c of defaultPhilosophy) {
      await db.philosophyCard.create({
        data: {
          icon: c.icon,
          titleAr: c.titleAr,
          titleEn: c.titleEn,
          descAr: c.descAr,
          order: c.order,
        },
      });
    }

    await logActivity(
      "reset",
      "data",
      "",
      "Reset all CMS data to defaults",
      session.username
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Reset error:", e);
    return NextResponse.json(
      { error: "فشل إعادة التعيين" },
      { status: 500 }
    );
  }
}
