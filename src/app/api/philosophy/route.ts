import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { defaultPhilosophy } from "@/lib/defaultData";

export async function GET() {
  try {
    const items = await db.philosophyCard.findMany({
      orderBy: [{ order: "asc" }, { id: "asc" }],
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("Philosophy GET error, using defaults:", e);
    return NextResponse.json(defaultPhilosophy);
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const maxOrder = await db.philosophyCard.aggregate({ _max: { order: true } });
    const item = await db.philosophyCard.create({
      data: {
        icon: body.icon || "Camera",
        titleAr: body.titleAr || "",
        titleEn: body.titleEn || "",
        descAr: body.descAr || "",
        order: body.order ?? (maxOrder._max.order || 0) + 1,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("Create philosophy error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}
