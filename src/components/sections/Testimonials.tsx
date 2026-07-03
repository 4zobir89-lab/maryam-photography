"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Quote,
  Maximize2,
  X,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Users,
  Camera,
  Award,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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
};

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

type Stat = {
  value: string;
  labelAr: string;
  labelEn: string;
  icon: LucideIcon;
};

export function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const pausedRef = useRef(false);
  const { t } = useLang();

  useEffect(() => {
    Promise.all([
      fetch("/api/testimonials").then((r) => r.json()),
      fetch("/api/projects").then((r) => r.json()),
    ])
      .then(([tstData, prjData]) => {
        setTestimonials(Array.isArray(tstData) ? tstData : []);
        setProjects(Array.isArray(prjData) ? prjData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setTestimonials((curr) => {
      if (curr.length === 0) return curr;
      setDirection(1);
      setCurrent((c) => (c + 1) % curr.length);
      return curr;
    });
  }, []);

  const prev = useCallback(() => {
    setTestimonials((curr) => {
      if (curr.length === 0) return curr;
      setDirection(-1);
      setCurrent((c) => (c - 1 + curr.length) % curr.length);
      return curr;
    });
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      if (!pausedRef.current) next();
    }, 6500);
    return () => clearInterval(interval);
  }, [testimonials.length, next]);

  // Lightbox escape + scroll lock
  useEffect(() => {
    if (!viewImage) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewImage(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [viewImage]);

  if (loading) {
    return (
      <section id="testimonials" className="py-24 md:py-36 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  const currentT = testimonials[current];
  const hasImage = !!currentT?.imageData;
  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) /
          testimonials.length
        ).toFixed(1)
      : "5.0";

  const stats: Stat[] = [
    {
      value: `${Math.max(120, projects.length * 30)}+`,
      labelAr: "عميل سعيد",
      labelEn: "Happy Clients",
      icon: Users,
    },
    {
      value: `${projects.length || 4}`,
      labelAr: "ألبوم منشور",
      labelEn: "Published Albums",
      icon: Camera,
    },
    {
      value: avgRating,
      labelAr: "متوسط التقييم",
      labelEn: "Avg. Rating",
      icon: Sparkles,
    },
    {
      value: "+15",
      labelAr: "جائزة وتكريم",
      labelEn: "Awards",
      icon: Award,
    },
  ];

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 60 : -60,
    }),
    center: { opacity: 1, x: 0 },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -60 : 60,
    }),
  };

  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-36 bg-secondary overflow-hidden"
    >
      {/* Ambient glow center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[180px] pointer-events-none animate-slow-pulse" />
      <div
        className="absolute top-1/3 right-0 w-[380px] h-[380px] rounded-full bg-accent/[0.05] blur-[150px] pointer-events-none animate-slow-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Centered eyebrow with lines on both sides */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="flex items-center justify-center gap-4 mb-5"
        >
          <span className="w-12 h-px bg-primary/40" />
          <span className="eyebrow">
            {t("Client Voices", "Client Voices")}
          </span>
          <span className="w-12 h-px bg-primary/40" />
        </motion.div>

        {/* Centered title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          className="section-title text-center mb-14"
        >
          <span className="text-foreground">آراء</span>{" "}
          <span className="text-gold-gradient">العملاء</span>
        </motion.h2>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentT.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: EASE }}
              className={`glass-dark rounded-3xl overflow-hidden ${
                hasImage
                  ? "grid grid-cols-1 md:grid-cols-5"
                  : "max-w-3xl mx-auto p-8 md:p-14 text-center"
              }`}
            >
              {hasImage ? (
                <>
                  {/* Image — 2/5 */}
                  <div className="md:col-span-2 relative aspect-[4/5] md:aspect-auto md:min-h-[420px] bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentT.imageData}
                      alt={currentT.nameAr}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setViewImage(currentT.imageData)}
                      className="absolute top-4 left-4 w-9 h-9 flex items-center justify-center rounded-full glass-dark text-white hover:text-primary transition-colors"
                      aria-label={t("عرض الصورة", "View image")}
                    >
                      <Maximize2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Content — 3/5 */}
                  <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center">
                    <Quote
                      className="w-9 h-9 text-primary/60 mb-5"
                      strokeWidth={1}
                    />
                    {/* Rating stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({
                        length: Math.min(currentT.rating || 0, 5),
                      }).map((_, j) => (
                        <Star
                          key={j}
                          className="w-4 h-4 fill-primary text-primary"
                          strokeWidth={0}
                        />
                      ))}
                    </div>
                    {/* Quote */}
                    <p className="font-amiri text-xl md:text-2xl text-white leading-relaxed mb-6">
                      «{currentT.quoteAr}»
                    </p>
                    {/* Gold rule */}
                    <div className="gold-rule mb-5" />
                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
                        <span className="font-amiri text-sm text-primary">
                          {currentT.avatar || currentT.nameAr.slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-amiri text-base text-white truncate">
                          {currentT.nameAr}
                        </div>
                        <div className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/55 mt-0.5">
                          {currentT.roleEn}
                        </div>
                      </div>
                      <BadgeCheck
                        className="w-5 h-5 text-green-500 shrink-0"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Quote
                    className="w-10 h-10 text-primary/60 mb-6 mx-auto"
                    strokeWidth={1}
                  />
                  <div className="flex items-center justify-center gap-1 mb-6">
                    {Array.from({
                      length: Math.min(currentT.rating || 0, 5),
                    }).map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-primary text-primary"
                        strokeWidth={0}
                      />
                    ))}
                  </div>
                  <p className="font-amiri text-xl md:text-2xl text-white leading-relaxed mb-7 max-w-2xl mx-auto">
                    «{currentT.quoteAr}»
                  </p>
                  <div className="gold-rule mb-6 mx-auto max-w-[180px]" />
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-secondary border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="font-amiri text-sm text-primary">
                        {currentT.avatar || currentT.nameAr.slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-amiri text-base text-white">
                        {currentT.nameAr}
                      </div>
                      <div className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/55 mt-0.5">
                        {currentT.roleEn}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation — prev / next (glass-dark rounded-full) */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute top-1/2 -translate-y-1/2 right-2 md:-right-3 w-11 h-11 flex items-center justify-center rounded-full glass-dark text-white hover:text-primary transition-colors z-10"
                aria-label={t("السابق", "Previous")}
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={next}
                className="absolute top-1/2 -translate-y-1/2 left-2 md:-left-3 w-11 h-11 flex items-center justify-center rounded-full glass-dark text-white hover:text-primary transition-colors z-10"
                aria-label={t("التالي", "Next")}
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </>
          )}

          {/* Dots + counter */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-center gap-5 mt-8">
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setDirection(i > current ? 1 : -1);
                      setCurrent(i);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-500 motion-ease ${
                      i === current
                        ? "w-8 bg-primary"
                        : "w-2 bg-border hover:bg-primary/50"
                    }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <span
                className="font-inter text-[10px] tracking-[0.25em] uppercase text-muted-foreground"
                dir="ltr"
              >
                {String(current + 1).padStart(2, "0")} /{" "}
                {String(testimonials.length).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Stats bar — 4 glass cards with gold numbers */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: 0.3 + i * 0.08,
                  ease: EASE,
                }}
                className="glass-card rounded-2xl p-6 text-center lift-card"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </div>
                <div
                  className="font-display text-3xl text-gold-gradient leading-none"
                  dir="ltr"
                >
                  {stat.value}
                </div>
                <div className="font-inter text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-2">
                  {t(stat.labelAr, stat.labelEn)}
                </div>
              </motion.div>
            );
          })}
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
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md flex items-center justify-center p-6"
          >
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-5 left-5 w-10 h-10 flex items-center justify-center rounded-full border border-border hover:border-primary transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-2xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewImage}
                alt={t("شهادة", "Testimonial")}
                className="w-full max-h-[82vh] object-contain rounded-lg border border-border"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
