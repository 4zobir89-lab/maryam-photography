import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Navbar } from "@/components/sections/Navbar";
import { Footer } from "@/components/sections/Footer";
import { CursorGlow } from "@/components/shared/CursorGlow";
import { BlogShareButtons } from "@/components/blog/BlogShareButtons";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import type { Metadata } from "next";
import {
  Clock,
  Calendar,
  User,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Tag,
} from "lucide-react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://maryam-photography.vercel.app";

// ===== Static generation =====
export async function generateStaticParams() {
  try {
    const posts = await db.blogPost.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch (e) {
    console.error("generateStaticParams (blog) error:", e);
    return [];
  }
}

// ===== SEO metadata =====
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) {
      return { title: "مقال غير موجود | مدوّنة مريم" };
    }
    const description = post.excerptAr || post.titleAr;
    return {
      title: `${post.titleAr} | مدوّنة مريم`,
      description,
      authors: [{ name: post.author }],
      keywords: post.tags
        ? post.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined,
      openGraph: {
        title: post.titleAr,
        description,
        type: "article",
        publishedTime: new Date(post.createdAt).toISOString(),
        authors: [post.author],
        tags: post.tags
          ? post.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        images: post.coverImage
          ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.titleAr }]
          : undefined,
      },
      twitter: {
        card: post.coverImage ? "summary_large_image" : "summary",
        title: post.titleAr,
        description,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    };
  } catch (e) {
    console.error("generateMetadata (blog) error:", e);
    return { title: "مدوّنة مريم" };
  }
}

// ===== Category labels =====
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
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  category: string;
  tags: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  author: string;
  createdAt: Date | string;
};

async function fetchPost(slug: string): Promise<BlogPost | null> {
  try {
    const post = await db.blogPost.findUnique({ where: { slug } });
    if (!post || !post.published) return null;
    return post as BlogPost;
  } catch (e) {
    console.error("fetchPost error:", e);
    return null;
  }
}

