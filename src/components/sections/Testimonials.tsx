"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  X,
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
  titleEn: string;
  published: boolean;
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

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
    { num: happyClients, labelAr: "عميل سعيد", labelEn: "Happy Clients" },
    { num: albums, labelAr: "ألبوم منجز", labelEn: "Albums Delivered" },
    { num: avgRating, labelAr: "متوسط التقييم", labelEn: "Average Rating" },
    { num: "+40", labelAr: "جائزة وتكريم", labelEn: "Awards & Features" },
  ];
}

export function Testimonials() {
  const { t } = useLang();
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
      .then(([tData, p]) => {
        setTestimonials(Array.isArray(tData) ? tData : []);
        setProjects(Array.isArray(p) ? p : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (idx > 0 && idx >= testimonials.length) {
      setIdx(0);
    }
  }, [testimonials.length, idx]);

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
    setIdx(
      (p) => (p - 1 + testimonials.length) % Math.max(testimonials.length, 1)
    );
  };

  if (loading) {
    return (
      <section
        id="testimonials"
        className="relative py-28 md:py-40 bg-background overflow-hidden"
      >
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[40vh]">
          <div className="w-7 h-7 border border-primary/30 border-t-primary rounded-full animate-spin" />
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

  const hasImage = Boolean(current.imageData);
  const stats = computeStats(testimonials, projects);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      id="testimonials"
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
              {t("أصوات العملاء", "Client Voices")}
            </span>
          </div>
          <h2 className="section-title text-foreground">
            {t("آراء العملاء", "Client Voices")}
          </h2>
          <p className="body-lg max-w-2xl pt-1">
            {t(
              "كلمات حقيقية من عملاء وثقوا بLens وأُعجبوا بالنتيجة. كل شهادة موثّقة بلقطة من الرسالة الأصلية.",
              "Real words from clients who trusted the lens and loved the result. Each testimonial is verified with a snapshot of the original message."
            )}
          </p>
          <div className="hairline w-24 mt-2" />
        </motion.div>

        {/* === Testimonial display === */}
        <div className="relative max-w-5xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={idx}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="surface-card overflow-hidden"
            >
              {hasImage ? (
                <div className="grid md:grid-cols-5">
                  {/* ===== Image side — 2/5 (40%) ===== */}
                  <div className="md:col-span-2 relative bg-card min-h-[280px] md:min-h-[440px]">
                    <button
                      onClick={() => setViewImage(current.imageData)}
                      className="group absolute inset-0 w-full h-full"
                      aria-label={t(
                        "عرض صورة الشهادة بالحجم الكامل",
                        "View testimonial image full-size"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.imageData}
                        alt={`شهادة ${current.nameAr}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        style={{ transitionTimingFunction: "var(--ease)" }}
                      />

                      {/* Verified badge — top corner (green tone, editorial pill) */}
                      <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-400/40 rounded-md backdrop-blur-sm">
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" strokeWidth={1.5} />
                        <span className="text-[10px] text-emerald-200 font-inter tracking-[0.2em] uppercase">
                          {t("موثّقة", "Verified")}
                        </span>
                      </div>

                      {/* Decorative corner accents — thin gold lines */}
                      <span
                        aria-hidden
                        className="absolute top-3 left-3 w-5 h-5 border-t border-l border-primary/60"
                      />
                      <span
                        aria-hidden
                        className="absolute bottom-3 right-3 w-5 h-5 border-b border-r border-primary/60"
                      />

                      {/* Subtle hover hint */}
                      <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2 py-1 bg-background/70 border border-border rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 motion-ease">
                        <span className="font-inter text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                          {t("عرض كامل", "View Full")}
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* ===== Content side — 3/5 (60%) ===== */}
                  <div className="md:col-span-3 p-7 md:p-12 flex flex-col justify-center relative">
                    {/* Big quote icon — subtle */}
                    <Quote
                      className="w-12 h-12 text-primary/15 mb-6"
                      strokeWidth={1}
                      aria-hidden
                    />

                    {/* Rating stars — left-aligned (which is right in RTL) */}
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({
                        length: Math.min(current.rating || 0, 5),
                      }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-primary text-primary"
                          strokeWidth={0}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground mr-3 font-inter tracking-wider">
                        {current.rating || 0}.0
                      </span>
                    </div>

                    {/* Quote text — font-amiri, right-aligned (RTL natural) */}
                    <p className="font-amiri text-xl md:text-2xl leading-loose text-foreground mb-7">
                      «{current.quoteAr}»
                    </p>

                    {/* Hairline divider */}
                    <div className="hairline w-20 mb-5" />

                    {/* Author info row — avatar circle + name + role */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-primary/30 bg-secondary flex items-center justify-center shrink-0">
                        <span className="font-amiri text-base text-primary">
                          {avatarText}
                        </span>
                      </div>
                      <div>
                        <div className="font-amiri text-lg text-foreground leading-tight">
                          {current.nameAr}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {current.roleAr}
                        </div>
                        <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mt-1">
                          {current.roleEn}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ===== No image — single column centered ===== */
                <div className="p-8 md:p-16 relative flex flex-col items-center text-center">
                  <Quote
                    className="w-12 h-12 text-primary/15 mb-6"
                    strokeWidth={1}
                    aria-hidden
                  />

                  <div className="flex items-center gap-1 mb-6">
                    {Array.from({
                      length: Math.min(current.rating || 0, 5),
                    }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                        strokeWidth={0}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground mr-3 font-inter tracking-wider">
                      {current.rating || 0}.0
                    </span>
                  </div>

                  <p className="font-amiri text-xl md:text-2xl leading-loose text-foreground mb-8 max-w-3xl">
                    «{current.quoteAr}»
                  </p>

                  <div className="hairline w-20 mb-6" />

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full border border-primary/30 bg-secondary flex items-center justify-center shrink-0">
                      <span className="font-amiri text-base text-primary">
                        {avatarText}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-amiri text-lg text-foreground leading-tight">
                        {current.nameAr}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {current.roleAr}
                      </div>
                      <div className="font-inter text-[10px] tracking-[0.3em] text-primary/70 uppercase mt-1">
                        {current.roleEn}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* === Navigation — prev/next (hairline border), dots, counter === */}
          <div className="flex items-center justify-center gap-5 mt-10">
            <button
              onClick={prev}
              className="w-11 h-11 border border-border flex items-center justify-center text-muted-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md"
              aria-label={t("السابق", "Previous")}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
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
                  className={`h-1.5 rounded-sm transition-all duration-300 motion-ease ${
                    i === idx
                      ? "w-8 bg-primary"
                      : "w-2 bg-border hover:bg-primary/40"
                  }`}
                  aria-label={`${t("الرأي", "Testimonial")} ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-11 h-11 border border-border flex items-center justify-center text-muted-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md"
              aria-label={t("التالي", "Next")}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Counter */}
          <div className="text-center mt-4">
            <span className="font-inter text-xs text-muted-foreground tracking-[0.3em]">
              {String(idx + 1).padStart(2, "0")} /{" "}
              {String(testimonials.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* === Stats bar — 4 stats separated by vertical hairlines (NOT cards) === */}
        <motion.div
          {...fade(0.2)}
          className="mt-20 md:mt-28 max-w-4xl mx-auto"
        >
          <div className="flex items-stretch justify-between">
            {stats.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-5 md:gap-8 flex-1 justify-center"
              >
                {i > 0 && (
                  <span
                    aria-hidden
                    className="w-px h-12 bg-border"
                  />
                )}
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span className="font-display text-2xl md:text-3xl text-primary leading-none font-semibold">
                    {s.num}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider">
                    {t(s.labelAr, s.labelEn)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* === Image lightbox === */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={() => setViewImage(null)}
            className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
          >
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-5 right-5 w-11 h-11 border border-border bg-background/60 flex items-center justify-center text-foreground hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md z-10"
              aria-label={t("إغلاق", "Close")}
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* Verified badge in lightbox */}
            <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-400/30 rounded-md">
              <BadgeCheck className="w-4 h-4 text-emerald-300" strokeWidth={1.5} />
              <span className="text-[10px] text-emerald-200 font-inter tracking-[0.3em] uppercase">
                {t("شهادة موثّقة", "Verified Testimonial")}
              </span>
            </div>

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewImage}
                alt={t("شهادة العميل", "Client testimonial")}
                loading="eager"
                decoding="async"
                className="w-full max-h-[85vh] object-contain rounded-sm border border-border"
              />
              <p className="text-center text-xs text-muted-foreground mt-4 font-inter tracking-[0.3em] uppercase">
                {t("شهادة عميل حقيقية", "Authentic Client Testimonial")}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
