import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// Helper to delete blob if URL is a Vercel Blob URL
async function deleteBlobIfVercel(url: string) {
  if (url && url.includes("vercel-storage.com")) {
    try {
      await del(url);
    } catch (e) {
      console.error("Blob delete failed:", e);
    }
  }
}

// GET — public, return single post by slug
// If ?all=1, allow admin to fetch unpublished posts
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const includeUnpublished = searchParams.get("all") === "1";

  if (includeUnpublished) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  try {
    const post = await db.blogPost.findUnique({
      where: { slug },
    });
    if (!post) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    // If not admin-with-all and post is unpublished, treat as not found
    if (!includeUnpublished && !post.published) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (e) {
    console.error("Blog GET by slug error:", e);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

// PUT — admin only, update post
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { slug } = await params;
    const body = await req.json();

    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    const allowedFields = [
      "titleAr",
      "titleEn",
      "slug",
      "excerptAr",
      "excerptEn",
      "contentAr",
      "contentEn",
      "coverImage",
      "category",
      "tags",
      "readTime",
      "featured",
      "published",
      "author",
      "order",
    ];
    const data: Record<string, unknown> = {};
    for (const f of allowedFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }

    // If slug is being changed, ensure it's unique (excluding current post)
    if (data.slug !== undefined && data.slug !== existing.slug) {
      const newSlug = String(data.slug)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (newSlug) {
        // ensure uniqueness (excluding current id)
        let candidate = newSlug;
        let n = 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const conflict = await db.blogPost.findUnique({
            where: { slug: candidate },
            select: { id: true },
          });
          if (!conflict || conflict.id === existing.id) break;
          n += 1;
          candidate = `${newSlug}-${n}`;
        }
        data.slug = candidate;
      } else {
        delete data.slug; // don't update slug if empty
      }
    }

    // If coverImage is changing, delete the old image from Blob
    if (data.coverImage !== undefined && existing.coverImage && existing.coverImage !== data.coverImage) {
      await deleteBlobIfVercel(existing.coverImage);
    }

    const updated = await db.blogPost.update({
      where: { id: existing.id },
      data,
    });

    await logActivity(
      "update",
      "blogPost",
      String(updated.id),
      `Updated blog post "${updated.titleAr}"`,
      session.username
    );

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update blog post error:", e);
    return NextResponse.json({ error: "خطأ في التحديث" }, { status: 500 });
  }
}

// DELETE — admin only, delete post
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { slug } = await params;
    const existing = await db.blogPost.findUnique({
      where: { slug },
      select: { id: true, titleAr: true, coverImage: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    await db.blogPost.delete({ where: { id: existing.id } });

    // Best-effort: delete cover image from Blob
    await deleteBlobIfVercel(existing.coverImage);

    await logActivity(
      "delete",
      "blogPost",
      String(existing.id),
      `Deleted blog post "${existing.titleAr}"`,
      session.username
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Delete blog post error:", e);
    return NextResponse.json({ error: "خطأ في الحذف" }, { status: 500 });
  }
}
