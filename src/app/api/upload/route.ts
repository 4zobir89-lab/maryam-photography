import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

// Allow large body uploads (images up to 25MB)
export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/upload — upload image to Vercel Blob (admin only)
// Returns the public URL of the uploaded image
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "لم يتم إرسال ملف" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "الملف ليس صورة" },
        { status: 400 }
      );
    }

    // Allow up to 25MB (Vercel Blob limit on hobby plan)
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الصورة يجب أن يكون أقل من 25 ميجابايت" },
        { status: 400 }
      );
    }

    // Generate a unique filename with original extension
    const ext = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const pathname = `projects/${timestamp}-${random}.${ext}`;

    console.log(`Uploading image to Vercel Blob: ${pathname} (${file.size} bytes)`);

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
      contentType: file.type,
    });

    console.log("Upload successful:", blob.url);

    return NextResponse.json({
      success: true,
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
    });
  } catch (e) {
    console.error("Upload error:", e);
    const msg = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: `فشل رفع الصورة: ${msg}` },
      { status: 500 }
    );
  }
}
