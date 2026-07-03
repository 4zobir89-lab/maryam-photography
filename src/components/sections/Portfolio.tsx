"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
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
  span: string;
  featured: boolean;
  published: boolean;
  order: number;
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
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const { t } = useLang();

  const openProject = async (project: Project) => {
    setSelected(project);
    setCurrentImageIdx(0);
    const allImages: string[] = [];
    if (project.imageData) allImages.push(project.imageData);
    try {
      const res = await fetch(`/api/projects/${project.id}/images`);
      if (res.ok) {
        const imgs = await res.json();
        for (const img of imgs) {
          if (img.url && !allImages.includes(img.url)) allImages.push(img.url);
        }
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    }
    setGalleryImages(allImages);
  };

  const nextImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIdx((i) => (i + 1) % galleryImages.length);
  };
  const prevImage = () => {
    if (galleryImages.length <= 1) return;
    setCurrentImageIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      else if (e.key === "ArrowLeft") nextImage();
      else if (e.key === "ArrowRight") prevImage();
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
      <section id="portfolio" className="py-28 md:py-40 bg-background">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-28 md:py-40 bg-background">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 max-w-3xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-primary/60" />
            <span className="eyebrow">{t("Selected Works", "Selected Works")}</span>
          </div>
          <h2 className="section-title mb-8">
            <span className="text-foreground">معرض</span>{" "}
            <span className="text-gold-gradient">الأعمال</span>
          </h2>
          <p className="body-lg">
            {t(
              "مجموعة مختارة من أعمالي عبر السنوات — كل صورة تحكي حكاية، وكل إطار يحفظ لحظة لا تتكرر.",
              "A curated selection of my work across the years — each frame holds a story, each moment never repeats."
            )}
          </p>
        </motion.div>

        {/* Filters */}
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
              className={`px-4 py-2 text-sm transition-all duration-300 motion-ease ${
                active === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {t(cat.labelAr, cat.labelEn)}
            </button>
          ))}
        </motion.div>

        {/* Gallery grid — masonry */}
        {filtered.length > 0 ? (
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]"
          >
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
                  className="group relative w-full block mb-4 md:mb-6 break-inside-avoid overflow-hidden bg-card text-right"
                >
                  {/* Image — natural aspect ratio */}
                  {project.imageData ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.imageData}
                      alt={project.titleAr}
                      className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03] motion-ease"
                      loading={i < 3 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  ) : (
                    <div className="aspect-[4/3]">
                      <MotifSvg motif={project.motif} palette={paletteOf(project)} />
                    </div>
                  )}

                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                  {/* Caption */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="eyebrow">{project.year}</span>
                      <span className="font-inter text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                        {categories.find((c) => c.id === project.category)?.labelEn}
                      </span>
                    </div>
                    <h3 className="font-amiri text-xl text-foreground mb-1">{project.titleAr}</h3>
                    <p className="font-display text-xs tracking-wider text-muted-foreground">
                      {project.titleEn} · {project.location}
                    </p>
                  </div>

                  {/* Index */}
                  <div className="absolute top-4 right-4 font-inter text-[10px] tracking-widest text-primary/70">
                    {String(i + 1).padStart(2, "0")}
                  </div>
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
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 border border-border text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-all duration-300 motion-ease"
            >
              {t("استعرض المعرض الكامل", "View Full Gallery")}
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[80] bg-background/95 backdrop-blur-md flex flex-col overflow-y-auto"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 bg-gradient-to-b from-background to-transparent">
              <div className="flex items-center gap-4">
                <span className="eyebrow">
                  {categories.find((c) => c.id === selected.category)?.labelEn}
                </span>
                {galleryImages.length > 1 && (
                  <span className="text-xs text-muted-foreground font-inter" dir="ltr">
                    {currentImageIdx + 1} / {galleryImages.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 flex items-center justify-center border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                aria-label={t("إغلاق", "Close")}
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Image area */}
            <div
              className="flex-1 flex items-center justify-center p-5 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.length > 1 && (
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
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="max-w-5xl w-full"
                >
                  {galleryImages[currentImageIdx] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={galleryImages[currentImageIdx]}
                      alt={selected.titleAr}
                      className="w-full max-h-[72vh] object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {galleryImages.length > 1 && (
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
              transition={{ delay: 0.2, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="border-t border-border bg-card p-6 md:p-10"
            >
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                <div>
                  <span className="eyebrow mb-3 block">
                    {categories.find((c) => c.id === selected.category)?.labelEn} · {selected.year}
                  </span>
                  <h3 className="font-amiri text-2xl md:text-3xl text-foreground mb-2">
                    {selected.titleAr}
                  </h3>
                  <p className="font-display text-base text-muted-foreground tracking-wider mb-4">
                    {selected.titleEn}
                  </p>
                  <div className="hairline w-16 mb-4" />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selected.description || t(
                      `صورة من سلسلة ${categories.find((c) => c.id === selected.category)?.labelAr || ""}.`,
                      `From the ${selected.category} series.`
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-8 text-sm">
                    <div>
                      <div className="eyebrow mb-1.5">{t("الموقع", "Location")}</div>
                      <div className="font-amiri text-foreground">{selected.location}</div>
                    </div>
                    <div>
                      <div className="eyebrow mb-1.5">{t("السنة", "Year")}</div>
                      <div className="font-amiri text-foreground">{selected.year}</div>
                    </div>
                  </div>

                  {galleryImages.length > 1 && (
                    <div>
                      <div className="eyebrow mb-2">{t("الصور", "Images")} ({galleryImages.length})</div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {galleryImages.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIdx(i)}
                            className={`flex-shrink-0 w-14 h-14 overflow-hidden border-2 transition-all ${
                              i === currentImageIdx ? "border-primary" : "border-transparent opacity-50 hover:opacity-100"
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
