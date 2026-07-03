"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Columns3,
  ArrowUpDown,
  Sparkles,
  Images,
} from "lucide-react";
import { MotifSvg } from "@/components/shared/MotifSvg";
import { useLang } from "@/components/shared/LanguageProvider";

export type GalleryImage = {
  id: string;
  url: string;
  titleAr: string;
  titleEn: string;
  category: string;
  year: string;
  location: string;
  description: string;
  motif: string;
  palette: string[];
  featured: boolean;
  createdAt: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

const categories = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "weddings", labelAr: "أعراس", labelEn: "Weddings" },
  { id: "portraits", labelAr: "بورتريه", labelEn: "Portraits" },
  { id: "culture", labelAr: "ثقافة", labelEn: "Culture" },
  { id: "landscapes", labelAr: "مناظر", labelEn: "Landscapes" },
];

const sortOptions = [
  { id: "newest", labelAr: "الأحدث", labelEn: "Newest" },
  { id: "oldest", labelAr: "الأقدم", labelEn: "Oldest" },
  { id: "featured", labelAr: "المميزة أولاً", labelEn: "Featured first" },
];

export function GalleryClient({
  images,
  projectCount,
}: {
  images: GalleryImage[];
  projectCount: number;
}) {
  const { t } = useLang();
  const [category, setCategory] = useState("all");
  const [layout, setLayout] = useState<"masonry" | "grid">("masonry");
  const [sort, setSort] = useState("newest");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let arr = images;
    if (category !== "all") {
      arr = arr.filter((img) => img.category === category);
    }
    arr = [...arr];
    if (sort === "newest") {
      arr.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sort === "oldest") {
      arr.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } else if (sort === "featured") {
      arr.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return arr;
  }, [images, category, sort]);

  const closeLightbox = useCallback(() => setActiveIdx(null), []);
  const nextImage = useCallback(() => {
    setActiveIdx((i) => (i === null ? i : (i + 1) % filtered.length));
  }, [filtered.length]);
  const prevImage = useCallback(() => {
    setActiveIdx((i) =>
      i === null ? i : (i - 1 + filtered.length) % filtered.length
    );
  }, [filtered.length]);

  // Keyboard navigation while lightbox is open
  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") nextImage();
      else if (e.key === "ArrowRight") prevImage();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIdx, closeLightbox, nextImage, prevImage]);

  const active = activeIdx !== null ? filtered[activeIdx] : null;

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
              <span className="eyebrow">FULL GALLERY</span>
            </div>
            <h1 className="section-title mb-8">
              <span className="text-foreground">المعرض</span>{" "}
              <span className="text-gold-gradient">الكامل</span>
            </h1>
            <p className="body-lg mb-6">
              {t(
                "تجميعة شاملة لأعمالي — أغلفة المشاريع وصور المعرض الإضافية في مكان واحد. استعرض بالفلاتر، بدّل بين التخطيط المتعرّج والشبكي، وافتح أي صورة لرؤيتها بملء الشاشة.",
                "A complete archive of my work — project covers and additional gallery images in one place. Filter, toggle between masonry and grid, and open any image to view it full-screen."
              )}
            </p>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Images className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
              <span dir="rtl">
                {images.length} {t("صورة في", "images in")} {projectCount}{" "}
                {t("مشروع", "projects")}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="pb-8 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Category pills */}
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-4 py-2 text-sm transition-all duration-300 motion-ease rounded-md ${
                    category === c.id
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {t(c.labelAr, c.labelEn)}
                </button>
              ))}
            </div>

            {/* Layout toggle + sort */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 p-1 border border-border rounded-md">
                <button
                  onClick={() => setLayout("masonry")}
                  aria-label={t("تخطيط متعرّج", "Masonry layout")}
                  className={`p-1.5 rounded-sm transition-colors ${
                    layout === "masonry"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Columns3 className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  aria-label={t("تخطيط شبكي", "Grid layout")}
                  className={`p-1.5 rounded-sm transition-colors ${
                    layout === "grid"
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="relative">
                <ArrowUpDown
                  className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={1.5}
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-card border border-border rounded-md pl-3 pr-9 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  {sortOptions.map((s) => (
                    <option key={s.id} value={s.id} className="bg-card">
                      {t(s.labelAr, s.labelEn)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Count hairline */}
          <div className="flex items-center gap-3 mt-8">
            <h2 className="font-amiri text-2xl text-foreground">
              {category === "all"
                ? t("كل الصور", "All Images")
                : t(
                    categories.find((c) => c.id === category)?.labelAr || "",
                    categories.find((c) => c.id === category)?.labelEn || ""
                  )}
            </h2>
            <span className="flex-1 h-px hairline" />
            <span
              className="text-xs text-muted-foreground font-inter"
              dir="ltr"
            >
              {filtered.length} / {images.length}
            </span>
          </div>
        </div>
      </section>

      {/* Gallery grid / masonry */}
      <section className="pb-28 md:pb-40 bg-background flex-1">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {filtered.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-amiri text-xl text-foreground mb-2">
                {t(
                  "لا توجد صور في هذه الفئة",
                  "No images in this category"
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("جرّب فئة أخرى من الأعلى.", "Try another category above.")}
              </p>
            </div>
          ) : layout === "masonry" ? (
            <motion.div
              layout
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]"
            >
              {filtered.map((img, i) => (
                <GalleryThumb
                  key={img.id}
                  img={img}
                  index={i}
                  onClick={() => setActiveIdx(i)}
                  variant="masonry"
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filtered.map((img, i) => (
                <GalleryThumb
                  key={img.id}
                  img={img}
                  index={i}
                  onClick={() => setActiveIdx(i)}
                  variant="grid"
                />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[80] bg-background flex flex-col"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="eyebrow">
                  {categories.find((c) => c.id === active.category)?.labelEn ||
                    active.category}{" "}
                  · {active.year}
                </span>
                {filtered.length > 1 && (
                  <span
                    className="text-xs text-muted-foreground font-inter"
                    dir="ltr"
                  >
                    {activeIdx + 1} / {filtered.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeLightbox}
                className="w-9 h-9 flex items-center justify-center border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Main image */}
            <div
              className="flex-1 flex items-center justify-center p-5 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {filtered.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-border bg-background/60 hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label={t("السابق", "Previous")}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="relative max-w-6xl w-full flex items-center justify-center"
                >
                  {active.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={active.url}
                      alt={active.titleAr}
                      loading="eager"
                      decoding="async"
                      className="max-w-full max-h-[72vh] w-auto h-auto object-contain"
                    />
                  ) : (
                    <div className="w-full max-w-2xl aspect-[4/3]">
                      <MotifSvg motif={active.motif} palette={active.palette} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {filtered.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-border bg-background/60 hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label={t("التالي", "Next")}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Info panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="border-t border-border bg-card p-6 md:p-10"
            >
              <div className="max-w-4xl mx-auto text-right">
                <div className="flex items-center gap-3 mb-3 eyebrow">
                  {active.featured && (
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                  {categories.find((c) => c.id === active.category)?.labelEn ||
                    active.category}{" "}
                  · {active.year}
                </div>
                <h3 className="font-amiri text-3xl md:text-4xl text-foreground mb-2">
                  {active.titleAr}
                </h3>
                <p className="font-display text-base text-muted-foreground tracking-wider mb-4">
                  {active.titleEn}
                  {active.location ? ` · ${active.location}` : ""}
                </p>
                <div className="hairline w-16 mb-4 mr-auto" />
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-2xl mr-auto">
                  {active.description ||
                    t(
                      `صورة من سلسلة ${
                        categories.find((c) => c.id === active.category)
                          ?.labelAr || ""
                      }.`,
                      `From the ${active.category} series.`
                    )}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryThumb({
  img,
  index,
  onClick,
  variant,
}: {
  img: GalleryImage;
  index: number;
  onClick: () => void;
  variant: "masonry" | "grid";
}) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.01, 0.2),
        ease: EASE,
      }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-card border border-border cursor-pointer break-inside-avoid w-full block lift-card ${
        variant === "masonry" ? "mb-4 md:mb-6" : ""
      } ${variant === "grid" ? "aspect-square" : ""}`}
    >
      {img.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={img.url}
          alt={img.titleAr}
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-auto block ${
            variant === "grid" ? "h-full object-cover" : ""
          } transition-transform duration-700 group-hover:scale-[1.03] motion-ease`}
        />
      ) : (
        <div className={variant === "grid" ? "w-full h-full" : "aspect-[4/3]"}>
          <MotifSvg motif={img.motif} palette={img.palette} />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-right">
        <div className="flex items-center justify-between mb-1.5">
          <span className="eyebrow">{img.year}</span>
          {img.featured && (
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={1.5} />
          )}
        </div>
        <h3 className="font-amiri text-lg md:text-xl text-foreground mb-0.5 line-clamp-1">
          {img.titleAr}
        </h3>
        {img.location && (
          <p className="font-display text-[10px] tracking-wider text-muted-foreground line-clamp-1">
            {img.location}
          </p>
        )}
      </div>
    </motion.button>
  );
}
