"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { useLang } from "@/components/shared/LanguageProvider";

type Settings = {
  taglineEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroDescAr: string;
  heroCta1Ar: string;
  heroCta2Ar: string;
  heroImageData: string;
  heroStat1Num: string;
  heroStat1Label: string;
  heroStat2Num: string;
  heroStat2Label: string;
  heroStat3Num: string;
  heroStat3Label: string;
};

const EASE = [0.22, 0.61, 0.36, 1] as const;

export function Hero() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLang();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !s) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border border-border border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const stats = [
    { num: s.heroStat1Num, label: s.heroStat1Label },
    { num: s.heroStat2Num, label: s.heroStat2Label },
    { num: s.heroStat3Num, label: s.heroStat3Label },
  ];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-background noise-overlay"
    >
      {/* Ambient background layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Warm radial glow top-right */}
        <div className="absolute top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-primary/[0.06] blur-[150px] animate-slow-pulse" />
        {/* Rose glow bottom-left */}
        <div className="absolute -bottom-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full bg-accent/[0.04] blur-[130px] animate-slow-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Text column */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            {/* Eyebrow with lines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="w-10 h-px bg-primary/60" />
              <span className="eyebrow">{s.taglineEn}</span>
            </motion.div>

            {/* Massive Arabic name */}
            <motion.h1
              initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.4, delay: 0.15, ease: EASE }}
              className="font-amiri font-bold leading-[0.9] mb-6"
              style={{ fontSize: "clamp(4.5rem, 13vw, 11rem)" }}
            >
              <span className="text-gold-gradient">{s.heroTitleAr}</span>
            </motion.h1>

            {/* English subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5, ease: EASE }}
              className="font-display tracking-[0.25em] text-muted-foreground uppercase mb-8"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.4rem)" }}
            >
              {s.heroSubtitleEn}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.65, ease: EASE }}
              className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl mb-10"
            >
              {s.heroDescAr}
            </motion.p>

            {/* CTAs — two buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8, ease: EASE }}
              className="flex flex-wrap items-center gap-4 mb-14"
            >
              <button
                onClick={() => scrollTo("portfolio")}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground text-sm font-medium tracking-wide rounded-full hover:opacity-90 transition-all duration-500 motion-ease shadow-gold"
              >
                {s.heroCta1Ar}
                <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => scrollTo("about")}
                className="group inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground text-sm font-medium tracking-wide rounded-full hover:border-primary hover:text-primary transition-all duration-500 motion-ease"
              >
                {s.heroCta2Ar}
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-300" strokeWidth={1.5} />
              </button>
            </motion.div>

            {/* Stats — inline with gold dividers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.95, ease: EASE }}
              className="flex items-center gap-8 sm:gap-12"
            >
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-8 sm:gap-12">
                  {i > 0 && <span className="w-px h-12 bg-border" />}
                  <div>
                    <div className="font-display text-3xl sm:text-4xl text-gold-gradient font-medium mb-1" dir="ltr">
                      {stat.num}
                    </div>
                    <div className="text-xs text-muted-foreground tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Visual column — large image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
            className="lg:col-span-5 order-1 lg:order-2"
          >
            <div className="relative aspect-[3/4] max-w-md mx-auto">
              {/* Gold frame offset */}
              <div className="absolute -inset-3 border border-primary/20 rounded-2xl pointer-events-none" />
              <div className="absolute -inset-1.5 border border-primary/10 rounded-2xl pointer-events-none" />

              {/* Image container */}
              <div className="relative w-full h-full overflow-hidden rounded-2xl bg-card shadow-velvet">
                {s.heroImageData ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.heroImageData}
                    alt="مريم"
                    className="w-full h-full object-cover ken-burns"
                  />
                ) : (
                  <ApertureFallback />
                )}

                {/* Soft gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none" />

                {/* Glass label card */}
                <div className="absolute bottom-5 right-5 left-5 glass rounded-xl p-4">
                  <div className="font-inter text-[9px] tracking-[0.3em] text-primary uppercase mb-1">
                    Yemeni Visual Storyteller
                  </div>
                  <div className="font-amiri text-base text-foreground">
                    مريم · Sana'a
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6, ease: EASE }}
                className="absolute -top-5 -left-5 w-20 h-20 rounded-full glass-strong flex flex-col items-center justify-center shadow-gold"
              >
                <span className="font-display text-xl text-gold-gradient font-bold leading-none">7+</span>
                <span className="font-inter text-[8px] tracking-[0.2em] text-muted-foreground uppercase mt-1">Years</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-inter text-[9px] tracking-[0.4em] text-muted-foreground uppercase">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-4 bg-primary animate-scroll-dot" />
        </div>
      </motion.div>
    </section>
  );
}

/* Aperture SVG — refined cinematic */
function ApertureFallback() {
  return (
    <svg viewBox="0 0 300 400" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="heroBg" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="oklch(20% 0.008 285)" />
          <stop offset="100%" stopColor="oklch(9% 0.005 285)" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#heroBg)" />

      {/* Concentric rings */}
      <circle cx="150" cy="180" r="110" fill="none" stroke="oklch(82% 0.13 80)" strokeWidth="0.5" opacity="0.4" />
      <circle cx="150" cy="180" r="80" fill="none" stroke="oklch(82% 0.13 80)" strokeWidth="0.4" opacity="0.3" />
      <circle cx="150" cy="180" r="50" fill="none" stroke="oklch(82% 0.13 80)" strokeWidth="0.3" opacity="0.2" />

      {/* Aperture blades */}
      <g stroke="oklch(82% 0.13 80)" strokeWidth="0.7" fill="none" opacity="0.6">
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x1 = 150 + Math.cos(angle) * 30;
          const y1 = 180 + Math.sin(angle) * 30;
          const x2 = 150 + Math.cos(angle + 0.7) * 95;
          const y2 = 180 + Math.sin(angle + 0.7) * 95;
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>

      {/* Tick marks */}
      <g stroke="oklch(82% 0.13 80)" strokeWidth="0.4" opacity="0.3">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const isMajor = i % 9 === 0;
          const r1 = 110;
          const r2 = isMajor ? 122 : 116;
          return (
            <line
              key={i}
              x1={150 + Math.cos(angle) * r1}
              y1={180 + Math.sin(angle) * r1}
              x2={150 + Math.cos(angle) * r2}
              y2={180 + Math.sin(angle) * r2}
            />
          );
        })}
      </g>

      <circle cx="150" cy="180" r="2" fill="oklch(82% 0.13 80)" opacity="0.8" />

      <text x="150" y="355" textAnchor="middle" fill="oklch(62% 0.008 85)" fontSize="9" letterSpacing="3" style={{ fontFamily: "var(--font-inter)" }}>
        ƒ/1.4 · 50mm
      </text>
    </svg>
  );
}
