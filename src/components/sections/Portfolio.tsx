"use client";

import { useEffect, useState } from "react";
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
  { id: "all", labelAr: "الكل" },
  { id: "weddings", labelAr: "أعراس" },
  { id: "portraits", labelAr: "بورتريه" },
  { id: "culture", labelAr: "ثقافة" },
  { id: "landscapes", labelAr: "مناظر" },
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
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-32 md:py-48 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section number — editorial */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-12"
        >
          <span className="font-inter text-xs tracking-[0.3em] text-muted-foreground">02</span>
          <span className="w-12 h-px bg-border" />
          <span className="eyebrow">{t("Selected Works", "Selected Works")}</span>
        </motion.div>

        {/* Title + filters — one row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <h2 className="section-title">
            <span className="text-foreground">معرض</span>{" "}
            <span className="text-gold-gradient">الأعمال</span>
          </h2>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={`px-3.5 py-1.5 text-xs transition-all duration-300 motion-ease ${
                  active === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.labelAr}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry — varied sizes, magazine */}
        {filtered.length > 0 ? (
          <motion.div layout className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
            <AnimatePresence mode="popLayout">
              {filtered.map((project, i) => (
                <motion.button
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  onClick={() => openProject(project)}
                  className="group relative w-full block mb-5 break-inside-avoid overflow-hidden bg-card text-right"
                >
                  {project.imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageData}
                      alt={project.titleAr}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.04] motion-ease"
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="aspect-[4/3]">
                      <MotifSvg motif={project.motif} palette={paletteOf(project)} />
                    </div>
                  )}

                  {/* Bottom gradient — subtle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                  {/* Caption — bottom */}
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="eyebrow-sm">{project.year}</span>
                      {project.featured && (
                        <span className="text-[9px] text-primary tracking-[0.2em] uppercase">★</span>
                      )}
                    </div>
                    <h3 className="font-amiri text-xl text-foreground mb-0.5">{project.titleAr}</h3>
                    <p className="font-display text-[11px] text-muted-foreground">{project.location}</p>
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

      {/* Lightbox — minimal fullscreen */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <span className="eyebrow">{categories.find((c) => c.id === selected.category)?.labelAr}</span>
              {galleryImages.length > 1 && (
                <span className="text-xs text-muted-foreground font-inter" dir="ltr">{currentIdx + 1} / {galleryImages.length}</span>
              )}
              <button onClick={() => setSelected(null)} className="w-9 h-9 flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors" aria-label="Close">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 relative" onClick={(e) => e.stopPropagation()}>
              {galleryImages.length > 1 && (
                <button onClick={prev} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-border hover:border-primary transition-colors z-10" aria-label="Previous">
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="max-w-4xl w-full"
                >
                  {galleryImages[currentIdx] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={galleryImages[currentIdx]} alt={selected.titleAr} className="w-full max-h-[72vh] object-contain" />
                  )}
                </motion.div>
              </AnimatePresence>
              {galleryImages.length > 1 && (
                <button onClick={next} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-border hover:border-primary transition-colors z-10" aria-label="Next">
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
              )}
            </div>

            <div className="border-t border-border bg-card p-6 md:p-8" onClick={(e) => e.stopPropagation()}>
              <div className="max-w-3xl mx-auto flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-amiri text-2xl text-foreground mb-1">{selected.titleAr}</h3>
                  <p className="font-display text-sm text-muted-foreground">{selected.titleEn}</p>
                </div>
                <div className="text-left shrink-0">
                  <div className="text-xs text-muted-foreground">{selected.location}</div>
                  <div className="text-xs text-muted-foreground font-inter" dir="ltr">{selected.year}</div>
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
