"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  taglineEn: string;
  taglineAr?: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroDescAr: string;
  heroCta1Ar: string;
  heroCta2Ar: string;
  heroStat1Num: string;
  heroStat1Label: string;
  heroStat2Num: string;
  heroStat2Label: string;
  heroStat3Num: string;
  heroStat3Label: string;
  heroImageData?: string;
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Refined aperture/lens diagram in gold hairlines on the warm-dark surface.
 *  NOT a silhouette — a technical, editorial visual. */
function ApertureDiagram() {
  const cx = 150;
  const cy = 200;
  const outerR = 132;
  const midR = 88;
  const innerR = 38;

  const tickCount = 36;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const a = (i / tickCount) * Math.PI * 2 - Math.PI / 2;
    const major = i % 6 === 0;
    const r1 = major ? 118 : 124;
    const r2 = major ? 138 : 132;
    return {
      x1: cx + r1 * Math.cos(a),
      y1: cy + r1 * Math.sin(a),
      x2: cx + r2 * Math.cos(a),
      y2: cy + r2 * Math.sin(a),
      major,
    };
  });

  // 6-blade aperture polygon (offset vertices inside)
  const bladeOuter = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
    return [cx + midR * Math.cos(a), cy + midR * Math.sin(a)];
  });
  const bladeInner = Array.from({ length: 6 }, (_, i) => {
    const a = ((i + 0.5) / 6) * Math.PI * 2 - Math.PI / 2;
    return [cx + innerR * Math.cos(a), cy + innerR * Math.sin(a)];
  });
  const bladePath =
    bladeOuter
      .map(([x, y], i) => {
        const [ix, iy] = bladeInner[i];
        return `M ${x} ${y} L ${ix} ${iy}`;
      })
      .join(" ") +
    " " +
    bladeOuter
      .map(([x, y], i) => {
        const [nx, ny] = bladeOuter[(i + 1) % 6];
        return `M ${x} ${y} L ${nx} ${ny}`;
      })
      .join(" ");

  return (
    <svg
      viewBox="0 0 300 400"
      className="w-full h-full text-primary"
      aria-hidden
    >
      <g stroke="currentColor" fill="none" strokeLinecap="round">
        {/* Outer ring */}
        <circle cx={cx} cy={cy} r={outerR} strokeWidth="0.5" opacity="0.55" />
        {/* Mid ring */}
        <circle cx={cx} cy={cy} r={midR} strokeWidth="0.5" opacity="0.35" />
        {/* Tick marks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeWidth={t.major ? 1 : 0.5}
            opacity={t.major ? 0.85 : 0.45}
          />
        ))}
        {/* Aperture blades */}
        <path d={bladePath} strokeWidth="0.7" opacity="0.7" />
        {/* Center crosshair */}
        <line
          x1={cx}
          y1={cy - 6}
          x2={cx}
          y2={cy + 6}
          strokeWidth="0.5"
          opacity="0.7"
        />
        <line
          x1={cx - 6}
          y1={cy}
          x2={cx + 6}
          y2={cy}
          strokeWidth="0.5"
          opacity="0.7"
        />
        <circle cx={cx} cy={cy} r="1.5" fill="currentColor" stroke="none" />
      </g>
      {/* Focal-length caption */}
      <text
        x={cx}
        y={cy + outerR + 22}
        textAnchor="middle"
        className="font-inter"
        fontSize="6"
        letterSpacing="3"
        fill="currentColor"
        opacity="0.7"
      >
        ƒ/1.4 · 50 mm
      </text>
      <text
        x={cx}
        y={cy - outerR - 12}
        textAnchor="middle"
        className="font-inter"
        fontSize="5"
        letterSpacing="4"
        fill="currentColor"
        opacity="0.5"
      >
        MARYAM · LENS
      </text>
    </svg>
  );
}

