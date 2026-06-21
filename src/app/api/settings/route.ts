import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { defaultSettings } from "@/lib/defaultData";

export async function GET() {
  // Public read — try DB first, fall back to defaults
  try {
    const settings = await db.siteSettings.findUnique({ where: { id: 1 } });
    if (settings) return NextResponse.json(settings);
    return NextResponse.json(defaultSettings);
  } catch (e) {
    console.error("Settings GET error (DB not available), using defaults:", e);
    return NextResponse.json(defaultSettings);
  }
}

export async function PUT(req: NextRequest) {
  // Admin only
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const allowedFields = [
      "siteNameAr", "siteNameEn", "logoLetter", "taglineAr", "taglineEn",
      "heroTitleAr", "heroSubtitleEn", "heroDescAr", "heroCta1Ar", "heroCta2Ar",
      "heroStat1Num", "heroStat1Label", "heroStat2Num", "heroStat2Label",
      "heroStat3Num", "heroStat3Label", "marqueeWords",
      "aboutTitleAr", "aboutSubtitleEn", "aboutHeadingAr", "aboutPara1", "aboutPara2",
      "aboutTags", "aboutSignature",
      "portfolioTitleAr", "portfolioSubtitleEn",
      "servicesTitleAr", "servicesSubtitleEn",
      "testimonialsTitleAr", "testimonialsSubtitleEn",
      "contactTitleAr", "contactSubtitleEn",
      "contactEmail", "contactPhone", "contactAddress",
      "contactInstagram", "contactWhatsapp",
      "footerDesc", "footerCopyright",
      "primaryColor", "backgroundColor",
      "aboutImageData", "heroImageData",
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    const updated = await db.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });
    await logActivity("update", "settings", "1", `Updated ${Object.keys(data).join(", ")}`, session.username);
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update settings error:", e);
    return NextResponse.json(
      { error: "خطأ في التحديث. تأكدي من إعداد قاعدة البيانات." },
      { status: 500 }
    );
  }
}

