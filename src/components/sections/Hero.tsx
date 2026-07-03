"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  taglineEn: string;
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
  heroImageData: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  const stats = [
    { num: s.heroStat1Num, label: s.heroStat1Label },
    { num: s.heroStat2Num, label: s.heroStat2Label },
    { num: s.heroStat3Num, label: s.heroStat3Label },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center bg-background overflow-hidden pt-16"
    >
      {/* Subtle ambient gradient — barely visible, warm */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[50vw] h-[50vw] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 py-20 md:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* ===== Text column ===== */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="w-8 h-px bg-primary/60" />
              <span className="eyebrow">{s.taglineEn}</span>
            </motion.div>

            {/* Arabic name — massive */}
            <motion.h1
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: EASE }}
              className="font-amiri font-bold leading-[0.92] mb-6"
              style={{ fontSize: "clamp(4.5rem, 13vw, 11rem)" }}
            >
              <span className="text-foreground">{s.heroTitleAr}</span>
            </motion.h1>

            {/* English subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: EASE }}
              className="font-display tracking-[0.25em] text-muted-foreground uppercase mb-8"
              style={{ fontSize: "clamp(1rem, 2vw, 1.5rem)" }}
            >
              {s.heroSubtitleEn}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55, ease: EASE }}
              className="body-lg max-w-xl mb-10"
            >
              {s.heroDescAr}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: EASE }}
              className="flex flex-wrap items-center gap-3 mb-14"
            >
              <button
                onClick={() => scrollTo("portfolio")}
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground text-sm font-medium tracking-wide hover:opacity-90 transition-all duration-300 motion-ease"
              >
                {s.heroCta1Ar}
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scrollTo("about")}
                className="inline-flex items-center px-7 py-3.5 border border-border text-foreground text-sm font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300 motion-ease"
              >
                {s.heroCta2Ar}
              </button>
            </motion.div>

            {/* Stats — inline, separated by hairlines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85, ease: EASE }}
              className="flex items-center gap-6 sm:gap-10"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10">
                  {i > 0 && <span className="w-px h-10 bg-border" />}
                  <div>
                    <div className="font-display text-2xl sm:text-3xl text-primary font-medium mb-1" dir="ltr">
                      {stat.num}
                    </div>
                    <div className="text-[11px] text-muted-foreground tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ===== Visual column ===== */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative aspect-[3/4] max-w-sm mx-auto">
              {/* Gold frame offset */}
              <div className="absolute -inset-2 border border-primary/20 pointer-events-none" />

              {/* Image container */}
              <div className="relative w-full h-full overflow-hidden bg-card">
                {s.heroImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.heroImageData}
                    alt="مريم"
                    className="w-full h-full object-cover ken-burns"
                  />
                ) : (
                  <ApertureSvg />
                )}

                {/* Subtle bottom gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Side label */}
              <div className="hidden md:flex absolute -left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-3">
                <span className="vertical-text font-inter text-[9px] tracking-[0.4em] text-muted-foreground uppercase">
                  Est · 2018
                </span>
                <span className="w-px h-12 bg-border" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-inter text-[9px] tracking-[0.3em] text-muted-foreground uppercase">
          Scroll
        </span>
        <div className="w-px h-10 bg-gradient-to-b from-border to-transparent relative overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-4 bg-primary/60"
          />
        </div>
      </motion.div>
    </section>
  );
}

/* Aperture SVG — refined, technical, NOT a silhouette */
function ApertureSvg() {
  return (
    <svg
      viewBox="0 0 300 400"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="heroBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="oklch(20% 0.005 285)" />
          <stop offset="100%" stopColor="oklch(11% 0.004 285)" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#heroBg)" />

      {/* Concentric rings */}
      <circle cx="150" cy="180" r="110" fill="none" stroke="oklch(80% 0.13 82)" strokeWidth="0.6" opacity="0.5" />
      <circle cx="150" cy="180" r="80" fill="none" stroke="oklch(80% 0.13 82)" strokeWidth="0.4" opacity="0.35" />
      <circle cx="150" cy="180" r="50" fill="none" stroke="oklch(80% 0.13 82)" strokeWidth="0.4" opacity="0.25" />

      {/* Aperture blades (6-blade) */}
      <g stroke="oklch(80% 0.13 82)" strokeWidth="0.8" fill="none" opacity="0.7">
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x1 = 150 + Math.cos(angle) * 35;
          const y1 = 180 + Math.sin(angle) * 35;
          const x2 = 150 + Math.cos(angle + 0.7) * 95;
          const y2 = 180 + Math.sin(angle + 0.7) * 95;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* Tick marks around outer ring */}
      <g stroke="oklch(80% 0.13 82)" strokeWidth="0.5" opacity="0.4">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const isMajor = i % 9 === 0;
          const r1 = 110;
          const r2 = isMajor ? 120 : 115;
          const x1 = 150 + Math.cos(angle) * r1;
          const y1 = 180 + Math.sin(angle) * r1;
          const x2 = 150 + Math.cos(angle) * r2;
          const y2 = 180 + Math.sin(angle) * r2;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* Center dot */}
      <circle cx="150" cy="180" r="2" fill="oklch(80% 0.13 82)" opacity="0.8" />

      {/* Caption */}
      <text
        x="150"
        y="350"
        textAnchor="middle"
        fill="oklch(64% 0.004 90)"
        fontSize="9"
        letterSpacing="3"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        ƒ/1.4 · 50mm
      </text>
    </svg>
  );
}
