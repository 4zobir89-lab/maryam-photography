"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, Maximize2, X, BadgeCheck, Image as ImageIcon } from "lucide-react";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number;
  avatar: string;
  imageData: string; // Vercel Blob URL — screenshot/photo of the client's actual message
};

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  published: boolean;
};

// Stats are computed dynamically from DB (testimonials + projects).
// If testimonials array is empty, fall back to "+250" floor for "عميل سعيد"
// and "5.0★" for "متوسط التقييم". Awards ("+40") is a marketing claim, no DB source.
function computeStats(testimonials: Testimonial[], projects: Project[]) {
  const happyClients =
    testimonials.length > 0 ? `+${testimonials.length}` : "+250";
  const albumsCount = projects.length;
  const albums = `+${Math.max(albumsCount, 0)}`;
  const avgRating =
    testimonials.length > 0
      ? `${(
          testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) /
          testimonials.length
        ).toFixed(1)}★`
      : "5.0★";
  return [
    { num: happyClients, labelAr: "عميل سعيد" },
    { num: albums, labelAr: "ألبوم منجز" },
    { num: avgRating, labelAr: "متوسط التقييم" },
    { num: "+40", labelAr: "جائزة وتكريم" },
  ];
}

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewImage, setViewImage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([t, p]) => {
        setTestimonials(Array.isArray(t) ? t : []);
        setProjects(Array.isArray(p) ? p : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Clamp idx when testimonials change
  useEffect(() => {
    if (idx > 0 && idx >= testimonials.length) {
      setIdx(0);
    }
  }, [testimonials.length, idx]);

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewImage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewImage]);

  const next = () => {
    setDirection(1);
    setIdx((p) => (p + 1) % Math.max(testimonials.length, 1));
  };
  const prev = () => {
    setDirection(-1);
    setIdx((p) => (p - 1 + testimonials.length) % Math.max(testimonials.length, 1));
  };

  if (loading) {
    return (
      <section
        id="testimonials"
        className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[Math.min(idx, testimonials.length - 1)];
  const avatarText =
    current.avatar ||
    current.nameAr
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join(" ");

  return (
    <section
      id="testimonials"
      className="relative py-32 md:py-44 bg-[oklch(0.06_0.005_285)] overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vh] rounded-full bg-[oklch(0.78_0.13_75_/_0.04)] blur-[150px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-inter text-[11px] tracking-[0.5em] text-primary uppercase block mb-4">
            — Client Voices —
          </span>
          <h2 className="font-amiri text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">آراء</span>{" "}
            <span className="text-gold-gradient">العملاء</span>
          </h2>
        </motion.div>

        {/* Testimonial card */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={idx}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative glass-card rounded-sm p-8 md:p-14"
            >
              {/* Big quote icon */}
              <Quote className="absolute top-8 left-8 w-16 h-16 text-primary/15" />

              {/* Verified badge — only if has image */}
              {current.imageData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-[10px] text-green-400 font-inter tracking-widest uppercase">
                    موثّقة
                  </span>
                </motion.div>
              )}

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-8">
                {Array.from({ length: Math.min(current.rating || 0, 5) }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-primary text-primary"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="font-amiri text-xl md:text-3xl leading-loose text-foreground text-center mb-10 max-w-3xl mx-auto">
                «{current.quoteAr}»
              </p>

              {/* Author section — with image or avatar */}
              <div className="flex flex-col items-center gap-4">
                {current.imageData ? (
                  <button
                    onClick={() => setViewImage(current.imageData)}
                    className="group relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-all hover:scale-105"
                    aria-label="عرض صورة الشهادة بالحجم الكامل"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={current.imageData}
                      alt={current.nameAr}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors flex items-center justify-center">
                      <Maximize2 className="w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Verified check on image */}
                    <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-green-500 rounded-full border-2 border-[oklch(0.06_0.005_285)] flex items-center justify-center">
                      <BadgeCheck className="w-4 h-4 text-white" />
                    </div>
                  </button>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center">
                    <span className="font-amiri text-2xl text-gold-gradient">
                      {avatarText}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="font-amiri text-xl text-foreground mb-1">
                    {current.nameAr}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {current.roleAr}
                  </div>
                  <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mt-1">
                    {current.roleEn}
                  </div>
                </div>

                {/* Click-to-view hint for image testimonials */}
                {current.imageData && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => setViewImage(current.imageData)}
                    className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors mt-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>اضغط على الصورة لعرضها بالكامل</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="السابق"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`الرأي ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="التالي"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto"
        >
          {computeStats(testimonials, projects).map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-display text-4xl text-gold-gradient font-bold mb-2">
                {s.num}
              </div>
              <div className="text-xs text-muted-foreground tracking-wider">
                {s.labelAr}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ===== Image viewer lightbox ===== */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewImage(null)}
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-4 left-4 w-12 h-12 rounded-full border border-border bg-background/60 backdrop-blur flex items-center justify-center text-foreground hover:border-primary hover:text-primary transition-colors z-10"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Verified badge in lightbox */}
            <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur">
              <BadgeCheck className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400 font-inter tracking-widest uppercase">
                شهادة موثّقة
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewImage}
                alt="شهادة العميل"
                className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-primary/20"
              />
              <p className="text-center text-xs text-muted-foreground mt-4 font-inter tracking-widest uppercase">
                ✦ شهادة عميل حقيقية ✦
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
