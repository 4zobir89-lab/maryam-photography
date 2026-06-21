import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/activity — admin only, returns last 20 activity logs (newest first)
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return NextResponse.json(logs);
  } catch (e) {
    console.error("Activity GET error:", e);
    return NextResponse.json([]);
  }
}