export function Hero() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang, t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) {
    return (
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center bg-background"
      >
        <div className="w-7 h-7 border border-primary/30 border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const stats = [
    { num: s.heroStat1Num, label: s.heroStat1Label },
    { num: s.heroStat2Num, label: s.heroStat2Label },
    { num: s.heroStat3Num, label: s.heroStat3Label },
  ];

  // Staggered entrance delays — eyebrow → name → subtitle → desc → CTAs → stats
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      id="home"
      dir="ltr" /* Force LTR grid so text sits on visual left, image on right */
      className="relative min-h-screen flex items-center bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl px-6 w-full">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center pt-32 pb-24 lg:py-0 lg:min-h-screen">
          {/* === LEFT: text column (60%) === */}
          <div dir="rtl" className="flex flex-col gap-7 lg:gap-8">
            {/* 1. Eyebrow with short gold hairline */}
            <motion.div
              {...fade(0.1)}
              className="flex items-center gap-3"
            >
              <span className="h-px w-8 bg-primary/70" aria-hidden />
              <span className="eyebrow">{s.taglineEn}</span>
            </motion.div>

            {/* 2. Massive Arabic name — foreground color, single gold dot accent */}
            <motion.h1
              {...fade(0.2)}
              className="font-amiri font-bold text-foreground leading-[0.9] tracking-tight"
              style={{ fontSize: "clamp(5rem, 12vw, 11rem)" }}
            >
              <span className="inline-flex items-baseline gap-4">
                {lang === "en" ? s.heroSubtitleEn : s.heroTitleAr}
                <span
                  aria-hidden
                  className="inline-block w-2.5 h-2.5 rounded-full bg-primary translate-y-[-0.55em]"
                />
              </span>
            </motion.h1>

            {/* 3. English subtitle — Playfair, wide tracking, muted */}
            <motion.div
              {...fade(0.3)}
              className="font-display text-muted-foreground uppercase"
              style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.15rem)", letterSpacing: "0.45em" }}
            >
              {lang === "en" ? s.heroTitleAr : s.heroSubtitleEn}
            </motion.div>

            {/* 4. Description — body-lg, muted, max-w-xl */}
            <motion.p
              {...fade(0.4)}
              className="body-lg max-w-xl"
            >
              {s.heroDescAr}
            </motion.p>

            {/* 5. CTA row — solid gold + outline neutral */}
            <motion.div
              {...fade(0.5)}
              className="flex flex-wrap items-center gap-3"
            >
              <button
                onClick={() => scrollTo("portfolio")}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-pale transition-colors duration-300 motion-ease rounded-md"
              >
                {t(s.heroCta1Ar, "Explore Work")}
                <ArrowDown className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5 motion-ease" />
              </button>
              <button
                onClick={() => scrollTo("about")}
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-medium hover:border-border-strong hover:text-primary transition-colors duration-300 motion-ease rounded-md"
              >
                {t(s.heroCta2Ar, "Maryam's Story")}
              </button>
            </motion.div>

            {/* 6. Stats row — inline, NOT cards, separated by thin gold dividers */}
            <motion.div
              {...fade(0.6)}
              className="flex items-center gap-6 pt-2"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-6">
                  {i > 0 && (
                    <span aria-hidden className="w-px h-10 bg-primary/25" />
                  )}
                  <div className="flex flex-col gap-1">
                    <span className="font-display text-2xl text-primary leading-none">
                      {stat.num}
                    </span>
                    <span className="text-xs text-muted-foreground tracking-wide">
                      {stat.label}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* === RIGHT: portrait column (40%) === */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: EASE }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="relative aspect-[3/4] w-full border border-border-strong/40 overflow-hidden bg-card">
              {s.heroImageData ? (
                <img
                  src={s.heroImageData}
                  alt={t("مريم — مصورة فوتوغرافية", "Maryam — Photographer")}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <ApertureDiagram />
                </div>
              )}
            </div>

            {/* Floating "EST · 2018" vertical label on the side */}
            <span
              aria-hidden
              className="vertical-text font-inter text-[10px] tracking-[0.5em] text-muted-foreground uppercase absolute -end-6 top-1/2 -translate-y-1/2 hidden sm:block"
            >
              EST · 2018
            </span>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator — thin line + downward dot, "SCROLL" eyebrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20"
        dir="ltr"
      >
        <span className="eyebrow text-[0.6rem]">Scroll</span>
        <div className="relative w-px h-12 bg-border overflow-hidden">
          <motion.span
            animate={{ y: [0, 44], opacity: [0, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: EASE }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
}
