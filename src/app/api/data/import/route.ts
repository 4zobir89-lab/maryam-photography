import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// POST /api/data/import — admin only
// Body: full JSON export document (from /api/data/export)
// Strategy: upsert settings, then replace all collection rows (delete-then-create inside transactions per table).
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "صيغة JSON غير صحيحة" }, { status: 400 });
    }

    const { settings, projects = [], services = [], testimonials = [], philosophy = [] } = body;

    // 1) Upsert settings (whitelist fields the API already supports)
    if (settings && typeof settings === "object") {
      const allowedFields = [
        "siteNameAr", "siteNameEn", "logoLetter", "taglineAr", "taglineEn",
        "heroTitleAr", "heroSubtitleEn", "heroDescAr", "heroCta1Ar", "heroCta2Ar",
        "heroStat1Num", "heroStat1Label", "heroStat2Num", "heroStat2Label",
        "heroStat3Num", "heroStat3Label", "marqueeWords",
        "aboutTitleAr", "aboutSubtitleEn", "aboutHeadingAr", "aboutPara1", "aboutPara2",
        "aboutTags", "aboutSignature", "aboutImageData", "heroImageData",
        "portfolioTitleAr", "portfolioSubtitleEn",
        "servicesTitleAr", "servicesSubtitleEn",
        "testimonialsTitleAr", "testimonialsSubtitleEn",
        "contactTitleAr", "contactSubtitleEn",
        "contactEmail", "contactPhone", "contactAddress",
        "contactInstagram", "contactWhatsapp",
        "footerDesc", "footerCopyright",
        "primaryColor", "backgroundColor",
      ];
      const settingsData: Record<string, unknown> = {};
      for (const f of allowedFields) {
        if (settings[f] !== undefined) settingsData[f] = settings[f];
      }
      await db.siteSettings.upsert({
        where: { id: 1 },
        update: settingsData,
        create: { id: 1, ...settingsData },
      });
    }

    // 2) Projects (+ nested gallery images) — replace all
    if (Array.isArray(projects)) {
      await db.$transaction([
        db.projectImage.deleteMany({}),
        db.project.deleteMany({}),
      ]);
      for (const p of projects) {
        const { images, id, createdAt, updatedAt, ...rest } = p;
        const created = await db.project.create({
          data: {
            titleAr: rest.titleAr ?? "",
            titleEn: rest.titleEn ?? "",
            category: rest.category ?? "weddings",
            year: rest.year ?? "2024",
            location: rest.location ?? "",
            description: rest.description ?? "",
            imageData: rest.imageData ?? "",
            palette1: rest.palette1 ?? "oklch(0.4 0.1 40)",
            palette2: rest.palette2 ?? "oklch(0.2 0.05 285)",
            palette3: rest.palette3 ?? "oklch(0.78 0.13 75)",
            motif: rest.motif ?? "bride",
            span: rest.span ?? "normal",
            featured: rest.featured ?? false,
            order: rest.order ?? 0,
            published: rest.published ?? true,
          },
        });
        if (Array.isArray(images)) {
          for (const img of images) {
            await db.projectImage.create({
              data: {
                projectId: created.id,
                url: img.url ?? "",
                caption: img.caption ?? "",
                order: img.order ?? 0,
              },
            });
          }
        }
      }
    }

    // 3) Services — replace all
    if (Array.isArray(services)) {
      await db.service.deleteMany({});
      for (const s of services) {
        await db.service.create({
          data: {
            titleAr: s.titleAr ?? "",
            titleEn: s.titleEn ?? "",
            description: s.description ?? "",
            price: s.price ?? "",
            duration: s.duration ?? "",
            features: s.features ?? "[]",
            icon: s.icon ?? "Camera",
            accentFrom: s.accentFrom ?? "oklch(0.78 0.13 75 / 0.15)",
            featured: s.featured ?? false,
            order: s.order ?? 0,
            published: s.published ?? true,
          },
        });
      }
    }

    // 4) Testimonials — replace all
    if (Array.isArray(testimonials)) {
      await db.testimonial.deleteMany({});
      for (const t of testimonials) {
        await db.testimonial.create({
          data: {
            quoteAr: t.quoteAr ?? "",
            nameAr: t.nameAr ?? "",
            roleAr: t.roleAr ?? "",
            roleEn: t.roleEn ?? "",
            rating: t.rating ?? 5,
            avatar: t.avatar ?? "",
            order: t.order ?? 0,
            published: t.published ?? true,
          },
        });
      }
    }

    // 5) Philosophy cards — replace all
    if (Array.isArray(philosophy)) {
      await db.philosophyCard.deleteMany({});
      for (const c of philosophy) {
        await db.philosophyCard.create({
          data: {
            icon: c.icon ?? "Camera",
            titleAr: c.titleAr ?? "",
            titleEn: c.titleEn ?? "",
            descAr: c.descAr ?? "",
            order: c.order ?? 0,
          },
        });
      }
    }

    await logActivity(
      "import",
      "data",
      "",
      `Imported ${projects.length} projects, ${services.length} services, ${testimonials.length} testimonials, ${philosophy.length} cards`,
      session.username
    );

    return NextResponse.json({
      success: true,
      counts: {
        projects: projects.length,
        services: services.length,
        testimonials: testimonials.length,
        philosophy: philosophy.length,
      },
    });
  } catch (e) {
    console.error("Import error:", e);
    const msg = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: `فشل استيراد البيانات: ${msg}` },
      { status: 500 }
    );
  }
}
