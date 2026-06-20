"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Aperture, Star } from "lucide-react";

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
};

export function Hero() {
  const [s, setS] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background film-grain"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 z-0">
        {/* Deep base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.05_0.005_285)] via-[oklch(0.1_0.008_285)] to-[oklch(0.04_0.005_285)]" />

        {/* Gold glow top-right */}
        <div className="absolute top-1/4 -right-1/4 w-[80vw] h-[80vw] rounded-full bg-[oklch(0.78_0.13_75_/_0.08)] blur-[150px]" />
        {/* Warm glow bottom-left */}
        <div className="absolute -bottom-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-[oklch(0.55_0.1_40_/_0.06)] blur-[120px]" />

        {/* Aperture-like radial */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, transparent 30%, oklch(0.05 0 0 / 0.6) 80%)",
          }}
        />
      </div>

      {/* Vertical side labels */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-3"
      >
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
        <span className="vertical-text text-[10px] tracking-[0.5em] text-muted-foreground uppercase font-inter">
          EST · 2018
        </span>
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex flex-col items-center gap-3"
      >
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
        <span className="vertical-text text-[10px] tracking-[0.5em] text-muted-foreground uppercase font-inter">
          Sana'a · Yemen
        </span>
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto max-w-6xl px-6 text-center">
        {/* Top tag */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 border border-primary/30 rounded-full backdrop-blur-sm bg-background/30">
            <Aperture className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] tracking-[0.3em] text-muted-foreground uppercase font-inter">
              {s.taglineEn}
            </span>
            <Aperture className="w-3.5 h-3.5 text-primary" />
          </div>
        </motion.div>

        {/* Arabic name */}
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-amiri text-7xl md:text-9xl lg:text-[12rem] font-bold leading-none mb-4"
        >
          <span className="text-gold-gradient">{s.heroTitleAr}</span>
        </motion.h1>

        {/* English subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-display text-2xl md:text-4xl tracking-[0.3em] text-foreground/80 uppercase mb-8"
        >
          {s.heroSubtitleEn}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10"
        >
          {s.heroDescAr}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={() => {
              const el = document.getElementById("portfolio");
              if (el)
                window.scrollTo({
                  top: el.getBoundingClientRect().top + window.scrollY - 60,
                  behavior: "smooth",
                });
            }}
            className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium tracking-wide overflow-hidden transition-all duration-500 hover:scale-105"
          >
            <span className="relative z-10 flex items-center gap-2">
              {s.heroCta1Ar}
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("about");
              if (el)
                window.scrollTo({
                  top: el.getBoundingClientRect().top + window.scrollY - 60,
                  behavior: "smooth",
                });
            }}
            className="px-8 py-4 border border-border text-foreground rounded-full font-medium tracking-wide hover:border-primary hover:text-primary transition-all duration-300"
          >
            {s.heroCta2Ar}
          </button>
        </motion.div>

        {/* Mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="flex items-center justify-center gap-8 md:gap-16"
        >
          {[
            { num: s.heroStat1Num, labelAr: s.heroStat1Label },
            { num: s.heroStat2Num, labelAr: s.heroStat2Label },
            { num: s.heroStat3Num, labelAr: s.heroStat3Label },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="font-display text-2xl md:text-4xl text-gold-gradient font-bold">
                {stat.num}
              </span>
              <span className="text-[11px] md:text-xs text-muted-foreground tracking-wider mt-1">
                {stat.labelAr}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.4em] text-muted-foreground uppercase font-inter">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-primary/60 to-transparent overflow-hidden">
          <motion.div
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-6 bg-primary"
          />
        </div>
      </motion.div>

      {/* Star ratings top corner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute top-28 right-6 md:right-10 z-20 hidden md:flex items-center gap-2"
      >
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="w-3 h-3 fill-primary text-primary"
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-inter">
          5.0 · 200+ reviews
        </span>
      </motion.div>
    </section>
  );
}
