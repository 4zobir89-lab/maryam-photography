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

  return (
    <section id="home" className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background image with gradient overlays */}
      {s.heroImageData ? (
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.heroImageData}
            alt="مريم"
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
          className="max-w-lg text-sm md:text-base leading-relaxed text-white/50 font-light mb-10"
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
            className="btn-luxury group px-8 py-3.5 bg-primary/90 text-primary-foreground text-[12px] tracking-[0.2em] uppercase font-medium rounded-full hover:bg-primary transition-all duration-500 hover:shadow-lg hover:shadow-primary/20"
          >
            {s.heroCta1Ar}
          </button>
          <button
            onClick={() => scrollTo("contact")}
            className="btn-luxury group px-8 py-3.5 border border-white/20 text-white/80 text-[12px] tracking-[0.2em] uppercase font-light rounded-full hover:border-white/40 hover:text-white transition-all duration-500 flex items-center justify-center gap-2"
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
        <span className="font-inter text-[10px] tracking-[0.3em] uppercase text-white/30">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ArrowDown size={16} className="text-white/30" strokeWidth={1.5} />
        </motion.div>
      </motion.div>

      {/* Side decorative — Est. year */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1, ease: EASE }}
        className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4"
      >
        <span className="w-px h-16 bg-white/10" />
        <span className="font-inter text-[10px] tracking-[0.2em] uppercase text-white/20 [writing-mode:vertical-rl] rotate-180">
          Est. 2018
        </span>
        <span className="w-px h-16 bg-white/10" />
      </motion.div>
    </section>
  );
}
