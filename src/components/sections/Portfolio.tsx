"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Maximize2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { MotifSvg } from "@/components/shared/MotifSvg";

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
  span: string; // normal | wide | tall
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

export function Portfolio() {
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
    // Build the list of images: cover first, then gallery images (if any)
    const allImages: string[] = [];
    if (project.imageData) allImages.push(project.imageData);

    // Fetch gallery images
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
    setCurrentImageIdx((i) => (i - 1 + galleryImages.length) % galleryImages.length);
  };

  // Keyboard navigation
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

  if (loading) {
    return (
      <section
        id="portfolio"
        className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="portfolio"
      className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
    >
      {/* Decorative top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — Selected Works —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">معرض</span>{" "}
            <span className="text-gold-gradient">الأعمال</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-loose">
            مجموعة مختارة من أعمالي عبر السنوات — كل صورة تحكي حكاية، وكل إطار
            يحفظ لحظة لا تتكرر.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-2 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`group px-5 py-2.5 text-sm font-medium tracking-wide border rounded-full transition-all duration-300 ${
                active === cat.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {cat.labelAr}
              <span className="font-inter text-[10px] tracking-widest ml-2 opacity-60">
                {cat.labelEn}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Gallery grid */}
        {filtered.length > 0 ? (
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => (
              <motion.button
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                onClick={() => openProject(project)}
                className="group relative overflow-hidden bg-card border border-border/40 rounded-sm cursor-pointer mb-4 md:mb-6 break-inside-avoid w-full block"
              >
                {/* Image — natural aspect ratio */}
                {project.imageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.imageData}
                    alt={project.titleAr}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="w-full h-auto block"
                  />
                ) : (
                  <div className="aspect-[4/3]">
                    <MotifSvg
                      motif={project.motif}
                      palette={paletteOf(project)}
                    />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

                {/* Hover action */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full border border-primary/60 bg-background/40 backdrop-blur-sm flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-primary" />
                  </div>
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-right transform translate-y-0 group-hover:translate-y-[-4px] transition-transform duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-inter text-[10px] tracking-[0.3em] text-primary uppercase">
                      {project.year}
                    </span>
                    <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
                      {categories.find((c) => c.id === project.category)?.labelEn}
                    </span>
                  </div>
                  <h3 className="font-amiri text-2xl md:text-3xl text-foreground mb-1">
                    {project.titleAr}
                  </h3>
                  <p className="font-display text-xs tracking-wider text-muted-foreground">
                    {project.titleEn} · {project.location}
                  </p>
                </div>

                {/* Top right index */}
                <div className="absolute top-4 right-4 text-[10px] font-inter tracking-widest text-primary/70">
                  {String(project.id).padStart(2, "0")}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            لا توجد أعمال منشورة بعد.
          </div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <button className="group inline-flex items-center gap-3 px-8 py-4 border border-primary/40 text-primary rounded-full font-medium tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <Eye className="w-4 h-4" />
            استعرض المجموعة الكاملة
            <span className="text-xs opacity-60 font-inter">(+180 صورة)</span>
          </button>
        </motion.div>
      </div>

      {/* Lightbox modal — redesigned with full image + gallery navigation */}
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
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 md:p-6 bg-gradient-to-b from-background to-transparent">
              <div className="flex items-center gap-3">
                <span className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase">
                  {categories.find((c) => c.id === selected.category)?.labelEn}
                </span>
                {galleryImages.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {currentImageIdx + 1} / {galleryImages.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main image area */}
            <div
              className="flex-1 flex items-center justify-center p-4 md:p-10 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={prevImage}
                  className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 border border-border backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label="السابق"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Current image — natural size, max 90vh */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIdx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative max-w-6xl w-full flex items-center justify-center"
                >
                  {galleryImages[currentImageIdx] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={galleryImages[currentImageIdx]}
                      alt={selected.titleAr}
                      loading="eager"
                      decoding="async"
                      className="max-w-full max-h-[75vh] w-auto h-auto object-contain rounded-md shadow-2xl"
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
                      <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* Next button */}
              {galleryImages.length > 1 && (
                <button
                  onClick={nextImage}
                  className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/60 border border-border backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
                  aria-label="التالي"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Info panel — below image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="border-t border-border bg-card/60 backdrop-blur p-6 md:p-10"
            >
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-start">
                {/* Left: title + description */}
                <div className="text-right">
                  <span className="font-inter text-[10px] tracking-[0.4em] text-primary uppercase mb-3 block">
                    {categories.find((c) => c.id === selected.category)?.labelEn} · {selected.year}
                  </span>
                  <h3 className="font-amiri text-3xl md:text-5xl text-foreground mb-2">
                    {selected.titleAr}
                  </h3>
                  <p className="font-display text-base md:text-lg text-muted-foreground tracking-wider mb-4">
                    {selected.titleEn}
                  </p>
                  <div className="hairline w-16 mb-4 mr-auto" />
                  <p className="text-muted-foreground leading-loose text-sm md:text-base">
                    {selected.description ||
                      `صورة من سلسلة ${
                        categories.find((c) => c.id === selected.category)?.labelAr || ""
                      } التقطتها مريم في ${selected.location}. تجمع اللقطة بين الضوء الطبيعي والحركة العفوية لتوثيق لحظة لا تتكرر.`}
                  </p>
                </div>

                {/* Right: meta + thumbnails */}
                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        الموقع
                      </div>
                      <div className="font-amiri text-foreground mt-1">
                        {selected.location}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        السنة
                      </div>
                      <div className="font-amiri text-foreground mt-1">
                        {selected.year}
                      </div>
                    </div>
                  </div>

                  {/* Thumbnails strip — if gallery has multiple images */}
                  {galleryImages.length > 1 && (
                    <div>
                      <div className="text-[10px] text-muted-foreground tracking-widest uppercase mb-2">
                        صور المعرض ({galleryImages.length})
                      </div>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {galleryImages.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentImageIdx(i)}
                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                              i === currentImageIdx
                                ? "border-primary scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
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
