"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  featured: boolean;
};

const categories = [
  { id: "all", labelAr: "الكل", labelEn: "All" },
  { id: "weddings", labelAr: "أعراس", labelEn: "Weddings" },
  { id: "portraits", labelAr: "بورتريه", labelEn: "Portraits" },
  { id: "culture", labelAr: "ثقافة", labelEn: "Culture" },
  { id: "landscapes", labelAr: "مناظر", labelEn: "Landscapes" },
];

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

export function Portfolio() {
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const { t } = useLang();

  const openProject = useCallback(async (project: Project) => {
    setSelected(project);
    setCurrentIdx(0);
    const all: string[] = [];
    if (project.imageData) all.push(project.imageData);
    try {
      const res = await fetch(`/api/projects/${project.id}/images`);
      if (res.ok) {
        const imgs = await res.json();
        for (const img of imgs) {
          if (img.url && !all.includes(img.url)) all.push(img.url);
        }
      }
    } catch {}
    setGalleryImages(all);
  }, []);

  const next = useCallback(() => {
    if (galleryImages.length > 1) {
      setCurrentIdx((i) => (i + 1) % galleryImages.length);
    }
  }, [galleryImages.length]);

  const prev = useCallback(() => {
    if (galleryImages.length > 1) {
      setCurrentIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length);
    }
  }, [galleryImages.length]);

  // Keyboard nav + body scroll lock while lightbox open
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      else if (e.key === "ArrowLeft") next();
      else if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, next, prev]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="portfolio" className="py-24 md:py-36 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  const paletteOf = (p: Project) =>
    [p.palette1, p.palette2, p.palette3].filter(Boolean);
  const filtered =
    active === "all" ? projects : projects.filter((p) => p.category === active);

  const categoryLabel = (cat: string) => {
    const c = categories.find((x) => x.id === cat);
    return c ? t(c.labelAr, c.labelEn) : cat;
  };

  return (
    <section
      id="portfolio"
      className="relative py-24 md:py-36 bg-background overflow-hidden"
    >
      {/* Ambient decorations */}
      <div className="absolute top-1/3 left-0 w-[440px] h-[440px] rounded-full bg-primary/[0.04] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[380px] h-[380px] rounded-full bg-accent/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Eyebrow with line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-4 flex items-center gap-4"
        >
          <span className="w-12 h-px bg-primary/40" />
          <span className="eyebrow">{t("Selected Works", "Selected Works")}</span>
        </motion.div>

        {/* Section title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="section-title mb-12"
        >
          <span className="text-foreground">معرض</span>{" "}
          <span className="text-gold-gradient">الأعمال</span>
        </motion.h2>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          className="flex flex-wrap gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-inter tracking-[0.15em] uppercase transition-all duration-300 motion-ease ${
                active === cat.id
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {t(cat.labelAr, cat.labelEn)}
            </button>
          ))}
        </motion.div>

        {/* Masonry grid */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.button
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, delay: (i % 6) * 0.05, ease: EASE }}
                  onClick={() => openProject(project)}
                  className="group relative w-full block mb-5 break-inside-avoid overflow-hidden rounded-2xl bg-card text-right"
                >
                  {project.imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageData}
                      alt={project.titleAr}
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                      className="w-full h-auto block image-luxury"
                    />
                  ) : (
                    <div className="aspect-[4/3]">
                      <MotifSvg motif={project.motif} palette={paletteOf(project)} />
                    </div>
                  )}

                  {/* Caption gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-95 transition-opacity duration-500 pointer-events-none" />

                  {/* Caption */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-right">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-white/60">
                        {project.year}
                      </span>
                      {project.featured && (
                        <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-primary">
                          ★ Featured
                        </span>
                      )}
                    </div>
                    <h3 className="font-amiri text-xl text-white mb-1">
                      {project.titleAr}
                    </h3>
                    <p className="font-inter text-[10px] tracking-[0.25em] uppercase text-white/55">
                      {categoryLabel(project.category)}
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد أعمال بعد.", "No works yet.")}
          </div>
        )}
      </div>

      {/* Lightbox — fullscreen with glass-dark top bar + thumbnail strip */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md flex flex-col"
          >
            {/* Top bar — glass-dark */}
            <div
              className="glass-dark text-white px-6 py-4 flex items-center justify-between gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-inter text-[10px] tracking-[0.25em] uppercase text-primary shrink-0">
                  {categoryLabel(selected.category)}
                </span>
                <span className="w-8 h-px bg-white/20 shrink-0 hidden sm:block" />
                <span className="font-amiri text-base text-white/90 truncate">
                  {selected.titleAr}
                </span>
              </div>
              {galleryImages.length > 1 && (
                <span
                  className="font-inter text-xs text-white/60 shrink-0"
                  dir="ltr"
                >
                  {currentIdx + 1} / {galleryImages.length}
                </span>
              )}
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-white/15 hover:border-primary hover:text-primary transition-colors shrink-0"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Image area with prev/next */}
            <div
              className="flex-1 flex items-center justify-center p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.length > 1 && (
                <button
                  onClick={prev}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full glass-dark text-white hover:text-primary transition-colors z-10"
                  aria-label={t("السابق", "Previous")}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="max-w-4xl w-full"
                >
                  {galleryImages[currentIdx] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={galleryImages[currentIdx]}
                      alt={selected.titleAr}
                      className="w-full max-h-[64vh] object-contain rounded-lg"
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {galleryImages.length > 1 && (
                <button
                  onClick={next}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full glass-dark text-white hover:text-primary transition-colors z-10"
                  aria-label={t("التالي", "Next")}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Thumbnail strip */}
            {galleryImages.length > 1 && (
              <div
                className="border-t border-border bg-card px-6 py-4 overflow-x-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 justify-start min-w-min">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIdx(i)}
                      className={`relative w-16 h-16 shrink-0 overflow-hidden rounded-md transition-all duration-300 ${
                        i === currentIdx
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                          : "opacity-50 hover:opacity-90"
                      }`}
                      aria-label={`View image ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt={`thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Caption footer */}
            <div
              className="border-t border-border bg-card p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-3xl mx-auto flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-amiri text-2xl text-foreground mb-1">
                    {selected.titleAr}
                  </h3>
                  <p className="font-display text-sm text-muted-foreground">
                    {selected.titleEn}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-xs text-muted-foreground">
                    {selected.location}
                  </div>
                  <div
                    className="text-xs text-muted-foreground font-inter"
                    dir="ltr"
                  >
                    {selected.year}
                  </div>
                </div>
              </div>
              {selected.description && (
                <p className="max-w-3xl mx-auto text-sm text-muted-foreground leading-relaxed mt-4">
                  {selected.description}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
