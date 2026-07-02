"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, LayoutGrid, Columns3, ArrowUpDown, Sparkles, ImageIcon } from "lucide-react";
import { MotifSvg } from "@/components/shared/MotifSvg";

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

const categories = [
  { id: "all", labelAr: "الكل" },
  { id: "weddings", labelAr: "أعراس" },
  { id: "portraits", labelAr: "بورتريه" },
  { id: "culture", labelAr: "ثقافة" },
  { id: "landscapes", labelAr: "مناظر" },
];

const categoryLabelsEn: Record<string, string> = {
  all: "All",
  weddings: "Weddings",
  portraits: "Portraits",
  culture: "Culture",
  landscapes: "Landscapes",
};

const sortOptions = [
  { id: "newest", labelAr: "الأحدث" },
  { id: "oldest", labelAr: "الأقدم" },
  { id: "featured", labelAr: "المميزة أولاً" },
];

export function GalleryClient({ images }: { images: GalleryImage[] }) {
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
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "oldest") {
      arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === "featured") {
      arr.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return arr;
  }, [images, category, sort]);

  const closeLightbox = useCallback(() => setActiveIdx(null), []);
  const nextImage = useCallback(() => {
    setActiveIdx((i) =>
      i === null ? i : (i + 1) % filtered.length
    );
  }, [filtered.length]);
  const prevImage = useCallback(() => {
    setActiveIdx((i) =>
      i === null ? i : (i - 1 + filtered.length) % filtered.length
    );
  }, [filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") nextImage();
      else if (e.key === "ArrowRight") prevImage();
    };
    window.addEventListener("keydown", onKey);
    // Lock body scroll while lightbox is open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [activeIdx, closeLightbox, nextImage, prevImage]);

  const active = activeIdx !== null ? filtered[activeIdx] : null;

  return (
    <>
      {/* Filter bar */}
      <section className="container mx-auto max-w-7xl px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all border ${
                  category === c.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {c.labelAr}
              </button>
            ))}
          </div>

          {/* Layout + sort */}
          <div className="flex items-center gap-3">
            {/* Layout toggle */}
            <div className="flex items-center gap-1 p-1 bg-card border border-border/60 rounded-full">
              <button
                onClick={() => setLayout("masonry")}
                aria-label="تخطيط متعرّج"
                className={`p-1.5 rounded-full transition-colors ${
                  layout === "masonry"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayout("grid")}
                aria-label="تخطيط شبكي"
                className={`p-1.5 rounded-full transition-colors ${
                  layout === "grid"
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-card border border-border/60 rounded-full pl-4 pr-9 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
              >
                {sortOptions.map((s) => (
                  <option key={s.id} value={s.id} className="bg-card">
                    {s.labelAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center gap-3 mt-6">
          <h2 className="font-amiri text-2xl text-foreground">
            {category === "all" ? "كل الصور" : categories.find((c) => c.id === category)?.labelAr}
          </h2>
          <div className="flex-1 h-px hairline" />
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5" />
            {filtered.length} صورة
          </span>
        </div>
      </section>

      {/* Gallery */}
      <section className="container mx-auto max-w-7xl px-6 pb-24 flex-1">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-primary/60" />
            </div>
            <p className="font-amiri text-xl text-foreground mb-2">
              لا توجد صور في هذه الفئة
            </p>
            <p className="text-sm text-muted-foreground">
              جرّب فئة أخرى من الأعلى.
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
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {active && activeIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-2xl flex flex-col"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-background to-transparent">
              <div className="flex items-center gap-3">
                <span className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase">
                  {categoryLabelsEn[active.category] || active.category} · {active.year}
                </span>
                <span className="text-xs text-muted-foreground">
                  {activeIdx + 1} / {filtered.length}
                </span>
              </div>
              <button
                onClick={closeLightbox}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main image */}
            <div
              className="flex-1 flex items-center justify-center p-4 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev */}
              {filtered.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 border border-border backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-w-6xl w-full flex items-center justify-center"
                >
                  {active.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={active.url}
                      alt={active.titleAr}
                      loading="eager"
                      decoding="async"
                      className="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-md shadow-2xl"
                    />
                  ) : (
                    <div className="w-full max-w-2xl aspect-[4/3]">
                      <MotifSvg motif={active.motif} palette={active.palette} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Next */}
              {filtered.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 border border-border backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Info panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="border-t border-border bg-card/60 backdrop-blur p-6 md:p-10"
            >
              <div className="max-w-4xl mx-auto text-right">
                <div className="flex items-center gap-3 mb-3 text-[10px] tracking-[0.4em] text-primary uppercase font-inter">
                  {active.featured && (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {categoryLabelsEn[active.category] || active.category} · {active.year}
                </div>
                <h3 className="font-amiri text-3xl md:text-5xl text-foreground mb-2">
                  {active.titleAr}
                </h3>
                <p className="font-display text-base md:text-lg text-muted-foreground tracking-wider mb-4">
                  {active.titleEn}
                  {active.location ? ` · ${active.location}` : ""}
                </p>
                <div className="hairline w-16 mb-4 mr-auto" />
                <p className="text-muted-foreground leading-loose text-sm md:text-base max-w-2xl mr-auto">
                  {active.description ||
                    `صورة من سلسلة ${
                      categories.find((c) => c.id === active.category)?.labelAr || ""
                    } التقطتها مريم${active.location ? ` في ${active.location}` : ""}.`}
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
      transition={{ duration: 0.4, delay: Math.min(index * 0.01, 0.2) }}
      onClick={onClick}
      className={`group relative overflow-hidden bg-card border border-border/40 rounded-sm cursor-pointer break-inside-avoid w-full block ${
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
          } group-hover:scale-105 transition-transform duration-700`}
        />
      ) : (
        <div className={variant === "grid" ? "w-full h-full" : "aspect-[4/3]"}>
          <MotifSvg motif={img.motif} palette={img.palette} />
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

      {/* Caption */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-right transform translate-y-0 group-hover:translate-y-[-4px] transition-transform duration-500">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-inter text-[9px] tracking-[0.3em] text-primary uppercase">
            {img.year}
          </span>
          {img.featured && (
            <Sparkles className="w-3 h-3 text-primary" />
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
