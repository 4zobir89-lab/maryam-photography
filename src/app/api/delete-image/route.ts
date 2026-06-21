import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSession } from "@/lib/auth";

// POST /api/delete-image — delete image from Vercel Blob (admin only)
// Body: { url: string }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL مطلوب" },
        { status: 400 }
      );
    }

    // Only delete if it's a Vercel Blob URL (safety check)
    if (!url.includes("vercel-storage.com") && !url.includes("vercel.blob")) {
      // Not a blob URL, nothing to delete
      return NextResponse.json({ success: true, skipped: true });
    }

    await del(url);
    console.log("Deleted blob:", url);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete image error:", e);
    return NextResponse.json(
      { error: "فشل حذف الصورة" },
      { status: 500 }
    );
  }
}
