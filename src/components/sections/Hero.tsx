"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Play } from "lucide-react";
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

const EASE = [0.25, 0.46, 0.45, 0.94] as const;

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
        <div className="w-6 h-6 border border-border border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Stats from settings (only render if at least one has a value)
  const stats = [
    { num: s.heroStat1Num, label: s.heroStat1Label },
    { num: s.heroStat2Num, label: s.heroStat2Label },
    { num: s.heroStat3Num, label: s.heroStat3Label },
  ].filter((x) => x.num || x.label);
  const hasStats = stats.length > 0;

  return (
    <section id="home" className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background image with gradient overlays */}
      {s.heroImageData ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.heroImageData}
            alt="مريم"
            decoding="async"
            className="w-full h-full object-cover scale-110 ken-burns"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-secondary" />
      )}

      {/* Overlays for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />

      {/* Ambient light */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px] pointer-events-none animate-slow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none animate-slow-pulse" style={{ animationDelay: "2s" }} />

      {/* Content — centered */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
        {/* Eyebrow with lines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: EASE }}
          className="flex items-center gap-4 mb-6"
        >
          <span className="w-10 h-px bg-primary/60" />
          <span className="font-inter text-[11px] md:text-[13px] tracking-[0.35em] uppercase text-primary/90 font-light">
            {s.taglineEn}
          </span>
          <span className="w-10 h-px bg-primary/60" />
        </motion.div>

        {/* Massive name */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1, ease: EASE }}
          className="font-amiri text-[clamp(4rem,14vw,12rem)] font-bold leading-[0.88] text-white mb-4"
        >
          {s.heroTitleAr}
        </motion.h1>

        {/* Tagline — italic display */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4, ease: EASE }}
          className="font-display text-xl md:text-2xl lg:text-3xl font-light italic text-white/70 mb-6 tracking-wide"
        >
          {s.heroSubtitleEn}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7, ease: EASE }}
          className="max-w-lg text-sm md:text-base leading-relaxed text-white/70 font-light mb-10"
        >
          {s.heroDescAr}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2, ease: EASE }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => scrollTo("portfolio")}
            className="btn-luxury group px-8 py-3.5 bg-primary/90 text-primary-foreground text-[12px] tracking-[0.2em] uppercase font-medium rounded-full hover:bg-primary hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 hover:shadow-lg hover:shadow-primary/20"
          >
            {s.heroCta1Ar}
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="btn-luxury group px-8 py-3.5 border border-white/20 text-white/80 text-[12px] tracking-[0.2em] uppercase font-light rounded-full hover:border-white/40 hover:text-white hover:scale-[1.02] active:scale-[0.99] transition-all duration-500 flex items-center justify-center gap-2"
          >
            <Play size={12} className="fill-current" strokeWidth={0} />
            {s.heroCta2Ar}
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1, ease: EASE }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-inter text-[10px] tracking-[0.3em] uppercase text-white/50">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={16} className="text-white/50" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Hero stats — pulled from settings (heroStat1-3) */}
      {hasStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.3, duration: 1, ease: EASE }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6"
        >
          <div className="flex items-center justify-center gap-8 md:gap-14">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="text-center flex items-center gap-8 md:gap-14"
              >
                {i > 0 && (
                  <span className="w-px h-8 bg-white/15 hidden sm:block" />
                )}
                <div>
                  <div
                    className="font-display text-2xl md:text-3xl text-white leading-none"
                    dir="ltr"
                  >
                    {stat.num}
                  </div>
                  <div className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/75 mt-1.5">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Side decorative — Est. year */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: EASE }}
        className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <span className="w-px h-16 bg-white/10" />
        <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/40 [writing-mode:vertical-rl] rotate-180">
          Est. 2018
        </span>
        <span className="w-px h-16 bg-white/10" />
      </motion.div>
    </section>
  );
}
