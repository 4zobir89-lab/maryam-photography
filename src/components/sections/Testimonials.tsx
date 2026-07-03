"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight, Maximize2, X, BadgeCheck } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Testimonial = {
  id: number;
  quoteAr: string;
  nameAr: string;
  roleAr: string;
  roleEn: string;
  rating: number;
  avatar: string;
  imageData: string;
};

type Project = {
  id: number;
  titleAr: string;
  titleEn: string;
  published: boolean;
};

function computeStats(testimonials: Testimonial[], projects: Project[]) {
  const happyClients = testimonials.length > 0 ? `+${testimonials.length}` : "+250";
  const albums = `+${Math.max(projects.length, 0)}`;
  const avgRating = testimonials.length > 0
    ? `${(testimonials.reduce((s, t) => s + (t.rating || 0), 0) / testimonials.length).toFixed(1)}★`
    : "5.0★";
  return [
    { num: happyClients, labelAr: "عميل سعيد" },
    { num: albums, labelAr: "ألبوم منجز" },
    { num: avgRating, labelAr: "متوسط التقييم" },
    { num: "+40", labelAr: "جائزة وتكريم" },
  ];
}

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const { t } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([tData, pData]) => {
        setTestimonials(Array.isArray(tData) ? tData : []);
        setProjects(Array.isArray(pData) ? pData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (idx > 0 && idx >= testimonials.length) setIdx(0);
  }, [testimonials.length, idx]);

  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewImage(null); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
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
      <section id="testimonials" className="py-32 md:py-48 bg-background">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const current = testimonials[Math.min(idx, testimonials.length - 1)];
  const avatarText = current.avatar || current.nameAr.split(" ").slice(0, 2).map((w) => w[0]).join(" ");
  const hasImage = Boolean(current.imageData);

  return (
    <section id="testimonials" className="relative py-32 md:py-48 bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[50vh] rounded-full bg-accent/[0.04] blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-10 h-px bg-primary/60" />
            <span className="eyebrow">{t("Client Voices", "Client Voices")}</span>
            <span className="w-10 h-px bg-primary/60" />
          </div>
          <h2 className="section-title mb-6">
            <span className="text-foreground">آراء</span>{" "}
            <span className="text-gold-gradient">العملاء</span>
          </h2>
        </motion.div>

        {/* Testimonial card — luxury glass */}
        <div className="relative max-w-4xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={idx}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.6, ease: EASE }}
              className={`relative glass-strong rounded-3xl overflow-hidden ${
                hasImage ? "grid md:grid-cols-5" : "p-10 md:p-16"
              }`}
            >
              {hasImage ? (
                <>
                  {/* Image side */}
                  <div className="md:col-span-2 relative bg-black min-h-[320px] md:min-h-[460px]">
                    <button
                      onClick={() => setViewImage(current.imageData)}
                      className="group absolute inset-0 w-full h-full"
                      aria-label={t("عرض الصورة بالكامل", "View full image")}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.imageData}
                        alt={current.nameAr}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 motion-ease"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Verified badge */}
                      <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1.5 glass-strong rounded-full">
                        <BadgeCheck className="w-3.5 h-3.5 text-green-400" strokeWidth={1.5} />
                        <span className="text-[10px] text-green-400 font-inter tracking-[0.2em] uppercase">{t("موثّقة", "Verified")}</span>
                      </div>

                      {/* Hover hint */}
                      <div className="absolute bottom-5 left-5 flex items-center gap-1.5 px-3 py-1.5 glass-strong rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3 h-3" strokeWidth={1.5} />
                        <span className="text-[10px] font-inter tracking-wider uppercase">{t("عرض", "View")}</span>
                      </div>
                    </button>
                  </div>

                  {/* Content side */}
                  <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center relative">
                    <Quote className="absolute top-8 left-8 w-14 h-14 text-primary/15 rotate-180" strokeWidth={1} />

                    <div className="flex items-center gap-1 mb-6">
                      {Array.from({ length: Math.min(current.rating || 0, 5) }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" strokeWidth={0} />
                      ))}
                      <span className="text-xs text-muted-foreground mr-3 font-inter" dir="ltr">{current.rating || 0}.0</span>
                    </div>

                    <p className="font-amiri text-lg md:text-2xl leading-loose text-foreground mb-8">
                      «{current.quoteAr}»
                    </p>

                    <div className="gold-hairline w-16 mb-6" />

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="font-amiri text-sm text-gold-gradient">{avatarText}</span>
                      </div>
                      <div>
                        <div className="font-amiri text-lg text-foreground">{current.nameAr}</div>
                        <div className="text-xs text-muted-foreground">{current.roleAr}</div>
                        <div className="font-inter text-[9px] tracking-[0.25em] text-primary/70 uppercase mt-0.5">{current.roleEn}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Quote className="absolute top-10 left-10 w-16 h-16 text-primary/15 rotate-180" strokeWidth={1} />

                  <div className="flex justify-center gap-1 mb-8">
                    {Array.from({ length: Math.min(current.rating || 0, 5) }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" strokeWidth={0} />
                    ))}
                  </div>

                  <p className="font-amiri text-xl md:text-2xl lg:text-3xl leading-loose text-foreground text-center mb-10 max-w-3xl mx-auto">
                    «{current.quoteAr}»
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-secondary border border-primary/30 flex items-center justify-center">
                      <span className="font-amiri text-xl text-gold-gradient">{avatarText}</span>
                    </div>
                    <div className="text-center">
                      <div className="font-amiri text-xl text-foreground mb-1">{current.nameAr}</div>
                      <div className="text-sm text-muted-foreground">{current.roleAr}</div>
                      <div className="font-inter text-[10px] tracking-[0.25em] text-primary/70 uppercase mt-1">{current.roleEn}</div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="flex items-center justify-center gap-5 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("السابق", "Previous")}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setDirection(i > idx ? 1 : -1);
                    setIdx(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === idx ? "w-8 bg-primary" : "w-2 bg-border hover:bg-primary/50"
                  }`}
                  aria-label={`${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full glass flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              aria-label={t("التالي", "Next")}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Counter */}
          <div className="text-center mt-4">
            <span className="font-inter text-[10px] tracking-[0.3em] text-muted-foreground" dir="ltr">
              {String(idx + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Stats bar — glass cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-4xl mx-auto"
        >
          {computeStats(testimonials, projects).map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center">
              <div className="font-display text-3xl text-gold-gradient font-medium mb-2" dir="ltr">{s.num}</div>
              <div className="text-xs text-muted-foreground tracking-wide">{s.labelAr}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewImage(null)}
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-6 left-6 w-12 h-12 rounded-full glass flex items-center justify-center text-foreground hover:text-primary transition-colors z-10"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>

            <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 glass rounded-full">
              <BadgeCheck className="w-4 h-4 text-green-400" strokeWidth={1.5} />
              <span className="text-xs text-green-400 font-inter tracking-[0.2em] uppercase">{t("شهادة موثّقة", "Verified")}</span>
            </div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-3xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewImage}
                alt={t("شهادة العميل", "Client testimonial")}
                className="w-full max-h-[82vh] object-contain rounded-2xl shadow-velvet border border-primary/20"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
