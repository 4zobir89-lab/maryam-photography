import { db } from "@/lib/db";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  PenSquare,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Arabic labels for the 5 blog categories
const categories: { id: string; labelAr: string }[] = [
  { id: "general", labelAr: "عام" },
  { id: "tutorials", labelAr: "شروحات" },
  { id: "stories", labelAr: "قصص" },
  { id: "gear", labelAr: "العتاد" },
  { id: "behind-the-scenes", labelAr: "كواليس" },
];

function categoryLabel(id: string): string {
  return categories.find((c) => c.id === id)?.labelAr ?? id;
}

type BlogPost = {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerptAr: string;
  coverImage: string;
  category: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  author: string;
  createdAt: Date | string;
};

async function fetchPosts(category: string | null): Promise<{
  featured: BlogPost[];
  posts: BlogPost[];
}> {
  try {
    const where: { published: boolean; category?: string } = { published: true };
    if (category) where.category = category;

    const all = await db.blogPost.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 60,
    });

    const featured = all.filter((p) => p.featured).slice(0, 3);
    const posts = all;
    return { featured, posts };
  } catch (e) {
    console.error("Blog page fetch error:", e);
    return { featured: [], posts: [] };
  }
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const created = new Date(post.createdAt);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/40 transition-all duration-500 lift-card"
    >
      {/* Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.02_285)] to-[oklch(0.1_0.005_285)]">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.titleAr}
            loading="lazy"
            decoding="async"
            width={1600}
            height={1000}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.04 285), oklch(0.14 0.01 75))",
            }}
          />
        )}
        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-primary/30 text-primary px-2.5 py-1 rounded-full text-[10px] tracking-wide font-medium">
            <Sparkles className="w-3 h-3" />
            {categoryLabel(post.category)}
          </span>
        </div>
        {/* Read time */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border/60 text-foreground/80 px-2.5 py-1 rounded-full text-[10px]">
            <Clock className="w-3 h-3" />
            {post.readTime} دقائق
          </span>
        </div>
        {/* Number badge for visual interest */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="font-display text-5xl text-primary/30 leading-none">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      {/* Body */}
      <div className="p-5 space-y-3">
        <h3 className="font-amiri text-xl text-foreground leading-snug group-hover:text-gold-gradient transition-colors line-clamp-2">
          {post.titleAr || post.titleEn}
        </h3>
        {post.excerptAr && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {post.excerptAr}
          </p>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {format(created, "d MMMM yyyy", { locale: ar })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            اقرأ المقال
            <ArrowLeft className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category && categories.find((c) => c.id === sp.category)
    ? sp.category
    : null;
  const { featured, posts } = await fetchPosts(category);

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <CursorGlow />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Decorative bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-7xl px-6 relative z-10 text-center">
          <div className="font-inter text-[10px] tracking-[0.5em] text-primary uppercase mb-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-primary/40" />
            Maryam&apos;s Journal
            <span className="w-8 h-px bg-primary/40" />
          </div>
          <h1 className="font-amiri text-5xl md:text-7xl text-foreground mb-4 leading-tight">
            <span className="text-gold-gradient">مدوّنة</span> مريم
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            خواطر فنية، شروحات تقنية، قصص من خلف العدسة، ولمسات من كواليس
            الجلسات. هنا أكتب عن كل ما يخص عالم التصوير.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 mt-6">
            <PenSquare className="w-3.5 h-3.5" />
            <span>كلمات من قلب العدسة</span>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="container mx-auto max-w-7xl px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/blog"
            className={`px-4 py-2 rounded-full text-sm transition-all border ${
              !category
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            الكل
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/blog?category=${c.id}`}
              className={`px-4 py-2 rounded-full text-sm transition-all border ${
                category === c.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.labelAr}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured posts (only on "all" view) */}
      {!category && featured.length > 0 && (
        <section className="container mx-auto max-w-7xl px-6 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="font-amiri text-2xl text-foreground">مقالات مميزة</h2>
            <div className="flex-1 h-px hairline" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All posts grid */}
      <section className="container mx-auto max-w-7xl px-6 pb-24 flex-1">
        <div className="flex items-center gap-3 mb-8">
          <h2 className="font-amiri text-2xl text-foreground">
            {category ? `مقالات: ${categoryLabel(category)}` : "كل المقالات"}
          </h2>
          <div className="flex-1 h-px hairline" />
          <span className="text-xs text-muted-foreground">
            {posts.length} مقال
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <PenSquare className="w-6 h-6 text-primary/60" />
            </div>
            <p className="font-amiri text-xl text-foreground mb-2">
              لا توجد مقالات بعد
            </p>
            <p className="text-sm text-muted-foreground">
              عُودي قريباً لمقالات جديدة من مريم.{" "}
              {category && "جرّبي فئة أخرى من الأعلى."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
