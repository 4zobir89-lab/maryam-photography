"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import Link from "next/link";
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

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Portfolio() {
  const [active, setActive] = useState("all");
  const [selected, setSelected] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const { t } = useLang();

  const openProject = async (project: Project) => {
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
  };

  const next = () => galleryImages.length > 1 && setCurrentIdx((i) => (i + 1) % galleryImages.length);
  const prev = () => galleryImages.length > 1 && setCurrentIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length);

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
  }, [selected, galleryImages.length]);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paletteOf = (p: Project) => [p.palette1, p.palette2, p.palette3].filter(Boolean);
  const filtered = active === "all" ? projects : projects.filter((p) => p.category === active);

  if (loading) {
    return (
      <section id="portfolio" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="relative py-32 md:py-48 bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 rounded-full bg-primary/[0.04] blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary/60" />
            <span className="eyebrow">{t("Selected Works", "Selected Works")}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-foreground">معرض</span>{" "}
            <span className="text-gold-gradient">الأعمال</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
            {t(
              "مجموعة مختارة من أعمالي — كل صورة تحكي حكاية، وكل إطار يحفظ لحظة لا تتكرر.",
              "A curated selection of my work — each frame holds a story, each moment never repeats."
            )}
          </p>
        </motion.div>

        {/* Filters — pill buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="flex flex-wrap items-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-5 py-2.5 text-sm rounded-full transition-all duration-300 motion-ease ${
                active === cat.id
                  ? "bg-primary text-primary-foreground shadow-gold"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {t(cat.labelAr, cat.labelEn)}
            </button>
          ))}
        </motion.div>

        {/* Masonry grid — dynamic, magazine style */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6 [column-fill:_balance]"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.button
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: EASE }}
                  onClick={() => openProject(project)}
                  className="group relative w-full block mb-5 md:mb-6 break-inside-avoid overflow-hidden rounded-2xl bg-card text-right shadow-velvet lift-card"
                >
                  {/* Image — natural aspect */}
                  {project.imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageData}
                      alt={project.titleAr}
                      className="w-full h-auto block transition-transform duration-1000 group-hover:scale-[1.06] motion-ease"
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="aspect-[4/3]">
                      <MotifSvg motif={project.motif} palette={paletteOf(project)} />
                    </div>
                  )}

                  {/* Gradient overlay — appears on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/20 to-transparent opacity-50 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                  {/* Hover action circle */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="w-16 h-16 rounded-full glass-strong flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 motion-ease">
                      <Maximize2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Caption — bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-5 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-inter text-[10px] tracking-[0.25em] text-primary uppercase">{project.year}</span>
                      <span className="font-inter text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        {categories.find((c) => c.id === project.category)?.labelEn}
                      </span>
                    </div>
                    <h3 className="font-amiri text-2xl text-foreground mb-1">{project.titleAr}</h3>
                    <p className="font-display text-xs tracking-wider text-muted-foreground">
                      {project.titleEn} · {project.location}
                    </p>
                  </div>

                  {/* Top index */}
                  <div className="absolute top-4 right-4 font-inter text-[10px] tracking-widest text-primary/60">
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  {/* Featured badge */}
                  {project.featured && (
                    <div className="absolute top-4 left-4 px-2.5 py-1 glass-strong rounded-full text-[9px] text-primary tracking-[0.15em] uppercase font-medium">
                      {t("مميز", "Featured")}
                    </div>
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-24 text-muted-foreground">
            {t("لا توجد أعمال منشورة بعد.", "No published works yet.")}
          </div>
        )}

        {/* Bottom CTA */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="text-center mt-16"
          >
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-3 px-8 py-4 glass rounded-full text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-all duration-500 motion-ease"
            >
              {t("استعرض المعرض الكامل", "View Full Gallery")}
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Lightbox — cinematic fullscreen */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-2xl flex flex-col overflow-y-auto"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-gradient-to-b from-background to-transparent">
              <div className="flex items-center gap-4">
                <span className="eyebrow">
                  {categories.find((c) => c.id === selected.category)?.labelEn}
                </span>
                {galleryImages.length > 1 && (
                  <span className="text-xs text-muted-foreground font-inter" dir="ltr">
                    {currentIdx + 1} / {galleryImages.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-11 h-11 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Image area */}
            <div
              className="flex-1 flex items-center justify-center p-6 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.length > 1 && (
                <button
                  onClick={prev}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors z-10"
                  aria-label={t("السابق", "Previous")}
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="max-w-5xl w-full"
                >
                  {galleryImages[currentIdx] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={galleryImages[currentIdx]}
                      alt={selected.titleAr}
                      className="w-full max-h-[72vh] object-contain rounded-xl shadow-velvet"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {galleryImages.length > 1 && (
                <button
                  onClick={next}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors z-10"
                  aria-label={t("التالي", "Next")}
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            {/* Info panel — glass */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong border-t border-[var(--glass-border)] p-6 md:p-10"
            >
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                <div>
                  <span className="eyebrow mb-3 block">
                    {categories.find((c) => c.id === selected.category)?.labelEn} · {selected.year}
                  </span>
                  <h3 className="font-amiri text-3xl md:text-4xl text-foreground mb-2">
                    {selected.titleAr}
                  </h3>
                  <p className="font-display text-base text-muted-foreground tracking-wider mb-5">
                    {selected.titleEn}
                  </p>
                  <div className="gold-hairline w-16 mb-5" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.description || t(
                      `صورة من سلسلة ${categories.find((c) => c.id === selected.category)?.labelAr || ""}.`,
                      `From the ${selected.category} series.`
                    )}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="flex gap-8 text-sm">
                    <div>
                      <div className="eyebrow mb-2">{t("الموقع", "Location")}</div>
                      <div className="font-amiri text-foreground">{selected.location}</div>
                    </div>
                    <div>
                      <div className="eyebrow mb-2">{t("السنة", "Year")}</div>
                      <div className="font-amiri text-foreground">{selected.year}</div>
                    </div>
                  </div>

                  {galleryImages.length > 1 && (
                    <div>
                      <div className="eyebrow mb-3">{t("الصور", "Images")} ({galleryImages.length})</div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {galleryImages.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIdx(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              i === currentIdx ? "border-primary scale-105" : "border-transparent opacity-50 hover:opacity-100"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={url} alt="" className="w-full h-full object-cover" />
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
