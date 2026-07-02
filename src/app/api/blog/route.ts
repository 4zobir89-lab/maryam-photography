import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

// ===== Helpers =====

// Generate a URL-safe slug from an English title
function generateSlug(titleEn: string): string {
  return (titleEn || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric (keep spaces + dashes)
    .replace(/[\s_-]+/g, "-") // collapse spaces/underscores/dashes to single dash
    .replace(/^-+|-+$/g, ""); // trim leading/trailing dashes
}

// Calculate reading time (in minutes) from Arabic content
function calcReadTime(contentAr: string): number {
  const words = (contentAr || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

// Ensure a slug is unique by appending -2, -3, ... if needed
async function ensureUniqueSlug(slug: string, excludeId?: number): Promise<string> {
  let candidate = slug || "post";
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await db.blogPost.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || (excludeId !== undefined && existing.id === excludeId)) {
      return candidate;
    }
    n += 1;
    candidate = `${slug}-${n}`;
  }
}

// GET — public, returns published posts only
// Query params:
//   ?all=1       — admin only, returns ALL posts (including unpublished)
//   ?category=X  — filter by category
//   ?featured=1  — featured posts only
//   ?limit=N     — limit (default 50)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeUnpublished = searchParams.get("all") === "1";
  const category = searchParams.get("category");
  const featuredOnly = searchParams.get("featured") === "1";
  const limitParam = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 50;

  // If admin requesting all (including unpublished), check session
  if (includeUnpublished) {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  try {
    const where: Record<string, unknown> = {};
    if (!includeUnpublished) where.published = true;
    if (category) where.category = category;
    if (featuredOnly) where.featured = true;

    const posts = await db.blogPost.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
    return NextResponse.json(posts);
  } catch (e) {
    console.error("Blog GET error:", e);
    return NextResponse.json([]);
  }
}

// POST — admin only, create a new blog post
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await req.json();

    if (!body.titleAr || !String(body.titleAr).trim()) {
      return NextResponse.json(
        { error: "العنوان بالعربية مطلوب" },
        { status: 400 }
      );
    }
    if (!body.titleEn || !String(body.titleEn).trim()) {
      return NextResponse.json(
        { error: "العنوان بالإنجليزية مطلوب" },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    let slug = body.slug && String(body.slug).trim()
      ? generateSlug(String(body.slug))
      : generateSlug(String(body.titleEn));
    slug = await ensureUniqueSlug(slug);

    // Auto-calculate readTime from contentAr if not provided
    const readTime =
      typeof body.readTime === "number" && body.readTime > 0
        ? body.readTime
        : calcReadTime(String(body.contentAr || ""));

    const maxOrder = await db.blogPost.aggregate({ _max: { order: true } });

    const post = await db.blogPost.create({
      data: {
        titleAr: String(body.titleAr).trim(),
        titleEn: String(body.titleEn).trim(),
        slug,
        excerptAr: body.excerptAr || "",
        excerptEn: body.excerptEn || "",
        contentAr: body.contentAr || "",
        contentEn: body.contentEn || "",
        coverImage: body.coverImage || "",
        category: body.category || "general",
        tags: body.tags || "",
        readTime,
        featured: body.featured || false,
        published: body.published ?? true,
        author: body.author || "Maryam",
        order: body.order ?? (maxOrder._max.order || 0) + 1,
      },
    });

    await logActivity(
      "create",
      "blogPost",
      String(post.id),
      `Created blog post "${post.titleAr}"`,
      session.username
    );

    return NextResponse.json(post, { status: 201 });
  } catch (e) {
    console.error("Create blog post error:", e);
    return NextResponse.json({ error: "خطأ في الإنشاء" }, { status: 500 });
  }
}