async function fetchRelated(post: BlogPost): Promise<BlogPost[]> {
  try {
    const related = await db.blogPost.findMany({
      where: {
        published: true,
        category: post.category,
        slug: { not: post.slug },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
    });
    return related as BlogPost[];
  } catch (e) {
    console.error("fetchRelated error:", e);
    return [];
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPost(slug);
  if (!post) notFound();

  const related = await fetchRelated(post);
  const created = new Date(post.createdAt);
  const tags = post.tags
    ? post.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="relative min-h-screen flex flex-col bg-background">
      <CursorGlow />
      <Navbar />

      {/* JSON-LD Breadcrumb for this blog post */}
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: SITE_URL },
          { name: "المدوّنة", url: `${SITE_URL}/blog` },
          { name: post.titleAr, url: `${SITE_URL}/blog/${post.slug}` },
        ]}
      />

      {/* Cover image */}
      {post.coverImage && (
        <section className="relative w-full h-[50vh] md:h-[60vh] mt-16 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt={post.titleAr}
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </section>
      )}

      <article className="relative flex-1">
        {/* Header */}
        <header
          className={`relative ${
            post.coverImage ? "-mt-32 md:-mt-40" : "pt-32"
          } pb-10`}
        >
          <div className="container mx-auto max-w-3xl px-6 relative z-10">
            {/* Category + meta row */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
              <Link
                href={`/blog?category=${post.category}`}
                className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary px-3 py-1.5 rounded-full text-xs tracking-wide hover:bg-primary/20 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {categoryLabel(post.category)}
              </Link>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTime} دقائق قراءة
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(created, "d MMMM yyyy", { locale: ar })}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-amiri text-4xl md:text-6xl text-foreground leading-tight mb-4">
              <span className="text-gold-gradient">{post.titleAr}</span>
            </h1>
            {post.titleEn && (
              <p className="font-display text-lg md:text-xl text-muted-foreground italic mb-6">
                {post.titleEn}
              </p>
            )}

            {/* Excerpt */}
            {post.excerptAr && (
              <p className="text-lg text-muted-foreground leading-relaxed border-r-2 border-primary/40 pr-5 mb-6">
                {post.excerptAr}
              </p>
            )}

            {/* Author + share */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-foreground font-medium">
                    {post.author}
                  </div>
                  <div className="text-xs text-muted-foreground">كاتبة المقال</div>
                </div>
              </div>
              <BlogShareButtons title={post.titleAr} slug={post.slug} />
            </div>
          </div>
        </header>

        {/* Markdown content */}
        <section className="container mx-auto max-w-3xl px-6 pb-16">
          <div className="prose-content font-tajawal text-foreground/90 leading-loose text-lg space-y-6">
            <ReactMarkdown
              components={{
                // Headings
                h1: ({ children }) => (
                  <h2 className="font-amiri text-3xl md:text-4xl text-foreground mt-12 mb-4 first:mt-0">
                    {children}
                  </h2>
                ),
                h2: ({ children }) => (
                  <h2 className="font-amiri text-2xl md:text-3xl text-foreground mt-10 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-amiri text-xl md:text-2xl text-foreground mt-8 mb-2">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-amiri text-lg md:text-xl text-foreground mt-6 mb-2">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/85 leading-loose">{children}</p>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href?.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {children}
                  </a>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-foreground">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-muted-foreground">{children}</em>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pr-6 space-y-2 text-foreground/85">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pr-6 space-y-2 text-foreground/85">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li className="leading-loose">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-r-4 border-primary/50 bg-primary/5 pr-5 py-3 my-6 text-foreground/90 italic font-amiri text-xl">
                    {children}
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-background/60 border border-border/60 px-1.5 py-0.5 rounded text-sm text-primary font-inter" dir="ltr">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className} dir="ltr">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre
                    className="bg-background/80 border border-border/60 rounded-md p-4 overflow-x-auto text-sm font-inter"
                    dir="ltr"
                  >
                    {children}
                  </pre>
                ),
                hr: () => (
                  <div className="my-8">
                    <div className="hairline" />
                  </div>
                ),
                img: ({ src, alt }) =>
                  src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={typeof src === "string" ? src : ""}
                      alt={alt || ""}
                      loading="lazy"
                      decoding="async"
                      className="w-full rounded-md border border-border/60 my-6"
                    />
                  ) : null,
              }}
            >
              {post.contentAr || post.contentEn || ""}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-12 pt-8 border-t border-border/60">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground ml-1">الوسوم:</span>
              {tags.map((t, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-card border border-border/60 rounded-full text-xs text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Back to blog */}
          <div className="mt-12 pt-8 border-t border-border/60">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              العودة إلى كل المقالات
            </Link>
          </div>
        </section>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="container mx-auto max-w-7xl px-6 pb-24">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-amiri text-2xl text-foreground">مقالات ذات صلة</h2>
              <div className="flex-1 h-px hairline" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group block bg-card border border-border/60 rounded-sm overflow-hidden hover:border-primary/40 transition-all duration-500 lift-card"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[oklch(0.2_0.02_285)] to-[oklch(0.1_0.005_285)]">
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.coverImage}
                        alt={p.titleAr}
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
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 bg-background/80 backdrop-blur-sm border border-primary/30 text-primary px-2.5 py-1 rounded-full text-[10px]">
                        <Sparkles className="w-3 h-3" />
                        {categoryLabel(p.category)}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-background/80 backdrop-blur-sm border border-border/60 text-foreground/80 px-2.5 py-1 rounded-full text-[10px]">
                        <Clock className="w-3 h-3" />
                        {p.readTime} دقائق
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-display text-5xl text-primary/30 leading-none">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="font-amiri text-lg text-foreground leading-snug group-hover:text-gold-gradient transition-colors line-clamp-2">
                      {p.titleAr || p.titleEn}
                    </h3>
                    {p.excerptAr && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {p.excerptAr}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-[11px] text-primary pt-1">
                      اقرأ المقال
                      <ArrowLeft className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </main>
  );
}
