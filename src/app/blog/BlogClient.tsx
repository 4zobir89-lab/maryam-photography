"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Clock, PenSquare } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLang } from "@/components/shared/LanguageProvider";

const EASE = [0.22, 0.61, 0.36, 1] as const;

const categories = [
  { id: "general", labelAr: "عام", labelEn: "General" },
  { id: "tutorials", labelAr: "شروحات", labelEn: "Tutorials" },
  { id: "stories", labelAr: "قصص", labelEn: "Stories" },
  { id: "gear", labelAr: "العتاد", labelEn: "Gear" },
  { id: "behind-the-scenes", labelAr: "كواليس", labelEn: "Behind the Scenes" },
];

type BlogPost = {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerptAr: string;
  excerptEn: string;
  coverImage: string;
  category: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  author: string;
  createdAt: Date | string;
};

export function BlogClient({
  posts,
  activeCategory,
}: {
  posts: BlogPost[];
  activeCategory: string | null;
}) {
  const { t } = useLang();
  const featured = posts.filter((p) => p.featured).slice(0, 3);
  const showFeatured = !activeCategory && featured.length > 0;

  return (
    <>
      {/* Hero — editorial left-aligned header */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-primary/60" />
              <span className="eyebrow">JOURNAL</span>
            </div>
            <h1 className="section-title mb-8">
              <span className="text-foreground">مدوّنة</span>{" "}
              <span className="text-gold-gradient">مريم</span>
            </h1>
            <p className="body-lg">
              {t(
                "خواطر فنية، شروحات تقنية، وقصص من خلف العدسة. هنا أكتب عن كل ما يخص عالم التصوير.",
                "Artistic musings, technical tutorials, and stories from behind the lens."
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter + grid */}
      <section className="pb-28 md:pb-40 bg-background flex-1">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex flex-wrap items-center gap-2 mb-12"
          >
            <Link
              href="/blog"
              className={`px-4 py-2 text-sm transition-all duration-300 motion-ease rounded-md ${
                !activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {t("الكل", "All")}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/blog?category=${c.id}`}
                className={`px-4 py-2 text-sm transition-all duration-300 motion-ease rounded-md ${
                  activeCategory === c.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {t(c.labelAr, c.labelEn)}
              </Link>
            ))}
          </motion.div>

          {/* Featured strip (only on "all") */}
          {showFeatured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
              className="mb-16"
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="eyebrow">{t("مقالات مميزة", "Featured")}</span>
                <span className="flex-1 h-px hairline" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((p, i) => (
                  <PostCard key={p.id} post={p} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Section heading */}
          <div className="flex items-center gap-3 mb-8">
            <h2 className="font-amiri text-2xl text-foreground">
              {activeCategory
                ? t(
                    categories.find((c) => c.id === activeCategory)?.labelAr ||
                      "مقالات",
                    categories.find((c) => c.id === activeCategory)?.labelEn ||
                      "Articles"
                  )
                : t("كل المقالات", "All Articles")}
            </h2>
            <span className="flex-1 h-px hairline" />
            <span className="text-xs text-muted-foreground font-inter" dir="ltr">
              {posts.length} {t("مقال", "posts")}
            </span>
          </div>

          {/* Posts grid / empty state */}
          {posts.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-amiri text-xl text-foreground mb-2">
                {t("لا توجد مقالات بعد", "No articles yet")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  "عُودي قريباً لمقالات جديدة من مريم.",
                  "Check back soon for new articles from Maryam."
                )}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p, i) => (
                <PostCard key={p.id} post={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PostCard({ post, index }: { post: BlogPost; index: number }) {
  const { t } = useLang();
  const created = new Date(post.createdAt);
  const cat = categories.find((c) => c.id === post.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.3), ease: EASE }}
      className="h-full"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group surface-card lift-card flex flex-col overflow-hidden h-full"
      >
        {/* Cover */}
        <div className="relative aspect-[4/3] overflow-hidden bg-card">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.titleAr}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-ease"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(22% 0.02 285), oklch(14% 0.01 75))",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <PenSquare
                  className="w-8 h-8 text-primary/30"
                  strokeWidth={1}
                />
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <span className="eyebrow">
              {cat ? t(cat.labelAr, cat.labelEn) : post.category}
            </span>
            <span
              className="text-[11px] text-muted-foreground font-inter"
              dir="ltr"
            >
              {format(created, "d MMM yyyy", { locale: ar })}
            </span>
          </div>

          <h3 className="font-amiri text-xl text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {post.titleAr || post.titleEn}
          </h3>

          {post.excerptAr && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {post.excerptAr}
            </p>
          )}

          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-primary">
              {t("اقرأ المزيد", "Read more")}
              <ArrowLeft
                className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"
                strokeWidth={1.5}
              />
            </span>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="w-3 h-3" strokeWidth={1.5} />
              {post.readTime} {t("د", "min")}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
