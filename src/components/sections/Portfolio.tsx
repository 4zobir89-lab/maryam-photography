"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { MotifSvg } from "@/components/shared/MotifSvg";
import { useLang } from "@/components/shared/LanguageProvider";

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  category: string;
  year: string;
  location: string;
  description: string;
  imageData: string;
  palette1: string;
  palette2: string;
  palette3: string;
  motif: string;
  span: string;
  featured: boolean;
  published: boolean;
  order: number;
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

const categories = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "weddings", labelAr: "أعراس", labelEn: "Weddings" },
  { id: "portraits", labelAr: "بورتريه", labelEn: "Portraits" },
  { id: "culture", labelAr: "ثقافة", labelEn: "Culture" },
  { id: "landscapes", labelAr: "مناظر", labelEn: "Landscapes" },
];

function countFor(projects: Project[], catId: string) {
  if (catId === "all") return projects.length;
  return projects.filter((p) => p.category === catId).length;
}

export function Portfolio() {
  const { t, lang } = useLang();
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [loadingGallery, setLoadingGallery] = useState(false);

  const openProject = async (project: Project) => {
    setSelected(project);
    setCurrentImageIdx(0);
    setGalleryImages([]);
    const allImages: string[] = [];
    if (project.imageData) allImages.push(project.imageData);

    setLoadingGallery(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/images`);
      if (res.ok) {
        const imgs = await res.json();
        for (const img of imgs) {
          if (img.url && !allImages.includes(img.url)) {
            allImages.push(img.url);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    } finally {
      setLoadingGallery(false);
    }
    setGalleryImages(allImages);
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIdx((i) => (i + 1) % galleryImages.length);
  };
  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIdx(
      (i) => (i - 1 + galleryImages.length) % galleryImages.length
    );
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      else if (e.key === "ArrowLeft") nextImage();
      else if (e.key === "ArrowRight") prevImage();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, galleryImages.length]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paletteOf = (p: Project) =>
    [p.palette1, p.palette2, p.palette3].filter(Boolean);

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category === active);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  if (loading) {
    return (
      <section
        id="portfolio"
        className="relative py-28 md:py-40 bg-background overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-7 h-7 border border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="portfolio"
      dir="rtl"
      className="relative py-28 md:py-40 bg-background overflow-hidden"
    >
      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* === Editorial split header === */}
        <motion.div
          {...fade(0)}
          className="flex flex-col gap-4 mb-14 md:mb-20 max-w-3xl"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary/70" aria-hidden />
            <span className="eyebrow">
              {t("أعمال مختارة", "Selected Works")}
            </span>
          </div>
          <h2 className="section-title text-foreground">
            {t("معرض الأعمال", "Selected Works")}
          </h2>
          <p className="body-lg max-w-2xl pt-1">
            {t(
              "مجموعة مختارة من أعمالي عبر السنوات — كل صورة تحكي حكاية، وكل إطار يحفظ لحظة لا تتكرر.",
              "A curated selection of work across the years — each frame tells a story, each image preserves an unrepeatable moment."
            )}
          </p>
          <div className="hairline w-24 mt-2" />
        </motion.div>

        {/* === Filters — pill buttons, NOT rounded-full === */}
        <motion.div
          {...fade(0.05)}
          className="flex flex-wrap items-center gap-2 mb-12"
        >
          {categories.map((cat) => {
            const count = countFor(projects, cat.id);
            const isActive = active === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide border rounded-md transition-colors duration-300 motion-ease ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-border-strong hover:text-foreground"
                }`}
              >
                <span>{lang === "en" ? cat.labelEn : cat.labelAr}</span>
                <span
                  className={`font-inter text-[10px] tracking-widest leading-none px-1.5 py-0.5 rounded-sm ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {String(count).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* === Masonry grid === */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, idx) => {
                const cat = categories.find(
                  (c) => c.id === project.category
                );
                return (
                  <motion.button
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    onClick={() => openProject(project)}
                    className="group relative overflow-hidden bg-card border border-border/60 rounded-sm cursor-pointer mb-4 md:mb-6 break-inside-avoid w-full block text-right"
                  >
                    {/* Image — natural aspect ratio */}
                    <div className="relative overflow-hidden bg-card">
                      {project.imageData ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={project.imageData}
                          alt={project.titleAr}
                          loading={idx === 0 ? "eager" : "lazy"}
                          decoding="async"
                          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
                          style={{ transitionTimingFunction: "var(--ease)" }}
                        />
                      ) : (
                        <div className="aspect-[4/3]">
                          <MotifSvg
                            motif={project.motif}
                            palette={paletteOf(project)}
                          />
                        </div>
                      )}

                      {/* Subtle bottom-only gradient overlay (NOT full) */}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/15 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none"
                        style={{ transitionTimingFunction: "var(--ease)" }}
                      />
                    </div>

                    {/* Top-right index number */}
                    <span
                      aria-hidden
                      className="absolute top-3 right-3 font-inter text-[10px] tracking-[0.3em] text-primary/80"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>

                    {/* Caption */}
                    <div
                      className="absolute bottom-0 inset-x-0 p-4 md:p-5 transition-transform duration-500 group-hover:-translate-y-1"
                      style={{ transitionTimingFunction: "var(--ease)" }}
                    >
                      {/* Row 1: year (gold) + category (muted) */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="eyebrow text-[0.65rem]">
                          {project.year}
                        </span>
                        <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                          {cat?.labelEn}
                        </span>
                      </div>
                      {/* Row 2: title (amiri) + location (display small) */}
                      <h3 className="font-amiri text-xl md:text-2xl text-foreground leading-tight mb-1">
                        {project.titleAr}
                      </h3>
                      <p className="font-display text-xs tracking-wider text-muted-foreground">
                        {project.titleEn}
                        {project.location ? ` · ${project.location}` : ""}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-muted-foreground text-sm tracking-wide">
              {t(
                "لا توجد أعمال منشورة في هذه الفئة بعد.",
                "No published works in this category yet."
              )}
            </p>
          </div>
        )}

        {/* === Bottom CTA — outline button, links to /gallery === */}
        <motion.div
          {...fade(0.1)}
          className="mt-16 md:mt-20 flex justify-start"
        >
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-3 px-6 py-3 border border-border text-foreground text-sm font-medium tracking-wide hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md"
          >
            {t("استعرض المجموعة الكاملة", "View Full Gallery")}
            <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-ease" />
          </Link>
        </motion.div>
      </div>

      {/* === Lightbox — redesigned, cleaner === */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md flex flex-col"
          >
            {/* Top bar — category + counter + close */}
            <div className="flex items-center justify-between px-5 md:px-8 py-4 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="h-px w-6 bg-primary/70" aria-hidden />
                <span className="eyebrow text-[0.65rem]">
                  {
                    categories.find((c) => c.id === selected.category)
                      ?.labelEn
                  }
                </span>
                {galleryImages.length > 1 && (
                  <span className="font-inter text-xs text-muted-foreground tracking-widest">
                    {String(currentImageIdx + 1).padStart(2, "0")} /{" "}
                    {String(galleryImages.length).padStart(2, "0")}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 border border-border flex items-center justify-center text-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Main image area */}
            <div
              className="flex-1 flex items-center justify-center px-4 md:px-10 py-6 md:py-10 relative min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous — RTL aware (visual right) */}
              {galleryImages.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 border border-border bg-background/60 flex items-center justify-center text-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md z-10"
                  aria-label={t("السابق", "Previous")}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="relative max-w-6xl w-full flex items-center justify-center"
                >
                  {galleryImages[currentImageIdx] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={galleryImages[currentImageIdx]}
                      alt={selected.titleAr}
                      loading="eager"
                      decoding="async"
                      className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : !selected.imageData ? (
                    <div className="w-full max-w-2xl aspect-[4/3]">
                      <MotifSvg
                        motif={selected.motif}
                        palette={paletteOf(selected)}
                      />
                    </div>
                  ) : loadingGallery ? (
                    <div className="flex items-center justify-center h-40">
                      <div className="w-8 h-8 border border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* Next — RTL aware (visual left) */}
              {galleryImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 border border-border bg-background/60 flex items-center justify-center text-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md z-10"
                  aria-label={t("التالي", "Next")}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Bottom info panel — surface-card style */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="border-t border-border bg-card"
            >
              <div className="max-w-5xl mx-auto px-5 md:px-10 py-6 md:py-8 grid md:grid-cols-2 gap-6 md:gap-10 items-start">
                {/* Left: title + description */}
                <div className="text-right">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="eyebrow text-[0.65rem]">
                      {selected.year}
                    </span>
                    <span className="h-px w-6 bg-border" aria-hidden />
                    <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                      {
                        categories.find((c) => c.id === selected.category)
                          ?.labelEn
                      }
                    </span>
                  </div>
                  <h3 className="font-amiri text-3xl md:text-4xl text-foreground mb-2 leading-tight">
                    {selected.titleAr}
                  </h3>
                  <p className="font-display text-sm md:text-base text-muted-foreground tracking-wide mb-4">
                    {selected.titleEn}
                  </p>
                  <div className="hairline w-16 mr-auto mb-4" />
                  <p className="text-muted-foreground leading-loose text-sm md:text-[0.95rem]">
                    {selected.description ||
                      t(
                        `صورة من سلسلة ${
                          categories.find((c) => c.id === selected.category)
                            ?.labelAr || ""
                        } التقطتها مريم في ${selected.location}.`,
                        `A frame from the ${
                          categories.find((c) => c.id === selected.category)
                            ?.labelEn || ""
                        } series, captured by Maryam in ${selected.location}.`
                      )}
                  </p>
                </div>

                {/* Right: meta + thumbnails */}
                <div className="space-y-5">
                  <div className="flex items-center gap-8 text-sm">
                    <div>
                      <div className="font-inter text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-1">
                        {t("الموقع", "Location")}
                      </div>
                      <div className="font-amiri text-foreground text-base">
                        {selected.location}
                      </div>
                    </div>
                    <div>
                      <div className="font-inter text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-1">
                        {t("السنة", "Year")}
                      </div>
                      <div className="font-amiri text-foreground text-base">
                        {selected.year}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails strip — if multiple images */}
                  {galleryImages.length > 1 && (
                    <div>
                      <div className="font-inter text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">
                        {t("صور المعرض", "Gallery")} ({galleryImages.length})
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {galleryImages.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIdx(i)}
                            className={`flex-shrink-0 w-16 h-16 overflow-hidden border transition-all duration-300 motion-ease rounded-sm ${
                              i === currentImageIdx
                                ? "border-primary opacity-100"
                                : "border-border opacity-60 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={`صورة ${i + 1}`}
                              loading="lazy"
                              decoding="async"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
